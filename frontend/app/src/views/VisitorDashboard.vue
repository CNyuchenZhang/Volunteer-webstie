<template>
  <div class="visitor-dashboard">
    <h2>Visitor Dashboard</h2>
    <div v-if="profile">
      <h3>Welcome, {{ profile.user }}</h3>
      
      <div class="section">
        <h4>Available Events</h4>
        <div v-for="event in events" :key="event.id" class="event-card">
          <h5>{{ event.title }}</h5>
          <p>{{ event.description }}</p>
          <p>Date: {{ formatDate(event.date) }}</p>
          <p>Location: {{ event.location }}</p>
          <p>Organization: {{ event.npo.organization_name }}</p>
          <button @click="registerForEvent(event.id)">Register</button>
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
  name: 'VisitorDashboard',
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
        const response = await axios.get('http://localhost:8000/api/visitor/profiles/my_profile/')
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
    async registerForEvent(eventId) {
      try {
        await axios.post('http://localhost:8000/api/visitor/registrations/register/', {
          event_id: eventId
        })
        alert('Successfully registered for the event!')
      } catch (error) {
        alert('Registration failed: ' + (error.response?.data?.error || 'Unknown error'))
      }
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString()
    }
  }
}
</script>

<style scoped>
.visitor-dashboard {
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

button {
  padding: 8px 16px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>