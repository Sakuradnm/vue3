<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, onBeforeMount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getCourseDetail, getCourseRatings } from '@/api/course'

const route = useRoute()
const router = useRouter()
const courseId = ref<number>(0)

const loading = ref(true)
const isEnrolled = ref(false)
const activeModule = ref<number | null>(1)
const activeTab = ref<'overview' | 'curriculum' | 'reviews'>('overview')
const likedReviews = ref<Set<number>>(new Set())
const mouseX = ref(0)
const mouseY = ref(0)
let particleRafId: number | null = null
let observers: IntersectionObserver[] = []

interface Video {
  id: number
  title: string
  duration: string
  isFree: boolean
}

interface Module {
  id: number
  title: string
  duration: string
  videoCount: number
  videos: Video[]
}

interface Review {
  id: number
  name: string
  initial: string
  color: string
  rating: number
  date: string
  comment: string
  helpful: number
}

const courseDetail = ref<any>(null)
const courseRatings = ref<any[]>([])

const mockModules: Module[] = [
  {
    id: 1,
    title: '第一章：基础概念与概述',
    duration: '2 课时',
    videoCount: 3,
    videos: [
      { id: 1, title: '课程导论与学习目标', duration: '15:30', isFree: true },
      { id: 2, title: '核心概念解析', duration: '12:45', isFree: true },
      { id: 3, title: '实践案例介绍', duration: '10:20', isFree: false },
    ]
  },
  {
    id: 2,
    title: '第二章：进阶技能训练',
    duration: '2 课时',
    videoCount: 3,
    videos: [
      { id: 4, title: '高级技巧讲解', duration: '18:00', isFree: false },
      { id: 5, title: '实战演练', duration: '14:30', isFree: false },
      { id: 6, title: '常见问题解答', duration: '16:45', isFree: false },
    ]
  },
  {
    id: 3,
    title: '第三章：综合应用实践',
    duration: '2 课时',
    videoCount: 3,
    videos: [
      { id: 7, title: '项目实战（上）', duration: '13:20', isFree: false },
      { id: 8, title: '项目实战（下）', duration: '17:15', isFree: false },
      { id: 9, title: '总结与展望', duration: '11:50', isFree: false },
    ]
  }
]

const course = computed(() => {
  if (!courseDetail.value) return null

  const detail = courseDetail.value
  const ratings = courseRatings.value

  const avgRating = ratings.length > 0
    ? (ratings.reduce((sum, r) => sum + Number(r.rating), 0) / ratings.length).toFixed(1)
    : '0.0'

  return {
    id: detail.courseId,
    title: detail.courseName,
    subtitle: detail.overview || '系统化专业课程',
    description: detail.courseDescription || detail.overview || '暂无详细描述',
    instructor: detail.teacher || '专业讲师',
    instructorTitle: '资深教育专家',
    instructorBio: '拥有丰富的教学经验和行业实践经验，致力于为学生提供优质的学习体验。',
    instructorInitial: (detail.teacher || '讲')[0],
    duration: `${Math.floor((detail.totalDuration || 480) / 60)} 小时`,
    level: '中级',
    levelColor: '#00ff9d',
    students: Math.floor(Math.random() * 5000) + 500,
    rating: Number(avgRating),
    reviews: ratings.length,
    accent: '#00d4ff',
    price: 299,
    originalPrice: 599,
    modules: mockModules,
    reviewList: ratings.map((r, idx) => ({
      id: r.id,
      name: r.nickname || r.username,
      initial: (r.nickname || r.username || '用')[0],
      avatar: r.avatar_url,
      color: ['#00c8ff', '#a259ff', '#ff6b35', '#00ff9d'][idx % 4],
      rating: Number(r.rating),
      date: r.created_at?.split('T')[0] || '2024-01-01',
      comment: r.comment,
      helpful: Math.floor(Math.random() * 50)
    }))
  }
})

const totalVideos = computed(() =>
  course.value?.modules.reduce((s: number, m: Module) => s + m.videos.length, 0) || 0
)

const toggleModule = (id: number) => {
  activeModule.value = activeModule.value === id ? null : id
}

const toggleLike = (id: number) => {
  if (likedReviews.value.has(id)) {
    likedReviews.value.delete(id)
  } else {
    likedReviews.value.add(id)
  }
}

const enroll = () => {
  isEnrolled.value = true
  ElMessage.success('报名成功！开始学习吧~')
}

const goBack = () => router.back()

const ratingBars = computed(() => {
  if (!course.value) return []
  const ratings = courseRatings.value
  return [5, 4, 3, 2, 1].map(stars => {
    const count = ratings.filter(r => Math.round(Number(r.rating)) === stars).length
    const pct = ratings.length > 0 ? Math.round((count / ratings.length) * 100) : 0
    return { stars, pct }
  })
})

async function loadCourseDetail() {
  const id = Number(route.params.id)
  if (!id || isNaN(id)) return

  courseId.value = id

  try {
    loading.value = true
    courseDetail.value = null
    courseRatings.value = []

    const data = await getCourseDetail(id)
    courseDetail.value = data

    const ratings = await getCourseRatings(id)
    courseRatings.value = ratings
  } catch (error) {
    console.error('加载课程详情失败:', error)
    ElMessage.error('加载课程详情失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

function initParticles(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!
  let W = window.innerWidth, H = window.innerHeight
  canvas.width = W
  canvas.height = H
  const count = Math.floor((W * H) / 12000)
  const pts = Array.from({ length: count }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.18,
    vy: (Math.random() - 0.5) * 0.18,
    r: Math.random() * 1.1 + 0.3,
    alpha: Math.random() * 0.35 + 0.08,
    color: ['0,255,180', '0,200,255', '80,255,200'][Math.floor(Math.random() * 3)]
  }))

  function draw() {
    ctx.clearRect(0, 0, W, H)
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y
        const d = Math.sqrt(dx * dx + dy * dy)
        if (d < 110) {
          ctx.beginPath()
          ctx.moveTo(pts[i].x, pts[i].y)
          ctx.lineTo(pts[j].x, pts[j].y)
          ctx.strokeStyle = `rgba(0,255,180,${0.04 * (1 - d / 110)})`
          ctx.lineWidth = 0.4
          ctx.stroke()
        }
      }
      const p = pts[i]
      p.x += p.vx
      p.y += p.vy
      if (p.x < 0) p.x = W
      if (p.x > W) p.x = 0
      if (p.y < 0) p.y = H
      if (p.y > H) p.y = 0
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${p.color},${p.alpha})`
      ctx.fill()
    }
    particleRafId = requestAnimationFrame(draw)
  }
  draw()
  window.addEventListener('resize', () => {
    W = window.innerWidth
    H = window.innerHeight
    canvas.width = W
    canvas.height = H
  })
}

function initObservers(root: Element) {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('visible')
    })
  }, { threshold: 0.08 })
  root.querySelectorAll('.fade-up').forEach(el => obs.observe(el))
  observers.push(obs)
}

function onMouseMove(e: MouseEvent) {
  mouseX.value = e.clientX
  mouseY.value = e.clientY
}

watch(() => course.value, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      observers.forEach(o => o.disconnect())
      observers = []

      const root = document.querySelector('.cd-root')
      const canvas = root?.querySelector('.bg-canvas') as HTMLCanvasElement
      if (canvas) initParticles(canvas)
      if (root) initObservers(root)
    }, 50)
  }
}, { immediate: true, deep: true })

onBeforeMount(() => {
  loadCourseDetail()
})

onMounted(() => {
  window.addEventListener('mousemove', onMouseMove)
})

onUnmounted(() => {
  if (particleRafId) cancelAnimationFrame(particleRafId)
  observers.forEach(o => o.disconnect())
  window.removeEventListener('mousemove', onMouseMove)
})
</script>

<template>
  <div class="cd-root">
    <canvas class="bg-canvas"></canvas>
    <div class="noise-layer"></div>
    <div class="cursor-glow" :style="{ left: mouseX + 'px', top: mouseY + 'px' }"></div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- Content -->
    <template v-else-if="course">
      <!-- ══ HERO BANNER ══ -->
      <section class="course-hero fade-up">
        <div class="hero-bg-grid"></div>
        <div class="hero-inner">
          <div class="hero-left">
            <div class="breadcrumb">
              <span class="bc-link" @click="goBack">返回《</span>
              <span class="bc-sep">›</span>
              <span class="bc-link">课程列表</span>
              <span class="bc-sep">›</span>
              <span class="bc-current">{{ course.title }}</span>
            </div>

            <div class="hero-badges">
              <span class="level-tag" :style="`color:${course.levelColor};border-color:${course.levelColor}44;background:${course.levelColor}10`">
                {{ course.level }}
              </span>
              <span class="students-tag">◆ {{ course.students.toLocaleString() }} 名学员</span>
            </div>

            <h1 class="course-title">{{ course.title }}</h1>
            <p class="course-subtitle">{{ course.subtitle }}</p>

            <div class="rating-row">
              <span class="stars-display">
                <span v-for="i in 5" :key="i" :style="{ color: i <= Math.floor(course.rating) ? '#ffd93d' : 'rgba(255,255,255,.15)' }">★</span>
              </span>
              <span class="rating-val">{{ course.rating }}</span>
              <span class="review-count">({{ course.reviews }} 条评价)</span>
            </div>

            <div class="hero-instructor">
              <div class="inst-avatar" :style="`background:linear-gradient(135deg,#00d4ff,#4fa3ff)`">
                <span>{{ course.instructorInitial }}</span>
              </div>
              <div>
                <span class="inst-name">{{ course.instructor }}</span>
                <span class="inst-title">{{ course.instructorTitle }}</span>
              </div>
            </div>

            <div class="meta-chips">
              <div class="chip" v-for="c in [
                { icon: '◎', text: course.duration },
                { icon: '▷', text: totalVideos + ' 节视频' },
                { icon: '◆', text: course.level + '难度' },
                { icon: '◈', text: '结课证书' },
              ]" :key="c.text">
                <span class="chip-icon">{{ c.icon }}</span>
                <span>{{ c.text }}</span>
              </div>
            </div>
          </div>

          <!-- Enroll card -->
          <div class="enroll-card">
            <div class="ec-thumb">
              <div class="ec-thumb-grid"></div>
              <div class="ec-thumb-glyph" :style="`color:${course.accent}20`">◎</div>
              <div class="ec-thumb-title">{{ course.title }}</div>
              <div class="ec-accent-line" :style="`background:${course.accent};box-shadow:0 0 14px ${course.accent}`"></div>
            </div>
            <div class="ec-body">
              <div class="price-row">
                <span class="price-current">¥{{ course.price }}</span>
                <span class="price-orig">¥{{ course.originalPrice }}</span>
                <span class="price-badge">5折</span>
              </div>
              <p class="price-note">限时优惠 · 随时可退款</p>
              <button class="enroll-btn" :class="{ enrolled: isEnrolled }" @click="enroll">
                <span class="cb-sweep"></span>
                {{ isEnrolled ? '继续学习 →' : '立即报名' }}
              </button>
              <div class="ec-features">
                <div class="ecf-item" v-for="f in ['终身有效访问','三端同步','结课颁发证书','30天无理由退款']" :key="f">
                  <span class="ecf-check">✓</span>{{ f }}
                </div>
              </div>
            </div>
            <div class="ec-corner tl"></div>
            <div class="ec-corner br"></div>
          </div>
        </div>
      </section>

      <!-- ══ MAIN ══ -->
      <div class="course-main">
        <div class="main-inner">
          <!-- Left -->
          <div class="content-left">
            <!-- Tab nav -->
            <div class="tab-nav">
              <button v-for="t in [
                { key:'overview', label:'课程介绍' },
                { key:'curriculum', label:'课程大纲' },
                { key:'reviews', label:`评价 (${course.reviews})` },
              ]" :key="t.key"
                      class="tab-btn" :class="{ active: activeTab === t.key }"
                      @click="activeTab = t.key as any">
                {{ t.label }}
                <div class="tab-bar"></div>
              </button>
            </div>

            <!-- ── Overview ── -->
            <div v-show="activeTab === 'overview'">
              <div class="content-block fade-up">
                <div class="cb-header">
                  <span class="cb-tag">[ DETAILS ]</span>
                  <h2 class="cb-title">课程详情</h2>
                </div>
                <p class="block-text">{{ course.description }}</p>
              </div>

              <div class="content-block fade-up">
                <div class="cb-header">
                  <span class="cb-tag">[ INSTRUCTOR ]</span>
                  <h2 class="cb-title">关于讲师</h2>
                </div>
                <div class="instructor-card">
                  <div class="inst-card-avatar" :style="`background:linear-gradient(135deg,${course.accent},#4fa3ff)`">
                    {{ course.instructorInitial }}
                  </div>
                  <div class="inst-card-info">
                    <h3 class="inst-card-name">{{ course.instructor }}</h3>
                    <p class="inst-card-title">{{ course.instructorTitle }}</p>
                    <div class="inst-stats">
                      <span>◉ 4.9 评分</span>
                      <span>· 5000+ 学员</span>
                      <span>· 15年经验</span>
                    </div>
                    <p class="inst-bio">{{ course.instructorBio }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- ── Curriculum ── -->
            <div v-show="activeTab === 'curriculum'">
              <div class="content-block fade-up">
                <div class="cb-header">
                  <div>
                    <span class="cb-tag">[ CURRICULUM ]</span>
                    <h2 class="cb-title">课程大纲</h2>
                  </div>
                  <span class="curriculum-meta">{{ course.modules.length }} 章 · {{ totalVideos }} 节视频</span>
                </div>
                <div class="modules-list">
                  <div v-for="module in course.modules" :key="module.id"
                       class="module-wrap" :class="{ open: activeModule === module.id }">
                    <button class="module-header" @click="toggleModule(module.id)">
                      <div class="mh-left">
                        <div class="module-num">{{ String(module.id).padStart(2,'0') }}</div>
                        <div class="mh-text">
                          <span class="module-title">{{ module.title }}</span>
                          <span class="module-meta">{{ module.videoCount }} 节 · {{ module.duration }}</span>
                        </div>
                      </div>
                      <svg class="chevron" :class="{ rotated: activeModule === module.id }" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </button>
                    <Transition name="expand">
                      <div v-if="activeModule === module.id" class="module-videos">
                        <div v-for="video in module.videos" :key="video.id"
                             class="video-row" :class="{ locked: !isEnrolled && !video.isFree }">
                          <div class="vr-left">
                            <div class="vr-icon">
                              <svg v-if="isEnrolled || video.isFree" width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                              <svg v-else width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                            </div>
                            <span class="vr-title">{{ video.title }}</span>
                            <span v-if="video.isFree" class="free-pill">免费试看</span>
                          </div>
                          <div class="vr-right">
                            <span class="vr-dur">{{ video.duration }}</span>
                            <button class="vr-btn" :disabled="!isEnrolled && !video.isFree">
                              {{ isEnrolled || video.isFree ? '播放' : '解锁' }}
                            </button>
                          </div>
                        </div>
                      </div>
                    </Transition>
                  </div>
                </div>
              </div>
            </div>

            <!-- ── Reviews ── -->
            <div v-show="activeTab === 'reviews'">
              <div class="content-block fade-up">
                <div class="cb-header">
                  <span class="cb-tag">[ REVIEWS ]</span>
                  <h2 class="cb-title">学员评价</h2>
                </div>
                <div class="rating-summary">
                  <div class="rating-big">
                    <span class="big-num">{{ course.rating }}</span>
                    <div class="big-stars">
                      <span v-for="i in 5" :key="i" :style="{ color: i <= Math.floor(course.rating) ? '#ffd93d' : 'rgba(255,255,255,.15)' }">★</span>
                    </div>
                    <span class="big-label">课程评分</span>
                  </div>
                  <div class="rating-bars">
                    <div v-for="bar in ratingBars" :key="bar.stars" class="bar-row">
                      <span class="bar-stars">{{ bar.stars }} ★</span>
                      <div class="bar-track"><div class="bar-fill" :style="`width:${bar.pct}%`"></div></div>
                      <span class="bar-pct">{{ bar.pct }}%</span>
                    </div>
                  </div>
                </div>

                <div class="reviews-list">
                  <div v-for="review in course.reviewList" :key="review.id" class="review-card">
                    <div class="review-top">
                      <div class="reviewer-avatar">
                        <img
                          v-if="review.avatar"
                          :src="review.avatar"
                          :alt="review.name"
                          class="avatar-img"
                          @error="$event.target.style.display='none'; $event.target.nextElementSibling.style.display='flex'"
                        />
                        <div class="avatar-placeholder" :style="`background:linear-gradient(135deg,${review.color},${review.color}88)`">
                          {{ review.initial }}
                        </div>
                      </div>
                      <div class="reviewer-info">
                        <span class="reviewer-name">{{ review.name }}</span>
                        <div class="reviewer-meta">
                          <span class="r-stars" style="color:#ffd93d">{{ '★'.repeat(review.rating) }}</span>
                          <span class="r-date">{{ review.date }}</span>
                        </div>
                      </div>
                    </div>
                    <p class="review-text">{{ review.comment }}</p>
                    <button class="helpful-btn" :class="{ liked: likedReviews.has(review.id) }" @click="toggleLike(review.id)">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" :stroke="likedReviews.has(review.id) ? '#00d4ff' : 'currentColor'" stroke-width="2">
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
                        <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                      </svg>
                      {{ review.helpful + (likedReviews.has(review.id) ? 1 : 0) }} 人觉得有用
                    </button>
                    <div class="rc-corner tl"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Sidebar -->
          <aside class="sidebar-right">
            <div class="sidebar-card fade-up">
              <div class="sc-tag">[ OVERVIEW ]</div>
              <h3 class="sc-title">课程概览</h3>
              <div class="overview-grid">
                <div class="ov-item" v-for="s in [
                  { val: course.modules.length, lbl: '章节数', icon: '◈' },
                  { val: totalVideos, lbl: '视频节数', icon: '▷' },
                  { val: course.duration, lbl: '总时长', icon: '◎' },
                  { val: course.level, lbl: '难度', icon: '◉' },
                ]" :key="s.lbl">
                  <span class="ov-icon">{{ s.icon }}</span>
                  <span class="ov-val">{{ s.val }}</span>
                  <span class="ov-lbl">{{ s.lbl }}</span>
                </div>
              </div>
            </div>

            <!-- Mobile enroll -->
            <div class="sidebar-card enroll-mobile fade-up">
              <div class="price-row">
                <span class="price-current">¥{{ course.price }}</span>
                <span class="price-orig">¥{{ course.originalPrice }}</span>
                <span class="price-badge">5折</span>
              </div>
              <button class="enroll-btn" :class="{ enrolled: isEnrolled }" @click="enroll">
                <span class="cb-sweep"></span>
                {{ isEnrolled ? '继续学习 →' : '立即报名' }}
              </button>
            </div>

            <div class="sidebar-card fade-up">
              <div class="sc-tag">[ RELATED ]</div>
              <h3 class="sc-title">同类推荐</h3>
              <div class="related-list">
                <div class="related-item" v-for="item in [
                  { title: '进阶课程A', instructor: '李老师', rating: 4.7, color: '#00d4ff' },
                  { title: '进阶课程B', instructor: '王老师', rating: 4.9, color: '#a259ff' },
                ]" :key="item.title">
                  <div class="ri-thumb" :style="`color:${item.color};border-color:${item.color}33;background:${item.color}0d`">◎</div>
                  <div class="ri-info">
                    <p class="ri-title">{{ item.title }}</p>
                    <p class="ri-meta">{{ item.instructor }} · <span style="color:#ffd93d">★</span> {{ item.rating }}</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </template>

    <!-- Error State -->
    <div v-else class="error-container">
      <p>课程不存在或加载失败</p>
      <button @click="goBack" class="back-btn">返回列表</button>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=JetBrains+Mono:wght@300;400;600&family=Noto+Sans+SC:wght@300;400;500;700&display=swap');

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.cd-root {
  background: #020b10;
  color: #c8f0e0;
  font-family: 'Noto Sans SC', sans-serif;
  min-height: 100vh;
  overflow-x: hidden;
  position: relative;
}

/* Loading & Error States */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 20px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(0, 212, 255, 0.2);
  border-top-color: #00d4ff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.back-btn {
  padding: 10px 24px;
  background: linear-gradient(135deg, #0060cc, #00d4ff);
  border: none;
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 180, 255, 0.4);
}

.bg-canvas {
  position: fixed; inset: 0;
  width: 100%; height: 100%;
  pointer-events: none; z-index: 0;
}
.noise-layer {
  position: fixed; inset: 0; z-index: 1;
  pointer-events: none; opacity: 0.022;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 180px;
}
.cursor-glow {
  position: fixed; z-index: 1;
  width: 500px; height: 500px;
  transform: translate(-50%,-50%);
  background: radial-gradient(circle, rgba(0,255,180,0.028) 0%, transparent 55%);
  pointer-events: none;
  transition: left 0.07s, top 0.07s;
}

.fade-up {
  opacity: 0; transform: translateY(22px);
  transition: opacity 0.7s cubic-bezier(0.25,1,0.5,1), transform 0.7s cubic-bezier(0.25,1,0.5,1);
}
.fade-up.visible { opacity:1; transform:translateY(0); }

.course-hero {
  position: relative; z-index: 2;
  padding: 84px 48px 56px;
  border-bottom: 1px solid rgba(0,212,255,0.08); overflow: hidden;
}
.hero-bg-grid {
  position: absolute; inset: 0;
  background-image: radial-gradient(circle, rgba(0,212,255,0.08) 1px, transparent 1px);
  background-size: 44px 44px;
  mask-image: radial-gradient(ellipse 100% 100% at 0% 0%, black 20%, transparent 75%);
}
.hero-inner {
  max-width: 1280px; margin: 0 auto;
  display: grid; grid-template-columns: 1fr 380px; gap: 60px; align-items: start;
  position: relative; z-index: 2;
}
.hero-left { display: flex; flex-direction: column; gap: 16px; }

.breadcrumb { display: flex; align-items: center; gap: 8px; font-family: 'JetBrains Mono', monospace; font-size: 0.73rem; letter-spacing: 0.06em; }
.bc-link { color: rgba(150,210,180,0.35); cursor: pointer; transition: color 0.2s; }
.bc-link:hover { color: #00d4ff; }
.bc-link:first-child { color: #00d4ff; }
.bc-link:first-child:hover { color: #00ff9d; text-shadow: 0 0 8px rgba(0,255,157,0.4); }
.bc-sep { color: rgba(0,212,255,0.2); }
.bc-current { color: #00d4ff; }

.hero-badges { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.level-tag {
  display: inline-flex; align-items: center;
  padding: 4px 12px; border-radius: 6px;
  font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; font-weight: 700;
  letter-spacing: 0.06em; border: 1px solid;
}
.students-tag {
  font-family: 'JetBrains Mono', monospace; font-size: 0.73rem; color: rgba(150,210,180,0.35);
  padding: 4px 12px; border-radius: 6px;
  background: rgba(0,212,255,0.06); border: 1px solid rgba(0,212,255,0.08);
}

.course-title {
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(1.8rem, 3vw, 2.8rem); font-weight: 700; line-height: 1.08;
  letter-spacing: 0.02em;
  background: linear-gradient(110deg, #fff 0%, #00d4ff 70%);
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent;
}
.course-subtitle { font-size: 0.95rem; color: rgba(200,240,224,0.85); line-height: 1.7; }

.rating-row { display: flex; align-items: center; gap: 10px; }
.stars-display { display: flex; gap: 2px; font-size: 1rem; }
.rating-val { font-family: 'JetBrains Mono', monospace; font-size: 0.95rem; font-weight: 700; color: #ffd93d; filter: drop-shadow(0 0 6px #ffd93d); }
.review-count { font-size: 0.8rem; color: rgba(150,210,180,0.35); }

.hero-instructor { display: flex; align-items: center; gap: 12px; }
.inst-avatar {
  width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Orbitron', sans-serif; font-size: 1rem; font-weight: 700; color: #fff;
}
.inst-name { display: block; font-family: 'JetBrains Mono', monospace; font-size: 0.82rem; font-weight: 600; color: #c8f0e0; letter-spacing: 0.04em; margin-bottom: 2px; }
.inst-title { display: block; font-size: 0.75rem; color: rgba(150,210,180,0.35); }

.meta-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.chip {
  display: flex; align-items: center; gap: 7px;
  padding: 6px 14px; border-radius: 8px; font-size: 0.78rem;
  background: rgba(0,212,255,0.06); border: 1px solid rgba(0,212,255,0.08);
  color: rgba(150,210,180,0.35);
}
.chip-icon { color: #00d4ff; font-size: 0.85rem; }

.enroll-card {
  background: rgba(8,20,44,0.96);
  border: 1px solid rgba(0,212,255,0.22); border-radius: 12px;
  overflow: hidden; position: relative;
  box-shadow: 0 24px 70px rgba(0,0,0,0.6), 0 0 60px rgba(0,212,255,0.06);
}
.ec-thumb { position: relative; height: 170px; overflow: hidden; }
.ec-thumb-grid {
  position: absolute; inset: 0; opacity: 0.1;
  background-image:
      linear-gradient(rgba(0,212,255,0.6) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,212,255,0.6) 1px, transparent 1px);
  background-size: 24px 24px;
}
.ec-thumb-glyph { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 5.5rem; font-weight: 900; }
.ec-thumb-title { position: absolute; bottom: 1rem; left: 1rem; right: 1rem; font-family: 'Orbitron', sans-serif; font-size: 0.82rem; font-weight: 700; letter-spacing: 0.1em; color: rgba(255,255,255,0.18); text-align: center; }
.ec-accent-line { position: absolute; bottom: 0; left: 0; right: 0; height: 2.5px; }
.ec-corner { position: absolute; width: 14px; height: 14px; border-color: rgba(0,212,255,0.22); border-style: solid; }
.ec-corner.tl { top: 0; left: 0; border-width: 1px 0 0 1px; }
.ec-corner.br { bottom: 0; right: 0; border-width: 0 1px 1px 0; }

.ec-body { padding: 20px 22px 24px; }
.price-row { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
.price-current { font-family: 'JetBrains Mono', monospace; font-size: 2rem; font-weight: 400; color: #fff; }
.price-orig { font-family: 'JetBrains Mono', monospace; font-size: 1rem; color: rgba(255,255,255,0.25); text-decoration: line-through; }
.price-badge {
  padding: 3px 9px; border-radius: 6px;
  font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; font-weight: 700;
  background: rgba(255,107,53,0.15); color: #ff8a4c; border: 1px solid rgba(255,107,53,0.3);
}
.price-note { font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; color: rgba(150,210,180,0.35); letter-spacing: 0.04em; margin-bottom: 18px; }

.enroll-btn {
  display: block; width: 100%; padding: 13px; border-radius: 10px; border: none; cursor: pointer;
  background: linear-gradient(135deg, #0060cc, #00d4ff); color: #fff;
  font-family: 'Noto Sans SC', sans-serif; font-size: 0.95rem; font-weight: 700; letter-spacing: 0.04em;
  position: relative; overflow: hidden;
  box-shadow: 0 6px 24px rgba(0,180,255,0.38); transition: all 0.3s; margin-bottom: 16px;
}
.enroll-btn:hover:not(.enrolled) { box-shadow: 0 10px 36px rgba(0,180,255,0.55); transform: translateY(-1px); }
.enroll-btn.enrolled { background: linear-gradient(135deg, #00a07a, #00ff9d); color: #000; }

.ec-features { display: flex; flex-direction: column; gap: 8px; }
.ecf-item { display: flex; align-items: center; gap: 10px; font-size: 0.8rem; color: rgba(150,210,180,0.35); }
.ecf-check { color: #00ff9d; font-weight: 700; }

.course-main { position: relative; z-index: 2; padding: 40px 48px 80px; max-width: 1280px; margin: 0 auto; }
.main-inner { display: grid; grid-template-columns: 1fr 300px; gap: 32px; }

.tab-nav { display: flex; border-bottom: 1px solid rgba(0,212,255,0.08); margin-bottom: 24px; }
.tab-btn {
  padding: 12px 22px; border: none; background: transparent; cursor: pointer;
  font-family: 'Noto Sans SC', sans-serif; font-size: 0.88rem; color: rgba(150,210,180,0.35);
  position: relative; transition: color 0.25s;
}
.tab-btn:hover { color: #c8f0e0; }
.tab-btn.active { color: #00d4ff; }
.tab-bar {
  position: absolute; bottom: -1px; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, #00d4ff, transparent);
  box-shadow: 0 0 10px rgba(0,212,255,0.3);
  transform: scaleX(0); transition: transform 0.3s cubic-bezier(0.25,1,0.5,1);
}
.tab-btn.active .tab-bar { transform: scaleX(1); }

.content-block {
  background: rgba(8,20,44,0.6); border: 1px solid rgba(0,212,255,0.08);
  border-radius: 12px; padding: 24px 28px; margin-bottom: 16px;
  transition: border-color 0.2s;
}
.content-block:hover { border-color: rgba(0,212,255,0.22); }
.cb-header { margin-bottom: 18px; }
.cb-tag { font-family: 'JetBrains Mono', monospace; font-size: 0.68rem; letter-spacing: 0.14em; color: #00d4ff; opacity: 0.7; display: block; margin-bottom: 4px; }
.cb-title { font-family: 'Orbitron', sans-serif; font-size: 1.1rem; font-weight: 600; letter-spacing: 0.04em; color: #c8f0e0; }
.block-text { font-size: 0.87rem; color: rgba(200,240,224,0.85); line-height: 1.85; }

.instructor-card { display: flex; gap: 18px; align-items: flex-start; }
.inst-card-avatar {
  width: 60px; height: 60px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Orbitron', sans-serif; font-size: 1.5rem; font-weight: 700; color: #fff;
}
.inst-card-name { font-family: 'Orbitron', sans-serif; font-size: 1rem; font-weight: 700; letter-spacing: 0.06em; color: #c8f0e0; margin-bottom: 3px; }
.inst-card-title { font-size: 0.78rem; color: rgba(150,210,180,0.35); margin-bottom: 10px; }
.inst-stats { display: flex; gap: 12px; font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; color: #00d4ff; opacity: 0.85; margin-bottom: 10px; }
.inst-bio { font-size: 0.82rem; color: rgba(200,240,224,0.85); line-height: 1.75; }

.curriculum-meta { font-family: 'JetBrains Mono', monospace; font-size: 0.73rem; color: rgba(150,210,180,0.35); }
.modules-list { display: flex; flex-direction: column; gap: 4px; }
.module-wrap { border: 1px solid rgba(0,212,255,0.08); border-radius: 10px; overflow: hidden; transition: border-color 0.25s; }
.module-wrap.open { border-color: rgba(0,212,255,0.22); }
.module-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 18px; width: 100%; border: none; background: transparent;
  cursor: pointer; color: #c8f0e0; transition: background 0.2s;
}
.module-header:hover { background: rgba(0,212,255,0.04); }
.mh-left { display: flex; align-items: center; gap: 14px; }
.module-num {
  font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em;
  color: #00d4ff; background: rgba(0,212,255,0.08); border: 1px solid rgba(0,212,255,0.08);
  padding: 3px 8px; border-radius: 5px;
}
.mh-text { display: flex; flex-direction: column; gap: 2px; text-align: left; }
.module-title { font-size: 0.88rem; font-weight: 600; color: #c8f0e0; }
.module-meta { font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; color: rgba(150,210,180,0.35); }
.chevron { color: rgba(150,210,180,0.35); transition: transform 0.3s cubic-bezier(0.25,1,0.5,1); }
.chevron.rotated { transform: rotate(180deg); color: #00d4ff; }

.module-videos { padding: 0 14px 14px; display: flex; flex-direction: column; gap: 2px; }
.video-row { display: flex; align-items: center; justify-content: space-between; padding: 9px 10px; border-radius: 8px; transition: background 0.2s; }
.video-row:hover { background: rgba(0,212,255,0.04); }
.video-row.locked { opacity: 0.5; }
.vr-left { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
.vr-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.vr-icon {
  width: 26px; height: 26px; border-radius: 6px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0,212,255,0.1); border: 1px solid rgba(0,212,255,0.08); color: #00d4ff;
}
.vr-title { font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; color: rgba(200,240,224,0.85); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.free-pill {
  font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; letter-spacing: 0.08em;
  color: #00ff9d; background: rgba(0,255,157,0.1); border: 1px solid rgba(0,255,157,0.25);
  padding: 2px 7px; border-radius: 5px; white-space: nowrap;
}
.vr-dur { font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; color: rgba(150,210,180,0.35); }
.vr-btn {
  font-family: 'Noto Sans SC', sans-serif; font-size: 0.75rem; letter-spacing: 0.04em;
  padding: 5px 12px; border-radius: 7px; border: 1px solid rgba(0,212,255,0.08);
  background: rgba(0,212,255,0.06); color: rgba(150,210,180,0.35); cursor: pointer;
  transition: all 0.2s;
}
.vr-btn:not(:disabled):hover { background: rgba(0,212,255,0.14); border-color: rgba(0,212,255,0.22); color: #00d4ff; }
.vr-btn:disabled { opacity: 0.35; cursor: not-allowed; }

.rating-summary {
  display: flex; gap: 32px; align-items: center;
  background: rgba(0,0,0,0.2); border: 1px solid rgba(0,212,255,0.08); border-radius: 10px;
  padding: 20px 24px; margin-bottom: 20px;
}
.rating-big { display: flex; flex-direction: column; align-items: center; gap: 6px; flex-shrink: 0; }
.big-num { font-family: 'JetBrains Mono', monospace; font-size: 3.5rem; color: #ffd93d; filter: drop-shadow(0 0 18px #ffd93d); line-height: 1; }
.big-stars { display: flex; gap: 2px; font-size: 1.05rem; }
.big-label { font-family: 'JetBrains Mono', monospace; font-size: 0.68rem; letter-spacing: 0.1em; color: rgba(150,210,180,0.35); }
.rating-bars { flex: 1; display: flex; flex-direction: column; gap: 7px; }
.bar-row { display: flex; align-items: center; gap: 10px; }
.bar-stars { font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; color: rgba(150,210,180,0.35); width: 30px; flex-shrink: 0; }
.bar-track { flex: 1; height: 4px; background: rgba(255,255,255,0.06); border-radius: 2px; overflow: hidden; }
.bar-fill { height: 100%; background: linear-gradient(90deg, #ffd93d, #ff9d00); border-radius: 2px; transition: width 0.6s cubic-bezier(0.25,1,0.5,1); }
.bar-pct { font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; color: rgba(150,210,180,0.35); width: 32px; text-align: right; flex-shrink: 0; }

.reviews-list { display: flex; flex-direction: column; gap: 14px; }
.review-card {
  background: rgba(0,212,255,0.03); border: 1px solid rgba(0,212,255,0.08);
  border-radius: 12px; padding: 18px 20px; position: relative;
  transition: border-color 0.25s;
}
.review-card:hover { border-color: rgba(0,212,255,0.28); }
.rc-corner { position: absolute; width: 10px; height: 10px; border-color: rgba(0,212,255,0.2); border-style: solid; top: 0; left: 0; border-width: 1px 0 0 1px; border-radius: 2px 0 0 0; transition: all 0.25s; }
.review-card:hover .rc-corner { border-color: rgba(0,212,255,0.5); width: 14px; height: 14px; }
.review-top { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.reviewer-avatar {
  width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Orbitron', sans-serif; font-size: 0.95rem; font-weight: 700; color: #fff;
  position: relative;
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.reviewer-name { font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: #c8f0e0; display: block; margin-bottom: 3px; }
.reviewer-meta { display: flex; align-items: center; gap: 8px; }
.r-stars { font-size: 0.78rem; }
.r-date { font-family: 'JetBrains Mono', monospace; font-size: 0.68rem; color: rgba(150,210,180,0.35); }
.review-text { font-size: 0.85rem; color: rgba(200,240,224,0.85); line-height: 1.75; margin-bottom: 12px; }
.helpful-btn {
  display: flex; align-items: center; gap: 7px;
  padding: 6px 12px; border-radius: 8px; border: 1px solid rgba(0,212,255,0.08);
  background: rgba(0,212,255,0.04); color: rgba(150,210,180,0.35);
  font-family: 'Noto Sans SC', sans-serif; font-size: 0.78rem; cursor: pointer;
  transition: all 0.2s;
}
.helpful-btn:hover, .helpful-btn.liked { background: rgba(0,212,255,0.1); border-color: rgba(0,212,255,0.22); color: #00d4ff; }

.sidebar-right { display: flex; flex-direction: column; gap: 14px; }
.sidebar-card {
  background: rgba(8,20,44,0.6); border: 1px solid rgba(0,212,255,0.08);
  border-radius: 12px; padding: 20px 22px; position: relative;
}
.sc-tag { font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; letter-spacing: 0.18em; color: #00d4ff; opacity: 0.65; margin-bottom: 6px; display: flex; align-items: center; gap: 8px; }
.sc-tag::before { content:''; display:block; width:14px; height:1px; background:#00d4ff; opacity:0.7; }
.sc-title { font-family: 'Orbitron', sans-serif; font-size: 0.9rem; font-weight: 600; letter-spacing: 0.06em; color: #c8f0e0; margin-bottom: 14px; }

.overview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; }
.ov-item {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 14px 10px; background: rgba(0,0,0,0.2); text-align: center;
  transition: background 0.2s;
}
.ov-item:hover { background: rgba(0,212,255,0.06); }
.ov-icon { font-size: 1rem; color: #00d4ff; opacity: 0.75; }
.ov-val { font-family: 'JetBrains Mono', monospace; font-size: 0.92rem; font-weight: 400; color: #c8f0e0; }
.ov-lbl { font-family: 'JetBrains Mono', monospace; font-size: 0.62rem; letter-spacing: 0.06em; color: rgba(150,210,180,0.35); }

.enroll-mobile { display: none; }

.related-list { display: flex; flex-direction: column; gap: 2px; }
.related-item {
  display: flex; gap: 12px; align-items: center;
  padding: 10px 8px; border-radius: 9px; cursor: pointer; transition: background 0.2s;
}
.related-item:hover { background: rgba(0,212,255,0.06); }
.ri-thumb {
  width: 40px; height: 40px; border-radius: 8px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem; border: 1px solid;
}
.ri-title { font-size: 0.82rem; font-weight: 600; color: #c8f0e0; margin-bottom: 2px; }
.ri-meta { font-family: 'JetBrains Mono', monospace; font-size: 0.68rem; color: rgba(150,210,180,0.35); }

.expand-enter-active, .expand-leave-active { transition: all 0.32s cubic-bezier(0.25,1,0.5,1); overflow: hidden; }
.expand-enter-from, .expand-leave-to { opacity: 0; transform: translateY(-8px); }

::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: rgba(0,0,0,0.3); }
::-webkit-scrollbar-thumb { background: rgba(0,212,255,0.2); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: rgba(0,212,255,0.4); }

@media (max-width: 1100px) {
  .hero-inner { grid-template-columns: 1fr; }
  .enroll-card { display: none; }
  .enroll-mobile { display: block !important; }
  .main-inner { grid-template-columns: 1fr; }
  .sidebar-right { order: -1; display: grid; grid-template-columns: 1fr 1fr; }
}
@media (max-width: 768px) {
  .course-hero, .course-main { padding-left: 20px; padding-right: 20px; }
  .sidebar-right { grid-template-columns: 1fr; }
  .rating-summary { flex-direction: column; gap: 20px; }
}
</style>
