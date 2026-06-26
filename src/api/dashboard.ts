/**
 * Dashboard 运营看板 API
 */
import { http } from "@/api/http";

export interface DashboardDeviceStats {
  total: number;
  online: number;
  offline: number;
  error: number;
}

export interface DashboardDeviceDetail {
  id: number;
  code: string;
  name: string;
  deviceType: string;
  ipAddress: string;
  port: number;
  status: string;
  isConnected: boolean;
  tagCount: number;
  lastUpdate: string;
  errorMessage?: string;
}

export interface DashboardHealthSummary {
  total: number;
  healthyCount: number;
  unhealthyCount: number;
}

/**
 * 获取设备统计概览
 * 从 GetAllDevices 聚合统计
 */
export async function getDeviceStats(): Promise<DashboardDeviceStats> {
  const res = await http.get<DashboardDeviceDetail[]>("/IotDevice/GetAllDevices");
  const devices = (res as any)?.data || res || [];
  return {
    total: devices.length,
    online: devices.filter((d: DashboardDeviceDetail) => d.isConnected).length,
    offline: devices.filter((d: DashboardDeviceDetail) => !d.isConnected && d.status !== "Error").length,
    error: devices.filter((d: DashboardDeviceDetail) => d.status === "Error").length,
  };
}

/**
 * 获取所有设备列表（带运行时状态）
 */
export async function getDashboardDevices(): Promise<DashboardDeviceDetail[]> {
  const res = await http.get<DashboardDeviceDetail[]>("/IotDevice/GetAllDevices");
  return (res as any)?.data || res || [];
}

/**
 * 获取所有设备健康状态
 */
export async function getDashboardHealth(): Promise<DashboardHealthSummary> {
  const res = await http.get<DashboardHealthSummary>("/IotDevice/CheckAllHealth");
  return (res as any)?.data || { total: 0, healthyCount: 0, unhealthyCount: 0 };
}

/**
 * 获取设备类型分布
 */
export async function getDeviceTypeDistribution(): Promise<DashboardDeviceDetail[]> {
  const devices = await getDashboardDevices();
  const typeMap = new Map<string, { count: number; online: number }>();
  for (const d of devices) {
    const existing = typeMap.get(d.deviceType) || { count: 0, online: 0 };
    existing.count++;
    if (d.isConnected) existing.online++;
    typeMap.set(d.deviceType, existing);
  }
  return Array.from(typeMap.entries()).map(([deviceType, v]) => ({
    ...devices.find(d => d.deviceType === deviceType)!,
    tagCount: v.count,
  } as any));
}
