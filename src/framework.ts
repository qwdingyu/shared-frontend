/**
 * ZLDebug 前端共享框架
 * 提供应用框架级的能力：布局、权限、路由等
 */

// 布局组件
export { default as TLayout } from './layout/index.vue'

// 框架初始化
export const initFramework = () => {
  console.log('[TFramework] ZLDebug framework initialized')
}

// 默认导出，便于统一引用框架实例
export default {
  name: 'TFramework',
  init: initFramework,
}
