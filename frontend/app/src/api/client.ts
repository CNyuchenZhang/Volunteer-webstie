// 简化的API客户端 - 专注于功能实现

import { TokenManager, USER_TYPES } from '../utils/auth'

const API_BASE_URL = 'http://localhost:8000/api'

// 通用请求函数
async function apiRequest(endpoint: string, options: any = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  const token = TokenManager.getAccessToken()
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    },
    ...options
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()
    
    if (!response.ok) {
      throw {
        status: response.status,
        message: data.error || data.message || '请求失败',
        data: data
      }
    }
    
    return data
  } catch (error: any) {
    if (error.status === 401) {
      TokenManager.clearTokens()
    }
    throw error
  }
}

// 志愿者注册
export async function registerVolunteer(userData: {
  username: string
  password: string
  email?: string
  first_name?: string
  last_name?: string
}) {
  const data = await apiRequest('/accounts/volunteerRegister/', {
    method: 'POST',
    body: JSON.stringify({
      ...userData,
      Character: USER_TYPES.VOLUNTEER
    })
  })
  
  // 自动保存登录信息
  if (data.access && data.refresh && data.user) {
    TokenManager.setTokens(data.access, data.refresh, data.user)
  }
  
  return data
}

// NPO注册
export async function registerNPO(userData: {
  username: string
  password: string
  email?: string
  first_name?: string
  last_name?: string
}) {
  const data = await apiRequest('/accounts/npoRegister/', {
    method: 'POST',
    body: JSON.stringify({
      ...userData,
      Character: USER_TYPES.NPO
    })
  })
  
  // 自动保存登录信息
  if (data.access && data.refresh && data.user) {
    TokenManager.setTokens(data.access, data.refresh, data.user)
  }
  
  return data
}

// 志愿者登录
export async function loginVolunteer(credentials: {
  username: string
  password: string
}) {
  const data = await apiRequest('/accounts/volunteerLogin/', {
    method: 'POST',
    body: JSON.stringify({
      ...credentials,
      Character: USER_TYPES.VOLUNTEER
    })
  })
  
  // 保存登录信息
  if (data.access && data.refresh && data.user) {
    TokenManager.setTokens(data.access, data.refresh, data.user)
  }
  
  return data
}

// NPO登录
export async function loginNPO(credentials: {
  username: string
  password: string
}) {
  const data = await apiRequest('/accounts/npoLogin/', {
    method: 'POST',
    body: JSON.stringify({
      ...credentials,
      Character: USER_TYPES.NPO
    })
  })
  
  // 保存登录信息
  if (data.access && data.refresh && data.user) {
    TokenManager.setTokens(data.access, data.refresh, data.user)
  }
  
  return data
}

// 检查用户名是否可用
export async function checkUsernameAvailability(username: string) {
  return await apiRequest(`/accounts/findUserByUsername/?username=${encodeURIComponent(username)}`, {
    method: 'GET'
  })
}

// 通用登录函数
export async function loginUser(credentials: {
  username: string
  password: string
  userType: number
}) {
  switch (credentials.userType) {
    case USER_TYPES.VOLUNTEER:
      return await loginVolunteer(credentials)
    case USER_TYPES.NPO:
      return await loginNPO(credentials)
    default:
      throw {
        status: 400,
        message: '不支持的用户类型',
        data: null
      }
  }
}

// 通用注册函数
export async function registerUser(userData: {
  username: string
  password: string
  userType: number
  email?: string
  first_name?: string
  last_name?: string
}) {
  const { userType, ...restData } = userData
  
  switch (userType) {
    case USER_TYPES.VOLUNTEER:
      return await registerVolunteer(restData)
    case USER_TYPES.NPO:
      return await registerNPO(restData)
    default:
      throw {
        status: 400,
        message: '不支持的用户类型',
        data: null
      }
  }
}

// 登出
export function logout() {
  TokenManager.clearTokens()
}

// 获取当前用户信息
export function getCurrentUser() {
  return TokenManager.getUserInfo()
}

// 检查是否已登录
export function isLoggedIn() {
  return TokenManager.isLoggedIn()
} 