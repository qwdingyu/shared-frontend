export { default as IconPicker } from './src/IconPicker.vue'
export { default as SvgIcon } from './src/SvgIcon.vue'
export { default as Icon } from './Icon.vue'
export { default as IconFont } from './src/icon-font'

export * from './src/props'

export { setupIcons } from './src/icons.data'

// 确保该入口模块在 preserveModules 输出中落盘，避免消费方把目录当成文件导入
export const __iconIndexMarker = true
