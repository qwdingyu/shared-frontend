import type { App } from 'vue'
// import useFormModal from '@/hooks/useFormModal'
// import useModal from '@/hooks/useModal/index';
import permission from '@/permission'

// echarts 改为懒加载 Symbol 键，由使用方按需加载
export const EchartsLoaderSymbol = Symbol('echartsLoader')

/**
 * 注册全局方法
 * @param app
 */
export function setupGlobalMethods(app: App) {
  app.use(permission)

  // echarts 改为 provide 异步加载器，避免启动时同步加载 ~1 MB
  app.provide(EchartsLoaderSymbol, async () => {
    const echarts = await import('echarts')
    return echarts
  })

  // app.use(useFormModal)
  // app.use(useModal);
  // 全局挂载Reflect反射对象,以便在vue模板中使用
  app.config.globalProperties.Reflect = Reflect
}
