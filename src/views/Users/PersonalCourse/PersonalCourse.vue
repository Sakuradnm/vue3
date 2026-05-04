<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getUserStudyRecords, getCourseDetail } from '@/api/course'
import { isLoggedIn, getUserInfo } from '@/utils/session'

const router = useRouter()
const activeTab = ref('all')
const searchQuery = ref('')
const userCourses = ref<any[]>([])
const loading = ref(true)

onMounted(() => {
  loadUserCourses()
})

const loadUserCourses = async () => {
  // 检查是否登录
  if (!isLoggedIn()) {
    ElMessage.warning('请先登录后查看学习记录')
    router.push('/Users')
    return
  }
  
  const userInfo = getUserInfo()
  if (!userInfo || !userInfo.id) {
    ElMessage.error('无法获取用户信息，请重新登录')
    router.push('/Users')
    return
  }
  
  try {
    loading.value = true
    
    // 1. 从后端获取学习记录
    const studyRecords = await getUserStudyRecords(userInfo.id)
    
    if (!studyRecords || studyRecords.length === 0) {
      userCourses.value = []
      return
    }
    
    // 2. 获取每门课程的详细信息
    const courseDetailsPromises = studyRecords.map(async (record) => {
      try {
        const detail = await getCourseDetail(record.courseId)
        return {
          id: record.courseId,
          title: detail.courseName || record.courseName,
          instructor: detail.instructor || '待定讲师',
          thumbnail: `/brand/${getThumbnailByCourseId(record.courseId)}.png`,
          progress: record.progressPercent || 0,
          totalLessons: 0, // 需要从outline获取
          completedLessons: 0,
          category: getCategoryByCourseId(record.courseId),
          lastLearned: record.lastLearnedAt ? new Date(record.lastLearnedAt).getTime() : 0,
          rating: 0, // 需要从ratings获取
          accent: getAccentByCourseId(record.courseId),
        }
      } catch (error) {
        console.error(`获取课程${record.courseId}详情失败:`, error)
        return {
          id: record.courseId,
          title: record.courseName || `课程${record.courseId}`,
          instructor: '待定讲师',
          thumbnail: '/brand/default.png',
          progress: record.progressPercent || 0,
          totalLessons: 0,
          completedLessons: 0,
          category: '其他',
          lastLearned: record.lastLearnedAt ? new Date(record.lastLearnedAt).getTime() : 0,
          rating: 0,
          accent: '#4f6ef7',
        }
      }
    })
    
    const courses = await Promise.all(courseDetailsPromises)
    userCourses.value = courses.filter(c => c !== null)
    
  } catch (error: any) {
    ElMessage.error(error.message || '加载学习记录失败')
    userCourses.value = []
  } finally {
    loading.value = false
  }
}

// 辅助函数：根据课程ID获取缩略图
const getThumbnailByCourseId = (courseId: number): string => {
  const thumbnails: Record<number, string> = {
    1: 'ultra',
    2: 'supra',
    3: 'brz',
    4: 'gtr',
    5: 'hellcat',
  }
  return thumbnails[courseId] || 'default'
}

// 辅助函数：根据课程ID获取分类
const getCategoryByCourseId = (courseId: number): string => {
  const categories: Record<number, string> = {
    1: '电动车',
    2: '经典车型',
    3: '改装',
    4: '驾驶技巧',
    5: '保养维修',
  }
  return categories[courseId] || '其他'
}

// 辅助函数：根据课程ID获取主题色
const getAccentByCourseId = (courseId: number): string => {
  const accents: Record<number, string> = {
    1: '#4f6ef7',
    2: '#f59e0b',
    3: '#06d6a0',
    4: '#ef4444',
    5: '#a855f7',
  }
  return accents[courseId] || '#4f6ef7'
}

const filteredCourses = computed(() => {
  let list = userCourses.value
  if (activeTab.value === 'learning')   list = list.filter(c => c.progress > 0 && c.progress < 100)
  else if (activeTab.value === 'completed') list = list.filter(c => c.progress === 100)
  else if (activeTab.value === 'notstarted') list = list.filter(c => c.progress === 0)
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.instructor.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
    )
  }
  return list
})

const stats = computed(() => ({
  total: userCourses.value.length,
  learning: userCourses.value.filter(c => c.progress > 0 && c.progress < 100).length,
  completed: userCourses.value.filter(c => c.progress === 100).length,
  notStarted: userCourses.value.filter(c => c.progress === 0).length,
}))

const overallProgress = computed(() => {
  if (!userCourses.value.length) return 0
  return Math.round(userCourses.value.reduce((s, c) => s + c.progress, 0) / userCourses.value.length)
})

const formatTimeAgo = (ts: number) => {
  if (!ts) return '从未学习'
  const diff = Date.now() - ts
  const m = Math.floor(diff / 60000), h = Math.floor(diff / 3600000), d = Math.floor(diff / 86400000)
  if (m < 60) return `${m}分钟前`
  if (h < 24) return `${h}小时前`
  if (d < 7)  return `${d}天前`
  const dt = new Date(ts)
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`
}

const getStatusLabel = (p: number) => p === 100 ? '已完成' : p > 0 ? '学习中' : '未开始'
const getStatusClass = (p: number) => p === 100 ? 'done' : p > 0 ? 'active' : 'idle'
const getProgressColor = (p: number, accent: string) => p === 100 ? '#06d6a0' : accent

const goToCourse = (id: number) => router.push(`/course/${id}`)
const goBack = () => router.back()
const clearSearch = () => { searchQuery.value = '' }
</script>

<template>
  <div class="cl-root">
    <!-- Background -->
    <div class="cl-bg">
      <div class="bg-orb orb1" />
      <div class="bg-orb orb2" />
      <div class="bg-orb orb3" />
      <div class="bg-grid" />
    </div>

    <div class="cl-layout">

      <!-- ── Header ── -->
      <div class="cl-header">
        <button class="back-btn" @click="goBack">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div class="header-main">
          <div class="header-text">
            <h1 class="page-title">我的学习库</h1>
            <p class="page-sub">{{ userCourses.length }} 门课程 · 整体完成度 {{ overallProgress }}%</p>
          </div>
          <!-- Overall ring -->
          <div class="progress-ring-wrap">
            <svg width="58" height="58" viewBox="0 0 58 58">
              <circle cx="29" cy="29" r="24" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="5"/>
              <circle cx="29" cy="29" r="24" fill="none"
                      stroke="url(#ring-grad)" stroke-width="5"
                      stroke-linecap="round"
                      :stroke-dasharray="`${(overallProgress / 100) * 150.8} 150.8`"
                      stroke-dashoffset="37.7"
                      transform="rotate(-90 29 29)"
              />
              <defs>
                <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#4f6ef7"/>
                  <stop offset="100%" stop-color="#a855f7"/>
                </linearGradient>
              </defs>
            </svg>
            <span class="ring-label">{{ overallProgress }}%</span>
          </div>
        </div>
      </div>

      <!-- ── Stats ── -->
      <div class="stats-row">
        <div class="stat-chip" v-for="s in [
          { val: stats.total,      label: '全部课程', icon: '◈' },
          { val: stats.learning,   label: '学习中',   icon: '◉' },
          { val: stats.completed,  label: '已完成',   icon: '✓' },
          { val: stats.notStarted, label: '未开始',   icon: '◌' },
        ]" :key="s.label">
          <span class="chip-icon">{{ s.icon }}</span>
          <span class="chip-val">{{ s.val }}</span>
          <span class="chip-lbl">{{ s.label }}</span>
        </div>
      </div>

      <!-- ── Filter bar ── -->
      <div class="filter-bar">
        <div class="tabs">
          <button v-for="t in [
            { key:'all',        label:'全部' },
            { key:'learning',   label:'学习中' },
            { key:'completed',  label:'已完成' },
            { key:'notstarted', label:'未开始' },
          ]" :key="t.key"
                  class="tab-btn" :class="{ active: activeTab === t.key }"
                  @click="activeTab = t.key"
          >{{ t.label }}</button>
        </div>
        <div class="search-wrap">
          <svg class="search-ic" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input v-model="searchQuery" placeholder="搜索课程、讲师…" class="search-input" />
          <button v-if="searchQuery" class="clear-btn" @click="clearSearch">✕</button>
        </div>
      </div>

      <!-- ── Course Grid ── -->
      <div class="courses-grid">
        <!-- Loading -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p class="loading-text">正在加载学习记录...</p>
        </div>
        
        <TransitionGroup v-else name="course">
          <div
              v-for="course in filteredCourses"
              :key="course.id"
              class="course-card"
              @click="goToCourse(course.id)"
          >
            <!-- Thumbnail -->
            <div class="thumb-wrap">
              <div class="thumb-placeholder" :style="{ background: `linear-gradient(135deg, ${course.accent}33, ${course.accent}11)` }">
                <span class="thumb-initial">{{ course.title.charAt(0) }}</span>
              </div>
              <img :src="course.thumbnail" :alt="course.title" class="thumb-img"
                   @error="($event.target as HTMLImageElement).style.display='none'" />
              <div class="thumb-overlay">
                <div class="play-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                </div>
              </div>
              <div class="status-tag" :class="getStatusClass(course.progress)">
                {{ getStatusLabel(course.progress) }}
              </div>
            </div>

            <!-- Detail -->
            <div class="card-body">
              <div class="card-top">
                <span class="category-tag">{{ course.category }}</span>
                <div class="rating">
                  <span class="star">★</span>
                  <span class="rating-val">{{ course.rating }}</span>
                </div>
              </div>

              <h3 class="course-title">{{ course.title }}</h3>
              <p class="instructor">{{ course.instructor }}</p>

              <!-- Progress -->
              <div class="progress-wrap">
                <div class="progress-info">
                  <span class="lessons-count">{{ course.completedLessons }}/{{ course.totalLessons }} 课时</span>
                  <span class="progress-pct" :style="{ color: getProgressColor(course.progress, course.accent) }">
                    {{ course.progress }}%
                  </span>
                </div>
                <div class="progress-track">
                  <div class="progress-fill"
                       :style="{
                      width: course.progress + '%',
                      background: `linear-gradient(90deg, ${getProgressColor(course.progress, course.accent)}, ${getProgressColor(course.progress, course.accent)}bb)`
                    }"
                  />
                </div>
                <p class="last-learn">上次学习：{{ formatTimeAgo(course.lastLearned) }}</p>
              </div>

              <!-- CTA -->
              <button class="cta-btn"
                      :class="course.progress === 100 ? 'done' : course.progress > 0 ? 'continue' : 'start'"
                      :style="course.progress < 100 && course.progress > 0 ? { background: `linear-gradient(135deg, ${course.accent}, ${course.accent}99)` } : {}"
              >
                {{ course.progress === 100 ? '复习课程' : course.progress > 0 ? '继续学习' : '开始学习' }}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>
            </div>
          </div>
        </TransitionGroup>

        <!-- Empty -->
        <div v-if="filteredCourses.length === 0" class="empty-state">
          <div class="empty-icon">◈</div>
          <p class="empty-title">{{ searchQuery ? '没有找到匹配的课程' : '暂无课程记录' }}</p>
          <p class="empty-sub">{{ searchQuery ? '尝试使用不同的关键词' : '快去探索感兴趣的课程吧' }}</p>
          <button v-if="searchQuery" class="empty-btn" @click="clearSearch">清除搜索</button>
          <button v-else class="empty-btn" @click="router.push('/Course')">浏览课程</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap');

/* ─── Root ─── */
.cl-root {
  min-height: 100vh;
  font-family: 'DM Sans', sans-serif;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 50%, #f0f7ff 100%);
  color: #1a1a1a;
  position: relative; overflow-x: hidden;
}

/* ─── Background ─── */
.cl-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
.bg-orb { position: absolute; border-radius: 50%; filter: blur(130px); opacity: .06; }
.orb1 { width: 600px; height: 600px; background: radial-gradient(circle, rgba(0,102,255,0.1), transparent); top: -200px; left: -100px; animation: fo1 19s ease-in-out infinite alternate; }
.orb2 { width: 500px; height: 500px; background: radial-gradient(circle, rgba(139,92,246,0.08), transparent); bottom: -100px; right: -80px; animation: fo2 23s ease-in-out infinite alternate; }
.orb3 { width: 300px; height: 300px; background: radial-gradient(circle, rgba(6,182,212,0.06), transparent); top: 50%; left: 50%; animation: fo3 15s ease-in-out infinite alternate; }
@keyframes fo1 { to { transform: translate(50px, 70px); } }
@keyframes fo2 { to { transform: translate(-50px, -50px); } }
@keyframes fo3 { to { transform: translate(-30px, 40px) scale(1.2); } }
.bg-grid {
  position: absolute; inset: 0;
  background-image:
      linear-gradient(rgba(0,102,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,102,255,0.025) 1px, transparent 1px);
  background-size: 52px 52px;
}

/* ─── Layout ─── */
.cl-layout {
  position: relative; z-index: 1;
  max-width: 1160px; margin: 0 auto;
  padding: 48px 28px 80px;
}

/* ─── Header ─── */
.cl-header { margin-bottom: 36px; }
.back-btn {
  width: 38px; height: 38px; border-radius: 50%;
  background: #ffffff; border: 1px solid #dee2e6;
  color: #6c757d; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all .2s; margin-bottom: 20px;
}
.back-btn:hover { background: #f8f9fa; color: #1a1a1a; transform: translateX(-2px); }
.header-main { display: flex; align-items: center; justify-content: space-between; }
.page-title { font-size: 2rem; font-weight: 600; margin: 0 0 4px; color: #1a1a1a; }
.page-sub { font-size: .85rem; color: #6c757d; margin: 0; }

.progress-ring-wrap { position: relative; width: 58px; height: 58px; }
.ring-label {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Space Mono', monospace; font-size: .72rem; font-weight: 700;
  color: #0066FF;
}

/* ─── Stats ─── */
.stats-row {
  display: flex; gap: 12px; margin-bottom: 32px;
  flex-wrap: wrap;
}
.stat-chip {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 18px; border-radius: 10px;
  background: #ffffff;
  border: 1px solid #e9ecef;
  cursor: default;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.chip-icon { font-size: 14px; color: #adb5bd; }
.chip-val  { font-family: 'Space Mono', monospace; font-size: 1rem; font-weight: 700; color: #1a1a1a; }
.chip-lbl  { font-size: .78rem; color: #6c757d; }

/* ─── Filter bar ─── */
.filter-bar {
  display: flex; align-items: center; justify-content: space-between;
  gap: 16px; margin-bottom: 28px; flex-wrap: wrap;
}
.tabs { display: flex; gap: 6px; }
.tab-btn {
  padding: 9px 18px; border-radius: 9px;
  border: 1px solid #dee2e6;
  background: #ffffff;
  color: #6c757d;
  font-family: 'DM Sans', sans-serif; font-size: .86rem; font-weight: 500;
  cursor: pointer; transition: all .2s;
}
.tab-btn:hover { background: #f8f9fa; color: #1a1a1a; }
.tab-btn.active { background: rgba(0,102,255,0.08); border-color: rgba(0,102,255,0.3); color: #0066FF; }

.search-wrap {
  position: relative; display: flex; align-items: center;
  background: #ffffff; border: 1px solid #dee2e6;
  border-radius: 10px; padding: 0 14px; width: 260px;
  transition: all .2s;
}
.search-wrap:focus-within { border-color: #0066FF; background: #ffffff; box-shadow: 0 0 0 3px rgba(0,102,255,0.1); }
.search-ic { color: #adb5bd; flex-shrink: 0; }
.search-input {
  flex: 1; border: none; background: transparent; padding: 10px 10px;
  color: #1a1a1a; font-family: 'DM Sans', sans-serif; font-size: .88rem;
}
.search-input:focus { outline: none; }
.search-input::placeholder { color: #ced4da; }
.clear-btn {
  background: none; border: none; color: #adb5bd;
  cursor: pointer; font-size: 14px; padding: 2px 4px;
  transition: color .2s;
}
.clear-btn:hover { color: #6c757d; }

/* ─── Grid ─── */
.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

/* ─── Card ─── */
.course-card {
  background: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 16px; overflow: hidden; cursor: pointer;
  transition: all .3s ease;
  display: flex; flex-direction: column;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.course-card:hover {
  background: #f8f9fa;
  border-color: #dee2e6;
  transform: translateY(-6px);
  box-shadow: 0 16px 48px rgba(0,0,0,0.1);
}

/* Thumbnail */
.thumb-wrap {
  position: relative; height: 170px; overflow: hidden;
}
.thumb-placeholder {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
}
.thumb-initial {
  font-size: 4rem; font-weight: 700;
  opacity: .25; font-family: 'Space Mono', monospace;
}
.thumb-img {
  position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
  transition: transform .4s ease;
}
.course-card:hover .thumb-img { transform: scale(1.07); }
.thumb-overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.3);
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity .3s;
}
.course-card:hover .thumb-overlay { opacity: 1; }
.play-btn {
  width: 46px; height: 46px; border-radius: 50%;
  background: rgba(255,255,255,0.95); color: #0066FF;
  display: flex; align-items: center; justify-content: center;
  transform: scale(.85); transition: transform .3s;
}
.course-card:hover .play-btn { transform: scale(1); }

.status-tag {
  position: absolute; top: 12px; right: 12px;
  font-size: .72rem; font-weight: 600; padding: 4px 10px; border-radius: 20px;
  font-family: 'Space Mono', monospace; letter-spacing: .03em;
}
.status-tag.done   { background: rgba(6,214,160,0.12); color: #059669; border: 1px solid rgba(6,214,160,0.3); }
.status-tag.active { background: rgba(0,102,255,0.1); color: #0066FF; border: 1px solid rgba(0,102,255,0.25); }
.status-tag.idle   { background: #f8f9fa; color: #6c757d; border: 1px solid #dee2e6; }

/* Card body */
.card-body { padding: 18px; flex: 1; display: flex; flex-direction: column; gap: 0; }
.card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.category-tag {
  font-size: .72rem; padding: 3px 9px; border-radius: 6px;
  background: #f8f9fa; color: #6c757d;
  border: 1px solid #e9ecef;
}
.rating { display: flex; align-items: center; gap: 4px; }
.star { color: #f59e0b; font-size: .85rem; }
.rating-val { font-size: .78rem; color: #adb5bd; font-family: 'Space Mono', monospace; }

.course-title {
  font-size: .98rem; font-weight: 600; margin: 0 0 4px;
  color: #1a1a1a;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.instructor { font-size: .8rem; color: #6c757d; margin: 0 0 16px; }

/* Progress */
.progress-wrap { margin-bottom: 16px; }
.progress-info { display: flex; justify-content: space-between; align-items: center; margin-bottom: 7px; }
.lessons-count { font-size: .78rem; color: #6c757d; font-family: 'Space Mono', monospace; }
.progress-pct  { font-size: .82rem; font-weight: 700; font-family: 'Space Mono', monospace; }
.progress-track {
  height: 4px; border-radius: 2px; background: #e9ecef; overflow: hidden;
  margin-bottom: 7px;
}
.progress-fill { height: 100%; border-radius: 2px; transition: width .6s ease; }
.last-learn { font-size: .75rem; color: #adb5bd; margin: 0; }

/* CTA */
.cta-btn {
  width: 100%; padding: 11px 16px; border-radius: 10px; border: none; cursor: pointer;
  font-family: 'DM Sans', sans-serif; font-size: .88rem; font-weight: 500;
  display: flex; align-items: center; justify-content: center; gap: 7px;
  transition: all .25s; margin-top: auto;
}
.cta-btn.continue { color: #fff; }
.cta-btn.continue:hover { filter: brightness(1.15); transform: translateY(-1px); }
.cta-btn.start {
  background: linear-gradient(135deg, #0066FF, #0080FF); color: #fff;
}
.cta-btn.start:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,102,255,0.3); }
.cta-btn.done {
  background: rgba(6,214,160,0.1); border: 1px solid rgba(6,214,160,0.25); color: #059669;
}
.cta-btn.done:hover { background: rgba(6,214,160,0.15); }

/* ─── Empty ─── */
.empty-state {
  grid-column: 1/-1; text-align: center; padding: 80px 20px;
}
.empty-icon {
  font-size: 3.5rem; color: #dee2e6;
  font-family: 'Space Mono', monospace; margin-bottom: 18px;
}
.empty-title { font-size: 1.05rem; font-weight: 500; color: #6c757d; margin: 0 0 6px; }
.empty-sub   { font-size: .82rem; color: #adb5bd; margin: 0 0 24px; }
.empty-btn {
  padding: 10px 28px; border-radius: 10px; border: none; cursor: pointer;
  background: linear-gradient(135deg, #0066FF, #0080FF); color: #fff;
  font-family: 'DM Sans', sans-serif; font-size: .9rem; transition: all .25s;
}
.empty-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,102,255,0.3); }

/* ─── Loading ─── */
.loading-state {
  grid-column: 1/-1;
  text-align: center;
  padding: 100px 20px;
}
.loading-spinner {
  width: 48px;
  height: 48px;
  margin: 0 auto 20px;
  border: 4px solid #e9ecef;
  border-top-color: #0066FF;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.loading-text {
  font-size: 0.95rem;
  color: #6c757d;
  margin: 0;
}

/* ─── Transitions ─── */
.course-enter-active { transition: all .3s ease; }
.course-leave-active { transition: all .25s ease; position: absolute; }
.course-enter-from   { opacity: 0; transform: scale(.96) translateY(10px); }
.course-leave-to     { opacity: 0; transform: scale(.96); }

/* ─── Responsive ─── */
@media (max-width: 768px) {
  .cl-layout { padding: 28px 16px 60px; }
  .page-title { font-size: 1.5rem; }
  .courses-grid { grid-template-columns: 1fr; }
  .filter-bar { flex-direction: column; align-items: stretch; }
  .tabs { flex-wrap: wrap; }
  .search-wrap { width: 100%; }
  .stats-row { gap: 8px; }
  .stat-chip { padding: 8px 12px; }
}
</style>