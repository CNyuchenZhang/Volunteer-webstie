import { defineStore } from 'pinia'
import type { User, TokenInfo, UserState } from '../types/api'
import { getCurrentUser, isLoggedIn, getAccessToken, getRefreshToken } from '../api'

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    user: null,
    tokens: null,
    isLoggedIn: false
  }),

  getters: {
    isVolunteer: (state) => state.user?.Character === 1,
    isNPO: (state) => state.user?.Character === 2,
    userName: (state) => state.user?.username || '',
    userEmail: (state) => state.user?.email || '',
    userId: (state) => state.user?.id || null
  },

  actions: {
    // 初始化用户状态（从本地存储恢复）
    initializeAuth() {
      const user = getCurrentUser()
      const accessToken = getAccessToken()
      const refreshToken = getRefreshToken()
      
      if (user && accessToken && refreshToken) {
        this.user = user
        this.tokens = { access: accessToken, refresh: refreshToken }
        this.isLoggedIn = true
      } else {
        this.clearAuth()
      }
    },

    // 设置用户登录状态
    setAuth(user: User, tokens: TokenInfo) {
      this.user = user
      this.tokens = tokens
      this.isLoggedIn = true
    },

    // 清除用户认证状态
    clearAuth() {
      this.user = null
      this.tokens = null
      this.isLoggedIn = false
    },

    // 更新用户信息
    updateUser(userData: Partial<User>) {
      if (this.user) {
        this.user = { ...this.user, ...userData }
        // 同步更新本地存储
        localStorage.setItem('user_info', JSON.stringify(this.user))
      }
    },

    // 检查登录状态
    checkAuthStatus(): boolean {
      const loggedIn = isLoggedIn()
      if (!loggedIn) {
        this.clearAuth()
      }
      return loggedIn
    }
  }
}) 