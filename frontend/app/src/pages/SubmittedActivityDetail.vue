<template>
    <div class="submitted-activity-detail">
        <el-breadcrumb :separator-icon="ArrowRight">
            <el-breadcrumb-item :to="`/my-activity/${role}`">My Activity</el-breadcrumb-item>
            <el-breadcrumb-item >
                <strong style="cursor: pointer;" @click="handleClickBack">Submitted Activity</strong>
            </el-breadcrumb-item>
            <el-breadcrumb-item >Activity Detail</el-breadcrumb-item>
        </el-breadcrumb>
        <div class="container">
            <div class="header">
                <img src="../assets/images/09e2a97a387404913fd0935003b5614c.jpeg" alt="" srcset="">
            </div>
            <div class="content">
                <el-form label-position="top">
                    <el-form-item label="Activity ID">
                        <el-input v-model="submittedActivity.id" readonly />
                    </el-form-item>
                    <el-form-item label="Activity Name">
                        <el-input v-model="submittedActivity.activityName" readonly />
                    </el-form-item>
                    <el-form-item label="Activity Date">
                        <div class="activity-date">
                            <div class="start-date">
                                <el-input v-model="submittedActivity.startDate" type="text" readonly></el-input>
                            </div>
                            <div class="separator">to</div>
                            <div class="end-date">
                                <el-input v-model="submittedActivity.endDate" type="text" readonly></el-input>
                            </div>
                        </div>
                    </el-form-item>
                    <el-form-item label="Address">
                        <el-input v-model="submittedActivity.address" type="textarea" :autosize="{ minRows: 1, maxRows: 2 }" resize="none" readonly />
                    </el-form-item>
                    <el-form-item label="Description">
                        <el-input v-model="submittedActivity.description" type="textarea" :autosize="{ minRows: 2, maxRows: 2 }" resize="none" readonly />
                    </el-form-item>
                    <el-form-item style="margin-bottom: 0;">
                        <span>Volunteer Number:{{ submittedActivity.volunteerNum }}</span>
                    </el-form-item>
                    <el-form-item>
                        <div class="register-volunteer">
                            <div class="register-volunteer-number">
                                <span>Register Volunteer:{{ submittedActivity.registerList.length }}</span>
                            </div>
                            <div class="register-volunteer-list">
                                <div class="register-volunteer-item" v-for="volunteer in submittedActivity.registerList" :key="volunteer.id">
                                   <span class="status-indicator" :class="{'accepted': volunteer.status === 'Accepted', 'rejected': volunteer.status === 'Rejected'}"></span>
                                   {{ volunteer.name }}
                                </div>
                            </div>
                        </div>
                    </el-form-item>
                    <el-form-item v-if="role && role === 'npo'" style="margin-bottom: 0;">
                        <div class="download-btn">
                            <el-button type="primary" size="large">Generate the volunteer table and download</el-button>
                        </div>
                    </el-form-item>
                </el-form>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
// 导入element-plus的图标
import { ArrowRight, InfoFilled } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'

import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const role = router.currentRoute.value.params.role

const id = router.currentRoute.value.query.id as string

// 处理返回上一页
const handleClickBack = () => {
    router.push({
        path: `/submitted-activity/${role}`,
    })
}

const submittedActivity = ref({
    id: id,
    activityName: 'Activity 1',
    address: 'Location A',
    status: 'Submitted',
    startDate: '2023-12-01',
    endDate: '2023-12-05',
    description: 'A description of the activity zone.',
    volunteerNum: 10,
    registerList: [
        {
            id: 1,
            name: 'Volunteer 1',
            tel: '1234567890',
            email: 'volunteer1@example.com',
            status: 'Accepted',
        },
        {
            id: 2,
            name: 'Volunteer 2',
            tel: '0987654321',
            email: 'volunteer2@example.com',
            status: 'Rejected',
        }
    ]
})
</script>
<style scoped>
.submitted-activity-detail {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
}

.container {
    margin-top: 24px;
    padding: 0 240px;
}
.header {
    display: flex;
    margin-bottom: 16px;
}
.header img {
    width: 100%;
    height: auto;
    border-radius: 4px;
}
.content {
    padding: 24px;
    background-color: #fff;
    border-radius: 8px;
}
.content .activity-date {
    display: flex;
    flex-direction: row;
    width: 100%;
}
.content .activity-date .separator {
    width: 40px;
    font-size: 14px;
    color: #606266;
    text-align: center;
}
.content .activity-date .start-date,
.content .activity-date .end-date {
    flex: 1;
    flex-basis: 0;
    min-width: 0;
}

.register-volunteer {
    display: flex;
    flex-direction: column;

    width: 100%;
}
.register-volunteer-number {
    margin-bottom: 4px;
}
.register-volunteer-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-gap: 24px;
}
.register-volunteer-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 8px;
    padding: 0 8px;
    border-radius: 4px;
    border: 1px solid #dcdfe6;
    background-color: #fff;
    color: #606266;
}
.status-indicator {
    display: inline-block;
    width: 8px;
    height: 8px;
    margin-right: 4px;
    border-radius: 50%;
}
.status-indicator.accepted {
    background-color: #409eff;
}
.status-indicator.rejected {
    background-color: #f56c6c;
}
.download-btn {
    display: flex;
    justify-content: flex-end;
    width: 100%;
}
</style>
