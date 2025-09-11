<template>
  <div class="login">
    <h2>Login</h2>
    <form @submit.prevent="handleSubmit">
      <div>
        <label for="username">Username:</label>
        <input type="text" id="username" v-model="username" required>
      </div>
      <div>
        <label for="password">Password:</label>
        <input type="password" id="password" v-model="password" required>
      </div>
      <div>
        <label for="userType">Login as:</label>
        <select id="userType" v-model="userType">
          <option value="visitor">Visitor</option>
          <option value="npo">NPO</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <button type="submit" :disabled="loading">Login</button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'Login',
  data() {
    return {
      username: '',
      password: '',
      userType: 'visitor',
      loading: false,
      error: ''
    }
  },
  methods: {
    ...mapActions(['login']),
    async handleSubmit() {
      this.loading = true
      this.error = ''
      
      try {
        await this.login({
          username: this.username,
          password: this.password,
          user_type: this.userType
        })
        this.$router.push('/dashboard')
      } catch (error) {
        this.error = error.detail || 'Login failed'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.login {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}

form div {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input, select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  padding: 10px 20px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #ccc;
}

.error {
  color: red;
  margin-top: 10px;
}
</style>