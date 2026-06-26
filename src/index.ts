/**
 * @usethink/shared-frontend
 * TMom 前端共享库入口
 */

// 工具函数
export * from "./utils";

// Hooks
export * from "./hooks";

// 组件
export * from "./components";

// API 相关
export * from "./api";

// 类型定义
export * from "./types";

// 常量
export * from "./constants";

// 枚举
export * from "./enums";

// 国际化
export * from "./locales";

// 权限控制
export * from "./permission";

// 插件配置
export * from "./plugins";

// 路由配置
export * from "./router";

// 框架入口：统一注册资源、组件库、store、router、权限、全局方法
export { TFramework, type FrameworkOptions } from "./framework";
