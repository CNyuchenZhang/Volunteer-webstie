import { createStore } from 'vuex'
import axios from 'axios'

const API_BASE = 'http://localhost:8000/api'

export default createStore({
  state: {
    user: null,
    token: null,
    userType: null
  },
  mutations: {
    setUser(state, user) {
      state.user = user
    },
    setToken(state, token) {
      state.token = token
    },
    setUserType(state, userType) {
      state.userType = userType
    },
    clearAuth(state) {
      state.user = null
      state.token = null
      state.userType = null
    }
  },
  actions: {
    async login({ commit }, credentials) {
      try {
        const response = await axios.post(`${API_BASE}/auth/login/`, credentials)
        commit('setUser', response.data.user)
        commit('setToken', response.data.token)
        commit('setUserType', response.data.user_type)
        return response.data
      } catch (error) {
        throw error.response.data
      }
    },
    async logoutUser({ commit }) {
      try {
        await axios.post(`${API_BASE}/auth/logout/`)
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        commit('clearAuth')
      }
    },
    async checkAuth({ commit }) {
      try {
        const response = await axios.get(`${API_BASE}/auth/user/`)
        commit('setUser', response.data.user)
        commit('setUserType', response.data.user_type)
        return response.data
      } catch (error) {
        commit('clearAuth')
        throw error
      }
    }
  },
  getters: {
    isAuthenticated: state => !!state.user,
    currentUser: state => state.user,
    userType: state => state.userType
  }
})