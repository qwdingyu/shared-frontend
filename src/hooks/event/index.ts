/**
 * Event Hooks 入口
 */
export * from "./useBreakpoint";
export * from "./useEventListener";
export * from "./useIntersectionObserver";
export * from "./useScroll";
export * from "./useScrollTo";
export * from "./useWindowSizeFn";

// 兼容 preserveModules 目录导入：确保该模块作为目录时有 index.js 落盘
export const __eventIndexMarker = true
