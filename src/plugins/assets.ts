/**
 * 资源初始化插件
 * 注意：UnoCSS / SVG 图标等初始化由使用方项目负责，
 * 此处仅保留空壳，避免 shared-frontend 作为库时强依赖构建期插件。
 */

export const setupAssets = () => {
  // 由消费方自行按需初始化：
  // - import 'uno.css'
  // - import 'virtual:svg-icons-register'
  // - import '@/styles/index.less'
  return {}
}
