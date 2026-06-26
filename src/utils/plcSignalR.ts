import { ref } from "vue";
import { signalRManager } from "./SignalRConnectionManager";

// 本地类型定义（SignalRConnectionManager 内部使用 any，此处提供类型约束）
// 注意：这些类型由 plcSignalR.ts 导出，不应从 SignalRConnectionManager 导入
export interface TagValueChange { tagName: string; value: any; timestamp: number }
export interface DeviceConnectionChange { deviceId: string; connected: boolean; message?: string }
export interface DeviceStateChange { deviceId: string; state: string; details?: Record<string, any> }

/**
 * PLC 实时推送 SignalR 客户端 Hook（使用单例连接管理器）。
 * 所有组件共享同一个 SignalR 连接实例，避免重复创建连接。
 * 使用引用计数管理连接生命周期。
 *
 * 用法：
 * ```ts
 * const { connect, disconnect, subscribeDevice, subscribeAll } = usePlcSignalR()
 * await connect()
 * await subscribeDevice('PLC-001')
 * ```
 */
export function usePlcSignalR() {
  // 获取单例管理器的状态
  const state = signalRManager.getConnectionState();

  return {
    connection: state.connection,
    isConnected: state.isConnected,
    isReconnecting: state.isReconnecting,
    connectionId: state.connectionId,
    reconnectAttempts: state.reconnectAttempts,
    onTagValuesChanged: signalRManager.onTagValuesChanged.bind(signalRManager),
    onDeviceConnectionChanged: signalRManager.onDeviceConnectionChanged.bind(signalRManager),
    onDeviceStateChanged: signalRManager.onDeviceStateChanged.bind(signalRManager),
    onExeExecutionCompleted: signalRManager.onExeExecutionCompleted.bind(signalRManager),
    removeAllListeners: signalRManager.removeAllListeners.bind(signalRManager),
    // 使用 acquire/release 替代 connect/disconnect，实现引用计数
    connect: signalRManager.acquire.bind(signalRManager),
    disconnect: signalRManager.release.bind(signalRManager),
    subscribeDevice: signalRManager.subscribeDevice.bind(signalRManager),
    unsubscribeDevice: signalRManager.unsubscribeDevice.bind(signalRManager),
    subscribeAll: signalRManager.subscribeAll.bind(signalRManager),
    unsubscribeAll: signalRManager.unsubscribeAll.bind(signalRManager),
    subscribeExeExecution: signalRManager.subscribeExeExecution.bind(signalRManager),
    unsubscribeExeExecution: signalRManager.unsubscribeExeExecution.bind(signalRManager),
    clearExeSubscriptions: signalRManager.clearExeSubscriptions.bind(signalRManager),
    // 手动重连支持
    manualReconnect: signalRManager.manualReconnect.bind(signalRManager),
    setManualReconnectEnabled: signalRManager.setManualReconnectEnabled.bind(signalRManager),
  };
}
