<template>
  <div id="app">
    <nav v-if="$route.path !== '/'">
      <router-link to="/">Home</router-link> |
      <router-link to="/login" v-if="!isAuthenticated">Login</router-link>
      <template v-else>
        <router-link to="/dashboard">Dashboard</router-link> |
        <a href="#" @click="logout">Logout</a>
      </template>
    </nav>
    <router-view/>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'App',
  computed: {
    ...mapGetters(['isAuthenticated', 'currentUser'])
  },
  methods: {
    ...mapActions(['logoutUser']),
    async logout() {
      await this.logoutUser()
      this.$router.push('/')
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
  margin: 0 10px;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>