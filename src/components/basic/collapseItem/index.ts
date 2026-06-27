import CollapseItem from './index.vue'
import SettingItem from './settingItem.vue'

export { CollapseItem, SettingItem }

// 兼容 preserveModules 目录导入：确保该模块作为目录时有 index.js 落盘
export const __collapseItemIndexMarker = true
