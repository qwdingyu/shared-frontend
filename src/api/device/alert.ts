import { http } from "@/api/http";

// ========== 告警 API ==========

export interface AlertRecord {
  id: number;
  deviceId: number;
  deviceName: string;
  alertType: string;
  level: string;
  message: string;
  status: number;
  triggeredAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  relatedExeId?: number;
  relatedTagName?: string;
}

export interface AlertRule {
  id: number;
  name: string;
  deviceId?: number;
  condition: string;
  level: string;
  enabled: boolean;
}

export interface AlertRecordsQuery {
  deviceId?: number;
  level?: string;
  status?: number;
  startTime?: string;
  endTime?: string;
  pageSize?: number;
}

/** 获取告警记录列表 */
export function getAlertRecords(params: AlertRecordsQuery) {
  return http.get<AlertRecord[]>("/Alert/Records", params as Record<string, unknown>);
}

/** 获取活动告警数量 */
export function getAlertActiveCount() {
  return http.get<number>("/Alert/ActiveCount");
}

/** 确认告警 */
export function acknowledgeAlert(recordId: number) {
  return http.post<{ success: boolean; msg: string }>(
    `/Alert/Records/Acknowledge?recordId=${recordId}`,
    {},
  );
}

/** 获取告警规则列表 */
export function getAlertRules(deviceId?: number) {
  return http.get<AlertRule[]>("/Alert/Rules", deviceId ? { deviceId } : undefined);
}

/** 创建告警规则 */
export function addAlertRule(rule: Partial<AlertRule>) {
  return http.post<{ success: boolean; data: number; msg: string }>("/Alert/Rules/Add", rule);
}

/** 更新告警规则 */
export function updateAlertRule(rule: AlertRule) {
  return http.post<{ success: boolean; msg: string }>("/Alert/Rules/Update", rule);
}

/** 删除告警规则 */
export function deleteAlertRule(id: number) {
  return http.post<{ success: boolean; msg: string }>("/Alert/Rules/Delete", { id });
}
