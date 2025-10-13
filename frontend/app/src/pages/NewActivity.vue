<template>
    <div class="new-activity">
        <el-breadcrumb :separator-icon="ArrowRight">
            <el-breadcrumb-item :to="`/my-activity/${role}`">My Activity</el-breadcrumb-item>
            <el-breadcrumb-item>New Activity</el-breadcrumb-item>
        </el-breadcrumb>

        <div class="container">
            <el-form ref="activityForm" :model="activity" :rules="rules" label-position="top">
                 <el-form-item prop="image">
                    <div class="upload-image">
                        <el-upload
                            class="avatar-uploader"
                            action="#"
                            :auto-upload="false"
                            :show-file-list="false"
                            :on-change="handleAvatarChange"
                            >
                                <div class="avatar-uploader-button">
                                    <el-icon class="avatar-uploader-icon"><Plus /></el-icon>
                                    <p>Click to Upload Photo here Maximum 1 photo here (can be png,jpg)</p>
                                </div>
                        </el-upload>
                    </div>
                    <div class="preview-image">
                        <img v-if="activity.image" :src="activity.image" alt="Activity Image" />
                        <div class="preview-image-text" v-else>
                            <p>Upload at the left</p>
                            <p>Then you can see the photo here</p>
                        </div>
                    </div>
                </el-form-item>
                <el-form-item label="Activity Name" prop="name">
                    <el-input v-model="activity.name" placeholder="Please input the activity name" />
                </el-form-item>
                <el-row :gutter="24">
                    <el-col :span="12">
                        <el-form-item label="Activity Date" prop="dateRange">
                            <el-date-picker
                                v-model="activity.dateRange"
                                type="daterange"
                                value-format="yyyy-MM-dd"
                                range-separator="to"
                                start-placeholder="Start Date"
                                end-placeholder="End Date"
                            />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="Activity Volunteer Number" prop="volunteerNum">
                            <el-input v-model="activity.volunteerNum" placeholder="Please input the activity volunteer number" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item label="Activity Address" prop="address">
                    <el-input v-model="activity.address" placeholder="Please input the activity address" />
                </el-form-item>
                
                <el-form-item label="Activity Description" prop="description">
                    <el-input v-model="activity.description" type="textarea" :rows="4" placeholder="Please input the activity description" />
                </el-form-item>
                <el-form-item style="margin-bottom: 0;">
                    <div class="buttons">
                        <el-button type="info" size="large" @click="handleClickBack">Cancel</el-button>
                        <el-button type="primary" size="large" @click="handleClickSubmit">Save and Submit</el-button>
                    </div>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>
<script setup lang="ts">
// 导入element-plus的图标
import { ArrowRight, InfoFilled, Plus } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'

import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const role = router.currentRoute.value.params.role

// 活动表单
const activityForm = ref()

const activity = ref({
    name: '',
    dateRange: [],
    address: '',
    description: '',
    volunteerNum: '',
    image: ''
})
// 表单验证规则
const rules = ref({
    image: [{ required: true, message: 'Please upload the activity image', trigger: 'blur' }],
    name: [{ required: true, message: 'Please input the activity name', trigger: 'blur' }],
    dateRange: [{ required: true, message: 'Please select the activity date', trigger: 'blur' }],
    address: [{ required: true, message: 'Please input the activity address', trigger: 'blur' }],
    description: [{ required: true, message: 'Please input the activity description', trigger: 'blur' }],
    volunteerNum: [{ required: true, message: 'Please input the activity volunteer number', trigger: 'blur' }],
})

// 处理返回上一页
const handleClickBack = () => {
    router.push({
        path: `/submitted-activity/${role}`,
    })
}
// 处理上传图片
const handleAvatarChange = (file: any) => {
    if (file.raw.type !== 'image/png' && file.raw.type !== 'image/jpeg') {
        ElMessage.error('Please upload a PNG or JPEG image')
        return
    }
    activity.value.image = URL.createObjectURL(file.raw)
    // 手动触发图片上传的验证
    activityForm.value.validateField('image')
}

// 处理提交活动
const handleClickSubmit = () => {
    // 验证表单
    activityForm.value.validate((valid: boolean) => {
        if (valid) {
            // 提交活动
            ElMessage.success('Activity submitted successfully')
            // 返回我的活动页
            router.push({
                path: `/submitted-activity/${role}`,
            })
        } else {
            ElMessage.error('Please fill in the required fields')
        }
    })
}
</script>
<style scoped>
.new-activity {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px 160px;
}
.container {
    margin: 24px 160px;
    padding: 24px;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.avatar-uploader {
    /* 虚线边框 */
    border: 1px dashed var(--el-border-color);
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);
}
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}
.avatar-uploader-button {
    position: relative;
    width: 178px;
    height: 178px;
    text-align: center;
}
.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
.avatar-uploader-button p {
    position: absolute;
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%);
    margin: 0;
    padding: 0 16px;
    width: calc(100% - 32px);
    line-height: 16px;
    font-size: 12px;
    color: #8c939d;
    text-align: left;
}
.preview-image {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-left: 24px;
    height: 178px;
}
.preview-image-text {
    display: flex;
    flex-direction: column;
    justify-content: center;
    border: 1px dashed var(--el-border-color);
    border-radius: 8px;
    padding: 24px;
    height: 178px;
    color: #8c939d;
    box-sizing: border-box;
}
.preview-image p {
    margin: 0;
    line-height: 16px;
}
.preview-image img {
    width: auto;
    height: 100%;
    border-radius: 8px;
    object-fit: cover;
}
.buttons {
    display: flex;
    justify-content: flex-end;
    width: 100%;
}
</style>