type ImportVueFileType = typeof import("*.vue");
type ImportVueFileFnType = () => Promise<ImportVueFileType>;

// auto load - 使用别名路径，让 vite 解析到正确的项目目录
// 注意：@ 别名在 web/web_mini 项目中指向各自的 src 目录
const modulesFiles = import.meta.glob<ImportVueFileType>("/src/views/**/*.vue");
// console.log('modulesFiles', modulesFiles);

// generate components map
export const asyncRoutes = Object.entries(modulesFiles).reduce(
  (routes, [url, importFn]) => {
    if (!/\/(views\/login|components)\//.test(url)) {
      // 路径格式: /src/views/device/iotDeviceConfig.vue -> device/iotDeviceConfig
      const path = url.replace("/src/views/", "").replace(".vue", "");
      routes[path] = importFn;
    }

    return routes;
  },
  {} as Recordable<ImportVueFileFnType>,
);

// console.log('asyncRoutes', asyncRoutes)

// 兼容 preserveModules 目录导入：确保该模块作为目录时有 index.js 落盘
export const __asyncModulesIndexMarker = true
