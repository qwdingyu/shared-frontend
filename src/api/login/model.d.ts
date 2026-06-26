declare namespace API {
  /** 登录参数 */
  type LoginParams = {
    password: string
    username: string
  }

  /** 登录成功结果 */
  type LoginResult = {
    token: string
    refreshToken: string
    expiresAt: number
    userId: number
    userName: string
    realName: string
    isSuper: boolean
    roles: string[]
  }

  /** 获取验证码参数 */
  type CaptchaParams = {
    width?: number
    height?: number
    len?: number
    bgColor?: string
  }

  /** 获取验证码结果 */
  type CaptchaResult = {
    img: string
    id: string
  }

  /** 外部系统登录参数 */
  type SsoLoginParams = {
    code: string
    name: string
  }
}
