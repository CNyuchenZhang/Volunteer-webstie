<template>
  <div class="home-container">
    <h1>Welcome to Volunteer Portal</h1>
    <p>Please choose your character</p>

    <div class="role-selection">
      <button @click="selectRole('volunteer')">Volunteer</button>
      <button @click="selectRole('npo')">NPO</button>
      <button @click="selectRole('admin')">Admin</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function selectRole(role: string) {
  router.push({ name: 'login', params: { role } })
}
</script>

<style scoped>
.home-container {
  text-align: center;
  margin-top: 50px;
}

.role-selection button {
  margin: 10px;
  padding: 10px 20px;
  cursor: pointer;
}
</style>
