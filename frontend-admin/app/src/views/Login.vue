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
          <el-button type="primary" @click="handleLogin">Login</el-button>
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

export default defineComponent({
  setup() {
    const router = useRouter()
    const store = useAdminStore()
    const loginForm = ref<any>(null)

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
    const handleLogin = () => {
      loginForm.value.validate((valid: boolean) => {
        if (!valid) return
        // 测试账号
        if (form.username === 'jn1016' && form.password === '123456789qwe') {
          store.login(form.username)
          ElMessage.success('登录成功')
          router.push('/dashboard')
        } else {
          ElMessage.error('账号或密码错误，请重新输入')
        }
      })
    }

    return { form, loginForm, handleLogin, usernameRules, passwordRules }
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

