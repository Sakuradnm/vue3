<script setup lang="ts">
import { defineProps, watch, onBeforeUnmount, ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()

// 用户登录状态
const isLoggedIn = ref(false)
const userInfo = ref<any>(null)

// 检查登录状态
const checkLoginStatus = () => {
  const storedUserInfo = localStorage.getItem('userInfo')
  if (storedUserInfo) {
    userInfo.value = JSON.parse(storedUserInfo)
    isLoggedIn.value = true
  } else {
    isLoggedIn.value = false
    userInfo.value = null
  }
}

// 判断是否为管理员
const isAdmin = computed(() => {
  return userInfo.value?.level === 'admin'
})

// 初始化时检查登录状态
checkLoginStatus()

// 监听 localStorage 变化（处理其他标签页登录/登出）
watch(() => localStorage.getItem('userInfo'), () => {
  checkLoginStatus()
})

// 定义子菜单类型
interface SubmenuItem {
  path: string
  text: string
  icon?: string
}

const props = defineProps<{
  isOpen: boolean
  onClose: () => void
}>()

const submenus = {
  cardMenu: [
    { path: '/Brz', text: '斯巴鲁 BRZ', icon: 'Brz' },
    { path: '/Hellcat', text: '道奇 CHALLENGER SRT® HELLCAT', icon: 'Hellcat' },
    { path: '/Gtr', text: '尼桑 GT-R', icon: 'GTR' },
    { path: '/Supra', text: '丰田 GR SUPRA', icon: 'Supra' },
    { path: '/Ultra', text: '小米 SU7 Ultra', icon: 'Ultra' },
  ] as SubmenuItem[],
  serviceMenu: [
    { path: '/AfterSales', text: '售后服务', icon: 'AfterSales' },
    { path: '/Finance', text: '金融服务', icon: 'Finance' },
    { path: '/Maintenance', text: '保养维修', icon: 'Maintenance' },
  ] as SubmenuItem[]
}

const serviceMenuOpen = ref(false)
const cardMenuOpen = ref(false)

const toggleMenu = (menuType: keyof typeof submenus) => {
  if (menuType === 'cardMenu') {
    cardMenuOpen.value = !cardMenuOpen.value
  } else {
    serviceMenuOpen.value = !serviceMenuOpen.value
  }
}

// 处理未登录时点击上传
const handleUploadClick = (e: Event) => {
  if (!isLoggedIn.value) {
    e.preventDefault()
    ElMessage.warning('请先登录后再上传内容')
    router.push('/Users')
    return false
  }
  return true
}

// 禁用滚动逻辑
const disableScroll = () => {
  document.body.style.overflow = 'hidden'
  document.body.style.position = 'fixed';
  document.body.style.width = '100%';
  document.addEventListener('touchmove', preventTouchScroll, { passive: false })
}

const enableScroll = () => {
  document.body.style.overflow = '';
  document.body.style.position = '';
  document.body.style.width = '';
  document.removeEventListener('touchmove', preventTouchScroll)
}

const preventTouchScroll = (e: TouchEvent) => {
  // 获取菜单内容容器
  const menuContent = document.querySelector('.unmenu-content');
  // 检查触摸是否发生在菜单内容内部
  const isInsideMenu = menuContent?.contains(e.target as Node);

  // 只有当触摸发生在菜单外部时才阻止默认行为
  if (!isInsideMenu) {
    e.preventDefault();
  }
};

// 监听菜单状态变化
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    disableScroll()
    // 重置服务子菜单状态
    serviceMenuOpen.value = false
    cardMenuOpen.value = false
  } else {
    enableScroll()
  }
})

// 组件卸载时恢复滚动
onBeforeUnmount(() => {
  enableScroll()
})
</script>

<template>
  <transition name="menu-fade">
    <div v-if="isOpen" class="unmenu-overlay" @click.self="onClose">
      <div class="unmenu-content">
        <!-- 新增顶部导航栏容器 -->
        <div class="mobile-nav-header">
          <!-- Home图标对齐桌面端位置 -->
          <router-link to="">
            <svg-icon name="home" :width="70" height="70"/>
          </router-link>

          <!-- Close按钮对齐菜单按钮位置 -->
          <div class="mobile-close-button" @click="onClose">
            <svg-icon name="close" :width="30" height="30" />
          </div>
        </div>

        <div class="unmenu-links">
          <router-link
            v-for="(link, index) in [
              { path: '/Home', text: '首 页', icon: 'home' },
            ]"
            :key="index"
            :to="link.path"
            @click="onClose"
            class="unmenu-link"
          >
            <svg-icon :name="link.icon" :width="24" height="24" />
            <span>{{ link.text }}</span>
          </router-link>

          <!-- 非管理员显示车型、服务菜单 -->
          <template v-if="!isAdmin">
            <div class="submenu-container">
              <div class="unmenu-link" @click="toggleMenu('cardMenu')">
                <svg-icon name="car" :width="24" height="24" />
                <span>车 型</span>
                <span class="dropdown-arrow" :class="{ 'open': cardMenuOpen }">▼</span>
              </div>
              <div class="mobile-submenu" v-if="cardMenuOpen">
                <router-link
                    v-for="(sublink, index) in submenus.cardMenu"
                    :key="index"
                    :to="sublink.path"
                    @click="onClose"
                    class="mobile-submenu-link"
                >
                  <svg-icon v-if="sublink.icon" :name="sublink.icon" :width="24" height="24" />
                  <span>{{ sublink.text }}</span>
                </router-link>
              </div>
            </div>

            <div class="submenu-container">
              <div class="unmenu-link" @click="toggleMenu('serviceMenu')">
                <svg-icon name="service" :width="24" height="24" />
                <span>服 务</span>
                <span class="dropdown-arrow" :class="{ 'open': serviceMenuOpen }">▼</span>
              </div>
              <div class="mobile-submenu" v-if="serviceMenuOpen">
                <router-link
                    v-for="(sublink, index) in submenus.serviceMenu"
                    :key="index"
                    :to="sublink.path"
                    @click="onClose"
                    class="mobile-submenu-link"
                >
                  <svg-icon v-if="sublink.icon" :name="sublink.icon" :width="24" height="24" />
                  <span>{{ sublink.text }}</span>
                </router-link>
              </div>
            </div>
          </template>

          <!-- 上传选项 - 仅登录且非管理员用户可见 -->
          <router-link
            v-if="isLoggedIn && !isAdmin"
            to="/Upload"
            @click="handleUploadClick"
            class="unmenu-link"
          >
            <svg-icon name="upload" :width="24" height="24" />
            <span>上 传</span>
          </router-link>

          <!-- 品牌、论坛 - 仅非管理员可见 -->
          <template v-if="!isAdmin">
            <router-link
              to="/Brand"
              @click="onClose"
              class="unmenu-link"
            >
              <svg-icon name="brand" :width="24" height="24" />
              <span>品牌故事</span>
            </router-link>

            <router-link
              to="/Forum"
              @click="onClose"
              class="unmenu-link"
            >
              <svg-icon name="forum" :width="24" height="24" />
              <span>论 坛</span>
            </router-link>
          </template>

          <!-- 个人中心 - 仅非管理员可见 -->
          <router-link
            v-if="!isAdmin"
            to="/Users"
            @click="onClose"
            class="unmenu-link"
          >
            <svg-icon name="user" :width="24" height="24" />
            <span>个人中心</span>
          </router-link>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.unmenu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  z-index: 1001;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow: hidden;
  touch-action: none;
}
.unmenu-content {
  width: 100%;
  height: 100%;
  padding: 0;
  overflow-y: auto;
}

/* 顶部导航栏样式 */
.mobile-nav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 80px;
}
.mobile-close-button {
  cursor: pointer;
  padding: 8px;
  transition: transform 0.3s ease;
  margin-right: -8px;
}
.mobile-close-button:hover {
  transform: rotate(90deg);
}

/* 链接样式 */
.unmenu-links {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 30px;
}
.unmenu-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #1a1a1a;
  text-decoration: none;
  font-size: 1.25rem;
  padding: 1rem;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.unmenu-link:hover {
  background: rgba(0, 102, 255, 0.08);
  transform: translateX(10px);
}

/* 子菜单样式 */
.submenu-container {
  display: flex;
  flex-direction: column;
}

.dropdown-arrow {
  margin-left: auto;
  font-size: 0.75rem;
  transition: transform 0.3s ease;
}

.dropdown-arrow.open {
  transform: rotate(180deg);
}

.mobile-submenu {
  margin-top: 0.5rem;
  margin-left: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mobile-submenu-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #1a1a1a;
  text-decoration: none;
  font-size: 1.1rem;
  padding: 0.75rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.mobile-submenu-link:hover {
  background: rgba(0, 102, 255, 0.08);
  transform: translateX(5px);
}
</style>
