/**
 * Runner 代码生成器 API
 * 对应后端: TMom.Device.Runtime.Host/Endpoints/RunnerGenerateEndpoints.cs
 * 创建日期: 2026-06-05
 */
import { http } from "@/api/http";
import { baseApiUrl } from "@/utils/request";

// ==================== 请求类型 ====================

/**
 * Runner 生成请求
 */
export interface RunnerGenerateRequest {
  /** 设备 ID 列表（null/undefined 表示所有启用设备） */
  deviceIds?: number[];
  /** 命名空间（可选，如 "FactoryA.Line1.Plc01"） */
  namespace?: string;
  /** 配置格式: Json(默认) / Xml */
  configFormat?: string;
  /** 目标平台: Console / WindowsService / LinuxSystemd / WinForm */
  platform?: string;
  /** SKU 模式: Binary(免费exe) / Source(付费源码) */
  sku?: string;
  /** 运行时标识符: win-x64 / linux-x64 / osx-x64 */
  runtimeIdentifier?: string;
  /** 项目名（可选） */
  projectName?: string;
  /** Runner 本地/客户侧数据存储类型 */
  dataStorageType?: string;
  /** Runner 本地/客户侧数据存储连接串 */
  dataStorageConnectionString?: string;
  /** 是否启用断网续传 */
  enableDataSync?: boolean;
  /** DataSync 远端目标数据库类型 */
  remoteTargetType?: string;
  /** DataSync 远端目标数据库连接串 */
  remoteTargetConnectionString?: string;
}

// ==================== 响应类型 ====================

/**
 * 任务状态枚举
 */
export type JobStatus = "Queued" | "Running" | "Succeeded" | "Failed" | "Cancelled" | "TimedOut";

/**
 * Runner 生成任务
 */
export interface RunnerJob {
  /** 任务 ID (GUID) */
  id: string;
  /** 任务状态 */
  status: JobStatus;
  /** 用户 ID */
  userId?: string;
  /** 创建时间 (ISO 8601) */
  createdAt: string;
  /** 完成时间 (ISO 8601) */
  completedAt?: string;
  /** 进度百分比 0-100 */
  progress: number;
  /** 当前阶段描述 */
  phase: string;
  /** 错误信息（失败时） */
  errorMessage?: string;
  /** 是否有可下载结果 */
  hasResult?: boolean;
  /** 安全下载令牌（仅提交时返回，用于 SSE/下载验证） */
  downloadToken?: string;
}

/**
 * 生成任务提交响应
 */
export interface GenerateResponse {
  jobId: string;
  message: string;
  sseUrl?: string;
  downloadUrl?: string;
}

/**
 * SSE 事件数据（与后端 SerializeEvent 字段对齐）
 */
export interface SseEvent {
  status: string;
  progress: number;
  phase: string;
  errorMessage?: string;
  timestamp: string;
}

// ==================== API 函数 ====================

/**
 * 提交 Runner 生成任务
 * POST /api/runner/generate
 */
export function generateRunner(request: RunnerGenerateRequest) {
  return http.post<GenerateResponse>("/api/runner/generate", request, {
    showSuccessMsg: false,
  });
}

/**
 * 获取任务列表（最近 50 条）
 * GET /api/runner/jobs
 */
export function getRunnerJobs() {
  return http.get<RunnerJob[]>("/api/runner/jobs");
}

/**
 * 获取任务状态
 * GET /api/runner/jobs/{id}
 */
export function getRunnerJobStatus(id: string) {
  return http.get<RunnerJob>(`/api/runner/jobs/${id}`);
}

/**
 * 取消任务
 * POST /api/runner/jobs/{id}/cancel
 */
export function cancelRunnerJob(id: string) {
  return http.post<{ status: string; message: string }>(`/api/runner/jobs/${id}/cancel`, {}, {
    showSuccessMsg: false,
  });
}

/**
 * 下载生成结果。
 * 后端使用不可猜测的 jobId 作为一次性访问凭证。
 * GET /api/runner/jobs/{id}/download
 */
export function downloadRunnerResult(id: string) {
  window.open(`${baseApiUrl}/api/runner/jobs/${id}/download`, "_blank");
}

/**
 * 创建 SSE 连接，监听任务进度
 * GET /api/runner/jobs/{id}/sse
 * @returns EventSource 对象，调用方负责 close()
 */
export function createSseConnection(
  id: string,
  _token: string,
  onMessage: (event: SseEvent) => void,
  onError: (error: Event) => void,
  onEnd: () => void,
): EventSource {
  const es = new EventSource(`${baseApiUrl}/api/runner/jobs/${id}/sse`);

  es.onmessage = (e: MessageEvent) => {
    try {
      const data: SseEvent = JSON.parse(e.data);
      onMessage(data);
      // 终态自动断开
      if (data.status === "Succeeded" || data.status === "Failed" || data.status === "Cancelled" || data.status === "TimedOut") {
        es.close();
        onEnd();
      }
    } catch {
      // SSE 数据解析失败，静默忽略
    }
  };

  es.onerror = (e: Event) => {
    onError(e);
    es.close();
  };

  return es;
}

// ==================== 常量 ====================

/** 配置格式选项 */
export const FORMAT_OPTIONS = [
  { label: "JSON", value: "Json" },
  { label: "XML", value: "Xml" },
] as const;

/** 平台选项 */
export const PLATFORM_OPTIONS = [
  { label: "控制台 (Console)", value: "Console" },
  { label: "Windows 服务", value: "WindowsService" },
  { label: "Linux systemd", value: "LinuxSystemd" },
  { label: "WinForms 桌面", value: "WinForm" },
] as const;

/** SKU 选项 */
export const SKU_OPTIONS = [
  { label: "二进制 (免编译exe)", value: "Binary" },
  { label: "源码 (含构建脚本)", value: "Source" },
] as const;

/** 运行时标识符选项 */
export const RID_OPTIONS = [
  { label: "Windows x64", value: "win-x64" },
  { label: "Windows x86", value: "win-x86" },
  { label: "Linux x64", value: "linux-x64" },
  { label: "Linux ARM64", value: "linux-arm64" },
  { label: "Linux musl x64 (Alpine)", value: "linux-musl-x64" },
  { label: "macOS x64", value: "osx-x64" },
  { label: "macOS ARM64 (Apple Silicon)", value: "osx-arm64" },
] as const;

/** Runner 数据存储选项 */
export const DATA_STORAGE_OPTIONS = [
  { label: "SQLite 本地库", value: "Sqlite" },
  { label: "MySQL", value: "MySql" },
  { label: "SQL Server", value: "SqlServer" },
  { label: "PostgreSQL", value: "PostgreSQL" },
  { label: "Oracle", value: "Oracle" },
  { label: "不落库", value: "None" },
] as const;

/** DataSync 远端目标库选项 */
export const REMOTE_TARGET_OPTIONS = DATA_STORAGE_OPTIONS.filter(option => option.value !== "None");

/** 任务状态显示映射 */
export const JOB_STATUS_MAP: Record<JobStatus, { color: string; text: string }> = {
  Queued: { color: "default", text: "排队中" },
  Running: { color: "processing", text: "生成中" },
  Succeeded: { color: "success", text: "成功" },
  Failed: { color: "error", text: "失败" },
  Cancelled: { color: "default", text: "已取消" },
  TimedOut: { color: "warning", text: "超时" },
};

/** 终态（不再变化的状态） */
export const TERMINAL_STATUSES: JobStatus[] = ["Succeeded", "Failed", "Cancelled", "TimedOut"];
