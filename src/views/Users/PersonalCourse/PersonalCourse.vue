<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const activeTab = ref('all')
const searchQuery = ref('')
const userCourses = ref<any[]>([])

onMounted(() => {
  loadUserCourses()
})

const loadUserCourses = () => {
  const storedCourses = localStorage.getItem('userCourses')
  if (storedCourses) {
    userCourses.value = JSON.parse(storedCourses)
  } else {
    // 模拟数据
    userCourses.value = [
      {
        id: 1,
        title: '小米 SU7 Ultra 技术详解',
        instructor: '张工',
        thumbnail: '/brand/ultra.png',
        progress: 75,
        totalLessons: 24,
        completedLessons: 18,
        category: '电动车',
        lastLearned: Date.now() - 3600000,
        rating: 4.8
      },
      {
        id: 2,
        title: 'TOYOTA GR SUPRA 性能解析',
        instructor: '李明',
        thumbnail: '/brand/supra.png',
        progress: 45,
        totalLessons: 20,
        completedLessons: 9,
        category: '经典车型',
        lastLearned: Date.now() - 86400000,
        rating: 4.6
      },
      {
        id: 3,
        title: 'SUBARU BRZ 改装教程',
        instructor: '王师傅',
        thumbnail: '/brand/brz.png',
        progress: 100,
        totalLessons: 16,
        completedLessons: 16,
        category: '改装',
        lastLearned: Date.now() - 172800000,
        rating: 4.9
      },
      {
        id: 4,
        title: 'NISSAN GT-R 赛道驾驶技巧',
        instructor: '陈教练',
        thumbnail: '/brand/gtr.png',
        progress: 30,
        totalLessons: 18,
        completedLessons: 5,
        category: '驾驶技巧',
        lastLearned: Date.now() - 259200000,
        rating: 4.7
      },
      {
        id: 5,
        title: 'DODGE CHALLENGER 维护与保养',
        instructor: '刘技师',
        thumbnail: '/brand/hellcat.png',
        progress: 0,
        totalLessons: 12,
        completedLessons: 0,
        category: '保养维修',
        lastLearned: 0,
        rating: 4.5
      }
    ]
  }
}

const filteredCourses = computed(() => {
  let filtered = userCourses.value

  // 按标签筛选
  if (activeTab.value === 'learning') {
    filtered = filtered.filter(c => c.progress > 0 && c.progress < 100)
  } else if (activeTab.value === 'completed') {
    filtered = filtered.filter(c => c.progress === 100)
  } else if (activeTab.value === 'notstarted') {
    filtered = filtered.filter(c => c.progress === 0)
  }

  // 搜索过滤
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(query) ||
        course.instructor.toLowerCase().includes(query) ||
        course.category.toLowerCase().includes(query)
    )
  }

  return filtered
})

const stats = computed(() => {
  const total = userCourses.value.length
  const learning = userCourses.value.filter(c => c.progress > 0 && c.progress < 100).length
  const completed = userCourses.value.filter(c => c.progress === 100).length
  const notStarted = userCourses.value.filter(c => c.progress === 0).length
  return { total, learning, completed, notStarted }
})

const getProgressColor = (progress: number) => {
  if (progress === 100) return '#4ecdc4'
  if (progress >= 50) return '#667eea'
  return '#f093fb'
}

const formatTimeAgo = (timestamp: number) => {
  if (!timestamp) return '从未学习'

  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`

  const date = new Date(timestamp)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const formatRating = (rating: number) => {
  return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating))
}

const goToCourse = (courseId: number) => {
  router.push(`/course/${courseId}`)
}

const goBack = () => {
  router.back()
}

const clearSearch = () => {
  searchQuery.value = ''
}
</script>

<template>
  <div class="personal-course-container">
    <!-- 返回按钮 -->
    <button class="back-btn" @click="goBack">
      <svg-icon name="menu" :width="24" :height="24" style="transform: rotate(90deg);"/>
    </button>

    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">我的学习库</h1>
      <p class="page-subtitle">管理您的课程和学习进度</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">📚</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-label">总课程数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📖</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.learning }}</div>
          <div class="stat-label">学习中</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.completed }}</div>
          <div class="stat-label">已完成</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⏳</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.notStarted }}</div>
          <div class="stat-label">未开始</div>
        </div>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="filter-bar">
      <div class="tabs">
        <div
            class="tab"
            :class="{ active: activeTab === 'all' }"
            @click="activeTab = 'all'"
        >
          全部课程
        </div>
        <div
            class="tab"
            :class="{ active: activeTab === 'learning' }"
            @click="activeTab = 'learning'"
        >
          学习中
        </div>
        <div
            class="tab"
            :class="{ active: activeTab === 'completed' }"
            @click="activeTab = 'completed'"
        >
          已完成
        </div>
        <div
            class="tab"
            :class="{ active: activeTab === 'notstarted' }"
            @click="activeTab = 'notstarted'"
        >
          未开始
        </div>
      </div>

      <div class="search-box">
        <input
            type="text"
            v-model="searchQuery"
            placeholder="搜索课程..."
            class="search-input"
        />
        <button v-if="searchQuery" class="clear-btn" @click="clearSearch">×</button>
        <svg-icon v-else name="home" :width="18" :height="18" class="search-icon"/>
      </div>
    </div>

    <!-- 课程列表 -->
    <div class="courses-grid">
      <div
          v-for="course in filteredCourses"
          :key="course.id"
          class="course-card"
          @click="goToCourse(course.id)"
      >
        <div class="course-thumbnail">
          <img :src="course.thumbnail" :alt="course.title" @error="$event.target.src='/placeholder.jpg'"/>
          <div v-if="course.progress === 100" class="completed-badge">已完成</div>
        </div>

        <div class="course-content">
          <h3 class="course-title">{{ course.title }}</h3>
          <div class="course-meta">
            <span class="instructor-name">{{ course.instructor }}</span>
            <span class="course-category">{{ course.category }}</span>
          </div>

          <div class="course-rating">
            {{ formatRating(course.rating) }}
            <span class="rating-score">{{ course.rating }}</span>
          </div>

          <div class="progress-section">
            <div class="progress-header">
              <span class="progress-text">学习进度</span>
              <span class="progress-percent">{{ course.progress }}%</span>
            </div>
            <div class="progress-bar">
              <div
                  class="progress-fill"
                  :style="{ width: course.progress + '%', background: getProgressColor(course.progress) }"
              ></div>
            </div>
            <div class="progress-details">
              <span>{{ course.completedLessons }}/{{ course.totalLessons }} 课时</span>
              <span class="last-learned">上次学习：{{ formatTimeAgo(course.lastLearned) }}</span>
            </div>
          </div>

          <button class="continue-btn" v-if="course.progress > 0 && course.progress < 100">
            继续学习
          </button>
          <button class="start-btn" v-else-if="course.progress === 0">
            开始学习
          </button>
          <button class="review-btn" v-else>
            复习课程
          </button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredCourses.length === 0" class="empty-state">
        <svg-icon name="user" :width="100" :height="100" style="opacity: 0.2;"/>
        <h3 class="empty-title">暂无课程</h3>
        <p class="empty-text">
          {{ searchQuery ? '没有找到匹配的课程' : '快去探索新课程吧！' }}
        </p>
        <button v-if="searchQuery" class="clear-search-btn" @click="clearSearch">
          清除搜索
        </button>
        <button v-else class="browse-btn" @click="router.push('/Course')">
          浏览课程
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.personal-course-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0c1f2e 0%, #061016 100%);
  padding: 40px 20px;
  position: relative;
}

.back-btn {
  position: absolute;
  top: 30px;
  left: 30px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 10;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(-5px);
}

.page-header {
  max-width: 1200px;
  margin: 0 auto 30px;
  padding-top: 20px;
}

.page-title {
  color: #fff;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 10px 0;
}

.page-subtitle {
  color: rgba(255, 255, 255, 0.6);
  font-size: 1rem;
  margin: 0;
}

.stats-grid {
  max-width: 1200px;
  margin: 0 auto 40px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-5px);
}

.stat-icon {
  font-size: 2.5rem;
}

.stat-info {
  flex: 1;
}

.stat-value {
  color: #fff;
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  margin-top: 4px;
}

.filter-bar {
  max-width: 1200px;
  margin: 0 auto 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.tabs {
  display: flex;
  gap: 10px;
  background: rgba(255, 255, 255, 0.05);
  padding: 6px;
  border-radius: 10px;
}

.tab {
  padding: 10px 20px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.3s ease;
  font-size: 0.95rem;
  font-weight: 500;
}

.tab:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.search-box {
  position: relative;
  width: 300px;
}

.search-input {
  width: 100%;
  padding: 10px 40px 10px 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: #fff;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.3);
}

.search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.5);
}

.clear-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: #fff;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.courses-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
}

.course-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.course-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-8px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}

.course-thumbnail {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.course-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.course-card:hover .course-thumbnail img {
  transform: scale(1.1);
}

.completed-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: linear-gradient(135deg, #4ecdc4 0%, #44a085 100%);
  color: #fff;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  box-shadow: 0 4px 10px rgba(78, 205, 196, 0.4);
}

.course-content {
  padding: 20px;
}

.course-title {
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.course-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.instructor-name {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
}

.course-category {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.85rem;
}

.course-rating {
  color: #ffd700;
  font-size: 0.9rem;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.rating-score {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
}

.progress-section {
  margin-bottom: 16px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-text {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.progress-percent {
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  transition: width 0.5s ease;
  border-radius: 3px;
}

.progress-details {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
}

.last-learned {
  font-size: 0.8rem;
}

.continue-btn,
.start-btn,
.review-btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.continue-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.continue-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.start-btn {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a085 100%);
  color: #fff;
}

.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(78, 205, 196, 0.4);
}

.review-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.review-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 80px 20px;
}

.empty-title {
  color: #fff;
  font-size: 1.5rem;
  margin: 20px 0 10px 0;
}

.empty-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: 1rem;
  margin-bottom: 30px;
}

.clear-search-btn,
.browse-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  padding: 12px 32px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-search-btn:hover,
.browse-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .courses-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

@media (max-width: 768px) {
  .personal-course-container {
    padding: 20px 15px;
  }

  .back-btn {
    top: 20px;
    left: 20px;
  }

  .page-title {
    font-size: 1.8rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }

  .stat-card {
    padding: 16px;
  }

  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .tabs {
    overflow-x: auto;
  }

  .search-box {
    width: 100%;
  }

  .courses-grid {
    grid-template-columns: 1fr;
  }
}
</style>
