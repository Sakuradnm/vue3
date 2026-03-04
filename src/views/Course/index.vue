|NEW_FILE
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

interface Course {
  id: number
  title: string
  description: string
  instructor: string
  duration: string
  level: string
  image: string
  path: string
  students: number
  rating: number
}

interface Category {
  id: number
  name: string
  icon: string
  courses: Course[]
}

const selectedCategory = ref<number>(0)

const categories = ref<Category[]>([
  {
    id: 1,
    name: '驾驶基础',
    icon: 'steering-wheel',
    courses: [
      {
        id: 1,
        title: '新手驾驶入门',
        description: '从零开始学习驾驶基础知识和技巧',
        instructor: '张教练',
        duration: '8 课时',
        level: '初级',
        image: '/courses/basic-driving.jpg',
        path: '/course/basic',
        students: 1250,
        rating: 4.8
      },
      {
        id: 2,
        title: '交通规则详解',
        description: '全面掌握交通法规和道路标识',
        instructor: '李教官',
        duration: '6 课时',
        level: '初级',
        image: '/courses/traffic-rules.jpg',
        path: '/course/rules',
        students: 980,
        rating: 4.7
      },
      {
        id: 3,
        title: '停车技巧大全',
        description: '侧方停车、倒车入库等实用技巧',
        instructor: '王教练',
        duration: '4 课时',
        level: '初级',
        image: '/courses/parking.jpg',
        path: '/course/parking',
        students: 1500,
        rating: 4.9
      }
    ]
  },
  {
    id: 2,
    name: '进阶驾驶',
    icon: 'speedometer',
    courses: [
      {
        id: 4,
        title: '赛道驾驶技巧',
        description: '专业赛道驾驶技术和线路选择',
        instructor: '刘车手',
        duration: '12 课时',
        level: '中级',
        image: '/courses/track-driving.jpg',
        path: '/course/track',
        students: 650,
        rating: 4.9
      },
      {
        id: 5,
        title: '高性能车操控',
        description: '掌握大马力车辆的操控技巧',
        instructor: '陈技师',
        duration: '10 课时',
        level: '中级',
        image: '/courses/performance.jpg',
        path: '/course/performance',
        students: 520,
        rating: 4.8
      },
      {
        id: 6,
        title: '雨天驾驶安全',
        description: '湿滑路面的驾驶技巧和注意事项',
        instructor: '赵教练',
        duration: '5 课时',
        level: '中级',
        image: '/courses/rain-driving.jpg',
        path: '/course/rain',
        students: 890,
        rating: 4.6
      }
    ]
  },
  {
    id: 3,
    name: '车辆保养',
    icon: 'wrench',
    courses: [
      {
        id: 7,
        title: '日常保养知识',
        description: '学会基本的车辆检查和保养方法',
        instructor: '孙技师',
        duration: '6 课时',
        level: '初级',
        image: '/courses/maintenance.jpg',
        path: '/course/maintenance',
        students: 1100,
        rating: 4.7
      },
      {
        id: 8,
        title: '故障诊断基础',
        description: '识别常见故障并进行初步判断',
        instructor: '周师傅',
        duration: '8 课时',
        level: '中级',
        image: '/courses/diagnosis.jpg',
        path: '/course/diagnosis',
        students: 750,
        rating: 4.8
      }
    ]
  },
  {
    id: 4,
    name: '特种驾驶',
    icon: 'shield',
    courses: [
      {
        id: 9,
        title: '越野驾驶技术',
        description: '复杂地形的通过技巧和脱困方法',
        instructor: '吴队长',
        duration: '15 课时',
        level: '高级',
        image: '/courses/offroad.jpg',
        path: '/course/offroad',
        students: 420,
        rating: 4.9
      },
      {
        id: 10,
        title: '防御性驾驶',
        description: '预见危险并提前规避的高级技巧',
        instructor: '郑教官',
        duration: '10 课时',
        level: '高级',
        image: '/courses/defensive.jpg',
        path: '/course/defensive',
        students: 680,
        rating: 4.9
      }
    ]
  }
])

const navigateToCourse = (course: Course) => {
  router.push(`/course/${course.id}`)
}

const formatRating = (rating: number) => {
  return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating))
}
</script>

<template>
  <div class="courses-container">
    <div class="hero-section">
      <h1 class="page-title">专业课程培训</h1>
      <p class="page-subtitle">从新手到高手，系统化驾驶技能培训</p>
    </div>

    <div class="category-tabs">
      <button
          v-for="(category, index) in categories"
          :key="category.id"
          :class="['tab-btn', { active: selectedCategory === index }]"
          @click="selectedCategory = index"
      >
        <span class="tab-icon">{{ category.icon }}</span>
        {{ category.name }}
      </button>
    </div>

    <div class="courses-grid">
      <TransitionGroup name="fade" tag="div" class="grid-wrapper">
        <div
            v-for="course in categories[selectedCategory].courses"
            :key="course.id"
            class="course-card"
            @click="navigateToCourse(course)"
        >
          <div class="course-image-wrapper">
            <img :src="course.image" :alt="course.title" class="course-image">
            <div class="course-overlay">
              <span class="level-tag">{{ course.level }}</span>
            </div>
          </div>

          <div class="course-content">
            <h3 class="course-title">{{ course.title }}</h3>
            <p class="course-description">{{ course.description }}</p>

            <div class="course-meta">
              <div class="instructor">
                <svg-icon name="user" :width="16" :height="16"/>
                <span>{{ course.instructor }}</span>
              </div>
              <div class="duration">
                <svg-icon name="clock" :width="16" :height="16"/>
                <span>{{ course.duration }}</span>
              </div>
            </div>

            <div class="course-stats">
              <div class="students">
                <span>{{ course.students }}人已学习</span>
              </div>
              <div class="rating">
                <span class="stars">{{ formatRating(course.rating) }}</span>
                <span class="score">{{ course.rating }}</span>
              </div>
            </div>

            <button class="enroll-btn">立即学习</button>
          </div>
        </div>
      </TransitionGroup>
    </div>

    <div class="features-section">
      <h2>为什么选择我们的课程？</h2>
      <div class="features-grid">
        <div class="feature-item">
          <div class="feature-icon">🎓</div>
          <h3>专业教练团队</h3>
          <p>经验丰富的认证教练，因材施教</p>
        </div>
        <div class="feature-item">
          <div class="feature-icon">🚗</div>
          <h3>先进教学车辆</h3>
          <p>配备最新款式的各类车型</p>
        </div>
        <div class="feature-item">
          <div class="feature-icon">📅</div>
          <h3>灵活学习时间</h3>
          <p>周末班、晚班等多种时间选择</p>
        </div>
        <div class="feature-item">
          <div class="feature-icon">🏆</div>
          <h3>权威证书认证</h3>
          <p>完成课程可获得官方认证证书</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.courses-container {
  margin-top: 80px;
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0e1a 0%, #1a1f2e 100%);
  padding-bottom: 4rem;
}

.hero-section {
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(180deg, rgba(1, 10, 14, 0.8) 0%, transparent 100%);
}

.page-title {
  font-size: 3.5rem;
  color: #fff;
  margin-bottom: 1rem;
  font-weight: 700;
  text-shadow: 0 0 20px rgba(0, 123, 255, 0.5);
}

.page-subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.7);
  max-width: 600px;
  margin: 0 auto;
}

.category-tabs {
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 0.8rem 2rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 25px;
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.tab-btn.active {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  border-color: #007bff;
  box-shadow: 0 5px 20px rgba(0, 123, 255, 0.4);
}

.courses-grid {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.grid-wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
}

.course-card {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 15px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
}

.course-card:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-10px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
}

.course-image-wrapper {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.course-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.course-card:hover .course-image {
  transform: scale(1.1);
}

.course-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.7) 100%);
}

.level-tag {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(0, 123, 255, 0.9);
  color: #fff;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: 600;
}

.course-content {
  padding: 1.5rem;
}

.course-title {
  color: #fff;
  font-size: 1.4rem;
  margin-bottom: 0.8rem;
  font-weight: 600;
}

.course-description {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 1.2rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.course-meta {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
}

.instructor, .duration {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.course-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.2rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.students {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
}

.rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stars {
  color: #ffd700;
  font-size: 0.9rem;
}

.score {
  color: #fff;
  font-weight: 600;
}

.enroll-btn {
  width: 100%;
  padding: 0.8rem;
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.enroll-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 123, 255, 0.4);
}

.features-section {
  max-width: 1200px;
  margin: 4rem auto;
  padding: 3rem 2rem;
  text-align: center;
}

.features-section h2 {
  color: #fff;
  font-size: 2.5rem;
  margin-bottom: 3rem;
  font-weight: 700;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.feature-item {
  padding: 2rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.3s ease;
}

.feature-item:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-item h3 {
  color: #fff;
  font-size: 1.3rem;
  margin-bottom: 0.8rem;
}

.feature-item p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.95rem;
  line-height: 1.6;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }

  .category-tabs {
    flex-direction: column;
    align-items: stretch;
  }

  .tab-btn {
    justify-content: center;
  }

  .grid-wrapper {
    grid-template-columns: 1fr;
  }
}
</style>
