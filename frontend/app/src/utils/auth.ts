// 认证工具函数

// 用户类型常量
export const USER_TYPES = {
  ADMIN: 0,
  VOLUNTEER: 1,
  NPO: 2
} as const

// Token 管理
export class TokenManager {
  private static ACCESS_TOKEN_KEY = 'access_token'
  private static REFRESH_TOKEN_KEY = 'refresh_token'
  private static USER_INFO_KEY = 'user_info'

  static setTokens(accessToken: string, refreshToken: string, userInfo: any) {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken)
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken)
    localStorage.setItem(this.USER_INFO_KEY, JSON.stringify(userInfo))
  }

  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY)
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY)
  }

  static getUserInfo(): any {
    const userInfo = localStorage.getItem(this.USER_INFO_KEY)
    return userInfo ? JSON.parse(userInfo) : null
  }

  static clearTokens() {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY)
    localStorage.removeItem(this.REFRESH_TOKEN_KEY)
    localStorage.removeItem(this.USER_INFO_KEY)
  }

  static isLoggedIn(): boolean {
    return !!this.getAccessToken()
  }
}

// 管理员Token管理（使用不同的key）
export class AdminTokenManager {
  private static ACCESS_TOKEN_KEY = 'admin_access_token'
  private static REFRESH_TOKEN_KEY = 'admin_refresh_token'
  private static USER_INFO_KEY = 'admin_user_info'

  static setTokens(accessToken: string, refreshToken: string, userInfo: any) {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken)
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken)
    localStorage.setItem(this.USER_INFO_KEY, JSON.stringify(userInfo))
  }

  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY)
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY)
  }

  static getUserInfo(): any {
    const userInfo = localStorage.getItem(this.USER_INFO_KEY)
    return userInfo ? JSON.parse(userInfo) : null
  }

  static clearTokens() {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY)
    localStorage.removeItem(this.REFRESH_TOKEN_KEY)
    localStorage.removeItem(this.USER_INFO_KEY)
  }

  static isLoggedIn(): boolean {
    return !!this.getAccessToken()
  }
}

// 用户类型检查函数
export const isVolunteer = (userType: number): boolean => userType === USER_TYPES.VOLUNTEER
export const isNPO = (userType: number): boolean => userType === USER_TYPES.NPO
export const isAdmin = (userType: number): boolean => userType === USER_TYPES.ADMIN

// 获取用户类型名称
export const getUserTypeName = (userType: number): string => {
  switch (userType) {
    case USER_TYPES.ADMIN:
      return '管理员'
    case USER_TYPES.VOLUNTEER:
      return '志愿者'
    case USER_TYPES.NPO:
      return 'NPO组织'
    default:
      return '未知类型'
  }
} 