<template>
  <div class="auth-container">
    <h2>Login as {{ role }}</h2>
    <form @submit.prevent="submitLogin">
      <!-- 用户名输入 -->
      <div>
        <label>Username:</label>
        <input v-model="username" placeholder="Enter username" />
      </div>

      <!-- 密码输入 -->
      <div>
        <label>Password:</label>
        <input type="password" v-model="password" placeholder="Enter password" />
      </div>

      <!-- 同意条款复选框 -->
      <div>
        <input type="checkbox" v-model="acceptedTerms" />
        Read and accept the
        <span @click="showTerms = true" style="text-decoration: underline; cursor: pointer"
          >Terms of Service</span
        >
        and
        <span @click="showPrivacy = true" style="text-decoration: underline; cursor: pointer"
          >Privacy Policy</span
        >
      </div>

      <button type="submit">Login</button>
    </form>

    <p>
      Do not have an account?
      <span @click="goRegister" style="text-decoration: underline; cursor: pointer">
        Start from here to register! :)
      </span>
    </p>

    <div v-if="error" style="color: red">{{ error }}</div>

    <!-- 弹窗组件 -->
    <TermsDialog v-model="showTerms" />
    <PrivacyDialog v-model="showPrivacy" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import sha256 from 'crypto-js/sha256'

// 引入条款弹窗
import TermsDialog from '../components/TermsDialog.vue'
import PrivacyDialog from '../components/PrivacyDialog.vue'

const route = useRoute()
const router = useRouter()

const role = route.params.role as string
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
    error.value = 'Username must be 5-12 characters and include letters and numbers'
    return false
  }
  if (!passwordValid) {
    error.value = 'Password must be 12 characters and include letters and numbers'
    return false
  }
  if (!acceptedTerms.value) {
    error.value = 'You must accept Terms and Privacy Policy'
    return false
  }
  return true
}

// 提交登录
function submitLogin() {
  if (!validate()) return
  // 模拟加密
  const hashedPassword = sha256(password.value).toString()
  console.log(`Login as ${role}: username=${username.value}, password=${hashedPassword}`)

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
.auth-container {
  max-width: 400px;
  margin: 50px auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
}
input[type='text'],
input[type='password'] {
  width: 100%;
  padding: 5px;
}
button {
  padding: 8px 15px;
  cursor: pointer;
}
</style>
