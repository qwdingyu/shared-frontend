export { setupAntd } from './antd'
export { setupAssets } from './assets'
export { setupGlobalMethods } from './globalMethods'

// 确保该入口模块在 preserveModules 输出中落盘，避免消费方把目录当成文件导入
export const __pluginsEntryMarker = true

// 兼容 preserveModules 目录导入：确保该模块作为目录时有 index.js 落盘
export const __pluginsIndexMarker = true
