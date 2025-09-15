import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import LoginPage from '../pages/LoginPage.vue'
import RegisterPage from '../pages/RegisterPage.vue'
import DashboardVolunteer from '../pages/DashboardVolunteer.vue'
import DashboardNPO from '../pages/DashboardNPO.vue'
import DashboardAdmin from '../pages/DashboardAdmin.vue'
//import AdminLoginPage from '../pages/AdminLoginPage.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: HomePage },
  { path: '/login/:role', name: 'login', component: LoginPage, props: true },
  { path: '/register/:role', name: 'register', component: RegisterPage, props: true },
  { path: '/dashboard/volunteer', name: 'volunteerDashboard', component: DashboardVolunteer },
  { path: '/dashboard/npo', name: 'npoDashboard', component: DashboardNPO },
  { path: '/dashboard/admin', name: 'adminDashboard', component: DashboardAdmin },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router