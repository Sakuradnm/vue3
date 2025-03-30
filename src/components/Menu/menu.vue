<script setup lang="ts">
import { ref } from 'vue'
import Unmenu from './unmenu.vue'

const isMobileMenuOpen = ref(false)
const activeIndex = ref(-1)

const mainLinks = [
  { path: '/Home', text: '首 页' },
  { path: '/Models',text: '车 型', submenu: [
      { path: '/Brz', text: 'SUBARU BRZ' },
      { path: '/Hellcat', text: 'DODGE CHALLENGER SRT® HELLCAT' },
      { path: '/Supra', text: 'TOYOTA GR SUPRA' },
      { path: '/Gtr', text: 'NISSAN GT-R' },
      { path: '/Ultra', text: '小米 SU7 Ultra' },
    ]
  },
  { text: '服 务', submenu: [
      { path: '/AfterSales', text: '售后服务' },
      { path: '/Finance', text: '金融服务' },
      { path: '/Maintenance', text: '保养检查' },
      { path: '/Repair', text: '故障维修' },
    ]
  },
  { path: '/Brand', text: '品牌故事' },
  { path: '/Reserve', text: '预约试驾' }
]

const showSubMenu = (index: number) => {
  activeIndex.value = index
}
const hideSubMenu = () => {
  activeIndex.value = -1
}


</script>

<template>
  <!-- 导航栏 -->
  <header class="header">
    <nav class="nav-container" @mouseleave="hideSubMenu">
      <router-link to="/Home">
        <svg-icon name="home" :width="70" height="70"/>
      </router-link>

      <!-- 桌面端导航 -->
      <div class="nav-links">
        <div
            class="nav-item"
            v-for="(link, index) in mainLinks"
            :key="index"
            @mouseenter="showSubMenu(index)"
        >
          <!-- 服务菜单 -->
          <!-- 服务项特殊处理 -->
          <template v-if="link.submenu">
             <span class="nav-link service-trigger">
               {{ link.text }}
               <span class="underline"></span>
             </span>

            <!-- 服务子菜单 -->
            <div v-if="activeIndex === index" class="submenu">
              <router-link
                v-for="(sublink, subindex) in link.submenu"
                :key="subindex"
                :to="sublink.path"
                class="submenu-link"
              >
                {{ sublink.text }}
              </router-link>
            </div>
          </template>
          <template v-else>
            <router-link
                :to="link.path"
                class="nav-link"
                :class="{ 'active': activeIndex === index }"
            >
              {{ link.text }}
              <span class="underline"></span>
            </router-link>
          </template>
        </div>
      </div>

      <!-- 桌面用户入口 -->
      <div class="desktop-user">
        <router-link to="/Users">
          <svg-icon name="user" :width="30" height="30"/>
        </router-link>
      </div>

      <!-- 移动菜单按钮 -->
      <div class="mobile-menu" @click="isMobileMenuOpen = !isMobileMenuOpen">
        <svg-icon name="menu" :width="30" height="30" />
      </div>
    </nav>
  </header>

  <!-- 移动端菜单组件 -->
  <Unmenu
    :is-open="isMobileMenuOpen"
    :on-close="() => isMobileMenuOpen = false"
  />
</template>

<style scoped>
.header {
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
  backdrop-filter: blur(10px);
  background-color: rgba(1, 10, 14, 0.9);
}
.nav-container {
  height: 80px;
  padding: 0 5%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}
.nav-item {
  position: relative;
}
.nav-links {
  display: flex;
  gap: 3rem;
}
.nav-links a, .service-trigger {
  position: relative;
  color: #fff;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 0;
  transition: opacity 0.3s ease;
  cursor: pointer;
}

/* 底部下划线 */
.nav-links a::after, .service-trigger::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: #fff;
  transition: width 0.3s ease;
}
.nav-links a:hover::after, .service-trigger:hover::after {
  width: 100%;
}
.mobile-menu {
  display: none;
  cursor: pointer;
  z-index: 1001;
}
.mobile-nav-links a {
  color: #fff;
  font-size: 1.5rem;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  text-decoration: none;
}


/************************************************************
 * 服务子菜单样式
 ************************************************************/
.submenu {
  display: flex;
  position: fixed;
  gap: 2rem;
  top: 80px;
  left: 0;
  width: 100%;
  background: rgba(1, 10, 14, 0.70);
  box-shadow: 0 5px 10px rgba(1, 10, 14, 0.85);
  padding: 0.8rem 0;
  justify-content: center;
  align-items: center;
}
.submenu-link {
  text-decoration: none;
  font-size: 0.9rem;
  transition: background 0.3s;
}



@media (max-width: 768px) {
  .nav-links,
  .desktop-user {
    display: none;
  }

  .mobile-menu {
    display: block;
  }

  .nav-container {
    padding: 0 20px;
  }
}
</style>
