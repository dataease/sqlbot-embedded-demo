<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { SettingApi } from '@/api/setting'
import { useSettingStore } from '@/store/setting'
const settingStore = useSettingStore()

const formRef = ref<FormInstance>()

const form = reactive({
  domain: '',
  base_assistant_id: '',
  advanced_assistant_id: '',
  embedded_app_id: '',
  embedded_app_secret: '',
  aes_enable: false,
  aes_key: ''
})

const rules: FormRules = {
  domain: [
    { required: true, message: '请输入SQLBot服务地址', trigger: 'blur' }
  ],
  base_assistant_id: [
    { required: false, message: '请输入基础应用 ID', trigger: 'blur' }
  ],
  advanced_assistant_id: [
    { required: false, message: '请输入高级应用 ID', trigger: 'blur' }
  ],
  embedded_app_id: [
    { required: false, message: '请输入页面嵌入 APP ID', trigger: 'blur' }
  ],
  embedded_app_secret: [
    { required: false, message: '请输入页面嵌入 APP Secret', trigger: 'blur' }
  ],
}

const initData = () => {
  const data = settingStore.getData
  if (data) {
    Object.assign(form, data)
  }
}
const handleSubmit = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  
  await formEl.validate((valid) => {
    if (valid) {
      // TODO: 实现保存逻辑
      const param = { ...form }
      SettingApi.save(param).then(() => {
        ElMessage.success('保存成功')
        location.reload()
      }).catch(() => {
        ElMessage.success('保存失败')
      })
    }
  })
}
const generateRandomString = (length: number = 32): string =>  {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
const aesChanged = (val: boolean) => {
  if (val && !form.aes_key) {
    const key = generateRandomString(32)
    form.aes_key = key
  }
}
onMounted(() => {
  initData()
})
</script>

<template>
  <div class="form-page">
    <!-- 头部信息区域 -->
    <div class="page-header">
      <h2 class="title">SQLBot 嵌入式信息</h2>
      <div class="description">
        请填写以下信息，带 <span class="required">*</span> 的字段为必填项。
        确保信息准确无误，提交后将用于系统记录。
      </div>
    </div>

    <!-- 表单区域 -->
    <div class="form-container">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        status-icon
      >
        <div class="form-grid">
          <el-form-item label="SQLBot 服务地址" prop="domain" class="full-width">
            <el-input 
              v-model="form.domain"
              placeholder="请输入 SQLBot 服务地址"
              clearable
            />
          </el-form-item>

          <el-form-item label="基础应用 ID" prop="base_assistant_id">
            <el-input
              v-model="form.base_assistant_id"
              placeholder="请输入基础应用 ID"
              clearable
            />
          </el-form-item>
          
          <el-form-item label="高级应用 ID" prop="advanced_assistant_id">
            <el-input
              v-model="form.advanced_assistant_id"
              placeholder="请输入高级应用 ID"
              clearable
            />
          </el-form-item>

          
          <el-form-item label="页面嵌入 APP ID" prop="embedded_app_id">
            <el-input
              v-model="form.embedded_app_id"
              placeholder="请输入页面嵌入 APP ID"
              clearable
            />
          </el-form-item>

          <el-form-item label="页面嵌入 APP Secret" prop="embedded_app_secret">
            <el-input
              v-model="form.embedded_app_secret"
              placeholder="请输入页面嵌入 APP Secret"
              type="password"
              show-password
              clearable
            />
          </el-form-item>

          <el-form-item label="API 开启AES" prop="aes_enable">
            <el-switch v-model="form.aes_enable" @change="aesChanged"/>
          </el-form-item>
          <el-form-item label="API AES KEY" prop="aes_key" >
            <el-input
              v-model="form.aes_key"
              placeholder="请输入 AES KEY"
              type="password"
              show-password
              clearable
            />
          </el-form-item>
        </div>
      </el-form>
    </div>

    <!-- 底部按钮区域 -->
    <div class="form-footer">
      <el-button 
        type="primary" 
        size="large" 
        @click="handleSubmit(formRef)"
      >
        保存
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.form-page {
  position: relative;
  background-color: #fff;
  height: 100%; /* 设置高度占满容器 */
  overflow-y: auto; /* 添加垂直滚动 */
  padding: 24px; /* 添加内边距 */
  box-sizing: border-box; /* 确保padding不会增加总宽度 */
}

.page-header {
  margin-bottom: 32px;
  padding: 16px 0;
  border-bottom: 1px solid #ebeef5;
  background-color: #fff; /* 确保背景色 */
}

.page-header .title {
  margin: 0 0 12px;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.page-header .description {
  color: #909399;
  font-size: 14px;
  line-height: 1.6;
}

.required {
  color: #f56c6c;
  margin: 0 4px;
}

.form-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px 24px;
}

.full-width {
  grid-column: span 2;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #409eff inset;
}

:deep(.el-textarea__inner) {
  min-height: 80px;
}

.form-footer {
  display: flex;
  justify-content: end;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 0;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .form-page {
    padding: 16px; /* 移动端减小内边距 */
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .full-width {
    grid-column: span 1;
  }

  .form-footer {
    position: static;
    margin-top: 24px;
    padding: 16px 0;
    text-align: right;
    box-shadow: none;
  }
}
</style>