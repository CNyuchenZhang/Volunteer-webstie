<template>
    <div class="approvals">
        <el-breadcrumb :separator-icon="ArrowRight">
            <el-breadcrumb-item :to="`/workplace`">Workplace</el-breadcrumb-item>
            <el-breadcrumb-item >Activity Awaiting Approvals</el-breadcrumb-item>
        </el-breadcrumb>
        <div class="container">
            <div class="search">
                <el-form :inline="true">
                    <el-form-item label="Activity Name">
                        <el-input v-model="searchForm.activityName" placeholder="Activity Name" />
                    </el-form-item>
                    <el-form-item label="Submitted Date">
                        <el-date-picker
                            v-model="searchForm.date"
                            type="daterange"
                            value-format="yyyy-MM-dd"
                            range-separator="to"
                            start-placeholder="Start Date"
                            end-placeholder="End Date"
                        />
                    </el-form-item>
                    <el-form-item label="Activity Status">
                        <el-select style="width: 146px;" v-model="searchForm.status" placeholder="Status">
                            <el-option label="Submitted" value="Submitted" />
                            <el-option label="Approved" value="Approved" />
                            <el-option label="Rejected" value="Rejected" />
                        </el-select>
                    </el-form-item>
                    <el-form-item style="margin-right: 0px;">
                        <el-button type="primary" @click="handleSearch">Search</el-button>
                    </el-form-item>
                </el-form>
            </div>
            <el-table :data="activityList" style="width: 100%">
                <el-table-column prop="id" label="ID" width="168" />
                <el-table-column prop="activityName" label="Activity Name"  />
                <el-table-column prop="date" label="Sutmitted Date" width="180" />
                <el-table-column prop="status" label="Activity Status" />
                <el-table-column label="Actions" width="200">
                    <template #default="scope">
                        <el-button type="primary" size="small" @click="handleView(scope.row)">View</el-button>
                        <!-- <el-button type="info" size="small" @click="handleEdit(scope.row)">Edit</el-button> -->
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { ArrowRight } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const router = useRouter()
const role = router.currentRoute.value.params.role

const searchForm = ref({
    activityName: '',
    status: '',
    date: '',
})
const activityList = ref([
    {
        id: '123456',
        activityName: 'Activity 1',
        date: '2023-12-01',
        status: 'Submitted',
        actions: 'View Details',
    },
    {
        id: '654321',
        activityName: 'Activity 2',
        date: '2023-12-06',
        status: 'Submitted',
        actions: 'View Details',
    },
])
const handleSearch = () => {
    // 处理搜索逻辑
    console.log(searchForm.value)
}
const handleView = (row: any) => {
    // 处理查看详情逻辑
    console.log(row)
    router.push({
        path: `/approvals/${row.id}`
    })
}
const handleEdit = (row: any) => {
    // 处理编辑逻辑
    console.log(row)
}
</script>
<style scoped>
.approvals {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
}

.container {
    margin-top: 24px;
}
</style>