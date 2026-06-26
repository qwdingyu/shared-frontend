import { shallowRef, ref } from "vue";
import {
  type HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";
import Storage from "@/utils/Storage";
import { ACCESS_TOKEN_KEY } from "@/enums/cacheEnum";

/**
 * SignalR 连接管理器（单例模式）
 * 所有组件共享同一个 SignalR 连接实例，避免重复创建连接
 * 使用引用计数管理连接生命周期：当没有组件使用时自动断开连接
 */
class SignalRConnectionManager {
  private static instance: SignalRConnectionManager;
  
  private connection = shallowRef<HubConnection | null>(null);
  private isConnected = ref(false);
  private isReconnecting = ref(false);
  private connectionId = ref<string | null>(null);
  private reconnectAttempts = ref(0);
  
  // 引用计数：跟踪有多少个组件正在使用连接
  private referenceCount = 0;
  
  // 订阅状态追踪（用于重连后自动恢复订阅）
  private subscribedDevices = new Set<string>();
  private subscribedExeDevices = new Set<string>();
  private isSubscribedAll = false;
  
  // SPA 路由切换保护：防止并发连接/断开
  private connecting = false;
  private disconnecting = false;
  
  // 心跳检测
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private lastHeartbeatTime = 0;
  private readonly HEARTBEAT_INTERVAL = 15000; // 15秒发送一次心跳
  private readonly HEARTBEAT_TIMEOUT = 5000; // 5秒超时
  
  // 重连策略配置
  private readonly MAX_RECONNECT_ATTEMPTS = 10; // 最大重连次数
  private readonly MAX_RECONNECT_TIME = 300000; // 最大重连时间（5分钟）
  private reconnectStartTime = 0;
  
  // 手动重连支持
  private manualReconnectEnabled = true;

  private constructor() {
    // 私有构造函数，确保单例
  }

  public static getInstance(): SignalRConnectionManager {
    if (!SignalRConnectionManager.instance) {
      SignalRConnectionManager.instance = new SignalRConnectionManager();
    }
    return SignalRConnectionManager.instance;
  }

  /**
   * 获取 SignalR Hub URL
   */
  private getHubUrl(): string {
    const baseApiUrl =
      import.meta.env.VITE_BASE_API_URL || import.meta.env.VITE_API_URL || "";
    const baseUrl = baseApiUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");
    if (!baseUrl) return "/hubs/plc";
    return `${baseUrl}/hubs/plc`;
  }

  /**
   * 重连后恢复订阅状态
   */
  private async restoreSubscriptions(): Promise<void> {
    if (!this.connection.value) return;

    try {
      if (this.isSubscribedAll) {
        await this.connection.value.invoke("SubscribeAll");
        console.log("[SignalRManager] Restored: SubscribeAll");
      } else if (this.subscribedDevices.size > 0) {
        for (const deviceId of this.subscribedDevices) {
          await this.connection.value.invoke("SubscribeDevice", deviceId);
        }
        console.log(
          `[SignalRManager] Restored: ${this.subscribedDevices.size} device subscriptions`,
        );
      }
      if (this.subscribedExeDevices.size > 0) {
        for (const deviceId of this.subscribedExeDevices) {
          await this.connection.value.invoke("SubscribeExeExecution", deviceId);
        }
        console.log(
          `[SignalRManager] Restored: ${this.subscribedExeDevices.size} exe-execution subscriptions`,
        );
      }
    } catch (err) {
      console.error("[SignalRManager] Failed to restore subscriptions:", err);
    }
  }

  /**
   * 增加引用计数并连接（如果尚未连接）
   */
  public async acquire(): Promise<void> {
    this.referenceCount++;
    console.log(`[SignalRManager] Acquire connection, refCount: ${this.referenceCount}`);
    
    if (this.referenceCount === 1) {
      // 第一个使用者，创建连接
      await this.connect();
    }
  }

  /**
   * 减少引用计数并断开连接（如果没有使用者）
   */
  public async release(): Promise<void> {
    this.referenceCount = Math.max(0, this.referenceCount - 1);
    console.log(`[SignalRManager] Release connection, refCount: ${this.referenceCount}`);
    
    if (this.referenceCount === 0) {
      // 没有使用者了，断开连接
      await this.disconnect();
    }
  }

  /**
   * 创建并启动 SignalR 连接
   */
  private async connect(): Promise<void> {
    const cur = this.connection.value;
    if (cur?.state === "Connected") return;

    // 如果正在断开中，等待断开完成
    if (cur?.state === "Disconnecting" || this.disconnecting) {
      await new Promise<void>((resolve) => {
        const wait = () => {
          const c = this.connection.value;
          if (!c || c.state === "Disconnected") resolve();
          else setTimeout(wait, 50);
        };
        wait();
      });
    }

    // 防止并发 connect() 调用
    if (this.connecting) return;
    this.connecting = true;

    // 获取 token 用于 SignalR 认证
    const token = Storage.get(ACCESS_TOKEN_KEY, null);

    const conn = new HubConnectionBuilder()
      .withUrl(this.getHubUrl(), {
        accessTokenFactory: () => token || "",
      })
      .configureLogging(LogLevel.Warning)
      // 优化重连策略：指数退避 + 抖动
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // 检查是否超过最大重连次数或时间
          if (retryContext.previousRetryCount >= this.MAX_RECONNECT_ATTEMPTS) {
            console.warn(`[SignalRManager] Max reconnect attempts (${this.MAX_RECONNECT_ATTEMPTS}) reached, stopping reconnect`);
            return null; // 停止重连
          }
          
          const elapsed = Date.now() - this.reconnectStartTime;
          if (elapsed >= this.MAX_RECONNECT_TIME) {
            console.warn(`[SignalRManager] Max reconnect time (${this.MAX_RECONNECT_TIME}ms) exceeded, stopping reconnect`);
            return null; // 停止重连
          }
          
          // 指数退避：1s, 2s, 4s, 8s, 16s, 32s, 最大 30s
          const baseDelay = Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000);
          // 添加随机抖动（±20%）避免雷群效应
          const jitter = baseDelay * 0.2 * (Math.random() * 2 - 1);
          const delay = Math.max(0, baseDelay + jitter);
          
          console.log(`[SignalRManager] Retry ${retryContext.previousRetryCount + 1}, delay: ${Math.round(delay)}ms`);
          return delay;
        },
      })
      .build();

    conn.onreconnecting((error) => {
      this.isConnected.value = false;
      this.isReconnecting.value = true;
      this.reconnectAttempts.value++;
      if (this.reconnectAttempts.value === 1) {
        this.reconnectStartTime = Date.now();
      }
      console.warn("[SignalRManager] Reconnecting...", error);
    });

    conn.onreconnected(async (id) => {
      this.isConnected.value = true;
      this.isReconnecting.value = false;
      this.connectionId.value = id ?? null;
      this.reconnectAttempts.value = 0;
      console.log("[SignalRManager] Reconnected:", id);

      // 重连后恢复订阅
      await this.restoreSubscriptions();
      
      // 重启心跳检测
      this.startHeartbeat();
    });

    conn.onclose((error) => {
      this.isConnected.value = false;
      this.isReconnecting.value = false;
      this.connectionId.value = null;
      this.stopHeartbeat();
      console.warn("[SignalRManager] Connection closed:", error);
    });

    try {
      await conn.start();
      this.connection.value = conn;
      this.isConnected.value = true;
      this.connectionId.value = conn.connectionId ?? null;
      console.log("[SignalRManager] Connected:", conn.connectionId);
      
      // 启动心跳检测
      this.startHeartbeat();
    } catch (err) {
      console.error("[SignalRManager] Connect failed:", err);
      this.isConnected.value = false;
      throw err;
    } finally {
      this.connecting = false;
    }
  }

  /**
   * 断开 SignalR 连接
   */
  private async disconnect(): Promise<void> {
    // 捕获当前连接引用，防止 race condition
    const conn = this.connection.value;
    if (!conn) return;

    this.disconnecting = true;
    
    // 停止心跳检测
    this.stopHeartbeat();

    // 先把 connection.value 置空，防止其他地方拿到旧引用
    this.connection.value = null;
    this.isConnected.value = false;
    this.connectionId.value = null;

    try {
      await conn.stop();
      console.log("[SignalRManager] Disconnected");
    } catch (err) {
      console.error("[SignalRManager] Disconnect error:", err);
    } finally {
      this.disconnecting = false;
    }
  }

  /**
   * 启动心跳检测
   * 定期向服务器发送 ping，检测连接是否存活
   */
  private startHeartbeat(): void {
    this.stopHeartbeat(); // 先停止已有的心跳检测
    
    this.heartbeatTimer = setInterval(async () => {
      const conn = this.connection.value;
      if (!conn || conn.state !== "Connected") {
        this.stopHeartbeat();
        return;
      }
      
      try {
        this.lastHeartbeatTime = Date.now();
        // 调用服务器端的 Ping 方法（如果存在）或发送空消息
        // 如果服务器没有实现 Ping 方法，这里会静默失败
        await Promise.race([
          conn.invoke("Ping").catch(() => {}), // 静默失败
          new Promise((_, reject) => setTimeout(() => reject(new Error("Heartbeat timeout")), this.HEARTBEAT_TIMEOUT)),
        ]);
        
        console.debug("[SignalRManager] Heartbeat OK");
      } catch (err) {
        console.warn("[SignalRManager] Heartbeat failed, connection may be dead:", err);
        // 心跳失败，触发重连
        this.handleHeartbeatFailure();
      }
    }, this.HEARTBEAT_INTERVAL);
  }
  
  /**
   * 停止心跳检测
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
  
  /**
   * 处理心跳失败
   * 如果连接看起来已经断开但 SignalR 没有自动检测到，手动触发重连
   */
  private async handleHeartbeatFailure(): Promise<void> {
    const conn = this.connection.value;
    if (!conn) return;
    
    // 如果已经在重连中，不需要额外操作
    if (this.isReconnecting.value) return;
    
    console.warn("[SignalRManager] Heartbeat failed, forcing reconnect");
    
    // 停止心跳
    this.stopHeartbeat();
    
    // 手动停止当前连接，触发 onclose 事件
    try {
      await conn.stop();
    } catch (err) {
      console.error("[SignalRManager] Error stopping connection after heartbeat failure:", err);
    }
    
    // 如果启用了手动重连且有使用者，尝试重新连接
    if (this.manualReconnectEnabled && this.referenceCount > 0) {
      this.reconnectAttempts.value = 0; // 重置重连计数
      await this.connect();
    }
  }
  
  /**
   * 手动重连
   * 当自动重连失败后，用户可以调用此方法手动触发重连
   */
  public async manualReconnect(): Promise<void> {
    if (this.referenceCount === 0) {
      console.warn("[SignalRManager] Cannot reconnect: no active references");
      return;
    }
    
    console.log("[SignalRManager] Manual reconnect requested");
    this.reconnectAttempts.value = 0; // 重置重连计数
    this.reconnectStartTime = Date.now(); // 重置重连时间
    
    // 如果当前有连接，先断开
    const conn = this.connection.value;
    if (conn) {
      try {
        await conn.stop();
      } catch (err) {
        console.error("[SignalRManager] Error stopping connection during manual reconnect:", err);
      }
    }
    
    // 重新连接
    await this.connect();
  }
  
  /**
   * 启用/禁用手动重连
   */
  public setManualReconnectEnabled(enabled: boolean): void {
    this.manualReconnectEnabled = enabled;
    console.log(`[SignalRManager] Manual reconnect ${enabled ? "enabled" : "disabled"}`);
  }

  /**
   * 获取连接状态（只读）
   */
  public getConnectionState() {
    return {
      connection: this.connection,
      isConnected: this.isConnected,
      isReconnecting: this.isReconnecting,
      connectionId: this.connectionId,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  /**
   * 注册事件监听器
   */
  public onTagValuesChanged(callback: (changes: any[]) => void) {
    if (!this.connection.value) return;
    this.connection.value.off("OnTagValuesChanged");
    this.connection.value.on("OnTagValuesChanged", callback);
  }

  public onDeviceConnectionChanged(callback: (info: any) => void) {
    if (!this.connection.value) return;
    this.connection.value.off("OnDeviceConnectionChanged");
    this.connection.value.on("OnDeviceConnectionChanged", callback);
  }

  public onDeviceStateChanged(callback: (info: any) => void) {
    if (!this.connection.value) return;
    this.connection.value.off("OnDeviceStateChanged");
    this.connection.value.on("OnDeviceStateChanged", callback);
  }

  /**
   * 监听 Exe 执行完成事件（后端 PlcHub 推送 OnExeExecutionCompleted）
   * payload: { deviceId, tagName, bizCode, success, result, error, traceId, timestamp }
   */
  public onExeExecutionCompleted(callback: (info: any) => void) {
    if (!this.connection.value) return;
    this.connection.value.off("OnExeExecutionCompleted");
    this.connection.value.on("OnExeExecutionCompleted", callback);
  }

  /**
   * 移除所有监听器
   */
  public removeAllListeners() {
    if (!this.connection.value) return;
    this.connection.value.off("OnTagValuesChanged");
    this.connection.value.off("OnDeviceConnectionChanged");
    this.connection.value.off("OnDeviceStateChanged");
    this.connection.value.off("OnExeExecutionCompleted");
  }

  /**
   * 订阅设备
   */
  public async subscribeDevice(deviceId: string): Promise<void> {
    if (!this.connection.value) {
      console.warn("[SignalRManager] Cannot subscribe: not connected");
      return;
    }
    try {
      await this.connection.value.invoke("SubscribeDevice", deviceId);
      this.subscribedDevices.add(deviceId);
      this.isSubscribedAll = false;
      console.log("[SignalRManager] Subscribed device:", deviceId);
    } catch (err) {
      console.error("[SignalRManager] SubscribeDevice failed:", err);
      throw err;
    }
  }

  /**
   * 取消订阅设备
   */
  public async unsubscribeDevice(deviceId: string): Promise<void> {
    if (!this.connection.value) return;
    try {
      await this.connection.value.invoke("UnsubscribeDevice", deviceId);
      this.subscribedDevices.delete(deviceId);
      console.log("[SignalRManager] Unsubscribed device:", deviceId);
    } catch (err) {
      console.error("[SignalRManager] UnsubscribeDevice failed:", err);
      throw err;
    }
  }

  /**
   * 订阅所有设备
   */
  public async subscribeAll(): Promise<void> {
    if (!this.connection.value) {
      console.warn("[SignalRManager] Cannot subscribe: not connected");
      return;
    }
    try {
      await this.connection.value.invoke("SubscribeAll");
      this.isSubscribedAll = true;
      this.subscribedDevices.clear();
      console.log("[SignalRManager] Subscribed all devices");
    } catch (err) {
      console.error("[SignalRManager] SubscribeAll failed:", err);
      throw err;
    }
  }

  /**
   * 取消订阅所有设备
   */
  public async unsubscribeAll(): Promise<void> {
    if (!this.connection.value) return;
    try {
      await this.connection.value.invoke("UnsubscribeAll");
      this.isSubscribedAll = false;
      this.subscribedDevices.clear();
      console.log("[SignalRManager] Unsubscribed all devices");
    } catch (err) {
      console.error("[SignalRManager] UnsubscribeAll failed:", err);
      throw err;
    }
  }

  /**
   * 订阅 Exe 执行完成事件（加入 exe:{deviceId} 组）
   */
  public async subscribeExeExecution(deviceId: string): Promise<void> {
    if (!this.connection.value) {
      console.warn("[SignalRManager] Cannot subscribe exe: not connected");
      return;
    }
    try {
      await this.connection.value.invoke("SubscribeExeExecution", deviceId);
      this.subscribedExeDevices.add(deviceId);
      console.log("[SignalRManager] Subscribed exe for device:", deviceId);
    } catch (err) {
      console.error("[SignalRManager] SubscribeExeExecution failed:", err);
      throw err;
    }
  }

  /**
   * 取消订阅 Exe 执行完成事件
   */
  public async unsubscribeExeExecution(deviceId: string): Promise<void> {
    if (!this.connection.value) return;
    try {
      await this.connection.value.invoke("UnsubscribeExeExecution", deviceId);
      this.subscribedExeDevices.delete(deviceId);
      console.log("[SignalRManager] Unsubscribed exe for device:", deviceId);
    } catch (err) {
      console.error("[SignalRManager] UnsubscribeExeExecution failed:", err);
      throw err;
    }
  }

  /**
   * 取消全部 Exe 订阅（客户端侧）
   */
  public clearExeSubscriptions() {
    this.subscribedExeDevices.clear();
  }
}

export const signalRManager = SignalRConnectionManager.getInstance();
