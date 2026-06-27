/**
 * Base API 入口
 */
export * from "./bom";
export * from "./calendar";
export * from "./customer";
export * from "./failureSymptom";
export * from "./failureType";
export * from "./materialReplace";
export * from "./partGroup";
export * from "./partMaterial";
export * from "./repairMethod";
export * from "./skill";
export * from "./supplier";

// 确保该入口模块在 preserveModules 输出中落盘，避免消费方把目录当成文件导入
export const __baseApiIndexMarker = true
