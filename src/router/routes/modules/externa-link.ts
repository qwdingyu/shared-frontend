import { RouterView, type RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: 'https://gitee.com/UseThink/IotWeb',
    name: 'https://gitee.com/UseThink/IotWeb',
    component: RouterView,
    meta: {
      title: '代码仓库',
      icon: 'ant-design:link-outlined',
      isExt: true,
      extOpenMode: 1,
    },
  },
]

export default routes
