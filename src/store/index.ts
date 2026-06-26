/**
 * Store 模块入口
 * 导出所有 Pinia Store
 */

import { createPinia } from 'pinia'
import type { App } from 'vue'

// 创建基础 Pinia 实例（用于 SSR 或独立使用）
const store = createPinia()

// Store 初始化函数
export function setupStore(app: App<Element>) {
  app.use(store)
}

export { store }

// 导出所有 Store 模块
export * from './modules/keepAlive'
export * from './modules/layoutSetting'
export * from './modules/locale'
export * from './modules/lockscreen'
export * from './modules/tabsView'
export * from './modules/user'
