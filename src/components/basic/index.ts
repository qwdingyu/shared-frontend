/**
 * 基础组件入口
 * 导出所有共享组件
 */

// 基础组件子模块导出
export * from "./antd-x6";
export * from "./basic-arrow";
export * from "./basic-help";
export * from "./button";
export * from "./cardList";
export * from "./check-box";
export * from "./CodeEditor";
export * from "./collapseItem";
export * from "./context-menu";
export * from "./countTo";
export * from "./cropper";
export * from "./customUpload";
export * from "./detail";
export * from "./Dropdown";
export * from "./excel";
export * from "./icon";
export * from "./iframe-page";
export * from "./locale-picker";
export * from "./lockscreen";
export * from "./pro-config-provider";
export * from "./progress";
export * from "./result";
export * from "./scale-screen";
export * from "./split-panel";
export * from "./tinymce";
export * from "./title-i18n";

// 兼容 preserveModules 目录导入：确保该模块作为目录时有 index.js 落盘
export const __basicIndexMarker = true
