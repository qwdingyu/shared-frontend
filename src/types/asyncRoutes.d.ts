// 异步路由模块类型声明
// 此模块由各项目本地提供 (web/src/router/asyncModules 或 web_mini/src/router/asyncModules)
declare module "@tmom/asyncRoutes" {
  type ImportVueFileType = typeof import("*.vue");
  type ImportVueFileFnType = () => Promise<ImportVueFileType>;

  export const asyncRoutes: Record<string, ImportVueFileFnType>;
}
