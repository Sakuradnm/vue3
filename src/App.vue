<template>
  <template v-if="!isAdminLogin">
    <Menu />
    <main>
      <router-view></router-view>
    </main>
    <Footer />
  </template>
  <template v-else>
    <main class="admin-main">
      <router-view></router-view>
    </main>
  </template>
</template>


<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Menu from "@/components/Menu/menu.vue";
import Footer from "@/components/Footer/footer.vue";

// 检查是否为管理员登录状态
const isAdminLogin = ref(false)

const checkAdminStatus = () => {
  const storedUserInfo = localStorage.getItem('userInfo')
  if (storedUserInfo) {
    const userInfo = JSON.parse(storedUserInfo)
    isAdminLogin.value = userInfo.level === 'admin'
  } else {
    isAdminLogin.value = false
  }
}

const handleStorageChange = (e: StorageEvent) => {
  if (e.key === 'userInfo') {
    checkAdminStatus()
  }
}

onMounted(() => {
  checkAdminStatus()

  // 监听 storage 事件（跨标签页同步）
  window.addEventListener('storage', handleStorageChange)

  // 定期检查用户信息变化（处理同标签页内的变化）
  const checkInterval = setInterval(checkAdminStatus, 500)

  // 保存 interval ID 以便清理
  ;(window as any).__adminCheckInterval = checkInterval
})

onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange)

  // 清理定时器
  if ((window as any).__adminCheckInterval) {
    clearInterval((window as any).__adminCheckInterval)
  }
})

</script>
<style scoped>
/* 保留全局布局样式 */
body,html {
  scroll-behavior: smooth;
  overflow-x: hidden;
  margin: 0;
  padding: 0;
}
main {
  flex: 1;
  padding-top: 80px; /* 为固定菜单预留空间，菜单高度为 80px */
}
.admin-main {
  min-height: 100vh;
  padding-top: 0;
}
.parallax__layers > * {
  backface-visibility: hidden;
  transform: translateZ(0);
}
</style>
