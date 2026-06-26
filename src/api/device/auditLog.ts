import { http } from '@/api/http'
import { normalizeList, normalizePage, type ListLikeResponse } from '@/api/response'

/**
 * 审计日志 DTO
 */
export interface IotAuditLogDto {
  id?: number
  actionType: string
  objectType: string
  objectId: string
  objectName: string
  deviceId?: number
  detail?: string
  result: string
  errorMessage?: string
  operatorId?: number
  operatorName: string
  operateTime: string
  ipAddress?: string
  userAgent?: string
}

/**
 * 获取所有审计日志
 */
export function getAuditLogList() {
  return http.get<ListLikeResponse<IotAuditLogDto>>('/AuditLog/GetAll').then(normalizeList)
}

/**
 * 分页获取审计日志
 */
export function getAuditLogPage(
  pageIndex: number = 1,
  pageSize: number = 20,
  params?: {
    actionType?: string
    objectType?: string
    startTime?: string
    endTime?: string
  },
) {
  let url = `/AuditLog/GetPage?pageIndex=${pageIndex}&pageSize=${pageSize}`
  if (params?.actionType) url += `&actionType=${params.actionType}`
  if (params?.objectType) url += `&objectType=${params.objectType}`
  if (params?.startTime) url += `&startTime=${params.startTime}`
  if (params?.endTime) url += `&endTime=${params.endTime}`
  return http
    .get<{ data: IotAuditLogDto[]; count: number }>(url, null, { isReturnResult: false })
    .then(res => {
      // isReturnResult:false → res 是 axios 原始响应，数据在 res.data 中
      // 后端返回 { result: [...], total: N }，传入 normalizePage 正确提取
      const page = normalizePage<IotAuditLogDto>((res as any).data)
      return { data: page.list, count: page.total }
    })
}

/**
 * 导出审计日志
 */
export function exportAuditLogs(params?: {
  actionType?: string
  objectType?: string
  startTime?: string
  endTime?: string
}) {
  let url = '/AuditLog/Export'
  const queryParams: string[] = []
  if (params?.actionType) queryParams.push(`actionType=${params.actionType}`)
  if (params?.objectType) queryParams.push(`objectType=${params.objectType}`)
  if (params?.startTime) queryParams.push(`startTime=${params.startTime}`)
  if (params?.endTime) queryParams.push(`endTime=${params.endTime}`)
  if (queryParams.length > 0) url += '?' + queryParams.join('&')
  return http.get<ListLikeResponse<IotAuditLogDto>>(url).then(normalizeList)
}

/**
 * 记录设备操作日志
 */
export function logDeviceOperation(data: {
  actionType: string
  objectId: string
  objectName: string
  deviceId?: number
  detail: string
  result: string
  errorMessage?: string
  operatorId?: number
  operatorName?: string
}) {
  return http.post(
    '/AuditLog/LogDeviceOperation',
    {},
    {
      params: data,
    },
  )
}

/**
 * 记录标签操作日志
 */
export function logTagOperation(data: {
  actionType: string
  objectId: string
  objectName: string
  deviceId?: number
  detail: string
  result: string
  errorMessage?: string
  operatorId?: number
  operatorName?: string
}) {
  return http.post(
    '/AuditLog/LogTagOperation',
    {},
    {
      params: data,
    },
  )
}

/**
 * 记录Exe配置操作日志
 */
export function logExeOperation(data: {
  actionType: string
  objectId: string
  objectName: string
  detail: string
  result: string
  errorMessage?: string
  operatorId?: number
  operatorName?: string
}) {
  return http.post(
    '/AuditLog/LogExeOperation',
    {},
    {
      params: data,
    },
  )
}
