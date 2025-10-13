<template>
    <div class="organization-detail">
        <el-breadcrumb :separator-icon="ArrowRight">
            <el-breadcrumb-item :to="`/activity-zone/${role}`">Activity Zone</el-breadcrumb-item>
            <el-breadcrumb-item >
                <strong style="cursor: pointer;" @click="handleClickBack">Organization Detail</strong>
            </el-breadcrumb-item>
            <el-breadcrumb-item>Organization Name</el-breadcrumb-item>
        </el-breadcrumb>
        <div class="container">
            <!-- 组织描述 -->
            <div class="organization-description">
                <el-form label-position="top">
                    <el-form-item style="margin-bottom: 0;">
                        <div class="organization-basic">
                            <strong>Organization Basic</strong>
                        </div>
                    </el-form-item>
                    <el-form-item label="Organization Name">
                        <el-input v-model="organization.name" readonly />
                    </el-form-item>
                    <el-form-item label="Address">
                        <el-input v-model="organization.address" readonly />
                    </el-form-item>
                    
                </el-form>
                <el-form label-position="top">
                    <el-form-item style="margin-bottom: 0;">
                        <div class="organization-brief">
                            <strong>Organization Brief</strong>
                        </div>
                    </el-form-item>
                    <el-form-item label="Description">
                        <el-input v-model="organization.description" type="textarea" :autosize="{ minRows: 2, maxRows: 2 }" resize="none" readonly />
                    </el-form-item>
                </el-form>
            </div>

            <!-- 组织联系信息 -->
            <div class="organization-contact">
                <div class="header">
                    <div class="photo">
                        <img src="../assets/images/09e2a97a387404913fd0935003b5614c.jpeg" alt="Contact Person Photo">
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
                            <el-input v-model="organization.contactPerson" type="text" readonly></el-input> 
                        </el-form-item>
                        <el-form-item label="Contact Tel">
                            <el-input v-model="organization.contactTel" type="text" readonly></el-input>    
                        </el-form-item>
                        <el-form-item label="Contact Email">
                            <el-input v-model="organization.contactEmail" type="text" readonly></el-input>
                        </el-form-item>
                    </el-form>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ArrowRight } from '@element-plus/icons-vue'

import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const role = route.params.role

const prop = defineProps({
    organization: {
        type: Object,
        default: () => ({
            name: 'Organization Name',
            address: 'Address',
            description: 'Description',
            contactPerson: 'Contact Person',
            contactTel: 'Contact Tel',
            contactEmail: 'Contact Email'
        })
    }
})

const handleClickBack = () => {
    router.back()
}
</script>
<style scoped>
.organization-detail {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px 0;
}
.organization-detail .container {
    margin-top: 24px;
    display: flex;
    padding: 0 160px;
    /* flex-direction: column; */
}
.organization-detail .container .organization-description {
    flex: 1;
    margin-right: 24px;
    padding: 24px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}
.organization-detail .container .organization-contact {
    width: 320px;
    padding: 24px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}
.organization-detail .container .organization-basic,
.organization-detail .container .organization-brief {
    width: 100%;
    background-color: #b6b6b6;
    padding: 4px 12px;
    margin-bottom: 12px;
    border-radius: 4px;
}
.organization-contact {
    min-width: 320px;
    padding: 24px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}
.organization-contact .header {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    padding: 24px 0;
}
.organization-contact .header .photo {
    display: flex;
}
.organization-contact .header img {
    width: 120px;
    height: 120px;
    object-fit: cover;
    border-radius: 50%;
}
.organization-contact .content .organization-name {
    width: 100%;
    background-color: #b6b6b6;
    padding: 4px 12px;
    border-radius: 4px;
}
</style>
