<script setup lang="ts">
import { defineProps, watch, onBeforeUnmount, ref } from 'vue'

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
    { path: '/Ultra', text: '小米 SU7 Ultra', icon: 'Models' },
    { path: '/Supra', text: '丰田 GR SUPRA', icon: 'GR' },
    { path: '/Brz', text: '斯巴鲁 BRZ', icon: 'Models' },
    { path: '/Gtr', text: '尼桑 GT-R', icon: 'Models' },
    { path: '/Hellcat', text: '道奇 CHALLENGER SRT® HELLCAT', icon: 'Models' }
  ] as SubmenuItem[],
  serviceMenu: [
    { path: '/Maintenance', text: '保养检查', icon: 'Maintenance' },
    { path: '/AfterSales', text: '售后服务', icon: 'AfterSales' },
    { path: '/Repair', text: '故障维修', icon: 'Repair' },
    { path: '/Finance', text: '金融服务', icon: 'Finance' }
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

// 禁用滚动逻辑
const disableScroll = () => {
  document.body.style.overflow = 'hidden'
  document.addEventListener('touchmove', preventTouchScroll, { passive: false })
}

const enableScroll = () => {
  document.body.style.overflow = ''
  document.removeEventListener('touchmove', preventTouchScroll)
}

const preventTouchScroll = (e: TouchEvent) => {
  e.preventDefault()
}

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
          <!-- 服务菜单，带有子菜单 -->
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

          <router-link
            v-for="(link, index) in [
              { path: '/Brand', text: '品牌故事', icon: 'brand' },
              { path: '/Reserve', text: '预约试驾', icon: 'reserve' },
              { path: '/Users', text: '个人中心', icon: 'user' }
            ]"
            :key="index"
            :to="link.path"
            @click="onClose"
            class="unmenu-link"
          >
            <svg-icon :name="link.icon" :width="24" height="24" />
            <span>{{ link.text }}</span>
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
  background: rgba(1, 10, 14, 0.45);
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
  color: #fff;
  text-decoration: none;
  font-size: 1.25rem;
  padding: 1rem;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.unmenu-link:hover {
  background: rgba(255, 255, 255, 0.1);
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
  color: #fff;
  text-decoration: none;
  font-size: 1.1rem;
  padding: 0.75rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.mobile-submenu-link:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(5px);
}
</style>
