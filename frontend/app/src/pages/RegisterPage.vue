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
            :loading="loading"
            :disabled="loading"
          >
            {{ loading ? '注册中...' : '注册' }}
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
import { ElMessage } from 'element-plus'

// 引入条款弹窗
import TermsDialog from '../components/TermsDialog.vue'
import PrivacyDialog from '../components/PrivacyDialog.vue'

// 引入API
import { registerUser } from '../api/index'
import { UserCharacter } from '../types/api'

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
const loading = ref(false)

// 控制弹窗显示
const showTerms = ref(false)
const showPrivacy = ref(false)

// 表单验证
function validate() {
  // 用户名验证：最大20字符，只能包含字母、数字、_、@、+、.、-，必须包含至少一个字母
  const usernameValid = /^[a-zA-Z0-9_@+.-]{1,20}$/.test(username.value) && /[a-zA-Z]/.test(username.value)
  
  // 密码验证：至少8位，包含大写字母、小写字母、数字、特殊字符
  const passwordValid = password.value.length >= 8 &&
    /[A-Z]/.test(password.value) &&
    /[a-z]/.test(password.value) &&
    /[0-9]/.test(password.value) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(password.value)
  
  if (!usernameValid) {
    if (username.value.length > 20) {
      error.value = '用户名长度不能超过20个字符'
    } else if (!/^[a-zA-Z0-9_@+.-]+$/.test(username.value)) {
      error.value = '用户名只能包含字母、数字、_、@、+、.、-这些字符'
    } else if (!/[a-zA-Z]/.test(username.value)) {
      error.value = '用户名必须包含至少一个字母'
    } else {
      error.value = '用户名格式不正确'
    }
    return false
  }
  
  if (!passwordValid) {
    if (password.value.length < 8) {
      error.value = '密码长度至少8位'
    } else if (!/[A-Z]/.test(password.value)) {
      error.value = '密码必须包含至少一个大写字母'
    } else if (!/[a-z]/.test(password.value)) {
      error.value = '密码必须包含至少一个小写字母'
    } else if (!/[0-9]/.test(password.value)) {
      error.value = '密码必须包含至少一个数字'
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password.value)) {
      error.value = '密码必须包含至少一个特殊字符 (!@#$%^&*(),.?":{}|<>)'
    } else {
      error.value = '密码格式不正确'
    }
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
async function submitRegister() {
  if (!validate()) return
  
  loading.value = true
  error.value = ''
  
  try {
    // 加密密码
    const hashedPassword = sha256(password.value).toString()
    
    // 映射角色字符串到数字
    let characterCode: UserCharacter
    switch (role) {
      case 'volunteer':
        characterCode = UserCharacter.VOLUNTEER
        break
      case 'npo':
        characterCode = UserCharacter.NPO
        break
      case 'admin':
        characterCode = UserCharacter.ADMIN
        break
      default:
        throw new Error('不支持的用户类型')
    }
    
    // 调用注册API
    const response = await registerUser({
      username: username.value,
      Character: characterCode,
      password: hashedPassword
    })
    
    console.log('Register successful:', response)
    ElMessage.success('注册成功！正在跳转到登录页面...')
    
    // 注册成功跳转登录
    setTimeout(() => {
      router.push({ name: 'login', params: { role } })
    }, 1500)
    
  } catch (err: any) {
    console.error('Register failed:', err)
    
    // 根据错误状态码显示不同错误信息
    if (err.status === 409) {
      error.value = '用户名已存在，请更换用户名'
    } else if (err.status === 400) {
      // 使用后端返回的具体错误信息
      error.value = err.message || '请求参数错误，请检查输入信息'
    } else {
      error.value = err.message || '注册失败，请稍后重试'
    }
    
    ElMessage.error(error.value)
  } finally {
    loading.value = false
  }
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