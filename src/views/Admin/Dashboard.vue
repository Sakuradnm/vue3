<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

const goBack = () => {
  router.push('/Home')
}
</script>

<template>
  <div class="admin-container">
    <button class="back-btn" @click="goBack">返回首页</button>
    <div class="admin-content">
      <h1>后台管理系统</h1>
      <p>页面正在设计中...</p>
    </div>
  </div>
</template>

<style scoped>
.admin-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0c1f2e 0%, #061016 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 2rem;
}

.back-btn {
  position: absolute;
  top: 30px;
  left: 30px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
  padding: 0.8rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(-5px);
}

.admin-content {
  text-align: center;
  color: #fff;
}

.admin-content h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #007bff 0%, #00d4ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.admin-content p {
  font-size: 1.5rem;
  opacity: 0.7;
}
</style>
