import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import LoginPage from '../pages/LoginPage.vue'
import RegisterPage from '../pages/RegisterPage.vue'
import DashboardVolunteer from '../pages/DashboardVolunteer.vue'
import DashboardNPO from '../pages/DashboardNPO.vue'
import DashboardAdmin from '../pages/DashboardAdmin.vue'

import HeaderLayout from "../components/HeaderLayout.vue"

// 公共首页
import PublicHome from '../pages/PublicHome.vue'
// 公共活动专区
import PublicActivityZone from '../pages/PublicActivityZone.vue'
// 公共背景介绍
import PublicBackground from '../pages/PublicBackground.vue'
// 公共规则介绍
import PublicRules from '../pages/PublicRules.vue'
// 公共证书介绍
import PublicCertificate from '../pages/PublicCertificate.vue'
// 公共活动详情
import ActivityZoneDetail from '../pages/ActivityZoneDetail.vue'
// 公共组织详情
import OrganizationDetail from '../pages/OrganizationDetail.vue'
// 公共我的活动
import PublicMyActivity from '../pages/PublicMyActivity.vue'
// 已提交活动
import SubmittedActivity from '../pages/SubmittedActivity.vue'
// 已提交活动详情
import SubmittedActivityDetail from '../pages/SubmittedActivityDetail.vue'
// 新建活动
import NewActivity from '../pages/NewActivity.vue'
// 用户信息
import PublicUserProfile from '../pages/PublicUserProfile.vue'


//import AdminLoginPage from '../pages/AdminLoginPage.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: HomePage },
  { path: '/login/:role', name: 'login', component: LoginPage, props: true },
  { path: '/register/:role', name: 'register', component: RegisterPage, props: true },
  { path: '/dashboard/volunteer', name: 'volunteerDashboard', component: DashboardVolunteer },
  { path: '/dashboard/npo', name: 'npoDashboard', component: DashboardNPO },
  { path: '/dashboard/admin', name: 'adminDashboard', component: DashboardAdmin },
  { path: '/404', name: '404', component: () => import('../pages/404.vue') },
  {
    path: '/home/:role',
    name: 'publicHome',
    component: HeaderLayout,
    props: true,
    children: [
      { path: '', name: 'roleHome', component: PublicHome, props: route => ({ role: route.params.role }) },
    ]
  },
  {
    path: '/activity-zone/:role',
    name: 'publicActivityZone',
    component: HeaderLayout,
    props: true,
    children: [
      { path: '', name: 'roleActivityZone', component: PublicActivityZone, props: route => ({ role: route.params.role }) },
    ]
  },
  {
    path: '/activity-zone-detail/:role',
    name: 'publicActivityZoneDetail',
    component: HeaderLayout,
    props: true,
    children: [
      { path: '', name: 'roleActivityZoneDetail', component: ActivityZoneDetail, props: route => ({ role: route.params.role }) },
    ]
  },
  {
    path: '/organization-detail/:role',
    name: 'publicOrganizationDetail',
    component: HeaderLayout,
    props: true,
    children: [
      { path: '', name: 'roleOrganizationDetail', component: OrganizationDetail, props: route => ({ role: route.params.role }) },
    ]
  },
  {
    path: '/background/:role',
    name: 'publicBackground',
    component: HeaderLayout,
    props: true,
    children: [
      { path: '', name: 'roleBackground', component: PublicBackground, props: route => ({ role: route.params.role }) },
    ]
  },
  {
    path: '/rules/:role',
    name: 'publicRules',
    component: HeaderLayout,
    props: true,
    children: [
      { path: '', name: 'roleRules', component: PublicRules, props: route => ({ role: route.params.role }) },
    ]
  },
  {
    path: '/certificate/:role',
    name: 'publicCertificate',
    component: HeaderLayout,
    props: true,
    children: [
      { path: '', name: 'roleCertificate', component: PublicCertificate, props: route => ({ role: route.params.role }) },
    ]
  },
  {
    path: '/my-activity/:role',
    name: 'publicMyActivity',
    component: HeaderLayout,
    props: true,
    children: [
      { path: '', name: 'roleMyActivity', component: PublicMyActivity, props: route => ({ role: route.params.role }) },
    ]
  },
  {
    path: '/submitted-activity/:role',
    name: 'submittedActivity',
    component: HeaderLayout,
    props: true,
    children: [
      { path: '', name: 'roleSubmittedActivity', component: SubmittedActivity, props: route => ({ role: route.params.role }) },
    ]
  },
  {
    path: '/submitted-activity-detail/:role',
    name: 'submittedActivityDetail',
    component: HeaderLayout,
    props: true,
    children: [
      { path: '', name: 'roleSubmittedActivityDetail', component: SubmittedActivityDetail, props: route => ({ role: route.params.role }) },
    ]
  },
  {
    path: '/new-activity/:role',
    name: 'newActivity',
    component: HeaderLayout,
    props: true,
    children: [
      { path: '', name: 'roleNewActivity', component: NewActivity, props: route => ({ role: route.params.role }) },
    ]
  },
  {
    path: '/user-profile/:role',
    name: 'publicUserProfile',
    component: HeaderLayout,
    props: true,
    children: [
      { path: '', name: 'roleUserProfile', component: PublicUserProfile, props: route => ({ role: route.params.role }) },
    ]
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 全局路由守卫
// router.beforeEach((to, from, next) => {
//   const role = to.params.role
//   console.log('beforeEach to.path',to.path)
//   const npoRouter = ['newActivity', 'submittedActivity', 'submittedActivityDetail']
//   if (role) {
//     if (role === 'volunteer' || role === 'npo') {
//       next()
//     } else {
//       next({
//         name: '404'
//       })
//     }
//   } else {
//     next('/')
//   }
// })

export default router