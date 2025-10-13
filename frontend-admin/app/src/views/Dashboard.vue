<template>
  <div class="dashboard-page">
    <!-- 面包屑 -->
    <el-breadcrumb>
      <el-breadcrumb-item>Dashboard</el-breadcrumb-item>
    </el-breadcrumb>
    <div class="dashboard-content">
      <div class="menu">
        <div class="logo">
          <img src="../assets/images/Logo/logo2.svg" alt="logo">
        </div>
        <el-menu
          @select="handleSelect"
        >
          <el-menu-item v-for="item in menuItems" :key="item.index" :index="item.index">
            {{ item.title }}
          </el-menu-item>
        </el-menu>
      </div>
      <div class="banner">
        <el-carousel>
          <el-carousel-item>
            <img src="../assets/images/home_banner/l1.jpg" alt="">
          </el-carousel-item>
          <el-carousel-item>
            <img src="../assets/images/home_banner/l2.jpg" alt="">
          </el-carousel-item>
          <el-carousel-item>
            <img src="../assets/images/home_banner/l3.jpg" alt="">
          </el-carousel-item>
          <el-carousel-item>
            <img src="../assets/images/home_banner/l4.jpg" alt="">
          </el-carousel-item>
          <el-carousel-item>
            <img src="../assets/images/home_banner/l5.jpg" alt="">
          </el-carousel-item>
          <el-carousel-item>
            <img src="../assets/images/home_banner/l6.jpg" alt="">
          </el-carousel-item>
          <el-carousel-item>
            <img src="../assets/images/home_banner/l7.jpg" alt="">
          </el-carousel-item>
          <el-carousel-item>
            <img src="../assets/images/home_banner/l8.jpg" alt="">
          </el-carousel-item>
        </el-carousel>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'

import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const role = route.params.role as string


const menuItems = ref([
  { title: `Volunteer UP Background `, index: '/background' },
  { title: `Volunteer UP Rules `, index: '/rules' },
  { title: `Volunteer UP Certificate `, index: '/certificate' },
])

const handleSelect = (index: string) => {
  router.push(index)
}
</script>
<style scoped>
.dashboard-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 0;
}
.dashboard-content {
  display: flex;
  margin-top: 24px;
}
.dashboard-content .menu {
  margin-right: 24px;
  width: 400px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}
.dashboard-content .menu .logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.dashboard-content .menu :deep(.el-menu) {
  border-right: 0;
}
.dashboard-content .banner {
  flex: 1;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}
.dashboard-content .banner :deep(.el-carousel) {
  height: 100%;
}
.dashboard-content .banner :deep(.el-carousel__container) {
  height: 100%;
}
.dashboard-content .banner :deep(.el-carousel__item img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
