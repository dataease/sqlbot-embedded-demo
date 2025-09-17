<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
// import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import type { FormInstance, FormRules } from 'element-plus'
import { user_list, fixed_pwd } from '@/utils/entity'
const userStore = useUserStore()
// const router = useRouter()
const formRef = ref<FormInstance>()

const loginForm = reactive({
  username: 'developer',
  password: 'SQLBotDemo@123'
})
const userNameText = computed(() => user_list.map(item => item.account).join(','))

const rules: FormRules = {
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

const handleLogin = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  
  await formEl.validate((valid) => {
    if (valid) {
      userStore.login(loginForm.username, loginForm.password)
      location.reload()
    }
  })
}
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <h2>系统登录</h2>
      <el-form
        ref="formRef"
        :model="loginForm"
        :rules="rules"
        @keyup.enter="handleLogin(formRef)"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入账号"
            prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            class="login-button"
            size="large" 
            @click="handleLogin(formRef)"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
      <div class="login-tips">
        <span>{{ `可选用户[${userNameText}]` }}</span>
        <span>{{ `固定密码[${fixed_pwd}]` }}</span>
      </div>
    </div>
    
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
}

.login-box {
  width: 400px;
  padding: 0 40px 40px;
  background: #fff;
  border-radius: 8px;
  /* box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1); */
}

h2 {
  margin: 0 0 30px;
  text-align: center;
  color: #303133;
  font-weight: 500;
}

.login-button {
  width: 100%;
  /* padding: 12px 0;
  font-size: 16px; */
}

:deep(.el-input__wrapper) {
  padding: 12px;
}

:deep(.el-input__prefix-inner) {
  font-size: 18px;
  color: #909399;
}

.login-tips {
  display: flex;
  flex-direction: column;
  color: red;
}
</style>