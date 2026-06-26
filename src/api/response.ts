export type ListLikeResponse<T> =
  | T[]
  | {
      data?: T[] | ListLikeResponse<T>;
      total?: number;
      count?: number;
    };

export interface NormalizedPage<T> {
  list: T[];
  total: number;
}

/**
 * 标准化列表响应。
 * 支持多种后端返回格式：
 * - { data: T[] }          — 标准格式
 * - { result: T[] }        — 分页结果格式
 * - T[]                    — 直接数组
 */
export const normalizeList = <T>(value: ListLikeResponse<T> | null | undefined): T[] => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];

  // 1. 优先认 data 字段
  if (Array.isArray(value.data)) return value.data;
  if (value.data && typeof value.data === "object") return normalizeList(value.data);

  // 2. fallback: result / list / records / items / rows
  if (Array.isArray(value.result)) return value.result;
  if (Array.isArray(value.list)) return value.list;
  if (Array.isArray(value.records)) return value.records;
  if (Array.isArray(value.items)) return value.items;
  if (Array.isArray(value.rows)) return value.rows;

  return [];
};

/**
 * 标准化分页响应。
 * 支持多种后端返回格式：
 * - { status, success, data: T[], total?, count?, msg }   — 标准格式
 * - { status, success, data: { result: T[], total: N }, msg } — 嵌套分页
 */
export const normalizePage = <T>(
  value: ListLikeResponse<T> | null | undefined,
): NormalizedPage<T> => {
  const list = normalizeList(value);

  if (!value || Array.isArray(value) || typeof value !== "object") {
    return { list, total: list.length };
  }

  // 总数字段优先级：总层级的 total > count > 嵌套 data 中的 total/count > 列表长度
  let total = Number(value.total ?? value.count ?? list.length);
  if (total === 0 || (value.data && typeof value.data === "object" && !Array.isArray(value.data))) {
    const nestedTotal = Number(
      (value.data as any).total ??
        (value.data as any).count ??
        list.length,
    );
    if (nestedTotal > 0) {
      total = nestedTotal;
    }
  }

  return { list, total };
};
