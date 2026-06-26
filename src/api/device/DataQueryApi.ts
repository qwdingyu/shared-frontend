import { http } from '@/api/http'

/**
 * 数据查询结果
 */
export interface DataQueryResult {
  success: boolean
  errorMessage?: string
  columns: string[]
  rows: unknown[][]
  executionTime: number
  rowCount: number
}

/**
 * 表信息（来自 information_schema）
 */
export interface TableInfo {
  tableName: string
  rowCount: number
  comment: string
}

/**
 * 列信息
 */
export interface ColumnInfo {
  name: string
  type: string
  nullable: boolean
  isPrimaryKey: boolean
  default?: string | null
  extra: string
  comment: string
}

/**
 * 自动补全候选词
 */
export interface CompletionsData {
  tables: string[]
  keywords: string[]
}

/**
 * 执行 SQL 查询
 */
export function executeDataQuery(sql: string, maxRows = 1000) {
  return http.post<{ success: boolean; data?: DataQueryResult; msg?: string }>(
    '/DataQuery/Execute',
    { sql, maxRows },
    { showSuccessMsg: false },
  )
}

/**
 * 测试数据库连接
 */
export function testDataQueryConnection() {
  return http.get<{ connected: boolean; message: string }>('/DataQuery/TestConnection')
}

/**
 * 获取所有表（含行数、注释）
 */
export function getDataQueryTables() {
  return http.get<TableInfo[]>('/DataQuery/Tables')
}

/**
 * 获取指定表的列定义
 */
export function getDataQuerySchema(tableName: string) {
  return http.get<ColumnInfo[]>(`/DataQuery/Schema/${encodeURIComponent(tableName)}`)
}

/**
 * 获取 SQL 自动补全候选词
 */
export function getDataQueryCompletions() {
  return http.get<CompletionsData>('/DataQuery/Completions')
}
