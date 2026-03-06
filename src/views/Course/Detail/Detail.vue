<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const courseId = computed(() => Number(route.params.id))

const isEnrolled = ref(false)
const activeModule = ref<number | null>(1)
const activeTab = ref<'overview' | 'curriculum' | 'reviews'>('overview')
const likedReviews = ref<Set<number>>(new Set())

const course = ref({
  id: 1,
  title: '新手驾驶入门',
  subtitle: '从零基础到独立上路，系统化驾驶技能培训',
  description: '本课程专为完全零基础的驾驶学员设计，由拥有15年教学经验的张教练主讲。通过系统性的理论讲解与实操演示，帮助学员在最短时间内掌握安全驾驶的核心技能。',
  instructor: '张教练',
  instructorTitle: '国家一级驾驶教练 · 前职业赛车手',
  instructorBio: '拥有 15 年驾驶教学经验，持有国家一级赛车手证书，累计培训学员超过 5000 人。擅长因材施教，以直观易懂的方式诠释复杂驾驶技巧。',
  instructorInitial: '张',
  duration: '8 课时',
  level: '初级',
  levelColor: '#06d6a0',
  students: 1250,
  rating: 4.8,
  reviews: 328,
  accent: '#4f6ef7',
  price: 299,
  originalPrice: 599,
  objectives: [
    '掌握车辆基本操控：方向盘、油门、刹车的协调运用',
    '理解并熟记核心交通规则与常见道路标识',
    '独立完成起步、停车、转弯、变道等基础动作',
    '掌握停车场景：侧方停车、倒车入库、坡道停车',
    '建立安全驾驶意识，学会危险预判与规避',
    '完成城市道路、高速公路等多场景驾驶实践'
  ],
  requirements: ['年满 18 周岁，持有学习驾照', '身体健康，无色盲色弱', '具备基本的汽车认知（非必须）'],
  modules: [
    {
      id: 1, title: '第一章：驾驶基础认知', duration: '2 课时', videoCount: 3,
      videos: [
        { id: 1, title: '车辆仪表盘逐项解读', duration: '15:30', isFree: true },
        { id: 2, title: '座椅与后视镜的精确调整', duration: '12:45', isFree: true },
        { id: 3, title: '方向盘握法与转向规范', duration: '10:20', isFree: false },
      ]
    },
    {
      id: 2, title: '第二章：起步与停车', duration: '2 课时', videoCount: 3,
      videos: [
        { id: 4, title: '手动挡平地起步全流程', duration: '18:00', isFree: false },
        { id: 5, title: '自动挡起步与换挡时机', duration: '14:30', isFree: false },
        { id: 6, title: '坡道起步：半坡不溜车', duration: '16:45', isFree: false },
      ]
    },
    {
      id: 3, title: '第三章：转向与变道', duration: '2 课时', videoCount: 3,
      videos: [
        { id: 7, title: '转弯时机的精准判断', duration: '13:20', isFree: false },
        { id: 8, title: '变道完整操作流程', duration: '17:15', isFree: false },
        { id: 9, title: '盲区识别与安全检查', duration: '11:50', isFree: false },
      ]
    },
    {
      id: 4, title: '第四章：综合路况实践', duration: '2 课时', videoCount: 3,
      videos: [
        { id: 10, title: '城市道路综合驾驶', duration: '25:00', isFree: false },
        { id: 11, title: '高速公路驾驶要领', duration: '20:30', isFree: false },
        { id: 12, title: '夜间与雨天驾驶技巧', duration: '19:45', isFree: false },
      ]
    }
  ],
  reviewList: [
    { id: 1, name: '李明', initial: '李', rating: 5, date: '2024-03-01', comment: '张教练讲得非常详细，零基础也能轻松跟上！已经成功上路了，特别推荐。', helpful: 45 },
    { id: 2, name: '王芳', initial: '王', rating: 5, date: '2024-02-28', comment: '课程内容很系统，从理论到实操都有涵盖，尤其是倒车入库那节课反复看了好几遍，终于学会了！', helpful: 32 },
    { id: 3, name: '张伟', initial: '张', rating: 4, date: '2024-02-25', comment: '整体质量很好，教学节奏适中。如果能再增加一些雨天驾驶的内容就更完美了。', helpful: 28 },
  ]
})

const totalVideos = computed(() => course.value.modules.reduce((s, m) => s + m.videos.length, 0))

const toggleModule = (id: number) => {
  activeModule.value = activeModule.value === id ? null : id
}

const toggleLike = (id: number) => {
  if (likedReviews.value.has(id)) likedReviews.value.delete(id)
  else likedReviews.value.add(id)
}

const enroll = () => {
  isEnrolled.value = true
}

const goBack = () => router.back()

const ratingBars = [
  { stars: 5, pct: 78 },
  { stars: 4, pct: 15 },
  { stars: 3, pct: 5 },
  { stars: 2, pct: 1 },
  { stars: 1, pct: 1 },
]
</script>

<template>
  <div class="cd-root">
    <!-- Background -->
    <div class="cd-bg">
      <div class="bg-orb o1" /><div class="bg-orb o2" />
      <div class="bg-grid" />
    </div>

    <!-- ── Top Nav ── -->
    <nav class="top-nav">
      <button class="back-btn" @click="goBack">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        返回课程列表
      </button>
      <div class="nav-right" v-if="isEnrolled">
        <div class="enrolled-pill">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          已报名
        </div>
      </div>
    </nav>

    <!-- ── Hero Banner ── -->
    <section class="course-hero">
      <div class="hero-inner">
        <div class="hero-left">
          <div class="breadcrumb">驾驶课程 <span>/</span> {{ course.level }}课程</div>
          <div class="hero-badges">
            <span class="level-tag" :style="{ background: course.levelColor + '22', color: course.levelColor, borderColor: course.levelColor + '44' }">
              {{ course.level }}
            </span>
            <span class="students-tag">{{ course.students.toLocaleString() }} 名学员</span>
          </div>

          <h1 class="course-title">{{ course.title }}</h1>
          <p class="course-subtitle">{{ course.subtitle }}</p>

          <!-- Rating -->
          <div class="rating-row">
            <div class="stars-display">
              <span v-for="i in 5" :key="i" :style="{ color: i <= Math.floor(course.rating) ? '#f59e0b' : 'rgba(255,255,255,.2)' }">★</span>
            </div>
            <span class="rating-val">{{ course.rating }}</span>
            <span class="review-count">({{ course.reviews }} 条评价)</span>
          </div>

          <!-- Instructor -->
          <div class="hero-instructor">
            <div class="inst-avatar">{{ course.instructorInitial }}</div>
            <div>
              <span class="inst-name">{{ course.instructor }}</span>
              <span class="inst-title">{{ course.instructorTitle }}</span>
            </div>
          </div>

          <!-- Meta chips -->
          <div class="meta-chips">
            <div class="chip" v-for="c in [
              { icon: '🕐', text: course.duration },
              { icon: '📹', text: totalVideos + ' 节视频' },
              { icon: '📊', text: course.level + '难度' },
              { icon: '🏅', text: '结课证书' },
            ]" :key="c.text">
              <span>{{ c.icon }}</span><span>{{ c.text }}</span>
            </div>
          </div>
        </div>

        <!-- Right: Enrollment card (desktop) -->
        <div class="enroll-card">
          <div class="card-thumb-area">
            <div class="thumb-pattern" :style="{ background: `linear-gradient(135deg, ${course.accent}30, ${course.accent}10)` }">
              <div class="thumb-text">{{ course.title }}</div>
            </div>
          </div>
          <div class="card-pricing">
            <div class="price-row">
              <span class="price-current">¥{{ course.price }}</span>
              <span class="price-orig">¥{{ course.originalPrice }}</span>
              <span class="price-badge">5折</span>
            </div>
            <p class="price-note">限时优惠 · 随时可退款</p>
          </div>
          <button class="enroll-btn" :class="{ enrolled: isEnrolled }" @click="enroll">
            {{ isEnrolled ? '继续学习 →' : '立即报名' }}
          </button>
          <div class="card-features">
            <div class="cf-item" v-for="f in ['终身有效访问', '手机 · 平板 · PC 三端同步', '结课颁发官方证书', '30天无理由退款']" :key="f">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#06d6a0" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>{{ f }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Main Detail ── -->
    <div class="course-main">
      <div class="main-inner">

        <!-- Left column -->
        <div class="content-left">

          <!-- Tab Nav -->
          <div class="tab-nav">
            <button v-for="t in [
              { key: 'overview', label: '课程介绍' },
              { key: 'curriculum', label: '课程大纲' },
              { key: 'reviews', label: `评价 (${course.reviews})` },
            ]" :key="t.key"
                    class="tab-nav-btn" :class="{ active: activeTab === t.key }"
                    @click="activeTab = t.key as any"
            >{{ t.label }}</button>
          </div>

          <!-- ── Overview ── -->
          <div v-show="activeTab === 'overview'">
            <!-- Objectives -->
            <div class="content-block">
              <h2 class="block-title">你将学到什么</h2>
              <div class="objectives-grid">
                <div v-for="(obj, i) in course.objectives" :key="i" class="obj-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#06d6a0" stroke-width="2.5" flex-shrink="0">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span>{{ obj }}</span>
                </div>
              </div>
            </div>

            <!-- Description -->
            <div class="content-block">
              <h2 class="block-title">课程详情</h2>
              <p class="block-text">{{ course.description }}</p>
            </div>

            <!-- Requirements -->
            <div class="content-block">
              <h2 class="block-title">报名要求</h2>
              <ul class="req-list">
                <li v-for="(r, i) in course.requirements" :key="i" class="req-item">
                  <span class="req-dot" />
                  {{ r }}
                </li>
              </ul>
            </div>

            <!-- Instructor -->
            <div class="content-block">
              <h2 class="block-title">关于讲师</h2>
              <div class="instructor-card">
                <div class="inst-card-avatar">{{ course.instructorInitial }}</div>
                <div class="inst-card-info">
                  <h3 class="inst-card-name">{{ course.instructor }}</h3>
                  <p class="inst-card-title">{{ course.instructorTitle }}</p>
                  <div class="inst-stats">
                    <span>⭐ 4.9 讲师评分</span>
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
            <div class="content-block">
              <div class="curriculum-head">
                <h2 class="block-title" style="margin:0">课程大纲</h2>
                <span class="curriculum-meta">{{ course.modules.length }} 章 · {{ totalVideos }} 节视频</span>
              </div>
              <div class="modules-list">
                <div v-for="module in course.modules" :key="module.id" class="module-wrap" :class="{ open: activeModule === module.id }">
                  <button class="module-header" @click="toggleModule(module.id)">
                    <div class="mh-left">
                      <div class="module-num">{{ String(module.id).padStart(2,'0') }}</div>
                      <div class="mh-text">
                        <span class="module-title">{{ module.title }}</span>
                        <span class="module-meta">{{ module.videoCount }} 节 · {{ module.duration }}</span>
                      </div>
                    </div>
                    <svg class="chevron" :class="{ rotated: activeModule === module.id }" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>

                  <Transition name="expand">
                    <div v-if="activeModule === module.id" class="module-videos">
                      <div v-for="video in module.videos" :key="video.id" class="video-row" :class="{ locked: !isEnrolled && !video.isFree }">
                        <div class="vr-left">
                          <div class="vr-icon">
                            <svg v-if="isEnrolled || video.isFree" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                              <polygon points="5 3 19 12 5 21 5 3"/>
                            </svg>
                            <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                          </div>
                          <span class="vr-title">{{ video.title }}</span>
                          <span v-if="video.isFree" class="free-pill">免费试看</span>
                        </div>
                        <div class="vr-right">
                          <span class="vr-dur">{{ video.duration }}</span>
                          <button class="vr-btn" :disabled="!isEnrolled && !video.isFree" @click.stop>
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
            <div class="content-block">
              <h2 class="block-title">学员评价</h2>
              <!-- Rating Summary -->
              <div class="rating-summary">
                <div class="rating-big">
                  <span class="big-num">{{ course.rating }}</span>
                  <div class="big-stars">
                    <span v-for="i in 5" :key="i" :style="{ color: i <= Math.floor(course.rating) ? '#f59e0b' : 'rgba(255,255,255,.15)' }">★</span>
                  </div>
                  <span class="big-label">课程评分</span>
                </div>
                <div class="rating-bars">
                  <div v-for="bar in ratingBars" :key="bar.stars" class="bar-row">
                    <span class="bar-stars">{{ bar.stars }} ★</span>
                    <div class="bar-track">
                      <div class="bar-fill" :style="{ width: bar.pct + '%' }" />
                    </div>
                    <span class="bar-pct">{{ bar.pct }}%</span>
                  </div>
                </div>
              </div>

              <!-- Review cards -->
              <div class="reviews-list">
                <div v-for="review in course.reviewList" :key="review.id" class="review-card">
                  <div class="review-top">
                    <div class="reviewer-avatar">{{ review.initial }}</div>
                    <div class="reviewer-info">
                      <span class="reviewer-name">{{ review.name }}</span>
                      <div class="reviewer-meta">
                        <span class="r-stars">{{ '★'.repeat(review.rating) }}</span>
                        <span class="r-date">{{ review.date }}</span>
                      </div>
                    </div>
                  </div>
                  <p class="review-text">{{ review.comment }}</p>
                  <button class="helpful-btn" :class="{ liked: likedReviews.has(review.id) }" @click="toggleLike(review.id)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" :stroke="likedReviews.has(review.id) ? '#06d6a0' : 'currentColor'" stroke-width="2">
                      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
                      <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                    </svg>
                    {{ review.helpful + (likedReviews.has(review.id) ? 1 : 0) }} 人觉得有用
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Right Sidebar ── -->
        <div class="sidebar-right">
          <!-- Course stats -->
          <div class="sidebar-card">
            <h3 class="sc-title">课程概览</h3>
            <div class="overview-grid">
              <div class="ov-item" v-for="s in [
                { val: course.modules.length, lbl: '章节数', icon: '◈' },
                { val: totalVideos, lbl: '视频节数', icon: '▷' },
                { val: course.duration, lbl: '总时长', icon: '◎' },
                { val: course.level, lbl: '难度等级', icon: '◉' },
              ]" :key="s.lbl">
                <span class="ov-icon">{{ s.icon }}</span>
                <span class="ov-val">{{ s.val }}</span>
                <span class="ov-lbl">{{ s.lbl }}</span>
              </div>
            </div>
          </div>

          <!-- Mobile enroll card -->
          <div class="sidebar-card enroll-mobile">
            <div class="price-row">
              <span class="price-current">¥{{ course.price }}</span>
              <span class="price-orig">¥{{ course.originalPrice }}</span>
              <span class="price-badge">5折</span>
            </div>
            <button class="enroll-btn" :class="{ enrolled: isEnrolled }" @click="enroll">
              {{ isEnrolled ? '继续学习 →' : '立即报名' }}
            </button>
          </div>

          <!-- Related -->
          <div class="sidebar-card">
            <h3 class="sc-title">同类推荐</h3>
            <div class="related-list">
              <div class="related-item" v-for="item in [
                { title: '交通规则详解', instructor: '李教官', rating: 4.7 },
                { title: '停车技巧大全', instructor: '王教练', rating: 4.9 },
              ]" :key="item.title" @click="router.push('/course/2')">
                <div class="ri-thumb">◎</div>
                <div class="ri-info">
                  <p class="ri-title">{{ item.title }}</p>
                  <p class="ri-meta">{{ item.instructor }} · ★ {{ item.rating }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');

/* ─── Variables ─── */
:root {
  --c-bg: #060a12;
  --c-surface: rgba(255,255,255,.04);
  --c-border: rgba(255,255,255,.07);
  --c-text: #e8edf5;
  --c-muted: rgba(255,255,255,.4);
}

.cd-root {
  min-height: 100vh;
  font-family: 'Sora', sans-serif;
  background: var(--c-bg);
  color: var(--c-text);
  overflow-x: hidden;
}

/* ─── Background ─── */
.cd-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
.bg-orb { position: absolute; border-radius: 50%; filter: blur(150px); }
.o1 { width: 700px; height: 700px; background: radial-gradient(circle, rgba(79,110,247,.15), transparent); top: -200px; right: 0; animation: drift 20s ease-in-out infinite alternate; }
.o2 { width: 500px; height: 500px; background: radial-gradient(circle, rgba(168,85,247,.1), transparent); bottom: 0; left: 0; animation: drift 25s ease-in-out infinite alternate reverse; }
@keyframes drift { to { transform: translate(50px, 60px); } }
.bg-grid {
  position: absolute; inset: 0;
  background-image: linear-gradient(rgba(255,255,255,.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.018) 1px, transparent 1px);
  background-size: 60px 60px;
}

/* ─── Top Nav ─── */
.top-nav {
  position: relative; z-index: 10;
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 48px;
  border-bottom: 1px solid var(--c-border);
  background: rgba(6,10,18,.8); backdrop-filter: blur(20px);
}
.back-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 9px 16px; border-radius: 9px; border: none; cursor: pointer;
  background: var(--c-surface); border: 1px solid var(--c-border);
  color: var(--c-muted); font-family: 'Sora', sans-serif; font-size: .85rem;
  transition: all .2s;
}
.back-btn:hover { color: var(--c-text); background: rgba(255,255,255,.08); }
.enrolled-pill {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 14px; border-radius: 20px;
  background: rgba(6,214,160,.12); border: 1px solid rgba(6,214,160,.3);
  color: #06d6a0; font-size: .8rem; font-weight: 600;
}

/* ─── Hero ─── */
.course-hero {
  position: relative; z-index: 1;
  background: linear-gradient(180deg, rgba(79,110,247,.06) 0%, transparent 100%);
  border-bottom: 1px solid var(--c-border);
  padding: 60px 48px;
}
.hero-inner {
  max-width: 1200px; margin: 0 auto;
  display: grid; grid-template-columns: 1fr 380px; gap: 60px; align-items: start;
}
.hero-left { display: flex; flex-direction: column; gap: 18px; }

.breadcrumb { font-size: .78rem; color: var(--c-muted); }
.breadcrumb span { margin: 0 6px; opacity: .4; }

.hero-badges { display: flex; gap: 8px; align-items: center; }
.level-tag {
  padding: 4px 12px; border-radius: 6px; font-size: .72rem; font-weight: 700;
  border: 1px solid; font-family: 'JetBrains Mono', monospace; letter-spacing: .04em;
}
.students-tag {
  font-size: .78rem; color: var(--c-muted); padding: 4px 10px;
  background: var(--c-surface); border: 1px solid var(--c-border); border-radius: 6px;
}

.course-title { font-size: clamp(1.8rem, 3vw, 2.8rem); font-weight: 800; line-height: 1.1; margin: 0; letter-spacing: -.02em; }
.course-subtitle { font-size: 1rem; color: var(--c-muted); margin: 0; line-height: 1.6; }

.rating-row { display: flex; align-items: center; gap: 10px; }
.stars-display { display: flex; gap: 2px; font-size: 1rem; }
.rating-val { font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: .95rem; color: #f59e0b; }
.review-count { font-size: .82rem; color: var(--c-muted); }

.hero-instructor { display: flex; align-items: center; gap: 12px; }
.inst-avatar {
  width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, #4f6ef7, #a855f7);
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 1rem;
}
.inst-name { display: block; font-size: .9rem; font-weight: 600; margin-bottom: 2px; }
.inst-title { display: block; font-size: .75rem; color: var(--c-muted); }

.meta-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.chip {
  display: flex; align-items: center; gap: 7px;
  padding: 7px 13px; border-radius: 8px; font-size: .78rem;
  background: var(--c-surface); border: 1px solid var(--c-border); color: var(--c-muted);
}

/* Enroll card */
.enroll-card {
  background: rgba(15,22,36,.95);
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 20px; overflow: hidden;
  backdrop-filter: blur(20px);
  box-shadow: 0 24px 60px rgba(0,0,0,.5);
  position: sticky; top: 20px;
}
.card-thumb-area {
  height: 180px; overflow: hidden;
}
.thumb-pattern {
  height: 100%; display: flex; align-items: center; justify-content: center;
}
.thumb-text {
  font-size: 1rem; font-weight: 700; text-align: center;
  color: rgba(255,255,255,.2); padding: 20px;
}

.card-pricing { padding: 20px 24px 0; }
.price-row { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
.price-current { font-size: 1.8rem; font-weight: 800; color: #fff; font-family: 'JetBrains Mono', monospace; }
.price-orig { font-size: 1rem; color: rgba(255,255,255,.3); text-decoration: line-through; font-family: 'JetBrains Mono', monospace; }
.price-badge {
  padding: 3px 8px; border-radius: 6px; font-size: .72rem; font-weight: 700;
  background: rgba(239,68,68,.2); color: #fca5a5; border: 1px solid rgba(239,68,68,.3);
}
.price-note { font-size: .75rem; color: var(--c-muted); margin: 0 0 20px; }

.enroll-btn {
  display: block; width: calc(100% - 48px); margin: 0 24px;
  padding: 15px; border-radius: 12px; border: none; cursor: pointer;
  background: linear-gradient(135deg, #4f6ef7, #7b5ea7); color: #fff;
  font-family: 'Sora', sans-serif; font-size: 1rem; font-weight: 700;
  transition: all .3s; letter-spacing: .01em;
}
.enroll-btn:hover:not(.enrolled) { filter: brightness(1.1); transform: translateY(-2px); box-shadow: 0 10px 30px rgba(79,110,247,.4); }
.enroll-btn.enrolled { background: linear-gradient(135deg, #06d6a0, #059669); }

.card-features { padding: 16px 24px 24px; display: flex; flex-direction: column; gap: 10px; }
.cf-item { display: flex; align-items: center; gap: 10px; font-size: .8rem; color: var(--c-muted); }

/* ─── Main Detail ─── */
.course-main { position: relative; z-index: 1; padding: 48px 48px 80px; }
.main-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 320px; gap: 40px; }

/* Tab Nav */
.tab-nav {
  display: flex; border-bottom: 1px solid var(--c-border);
  margin-bottom: 32px; gap: 0;
}
.tab-nav-btn {
  padding: 14px 24px; border: none; background: transparent; cursor: pointer;
  color: var(--c-muted); font-family: 'Sora', sans-serif; font-size: .9rem; font-weight: 500;
  border-bottom: 2px solid transparent; margin-bottom: -1px;
  transition: all .2s;
}
.tab-nav-btn:hover { color: var(--c-text); }
.tab-nav-btn.active { color: var(--c-text); border-bottom-color: #4f6ef7; }

/* Detail blocks */
.content-block {
  background: var(--c-surface); border: 1px solid var(--c-border);
  border-radius: 16px; padding: 28px; margin-bottom: 20px;
}
.block-title { font-size: 1.15rem; font-weight: 700; margin: 0 0 20px; }
.block-text { font-size: .9rem; color: var(--c-muted); line-height: 1.75; margin: 0; }

.objectives-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.obj-item {
  display: flex; align-items: flex-start; gap: 10px;
  font-size: .85rem; line-height: 1.5; color: rgba(255,255,255,.75);
}

.req-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
.req-item { display: flex; align-items: center; gap: 12px; font-size: .88rem; color: var(--c-muted); }
.req-dot { width: 6px; height: 6px; border-radius: 50%; background: #4f6ef7; flex-shrink: 0; }

.instructor-card { display: flex; gap: 20px; align-items: flex-start; }
.inst-card-avatar {
  width: 64px; height: 64px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, #4f6ef7, #a855f7);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.6rem; font-weight: 700;
}
.inst-card-name { font-size: 1.05rem; font-weight: 700; margin: 0 0 3px; }
.inst-card-title { font-size: .8rem; color: var(--c-muted); margin: 0 0 10px; }
.inst-stats { display: flex; gap: 10px; font-size: .78rem; color: #7c9ff5; margin-bottom: 10px; }
.inst-bio { font-size: .85rem; color: var(--c-muted); line-height: 1.7; margin: 0; }

/* Curriculum */
.curriculum-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.curriculum-meta { font-size: .8rem; color: var(--c-muted); font-family: 'JetBrains Mono', monospace; }

.modules-list { display: flex; flex-direction: column; gap: 8px; }
.module-wrap {
  border: 1px solid var(--c-border); border-radius: 12px; overflow: hidden;
  transition: border-color .2s;
}
.module-wrap.open { border-color: rgba(79,110,247,.3); }

.module-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px; width: 100%; border: none; background: transparent;
  cursor: pointer; color: var(--c-text); transition: background .2s;
}
.module-header:hover { background: rgba(255,255,255,.03); }
.mh-left { display: flex; align-items: center; gap: 14px; }
.module-num {
  font-family: 'JetBrains Mono', monospace; font-size: .75rem; font-weight: 600;
  color: var(--c-muted); background: var(--c-surface); border: 1px solid var(--c-border);
  padding: 4px 8px; border-radius: 6px; flex-shrink: 0;
}
.mh-text { display: flex; flex-direction: column; gap: 2px; text-align: left; }
.module-title { font-size: .9rem; font-weight: 600; }
.module-meta { font-size: .75rem; color: var(--c-muted); }
.chevron { color: var(--c-muted); transition: transform .3s; }
.chevron.rotated { transform: rotate(180deg); }

.module-videos { padding: 0 16px 16px; display: flex; flex-direction: column; gap: 4px; }
.video-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 14px; border-radius: 9px; transition: background .2s;
}
.video-row:hover { background: rgba(255,255,255,.04); }
.video-row.locked { opacity: .55; }
.vr-left { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
.vr-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.vr-icon {
  width: 28px; height: 28px; border-radius: 7px;
  background: rgba(79,110,247,.15); border: 1px solid rgba(79,110,247,.2);
  display: flex; align-items: center; justify-content: center;
  color: #7c9ff5; flex-shrink: 0;
}
.vr-title { font-size: .85rem; color: rgba(255,255,255,.75); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.free-pill {
  padding: 2px 7px; border-radius: 5px; font-size: .68rem; font-weight: 600;
  background: rgba(6,214,160,.15); color: #06d6a0; border: 1px solid rgba(6,214,160,.25);
  white-space: nowrap;
}
.vr-dur { font-family: 'JetBrains Mono', monospace; font-size: .75rem; color: var(--c-muted); }
.vr-btn {
  padding: 5px 12px; border-radius: 7px; border: 1px solid var(--c-border);
  background: var(--c-surface); color: var(--c-text);
  font-family: 'Sora', sans-serif; font-size: .75rem; cursor: pointer;
  transition: all .2s;
}
.vr-btn:not(:disabled):hover { background: rgba(79,110,247,.2); border-color: rgba(79,110,247,.4); }
.vr-btn:disabled { opacity: .4; cursor: not-allowed; }

/* Reviews */
.rating-summary {
  display: flex; gap: 32px; align-items: center;
  padding: 24px; background: rgba(0,0,0,.2); border-radius: 12px;
  margin-bottom: 24px;
}
.rating-big { display: flex; flex-direction: column; align-items: center; gap: 6px; flex-shrink: 0; }
.big-num { font-size: 3.5rem; font-weight: 800; font-family: 'JetBrains Mono', monospace; color: #f59e0b; line-height: 1; }
.big-stars { display: flex; gap: 3px; font-size: 1.1rem; }
.big-label { font-size: .75rem; color: var(--c-muted); }
.rating-bars { flex: 1; display: flex; flex-direction: column; gap: 7px; }
.bar-row { display: flex; align-items: center; gap: 10px; }
.bar-stars { font-size: .75rem; color: var(--c-muted); width: 32px; flex-shrink: 0; }
.bar-track { flex: 1; height: 6px; background: rgba(255,255,255,.08); border-radius: 3px; overflow: hidden; }
.bar-fill { height: 100%; background: #f59e0b; border-radius: 3px; transition: width .6s ease; }
.bar-pct { font-size: .72rem; color: var(--c-muted); font-family: 'JetBrains Mono', monospace; width: 30px; text-align: right; flex-shrink: 0; }

.reviews-list { display: flex; flex-direction: column; gap: 16px; }
.review-card {
  padding: 20px; border-radius: 12px;
  background: rgba(255,255,255,.03); border: 1px solid var(--c-border);
}
.review-top { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.reviewer-avatar {
  width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, #4f6ef7, #a855f7);
  display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: .9rem;
}
.reviewer-name { font-size: .9rem; font-weight: 600; display: block; margin-bottom: 3px; }
.reviewer-meta { display: flex; align-items: center; gap: 8px; }
.r-stars { color: #f59e0b; font-size: .78rem; }
.r-date { font-size: .75rem; color: var(--c-muted); font-family: 'JetBrains Mono', monospace; }
.review-text { font-size: .87rem; color: rgba(255,255,255,.65); line-height: 1.7; margin: 0 0 14px; }
.helpful-btn {
  display: flex; align-items: center; gap: 7px;
  padding: 6px 12px; border-radius: 8px; border: 1px solid var(--c-border);
  background: var(--c-surface); color: var(--c-muted);
  font-family: 'Sora', sans-serif; font-size: .78rem; cursor: pointer;
  transition: all .2s;
}
.helpful-btn:hover, .helpful-btn.liked { background: rgba(6,214,160,.1); border-color: rgba(6,214,160,.3); color: #06d6a0; }

/* ─── Sidebar ─── */
.sidebar-right { display: flex; flex-direction: column; gap: 16px; }
.sidebar-card {
  background: var(--c-surface); border: 1px solid var(--c-border);
  border-radius: 16px; padding: 22px;
}
.sc-title { font-size: .95rem; font-weight: 700; margin: 0 0 16px; }

.overview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.ov-item {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 14px; border-radius: 10px; background: rgba(0,0,0,.2); text-align: center;
}
.ov-icon { font-size: 1.1rem; color: var(--c-muted); }
.ov-val { font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: .9rem; color: #fff; }
.ov-lbl { font-size: .7rem; color: var(--c-muted); }

.enroll-mobile { display: none; }

.related-list { display: flex; flex-direction: column; gap: 12px; }
.related-item {
  display: flex; gap: 12px; align-items: center; cursor: pointer;
  padding: 10px; border-radius: 9px; transition: background .2s;
}
.related-item:hover { background: rgba(255,255,255,.06); }
.ri-thumb {
  width: 44px; height: 44px; border-radius: 8px; flex-shrink: 0;
  background: rgba(79,110,247,.12); border: 1px solid rgba(79,110,247,.2);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem; color: #7c9ff5;
}
.ri-title { font-size: .85rem; font-weight: 600; margin: 0 0 3px; }
.ri-meta { font-size: .73rem; color: var(--c-muted); margin: 0; }

/* ─── Transitions ─── */
.expand-enter-active, .expand-leave-active { transition: all .3s ease; }
.expand-enter-from, .expand-leave-to { opacity: 0; transform: translateY(-8px); }

/* ─── Responsive ─── */
@media (max-width: 1024px) {
  .hero-inner { grid-template-columns: 1fr; }
  .enroll-card { display: none; }
  .enroll-mobile { display: block !important; }
  .main-inner { grid-template-columns: 1fr; }
  .sidebar-right { order: -1; display: grid; grid-template-columns: 1fr 1fr; }
  .objectives-grid { grid-template-columns: 1fr; }
}
@media (max-width: 768px) {
  .course-hero, .course-main { padding: 32px 20px; }
  .top-nav { padding: 16px 20px; }
  .sidebar-right { grid-template-columns: 1fr; }
  .rating-summary { flex-direction: column; gap: 20px; }
}
</style>