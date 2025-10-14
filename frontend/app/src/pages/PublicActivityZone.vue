<template>
    <div class="public-activity-zone">
        <!-- 面包屑 -->
        <el-breadcrumb>
            <el-breadcrumb-item>Activity Zone</el-breadcrumb-item>
        </el-breadcrumb>
        <div class="container">
            <div class="search">
                <el-form inline>
                    <el-form-item label="Filter by">
                        <!-- 下拉选择 -->
                        <el-select v-model="selectedCategory" placeholder="Select a category" style="width: 200px;">
                            <el-option v-for="category in categories" :key="category" :label="category" :value="category" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Filter by:Date from">
                        <!-- 日期期间选择器 -->
                        <el-date-picker
                            v-model="dateRange"
                            type="daterange"
                            value-format="yyyy-MM-dd"
                            range-separator="to"
                            start-placeholder="Start Date"
                            end-placeholder="End Date"
                            style="width: 300px;"
                        />
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" :icon="Search">Search</el-button>
                    </el-form-item>
                </el-form>
            </div>
            <div class="activity-zone-list">
                <ActivityZoneCard v-for="activityZone in activityZones" :key="activityZone.id" :activityZone="activityZone" />
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import ActivityZoneCard from '../components/ActivityZoneCard.vue'
import { ref } from 'vue'

const selectedCategory = ref('ALL')
const categories = ['All', 'Category 1', 'Category 2', 'Category 3']
const dateRange = ref([])

const activityZones = ref([
    {
        id: '1',
        name: 'Pick Up Rubbish on Chick Land',
        category: 'Category 1',
        date: '2023-12-01',
        location: 'Location 1'
    },
    {
        id: '2',
        name: 'Pick Up Rubbish on Chick Land',
        category: 'Category 2',
        date: '2023-12-01',
        location: 'Location 2'
    },
    {
        id: '3',
        name: 'Pick Up Rubbish on Chick Land',
        category: 'Category 3',
        date: '2023-12-02',
        location: 'Location 3'
    },
    {
        id: '4',
        name: 'Pick Up Rubbish on Chick Land',
        category: 'Category 4',
        date: '2023-12-03',
        location: 'Location 4'
    }
])
</script>
<style scoped>
.public-activity-zone {
    width: 1200px;
    margin: 0 auto;
    padding: 24px 0;
}

.container {
     margin-top: 24px;
    padding: 24px;
    background-color: #fff;
    border-radius: 8px;
}
.activity-zone-list {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
}
.search .el-form-item__label {
    font-size: 14px;
    color: #606266;
}
</style>