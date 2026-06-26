/**
 * 资源配额检查 Hook
 * 项目：TMom
 * 描述：在创建资源前检查配额限制，提供友好的用户提示
 * 修改日期：2026-05-08
 */

import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { checkResourceLimitApi, getMyResourceQuota } from '../api/subscription'
import type { ResourceType, ResourceQuota } from '../api/subscription'

interface QuotaCheckResult {
  canUse: boolean
  message: string | null
}

interface UseQuotaCheckOptions {
  /** 是否自动刷新配额信息 */
  autoRefresh?: boolean
  /** 显示错误消息的时长（秒） */
  messageDuration?: number
  /** 网络错误时是否允许通过 */
  allowOnNetworkError?: boolean
}

/**
 * 资源配额检查 Hook
 *
 * 行业最佳实践：
 * 1. 防御性编程：处理所有边界情况
 * 2. 错误隔离：网络错误不影响业务
 * 3. 缓存优化：5分钟内不重复请求
 * 4. 类型安全：完整类型定义
 *
 * @example
 * ```ts
 * const { checkBeforeCreate, isLoading, quota } = useQuotaCheck()
 *
 * // 创建设备前检查
 * const canCreate = await checkBeforeCreate('Device', 1)
 * if (canCreate) {
 *   // 执行创建逻辑
 * }
 * ```
 */
export function useQuotaCheck(options: UseQuotaCheckOptions = {}) {
  const {
    autoRefresh = true,
    messageDuration = 5,
    allowOnNetworkError = true
  } = options

  const isLoading = ref(false)
  const quota = ref<ResourceQuota | null>(null)
  const lastCheckTime = ref<Date | null>(null)
  const lastError = ref<string | null>(null)

  /**
   * 刷新配额信息
   */
  const refreshQuota = async (): Promise<boolean> => {
    try {
      isLoading.value = true
      lastError.value = null
      const result = await getMyResourceQuota()
      quota.value = result
      lastCheckTime.value = new Date()
      return true
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '获取配额信息失败'
      lastError.value = errorMsg
      console.error('获取配额信息失败:', error)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 检查资源限制
   * 必须确保已有配额信息
   */
  const checkResource = async (
    resourceType: ResourceType,
    requestedCount: number = 1,
    deviceId?: number
  ): Promise<QuotaCheckResult> => {
    // 关键修复：如果没有配额信息，先刷新
    if (!quota.value?.userId) {
      const success = await refreshQuota()
      if (!success) {
        // 网络错误时的降级处理
        if (allowOnNetworkError) {
          return { canUse: true, message: null }
        }
        return { canUse: false, message: '无法获取配额信息，请稍后重试' }
      }
    }

    // 类型安全：确保 userId 存在
    const userId = quota.value?.userId
    if (!userId) {
      return { canUse: false, message: '用户信息无效' }
    }

    try {
      isLoading.value = true
      const result = await checkResourceLimitApi(
        userId,
        resourceType,
        requestedCount,
        deviceId
      )
      return result
    } catch (error) {
      console.error('检查资源限制失败:', error)
      // 网络错误时降级处理
      if (allowOnNetworkError) {
        return { canUse: true, message: null }
      }
      return {
        canUse: false,
        message: '网络错误，无法检查配额'
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 创建前检查并提示
   * 如果配额不足，会显示错误消息并返回 false
   */
  const checkBeforeCreate = async (
    resourceType: ResourceType,
    requestedCount: number = 1,
    deviceId?: number
  ): Promise<boolean> => {
    // 如果配额信息过期，先刷新
    if (autoRefresh && (!quota.value || isQuotaStale())) {
      const success = await refreshQuota()
      if (!success && !allowOnNetworkError) {
        message.error({
          content: '无法获取配额信息，请检查网络连接',
          duration: messageDuration
        })
        return false
      }
    }

    // 如果订阅无效，提示用户续费
    if (quota.value && !quota.value.isValid) {
      message.warning({
        content: '订阅已过期，请续费后继续使用',
        duration: messageDuration
      })
      return false
    }

    const result = await checkResource(resourceType, requestedCount, deviceId)

    if (!result.canUse && result.message) {
      message.warning({
        content: result.message,
        duration: messageDuration
      })
    }

    return result.canUse
  }

  /**
   * 批量创建前检查
   * 用于批量导入等场景
   */
  const checkBeforeBatchCreate = async (
    items: Array<{ resourceType: ResourceType; count: number; deviceId?: number }>
  ): Promise<{ canProceed: boolean; errors: string[] }> => {
    const errors: string[] = []

    for (const item of items) {
      const result = await checkResource(item.resourceType, item.count, item.deviceId)
      if (!result.canUse && result.message) {
        errors.push(result.message)
      }
    }

    return {
      canProceed: errors.length === 0,
      errors
    }
  }

  /**
   * 获取资源使用百分比
   * 安全处理：分母为0时返回0
   */
  const getUsagePercent = (resourceType: 'devices' | 'simInstances'): number => {
    if (!quota.value) return 0

    switch (resourceType) {
      case 'devices': {
        const max = quota.value.maxDevices
        if (max === 0) return 0
        return (quota.value.currentDevices / max) * 100
      }
      case 'simInstances': {
        const max = quota.value.maxSimInstances
        if (max === 0) return 0
        return (quota.value.currentSimInstances / max) * 100
      }
      default:
        return 0
    }
  }

  /**
   * 判断是否接近配额限制（>80%）
   */
  const isNearLimit = (resourceType: 'devices' | 'simInstances'): boolean => {
    return getUsagePercent(resourceType) > 80
  }

  /**
   * 判断配额信息是否过期（超过5分钟）
   */
  const isQuotaStale = (): boolean => {
    if (!lastCheckTime.value) return true
    const fiveMinutes = 5 * 60 * 1000
    return Date.now() - lastCheckTime.value.getTime() > fiveMinutes
  }

  return {
    /** 加载状态 */
    isLoading,
    /** 配额信息 */
    quota,
    /** 上次检查时间 */
    lastCheckTime,
    /** 最后一次错误 */
    lastError,
    /** 刷新配额信息 */
    refreshQuota,
    /** 检查资源限制 */
    checkResource,
    /** 创建前检查并提示 */
    checkBeforeCreate,
    /** 批量创建前检查 */
    checkBeforeBatchCreate,
    /** 获取资源使用百分比 */
    getUsagePercent,
    /** 判断是否接近配额限制 */
    isNearLimit,
    /** 判断配额信息是否过期 */
    isQuotaStale
  }
}
