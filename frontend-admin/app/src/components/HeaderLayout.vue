<template>
  <div class="header-layout">
    <div class="header-content">
      <div class="logo">
        <img style="width: auto; height: 60px;" src="../assets/images/Logo/logo5.svg" alt="Volunteer Portal Logo">
      </div>
      <div class="nav">
        <!-- 深色主题 -->
        <el-menu
          :default-active="activeIndex"
          class="nav-menu"
          @select="handleSelect"
          mode="horizontal"
          background-color="#007bbd"
          text-color="#fff"
          active-text-color="#ff9b00"
        >
          <el-menu-item v-for="value in menuItems" :key="value.index" :index="value.index">{{ value.name }}</el-menu-item>
        </el-menu>
      </div>
      <div class="user">
        <!-- <span @click="handleUserClick">{{ userName }}</span> -->
        <el-dropdown placement="bottom" trigger="click">
          <span>{{ userName }}</span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="handleUserClick">
                <el-icon><User /></el-icon>
                Profile
              </el-dropdown-item>
              <el-dropdown-item @click="handleLogOut">
                <el-icon><SwitchButton /></el-icon>
                Log Out
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    <router-view></router-view>
  </div>
</template>
<script lang="ts" setup>
import { User, SwitchButton } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'


import NPOLogo from '../assets/images/Logo/logo1.svg'
import AdminLogo from '../assets/images/Logo/logo5.svg'
import VolunteerLogo from '../assets/images/Logo/logo4.svg'

import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMenuStore } from '../store/menu';

const menuStore = useMenuStore();

const activeIndex = ref(menuStore.activeIndex)
const router = useRouter()
const route = useRoute();
const role = route.params.role as string


const logoUrl: Record<string, string> = {
  'npo': NPOLogo,
  'admin': AdminLogo,
  'volunteer': VolunteerLogo,
}

const userName = ref('User')

const path = ref(route.path)
const menuItems = ref([
  { index: `/dashboard`, name: 'Dashboard' },
  { index: `/workplace`, name: 'Workplace' }
]);

function handleSelect(index: string) {
    console.log(index, 111);
    
  activeIndex.value = index
  menuStore.handleSelect(index);
//   router.push({ path: index })
}

const handleUserClick = () => {
  router.push({ 
    path: `/user-profile`
  })
}

const handleLogOut = () => {
  // 确认弹窗
  ElMessageBox.confirm('Confirm Log Out?', '', {
    confirmButtonText: 'Log Out',
    cancelButtonText: 'Cancel',
    type: 'warning',
  }).then(() => {
    // 确认注销
    router.push({ path: '/' })
  }).catch(() => {
    // 取消注销
  });
}

onMounted(() => {
  console.log(path.value);
});
</script>

<style scoped>
.header-layout .header-content {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 calc((100vw - 1200px) / 2);
  background-color: #007bbd;
}
.header-layout .header-content .logo, .header-layout .header-content .user {
  display: flex;
  /* justify-content: center; */
  align-items: center;
  width: 200px;
  height: 60px;
  /* border-bottom: 2px solid transparent; */
  background-color: #007bbd;
  /* border-bottom: 1px solid #dcdfe6; */
  /* border-top: 1px solid #dcdfe6; */
}
.header-layout .header-content .user {
    justify-content: flex-end;
    padding-right: 20px;
}
.header-layout .header-content .user span {
    display: inline-block;
    width: 32px;
    height: 32px;
    line-height: 32px;
    text-align: center;
    color: #000;
    background-color: #fff;
    border-radius: 50%;
    font-size: 14px;
    cursor: pointer;
}
.header-layout .header-content .nav {
  flex: 1;
}
.header-layout .header-content :deep(.el-menu--horizontal) {
  justify-content: center;
  box-sizing: content-box;
}
</style>
