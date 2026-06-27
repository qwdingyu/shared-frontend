/**
 * Core Hooks 入口
 */
export * from "./useContext";

// 兼容 preserveModules 目录导入：确保该模块作为目录时有 index.js 落盘
export const __coreIndexMarker = true
