import { http } from '@/api/http'

export default {
  /**
   * 获取缓存的用户信息列表
   * @returns 用户 id、code、name、email、isSuper 基本信息列表
   */
  getUserWithCache: () => http.get<API.UserInfoCache[]>(`/SysUser/GetAllUserWithCache`),
}

// 兼容 preserveModules 目录导入：确保该模块作为目录时有 index.js 落盘
export const __cacheIndexMarker = true
