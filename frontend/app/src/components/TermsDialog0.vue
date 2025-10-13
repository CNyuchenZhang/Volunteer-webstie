<template>
  <el-dialog :model-value="modelValue" @close="close">
    <p>好巧啊你也来看空白页（TBC)</p>
  </el-dialog>
</template>

<script setup lang="ts">
defineProps<{ modelValue: boolean }>()
const emit = defineEmits(['update:modelValue'])

// 关闭弹窗
function close() {
  emit('update:modelValue', false)
}
</script>