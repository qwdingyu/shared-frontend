import { ref, onMounted, onUnmounted } from 'vue'
import { getTagHistoryBufferStatus } from '@/api/device/tagHistory'

export interface UseBufferStatusOptions {
  /**
   * 自动刷新间隔（毫秒）。默认 0 表示不自动刷新。
   * plcMonitor 用 30000；tagHistory / systemMaintenance 用 0（手动刷新）。
   */
  autoRefreshMs?: number
  /** 查询失败时调用。默认空（静默）。 */
  onError?: (err: unknown) => void
}

/**
 * 标签历史入库缓冲区状态 composable（/api/TagHistory/BufferStatus）。
 *
 * 消除 3 个页面里重复的 pending_count 拉取 + 定时刷新逻辑：
 *   - plcMonitor.vue        autoRefreshMs=30000
 *   - tagHistory.vue        手动刷新
 *   - systemMaintenance.vue 手动刷新
 *
 * 用法：
 * ```ts
 * const { pending, loading, updatedAt, refresh } = useBufferStatus({ autoRefreshMs: 30000 })
 * ```
 */
export function useBufferStatus(options: UseBufferStatusOptions = {}) {
  const { autoRefreshMs = 0, onError } = options

  const pending = ref(0)
  const loading = ref(false)
  const updatedAt = ref('')

  let timer: ReturnType<typeof setInterval> | null = null

  const refresh = async () => {
    loading.value = true
    try {
      const res = await getTagHistoryBufferStatus()
      pending.value = Number(res?.pending_count ?? 0)
      updatedAt.value = new Date().toLocaleTimeString()
    } catch (err) {
      onError?.(err)
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    refresh()
    if (autoRefreshMs > 0) {
      timer = setInterval(refresh, autoRefreshMs)
    }
  })

  onUnmounted(() => {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  })

  return {
    /** 待写入条数 */
    pending,
    /** 是否正在查询 */
    loading,
    /** 上次查询成功时间（本地化字符串） */
    updatedAt,
    /** 手动触发一次查询 */
    refresh,
  }
}
