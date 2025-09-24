// 管理员端简化的API客户端

import { AdminTokenManager, USER_TYPES } from '../utils/auth'

const API_BASE_URL = 'http://localhost:8000/api'

// 通用请求函数
async function apiRequest(endpoint: string, options: any = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  const token = AdminTokenManager.getAccessToken()
  
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
      AdminTokenManager.clearTokens()
    }
    throw error
  }
}

// 管理员登录
export async function loginAdmin(credentials: {
  username: string
  password: string
}) {
  const data = await apiRequest('/accounts/adminLogin/', {
    method: 'POST',
    body: JSON.stringify({
      ...credentials,
      Character: USER_TYPES.ADMIN
    })
  })
  
  // 保存登录信息
  if (data.access && data.refresh && data.user) {
    AdminTokenManager.setTokens(data.access, data.refresh, data.user)
  }
  
  return data
}

// 检查用户名是否可用
export async function checkUsernameAvailability(username: string) {
  return await apiRequest(`/accounts/findUserByUsername/?username=${encodeURIComponent(username)}`, {
    method: 'GET'
  })
}

// 登出
export function logout() {
  AdminTokenManager.clearTokens()
}

// 获取当前管理员信息
export function getCurrentAdmin() {
  return AdminTokenManager.getCurrentAdmin()
}

// 检查是否已登录
export function isLoggedIn() {
  return AdminTokenManager.isLoggedIn()
}

// 兼容旧的接口名称
export const loginUser = loginAdmin 