<template>
  <div class="register-container">
    <el-card class="register-card">
      <div class="register-header">
        <h1 class="register-title">注册 {{ roleDisplayName }}</h1>
        <p class="register-subtitle">请填写您的账号信息完成注册</p>
      </div>

      <el-form class="register-form" @submit.prevent="submitRegister">
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

        <!-- 确认密码输入 -->
        <el-form-item>
          <el-input
            v-model="confirmPassword"
            type="password"
            placeholder="请确认密码"
            prefix-icon="el-icon-lock"
            size="large"
            show-password
          />
        </el-form-item>

        <!-- 同意条款复选框 -->
        <el-form-item class="terms-agreement">
          <el-checkbox v-model="acceptedTerms">
            我已阅读并同意
            <el-link type="primary" @click="showTerms = true">服务条款</el-link>
            和
            <el-link type="primary" @click="showPrivacy = true">隐私政策</el-link>
          </el-checkbox>
        </el-form-item>

        <!-- 注册按钮 -->
        <el-form-item>
          <el-button 
            type="primary" 
            size="large" 
            native-type="submit"
            class="register-button"
          >
            注册
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

      <div class="login-link">
        <p>
          已有账号?
          <el-link type="primary" @click="goLogin">
            立即登录
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
  volunteer: '志愿者',
  npo: '非营利组织',
  admin: '管理员'
}

const role = route.params.role as string
const roleDisplayName = computed(() => roleDisplayMap[role] || role)

const username = ref('')
const password = ref('')
const confirmPassword = ref('')
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
  
  if (password.value !== confirmPassword.value) {
    error.value = '两次输入的密码不一致'
    return false
  }
  
  if (!acceptedTerms.value) {
    error.value = '请阅读并同意服务条款和隐私政策'
    return false
  }
  
  error.value = ''
  return true
}

// 提交注册
function submitRegister() {
  if (!validate()) return
  
  // 模拟加密
  const hashedPassword = sha256(password.value).toString()
  console.log(`Register as ${role}: username=${username.value}, password=${hashedPassword}`)
  
  // 注册成功跳转登录
  router.push({ name: 'login', params: { role } })
}

// 跳转登录页面
function goLogin() {
  router.push({ name: 'login', params: { role } })
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%);
  padding: 20px;
}

.register-card {
  width: 100%;
  max-width: 480px;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  padding: 40px;
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.register-title {
  color: #303133;
  font-size: 1.8rem;
  margin-bottom: 10px;
  font-weight: 700;
}

.register-subtitle {
  color: #909399;
  font-size: 1rem;
}

.register-form {
  margin-top: 20px;
}

.register-button {
  width: 100%;
  font-size: 1rem;
  font-weight: 500;
  height: 48px;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  color: #606266;
  font-size: 0.95rem;
}

.login-link p {
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
  .register-card {
    padding: 30px 20px;
  }
  
  .register-title {
    font-size: 1.6rem;
  }
}
</style>