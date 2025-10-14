<template>
    <div class="public-certificate">
        <!-- 面包屑 -->
         <el-breadcrumb :separator-icon="ArrowRight">
            <el-breadcrumb-item :to="{ path: `/dashboard` }">Dashboard</el-breadcrumb-item>
            <el-breadcrumb-item>Volunteer UP Certificate</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 证书内容 -->
        <div class="certificate-content">
            <img style="width: 100%;" src="../assets/images/Home_cer_rule_bg/Certification.svg" alt="">
        </div>
    </div>
</template>
<script setup lang="ts">
import { ArrowRight } from '@element-plus/icons-vue'
import { capitalizeFirstLetter } from '../utils/index'

import { ref } from 'vue'

import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const role = route.params.role as string

const activeIndex = ref('1')

const handleSelect = (index: string) => {
  activeIndex.value = index
}
</script>
<style scoped>
.public-certificate {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 0;
}
.certificate-content {
  padding: 24px 0;
}
</style>
