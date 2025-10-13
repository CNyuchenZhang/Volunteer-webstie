<template>
  <el-dialog :model-value="modelValue" @close="close" title="Privacy Policy" width="750px">
    <div class="privacy-icon">
      <i class="el-icon-lock"></i>
    </div>
    <div class="privacy-content">
      <p>Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.</p>
      
      <div class="section">
        <h2>What We Collect and Why</h2>
        
        <p><strong>Account Information:</strong> Name, email, and profile details (e.g., skills, interests) to create your profile and match you with relevant opportunities.</p>
        
        <p><strong>For NPOs:</strong> We may collect organizational details and tax identification numbers to verify your status.</p>
        
        <p><strong>Usage Data:</strong> We collect data on how you use the site to improve our services and user experience.</p>
      </div>
      
      <div class="section">
        <h2>How We Use Your Information</h2>
        
        <p>To create and manage your account.</p>
        
        <p>To facilitate connections (e.g., showing volunteer profiles to NPOs and vice versa).</p>
        
        <p>To communicate with you about opportunities, platform updates, and important notices.</p>
        
        <p>To analyze trends to improve our platform.</p>
      </div>
      
      <div class="section">
        <h2>Sharing Information</h2>
        
        <p>Your profile information is shared with other users to enable connections.</p>
        
        <p>We use trusted third-party service providers for operations (e.g., hosting, analytics) under strict confidentiality agreements.</p>
        
        <p>We will never sell your data to advertisers. We only share information if required by law.</p>
      </div>
      
      <div class="update-date">
        Last Updated: September 15, 2025
      </div>
    </div>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="close">
          I Understand
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
defineProps<{ modelValue: boolean }>()
const emit = defineEmits(['update:modelValue'])

// Close the dialog
function close() {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.privacy-icon {
  display: block;
  text-align: center;
  font-size: 48px;
  color: #409eff;
  margin-bottom: 15px;
}

.privacy-content {
  max-height: 60vh;
  overflow-y: auto;
  padding: 0 15px;
  text-align: left;
  color: #333;
}

.privacy-content h2 {
  color: #409eff;
  margin-top: 25px;
  margin-bottom: 18px;
  font-size: 1.5rem;
  font-weight: 600;
  padding-bottom: 8px;
  border-bottom: 2px solid #eaeef5;
}

.privacy-content p {
  line-height: 1.7;
  margin-bottom: 15px;
  font-size: 1rem;
}

.privacy-content .section {
  background-color: #f9fafc;
  border-left: 4px solid #409eff;
  padding: 15px 20px;
  margin: 20px 0;
  border-radius: 0 8px 8px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.privacy-content strong {
  color: #409eff;
  font-weight: 600;
}

/* Scrollbar styling */
.privacy-content::-webkit-scrollbar {
  width: 10px;
}

.privacy-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.privacy-content::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 10px;
  border: 2px solid #f1f1f1;
}

.privacy-content::-webkit-scrollbar-thumb:hover {
  background: #a8acb5;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  padding: 15px 20px 25px;
}

.dialog-footer .el-button {
  padding: 12px 30px;
  font-size: 16px;
  border-radius: 8px;
  transition: all 0.3s;
}

.update-date {
  text-align: center;
  margin-top: 25px;
  padding-top: 15px;
  border-top: 1px dashed #eaeef5;
  color: #909399;
  font-style: italic;
  font-size: 0.9rem;
}
</style>