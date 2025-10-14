<template>
    <div class="public-background">
        <!-- 面包屑 -->
         <el-breadcrumb :separator-icon="ArrowRight">
            <el-breadcrumb-item :to="{ path: `/home/${role}` }">Home</el-breadcrumb-item>
            <el-breadcrumb-item>{{ capitalizeFirstLetter(role) }} UP Rules</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 背景内容 -->
        <div class="background-content">
            <div class="background-header">
                <img style="width: 100%;" src="../assets/images/Logo/logo3.svg" alt="">
            </div>
            <!-- 背景介绍 -->
             <div class="background-intro">
                <vue-office-docx :src="docxFile" />
             </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ArrowRight } from '@element-plus/icons-vue'
import { ref } from 'vue'
import { capitalizeFirstLetter } from '../utils/index'

import VueOfficeDocx from '@vue-office/docx'
import '@vue-office/docx/lib/index.css'

import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const role = route.params.role as string

const activeIndex = ref('1')

const docxFile = ref('')
docxFile.value = '/volunteer up rules.docx'

const handleSelect = (index: string) => {
  activeIndex.value = index
}
</script>
<style scoped>
.public-background {
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
