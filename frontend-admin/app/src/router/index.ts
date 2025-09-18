import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'

const routes = [
  { path: '/', name: 'Home', component: Login },
  { path: '/login', name: 'Login', component: Login },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard }
]

const router = createRouter({
  history: createWebHistory('/admin/'),
  routes
})

export default router

