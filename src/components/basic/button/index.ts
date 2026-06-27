import AButton from './button.vue'

export default AButton

export const Button = AButton

export * from './button'

export { AButton }

// 兼容 preserveModules 目录导入：确保该模块作为目录时有 index.js 落盘
export const __buttonIndexMarker = true
