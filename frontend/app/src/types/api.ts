// API 类型定义文件

// 用户类型常量
export const UserCharacter = {
  ADMIN: 0,      // 管理员
  VOLUNTEER: 1,  // 志愿者
  NPO: 2         // 非营利组织
} as const

export type UserCharacter = typeof UserCharacter[keyof typeof UserCharacter]

// 基础用户信息
export interface User {
  id: number
  username: string
  email?: string
  Character: UserCharacter
  first_name?: string
  last_name?: string
  is_active: boolean
  date_joined: string
  last_login?: string
}

// 注册请求参数
export interface RegisterRequest {
  username: string
  password: string
  Character: UserCharacter
  email?: string
  first_name?: string
  last_name?: string
}

// 登录请求参数
export interface LoginRequest {
  username: string
  password: string
  Character: UserCharacter
}

// 登录响应
export interface LoginResponse {
  user: User
  refresh: string
  access: string
}

// 注册响应
export interface RegisterResponse {
  user: Omit<User, 'id'> & { id?: number }
  refresh: string
  access: string
}

// 用户名检查请求
export interface UsernameCheckRequest {
  username: string
}

// 用户名检查响应
export interface UsernameCheckResponse {
  username: string
  avaliable: boolean  // 注意：后端拼写是 avaliable 而不是 available
}

// API 错误响应
export interface ApiError {
  status?: number
  message: string
  data?: any
}

// API 响应包装
export interface ApiResponse<T = any> {
  data: T
  status: number
  message?: string
}

// JWT Token 信息
export interface TokenInfo {
  access: string
  refresh: string
}

// 用户状态
export interface UserState {
  user: User | null
  tokens: TokenInfo | null
  isLoggedIn: boolean
} 