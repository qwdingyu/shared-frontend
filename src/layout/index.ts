/**
 * 布局组件入口
 */
export { default as Layout } from "./index.vue";

// 兼容 preserveModules 目录导入：确保该模块作为目录时有 index.js 落盘
export const __layoutIndexMarker = true
