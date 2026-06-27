/**
 * 常量模块入口
 */
export * from "./env";

// 兼容 preserveModules 目录导入：确保该模块作为目录时有 index.js 落盘
export const __constantsIndexMarker = true
