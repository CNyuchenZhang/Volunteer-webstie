import { defineStore } from 'pinia'
import type { User, TokenInfo, AdminState } from '../types/api'
import { getCurrentAdmin, isLoggedIn, getAccessToken, getRefreshToken } from '../api'

export const useAdminStore = defineStore('admin', {
  state: (): AdminState => ({
    user: null,
    tokens: null,
    isLoggedIn: false
  }),

  getters: {
    isAdmin: (state) => state.user?.Character === 0,
    adminName: (state) => state.user?.username || '',
    adminEmail: (state) => state.user?.email || '',
    adminId: (state) => state.user?.id || null
  },

  actions: {
    // 初始化管理员状态（从本地存储恢复）
    initializeAuth() {
      const user = getCurrentAdmin()
      const accessToken = getAccessToken()
      const refreshToken = getRefreshToken()
      
      if (user && accessToken && refreshToken && user.Character === 0) {
        this.user = user
        this.tokens = { access: accessToken, refresh: refreshToken }
        this.isLoggedIn = true
      } else {
        this.clearAuth()
      }
    },

    // 设置管理员登录状态
    setAuth(user: User, tokens: TokenInfo) {
      if (user.Character !== 0) {
        throw new Error('只有管理员可以登录管理端')
      }
      this.user = user
      this.tokens = tokens
      this.isLoggedIn = true
    },

    // 清除管理员认证状态
    clearAuth() {
      this.user = null
      this.tokens = null
      this.isLoggedIn = false
    },

    // 更新管理员信息
    updateUser(userData: Partial<User>) {
      if (this.user) {
        this.user = { ...this.user, ...userData }
        // 同步更新本地存储
        localStorage.setItem('admin_user_info', JSON.stringify(this.user))
      }
    },

    // 检查登录状态
    checkAuthStatus(): boolean {
      const loggedIn = isLoggedIn()
      if (!loggedIn) {
        this.clearAuth()
      }
      return loggedIn
    },

    // 兼容旧的方法名
    login(username: string) {
      // 这个方法已废弃，保留是为了向后兼容
      console.warn('admin.login() is deprecated, use setAuth() instead')
      // 不做任何操作，因为新的登录流程通过 setAuth 处理
    },

    logout() {
      this.clearAuth()
    }
  }
})

