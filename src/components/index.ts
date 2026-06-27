/**
 * 组件模块入口
 * 导出所有共享组件
 */

// 基础组件
export * from "./basic";

// 核心组件
export * from "./core";

// 业务组件
export * from "./business";

// 兼容 preserveModules 目录导入：确保该模块作为目录时有 index.js 落盘
export const __componentsIndexMarker = true
