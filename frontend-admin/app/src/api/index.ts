import axios from 'axios'
import type { 
  AdminLoginRequest,
  LoginResponse, 
  UsernameCheckRequest,
  UsernameCheckResponse,
  ApiError
} from '../types/api'

// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)
    
    // 如果是401错误，清除本地token
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_access_token')
      localStorage.removeItem('admin_refresh_token')
      localStorage.removeItem('admin_user_info')
    }
    
    return Promise.reject(error)
  }
)

// 管理员登录
export const loginAdmin = async (data: Omit<AdminLoginRequest, 'Character'>): Promise<LoginResponse> => {
  try {
    const requestData = { ...data, Character: 0 } // 管理员类型为0
    const response = await api.post('/accounts/adminLogin/', requestData)
    
    // 保存token到本地存储（使用admin前缀区分）
    if (response.data.access) {
      localStorage.setItem('admin_access_token', response.data.access)
      localStorage.setItem('admin_refresh_token', response.data.refresh)
      localStorage.setItem('admin_user_info', JSON.stringify(response.data.user))
    }
    
    return response.data
  } catch (error: any) {
    throw {
      status: error.response?.status,
      message: error.response?.data?.error || error.response?.data?.message || error.message,
      data: error.response?.data
    } as ApiError
  }
}

// 检查用户名是否可用
export const checkUsernameAvailability = async (username: string): Promise<UsernameCheckResponse> => {
  try {
    const response = await api.get('/accounts/findUserByUsername/', {
      params: { username }
    })
    return response.data
  } catch (error: any) {
    throw {
      status: error.response?.status,
      message: error.response?.data?.error || error.response?.data?.message || error.message,
      data: error.response?.data
    } as ApiError
  }
}

// 管理员登出（清除本地存储）
export const logout = (): void => {
  localStorage.removeItem('admin_access_token')
  localStorage.removeItem('admin_refresh_token')
  localStorage.removeItem('admin_user_info')
}

// 获取当前管理员信息（从本地存储）
export const getCurrentAdmin = () => {
  const userInfo = localStorage.getItem('admin_user_info')
  return userInfo ? JSON.parse(userInfo) : null
}

// 检查管理员是否已登录
export const isLoggedIn = (): boolean => {
  return !!localStorage.getItem('admin_access_token')
}

// 获取访问令牌
export const getAccessToken = (): string | null => {
  return localStorage.getItem('admin_access_token')
}

// 获取刷新令牌
export const getRefreshToken = (): string | null => {
  return localStorage.getItem('admin_refresh_token')
}

// 兼容旧的接口名称
export const loginUser = loginAdmin

export default api 