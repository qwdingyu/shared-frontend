export { default as DynamicTable } from './src/dynamic-table.vue'

export * from './src/types/'
export * from './src/hooks/'
export * from './src/dynamic-table'

// 兼容 preserveModules 目录导入：确保该模块作为目录时有 index.js 落盘
export const __dynamic_tableIndexMarker = true
