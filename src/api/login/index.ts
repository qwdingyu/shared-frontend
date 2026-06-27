import { request, type RequestOptions } from '@/utils/request'
import { http } from '@/api/http'

/**
 * @description 登录
 * @param {LoginParams} params 参数
 * @param {RequestOptions} options 其他配置
 * @returns
 */
export function login(params: API.LoginParams, options?: RequestOptions) {
  return request<API.LoginResult>('/Login/JWTToken', {
    method: 'post',
    data: params,
    ...(options || {}),
  })
}

/**
 * 刷新token
 * @param token 旧refreshToken
 * @param pwd 密码（可选，用于解锁场景）
 * @returns 新token
 * 使用 POST + Body 传递敏感令牌，避免 GET query string 泄露到浏览器历史/服务器日志
 */
export function refreshToken(token: string, pwd?: string) {
  return http.post<API.LoginResult>('/Login/RefreshToken', { token, pwd }, { showSuccessMsg: false })
}

/**
 * @description 登出
 */
export function logout(data: { token: string }) {
  return request({
    url: '/account/logout',
    method: 'post',
    data,
  })
}

/**
 * @description 外部系统登录
 * @param {LoginParams} params
 * @returns
 */
export function sso(params: API.SsoLoginParams) {
  return request<API.LoginResult>({
    url: '/Login/SSO',
    method: 'post',
    data: params,
  })
}

// 兼容 preserveModules 目录导入：确保该模块作为目录时有 index.js 落盘
export const __loginIndexMarker = true
