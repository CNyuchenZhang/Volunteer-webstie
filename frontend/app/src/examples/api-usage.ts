// API使用示例 - 用户端

import * as api from '../api/client'
import { validateUsername, validatePassword, validateEmail } from '../utils/validators'
import { USER_TYPES, getUserTypeName } from '../utils/auth'

// 用户注册示例
export async function exampleRegister() {
  const userData = {
    username: 'testuser123',
    password: 'TestPass123!',
    email: 'test@example.com',
    first_name: '张',
    last_name: '三'
  }

  try {
    // 1. 验证输入数据
    const usernameValidation = validateUsername(userData.username)
    if (!usernameValidation.valid) {
      throw new Error(usernameValidation.message)
    }

    const passwordValidation = validatePassword(userData.password)
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.message)
    }

    const emailValidation = validateEmail(userData.email)
    if (!emailValidation.valid) {
      throw new Error(emailValidation.message)
    }

    // 2. 检查用户名是否可用
    const usernameCheck = await api.checkUsernameAvailability(userData.username)
    if (!usernameCheck.avaliable) {
      throw new Error('用户名已被占用')
    }

    // 3. 志愿者注册
    const result = await api.registerVolunteer(userData)
    console.log('志愿者注册成功:', result)
    
    // 注册成功后会自动登录，可以获取用户信息
    const currentUser = api.getCurrentUser()
    console.log('当前用户:', currentUser)
    
    return result
  } catch (error: any) {
    console.error('注册失败:', error.message)
    throw error
  }
}

// 用户登录示例
export async function exampleLogin() {
  const credentials = {
    username: 'testuser123',
    password: 'TestPass123!',
    userType: USER_TYPES.VOLUNTEER // 或者 USER_TYPES.NPO
  }

  try {
    // 使用通用登录函数
    const result = await api.loginUser(credentials)
    console.log('登录成功:', result)
    
    // 获取当前用户信息
    const currentUser = api.getCurrentUser()
    console.log('当前用户:', currentUser)
    console.log('用户类型:', getUserTypeName(currentUser.Character))
    
    return result
  } catch (error: any) {
    console.error('登录失败:', error.message)
    throw error
  }
}

// NPO注册示例
export async function exampleNPORegister() {
  const npoData = {
    username: 'testnpo123',
    password: 'TestPass123!',
    email: 'npo@example.com',
    first_name: 'NPO',
    last_name: '组织'
  }

  try {
    const result = await api.registerNPO(npoData)
    console.log('NPO注册成功:', result)
    return result
  } catch (error: any) {
    console.error('NPO注册失败:', error.message)
    throw error
  }
}

// 检查登录状态示例
export function exampleCheckLoginStatus() {
  const isLoggedIn = api.isLoggedIn()
  console.log('是否已登录:', isLoggedIn)
  
  if (isLoggedIn) {
    const user = api.getCurrentUser()
    console.log('当前用户:', user)
    console.log('用户类型:', getUserTypeName(user.Character))
  }
  
  return isLoggedIn
}

// 登出示例
export function exampleLogout() {
  console.log('执行登出...')
  api.logout()
  console.log('已登出')
  
  // 验证登出状态
  const isLoggedIn = api.isLoggedIn()
  console.log('登出后状态:', isLoggedIn)
}

// 错误处理示例
export async function exampleErrorHandling() {
  try {
    // 尝试使用无效凭据登录
    await api.loginVolunteer({
      username: 'nonexistent',
      password: 'wrongpassword'
    })
  } catch (error: any) {
    console.log('捕获到错误:')
    console.log('状态码:', error.status)
    console.log('错误信息:', error.message)
    console.log('详细数据:', error.data)
    
    // 根据错误类型进行不同处理
    switch (error.status) {
      case 400:
        console.log('请求参数错误')
        break
      case 401:
        console.log('认证失败，用户名或密码错误')
        break
      case 404:
        console.log('接口不存在')
        break
      case 500:
        console.log('服务器内部错误')
        break
      default:
        console.log('未知错误')
    }
  }
} 