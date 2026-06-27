/**
 * @usethink/shared-frontend
 * ZLDebug 前端共享框架入口
 */

// 框架入口
export { default as TFramework } from './framework'

// 强制保留 utils/browser-type 输出文件，避免 preserveModules 按目录导入时缺失
import './utils/browser-type'

// 工具函数
export * from './utils'

// Hooks
export * from './hooks'

// 组件
export * from './components'

// API 相关
export * from './api'

// 类型定义
export * from './types'

// 常量
export * from './constants'

// 枚举
export * from './enums'

// 国际化
export * from './locales'

// 权限控制
export * from './permission'

// 插件配置
export * from './plugins'

// 路由配置
export * from './router'

// 兼容 preserveModules 目录导入：确保该模块作为目录时有 index.js 落盘
export const __srcIndexMarker = true
