<template>
  <div class="home-container">
    <el-card class="welcome-card">
      <div class="header">
        <h1 class="title">欢迎来到志愿者门户</h1>
        <p class="subtitle">请选择您的身份角色开始您的志愿者之旅</p>
      </div>

      <div class="role-selection">
        <el-card 
          class="role-card" 
          shadow="hover" 
          @click="selectRole('volunteer')"
        >
          <div class="role-icon volunteer-icon">
            <i class="el-icon-user"></i>
          </div>
          <h3 class="role-title">志愿者</h3>
          <p class="role-desc">作为志愿者参与活动，贡献您的爱心和时间</p>
          <el-button type="primary" round>选择此角色</el-button>
        </el-card>

        <el-card 
          class="role-card" 
          shadow="hover" 
          @click="selectRole('npo')"
        >
          <div class="role-icon npo-icon">
            <i class="el-icon-office-building"></i>
          </div>
          <h3 class="role-title">非营利组织</h3>
          <p class="role-desc">作为组织方发布活动，管理志愿者团队</p>
          <el-button type="success" round>选择此角色</el-button>
        </el-card>
      </div>

      <div class="footer-note">
        <el-alert 
          title="管理员功能当前处于维护中" 
          type="info" 
          :closable="false"
          show-icon
        />
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

function selectRole(role: string) {
  router.push({ name: 'login', params: { role } })
  
  const roleName = role === 'volunteer' ? '志愿者' : '非营利组织'
  ElMessage.success(`已选择角色: ${roleName}`)
}
</script>

<style scoped>
.home-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%);
  padding: 20px;
}

.welcome-card {
  width: 100%;
  max-width: 900px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  padding: 40px;
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.title {
  color: #303133;
  font-size: 2.5rem;
  margin-bottom: 15px;
  font-weight: 700;
  position: relative;
  display: inline-block;
}

.title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 4px;
  background: linear-gradient(90deg, #409EFF, #67C23A);
  border-radius: 2px;
}

.subtitle {
  color: #606266;
  font-size: 1.2rem;
  line-height: 1.6;
}

.role-selection {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 30px;
  margin: 30px 0;
}

.role-card {
  width: 280px;
  border-radius: 12px;
  padding: 30px 20px;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;
  text-align: center;
}

.role-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  border-color: #409EFF;
}

.role-icon {
  font-size: 3.5rem;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80px;
}

.volunteer-icon {
  color: #409EFF;
}

.npo-icon {
  color: #67C23A;
}

.role-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: #303133;
  margin-bottom: 15px;
}

.role-desc {
  color: #909399;
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 20px;
  min-height: 70px;
}

.footer-note {
  margin-top: 30px;
}

@media (max-width: 768px) {
  .welcome-card {
    padding: 30px 20px;
  }
  
  .role-selection {
    flex-direction: column;
    align-items: center;
  }
  
  .title {
    font-size: 2rem;
  }
  
  .role-card {
    width: 100%;
    max-width: 350px;
  }
}
</style>