import type { RouteRecordRaw } from 'vue-router'

/**
 * 设备管理模块路由
 *
 * 注意：tmom 前端采用「后端动态菜单 + 前端异步组件」机制，
 * 菜单数据来自 sys_menu 表，通过 /api/SysUser/GetPermMenu 接口获取，
 * 再由 routeHelper.tsx 的 generateDynamicRoutes 动态注册路由。
 *
 * 因此这里不需要定义静态路由，只需确保：
 * 1. sys_menu 表中 ViewPath 字段值（如 "device/plcMonitor"）
 *    对应 src/views/ 下的 vue 文件路径（device/plcMonitor.vue）
 * 2. asyncRoutes（由 import.meta.glob('../../views/**\/*.vue') 自动生成）
 *    能匹配到该组件
 *
 * 如果在此文件中定义静态路由，会与后端动态菜单产生重复菜单项。
 */
const routes: Array<RouteRecordRaw> = []

export default routes
