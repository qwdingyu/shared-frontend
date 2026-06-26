// ============================================================
// 项目：TMom.Device.Runtime.Host
// 描述：标签历史数据 API (前端共享)
// 功能：历史数据的查询、统计、清理接口定义
// 创建日期：2026-05-04
// ============================================================

import { http } from "@/api/http";

/**
 * 标签历史数据 DTO
 */
export interface TagHistoryDto {
  id: number;
  tag_id: number;
  device_id: number;
  tag_address: string;
  biz_tag_name: string;
  value_str: string | null;
  value_num: number | null;
  value_bool: boolean | null;
  data_type: string;
  collect_time: string;
  quality_code: number;
}

/**
 * 标签历史统计数据 DTO
 */
export interface TagHistoryStatisticsDto {
  biz_tag_name: string;
  count: number;
  min_value: number | null;
  max_value: number | null;
  avg_value: number | null;
  first_collect_time: string | null;
  last_collect_time: string | null;
}

/**
 * 历史数据查询参数
 */
export interface TagHistoryQueryParams {
  tagId?: number;
  bizTagName?: string;
  deviceId?: number;
  startTime?: string;
  endTime?: string;
  pageIndex?: number;
  pageSize?: number;
  descending?: boolean;
}

/**
 * 分页查询结果
 */
export interface TagHistoryPageResult {
  list: TagHistoryDto[];
  total: number;
  page_index: number;
  page_size: number;
}

// ========== 历史数据查询 API ==========

/**
 * 查询标签历史数据
 */
export function queryTagHistory(params: TagHistoryQueryParams) {
  const queryParams = new URLSearchParams();

  if (params.tagId) queryParams.append('tagId', params.tagId.toString());
  if (params.bizTagName) queryParams.append('bizTagName', params.bizTagName);
  if (params.deviceId) queryParams.append('deviceId', params.deviceId.toString());
  if (params.startTime) queryParams.append('startTime', params.startTime);
  if (params.endTime) queryParams.append('endTime', params.endTime);
  queryParams.append('pageIndex', (params.pageIndex || 1).toString());
  queryParams.append('pageSize', (params.pageSize || 100).toString());
  queryParams.append('descending', (params.descending ?? true).toString());

  return http.get<TagHistoryPageResult>(`/TagHistory/Query?${queryParams.toString()}`);
}

/**
 * 获取最新N条历史数据
 */
export function getLatestTagHistory(tagId: number, count: number = 10) {
  return http.get<TagHistoryDto[]>(`/TagHistory/Latest?tagId=${tagId}&count=${count}`);
}

/**
 * 获取标签统计数据
 */
export function getTagHistoryStatistics(
  bizTagName: string,
  startTime?: string,
  endTime?: string
) {
  const params = new URLSearchParams();
  params.append('bizTagName', bizTagName);
  if (startTime) params.append('startTime', startTime);
  if (endTime) params.append('endTime', endTime);

  return http.get<TagHistoryStatisticsDto>(`/TagHistory/Statistics?${params.toString()}`);
}

/**
 * 清理历史数据
 * @param days 保留天数，删除该天数之前的数据
 */
export function cleanupTagHistory(days: number) {
  return http.post(`/TagHistory/Cleanup?days=${days}`, {}) as Promise<{
    deleted_count: number;
  }>;
}

/**
 * 强制刷新历史数据缓冲区
 */
export function flushTagHistoryBuffer() {
  return http.post('/TagHistory/Flush', {});
}

/**
 * 获取缓冲区状态
 */
export function getTagHistoryBufferStatus() {
  return http.get<{ pending_count: number }>('/TagHistory/BufferStatus');
}

/**
 * 确保历史数据表存在
 */
export function ensureTagHistoryTable() {
  return http.post('/TagHistory/EnsureTable', {});
}

/**
 * 降采样数据点
 */
export interface DownSamplePoint {
  timeBucket: string;
  avgValue: number | null;
  minValue: number | null;
  maxValue: number | null;
  sampleCount: number;
}

/**
 * 查询标签历史降采样数据
 * @param tagId 标签ID
 * @param startTime 开始时间
 * @param endTime 结束时间
 * @param interval 时间窗口: 1m, 5m, 15m, 1h, 1d
 */
export function queryTagHistoryDownSample(
  tagId: number,
  startTime: string,
  endTime: string,
  interval: string = '1m'
) {
  const params = new URLSearchParams();
  params.append('tagId', tagId.toString());
  params.append('startTime', startTime);
  params.append('endTime', endTime);
  params.append('interval', interval);

  return http.get<DownSamplePoint[]>(`/TagHistory/DownSample?${params.toString()}`);
}

/**
 * 导出标签历史为 CSV（后端上限 10000 条）
 * @returns Blob（text/csv）
 */
export function exportTagHistoryCsv(params: {
  tagId?: number
  bizTagName?: string
  deviceId?: number
  startTime?: string
  endTime?: string
}) {
  const sp = new URLSearchParams()
  if (params.tagId) sp.append('tagId', params.tagId.toString())
  if (params.bizTagName) sp.append('bizTagName', params.bizTagName)
  if (params.deviceId) sp.append('deviceId', params.deviceId.toString())
  if (params.startTime) sp.append('startTime', params.startTime)
  if (params.endTime) sp.append('endTime', params.endTime)
  return http.get<Blob>(
    `/TagHistory/ExportCsv?${sp.toString()}`,
    null,
    { responseType: 'blob' } as any,
  )
}

// ========== 标签-执行关联查询 ==========

/**
 * 关联执行日志项
 */
export interface CorrelatedExeLogItem {
  exeLogId: number;
  exeId: number;
  triggered: boolean;
  triggerReason: string | null;
  executionSuccess: boolean;
  elapsedMs: number;
  errorMessage: string | null;
}

/**
 * 关联时间轴项
 */
export interface CorrelatedTimelineItem {
  collectTime: string;
  bizTagName: string;
  valueStr: string | null;
  valueNum: number | null;
  qualityCode: number;
  exeLogs: CorrelatedExeLogItem[];
}

/**
 * 查询标签-执行关联数据
 * @param tagId 标签ID
 * @param startTime 开始时间
 * @param endTime 结束时间
 */
export function getTagHistoryCorrelated(
  tagId: number,
  startTime: string,
  endTime: string
) {
  const params = new URLSearchParams();
  params.append('tagId', tagId.toString());
  params.append('startTime', startTime);
  params.append('endTime', endTime);

  return http.get<CorrelatedTimelineItem[]>(`/TagHistory/Correlated?${params.toString()}`);
}
