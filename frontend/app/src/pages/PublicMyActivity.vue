<template>
    <div class="my-activity">
        <el-breadcrumb>
            <el-breadcrumb-item>My Activity</el-breadcrumb-item>
        </el-breadcrumb>
        <div class="container">
            <div class="left-wrap">
                <img :src="reminderMap[role]" alt="">
            </div>
            <div class="right-wrap">
                <div class="logo">
                    <img src="../assets//images/Logo/logo2.svg" alt="">
                </div>
                <div class="buttons">
                    <template v-if="role === 'admin'">
                        <el-button type="primary" size="large" @click="handleClickAwaitingApproval">Activity Awaiting Approvals</el-button>
                        <el-button type="primary" size="large" @click="handleClickReviewedActivities">Reviewed Activities</el-button>
                    </template>
                    <template v-else-if="role === 'volunteer'">
                        <el-button type="primary" size="large" @click="handleClickParticipatedActivity">Participated Activity</el-button>
                    </template>
                    <template v-else>
                        <el-button type="primary" size="large" @click="handleClickSubmittedActivity">Submitted Activity</el-button>
                        <el-button type="primary" size="large" @click="handleClickNewActivity">New Activity</el-button>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import ReminderAdmin from '../assets/images/reminder/ReminderAdmin.svg'
import ReminderVolunteer from '../assets/images/reminder/ReminderVolunteer.svg'
import ReminderNPO from '../assets/images/reminder/ReminderNPO.svg'

import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const role = router.currentRoute.value.params.role as string

const reminderMap : Record<string, string> = {
    admin: ReminderAdmin,
    volunteer: ReminderVolunteer,
    npo: ReminderNPO,
}

const handleClickAwaitingApproval = () => {
    router.push({
        path: `/awaiting-approval/${role}`,
    })
}

const handleClickReviewedActivities = () => {
    router.push({
        path: `/reviewed-activities/${role}`,
    })
}


const handleClickParticipatedActivity = () => {
    router.push({
        // path: `/participated-activity/${role}`,
        path: `/submitted-activity/${role}`,
    })
}

const handleClickSubmittedActivity = () => {
    router.push({
        path: `/submitted-activity/${role}`,
    })
}
const handleClickNewActivity = () => {
    router.push({
        path: `/new-activity/${role}`,
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
