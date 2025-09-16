<template>
  <div class="dashboard-container">
    <el-header>
      <div class="header-left">Admin Dashboard</div>
      <div class="header-right">
        <el-button type="danger" @click="handleLogout">Logout</el-button>
      </div>
    </el-header>

    <el-main>
      <h3>Welcome, {{ username }}</h3>
      <p>Dashboard 功能将在后续开发</p>
    </el-main>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useAdminStore } from '../store/admin'

export default defineComponent({
  setup() {
    const router = useRouter()
    const store = useAdminStore()
    const username = store.username

    // 登出处理
    const handleLogout = () => {
      ElMessageBox.confirm('是否确认登出?', '提示', {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'warning'
      })
        .then(() => {
          store.logout()
          ElMessage.success('已登出')
          router.push('/login')
        })
        .catch(() => {
          // 取消登出，不做操作
        })
    }

    return { username, handleLogout }
  }
})
</script>

<style scoped>
.dashboard-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.el-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #409EFF;
  color: white;
  padding: 0 20px;
}

.el-main {
  flex: 1;
  padding: 20px;
}
</style>
