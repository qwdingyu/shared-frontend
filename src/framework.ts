import type { App } from 'vue'
import type { Router } from 'vue-router'
import type { Pinia } from 'pinia'

import { setupAssets } from '@/plugins/assets'
import { setupAntd } from '@/plugins/antd'
import { setupGlobalMethods } from '@/plugins/globalMethods'
import { setupStore } from '@/store'
import { router, setupRouter } from '@/router'

export interface FrameworkOptions {
  router?: Router
  pinia?: Pinia
}

/**
 * ZLDebug 前端框架入口
 *
 * 自动注册：资源、组件库、状态管理、路由、权限、国际化、通用方法。
 * 消费方只需 `app.use(TFramework)` 即可获得完整默认实现；
 * 如需定制，可通过 options 注入自定义 router / pinia。
 */
export const TFramework = {
  install(app: App, options: FrameworkOptions = {}) {
    // 1. 注册全局资源与样式
    setupAssets()

    // 2. 注册 Ant Design Vue 基础组件
    setupAntd(app)

    // 3. 注册状态管理（必须在 permission / layout 等依赖 store 的模块之前）
    if (options.pinia) {
      app.use(options.pinia)
    } else {
      setupStore(app)
    }

    // 4. 注册路由与守卫
    if (options.router) {
      app.use(options.router)
    } else {
      setupRouter(app)
    }

    // 5. 注册全局方法、权限指令等（此时 store 已就绪）
    setupGlobalMethods(app)
  },
}

export default TFramework
