<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import Unmenu from './unmenu.vue'
import { ElMessage } from 'element-plus'
import { getUserById } from '@/api/user'
import { getUserInfo, setUserInfo, clearUserInfo, getUserNotices, setUserNotices, clearSession } from '@/utils/session'

const router = useRouter()
const isMobileMenuOpen = ref(false)
const activeIndex = ref(-1)

// 用户相关状态
const isLoggedIn = ref(false)
const userInfo = ref<any>(null)
const showUserDropdown = ref(false)
const unreadNoticeCount = ref(0)
const hideDropdownTimer = ref<number | null>(null)

// 判断是否为管理员
const isAdmin = computed(() => {
  return userInfo.value?.level === 'admin'
})

// 判断是否为教师
const isTeacher = computed(() => {
  return userInfo.value?.level === 'teacher'
})

// 基础菜单链接（所有用户可见）
const baseLinks = [
  { path: '/Home', text: '首 页' },
]

// 仅登录用户可见的菜单链接
const authOnlyLinks = [
  { path: '/Upload',text: '上 传 课 程' },
]

// 非管理员可见的菜单（学生、教师可见）
const nonAdminLinks = [
  { path: '/Course',text: '课 程' },
  { path: '/Forum', text: '论 坛' },
  { path: '/Brand', text: '关 于' },
]

// 管理员专属菜单
const adminLinks = [
  { path: '/Admin', text: '管理后台' },
]

// 合并后的菜单链接（用于渲染）
const mainLinks = computed(() => {
  const links = [...baseLinks]

  // 如果是管理员，只显示首页和管理后台
  if (isAdmin.value) {
    links.push(...adminLinks)
    return links
  }

  // 如果不是管理员，添加普通用户菜单
  links.push(...nonAdminLinks)

  // 如果是教师，添加上传选项
  if (isTeacher.value) {
    links.push(...authOnlyLinks)
  }

  return links
})

onMounted(() => {
  checkLoginStatus()
  loadUnreadNotices()
  window.addEventListener('storage', handleStorageChange)

  router.beforeEach(() => {
    checkLoginStatus()
    loadUnreadNotices()
  })
})

onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange)
})

const checkLoginStatus = async () => {
  try {
    const user = getUserInfo()
    if (user) {
      try {
        const res = await getUserById(user.id)
        const userData = res

        userInfo.value = {
          id: userData.id,
          username: userData.username,
          nickname: userData.nickname || userData.username,
          level: userData.level,
          avatar: userData.avatarUrl || '',
          phone: userData.phone,
          email: userData.email
        }

        setUserInfo(userInfo.value)
        isLoggedIn.value = true
      } catch (error) {
        // 静默处理错误，使用缓存的用户信息
        userInfo.value = user
        userInfo.value.avatar = user.avatarUrl || user.avatar_url || user.avatar || ''
        isLoggedIn.value = true
      }
    } else {
      isLoggedIn.value = false
      userInfo.value = null
    }
  } catch (error) {
    console.error('检查登录状态失败:', error)
    // 发生错误时,清除无效的会话数据
    clearUserInfo()
    isLoggedIn.value = false
    userInfo.value = null
  }
}

const loadUnreadNotices = () => {
  if (!isLoggedIn.value) {
    unreadNoticeCount.value = 0
    return
  }

  const noticeList = getUserNotices()
  unreadNoticeCount.value = noticeList.filter((n: any) => !n.isRead).length
}

const handleStorageChange = (e: StorageEvent) => {
  if (e.key === 'userInfo') {
    // sessionStorage 不会触发 storage 事件，这里主要是为了兼容
    checkLoginStatus()
  }
  if (e.key === 'userNotices') {
    loadUnreadNotices()
  }
}

const showSubMenu = (index: number) => {
  activeIndex.value = index
}
const hideSubMenu = () => {
  activeIndex.value = -1
}

const searchSuggestions = computed(() => {
  if (!searchQuery.value || searchQuery.value.length === 0) return []

  const query = searchQuery.value.toLowerCase().trim()
  const allSuggestions = [
    { path: '/Home', title: '首页' },
    { path: '/Brand', title: '关于我们' },
    { path: '/Users', title: '用户中心' },
    { path: '/Reserve', title: '论坛' },
  ]

  return allSuggestions.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.path.toLowerCase().includes(query)
  ).slice(0, 5)
})

const handleSearchFocus = () => {
  isSearchFocused.value = true
  if (searchQuery.value.length > 0) {
    showSearchSuggestions.value = true
  }
}

const handleSearchBlur = () => {
  setTimeout(() => {
    isSearchFocused.value = false
    showSearchSuggestions.value = false
  }, 200)
}

const handleSearchInput = () => {
  if (searchQuery.value.length > 0) {
    showSearchSuggestions.value = true
  } else {
    showSearchSuggestions.value = false
  }
}

const handleSearchSubmit = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && searchQuery.value.trim()) {
    executeSearch()
  }
}

const executeSearch = () => {
  if (!searchQuery.value.trim()) return

  router.push({
    path: '/Search',
    query: { q: encodeURIComponent(searchQuery.value.trim()) }
  })
  showSearchSuggestions.value = false
  ;(e.target as HTMLInputElement)?.blur()
}

const selectSuggestion = (suggestion: typeof searchSuggestions.value[0]) => {
  searchQuery.value = suggestion.title
  executeSearch()
}

const handleAvatarError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.style.display = 'none'
  const placeholder = target.nextElementSibling as HTMLElement
  if (placeholder) {
    placeholder.style.display = 'flex'
  }
}

const getAvatarUrl = computed(() => {
  if (!userInfo.value) return ''
  return userInfo.value.avatar || userInfo.value.avatarUrl || userInfo.value.avatar_url || ''
})

const showUserDropdownMenu = () => {
  if (hideDropdownTimer.value) {
    clearTimeout(hideDropdownTimer.value)
    hideDropdownTimer.value = null
  }
  showUserDropdown.value = true
}

const hideUserDropdownMenu = () => {
  hideDropdownTimer.value = window.setTimeout(() => {
    showUserDropdown.value = false
  }, 200)
}

const goToLogin = () => {
  router.push('/Users')
}

const goToProfile = () => {
  router.push('/PersonalCenter')
  showUserDropdown.value = false
}

const goToLibrary = () => {
  router.push('/PersonalCourse')
  showUserDropdown.value = false
}

const goToNotice = () => {
  router.push('/Notice')
  showUserDropdown.value = false
  markAllNoticesAsRead()
}

const markAllNoticesAsRead = () => {
  if (!isLoggedIn.value) return

  const notices = localStorage.getItem('userNotices')
  if (notices) {
    const noticeList = JSON.parse(notices)
    noticeList.forEach((n: any) => n.isRead = true)
    localStorage.setItem('userNotices', JSON.stringify(noticeList))
    unreadNoticeCount.value = 0
  }
}

const getUserLevelText = (level: string) => {
  switch (level) {
    case 'student':
      return '学生'
    case 'teacher':
      return '教师'
    case 'admin':
      return '管理员'
    default:
      return level
  }
}

const handleUploadClick = (e: Event) => {
  if (!isLoggedIn.value) {
    e.preventDefault()
    ElMessage.warning('请先登录后再上传内容')
    router.push('/Users')
    return false
  }
  return true
}

const handleLogout = () => {
  clearSession()
  isLoggedIn.value = false
  userInfo.value = null
  unreadNoticeCount.value = 0
  showUserDropdown.value = false

  ElMessage.success('已退出登录')

  setTimeout(() => {
    router.push('/Home')
  }, 500)
}

onUnmounted(() => {
  if (hideDropdownTimer.value) {
    clearTimeout(hideDropdownTimer.value)
  }
})

</script>

<template>
  <header class="header">
    <div class="logo">
      <svg-icon name="courseShare" :width="70" height="70"/>
      <span class="logo-text">CourShare</span>
    </div>

    <nav class="nav-container" @mouseleave="hideSubMenu">
      <div class="nav-links">
        <div
            class="nav-item"
            v-for="(link, index) in mainLinks"
            :key="index"
            @mouseenter="showSubMenu(index)"
        >
          <template v-if="link.isCourse">
            <span class="nav-link service-trigger">
              {{ link.text }}
              <span class="underline"></span>
            </span>

            <div v-if="activeIndex === index" class="course-megamenu">
              <div class="megamenu-container">
                <div
                    v-for="(category, catIndex) in courseCategories"
                    :key="catIndex"
                    class="megamenu-column"
                >
                  <div class="category-header">
                    <svg-icon :name="category.icon" :width="24" :height="24" />
                    <h3>{{ category.category }}</h3>
                  </div>
                  <div class="category-courses">
                    <router-link
                        v-for="(course, courseIndex) in category.courses"
                        :key="courseIndex"
                        :to="course.path"
                        class="course-card"
                    >
                      <div class="course-image">
                        <img :src="course.image" :alt="course.name" @error="$event.target.src='/placeholder.jpg'">
                      </div>
                      <div class="course-info">
                        <h4>{{ course.name }}</h4>
                        <p>{{ course.description }}</p>
                      </div>
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <template v-else-if="link.isSearch">
            <div class="search-container">
              <input
                  type="text"
                  class="search-input"
                  v-model="searchQuery"
                  placeholder="搜索..."
                  @focus="handleSearchFocus"
                  @blur="handleSearchBlur"
                  @input="handleSearchInput"
                  @keydown.enter="handleSearchSubmit"
              />
              <button class="search-btn" @click="executeSearch">
                <svg-icon name="home" :width="18" :height="18"/>
              </button>

              <div v-if="showSearchSuggestions && searchSuggestions.length > 0" class="search-suggestions">
                <div
                    v-for="(suggestion, index) in searchSuggestions"
                    :key="index"
                    class="suggestion-item"
                    @click="selectSuggestion(suggestion)"
                >
                  <span>{{ suggestion.title }}</span>
                </div>
              </div>
            </div>
          </template>

          <template v-else-if="link.submenu">
             <span class="nav-link service-trigger">
               {{ link.text }}
               <span class="underline"></span>
             </span>

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

      <div class="mobile-menu" @click="isMobileMenuOpen = !isMobileMenuOpen">
        <svg-icon name="menu" :width="30" height="30" />
      </div>
    </nav>

    <div class="desktop-user">
      <template v-if="isLoggedIn && userInfo">
        <div
            class="user-info-wrapper"
            @mouseenter="showUserDropdownMenu"
            @mouseleave="hideUserDropdownMenu"
        >
          <div class="user-avatar">
            <img
                v-if="getAvatarUrl"
                :src="getAvatarUrl"
                :alt="userInfo.nickname || userInfo.username"
                class="avatar-img"
                @error="handleAvatarError"
            />
            <div v-else class="avatar-placeholder">
              {{ (userInfo.nickname || userInfo.username)?.charAt(0).toUpperCase() }}
            </div>
          </div>
          <span class="username-text">{{ userInfo.nickname || userInfo.username }}</span>

          <div v-if="unreadNoticeCount > 0" class="notice-badge">
            {{ unreadNoticeCount > 9 ? '9+' : unreadNoticeCount }}
          </div>

          <transition name="dropdown-fade">
            <div
                v-if="showUserDropdown"
                class="user-dropdown"
                @mouseenter="showUserDropdownMenu"
                @mouseleave="hideUserDropdownMenu"
            >
              <div class="dropdown-header">
                <div class="dropdown-avatar">
                  <img
                      v-if="getAvatarUrl"
                      :src="getAvatarUrl"
                      :alt="userInfo.nickname || userInfo.username"
                      class="avatar-img"
                      @error="handleAvatarError"
                  />
                  <div v-else class="avatar-placeholder">
                    {{ (userInfo.nickname || userInfo.username)?.charAt(0).toUpperCase() }}
                  </div>
                </div>
                <div class="dropdown-info">
                  <div class="dropdown-username">{{ userInfo.nickname || userInfo.username }}</div>
                  <div class="dropdown-level">{{ getUserLevelText(userInfo.level) }}</div>
                </div>
              </div>

              <div class="dropdown-divider"></div>

              <div class="dropdown-items">
                <div class="dropdown-item" @click="goToProfile">
                  <svg-icon name="user" :width="18" :height="18"/>
                  <span>个人中心</span>
                </div>
                <div class="dropdown-item" @click="goToNotice">
                  <svg-icon name="notice" :width="18" :height="18"/>
                  <span>我的通知</span>
                  <div v-if="unreadNoticeCount > 0" class="notice-dot"></div>
                </div>
                <div class="dropdown-item" @click="goToLibrary">
                  <svg-icon name="record" :width="18" :height="18"/>
                  <span>学习记录</span>
                </div>
                <div class="dropdown-divider"></div>
                <div class="dropdown-item logout" @click="handleLogout">
                  <svg-icon name="logout" :width="18" :height="18"/>
                  <span>退出登录</span>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </template>
      <template v-else>
        <div class="user-icon-wrapper" @click="goToLogin">
          <svg-icon name="user" :width="30" height="30" style="cursor: pointer;"/>
        </div>
      </template>
    </div>
  </header>

  <Unmenu
      :is-open="isMobileMenuOpen"
      :on-close="() => isMobileMenuOpen = false"
  />
</template>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 9999;
  backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80px;
  box-sizing: border-box;
  padding: 0 60px;
  border-bottom: 1px solid rgba(0, 102, 255, 0.1);
}

.logo {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 12px;
}

.logo-text {
  display: block;
  background: linear-gradient(110deg, #0066FF 0%, #00D4FF 40%, #7C3AED 80%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 24px rgba(0, 102, 255, 0.3));
  font-size: 1.5rem;
  font-weight: 800;
}

.nav-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80px;
  padding: 0;
}

.desktop-user {
  display: flex;
  align-items: center;
  position: relative;
  flex-shrink: 0;
  justify-content: flex-end;
  padding-right: 0;
}

.nav-item {
  position: relative;
}

.nav-links {
  display: flex;
  gap: 4rem;
}

.nav-links a, .service-trigger {
  position: relative;
  color: #1a1a1a;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 0;
  transition: opacity 0.3s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  height: 40px;
}

.nav-links a::after, .service-trigger::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: #0066FF;
  transition: width 0.3s ease;
}
.nav-links a:hover::after, .service-trigger:hover::after {
  width: 100%;
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
  height: 60px;
}

.search-input {
  width: 200px;
  padding: 8px 40px 8px 12px;
  background: rgba(0, 102, 255, 0.05);
  border: 1px solid rgba(0, 102, 255, 0.2);
  border-radius: 20px;
  color: #1a1a1a;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.3s ease;
  line-height: 1.5;
}

.search-input:focus {
  background: rgba(0, 102, 255, 0.1);
  border-color: rgba(0, 102, 255, 0.4);
  width: 240px;
}

.search-input::placeholder {
  color: rgba(26, 26, 26, 0.5);
}

.search-btn {
  position: absolute;
  right: 5px;
  background: transparent;
  border: none;
  color: #0066FF;
  padding: 5px 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.search-btn:hover {
  transform: scale(1.1);
}

.search-suggestions {
  position: absolute;
  top: calc(100% + 10px);
  left: 0;
  width: 240px;
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid rgba(0, 102, 255, 0.2);
  border-radius: 8px;
  padding: 8px 0;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  z-index: 1001;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.suggestion-item {
  padding: 10px 15px;
  color: #1a1a1a;
  cursor: pointer;
  transition: background 0.2s ease;
}

.suggestion-item:hover {
  background: rgba(0, 102, 255, 0.1);
}

.course-megamenu {
  position: fixed;
  top: 80px;
  left: 0;
  width: 100%;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  padding: 40px 5%;
  z-index: 999;
  animation: slideDownMega 0.3s ease;
  border-top: 1px solid rgba(0, 102, 255, 0.1);
}

@keyframes slideDownMega {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.megamenu-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
  max-width: 1400px;
  margin: 0 auto;
}

.megamenu-column {
  background: rgba(0, 102, 255, 0.03);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(0, 102, 255, 0.1);
  transition: all 0.3s ease;
}

.megamenu-column:hover {
  background: rgba(0, 102, 255, 0.06);
  border-color: rgba(0, 102, 255, 0.2);
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 102, 255, 0.1);
}

.category-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid rgba(0, 102, 255, 0.2);
}

.category-header h3 {
  color: #1a1a1a;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}

.category-courses {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.course-card {
  display: block;
  text-decoration: none;
  background: rgba(0, 102, 255, 0.05);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.course-card:hover {
  background: rgba(0, 102, 255, 0.1);
  border-color: rgba(0, 102, 255, 0.3);
  transform: translateX(5px);
  box-shadow: 0 5px 15px rgba(0, 102, 255, 0.15);
}

.course-image {
  width: 100%;
  height: 120px;
  overflow: hidden;
  position: relative;
}

.course-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.course-card:hover .course-image img {
  transform: scale(1.1);
}

.course-info {
  padding: 12px;
}

.course-info h4 {
  color: #1a1a1a;
  font-size: 0.95rem;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.course-info p {
  color: rgba(26, 26, 26, 0.6);
  font-size: 0.85rem;
  margin: 0;
  line-height: 1.4;
}

.desktop-user {
  display: flex;
  align-items: center;
  position: relative;
  flex-shrink: 0;
  padding-right: 60px;
}

.user-info-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.user-info-wrapper:hover {
  background: rgba(0, 102, 255, 0.1);
}

.user-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.user-icon-wrapper:hover {
  background: rgba(0, 102, 255, 0.1);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 102, 255, 0.1);
  border: 2px solid rgba(0, 102, 255, 0.3);
  position: relative;
  transition: all 0.3s ease;
}

.user-info-wrapper:hover .user-avatar {
  border-color: rgba(0, 102, 255, 0.6);
  box-shadow: 0 0 15px rgba(0, 102, 255, 0.2);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
  transition: transform 0.3s ease;
}

.user-info-wrapper:hover .avatar-img {
  transform: scale(1.05);
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  background: linear-gradient(135deg, #0066FF 0%, #00D4FF 100%);
}

.username-text {
  color: #1a1a1a;
  font-size: 1rem;
  font-weight: 500;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notice-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #ff4757;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 0.7rem;
  font-weight: 600;
  min-width: 18px;
  text-align: center;
  box-shadow: 0 2px 5px rgba(255, 71, 87, 0.5);
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 5px);
  right: 0;
  width: 240px;
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid rgba(0, 102, 255, 0.15);
  border-radius: 12px;
  padding: 12px 0;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  z-index: 1001;
  backdrop-filter: blur(10px);
  animation: dropdownSlide 0.2s ease;
}

.user-dropdown::before {
  content: '';
  position: absolute;
  top: -8px;
  right: 0;
  left: 0;
  height: 8px;
  background: transparent;
}

@keyframes dropdownSlide {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
}

.dropdown-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 102, 255, 0.1);
  border: 2px solid rgba(0, 102, 255, 0.3);
  flex-shrink: 0;
  position: relative;
}

.dropdown-avatar .avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
}

.dropdown-avatar .avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 22px;
  font-weight: 600;
  background: linear-gradient(135deg, #0066FF 0%, #00D4FF 100%);
}

.dropdown-info {
  flex: 1;
  overflow: hidden;
}

.dropdown-username {
  color: #1a1a1a;
  font-size: 0.95rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-level {
  color: rgba(26, 26, 26, 0.6);
  font-size: 0.8rem;
  margin-top: 4px;
}

.dropdown-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 8px 16px;
}

.dropdown-items {
  display: flex;
  flex-direction: column;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  color: #1a1a1a;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.dropdown-item:hover {
  background: rgba(0, 102, 255, 0.1);
}

.dropdown-item.logout {
  color: #ff6b6b;
}

.dropdown-item.logout:hover {
  background: rgba(255, 107, 107, 0.1);
}

.dropdown-item svg {
  flex-shrink: 0;
}

.dropdown-item span {
  font-size: 0.9rem;
}

.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: all 0.2s ease;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
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

.submenu {
  display: flex;
  position: fixed;
  gap: 2rem;
  top: 80px;
  left: 0;
  width: 100%;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
  padding: 0.8rem 0;
  justify-content: center;
  align-items: center;
}
.submenu-link {
  text-decoration: none;
  font-size: 0.9rem;
  transition: background 0.3s;
}

@media (max-width: 1100px) {
  .nav-links {
    gap: 2rem;
  }
  .megamenu-container {
    grid-template-columns: repeat(2, 1fr);
  }
}


@media (max-width: 950px) {
  .nav-links,
  .desktop-user {
    display: none;
  }

  .mobile-menu {
    display: block;
  }

  .search-container {
    display: none;
  }

  .course-megamenu {
    display: none;
  }
}

@media (max-width: 768px) {
  .header {
    padding: 0 20px;
  }

  .logo {
    width: auto;
    min-width: 150px;
  }
}
</style>