// API使用示例 - 管理员端

import * as api from '../api/client'
import { USER_TYPES, getUserTypeName } from '../utils/auth'

// 管理员登录示例
export async function exampleAdminLogin() {
  const credentials = {
    username: 'admin',
    password: 'AdminPass123!'
  }

  try {
    const result = await api.loginAdmin(credentials)
    console.log('管理员登录成功:', result)
    
    // 获取当前管理员信息
    const currentAdmin = api.getCurrentAdmin()
    console.log('当前管理员:', currentAdmin)
    console.log('用户类型:', getUserTypeName(currentAdmin.Character))
    
    return result
  } catch (error: any) {
    console.error('管理员登录失败:', error.message)
    
    // 根据错误类型进行不同处理
    switch (error.status) {
      case 400:
        if (error.message.includes('Invalid Character')) {
          console.log('用户类型错误，只有管理员可以登录管理端')
        } else {
          console.log('请求参数错误')
        }
        break
      case 401:
        console.log('认证失败，用户名或密码错误')
        break
      default:
        console.log('登录失败:', error.message)
    }
    
    throw error
  }
}

// 检查用户名是否可用示例
export async function exampleCheckUsername() {
  const username = 'testadmin'
  
  try {
    const result = await api.checkUsernameAvailability(username)
    console.log(`用户名 "${username}" 检查结果:`, result)
    
    if (result.avaliable) {
      console.log('用户名可用')
    } else {
      console.log('用户名已被占用')
    }
    
    return result
  } catch (error: any) {
    console.error('检查用户名失败:', error.message)
    throw error
  }
}

// 检查管理员登录状态示例
export function exampleCheckAdminStatus() {
  const isLoggedIn = api.isLoggedIn()
  console.log('管理员是否已登录:', isLoggedIn)
  
  if (isLoggedIn) {
    const admin = api.getCurrentAdmin()
    console.log('当前管理员:', admin)
    console.log('管理员用户名:', admin.username)
    console.log('管理员邮箱:', admin.email || '未设置')
    console.log('账户创建时间:', admin.date_joined)
    console.log('最后登录时间:', admin.last_login || '首次登录')
  }
  
  return isLoggedIn
}

// 管理员登出示例
export function exampleAdminLogout() {
  console.log('管理员执行登出...')
  api.logout()
  console.log('管理员已登出')
  
  // 验证登出状态
  const isLoggedIn = api.isLoggedIn()
  console.log('登出后状态:', isLoggedIn)
  
  // 验证无法获取管理员信息
  const admin = api.getCurrentAdmin()
  console.log('登出后管理员信息:', admin) // 应该为 null
}

// 管理员权限验证示例
export function exampleAdminPermissionCheck() {
  const admin = api.getCurrentAdmin()
  
  if (!admin) {
    console.log('未登录或非管理员用户')
    return false
  }
  
  if (admin.Character !== USER_TYPES.ADMIN) {
    console.log('当前用户不是管理员')
    return false
  }
  
  console.log('管理员权限验证通过')
  console.log('管理员信息:', {
    id: admin.id,
    username: admin.username,
    email: admin.email,
    isActive: admin.is_active
  })
  
  return true
}

// 错误处理示例
export async function exampleErrorHandling() {
  try {
    // 尝试使用普通用户凭据登录管理端
    await api.loginAdmin({
      username: 'regularuser',
      password: 'password123'
    })
  } catch (error: any) {
    console.log('捕获到错误:')
    console.log('状态码:', error.status)
    console.log('错误信息:', error.message)
    console.log('详细数据:', error.data)
    
    // 管理员端特有的错误处理
    if (error.message.includes('Invalid Character')) {
      console.log('用户类型错误，该用户不是管理员')
    } else if (error.message.includes('Invalid credentials')) {
      console.log('凭据无效，用户名或密码错误')
    } else {
      console.log('其他错误:', error.message)
    }
  }
}

// 完整的管理员登录流程示例
export async function exampleCompleteAdminFlow() {
  try {
    // 1. 检查是否已登录
    if (api.isLoggedIn()) {
      console.log('管理员已登录，无需重复登录')
      const admin = api.getCurrentAdmin()
      console.log('当前管理员:', admin.username)
      return admin
    }
    
    // 2. 执行登录
    console.log('开始管理员登录流程...')
    const loginResult = await api.loginAdmin({
      username: 'admin',
      password: 'AdminPass123!'
    })
    
    // 3. 验证登录结果
    console.log('登录成功，验证权限...')
    const hasPermission = exampleAdminPermissionCheck()
    
    if (!hasPermission) {
      throw new Error('权限验证失败')
    }
    
    console.log('管理员登录流程完成')
    return loginResult
    
  } catch (error: any) {
    console.error('管理员登录流程失败:', error.message)
    
    // 清理可能的无效状态
    api.logout()
    
    throw error
  }
} 