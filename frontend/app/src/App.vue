<template>
  <div id="app">
    <!-- 添加临时测试内容 -->
    <div v-if="false" style="background: red; padding: 20px; color: white;">
      <h1>Vue应用已加载！</h1>
    </div>
    
    <router-view />
  </div>
</template>

<script setup lang="ts">
// 这里可以添加全局逻辑
</script>

<style>
#app {
  min-height: 100vh;
  background-color: #f6f7f9;
  font-family: Arial, sans-serif;
}
body {
  margin: 0;
}
</style>