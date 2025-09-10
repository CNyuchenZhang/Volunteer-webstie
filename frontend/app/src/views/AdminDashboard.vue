<template>
  <div class="admin-dashboard">
    <h2>Admin Dashboard</h2>
    
    <div v-if="dashboardData">
      <div class="stats">
        <div class="stat-card">
          <h3>NPOs</h3>
          <p>{{ dashboardData.stats.npo_count }}</p>
        </div>
        <div class="stat-card">
          <h3>Visitors</h3>
          <p>{{ dashboardData.stats.visitor_count }}</p>
        </div>
        <div class="stat-card">
          <h3>Events</h3>
          <p>{{ dashboardData.stats.event_count }}</p>
        </div>
        <div class="stat-card">
          <h3>Admins</h3>
          <p>{{ dashboardData.stats.admin_count }}</p>
        </div>
      </div>
      
      <div class="section">
        <h3>Recent Events</h3>
        <div v-for="event in dashboardData.recent_events" :key="event.id" class="event-card">
          <h4>{{ event.title }}</h4>
          <p>{{ event.description }}</p>
          <p>Date: {{ formatDate(event.date) }}</p>
          <p>Organization: {{ event.npo.organization_name }}</p>
        </div>
      </div>
    </div>
    <div v-else>
      <p>Loading dashboard data...</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'AdminDashboard',
  data() {
    return {
      dashboardData: null
    }
  },
  async mounted() {
    await this.fetchDashboardData()
  },
  methods: {
    async fetchDashboardData() {
      try {
        const response = await axios.get('http://localhost:8000/api/admin/dashboard/')
        this.dashboardData = response.data
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      }
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString()
    }
  }
}
</script>

<style scoped>
.admin-dashboard {
  padding: 20px;
}

.stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 30px;
}

.stat-card {
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 5px;
  text-align: center;
  min-width: 120px;
}

.stat-card h3 {
  margin: 0 0 10px 0;
  color: #666;
}

.stat-card p {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
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