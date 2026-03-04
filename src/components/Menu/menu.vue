<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Unmenu from './unmenu.vue'

const router = useRouter()
const isMobileMenuOpen = ref(false)
const activeIndex = ref(-1)
const searchQuery = ref('')
const isSearchFocused = ref(false)
const showSearchSuggestions = ref(false)

const mainLinks = [
  { path: '/Home', text: '首 页' },
  { path: '/Course',text: '课 程' },
  { path: '/Upload',text: '上 传' },
  { path: '/Forum', text: '论 坛' },
  { path: '/Brand', text: '关 于' },
  { text: '搜索', isSearch: true },
]

const searchSuggestions = computed(() => {
  if (!searchQuery.value || searchQuery.value.length === 0) return []

  const query = searchQuery.value.toLowerCase().trim()
  const allSuggestions = [
    { path: '/Home', title: '首页' },
    { path: '/Brand', title: '关于我们' },
    { path: '/Users', title: '用户中心' },
    { path: '/Reserve', title: '论坛' },
    { path: '/Ultra', title: '小米 SU7 Ultra' },
    { path: '/Supra', title: 'TOYOTA GR SUPRA' },
    { path: '/Brz', title: 'SUBARU BRZ' },
    { path: '/Gtr', title: 'NISSAN GT-R' },
    { path: '/Hellcat', title: 'DODGE CHALLENGER SRT® HELLCAT' },
    { path: '/AfterSales', title: '售后服务' },
    { path: '/Finance', title: '金融服务' },
    { path: '/Maintenance', title: '保养维修' },
    { path: '/Agreement', title: '用户协议' },
    { path: '/Policy', title: '隐私政策' },
    { path: '/Help', title: '帮助中心' },
    { path: '/Customer', title: '客户服务' },
  ]

  return allSuggestions.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.path.toLowerCase().includes(query)
  ).slice(0, 5)
})

const showSubMenu = (index: number) => {
  activeIndex.value = index
}
const hideSubMenu = () => {
  activeIndex.value = -1
}

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

</script>

<template>
  <header class="header">
    <nav class="nav-container" @mouseleave="hideSubMenu">
      <router-link to="/Home">
        <svg-icon name="home" :width="70" height="70"/>
      </router-link>

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

      <div class="desktop-user">
        <router-link to="/Users">
          <svg-icon name="user" :width="30" height="30"/>
        </router-link>
      </div>

      <div class="mobile-menu" @click="isMobileMenuOpen = !isMobileMenuOpen">
        <svg-icon name="menu" :width="30" height="30" />
      </div>
    </nav>
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
  gap: 4rem;
}
.nav-links a, .service-trigger {
  position: relative;
  color: #fff;
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
  background: #fff;
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
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  color: #fff;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.3s ease;
  line-height: 1.5;
}

.search-input:focus {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.4);
  width: 240px;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.search-btn {
  position: absolute;
  right: 5px;
  background: transparent;
  border: none;
  color: #fff;
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
  background: rgba(1, 10, 14, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 8px 0;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.5);
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
  color: #fff;
  cursor: pointer;
  transition: background 0.2s ease;
}

.suggestion-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.course-megamenu {
  position: fixed;
  top: 80px;
  left: 0;
  width: 100%;
  background: rgba(1, 10, 14, 0.98);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
  padding: 40px 5%;
  z-index: 999;
  animation: slideDownMega 0.3s ease;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
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
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.3s ease;
}

.megamenu-column:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.category-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
}

.category-header h3 {
  color: #fff;
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
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.course-card:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateX(5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.4);
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
  color: #fff;
  font-size: 0.95rem;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.course-info p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
  margin: 0;
  line-height: 1.4;
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

@media (max-width: 1200px) {
  .megamenu-container {
    grid-template-columns: repeat(2, 1fr);
  }
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

  .search-container {
    display: none;
  }

  .course-megamenu {
    display: none;
  }
}
</style>
