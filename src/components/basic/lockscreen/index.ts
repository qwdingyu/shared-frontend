import LockScreen from './index.vue'

export default LockScreen
export { LockScreen }

// 兼容 preserveModules 目录导入：确保该模块作为目录时有 index.js 落盘
export const __lockscreenIndexMarker = true

// 主动引用 LockScreen，防止 Rollup 在 preserveModules 下把“仅用于重导出”的绑定整段树摇掉
LockScreen
