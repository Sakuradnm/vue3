|NEW_FILE_CODE
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 从路由参数获取课程 ID
const courseId = computed(() => Number(route.params.id))

// 模拟课程数据（实际项目中应该从 API 获取）
interface CourseModule {
  id: number
  title: string
  duration: string
  description: string
  videos: Video[]
}

interface Video {
  id: number
  title: string
  duration: string
  isFree: boolean
  videoUrl: string
}

interface Review {
  id: number
  userName: string
  avatar: string
  rating: number
  comment: string
  date: string
  helpful: number
}

interface Course {
  id: number
  title: string
  description: string
  instructor: string
  instructorBio: string
  instructorAvatar: string
  duration: string
  level: string
  image: string
  students: number
  rating: number
  price: number
  originalPrice: number
  objectives: string[]
  requirements: string[]
  modules: CourseModule[]
  reviews: Review[]
}

const isLoading = ref(true)
const activeModule = ref<number | null>(null)
const isEnrolled = ref(false)

// 模拟课程数据
const course = ref<Course>({
  id: 1,
  title: '新手驾驶入门',
  description: '从零开始学习驾驶基础知识和技巧，适合完全零基础的学员。本课程将带你系统性地掌握驾驶的基本要领。',
  instructor: '张教练',
  instructorBio: '拥有 15 年驾驶教学经验，持有国家一级赛车手证书，累计培训学员超过 5000 人。擅长因材施教，耐心细致。',
  instructorAvatar: '/avatars/instructor-zhang.jpg',
  duration: '8 课时',
  level: '初级',
  image: '/courses/basic-driving.jpg',
  students: 1250,
  rating: 4.8,
  price: 299,
  originalPrice: 599,
  objectives: [
    '掌握基本的驾驶操作和车辆控制',
    '理解交通规则和道路标识',
    '学会安全驾驶的基本技巧',
    '能够独立进行日常驾驶'
  ],
  requirements: [
    '年满 18 周岁',
    '身体健康，无色盲色弱',
    '准备学习用品和笔记本'
  ],
  modules: [
    {
      id: 1,
      title: '第一章：驾驶基础认知',
      duration: '2 课时',
      description: '了解车辆基本结构和驾驶环境',
      videos: [
        { id: 1, title: '车辆仪表盘详解', duration: '15:30', isFree: true, videoUrl: '' },
        { id: 2, title: '座椅和后视镜调整', duration: '12:45', isFree: true, videoUrl: '' },
        { id: 3, title: '方向盘正确握法', duration: '10:20', isFree: false, videoUrl: '' }
      ]
    },
    {
      id: 2,
      title: '第二章：起步与停车',
      duration: '2 课时',
      description: '掌握平稳起步和准确停车的技巧',
      videos: [
        { id: 4, title: '手动挡起步技巧', duration: '18:00', isFree: false, videoUrl: '' },
        { id: 5, title: '自动挡起步要领', duration: '14:30', isFree: false, videoUrl: '' },
        { id: 6, title: '坡道起步不熄火', duration: '16:45', isFree: false, videoUrl: '' }
      ]
    },
    {
      id: 3,
      title: '第三章：转向与变道',
      duration: '2 课时',
      description: '学习安全转向和变道的操作方法',
      videos: [
        { id: 7, title: '转弯时机判断', duration: '13:20', isFree: false, videoUrl: '' },
        { id: 8, title: '变道完整流程', duration: '17:15', isFree: false, videoUrl: '' },
        { id: 9, title: '盲区检查方法', duration: '11:50', isFree: false, videoUrl: '' }
      ]
    },
    {
      id: 4,
      title: '第四章：综合路况实践',
      duration: '2 课时',
      description: '在实际道路环境中应用所学技能',
      videos: [
        { id: 10, title: '城市道路驾驶', duration: '25:00', isFree: false, videoUrl: '' },
        { id: 11, title: '高速公路注意事项', duration: '20:30', isFree: false, videoUrl: '' },
        { id: 12, title: '夜间驾驶技巧', duration: '19:45', isFree: false, videoUrl: '' }
      ]
    }
  ],
  reviews: [
    {
      id: 1,
      userName: '李明',
      avatar: '/avatars/user1.jpg',
      rating: 5,
      comment: '张教练讲得非常详细，零基础也能轻松跟上！已经推荐给朋友了。',
      date: '2024-03-01',
      helpful: 45
    },
    {
      id: 2,
      userName: '王芳',
      avatar: '/avatars/user2.jpg',
      rating: 5,
      comment: '课程内容很系统，从理论到实践都有涵盖，收获很大。',
      date: '2024-02-28',
      helpful: 32
    },
    {
      id: 3,
      userName: '张伟',
      avatar: '/avatars/user3.jpg',
      rating: 4,
      comment: '教学质量很好，就是希望能多一些实操视频。',
      date: '2024-02-25',
      helpful: 28
    }
  ]
})

// 格式化评分
const formatRating = (rating: number) => {
  return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating))
}

// 切换章节展开状态
const toggleModule = (moduleId: number) => {
  activeModule.value = activeModule.value === moduleId ? null : moduleId
}

// 立即学习/报名
const enrollCourse = () => {
  if (isEnrolled.value) {
    // 已报名，进入学习
    router.push(`/course/${courseId}/learn`)
  } else {
    // 未报名，执行报名逻辑
    isEnrolled.value = true
    alert('报名成功！现在开始学习吧～')
  }
}

// 返回列表
const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="course-detail-container">
    <!-- 顶部导航栏 -->
    <div class="top-nav">
      <button class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
        返回
      </button>
    </div>

    <!-- 课程头部信息 -->
    <div class="course-header">
      <div class="course-header-content">
        <div class="course-badge">{{ course.level }}</div>
        <h1 class="course-title">{{ course.title }}</h1>
        <p class="course-description">{{ course.description }}</p>

        <div class="course-meta-info">
          <div class="meta-item">
            <svg-icon name="user" :width="18" :height="18"/>
            <span>{{ course.students }}人已学习</span>
          </div>
          <div class="meta-item">
            <svg-icon name="clock" :width="18" :height="18"/>
            <span>{{ course.duration }}</span>
          </div>
          <div class="meta-item">
            <svg-icon name="star" :width="18" :height="18"/>
            <span class="rating-text">
              <span class="stars">{{ formatRating(course.rating) }}</span>
              <span class="score">{{ course.rating }}</span>
            </span>
          </div>
        </div>

        <div class="price-section">
          <span class="current-price">¥{{ course.price }}</span>
          <span class="original-price">¥{{ course.originalPrice }}</span>
          <span class="discount-tag">5 折优惠</span>
        </div>

        <button :class="['enroll-button', { enrolled: isEnrolled }]" @click="enrollCourse">
          {{ isEnrolled ? '继续学习' : '立即报名' }}
        </button>
      </div>

      <div class="course-image-wrapper">
        <img :src="course.image" :alt="course.title" class="course-cover"/>
      </div>
    </div>

    <!-- 课程主要内容 -->
    <div class="course-main">
      <!-- 左侧内容区 -->
      <div class="content-left">
        <!-- 学习目标 -->
        <section class="section-card">
          <h2 class="section-title">你将学到什么</h2>
          <div class="objectives-list">
            <div v-for="(objective, index) in course.objectives" :key="index" class="objective-item">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="#007bff" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
              <span>{{ objective }}</span>
            </div>
          </div>
        </section>

        <!-- 课程要求 -->
        <section class="section-card">
          <h2 class="section-title">课程要求</h2>
          <ul class="requirements-list">
            <li v-for="(req, index) in course.requirements" :key="index" class="requirement-item">
              {{ req }}
            </li>
          </ul>
        </section>

        <!-- 课程大纲 -->
        <section class="section-card">
          <h2 class="section-title">课程大纲</h2>
          <div class="modules-list">
            <div
                v-for="module in course.modules"
                :key="module.id"
                :class="['module-item', { active: activeModule === module.id }]"
            >
              <div class="module-header" @click="toggleModule(module.id)">
                <div class="module-info">
                  <h3 class="module-title">{{ module.title }}</h3>
                  <p class="module-description">{{ module.description }}</p>
                  <div class="module-meta">
                    <span class="video-count">{{ module.videos.length }}节课</span>
                    <span class="module-duration">{{ module.duration }}</span>
                  </div>
                </div>
                <svg
                    :class="['expand-icon', { expanded: activeModule === module.id }]"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                >
                  <path fill="currentColor" d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"/>
                </svg>
              </div>

              <transition name="slide">
                <div v-if="activeModule === module.id" class="module-content">
                  <div v-for="video in module.videos" :key="video.id" class="video-item">
                    <div class="video-info">
                      <svg-icon name="play" :width="20" :height="20"/>
                      <span class="video-title">{{ video.title }}</span>
                    </div>
                    <div class="video-meta">
                      <span v-if="video.isFree" class="free-tag">免费试看</span>
                      <span class="video-duration">{{ video.duration }}</span>
                      <button class="play-btn" :disabled="!isEnrolled && !video.isFree">
                        {{ isEnrolled || video.isFree ? '播放' : '锁住' }}
                      </button>
                    </div>
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </section>

        <!-- 学员评价 -->
        <section class="section-card">
          <h2 class="section-title">学员评价 ({{ course.reviews.length }})</h2>
          <div class="reviews-list">
            <div v-for="review in course.reviews" :key="review.id" class="review-item">
              <div class="review-header">
                <img :src="review.avatar" :alt="review.userName" class="user-avatar"/>
                <div class="user-info">
                  <div class="user-name">{{ review.userName }}</div>
                  <div class="review-rating">{{ formatRating(review.rating) }}</div>
                </div>
                <div class="review-date">{{ review.date }}</div>
              </div>
              <p class="review-comment">{{ review.comment }}</p>
              <div class="review-actions">
                <button class="helpful-btn">
                  <svg-icon name="thumb-up" :width="16" :height="16"/>
                  <span>{{ review.helpful }}人觉得有用</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- 右侧教练信息 -->
      <div class="sidebar-right">
        <div class="instructor-card">
          <h3 class="instructor-title">讲师介绍</h3>
          <div class="instructor-info">
            <img :src="course.instructorAvatar" :alt="course.instructor" class="instructor-avatar"/>
            <div class="instructor-details">
              <div class="instructor-name">{{ course.instructor }}</div>
              <p class="instructor-bio">{{ course.instructorBio }}</p>
            </div>
          </div>
        </div>

        <!-- 课程概览 -->
        <div class="overview-card">
          <h3 class="overview-title">课程概览</h3>
          <div class="overview-stats">
            <div class="stat-item">
              <div class="stat-value">{{ course.modules.length }}</div>
              <div class="stat-label">章节</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ course.modules.reduce((acc, m) => acc + m.videos.length, 0) }}</div>
              <div class="stat-label">视频</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ course.duration }}</div>
              <div class="stat-label">总时长</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ course.level }}</div>
              <div class="stat-label">难度</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.course-detail-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0e1a 0%, #1a1f2e 100%);
  padding-bottom: 4rem;
}

.top-nav {
  padding: 1.5rem 2rem;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #fff;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(-5px);
}

.course-header {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 3rem;
  align-items: center;
}

.course-badge {
  display: inline-block;
  padding: 0.4rem 1rem;
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  border-radius: 20px;
  color: #fff;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.course-title {
  font-size: 2.5rem;
  color: #fff;
  margin-bottom: 1rem;
  font-weight: 700;
  line-height: 1.2;
}

.course-description {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.course-meta-info {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.95rem;
}

.rating-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stars {
  color: #ffd700;
}

.score {
  color: #fff;
  font-weight: 600;
}

.price-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.current-price {
  font-size: 2rem;
  color: #00ff88;
  font-weight: 700;
}

.original-price {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.4);
  text-decoration: line-through;
}

.discount-tag {
  padding: 0.3rem 0.8rem;
  background: rgba(0, 255, 136, 0.15);
  border-radius: 4px;
  color: #00ff88;
  font-size: 0.85rem;
  font-weight: 600;
}

.enroll-button {
  width: 100%;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  border: none;
  border-radius: 10px;
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.enroll-button:hover:not(.enrolled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 123, 255, 0.4);
}

.enroll-button.enrolled {
  background: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%);
}

.course-image-wrapper {
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.course-cover {
  width: 100%;
  height: 300px;
  object-fit: cover;
}

.course-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
}

.section-card {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 15px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.section-title {
  color: #fff;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.objectives-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.objective-item {
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  line-height: 1.6;
}

.requirements-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.requirement-item {
  padding: 0.8rem 0;
  color: rgba(255, 255, 255, 0.7);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.requirement-item:last-child {
  border-bottom: none;
}

.modules-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.module-item {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.module-item.active {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(0, 123, 255, 0.3);
}

.module-header {
  padding: 1.5rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.module-header:hover {
  background: rgba(255, 255, 255, 0.03);
}

.module-title {
  color: #fff;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.module-description {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
  margin-bottom: 0.8rem;
}

.module-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.4);
}

.expand-icon {
  transition: transform 0.3s ease;
  color: rgba(255, 255, 255, 0.5);
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

.module-content {
  padding: 0 1.5rem 1.5rem;
}

.video-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  margin-bottom: 0.8rem;
}

.video-info {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
}

.video-title {
  font-size: 0.95rem;
}

.video-meta {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.free-tag {
  padding: 0.2rem 0.6rem;
  background: rgba(0, 255, 136, 0.15);
  border-radius: 4px;
  color: #00ff88;
  font-size: 0.75rem;
  font-weight: 600;
}

.video-duration {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.85rem;
}

.play-btn {
  padding: 0.4rem 1rem;
  background: rgba(0, 123, 255, 0.2);
  border: 1px solid rgba(0, 123, 255, 0.3);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
  cursor: not-allowed;
}

.play-btn:not(:disabled) {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  border: none;
  color: #fff;
  cursor: pointer;
}

.play-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 123, 255, 0.3);
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.review-item {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.review-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.user-info {
  flex: 1;
}

.user-name {
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
}

.review-rating {
  color: #ffd700;
  font-size: 0.9rem;
}

.review-date {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.85rem;
}

.review-comment {
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
  margin-bottom: 1rem;
}

.review-actions {
  display: flex;
  gap: 1rem;
}

.helpful-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.helpful-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.sidebar-right {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.instructor-card,
.overview-card {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 15px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.instructor-title,
.overview-title {
  color: #fff;
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.instructor-info {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.instructor-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(0, 123, 255, 0.3);
}

.instructor-name {
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.instructor-bio {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  line-height: 1.6;
}

.overview-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.stat-value {
  color: #007bff;
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 968px) {
  .course-header,
  .course-main {
    grid-template-columns: 1fr;
  }

  .course-image-wrapper {
    order: -1;
  }

  .course-cover {
    height: 250px;
  }

  .sidebar-right {
    order: -1;
  }
}
</style>
