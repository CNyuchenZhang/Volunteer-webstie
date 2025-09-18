import axios from 'axios'

// 创建axios实例 - 使用实际的API服务器地址
const api = axios.create({
  baseURL: 'http://47.84.114.53:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证token
    const token = localStorage.getItem('token')
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
    return Promise.reject(error)
  }
)

// 接口类型定义
export interface LoginRequest {
  username: string
  password: string
}

export interface LogoutRequest {
  username: string
}

// 登录接口 - 管理员登录
export const loginUser = async (data: LoginRequest) => {
  try {
    const response = await api.post('/login/', data)
    // 根据API文档，登录成功返回状态码100或200
    if (response.status === 100 || response.status === 200) {
      return response.data
    } else {
      throw new Error('登录失败')
    }
  } catch (error: any) {
    throw {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    }
  }
}

// 登出接口
export const logoutUser = async (data: LogoutRequest) => {
  try {
    const response = await api.post('/logout/', data)
    return response.data
  } catch (error: any) {
    throw {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    }
  }
} 