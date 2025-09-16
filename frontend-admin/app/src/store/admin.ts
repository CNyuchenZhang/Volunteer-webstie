import { defineStore } from 'pinia'

interface AdminState {
  isLoggedIn: boolean
  username: string
}

export const useAdminStore = defineStore('admin', {
  state: (): AdminState => ({
    isLoggedIn: false, // 登录状态
    username: ''       // 当前管理员用户名
  }),
  actions: {
    login(username: string) {
      this.isLoggedIn = true
      this.username = username
    },
    logout() {
      this.isLoggedIn = false
      this.username = ''
    }
  }
})

