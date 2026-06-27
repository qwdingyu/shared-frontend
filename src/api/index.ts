/**
 * API 模块入口
 * 导出所有 API 相关类型和函数
 *
 * 模块分类说明：
 * - 核心 API：所有系统必须支持（device、iotSim、login、sys/user 基础功能）
 * - 可选 API：仅 TMom.Api 完整版支持（base、modeling、product、process、sys/menu-role-org）
 *
 * 使用说明：
 * - web_mini 连接 TMom.Device.Runtime.Host，仅需使用核心 API
 * - web 连接 TMom.Api，可使用全部 API
 */

export * from "./http";
export * from "./saveRefreshTime";

// Dashboard 运营看板
export * from "./dashboard";

// 响应处理工具
export * from "./response";

// ============ 核心 API 模块 ==========
// 设备管理（所有系统必须）
export * from "./device";

// PLC 仿真器（Host 特有）
export * from "./iotSim";

// 登录认证（所有系统必须）
export * from "./login";

// ============ 可选 API 模块（仅 TMom.Api 完整版） ==========
// 基础数据管理
export * from "./base";

// 建模管理（车间、产线、工位）
export * from "./modeling";

// 生产管理（锁定、工单）
export * from "./product";

// 工艺管理（工艺路线、工序）
export * from "./process";

// 系统管理（用户、菜单、角色、组织）
export * from "./sys";

// 开发工具（数据字典、代码生成）
export * from "./dev";

// 代码生成
export * from "./codeFirst";

// 数值管理
export * from "./values";

// 缓存管理
export * from "./cache";

// 确保该入口模块在 preserveModules 输出中落盘，避免消费方把目录当成文件导入
export const __apiIndexMarker = true