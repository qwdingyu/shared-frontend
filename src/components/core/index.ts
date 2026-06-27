/**
 * 核心组件入口
 * 导出所有核心组件
 */

// 核心组件子模块导出
export * from "./draggable-modal";
export * from "./drawer";
export * from "./dynamic-table";
export * from "./Modal";
export * from "./schema-form";

// 兼容 preserveModules 目录导入：确保该模块作为目录时有 index.js 落盘
export const __coreIndexMarker = true
