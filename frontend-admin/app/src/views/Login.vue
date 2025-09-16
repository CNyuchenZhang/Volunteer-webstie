<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2>Admin Login</h2>
      <el-form :model="form" ref="loginForm">
        <el-form-item label="Username" :rules="usernameRules" prop="username">
          <el-input v-model="form.username" placeholder="Enter admin username"></el-input>
        </el-form-item>

        <el-form-item label="Password" :rules="passwordRules" prop="password">
          <el-input v-model="form.password" type="password" placeholder="Enter password"></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleLogin" :loading="loading">Login</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAdminStore } from '../store/admin'
import { loginUser } from '../api'

export default defineComponent({
  setup() {
    const router = useRouter()
    const store = useAdminStore()
    const loginForm = ref<any>(null)
    const loading = ref(false)

    // 表单数据
    const form = reactive({
      username: '',
      password: ''
    })

    // 用户名校验规则：5-12位字母+数字
    const usernameRules = [
      {
        validator: (rule: any, value: string, callback: any) => {
          const regex = /^[A-Za-z0-9]{5,12}$/
          if (!regex.test(value)) callback(new Error('用户名必须为5-12位字母+数字'))
          else callback()
        },
        trigger: 'blur'
      }
    ]

    // 密码校验规则：12位字母+数字
    const passwordRules = [
      {
        validator: (rule: any, value: string, callback: any) => {
          const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{12}$/
          if (!regex.test(value)) callback(new Error('密码必须为12位字母+数字'))
          else callback()
        },
        trigger: 'blur'
      }
    ]

    // 登录处理
    const handleLogin = async () => {
      try {
        const valid = await loginForm.value.validate()
        if (!valid) return

        loading.value = true
        
        // 调用API登录接口
        const response = await loginUser({
          username: form.username,
          password: form.password
        })
        
        // 登录成功
        store.login(form.username)
        ElMessage.success('登录成功')
        router.push('/dashboard')
        
      } catch (error: any) {
        console.error('Login error:', error)
        ElMessage.error(error.message || '登录失败，请检查用户名和密码')
      } finally {
        loading.value = false
      }
    }

    return { form, loginForm, handleLogin, usernameRules, passwordRules, loading }
  }
})
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.login-card {
  width: 400px;
  padding: 20px;
}
</style>

