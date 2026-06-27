/**
 * ProtocolGateway 网关管理 API 模块
 *
 * 对应后端 API:
 * - GET    /Gateway/outputs            - 获取所有输出插件状态
 * - GET    /Gateway/outputs/{name}     - 获取单个输出插件状态
 * - POST   /Gateway/outputs            - 注册输出插件
 * - DELETE /Gateway/outputs/{name}     - 移除输出插件
 * - PATCH  /Gateway/outputs/{name}/start - 启动输出插件
 * - PATCH  /Gateway/outputs/{name}/stop  - 停止输出插件
 * - GET    /Gateway/metrics            - 获取网关转发指标
 * - GET    /Gateway/dead-letters       - 获取死信队列
 * - DELETE /Gateway/dead-letters       - 清空死信队列
 * - POST   /Gateway/dead-letters/retry - 死信重试
 * - POST   /Gateway/circuit-breaker/{name}/reset - 重置断路器
 * - POST   /Gateway/test              - 测试发送消息
 * - POST   /Gateway/publish           - 发布消息到 Pipeline
 * - GET    /Gateway/status            - 获取网关运行状态
 */

import { http } from '@/api/http'
import type { RequestOptions } from '@/utils/request'

// ============ 类型定义 ============

/** 输出插件状态 */
export interface OutputPluginStatus {
  name: string
  protocolType: string
  isEnabled: boolean
  isRunning: boolean
  lastError?: string
  messagesProcessed: number
  messagesFailed: number
  lastActivityAt?: string
}

/** 注册输出插件请求（字段名与后端 RegisterOutputRequest 对齐） */
export interface RegisterOutputRequest {
  pluginName: string
  protocolType: string
  config: Record<string, string>
  autoStart?: boolean
}

/** 测试发送请求 */
export interface TestSendRequest {
  outputName: string
  testPayload?: string
  timeoutMs?: number
}

/** 测试发送结果 */
export interface TestSendResult {
  success: boolean
  durationMs: number
  errorMessage?: string
}

/** 发布消息请求 */
export interface PublishMessageRequest {
  topic?: string
  jsonPayload?: string
  textPayload?: string
  hexPayload?: string
  metadata?: Record<string, string>
}

/** 死信信息 */
export interface DeadLetterInfo {
  id: string
  outputName: string
  topic: string
  payload: string
  failureReason: string
  failedAt: string
  retryCount: number
}

/** 网关指标快照 */
export interface GatewayMetricsSnapshot {
  totalProcessed: number
  totalFailed: number
  totalDropped: number
  avgLatencyMs: number
  deadLetterCount: number
  outputMetrics: Record<string, OutputMetrics>
}

/** 单个输出插件指标 */
export interface OutputMetrics {
  processed: number
  failed: number
  dropped: number
  avgLatencyMs: number
  circuitBreakerState: string
  lastSendAt?: string
}

/** 网关运行状态 */
export interface GatewayStatus {
  isRunning: boolean
}

// ============ API 函数 ============

/** 获取所有输出插件状态 */
export function getOutputPlugins(options?: RequestOptions) {
  return http.get<OutputPluginStatus[]>('/Gateway/outputs', null, options)
}

/** 获取单个输出插件状态 */
export function getOutputPlugin(name: string, options?: RequestOptions) {
  return http.get<OutputPluginStatus>(`/Gateway/outputs/${encodeURIComponent(name)}`, null, options)
}

/** 注册输出插件 */
export function registerOutput(request: RegisterOutputRequest, options?: RequestOptions) {
  // 映射前端字段名到后端字段名：config → Configuration
  const body = {
    PluginName: request.pluginName,
    ProtocolType: request.protocolType,
    Configuration: request.config,
    AutoStart: request.autoStart ?? true,
  }
  return http.post<{ pluginName: string; protocolType: string }>(
    '/Gateway/outputs',
    body,
    { showSuccessMsg: false, ...options },
  )
}

/** 移除输出插件 */
export function unregisterOutput(name: string, options?: RequestOptions) {
  return http.delete(`/Gateway/outputs/${encodeURIComponent(name)}`, {})
}

/** 启动输出插件 */
export function startOutput(name: string, options?: RequestOptions) {
  return http.patch(`/Gateway/outputs/${encodeURIComponent(name)}/start`, {})
}

/** 停止输出插件 */
export function stopOutput(name: string, options?: RequestOptions) {
  return http.patch(`/Gateway/outputs/${encodeURIComponent(name)}/stop`, {})
}

/** 获取网关转发指标 */
export function getGatewayMetrics(options?: RequestOptions) {
  return http.get<GatewayMetricsSnapshot>('/Gateway/metrics', null, options)
}

/** 获取死信队列 */
export function getDeadLetters(limit = 100, options?: RequestOptions) {
  return http.get<DeadLetterInfo[]>('/Gateway/dead-letters', { limit }, options)
}

/** 清空死信队列 */
export function clearDeadLetters(options?: RequestOptions) {
  return http.delete('/Gateway/dead-letters', {})
}

/** 死信重试 */
export function retryDeadLetters(options?: RequestOptions) {
  return http.post<{ retried: number }>('/Gateway/dead-letters/retry', {})
}

/** 重置断路器 */
export function resetCircuitBreaker(name: string, options?: RequestOptions) {
  return http.post(`/Gateway/circuit-breaker/${encodeURIComponent(name)}/reset`, {})
}

/** 测试发送消息 */
export function testSend(request: TestSendRequest, options?: RequestOptions) {
  const body = {
    OutputName: request.outputName,
    TestPayload: request.testPayload,
    TimeoutMs: request.timeoutMs,
  }
  return http.post<TestSendResult>('/Gateway/test', body, { showSuccessMsg: false, ...options })
}

/** 发布消息到 Pipeline */
export function publishMessage(request: PublishMessageRequest, options?: RequestOptions) {
  return http.post<void>('/Gateway/publish', request, options)
}

/** 获取网关运行状态 */
export function getGatewayStatus(options?: RequestOptions) {
  return http.get<GatewayStatus>('/Gateway/status', null, options)
}

// 兼容 preserveModules 目录导入：确保该模块作为目录时有 index.js 落盘
export const __gatewayIndexMarker = true
