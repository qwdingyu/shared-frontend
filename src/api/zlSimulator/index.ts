import { http } from "@/api/http";
import { normalizeList, type ListLikeResponse } from "@/api/response";
import type { RequestOptions } from "@/utils/request";

/**
 * ZL.Simulator 可配置协议仿真器 API 模块
 *
 * 对应后端 API:
 * - POST /ZLSimulator/instances          - 创建仿真实例
 * - GET  /ZLSimulator/instances          - 获取实例列表
 * - GET  /ZLSimulator/instances/{id}     - 获取实例详情
 * - GET  /ZLSimulator/instances/{id}/instruments - 获取仪器列表
 * - POST /ZLSimulator/instances/{id}/stop - 停止实例
 * - DELETE /ZLSimulator/instances/{id}   - 销毁实例
 * - POST /ZLSimulator/instances/{id}/command - 发送测试命令
 * - GET  /ZLSimulator/instances/{id}/state - 获取状态变量
 * - POST /ZLSimulator/instances/{id}/state - 设置状态变量
 * - GET  /ZLSimulator/templates/{id}     - 获取可用协议模板
 * - GET  /ZLSimulator/health             - 健康检查
 */

// ============ 常量定义 ============

/** 传输类型选项 */
export const TRANSPORT_OPTIONS = [
  { label: "TCP Server", value: "TcpServer" },
  { label: "UDP Server", value: "UdpServer" },
] as const;

/** 实例状态文本 */
export const INSTANCE_STATUS: Record<string, string> = {
  Starting: "启动中",
  Running: "运行中",
  Stopped: "已停止",
  Crashed: "异常崩溃",
};

// ============ 类型定义 ============

/** 实例状态 */
export type ZlInstanceStatus = "Starting" | "Running" | "Stopped" | "Crashed";

/** 传输类型 */
export type TransportType = "TcpServer" | "UdpServer";

/** 仪器信息 */
export interface ZlInstrumentInfo {
  name: string;
  transportType: TransportType;
  port: number;
  running: boolean;
  errorMessage?: string | null;
  stateVariables?: Record<string, string>;
}

/** ZL.Simulator 仿真实例 */
export interface ZlSimulationInstance {
  instanceId: string;
  userId: number;
  userType: string;
  grpcPort: number;
  processId: number;
  instruments: ZlInstrumentInfo[];
  instrumentCount?: number; // 列表接口简化返回
  status: ZlInstanceStatus;
  connectionString?: string;
  createdAt: string;
}

/** 创建仿真实例请求 */
export interface CreateZlSimRequest {
  userId: number;
  userType: string;
  instruments: ZlInstrumentDefinitionRequest[];
}

/** 仪器定义（创建请求中的单项） */
export interface ZlInstrumentDefinitionRequest {
  name: string;
  protocolConfigJson: string;
  transportType: TransportType;
  port: number; // 0 = 自动分配
  frameTimeoutMs: number;
}

/** 发送命令请求 */
export interface SendCommandRequest {
  instrumentName: string;
  command: string;
  timeoutMs?: number;
}

/** 命令响应 */
export interface CommandResponse {
  success: boolean;
  response?: string;
  error?: string;
}

/** 设置状态变量请求 */
export interface SetStateRequest {
  instrumentName: string;
  key: string;
  value: string;
}

/** 协议模板信息 */
export interface ProtocolTemplate {
  name: string;
  description: string;
  configJson: string;
}

// ============ 标签仿真类型 ============

/** 标签值信息 */
export interface ZlTagValue {
  tagName: string;
  formattedValue: string;
  rawValue: number;
}

/** 设置标签值请求 */
export interface SetTagValueRequest {
  instrumentName: string;
  tagName: string;
  value: number;
}

/** 启动标签仿真请求 */
export interface StartTagSimulationRequest {
  instrumentName: string;
  simulationTagsJson?: string;
}

// ============ API 方法 ============

/**
 * 创建仿真实例
 */
export function createZlInstance(
  request: CreateZlSimRequest,
  options?: RequestOptions,
) {
  return http.post("/ZLSimulator/instances", request, options);
}

/**
 * 获取实例列表
 */
export function getZlInstanceList(userId?: number, options?: RequestOptions) {
  return http
    .get<ListLikeResponse<ZlSimulationInstance>>(
      "/ZLSimulator/instances",
      userId ? { userId } : null,
      options,
    )
    .then(normalizeList);
}

/**
 * 获取实例详情
 */
export function getZlInstance(instanceId: string, options?: RequestOptions) {
  return http.get<ZlSimulationInstance>(
    `/ZLSimulator/instances/${instanceId}`,
    null,
    options,
  );
}

/**
 * 获取仪器列表
 */
export function getZlInstruments(instanceId: string, options?: RequestOptions) {
  return http.get<ZlInstrumentInfo[]>(
    `/ZLSimulator/instances/${instanceId}/instruments`,
    null,
    options,
  );
}

/**
 * 停止实例
 */
export function stopZlInstance(
  instanceId: string,
  options?: RequestOptions,
) {
  return http.post(`/ZLSimulator/instances/${instanceId}/stop`, {}, options);
}

/**
 * 销毁实例
 */
export function destroyZlInstance(
  instanceId: string,
  options?: RequestOptions,
) {
  return http.delete(`/ZLSimulator/instances/${instanceId}`, { instanceId }, options);
}

/**
 * 发送测试命令
 */
export function sendZlCommand(
  instanceId: string,
  request: SendCommandRequest,
  options?: RequestOptions,
) {
  return http.post<CommandResponse>(
    `/ZLSimulator/instances/${instanceId}/command`,
    request,
    options,
  );
}

/**
 * 获取状态变量
 */
export function getZlState(
  instanceId: string,
  instrumentName: string,
  key?: string,
  options?: RequestOptions,
) {
  return http.get<Record<string, string>>(
    `/ZLSimulator/instances/${instanceId}/state`,
    { instrumentName, key },
    options,
  );
}

/**
 * 设置状态变量
 */
export function setZlState(
  instanceId: string,
  request: SetStateRequest,
  options?: RequestOptions,
) {
  return http.post(`/ZLSimulator/instances/${instanceId}/state`, request, options);
}

/**
 * 获取可用协议模板
 */
export function getZlTemplates(instanceId: string, options?: RequestOptions) {
  return http.get<ProtocolTemplate[]>(
    `/ZLSimulator/templates/${instanceId}`,
    null,
    options,
  );
}

/**
 * 健康检查
 */
export function zlHealthCheck(options?: RequestOptions) {
  return http.get("/ZLSimulator/health", null, options);
}

// ============ 标签仿真 API ============

/**
 * 获取标签列表
 */
export function getZlTagList(
  instanceId: string,
  instrumentName: string,
  options?: RequestOptions,
) {
  return http.get<string[]>(
    `/ZLSimulator/instances/${instanceId}/tags`,
    { instrumentName },
    options,
  );
}

/**
 * 获取标签值
 */
export function getZlTagValue(
  instanceId: string,
  instrumentName: string,
  tagName: string,
  options?: RequestOptions,
) {
  return http.get<ZlTagValue>(
    `/ZLSimulator/instances/${instanceId}/tags/${tagName}/value`,
    { instrumentName },
    options,
  );
}

/**
 * 设置标签值
 */
export function setZlTagValue(
  instanceId: string,
  request: SetTagValueRequest,
  options?: RequestOptions,
) {
  return http.post(
    `/ZLSimulator/instances/${instanceId}/tags/value`,
    request,
    options,
  );
}

/**
 * 启动标签仿真
 */
export function startZlTagSimulation(
  instanceId: string,
  request: StartTagSimulationRequest,
  options?: RequestOptions,
) {
  return http.post(
    `/ZLSimulator/instances/${instanceId}/tags/simulate/start`,
    request,
    options,
  );
}

/**
 * 停止标签仿真
 */
export function stopZlTagSimulation(
  instanceId: string,
  instrumentName: string,
  options?: RequestOptions,
) {
  return http.post(
    `/ZLSimulator/instances/${instanceId}/tags/simulate/stop`,
    {},
    { params: { instrumentName }, ...options },
  );
}

// 兼容 preserveModules 目录导入：确保该模块作为目录时有 index.js 落盘
export const __zlSimulatorIndexMarker = true
