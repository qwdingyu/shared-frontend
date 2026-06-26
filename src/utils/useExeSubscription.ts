import { onMounted, onUnmounted, unref, watch, type MaybeRef } from 'vue'
import { message, notification } from 'ant-design-vue'
import { usePlcSignalR } from '@/utils/plcSignalR'

export interface ExeExecutionInfo {
  deviceId: number | string
  tagName?: string
  bizCode?: string
  success: boolean
  result?: string | number | null
  error?: string | null
  traceId?: string
  timestamp?: string
}

export interface UseExeSubscriptionOptions {
  /**
   * 命中当前设备的执行完成事件时调用。组件用它触发列表刷新。
   * 不传则只弹通知，不做任何副作用。
   */
  onChanged?: (info: ExeExecutionInfo) => void
  /** 是否弹右下角通知（默认 true） */
  notify?: boolean
}

/**
 * 订阅 PlcHub 推送的 OnExeExecutionCompleted 事件（按 deviceId 分组）。
 *
 * 设计目标：
 *  - 把 ExeRulesTab.vue 里那段"acquire + subscribe + 回调过滤 + 通知 + 清理"
 *    抽成可复用 composable，未来 exeExecLog.vue / plcMonitor.vue 都能一行接入。
 *  - 重连自动恢复订阅（SignalRConnectionManager 已支持 subscribedExeDevices）。
 *
 * 用法：
 * ```ts
 * useExeSubscription(
 *   () => props.deviceId,
 *   { onChanged: () => { loadExes(); loadLogs() } },
 * )
 * ```
 */
export function useExeSubscription(
  deviceId: MaybeRef<number | string | undefined>,
  options: UseExeSubscriptionOptions = {},
) {
  const { onChanged, notify = true } = options

  const {
    onExeExecutionCompleted,
    subscribeExeExecution,
    unsubscribeExeExecution,
    connect,
  } = usePlcSignalR()

  onExeExecutionCompleted((raw: any) => {
    if (!raw) return
    const current = unref(deviceId)
    if (current == null || String(raw.deviceId) !== String(current)) return

    const info: ExeExecutionInfo = {
      deviceId: raw.deviceId,
      tagName: raw.tagName,
      bizCode: raw.bizCode,
      success: !!raw.success,
      result: raw.result,
      error: raw.error,
      traceId: raw.traceId,
      timestamp: raw.timestamp,
    }

    if (notify) {
      notification[info.success ? 'success' : 'error']({
        message: info.success ? 'Exe 执行成功' : 'Exe 执行失败',
        description:
          `${info.bizCode || info.tagName || '-'} · ${info.result ?? ''}${info.error ? ' · ' + info.error : ''}`,
        duration: 3,
        placement: 'bottomRight',
      })
    }

    onChanged?.(info)
  })

  // 订阅当前 deviceId；deviceId 变化时平滑切换
  const subscribe = async (id: number | string | undefined) => {
    if (id == null) return
    try {
      await connect() // acquire 引用计数，已连接时 noop
    } catch { /* 父组件可能已 connect，忽略 */ }
    try {
      await subscribeExeExecution(String(id))
    } catch {
      message.warning('订阅 Exe 执行完成事件失败，日志将不会自动刷新')
    }
  }

  const unsubscribe = (id: number | string | undefined) => {
    if (id == null) return
    unsubscribeExeExecution(String(id)).catch(() => { /* 忽略 */ })
  }

  onMounted(() => subscribe(unref(deviceId)))
  onUnmounted(() => unsubscribe(unref(deviceId)))

  // 父组件动态切换 deviceId 时，平滑切换订阅
  watch(
    () => unref(deviceId),
    (next, prev) => {
      if (String(next) === String(prev)) return
      unsubscribe(prev)
      subscribe(next)
    },
  )

  return {
    /** 让调用方能在特殊场景下手动重订阅 */
    resubscribe: () => {
      const id = unref(deviceId)
      unsubscribe(id)
      subscribe(id)
    },
  }
}
