import { createRouter, createWebHistory } from 'vue-router'

import HeaderLayout from '../components/HeaderLayout.vue'

import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Rules from '../views/Rules.vue'
import Certificate from '../views/Certificate.vue'
import Background from '../views/Background.vue'
import UserProfile from '../views/UserProfile.vue'
import Workplace from '../views/Workplace.vue'
import Approvals from '../views/Approvals.vue'
import ApprovalsDetail from '../views/ApprovalsDetail.vue'
import ReviewedActivities from '../views/ReviewedActivities.vue'

const routes = [
  { path: '/', name: 'Home', component: Login },
  { path: '/login', name: 'Login', component: Login },
  { 
    path: '/dashboard', 
    name: 'Dashboard', 
    component: HeaderLayout, 
    children: [
      { path: '', name: 'DashboardPage', component: Dashboard },
    ] 
  },
  { 
    path: '/rules', 
    name: 'Rules', 
    component: HeaderLayout, 
    children: [
      { path: '', name: 'RulesPage', component: Rules },
    ] 
  },
  { 
    path: '/certificate', 
    name: 'Certificate', 
    component: HeaderLayout, 
    children: [
      { path: '', name: 'CertificatePage', component: Certificate },
    ] 
  },
  {
    path: '/background',
    name: 'Background',
    component: HeaderLayout,
    children: [
      { path: '', name: 'BackgroundPage', component: Background },
    ]
  },
  { 
    path: '/user-profile', 
    name: 'UserProfile', 
    component: HeaderLayout, 
    children: [
      { path: '', name: 'UserProfilePage', component: UserProfile },
    ] 
  },
  {
    path: '/workplace',
    name: 'Workplace',
    component: HeaderLayout,
    children: [
      { path: '', name: 'WorkplacePage', component: Workplace },
    ]
  },
  {
    path: '/approvals',
    name: 'Approvals',
    component: HeaderLayout,
    children: [
      { path: '', name: 'ApprovalsPage', component: Approvals },
    ]
  },
  {
    path: '/approvals/:id',
    name: 'ApprovalsDetail',
    component: HeaderLayout,
    children: [
      { path: '', name: 'ApprovalsDetailPage', component: ApprovalsDetail },
    ]
  },
  {
    path: '/reviewed-activities',
    name: 'ReviewedActivities',
    component: HeaderLayout,
    children: [
      { path: '', name: 'ReviewedActivitiesPage', component: ReviewedActivities },
    ]
  },
]

const router = createRouter({
  history: createWebHistory('/admin/'),
  routes
})

export default router

