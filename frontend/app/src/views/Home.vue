<template>
  <div class="home">
    <h1>Welcome to the Volunteer-up Platform</h1>
    <p>This is a platform connecting Non-Profit Organizations, Visitors, and Administrators.</p>
    
    <div v-if="!isAuthenticated">
      <router-link to="/login" class="btn btn-primary">Login</router-link>
    </div>
    
    <div v-else>
      <p>Welcome back, {{ currentUser.username }}!</p>
      <router-link to="/dashboard" class="btn btn-primary">Go to Dashboard</router-link>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Home',
  computed: {
    ...mapGetters(['isAuthenticated', 'currentUser'])
  }
}
</script>

<style scoped>
.home {
  padding: 40px;
}

.btn {
  display: inline-block;
  padding: 10px 20px;
  margin: 10px;
  background-color: #42b983;
  color: white;
  text-decoration: none;
  border-radius: 5px;
}

.btn-primary {
  background-color: #42b983;
}
</style>