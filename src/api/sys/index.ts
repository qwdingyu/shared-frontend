/**
 * Sys API 入口
 */
export * from "./log";
export * from "./menu";
export * from "./org";
export * from "./role";
export * from "./user";

// 确保该入口模块在 preserveModules 输出中落盘，避免消费方把目录当成文件导入
export const __sysIndexMarker = true