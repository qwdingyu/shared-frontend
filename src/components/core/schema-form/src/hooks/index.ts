import type { FormState } from './useFormState'
import type { FormEvents } from './useFormEvents'
import type { FormMethods } from './useFormMethods'
import type { SchemaFormEmitFn } from '../schema-form'

export * from './useForm'
export * from './useFormState'
export * from './useFormContext'
export * from './useFormEvents'
export * from './useFormMethods'
export * from './useLabelWidth'
export * from './useAdvanced'

export type SchemaFormType = FormState & FormEvents & FormMethods & { emit: SchemaFormEmitFn }

// 兼容 preserveModules 目录导入：确保该模块作为目录时有 index.js 落盘
export const __hooksIndexMarker = true
