export { default as BasicDrawer } from './BasicDrawer.vue'
export { default as DrawerFooter } from './components/DrawerFooter.vue'
export * from './drawer'

// 兼容 preserveModules 目录导入：确保该模块作为目录时有 index.js 落盘
export const __drawerIndexMarker = true
