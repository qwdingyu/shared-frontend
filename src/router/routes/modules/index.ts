import dashboard from './dashboard'
// import externaLink from './externa-link'
import account from './account'
import device from './device'

export default [...dashboard, ...account, ...device]

// 兼容 preserveModules 目录导入：确保该模块作为目录时有 index.js 落盘
export const __modulesIndexMarker = true
