/**
 * SaaS 订阅集成 API
 * 项目：TMom
 * 描述：订阅状态查询、资源配额管理
 * 修改日期：2026-05-08
 */

import { http } from '../http'

// ============================================================
// 类型定义
// ============================================================

/**
 * 订阅状态
 */
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'pending'

/**
 * 订阅计划类型
 */
export type PlanType = 'Free' | 'Pro' | 'Enterprise'

/**
 * 订阅信息
 */
export interface Subscription {
  planType: PlanType
  status: SubscriptionStatus
  startedAt: string | null
  expiresAt: string | null
  maxDevices: number
  maxTagsPerDevice: number
  maxSimInstances: number
  maxPortRange: number
}

/**
 * 资源配额
 */
export interface ResourceQuota {
  userId: number
  planType: PlanType
  status: SubscriptionStatus
  maxDevices: number
  currentDevices: number
  maxTagsPerDevice: number
  maxSimInstances: number
  currentSimInstances: number
  maxPortRange: number
  expiresAt: string | null
  isValid: boolean
}

/**
 * 订阅计划
 */
export interface SubscriptionPlan {
  code: PlanType
  name: string
  description: string | null
  maxDevices: number
  maxTagsPerDevice: number
  maxSimInstances: number
  maxPortRange: number
  monthlyPrice: number | null
  yearlyPrice: number | null
  currency: string
}

/**
 * 资源类型
 */
export type ResourceType = 'Device' | 'Tag' | 'SimInstance' | 'PortRange'

/**
 * 资源限制检查结果
 */
export interface ResourceLimitResult {
  canUse: boolean
  message: string | null
}

// ============================================================
// API 函数
// ============================================================

/**
 * 获取用户订阅状态
 * @param userId 用户ID
 */
export function getSubscription(userId: number) {
  return http.get<Subscription>(`/integration/subscription/${userId}`)
}

/**
 * 获取用户资源配额
 * @param userId 用户ID
 */
export function getResourceQuota(userId: number) {
  return http.get<ResourceQuota>(`/integration/quota/${userId}`)
}

/**
 * 获取所有订阅计划
 */
export function getSubscriptionPlans() {
  return http.get<SubscriptionPlan[]>('/integration/plans')
}

/**
 * 检查资源限制
 * @param userId 用户ID
 * @param resourceType 资源类型
 * @param requestedCount 请求数量
 * @param deviceId 设备ID（标签配额检查需要）
 */
export function checkResourceLimit(
  userId: number,
  resourceType: ResourceType,
  requestedCount: number = 1,
  deviceId?: number
): Promise<ResourceLimitResult> {
  return http.get<ResourceLimitResult>(
    `/integration/quota/${userId}/check`,
    { resourceType, requestedCount, deviceId }
  )
}

/**
 * 获取当前用户的订阅信息
 */
export function getMySubscription(): Promise<Subscription> {
  return http.get<Subscription>('/integration/subscription/me')
}

/**
 * 获取当前用户的资源配额
 */
export function getMyResourceQuota(): Promise<ResourceQuota> {
  return http.get<ResourceQuota>('/integration/quota/me')
}

/**
 * 检查资源限制
 * @param userId 用户ID
 * @param resourceType 资源类型
 * @param requestedCount 请求数量
 * @param deviceId 设备ID（标签配额检查需要）
 */
export function checkResourceLimitApi(
  userId: number,
  resourceType: ResourceType,
  requestedCount: number = 1,
  deviceId?: number
): Promise<ResourceLimitResult> {
  return http.get<ResourceLimitResult>(
    `/integration/quota/${userId}/check`,
    { resourceType, requestedCount, deviceId }
  )
}

// ============================================================
// 辅助函数
// ============================================================

/**
 * 获取计划显示名称
 */
export function getPlanDisplayName(planType: PlanType): string {
  const names: Record<PlanType, string> = {
    Free: '免费版',
    Pro: '专业版',
    Enterprise: '企业版'
  }
  return names[planType] || planType
}

/**
 * 获取状态显示名称
 */
export function getStatusDisplayName(status: SubscriptionStatus): string {
  const names: Record<SubscriptionStatus, string> = {
    active: '有效',
    expired: '已过期',
    cancelled: '已取消',
    pending: '待激活'
  }
  return names[status] || status
}

/**
 * 获取计划颜色
 */
export function getPlanColor(planType: PlanType): string {
  const colors: Record<PlanType, string> = {
    Free: '#52c41a',
    Pro: '#1890ff',
    Enterprise: '#722ed1'
  }
  return colors[planType] || '#666'
}

/**
 * 格式化价格
 */
export function formatPrice(price: number | null, currency: string = 'CNY'): string {
  if (price === null || price === undefined) return '-'
  
  const symbols: Record<string, string> = {
    CNY: '¥',
    USD: '$',
    EUR: '€'
  }
  
  const symbol = symbols[currency] || currency
  return `${symbol}${price.toFixed(2)}`
}
