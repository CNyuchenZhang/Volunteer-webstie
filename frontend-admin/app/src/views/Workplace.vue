<template>
    <div class="my-activity">
        <el-breadcrumb>
            <el-breadcrumb-item>Workplace</el-breadcrumb-item>
        </el-breadcrumb>
        <div class="container">
            <div class="left-wrap">
                <img src="../assets/images/reminder/ReminderAdmin.svg" alt="">
            </div>
            <div class="right-wrap">
                <div class="logo">
                    <img src="../assets/images/Logo/logo2.svg" alt="">
                </div>
                <div class="buttons">
                    <el-button type="primary" size="large" @click="handleClickAwaitingApproval">Activity Awaiting Approvals</el-button>
                    <el-button type="primary" size="large" @click="handleClickReviewedActivities">Reviewed Activities</el-button>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const role = router.currentRoute.value.params.role as string

const handleClickAwaitingApproval = () => {
    router.push({
        path: `/approvals`,
    })
}

const handleClickReviewedActivities = () => {
    router.push({
        path: `/reviewed-activities`,
    })
}
</script>
<style scoped>
.my-activity {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
}
.container {
    display: flex;
    padding: 0 160px;
    margin-top: 24px;
}
.left-wrap {
    flex: 1;
    display: flex;
    flex-direction: column;
    margin-right: 24px;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}
.left-wrap img {
    width: 100%;
    height: auto;
}
.right-wrap {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 320px;
    padding-bottom: 24px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}
.logo {
    display: flex;
    text-align: right;
}
.logo img {
    width: 100%;
    height: auto;
}
.buttons {
    position: absolute;
    bottom: 24px;
    display: flex;
    flex-direction: column;
    width: calc(100% - 48px);
    padding: 0 24px;
}
.buttons .el-button {
    width: 100%;
    margin-left: auto;
}
.buttons .el-button:last-child {
    margin-top: 16px;
}
</style>
