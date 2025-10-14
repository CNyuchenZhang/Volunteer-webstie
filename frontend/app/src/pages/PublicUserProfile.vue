<template>
    <div class="user-profile">
        <el-breadcrumb>
            <el-breadcrumb-item>User</el-breadcrumb-item>
        </el-breadcrumb>
        <div class="container">
            <div class="user-info">
                <div class="user-avatar">
                    <div class="avatar-container">
                        <img src="../assets/images/09e2a97a387404913fd0935003b5614c.jpeg" alt="">
                        <div class="avatar-mask"  @click="isEditAvatar = true">
                            <el-icon class="edit-icon">
                                <Edit />
                            </el-icon>
                        </div>
                    </div>
                </div>
                <el-form label-position="right" label-width="128px"  :model="userInfo" :rules="rules" ref="formRef">
                    <h2>Organization Basic</h2>
                    <el-form-item label="Name">
                        <div class="flex">
                            <el-input class="mr-12" style="width: 320px;" v-model="userInfo.name" type="text" readonly></el-input>
                        </div>
                    </el-form-item>
                    <el-form-item label="Address" prop="address">
                        <div class="flex">
                            <el-input class="mr-12" style="width: 320px;" v-model="userInfo.address" type="textarea" :autosize="{ minRows: 2, maxRows: 2 }" resize="none" :readonly="!isEditAddress"></el-input>
                            <el-button v-if="!isEditAddress" circle style="width: 32px; height: 32px;" :icon="Edit" @click="isEditAddress = true"></el-button>
                            <el-button  type="primary" v-else circle style="width: 32px; height: 32px;" :icon="Select" @click="isEditAddress = false"></el-button>
                        </div>
                    </el-form-item>
                    <h2>Organization Contact</h2>
                    <el-form-item label="Contact Person" prop="person">
                        <div class="flex">
                            <el-input class="mr-12" style="width: 320px;" v-model="userInfo.person" type="text" :readonly="!isEditPerson"></el-input>
                            <el-button v-if="!isEditPerson" circle style="width: 32px; height: 32px;" :icon="Edit" @click="isEditPerson = true"></el-button>
                            <el-button  type="primary" v-else circle style="width: 32px; height: 32px;" :icon="Select" @click="isEditPerson = false"></el-button>
                        </div>
                    </el-form-item>
                    <el-form-item label="Contact Tel" prop="tel">
                        <div class="flex">
                            <el-input class="mr-12" style="width: 320px;" v-model="userInfo.tel" type="text" :readonly="!isEditTel"></el-input>
                            <el-button v-if="!isEditTel" circle style="width: 32px; height: 32px;" :icon="Edit" @click="isEditTel = true"></el-button>
                            <el-button  type="primary" v-else circle style="width: 32px; height: 32px;" :icon="Select" @click="isEditTel = false"></el-button>
                        </div>
                    </el-form-item>
                    <el-form-item label="Contact Email" prop="email">
                        <div class="flex">
                            <el-input class="mr-12" style="width: 320px;" v-model="userInfo.email" type="text" :readonly="!isEditEmail"></el-input>
                            <el-button v-if="!isEditEmail" circle style="width: 32px; height: 32px;" :icon="Edit" @click="isEditEmail = true"></el-button>
                            <el-button  type="primary" v-else circle style="width: 32px; height: 32px;" :icon="Select" @click="isEditEmail = false"></el-button>
                        </div>
                    </el-form-item>
                    <!-- 标题 -->
                    <h2>Organization Brief</h2>
                    <el-form-item label="Description" prop="description">
                        <div class="flex">
                            <el-input class="mr-12" style="width: 320px;" v-model="userInfo.description" type="textarea" :autosize="{ minRows: 2, maxRows: 4 }" resize="none" :readonly="!isEditDescription"></el-input>
                            <el-button v-if="!isEditDescription" circle style="width: 32px; height: 32px;" :icon="Edit" @click="isEditDescription = true"></el-button>
                            <el-button  type="primary" v-else circle style="width: 32px; height: 32px;" :icon="Select" @click="isEditDescription = false"></el-button>
                        </div>
                    </el-form-item>
                </el-form>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { Edit, Plus, Select, Sunset } from '@element-plus/icons-vue'
import { ref, watch } from 'vue'

const userInfo = ref({
    name: 'Organization Name',
    email: 'zhangsan@example.com',
    phone: '12345678901',
    address: 'Organization Address',
    person: 'Contact Person',
    tel: 'Contact Tel',
    description: 'Organization Description',
    avatar: '111'
})

// 编辑表单验证规则
const rules = ref({
    avatar: [{ required: true, message: 'Please upload the photo', trigger: 'blur' }],
    person: [{ required: true, message: 'Please input the contact person', trigger: 'blur' }],
    tel: [{ required: true, message: 'Please input the contact tel', trigger: 'blur' }],
    email: [{ required: true, message: 'Please input the contact email', trigger: 'blur' }],
    address: [{ required: true, message: 'Please input the address', trigger: 'blur' }],
    description: [{ required: true, message: 'Please input the description', trigger: 'blur' }],
})

const isEditAddress = ref(false)
const isEditAvatar = ref(false)
const isEditTel = ref(false)
const isEditPerson = ref(false)
const isEditEmail = ref(false)
const isEditDescription = ref(false)

// 编辑表单实例
const formRef = ref()

// 处理头像上传变化
const handleAvatarChange = (file: any) => {
    console.log(file)
    // 处理文件上传逻辑，例如上传到服务器
    // 上传成功后，更新 userInfo.avatar 为服务器返回的 URL
    userInfo.value.avatar = URL.createObjectURL(file.raw)
    // 手动触发头像上传的验证
    formRef.value.validateField('avatar')
}

// 提交编辑表单
const onSubmit = async () => {
    await formRef.value.validate()
    if (formRef.value.isValid) {
        // 提交表单数据到服务器
        console.log('提交表单数据:', userInfo.value)
    } else {
        console.log('表单验证失败')
    }
}

</script>
<style scoped>
.user-profile {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
}

.container {
    margin-top: 24px;
    padding: 0 320px;
}

.container .user-info {
    padding: 24px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.container .user-avatar {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
}

.container .user-avatar .avatar-mask {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    justify-content: center;
    align-items: center;
    width: 180px;
    height: 180px;
    background-color: #ececec3f;
    border-radius: 50%;
    cursor: pointer;
    opacity: 0;
}

.container .user-avatar:hover .avatar-mask {
    opacity: 1;
}

.container .user-avatar img {
    width: 180px;
    height: 180px;
    object-fit: cover;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.container .user-avatar .edit-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 24px;
    color: #ececec3f;
    cursor: pointer;
    transition: opacity 0.3s ease-in-out;
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

</style>
