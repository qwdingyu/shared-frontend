/**
 * Hooks 模块入口
 * 导出所有共享 Hooks
 */

// 从子目录导出
export * from "./core";
export * from "./event";
export * from "./functions";
export * from "./useModal";

// 直接导出各 Hook
export * from "./useAttrs";
export * from "./useBattery";
export * from "./useDomWidth";
export * from "./useEventbus";
export * from "./useI18n";
export * from "./useOnline";
export * from "./useSortable";
export * from "./useTime";
// useWindowSizeFn 已在 ./event 中导出，此处移除重复
// useX6 保留为直接文件导入：@antv/x6 (483KB) 是重型依赖，按需引入
// 使用方式：import { useX6 } from '@/hooks/useX6'（直接引用文件路径）
import './useX6'

// 配额检查 Hook
export * from "./useQuotaCheck";

// 兼容 preserveModules 目录导入：确保该模块作为目录时有 index.js 落盘
export const __hooksIndexMarker = true
