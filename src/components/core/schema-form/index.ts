export { default as SchemaFormItem } from './src/schema-form-item.vue'
export { default as SchemaForm } from './src/schema-form.vue'

export * from './src/types/'
export * from './src/schema-form'
export * from './src/schema-form-item'
export * from './src/hooks/'
export * from './src/components/'

// 兼容 preserveModules 目录导入：确保该模块作为目录时有 index.js 落盘
export const __schema_formIndexMarker = true
