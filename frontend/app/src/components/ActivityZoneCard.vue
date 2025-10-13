<template>
    <div class="activity-zone-card" @click="handleClick">
        <div class="card-header">
            <img src="../assets/images/09e2a97a387404913fd0935003b5614c.jpeg" alt="">
        </div>
        <div class="card-content">
            <div class="name">{{ activityZone.name }}</div>
            <div class="class">
                <div class="class-item">
                     <el-tooltip
                        class="box-item"
                        effect="dark"
                        content="Need"
                        placement="top"
                        >
                        <div class="wrap">
                            <el-icon><StarFilled /></el-icon>
                            <!-- <div class="head">Need</div> -->
                            <div class="num">1999</div>
                        </div>
                    </el-tooltip>
                </div>
                <div class="class-item">
                    <el-tooltip
                        class="box-item"
                        effect="dark"
                        content="Current"
                        placement="top"
                        >
                        <div class="wrap">
                            <el-icon><Avatar /></el-icon>
                            <!-- <div class="head">Current</div> -->
                            <div class="num">1999</div>
                        </div>
                    </el-tooltip>
                </div>
                <div class="class-item">
                    <el-tooltip
                        class="box-item"
                        effect="dark"
                        content="Days Left"
                        placement="top"
                        >
                        <div class="wrap">
                            <el-icon><BellFilled /></el-icon>
                            <!-- <div class="head">Days Left</div> -->
                            <div class="num">7d</div>
                        </div>
                    </el-tooltip>
                </div>
            </div>
        </div>
        <div class="card-footer">
            <div class="date">{{ activityZone.date }}</div>
        </div>
    </div>
</template>
<script setup lang="ts">
// 导入element-plus的图标
import { StarFilled, Avatar, BellFilled } from '@element-plus/icons-vue'

import { ref } from 'vue'
import { useRouter, useRoute } from "vue-router"

// 路由
const router = useRouter();
const route = useRoute();

// role
const role = route.params.role;

const prop = defineProps({
    activityZone: {
        type: Object,
        default: () => ({})
    }
})
const handleClick = () => {
    // 跳转到活动详情页
    router.push({
        path: `/activity-zone-detail/${role}`,
        query: {
            id: prop.activityZone.id as string
        }
    })
}
</script>
<style scoped>
.activity-zone-card {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    overflow: hidden;
}
/* 鼠标悬停 */
.activity-zone-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
    border-color: #409EFF;
}
.card-header img {
    width: 100%;
    height: 200px;
    object-fit: cover;
}
.title {
    font-size: 20px;
    color: #303133;
}
.card-content {
    padding: 0 16px;
}
.name {
    margin-top: 16px;
    font-size: 20px;
    color: #303133;
}
.class {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-top: 16px;
}
.class .class-item .wrap {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 4px 8px;
    background-color: #f5f7fa;
    border: 1px solid #e4e7ed;
    border-radius: 16px;
    font-size: 14px;
}
.class .class-item .num {
    margin-left: 8px;
}
.card-footer {
    padding: 16px;
}
.date {
    font-size: 14px;
    color: #606266;
}
</style>