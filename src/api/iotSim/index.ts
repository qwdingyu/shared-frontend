import { http } from "@/api/http";
import { normalizeList, type ListLikeResponse } from "@/api/response";
import type { RequestOptions } from "@/utils/request";

/**
 * PLC 仿真器 API 模块
 *
 * 对应后端 API:
 * - GET  /IotSim/PoolStatus    - 获取端口池状态
 * - GET  /IotSim/List         - 获取所有仿真实例
 * - POST /IotSim/Create       - 创建仿真实例
 * - POST /IotSim/Destroy      - 销毁仿真实例
 * - GET  /IotSim/Status       - 获取单个实例状态
 * - GET  /IotSim/ProcessStatus - 获取用户进程状态
 * - POST /IotSim/HealthCheck  - 健康检查
 */

// ============ 常量定义 ============

/** 协议选项 */
export const PROTOCOL_OPTIONS = [
  { label: "Modbus TCP", value: "modbus" },
  { label: "Siemens S7", value: "s7" },
  { label: "三菱 MC", value: "mitsubishi_mc" },
  { label: "三菱 A1E", value: "mitsubishi_a1e" },
  { label: "欧姆龙 FINS", value: "omron_fins" },
  { label: "Allen-Bradley", value: "allen_bradley" },
  { label: "BACnet", value: "bacnet" },
  { label: "OPC UA", value: "opcua" },
] as const;

/** 实例状态文本 */
export const INSTANCE_STATUS: Record<string, string> = {
  Starting: "启动中",
  Running: "运行中",
  Stopped: "已停止",
  Crashed: "异常崩溃",
};

// ============ 类型定义 ============

/** 用户类型 */
export type UserType = "Free" | "Pro" | "Enterprise";

/** 协议类型 */
export type ProtocolType =
  | "modbus"
  | "s7"
  | "mitsubishi_mc"
  | "mitsubishi_a1e"
  | "omron_fins"
  | "allen_bradley"
  | "bacnet"
  | "opcua";

/** 实例状态 */
export type InstanceStatus = "Starting" | "Running" | "Stopped" | "Crashed";

/** 仿真实例信息 */
export interface SimulationInstance {
  instanceId: string;
  userId: number;
  userType: UserType;
  ports: Record<ProtocolType, number>;
  protocols: ProtocolType[];
  processId: number;
  processDbId?: number;
  status: InstanceStatus;
  createdAt: string;
  connectionString?: string;
  expireAt?: string;
}

/** 创建仿真实例请求 */
export interface CreateSimRequest {
  userId: number;
  protocols: ProtocolType[];
  userType: UserType;
}

/** 销毁仿真实例请求 */
export interface DestroySimRequest {
  instanceId: string;
}

/** 克隆仿真实例请求 */
export interface CloneSimRequest {
  sourceInstanceId: string;
}

/** 配置导出结果 */
export interface ExportConfigResult {
  instanceId: string;
  userId: number;
  userType: UserType;
  protocols: ProtocolType[];
  ports: Record<string, number>;
  connectionString?: string;
  exportedAt: string;
  version: string;
}

/** 配置导入请求 */
export interface ImportConfigRequest {
  config: ExportConfigResult;
}

/** 一键Demo生成请求 */
export interface GenerateDemoRequest {
  protocols?: ProtocolType[];
}

export interface BindToDeviceRequest {
  instanceId: string;
  deviceName?: string;
  protocol: ProtocolType;
  companyId?: string;
  plantId?: string;
}

export interface SwitchToRealDeviceRequest {
  /** 平台内已绑定仿真实例的设备 Id */
  deviceId: number;
  /** 真实设备地址，通常是现场 PLC 的工控内网地址 */
  realAddress: string;
  /** 真实设备端口 */
  realPort: number;
  /** 真实设备专用配置，例如 S7 Rack/Slot；为空时沿用原仿真设备配置 */
  realExtraConfig?: string;
  /** 切换后的设备名称；为空时后端会在原名称上自动替换“仿真”为“真实” */
  realDeviceName?: string;
  /** 是否保留原仿真实例，默认保留，便于现场回退和对照测试 */
  keepSimInstance?: boolean;
  /** 是否在落库前做协议级连接预检，默认 true；预检失败不会污染原设备配置 */
  validateConnection?: boolean;
}

export interface SwitchBackToSimulationRequest {
  /** 平台内设备 Id；该设备当前应已切到真实设备 */
  deviceId: number;
  /** 要切回的仿真实例 Id */
  instanceId: string;
  /** 使用实例中的哪个协议端口 */
  protocol: ProtocolType;
  /** 切回后的设备名称；为空时后端自动把“真实”替换为“仿真” */
  simDeviceName?: string;
  /** 是否在落库前做协议级连接预检，默认 true */
  validateConnection?: boolean;
}

/** 端口池状态 */
export interface PortPoolStatus {
  dynamicRange: string;
  staticRange: string;
  dynamicAvailable: number;
  staticAvailable: number;
  leasedCount: number;
  totalCapacity: number;
}

/** 用户进程状态 */
export interface UserProcessStatus {
  userId: number | string;
  hasProcess: boolean;
  processId: number;
  status: string;
  portRangeStart: number;
  portRangeEnd: number;
  allocatedPorts: Record<ProtocolType, number>;
  createTime: string;
  lastHeartbeat?: string;
}

/** 当前用户订阅配额信息 */
export interface UserSubscriptionInfo {
  userId: number;
  planType: UserType;
  status: string;
  maxDevices: number;
  maxTagsPerDevice: number;
  maxSimInstances: number;
  maxProtocolsPerInstance: number;
  expiresAt?: string | null;
}

// ============ API 方法 ============

/**
 * 获取端口池状态
 */
export function getPoolStatus(options?: RequestOptions) {
  return http.get("/IotSim/PoolStatus", null, options);
}

/**
 * 获取所有仿真实例（别名：getInstanceList）
 */
export function getInstanceList(userId?: string, options?: RequestOptions) {
  return http
    .get<ListLikeResponse<SimulationInstance>>("/IotSim/List", userId ? { userId } : null, options)
    .then(normalizeList);
}

/**
 * 创建仿真实例
 */
export function createInstance(
  request: CreateSimRequest,
  options?: RequestOptions,
) {
  return http.post("/IotSim/Create", request, options);
}

/**
 * 销毁仿真实例
 */
export function destroyInstance(
  request: DestroySimRequest,
  options?: RequestOptions,
) {
  return http.post("/IotSim/Destroy", request, options);
}

/**
 * 启动仿真实例 - 恢复 Crashed/Stopped 实例的协议端口
 */
export function startInstance(
  instanceId: string,
  options?: RequestOptions,
) {
  return http.post("/IotSim/Start", { instanceId }, options);
}

/**
 * 停止仿真实例 - 暂停 Running 实例的协议端口
 */
export function stopInstance(
  instanceId: string,
  options?: RequestOptions,
) {
  return http.post("/IotSim/Stop", { instanceId }, options);
}

/**
 * 获取单个实例状态
 * @param instanceId 实例ID
 */
export function getSimStatus(instanceId: string, options?: RequestOptions) {
  return http.get("/IotSim/Status", { instanceId }, options);
}

/**
 * 获取用户进程状态
 * @param userId 用户ID
 */
export function getProcessStatus(userId: string, options?: RequestOptions) {
  return http.get("/IotSim/ProcessStatus", { userId }, options);
}

/**
 * 健康检查（触发实例状态检查和过期清理）
 */
export function healthCheck(options?: RequestOptions) {
  return http.post("/IotSim/HealthCheck", {}, options);
}

/**
 * 克隆仿真实例 - 基于已有实例创建副本
 */
export function cloneInstance(
  request: CloneSimRequest,
  options?: RequestOptions,
) {
  return http.post("/IotSim/Clone", request, options);
}

/**
 * 导出实例配置 - 导出为 JSON 用于备份/迁移/分享
 */
export function exportConfig(
  instanceId: string,
  options?: RequestOptions,
) {
  return http.post<ExportConfigResult>("/IotSim/ExportConfig", { instanceId }, options);
}

/**
 * 导入实例配置 - 从 JSON 恢复/迁移实例
 */
export function importConfig(
  request: ImportConfigRequest,
  options?: RequestOptions,
) {
  return http.post<SimulationInstance>("/IotSim/ImportConfig", request, options);
}

/**
 * 一键生成 Demo 实例 - 新用户快速体验
 */
export function generateDemo(
  request?: GenerateDemoRequest,
  options?: RequestOptions,
) {
  return http.post("/IotSim/GenerateDemo", request ?? {}, options);
}

/**
 * 将仿真器实例绑定为设备
 */
export function bindToDevice(
  request: BindToDeviceRequest,
  options?: RequestOptions,
) {
  return http.post("/IotSim/BindToDevice", request, options);
}

/**
 * 将仿真设备切换为真实物理设备
 */
export function switchToRealDevice(
  request: SwitchToRealDeviceRequest,
  options?: RequestOptions,
) {
  return http.post("/IotSim/SwitchToRealDevice", request, options);
}

/**
 * 将真实设备切回已保留的仿真实例
 */
export function switchBackToSimulation(
  request: SwitchBackToSimulationRequest,
  options?: RequestOptions,
) {
  return http.post("/IotSim/SwitchBackToSimulation", request, options);
}

/**
 * 获取当前用户的订阅配额信息
 */
export function getUserSubscription(options?: RequestOptions) {
  return http.get<UserSubscriptionInfo>("/integration/quota/me", null, options);
}

// ============ 导出所有 API ============

const iotSimApi = {
  // 常量
  PROTOCOL_OPTIONS,
  INSTANCE_STATUS,
  // 基础 API
  getPoolStatus,
  getInstanceList,
  createInstance,
  destroyInstance,
  getSimStatus,
  getProcessStatus,
  healthCheck,
  getUserSubscription,
  // 启动/停止
  startInstance,
  stopInstance,
  // 克隆/导入导出/Demo
  cloneInstance,
  exportConfig,
  importConfig,
  generateDemo,
  bindToDevice,
  switchToRealDevice,
  switchBackToSimulation,
};

export default iotSimApi;

// 兼容 preserveModules 目录导入：确保该模块作为目录时有 index.js 落盘
export const __iotSimIndexMarker = true
