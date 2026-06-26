import outsideLayout from "./outsideLayout";
import basic from "./basic";
import type { RouteRecordRaw } from "vue-router";

// 首页路由 - 静态注册，确保始终可访问
const welcomeRoute: RouteRecordRaw = {
  path: "/dashboard/welcome",
  name: "dashboard-welcome",
  component: () => import("@/views/dashboard/welcome/index.vue"),
  meta: {
    title: "routes.dashboard.workbench",
    icon: "ant-design:home-filled",
  },
};

export const rootRoute: RouteRecordRaw = {
  path: "/",
  name: "Layout",
  redirect: "/dashboard/welcome",
  component: () => import("@/layout/index.vue"),
  meta: {
    title: "根路由",
  },
  children: [welcomeRoute],
};

export const basicRoutes: Array<RouteRecordRaw> = [
  rootRoute,
  // Layout之外的路由
  ...outsideLayout,
  // 基础路由
  ...basic,
];
