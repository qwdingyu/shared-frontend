/**
 * 表格统一分页/样式/滚动配置
 * 所有主数据表格统一使用此配置，避免各页面各自为政
 *
 * 设计原则：
 * 1. 统一 size="small" — 行高紧凑，单屏信息密度高
 * 2. 统一 scroll.y — 固定表头，数据区滚动，页面不跟着滚
 * 3. 统一分页配置 — 页码、每页条数、总数显示一致
 */

/** 默认分页配置 */
export const DEFAULT_PAGINATION = {
  pageSize: 20,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100'],
  showTotal: (total: number) => `共 ${total} 条`,
}

/** 表格统一尺寸 */
export const TABLE_SIZE = 'small' as const

/**
 * 主数据表格默认 scroll.y — 固定表头，数据区滚动
 * 独立页面用 PAGE_SCROLL_Y，Tab/Drawer 内用 TAB_SCROLL_Y
 */
export const PAGE_SCROLL_Y = 'calc(100vh - 340px)'
export const TAB_SCROLL_Y = 'calc(100vh - 480px)'

/**
 * 生成分页配置
 * @param total 数据总数，<= threshold 时禁用分页
 * @param threshold 启用分页的最小数据量，默认 20
 * @param overrides 覆盖默认值
 */
export function usePagination(
  total: number,
  threshold = 20,
  overrides?: Partial<typeof DEFAULT_PAGINATION>,
) {
  if (total <= threshold) return false
  return { ...DEFAULT_PAGINATION, ...overrides }
}
