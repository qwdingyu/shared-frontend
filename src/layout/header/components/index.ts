export { default as Search } from './search/index.vue'
export { default as FullScreen } from './fullscreen/index.vue'
export { default as ProjectSetting } from './setting/index.vue'
export { default as LayoutBreadcrumb } from './breadcrumb/index.vue'
export { default as MsgNotice } from './msgNotice/index.vue'

// 兼容 preserveModules 目录导入：确保该模块作为目录时有 index.js 落盘
export const __componentsIndexMarker = true
