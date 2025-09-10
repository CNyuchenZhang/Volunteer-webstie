<template>
  <div class="npo-dashboard">
    <h2>NPO Dashboard</h2>
    <div v-if="profile">
      <h3>Welcome, {{ profile.organization_name }}</h3>
      <p>{{ profile.description }}</p>
      
      <div class="section">
        <h4>Your Events</h4>
        <div v-for="event in events" :key="event.id" class="event-card">
          <h5>{{ event.title }}</h5>
          <p>{{ event.description }}</p>
          <p>Date: {{ formatDate(event.date) }}</p>
          <p>Location: {{ event.location }}</p>
        </div>
      </div>
    </div>
    <div v-else>
      <p>Loading your profile...</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'NpoDashboard',
  data() {
    return {
      profile: null,
      events: []
    }
  },
  async mounted() {
    await this.fetchProfile()
    await this.fetchEvents()
  },
  methods: {
    async fetchProfile() {
      try {
        const response = await axios.get('http://localhost:8000/api/npo/profiles/my_profile/')
        this.profile = response.data
      } catch (error) {
        console.error('Error fetching profile:', error)
      }
    },
    async fetchEvents() {
      try {
        const response = await axios.get('http://localhost:8000/api/npo/events/')
        this.events = response.data
      } catch (error) {
        console.error('Error fetching events:', error)
      }
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString()
    }
  }
}
</script>

<style scoped>
.npo-dashboard {
  padding: 20px;
}

.section {
  margin-top: 30px;
}

.event-card {
  border: 1px solid #ddd;
  padding: 15px;
  margin: 10px 0;
  border-radius: 5px;
}
</style>