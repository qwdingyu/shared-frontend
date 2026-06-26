import { ref } from 'vue'
import { message } from 'ant-design-vue'

/**
 * Blob 文件下载 composable（统一所有"调 API 拿 Blob → 触发浏览器下载"场景）。
 *
 * 设计目标：
 *  - 消除 4 个页面（tagHistory / DeviceWorkbench / auditLog / DataQueryTool）里
 *    重复的 URL.createObjectURL + createElement('a') + click + revokeObjectURL 流程。
 *  - 内置 loading 状态与错误提示，调用方只需一行代码。
 *
 * 用法：
 * ```ts
 * const { downloading, downloadBlob } = useDownloadBlob()
 * await downloadBlob(() => exportDeviceBundle(id), `device-${id}.zip`)
 * await downloadBlob(Promise.resolve(myCsvBlob), 'audit.csv', { successMsg: '已导出' })
 * ```
 */
export function useDownloadBlob() {
  const downloading = ref(false)

  /**
   * 触发浏览器下载
   * @param source Blob 实例 或 返回 Blob 的 Promise / 工厂函数
   * @param filename 下载文件名（建议含时间戳，便于归档）
   * @param options 可选的成功/失败提示
   */
  async function downloadBlob(
    source: Blob | Promise<Blob> | (() => Promise<Blob>),
    filename: string,
    options: { successMsg?: string; errorMsg?: string } = {},
  ): Promise<boolean> {
    downloading.value = true
    try {
      const blob = typeof source === 'function'
        ? await source()
        : await source

      // 兜底：如果后端返回的是 JSON 错误包成 Blob，尝试解析提示
      if (blob?.type?.includes('application/json')) {
        try {
          const text = await blob.text()
          const parsed = JSON.parse(text)
          message.error(parsed?.msg || parsed?.detail || options.errorMsg || '导出失败')
          return false
        } catch {
          // 不是 JSON，按普通 blob 处理
        }
      }

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      message.success(options.successMsg ?? '开始下载')
      return true
    } catch (err: any) {
      message.error(options.errorMsg || err?.message || '导出失败')
      return false
    } finally {
      downloading.value = false
    }
  }

  return { downloading, downloadBlob }
}
