import axios from 'axios'
import type { 
  RegisterRequest, 
  LoginRequest, 
  LoginResponse, 
  RegisterResponse,
  UsernameCheckRequest,
  UsernameCheckResponse,
  ApiError,
  UserCharacter
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
    const token = localStorage.getItem('access_token')
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
  (response) => {
    return response
  },
  (error) => {
    console.error('API Error:', error)
    
    // 如果是401错误，清除本地token
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user_info')
    }
    
    return Promise.reject(error)
  }
)

// 志愿者注册
export const registerVolunteer = async (data: RegisterRequest): Promise<RegisterResponse> => {
  try {
    // 确保Character为志愿者类型
    const requestData = { ...data, Character: 1 }
    const response = await api.post('/account/volunteerRegister/', requestData)
    return response.data
  } catch (error: any) {
    throw {
      status: error.response?.status,
      message: error.response?.data?.error || error.response?.data?.message || error.message,
      data: error.response?.data
    } as ApiError
  }
}

// NPO注册
export const registerNPO = async (data: RegisterRequest): Promise<RegisterResponse> => {
  try {
    // 确保Character为NPO类型
    const requestData = { ...data, Character: 2 }
    const response = await api.post('/account/npoRegister/', requestData)
    return response.data
  } catch (error: any) {
    throw {
      status: error.response?.status,
      message: error.response?.data?.error || error.response?.data?.message || error.message,
      data: error.response?.data
    } as ApiError
  }
}

// 志愿者登录
export const loginVolunteer = async (data: LoginRequest): Promise<LoginResponse> => {
  try {
    // 确保Character为志愿者类型
    const requestData = { ...data, Character: 1 }
    const response = await api.post('/account/volunteerLogin/', requestData)
    
    // 保存token到本地存储
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access)
      localStorage.setItem('refresh_token', response.data.refresh)
      localStorage.setItem('user_info', JSON.stringify(response.data.user))
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

// NPO登录
export const loginNPO = async (data: LoginRequest): Promise<LoginResponse> => {
  try {
    // 确保Character为NPO类型
    const requestData = { ...data, Character: 2 }
    const response = await api.post('/account/npoLogin/', requestData)
    
    // 保存token到本地存储
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access)
      localStorage.setItem('refresh_token', response.data.refresh)
      localStorage.setItem('user_info', JSON.stringify(response.data.user))
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
    const response = await api.get('/account/findUserByUsername/', {
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

// 登出（清除本地存储）
export const logout = (): void => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user_info')
}

// 获取当前用户信息（从本地存储）
export const getCurrentUser = () => {
  const userInfo = localStorage.getItem('user_info')
  return userInfo ? JSON.parse(userInfo) : null
}

// 检查是否已登录
export const isLoggedIn = (): boolean => {
  return !!localStorage.getItem('access_token')
}

// 获取访问令牌
export const getAccessToken = (): string | null => {
  return localStorage.getItem('access_token')
}

// 获取刷新令牌
export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refresh_token')
}

// 通用登录函数（根据用户类型自动选择接口）
export const loginUser = async (data: LoginRequest): Promise<LoginResponse> => {
  switch (data.Character) {
    case 1:
      return loginVolunteer(data)
    case 2:
      return loginNPO(data)
    default:
      throw {
        status: 400,
        message: '不支持的用户类型',
        data: null
      } as ApiError
  }
}

// 通用注册函数（根据用户类型自动选择接口）
export const registerUser = async (data: RegisterRequest): Promise<RegisterResponse> => {
  switch (data.Character) {
    case 1:
      return registerVolunteer(data)
    case 2:
      return registerNPO(data)
    default:
      throw {
        status: 400,
        message: '不支持的用户类型',
        data: null
      } as ApiError
  }
}

export default api 