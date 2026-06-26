/**
 * 表格统一分页/样式/滚动配置
 * 所有主数据表格统一使用此配置，避免各页面各自为政
 *
 * 设计原则：
 * 1. 统一 size="small" — 行高紧凑，单屏信息密度高
 * 2. 统一 scroll.y — 固定表头，数据区滚动，分页控件始终可见
 * 3. 统一分页配置 — 页码、每页条数、总数显示一致
 * 4. 筛选栏单行 — 不超过一行，控件紧凑，利用 card #extra 或紧凑 toolbar
 *
 * 空间预算（以 1080p 为例，视口高度 ~950px）：
 *  独立页面：global-header(64) + page-pad(48) + card-title(46) + th(40) + pag(40) = 238 → 取 260px
 *  Tab 内嵌：+ tabs-header(46) + 内层-padding(24) + toolbar(40) = 348 → 取 440px
 */

/** 默认分页配置 — 所有表格统一使用，pageSize 固定 20 */
export const DEFAULT_PAGINATION = {
  pageSize: 20,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100'],
  showTotal: (total: number) => `共 ${total} 条`,
}

/** 表格统一尺寸 */
export const TABLE_SIZE = 'small' as const

/**
 * 独立页面表格 scroll.y
 * 适用于筛选栏在 card #extra（单行）的场景：/device/iot、/device/exe、/device/audit 等
 */
export const PAGE_SCROLL_Y = 'calc(100vh - 260px)'

/**
 * Tab 内嵌表格 scroll.y
 * 适用于嵌在 a-tabs 内的表格：ExeRulesTab、TagManagementTab、MonitorTab、SimulationTab 等
 */
export const TAB_SCROLL_Y = 'calc(100vh - 440px)'

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
