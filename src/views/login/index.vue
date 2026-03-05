<template>
  <div class="login-container">
    <div class="login-form">
      <h2 class="login-title">vue3-element-admin</h2>
      <el-form :model="loginForm" class="login-form-demo">
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="用户名"
            prefix-icon="User"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            prefix-icon="Lock"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-button
          type="primary"
          class="login-btn"
          @click="handleLogin"
          :loading="loading"
        >
          登录
        </el-button>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)
const loginForm = ref({
  username: 'admin',
  password: '123456'
})

const handleLogin = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    router.push('/')
  }, 1000)
}
</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #002140;

  .login-form {
    width: 400px;
    padding: 40px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

    .login-title {
      text-align: center;
      margin-bottom: 40px;
      color: #333;
    }

    .login-btn {
      width: 100%;
      margin-top: 20px;
    }
  }
}
</style>
