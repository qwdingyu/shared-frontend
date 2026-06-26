/**
 * 类型定义模块入口
 * 导出所有共享类型
 */

// 通用类型定义
export interface BaseEntity {
  id: number;
  create_time?: string;
  update_time?: string;
}

export interface PaginationParams {
  page: number;
  page_size: number;
}

export interface PaginationResult<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  code?: number;
}
