<template>
    <div class="activity-zone-detail">
        <!-- 面包屑 -->
        <el-breadcrumb :separator-icon="ArrowRight">
            <el-breadcrumb-item :to="`/workplace`">Workplace</el-breadcrumb-item>
            <el-breadcrumb-item :to="`/approvals`">Activity Awaiting Approvals</el-breadcrumb-item>
            <el-breadcrumb-item>{{ approval.name }}</el-breadcrumb-item>
        </el-breadcrumb>
        <div class="card-container">
            <div class="activity-zone-detail-card">
                <div class="header">
                    <img src="../assets/images/09e2a97a387404913fd0935003b5614c.jpeg" alt="Activity Zone Image">
                </div>
                <div class="content">
                    <el-form label-position="top">
                        <el-form-item label="Activity Zone Name">
                            <el-input v-model="approval.name" type="text" readonly></el-input>
                        </el-form-item>
                        <el-form-item label="Date">
                            <div class="activity-zone-date">
                                <div class="start-date">
                                    <el-input v-model="approval.startDate" type="text" readonly></el-input>
                                </div>
                                <div class="separator">-</div>
                                <div class="end-date">
                                    <el-input v-model="approval.endDate" type="text" readonly></el-input>
                                </div>
                            </div>
                        </el-form-item>
                        <el-form-item label="Address">
                            <el-input v-model="approval.address" type="textarea" :autosize="{ minRows: 1 }" resize="none" readonly></el-input>
                        </el-form-item>
                        <el-form-item label="Description">
                            <el-input v-model="approval.description" type="textarea" :autosize="{ minRows: 2, maxRows: 2 }" resize="none" readonly></el-input>
                        </el-form-item>
                    </el-form>
                </div>
            </div>
            <!-- 账号明细 -->
            <div class="account-detail-card">
                <div class="header">
                    <div class="photo">
                        <img src="../assets/images/09e2a97a387404913fd0935003b5614c.jpeg" alt="Contact Person Photo">
                        <div class="edit" @click="handleEdit">
                            <el-icon style="font-size: 24px; color: #d9d9d9;"><InfoFilled /></el-icon>
                        </div>
                    </div>
                </div>
                <div class="content">
                    <el-form label-position="top">
                        <el-form-item>
                            <div class="organization-name">
                                <strong>Organization Name</strong>
                            </div>
                        </el-form-item>
                        <el-form-item label="Contact Person">
                            <el-input v-model="approval.contactPerson" type="text" readonly></el-input>
                        </el-form-item>
                        <el-form-item label="Contact Tel">
                            <el-input v-model="approval.contactTel" type="text" readonly></el-input>
                        </el-form-item>
                        <el-form-item label="Contact Email">
                            <el-input v-model="approval.contactEmail" type="text" readonly></el-input>
                        </el-form-item>
                    </el-form>
                </div>
                <div class="footer flex">
                    <el-button class="flex-1" type="primary" size="default" @click="handleApprove">Approve</el-button>
                    <el-button class="flex-1" type="danger" size="default" @click="handleReject">Reject</el-button>
                </div>
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

const approval = ref({
    id: id,
    name: 'ActivityZoneName',
    startDate: '2023-12-01',
    endDate: '2023-12-05',
    address: 'Location A',
    description: 'A description of the activity zone.',
    image: '',
    organizationName: 'Organization Name',
    contactPerson: 'Jane',
    contactTel: '1234567890',
    contactEmail: 'contact@example.com',
    status: 'Approved'
})
// 组织详情
const handleEdit = () => {
    router.push({
        path: `/organization-detail/${role}`,
        query: { id: id }
    })
}
const handleApprove = () => {
    // 弹窗确认
    ElMessageBox.confirm(
    'Confirm Approval?', 
    '', 
    {
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        showClose: false,
        center: true,
        dangerouslyUseHTMLString: true,
        closeOnClickModal: false,
        closeOnPressEscape: false,
    }).then(() => {
        // 确认注册

        // 提示审批成功
        ElMessage({
            message: 'Approval Success!',
            type: 'success'
        })
        // 跳转回审批页
        router.back()
    }).catch(() => {
        // 取消审批 
    });
}
const handleReject = () => {
    // 弹窗确认
    ElMessageBox.confirm(
    'Confirm Reject?', 
    '', 
    {
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        showClose: false,
        center: true,
        dangerouslyUseHTMLString: true,
        closeOnClickModal: false,
        closeOnPressEscape: false,
    }).then(() => {
        // 确认拒绝

        // 提示拒绝成功
        ElMessage({
            message: 'Rejection Success!',
            type: 'success'
        })
        // 跳转回审批页
        router.back()
    }).catch(() => {
        // 取消拒绝 
    });
}
</script>
<style scoped>
.activity-zone-detail {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}
.card-container {
    display: flex;
    padding: 0 160px;
}
.activity-zone-detail-card {
    flex: 1;
    min-width: 400px;
    margin-top: 24px;
    margin-right: 24px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}
.activity-zone-detail-card .header {
    position: relative;
}
.activity-zone-detail-card .header img {
    width: 100%;
    height: 200px;
    object-fit: cover;
}
.activity-zone-detail-card .content {
    padding: 20px;
}
.activity-zone-detail-card .content .activity-zone-date {
    display: flex;
    flex-direction: row;
    width: 100%;
}
.activity-zone-detail-card .content .activity-zone-date .separator {
    width: 40px;
    font-size: 14px;
    color: #606266;
    text-align: center;
}
.activity-zone-detail-card .content .activity-zone-date .start-date,
.activity-zone-detail-card .content .activity-zone-date .end-date {
    flex: 1;
    flex-basis: 0;
    min-width: 0;
}
.account-detail-card {
    min-width: 320px;
    margin-top: 24px;
    padding: 24px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}
.account-detail-card .header {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    padding: 24px 0;
}
.account-detail-card .header .photo {
    display: flex;
    cursor: pointer;
}
.account-detail-card .header img {
    width: 120px;
    height: 120px;
    object-fit: cover;
    border-radius: 50%;
}
.account-detail-card .header .photo .edit {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    width: 120px;
    height: 120px;
    background-color: #ececec3f;
    border-radius: 50%;
    opacity: 0;
}

.account-detail-card .header .photo:hover .edit {
    opacity: 1;
}
.account-detail-card .content .organization-name {
    width: 100%;
    background-color: #b6b6b6;
    padding: 4px 12px;
    border-radius: 4px;
}
</style>
