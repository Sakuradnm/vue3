<template>
  <template v-if="!isAdminLogin">
    <Menu />
    <main>
      <router-view></router-view>
    </main>
    <Footer v-if="!isLoginPage" />
  </template>
  <template v-else>
    <main class="admin-main">
      <router-view></router-view>
    </main>
  </template>
</template>


<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import Menu from "@/components/Menu/menu.vue";
import Footer from "@/components/Footer/footer.vue";
import { isAdmin } from '@/utils/session'

const route = useRoute()

const isAdminLogin = ref(false)

const isLoginPage = computed(() => route.path === '/Users')

const checkAdminStatus = () => {
  try {
    isAdminLogin.value = isAdmin()
  } catch (error) {
    console.error('检查管理员状态失败:', error)
    // 发生错误时,默认显示普通用户界面(包含菜单和footer)
    isAdminLogin.value = false
  }
}

const handleStorageChange = (e: StorageEvent) => {
  if (e.key === 'userInfo') {
    checkAdminStatus()
  }
}

onMounted(() => {
  // 延迟执行,确保 DOM 完全加载
  setTimeout(() => {
    checkAdminStatus()
  }, 0)

  window.addEventListener('storage', handleStorageChange)

  const checkInterval = setInterval(checkAdminStatus, 500)

  ;(window as any).__adminCheckInterval = checkInterval
})

onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange)

  if ((window as any).__adminCheckInterval) {
    clearInterval((window as any).__adminCheckInterval)
  }
})

</script>
<style>
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
