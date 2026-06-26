import { http } from "@/api/http";
import { normalizeList, normalizePage, type ListLikeResponse } from "@/api/response";
import type { DeviceTypeOption } from "@/enums/deviceEnum";

type ListResponse<T> = ListLikeResponse<T>;
const toList = normalizeList;
const toPage = normalizePage;

/**
 * 创建类请求必须剥离客户端主键，避免把复制/回滚上下文中的 id 透传到后端。
 * 说明：
 * - 后端当前已做 Id=0 兜底，但前端仍需自我约束，避免跨端演进时再次引入主键冲突。
 * - 仅用于 Create 场景，Update 场景保留 id。
 */
function stripIdForCreate<T extends { id?: unknown }>(payload: T): Omit<T, "id"> {
  const { id: _ignored, ...rest } = payload;
  return rest;
}

/**
 * IotDevice 统一设备 DTO
 * 对应 iot_device 表 (test 数据库)
 */
export interface IotDeviceDto {
  id?: number;
  code: string;
  company_id: string;
  plant_id: string;
  line: string;
  region_no?: string;
  station_no: string;
  device_name: string;
  device_type: string;
  address: string;
  port: number;
  extra_config?: string;
  sample_interval: number;
  time_out: number;
  purpose?: number;
  driver_id?: string;
  status: string;
  is_active: boolean;
  /** 关联的仿真实例 Id；存在时表示该设备由虚拟 PLC/设备绑定而来，可走“切换真实设备”向导 */
  sim_instance_id?: string;
  remark?: string;
  create_by?: number;
  create_time?: string;
  update_by?: number;
  update_time?: string;
  auto_create_default_tag?: boolean;
}

/**
 * IotTag 统一标签 DTO
 * 对应 iot_tag 表 (test 数据库)
 */
export interface IotTagDto {
  id?: number;
  biz_tag_name: string;
  bizTagName?: string;
  tagName?: string;
  device_id?: number;
  group_id?: number;
  tag_name?: string;
  data_type: string;
  data_size?: number;
  address: string;
  data_source?: string;
  pid?: string;
  exe_order?: number;
  list_order?: number;
  tag_type?: string;
  set_type?: string;
  preset?: string;
  biz_mode?: string; // 业务模式: BG(后台采集)/BGI/BS/BSI/E(事件触发)
  info_type?: string; // 信息类型: PF(工艺参数)/QTY(产量)/STA(状态)/ALM(告警)/PER(性能)/PLAN(计划)
  tag_id?: string;
  step?: number;
  pstep?: number;
  is_active: boolean;
  archive?: number;
  scale_factor?: number; // 乘数
  offset?: number; // 偏移量
  remark?: string;
  description?: string;
  create_by?: number;
  create_time?: string;
  update_by?: number;
  update_time?: string;
}

export interface IotDeviceStatusDto {
  deviceId: number;
  deviceCode: string;
  status: string;
  isOnline: boolean;
  connectedTags: number;
}

export interface IotTagValueDto {
  tagName: string;
  address: string;
  value: unknown;
  quality: string;
  timestamp: string;
}

export interface CloneIotDeviceRequest {
  sourceDeviceId: number;
  newCode: string;
  newName?: string;
}

export interface CloneIotDeviceResult {
  deviceId: number;
  tagCount: number;
}

export interface BatchCloneIotDeviceRequest {
  items: CloneIotDeviceRequest[];
}

export interface BatchCloneIotDeviceResult {
  total: number;
  successCount: number;
  failedCount: number;
  success: Array<{
    sourceDeviceId: number;
    deviceId: number;
    newCode: string;
    tagCount: number;
  }>;
  failed: Array<{
    sourceDeviceId: number;
    newCode: string;
    reason: string;
  }>;
}

export interface BatchCloneIotDevicePrecheckResult {
  total: number;
  successCount: number;
  failedCount: number;
  success: Array<{
    sourceDeviceId: number;
    newCode: string;
    sourceTagCount: number;
  }>;
  failed: Array<{
    sourceDeviceId: number;
    newCode: string;
    reason: string;
  }>;
}

// ========== 设备 API ==========

/**
 * 获取所有统一设备
 */
export function getIotDeviceList() {
  return http.get<ListResponse<IotDeviceDto>>("/IotDevice/GetAll").then(toList);
}

/**
 * 根据 ID 获取设备
 */
export function getIotDeviceById(id: string) {
  return http.get<IotDeviceDto>("/IotDevice/GetById", { id });
}

/**
 * 根据 Code 获取设备
 */
export function getIotDeviceByCode(code: string) {
  return http.get<IotDeviceDto>("/IotDevice/GetByCode", { code });
}

/**
 * 获取支持的设备类型列表
 * 两个后端（Host 和 TMom.Api）都提供 /api/DeviceTypes 端点
 * web -> TMom.Api (7001), web_mini -> Host (5001)
 */
export function getDeviceTypes() {
  return http.get<DeviceTypeOption[]>("/DeviceTypes");
}

/**
 * 分页获取设备
 */
export function getIotDevicePage(pageIndex: number = 1, pageSize: number = 20) {
  return http.get<ListResponse<IotDeviceDto>>(
    "/IotDevice/GetPage",
    {
      pageIndex,
      pageSize,
    },
  ).then(toPage);
}

/**
 * 按设备类型获取设备
 */
export function getIotDeviceByType(device_type: string) {
  return http.get<ListResponse<IotDeviceDto>>("/IotDevice/GetByDeviceType", {
    device_type,
  }).then(toList);
}

/**
 * 获取激活的设备
 */
export function getActiveIotDevices() {
  return http.get<ListResponse<IotDeviceDto>>("/IotDevice/GetActiveDevices").then(toList);
}

/**
 * 新增设备
 */
export function addIotDevice(device: Partial<IotDeviceDto>) {
  return http.post("/IotDevice/Add", stripIdForCreate(device));
}

/**
 * 更新设备
 */
export function updateIotDevice(device: IotDeviceDto) {
  return http.post("/IotDevice/Update", device);
}

/**
 * 删除设备
 */
export function deleteIotDevice(id: number) {
  return http.post(`/IotDevice/Delete?id=${id}`, {});
}

/**
 * 一键克隆设备（包含标签）
 */
export function cloneIotDevice(request: CloneIotDeviceRequest) {
  return http.post("/IotDevice/CloneDevice", request) as Promise<CloneIotDeviceResult>;
}

/**
 * 批量克隆设备（包含标签）
 */
export function batchCloneIotDevices(request: BatchCloneIotDeviceRequest) {
  return http.post("/IotDevice/BatchCloneDevices", request) as Promise<BatchCloneIotDeviceResult>;
}

/**
 * 批量克隆预检（不落库）
 */
export function precheckBatchCloneIotDevices(request: BatchCloneIotDeviceRequest) {
  return http.post("/IotDevice/BatchCloneDevicesPrecheck", request) as Promise<BatchCloneIotDevicePrecheckResult>;
}

/**
 * 导出设备配置归档 ZIP（设备本体 + 点表 + 触发规则）
 * 用于设备调试交付、跨环境迁移、离线归档
 */
export function exportDeviceBundle(deviceId: number | string) {
  return http.get<Blob>(
    `/IotDevice/ExportBundle?deviceId=${deviceId}`,
    null,
    { responseType: 'blob' } as any,
  )
}

// ========== 标签 API ==========

/**
 * 根据设备ID获取标签列表
 */
export function getIotTagsByDeviceId(deviceId: string | number) {
  return http
    .get<ListResponse<IotTagDto>>("/IotDevice/GetTagsByDeviceId", { deviceId })
    .then(toList);
}

/**
 * 根据业务标签名获取标签
 */
export function getIotTagByBizTagName(bizTagName: string) {
  return http.get<IotTagDto>("/IotDevice/GetTagByBizTagName", { bizTagName });
}

/**
 * 分页获取标签
 */
export function getIotTagsPage(
  deviceId?: string,
  pageIndex: number = 1,
  pageSize: number = 20,
) {
  return http.get<ListResponse<IotTagDto>>(
    "/IotDevice/GetTagsPage",
    {
      deviceId,
      pageIndex,
      pageSize,
    },
  ).then(toPage);
}

/**
 * 新增标签
 */
export function addIotTag(tag: Partial<IotTagDto>) {
  return http.post("/IotDevice/AddTag", stripIdForCreate(tag));
}

/**
 * 更新标签
 */
export function updateIotTag(tag: IotTagDto) {
  return http.post("/IotDevice/UpdateTag", tag);
}

/**
 * 删除标签
 */
export function deleteIotTag(id: number) {
  return http.post(`/IotDevice/DeleteTag?id=${id}`, {});
}

/**
 * 批量新增标签
 */
export function batchAddIotTags(tags: Partial<IotTagDto>[]) {
  return http.post("/IotDevice/BatchAddTags", tags.map(stripIdForCreate));
}

/**
 * 一次创建向导结束，提交设备+标签（原子操作，对应后端 /AddWithTags）
 * 标签数组中的 device_id 可为空或占位值，后端会自动填充
 */
export function createDeviceWithTags(data: Record<string, unknown>) {
  return http.post("/IotDevice/AddWithTags", data);
}

/**
 * 批量更新标签
 */
export function batchUpdateIotTags(tags: IotTagDto[]) {
  return http.post("/IotDevice/BatchUpdateTags", tags);
}

/**
 * 批量删除标签
 */
export function batchDeleteIotTags(ids: number[]) {
  return http.post("/IotDevice/BatchDeleteTags", ids);
}

// ========== Exe 执行配置 API ==========

/**
 * IotExe 执行配置 DTO
 * 对应 iot_exe 表
 */
export interface IotExeDto {
  id?: number;
  tag_id?: string;
  device_id?: number;
  device_name?: string;
  tag_name?: string;
  biz_code?: string;
  exe_order: number;
  judge_type: string;
  judge_exp?: string;
  exe_type: string;
  script?: string;
  enable: number;
  remark?: string;
  created_by?: number;
  created_time?: string;
  updated_by?: number;
  updated_time?: string;
}

/**
 * 获取所有 Exe 执行配置
 */
export function getAllIotExes() {
  return http.get("/IotDevice/GetAllExes");
}

/**
 * 根据ID获取 Exe 执行配置
 */
export function getIotExeById(id: number) {
  return http.get(`/IotDevice/GetExeById?id=${id}`);
}

/**
 * 根据 tag_id 获取 Exe 执行配置列表
 */
export function getIotExesByTagId(tagId: string) {
  return http.get(
    `/IotDevice/GetExesByTagId?tagId=${encodeURIComponent(tagId)}`,
  );
}

/**
 * 根据 biz_code 获取 Exe 执行配置列表
 */
export function getIotExesByBizCode(bizCode: string) {
  return http.get(
    `/IotDevice/GetExesByBizCode?bizCode=${encodeURIComponent(bizCode)}`,
  );
}

/**
 * 分页查询 Exe 执行配置
 */
export function getIotExesPage(
  pageIndex: number = 1,
  pageSize: number = 20,
  tagId?: string,
  bizCode?: string,
  deviceId?: string,
) {
  let url = `/IotDevice/GetExesPage?pageIndex=${pageIndex}&pageSize=${pageSize}`;
  if (tagId) url += `&tagId=${encodeURIComponent(tagId)}`;
  if (bizCode) url += `&bizCode=${encodeURIComponent(bizCode)}`;
  if (deviceId) url += `&deviceId=${encodeURIComponent(deviceId)}`;
  return http.get<ListResponse<IotExeDto>>(url).then(toPage);
}

/**
 * 添加 Exe 执行配置
 */
export function addIotExe(exe: IotExeDto) {
  return http.post("/IotDevice/AddExe", stripIdForCreate(exe));
}

/**
 * 更新 Exe 执行配置
 */
export function updateIotExe(exe: IotExeDto) {
  return http.post("/IotDevice/UpdateExe", exe);
}

/**
 * 删除 Exe 执行配置
 */
export function deleteIotExe(id: number) {
  return http.post(`/IotDevice/DeleteExe?id=${id}`, {});
}

// ========== Exe 测试 API ==========

/**
 * Exe 变量信息 DTO
 */
export interface ExeVariableInfo {
  name: string;
  type: string;
  format: string;
  position: number;
}

/**
 * Exe 变量解析结果 DTO
 */
export interface ExeVariableParseResult {
  Success: boolean;
  ErrorMessage?: string;
  Variables: ExeVariableInfo[];
  OriginalScript?: string;
}

/**
 * Exe 测试请求 DTO
 */
export interface ExeTestRequest {
  exeId: number;
  parameters: Record<string, string>;
}

/**
 * Exe 测试结果 DTO
 */
export interface ExeTestResult {
  success: boolean;
  errorMessage?: string;
  executedScript?: string;
  exeTypeDescription?: string;
  elapsedMs: number;
  resultData?: Record<string, any>[];
  affectedRows: number;
}

/**
 * 解析 Exe 配置脚本中的变量
 */
export function parseExeVariables(exeId: number) {
  return http.get(`/IotDevice/ParseExeVariables?exeId=${exeId}`);
}

/**
 * 测试执行 Exe 配置
 * @param request 测试请求参数
 * @param timeoutSeconds 超时秒数（默认60秒）
 */
export function testExe(request: ExeTestRequest, timeoutSeconds = 60) {
  return http.post("/IotDevice/TestExe", request, { timeout: timeoutSeconds * 1000 });
}

/**
 * 快速测试脚本请求 DTO（无需保存 Exe）
 */
export interface TestScriptRequest {
  script: string;
  exeType?: string;
  parameters?: Record<string, string>;
}

/**
 * 快速测试脚本（无需保存 Exe，直接传入脚本内容执行）
 */
export function testScript(request: TestScriptRequest, timeoutSeconds = 60) {
  return http.post("/IotDevice/TestScript", request, { timeout: timeoutSeconds * 1000 });
}

// ========== 设备运行时监控 API ==========

/**
 * 获取运行时设备列表
 */
export function getRuntimeIotDeviceList() {
  return http.get<ListResponse<IotDeviceDto>>("/IotDevice/GetAllDevices").then(toList);
}

/**
 * 获取运行时设备状态
 */
export function getRuntimeIotDeviceStatus(deviceId: number) {
  return http.get<IotDeviceStatusDto>("/IotDevice/GetDeviceStatus", {
    deviceId,
  });
}

/**
 * 获取运行时设备标签列表
 */
export function getRuntimeIotDeviceTags(deviceId: number) {
  return http
    .get<ListResponse<IotTagDto>>("/IotDevice/GetDeviceTags", { deviceId })
    .then(toList);
}

/**
 * 读取标签值
 */
export interface ReadTagResult {
  success: boolean;
  tagName: string;
  value: unknown;
}

export function readIotTag(deviceId: number, tagName: string) {
  return http.get<ReadTagResult>("/IotDevice/ReadTag", { deviceId, tagName });
}

/**
 * 写入标签值
 */
export function writeIotTag(deviceId: number, tagName: string, value: unknown) {
  return http.post("/IotDevice/WriteTag", { deviceId, tagName, value });
}

/**
 * 批量写入标签值（复用 WriteTagRequest，数据源模拟器使用）
 * 接受 WriteTagRequest 数组，每个元素包含 deviceId + tagName + value
 */
export function batchWriteTags(tags: Array<{ deviceId: number; tagName: string; value: unknown }>) {
  return http.post("/IotDevice/BatchWriteTags", tags);
}

// ========== 设备运行时控制 ==========

/**
 * 启动设备
 * @param deviceId 设备ID（从 query string 传递，非 body）
 */
export function startDevice(deviceId: number) {
  return http.post(`/IotDevice/StartDevice?deviceId=${deviceId}`, {});
}

/**
 * 停止设备
 * @param deviceId 设备ID（从 query string 传递，非 body）
 */
export function stopDevice(deviceId: number) {
  return http.post(`/IotDevice/StopDevice?deviceId=${deviceId}`, {});
}

/**
 * 启动所有设备
 */
export function startAllDevices() {
  return http.post("/IotDevice/StartAll", {});
}

/**
 * 停止所有设备
 */
export function stopAllDevices() {
  return http.post("/IotDevice/StopAll", {});
}

// ========== 批量操作 API ==========

/**
 * 批量操作结果
 */
export interface BatchOperationResult {
  success?: number[];
  failed?: BatchOperationError[];
  successIds?: number[];
  failedIds?: number[];
  totalCount?: number;
  successCount?: number;
  failedCount?: number;
  data?: BatchOperationResult;
  Data?: BatchOperationResult;
  Success?: number[];
  Failed?: BatchOperationError[];
  SuccessIds?: number[];
  FailedIds?: number[];
  TotalCount?: number;
  SuccessCount?: number;
  FailedCount?: number;
}

/**
 * 批量操作错误信息
 */
export interface BatchOperationError {
  deviceId: number;
  reason: string;
  DeviceId?: number;
  Reason?: string;
}

/**
 * 批量启动设备
 */
export function batchStartDevices(deviceIds: number[]) {
  return http.post("/IotDevice/BatchStart", { deviceIds }) as Promise<BatchOperationResult>;
}

/**
 * 批量停止设备
 */
export function batchStopDevices(deviceIds: number[]) {
  return http.post("/IotDevice/BatchStop", { deviceIds }) as Promise<BatchOperationResult>;
}

/**
 * 批量删除设备
 */
export function batchDeleteDevices(deviceIds: number[]) {
  return http.post("/IotDevice/BatchDelete", { deviceIds }) as Promise<BatchOperationResult>;
}

/**
 * 批量更新设备启用状态
 */
export function batchUpdateDeviceStatus(
  deviceIds: number[],
  isActive: boolean,
) {
  return http.post("/IotDevice/BatchUpdateStatus", {
    deviceIds,
    isActive,
  }) as Promise<BatchOperationResult>;
}

// ========== 设备连接测试 API ==========

/**
 * 设备连接测试请求
 */
export interface DeviceConnectionTestRequest {
  device_type: string;
  address: string;
  port: number;
  timeoutSeconds?: number;
  extraConfig?: string;
}

/**
 * 设备连接测试结果（支持两阶段测试架构）
 */
export interface DeviceConnectionTestResult {
  success: boolean;
  errorMessage?: string;
  latencyMs: number;
  /** 第一阶段：TCP 网络是否可达 */
  tcpReachable: boolean;
  /** 第一阶段：TCP 探测延迟（毫秒） */
  tcpLatencyMs: number;
  /** 第二阶段：协议级连接是否成功 */
  protocolConnected: boolean;
  /** 第二阶段：协议测试延迟（毫秒） */
  protocolLatencyMs: number;
  // 兼容旧版 PascalCase 字段
  Success?: boolean;
  ErrorMessage?: string;
  LatencyMs?: number;
  TcpReachable?: boolean;
  TcpLatencyMs?: number;
  ProtocolConnected?: boolean;
  ProtocolLatencyMs?: number;
}

/**
 * 设备Ping结果
 */
export interface DevicePingResult {
  success: boolean;
  errorMessage?: string;
  latencyMs: number;
  Success?: boolean;
  ErrorMessage?: string;
  LatencyMs?: number;
}

/**
 * 测试设备连接（协议级测试）
 */
export function testDeviceConnection(request: DeviceConnectionTestRequest) {
  return http.post("/IotDevice/TestConnection", {
    DeviceType: request.device_type,
    Address: request.address,
    Port: request.port,
    TimeoutSeconds: request.timeoutSeconds || 5,
    ExtraConfig: request.extraConfig,
  }, { showSuccessMsg: false }) as Promise<DeviceConnectionTestResult>;
}

/**
 * Ping设备网络可达性
 */
export function pingDevice(
  address: string,
  port: number,
  timeoutMs: number = 5000,
) {
  return http.get("/IotDevice/PingDevice", {
    address,
    port,
    timeoutMs,
  }) as Promise<DevicePingResult>;
}

// ============================================================
// 执行日志相关类型和接口
// ============================================================

/**
 * 执行日志 DTO
 */
export interface ExeExecLogDto {
  id: number;
  deviceId: string;
  deviceCode: string;
  deviceName: string;
  tagId: string;
  tagName: string;
  bizCode: string;
  exeType: string;
  script: string;
  judgeType: string;
  judgeExp: string;
  exeOrder: number;
  enable: number;
  remark: string;
  createTime: string;
  result: string;
  durationMs: number | null;
  traceId: string;
  triggerSource: string;
  operatorName: string;
  errorMessage?: string;
  affectedRows?: number;
  currentValue?: string;
  previousValue?: string;
}

/**
 * 分页获取执行日志
 * @param pageIndex 页码
 * @param pageSize 每页数量
 * @param deviceId 设备ID（可选）
 * @param tagId 标签ID（可选）
 * @param bizCode 业务编码（可选）
 */
export function getExeExecLogs(
  pageIndex: number = 1,
  pageSize: number = 20,
  deviceId?: string,
  tagId?: string,
  bizCode?: string,
  startTime?: string,
  endTime?: string,
  executionSuccess?: boolean,
) {
  return http
    .get<ListResponse<ExeExecLogDto>>("/IotDevice/GetExeExecLogs", {
      pageIndex,
      pageSize,
      deviceId,
      tagId,
      bizCode,
      startTime,
      endTime,
      executionSuccess,
    })
    .then(toPage);
}

// ============================================================
// 设备模板相关接口
// ============================================================

/**
 * 设备模板 DTO
 */
export interface DeviceTemplateDto {
  id?: number;
  name: string;
  description?: string;
  deviceType: string;
  defaultPort: number;
  defaultSampleInterval: number;
  defaultTimeout: number;
  createdTime?: string;
}

/**
 * 获取所有模板列表
 */
export function getDeviceTemplates() {
  return http
    .get<ListResponse<DeviceTemplateDto>>("/IotDevice/GetTemplates")
    .then(toList);
}

/**
 * 获取模板详情
 */
export function getTemplateById(id: number) {
  return http.get<DeviceTemplateDto & { tagTemplates?: string; extraConfig?: string }>(`/IotDevice/GetTemplateById?id=${id}`);
}

/**
 * 保存设备为模板请求
 */
export interface SaveTemplateRequest {
  deviceId: number;
  templateName?: string;
  description?: string;
}

/**
 * 保存设备为模板
 */
export function saveAsTemplate(request: SaveTemplateRequest) {
  return http.post("/IotDevice/SaveAsTemplate", request);
}

/**
 * 从模板创建设备请求
 */
export interface CreateFromTemplateRequest {
  templateId: number;
  code: string;
  name?: string;
  ipAddress?: string;
  port?: number;
}

/**
 * 从模板创建设备
 */
export function addFromTemplate(request: CreateFromTemplateRequest) {
  return http.post("/IotDevice/AddFromTemplate", request);
}

/**
 * 删除模板
 */
export function deleteTemplate(id: number) {
  return http.post(`/IotDevice/DeleteTemplate?id=${id}`, {});
}

// ========== 仿真引擎 API ==========

/** 仿真标签配置 */
export interface SimulationTagConfig {
  tagName: string
  mode?: string
  updateIntervalMs?: number
  value?: number
  rampStart?: number
  rampEnd?: number
  rampPeriodMs?: number
  sineAmplitude?: number
  sineOffset?: number
  sinePeriodMs?: number
  randomMin?: number
  randomMax?: number
  stepValues?: number[]
  stepIntervalMs?: number
  sequenceValues?: number[]
  sequenceIntervalMs?: number
}

/** 仿真状态 */
export interface SimulationStatus {
  isRunning: boolean
  configuredTags: number
  activeScenario: string
  tags: Array<{
    tagName: string
    mode: string
    currentValue: number
    updateCount: number
    isPaused: boolean
  }>
}

/**
 * 启动仿真
 */
export function startSimulation(tags: SimulationTagConfig[]) {
  return http.post("/IotDevice/Simulation/Start", { tags });
}

/**
 * 停止仿真
 */
export function stopSimulation() {
  return http.post("/IotDevice/Simulation/Stop", {});
}

/**
 * 获取仿真状态
 */
export function getSimulationStatus() {
  return http.get<SimulationStatus>("/IotDevice/Simulation/Status");
}

/**
 * 加载仿真场景（从 JSON 字符串）
 */
export function loadSimulationScenario(jsonContent: string) {
  return http.post("/IotDevice/Simulation/Scenario", { jsonContent });
}
