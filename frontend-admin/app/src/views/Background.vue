<template>
    <div class="background">
        <!-- 面包屑 -->
         <el-breadcrumb :separator-icon="ArrowRight">
            <el-breadcrumb-item :to="{ path: `/dashboard` }">Dashboard</el-breadcrumb-item>
            <el-breadcrumb-item>Volunteer UP Background</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 背景内容 -->
        <div class="background-content">
            <div class="background-header">
                <img style="width: 100%;" src="../assets/images/Logo/logo3.svg" alt="">
            </div>
            <!-- 背景介绍 -->
            <div class="background-intro">
              <vue-office-docx style="border: 1px solid #eee;" :src="docxFile" />
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ArrowRight } from '@element-plus/icons-vue'
import { ref } from 'vue'

import VueOfficeDocx from '@vue-office/docx'
import '@vue-office/docx/lib/index.css'

import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const role = route.params.role as string

const activeIndex = ref('1')

const docxFile = ref('')
docxFile.value = '/admin/volunteer up background.docx'

const handleSelect = (index: string) => {
  activeIndex.value = index
}
</script>
<style scoped>
.background {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 0;
}
.background-content {
  padding: 24px 0;
}
.background-header {
  display: flex;
  justify-content: center;
  align-items: center;
}
.background-intro {
  margin-top: 24px;
}
</style>
