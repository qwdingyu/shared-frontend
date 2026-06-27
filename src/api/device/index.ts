/**
 * Device API 入口
 */
export * from "./alert";
export * from "./auditLog";
export * from "./iotDevice";
export * from "./DataQueryApi";
export * from "./runnerGenerate";
export * from "./tagHistory";

// 确保该入口模块在 preserveModules 输出中落盘，避免消费方把目录当成文件导入
export const __deviceIndexMarker = true
