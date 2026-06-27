export { createContextMenu, destroyContextMenu } from './src/createContextMenu'

export * from './src/typing'

// 兼容 preserveModules 目录导入：确保该模块作为目录时有 index.js 落盘
export const __context_menuIndexMarker = true
