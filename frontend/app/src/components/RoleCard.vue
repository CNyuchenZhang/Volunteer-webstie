<template>
  <el-card class="role-card" @click="handleClick">
    <p>{{props.role }}</p>
  </el-card>
</template>

<script setup lang="ts">
const props = defineProps<{ role: string }>();
const emit = defineEmits(['select']);

function handleClick() {
  emit('select');
}
</script>

<style scoped>
.role-card {
  width: 150px;
  text-align: center;
  cursor: pointer;
}
</style>
