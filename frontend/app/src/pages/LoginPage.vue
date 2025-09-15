<template>
  <div class="login-container">
    <el-card class="login-card">
      <div class="login-header">
        <h1 class="login-title">登录Login {{ roleDisplayName }}</h1>
        <p class="login-subtitle">请使用您的账号登录系统</p>
      </div>

      <el-form class="login-form" @submit.prevent="submitLogin">
        <!-- 用户名输入 -->
        <el-form-item>
          <el-input
            v-model="username"
            placeholder="请输入用户名"
            prefix-icon="el-icon-user"
            size="large"
          />
        </el-form-item>

        <!-- 密码输入 -->
        <el-form-item>
          <el-input
            v-model="password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="el-icon-lock"
            size="large"
            show-password
          />
        </el-form-item>

        <!-- 同意条款复选框 -->
        <el-form-item class="terms-agreement">
          <el-checkbox v-model="acceptedTerms">
            I have read and agree to 
            <el-link type="primary" @click="showTerms = true">Terms of Service</el-link>
            and
            <el-link type="primary" @click="showPrivacy = true">Privacy Policy</el-link>
          </el-checkbox>
        </el-form-item>

        <!-- 登录按钮 -->
        <el-form-item>
          <el-button 
            type="primary" 
            size="large" 
            native-type="submit"
            class="login-button"
          >
            登录Login
          </el-button>
        </el-form-item>

        <!-- 错误提示 -->
        <el-alert 
          v-if="error" 
          :title="error" 
          type="error" 
          show-icon 
          :closable="false"
          class="error-alert"
        />
      </el-form>

      <div class="register-link">
        <p>
          还没有账号?Have no account?
          <el-link type="primary" @click="goRegister">
            立即注册Register Now
          </el-link>
        </p>
      </div>
    </el-card>

    <!-- 条款弹窗 -->
    <TermsDialog v-model="showTerms" />
    <PrivacyDialog v-model="showPrivacy" />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import sha256 from 'crypto-js/sha256'

// 引入条款弹窗
import TermsDialog from '../components/TermsDialog.vue'
import PrivacyDialog from '../components/PrivacyDialog.vue'

const route = useRoute()
const router = useRouter()

// 角色显示名称映射
const roleDisplayMap: Record<string, string> = {
  volunteer: 'Volunteer',
  npo: 'NPO',
  admin: '管理员'
}

const role = route.params.role as string
const roleDisplayName = computed(() => roleDisplayMap[role] || role)

const username = ref('')
const password = ref('')
const acceptedTerms = ref(false)
const error = ref('')

// 控制弹窗显示
const showTerms = ref(false)
const showPrivacy = ref(false)

// 表单验证
function validate() {
  const usernameValid = /^[A-Za-z0-9]{5,12}$/.test(username.value)
  const passwordValid = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{12}$/.test(password.value)
  
  if (!usernameValid) {
    error.value = '用户名必须为5-12位字母和数字组合'
    return false
  }
  
  if (!passwordValid) {
    error.value = '密码必须为12位，包含字母和数字'
    return false
  }
  
  if (!acceptedTerms.value) {
    error.value = '请阅读并同意服务条款和隐私政策'
    return false
  }
  
  error.value = ''
  return true
}

// 提交登录
function submitLogin() {
  if (!validate()) return
  
  // 模拟加密
  const hashedPassword = sha256(password.value).toString()
  console.log(`Login as ${role}: username=${username.value}, password=${hashedPassword}`)

  // 根据角色跳转到不同仪表盘
  if (role === 'volunteer') router.push('/dashboard/volunteer')
  else if (role === 'npo') router.push('/dashboard/npo')
  else if (role === 'admin') router.push('/dashboard/admin')
}

// 跳转注册页面
function goRegister() {
  router.push({ name: 'register', params: { role } })
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 480px;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  padding: 40px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-title {
  color: #303133;
  font-size: 1.8rem;
  margin-bottom: 10px;
  font-weight: 700;
}

.login-subtitle {
  color: #909399;
  font-size: 1rem;
}

.login-form {
  margin-top: 20px;
}

.login-button {
  width: 100%;
  font-size: 1rem;
  font-weight: 500;
  height: 48px;
}

.register-link {
  text-align: center;
  margin-top: 20px;
  color: #606266;
  font-size: 0.95rem;
}

.register-link p {
  margin: 0;
}

.error-alert {
  margin-top: 15px;
}

.terms-agreement {
  margin-top: 10px;
}

:deep(.el-input__inner) {
  height: 48px;
  line-height: 48px;
}

:deep(.el-input__prefix) {
  display: flex;
  align-items: center;
}

@media (max-width: 600px) {
  .login-card {
    padding: 30px 20px;
  }
  
  .login-title {
    font-size: 1.6rem;
  }
}
</style>