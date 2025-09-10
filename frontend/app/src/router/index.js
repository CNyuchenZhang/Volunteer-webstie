import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import NpoDashboard from '../views/NpoDashboard.vue'
import VisitorDashboard from '../views/VisitorDashboard.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import store from '../store'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    redirect: to => {
      const userType = store.getters.userType
      if (userType === 'npo') return { name: 'NpoDashboard' }
      if (userType === 'visitor') return { name: 'VisitorDashboard' }
      if (userType === 'admin') return { name: 'AdminDashboard' }
      return { name: 'Home' }
    }
  },
  {
    path: '/npo-dashboard',
    name: 'NpoDashboard',
    component: NpoDashboard,
    meta: { requiresAuth: true, requiredRole: 'npo' }
  },
  {
    path: '/visitor-dashboard',
    name: 'VisitorDashboard',
    component: VisitorDashboard,
    meta: { requiresAuth: true, requiredRole: 'visitor' }
  },
  {
    path: '/admin-dashboard',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, requiredRole: 'admin' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiredRole = to.meta.requiredRole
  
  if (requiresAuth && !store.getters.isAuthenticated) {
    try {
      await store.dispatch('checkAuth')
    } catch (error) {
      // Authentication failed
      next('/login')
      return
    }
  }
  
  if (requiresAuth && store.getters.isAuthenticated) {
    if (requiredRole && store.getters.userType !== requiredRole) {
      next('/dashboard') // Redirect to appropriate dashboard
      return
    }
  }
  
  next()
})

export default router