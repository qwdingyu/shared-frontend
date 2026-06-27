import Dropdown from './src/Dropdown.vue'

export * from './src/typing'
export { Dropdown }

// 兼容 preserveModules 目录导入：确保该模块作为目录时有 index.js 落盘
export const __DropdownIndexMarker = true
