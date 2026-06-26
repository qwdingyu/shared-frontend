/**
 * 通用辅助函数
 * 包含对象合并、文件处理、组件安装等工具函数
 */
import { intersectionWith, isEqual, mergeWith, unionWith } from "lodash-es";
import { isArray, isObject } from "./is";
import type { App, Component, Plugin } from "vue";

/**
 * 获取文件扩展名
 * @param filename 文件名
 * @returns 文件扩展名
 */
export function getFileExtension(filename: string): string | undefined {
  return /[.]/.exec(filename) ? /[^.]+$/.exec(filename)?.[0] : undefined;
}

/**
 * 将文件文件名转为文件类型图标名称
 * @param fileName 文件名
 * @returns 图标名称
 */
export function parseMimeTypeToIconName(fileName: string): string {
  if (!fileName) {
    return "file-type-unknown";
  }
  const ext = getFileExtension(fileName)?.toLowerCase();
  if (!ext) {
    return "file-type-unknown";
  }
  if (["png", "jpg", "jpeg", "ico", "gif", "bmp", "webp"].includes(ext)) {
    return "file-type-img";
  }
  if (["markdown", "md", "txt"].includes(ext)) {
    return "file-type-txt";
  }
  if (["docx", "doc", "docm", "dot", "dotx"].includes(ext)) {
    return "file-type-docx";
  }
  if (["csv", "xls", "xlsb", "xlsm", "xlsx", "xltx"].includes(ext)) {
    return "file-type-excel";
  }
  if (ext === "pdf") {
    return "file-type-pdf";
  }
  if (["pptx", "ppt", "pptm"].includes(ext)) {
    return "file-type-ppt";
  }
  if (
    ["zip", "rar", "7z", "tar", "gz", "tgz", "tar.gz", "tar.xz"].includes(ext)
  ) {
    return "file-type-zip";
  }
  if (
    ["mp4", "avi", "wmv", "rmvb", "3gp", "mov", "m4v", "flv", "mkv"].includes(
      ext,
    )
  ) {
    return "file-type-video";
  }
  if (["mp3", "wav"].includes(ext)) {
    return "file-type-music";
  }
  if (
    [
      "vue",
      "js",
      "go",
      "java",
      "ts",
      "css",
      "html",
      "php",
      "c",
      "cpp",
      "swift",
      "kt",
    ].includes(ext)
  ) {
    return "file-type-code";
  }
  return "file-type-unknown";
}

/**
 * 字节大小格式化
 * @param bytes 字节数
 * @param decimals 小数位数，默认2
 * @returns 格式化后的字符串
 * @example
 * formatSizeUnits(1024);       // 1 KB
 * formatSizeUnits('1024');     // 1 KB
 * formatSizeUnits(1234);       // 1.21 KB
 * formatSizeUnits(1234, 3);    // 1.205 KB
 */
export function formatSizeUnits(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * 递归合并两个对象
 *
 * @param source 源对象
 * @param target 目标对象
 * @param mergeArrays 数组合并策略，默认 'replace'
 *   - 'union': 并集
 *   - 'intersection': 交集
 *   - 'concat': 连接
 *   - 'replace': 替换
 * @returns 合并后的对象
 */
export function deepMerge<
  T extends object | null | undefined,
  U extends object | null | undefined,
>(
  source: T,
  target: U,
  mergeArrays: "union" | "intersection" | "concat" | "replace" = "replace",
): T & U {
  if (!target) {
    return source as T & U;
  }
  if (!source) {
    return target as T & U;
  }
  return mergeWith({}, source, target, (sourceValue, targetValue) => {
    if (isArray(targetValue) && isArray(sourceValue)) {
      switch (mergeArrays) {
        case "union":
          return unionWith(sourceValue, targetValue, isEqual);
        case "intersection":
          return intersectionWith(sourceValue, targetValue, isEqual);
        case "concat":
          return sourceValue.concat(targetValue);
        case "replace":
          return targetValue;
        default:
          throw new Error(
            `Unknown merge array strategy: ${mergeArrays as string}`,
          );
      }
    }
    if (isObject(targetValue) && isObject(sourceValue)) {
      return deepMerge(sourceValue, targetValue, mergeArrays);
    }
    return undefined;
  });
}

/**
 * 为组件添加安装方法
 * @param component Vue组件
 * @param alias 可选的别名
 * @returns 带有install方法的组件
 */
export const withInstall = <T>(component: Component<T>, alias?: string) => {
  const comp = component as any;
  comp.install = (app: App) => {
    app.component(comp.name || comp.displayName, component);
    if (alias) {
      app.config.globalProperties[alias] = component;
    }
  };
  return component as T & Plugin;
};
