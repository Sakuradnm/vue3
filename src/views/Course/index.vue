<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const selectedCategory = ref(0)
const searchQuery = ref('')
const hoveredCard = ref<number | null>(null)

interface Course {
  id: number
  title: string
  description: string
  instructor: string
  duration: string
  level: string
  levelColor: string
  students: number
  rating: number
  lessons: number
  accent: string
  tag: string
  new?: boolean
  hot?: boolean
}

interface Category {
  id: number
  name: string
  glyph: string
  desc: string
  courses: Course[]
}

const categories = ref<Category[]>([
  {
    id: 1, name: '驾驶基础', glyph: '◎', desc: '从零开始，稳扎稳打',
    courses: [
      { id: 1, title: '新手驾驶入门', description: '从零开始学习驾驶基础知识，系统掌握车辆操控与道路常识', instructor: '张教练', duration: '8 课时', level: '初级', levelColor: '#06d6a0', students: 1250, rating: 4.8, lessons: 12, accent: '#4f6ef7', tag: '最受欢迎', hot: true },
      { id: 2, title: '交通规则详解', description: '全面掌握交通法规和道路标识，理论与实践相结合', instructor: '李教官', duration: '6 课时', level: '初级', levelColor: '#06d6a0', students: 980, rating: 4.7, lessons: 9, accent: '#0ea5e9', tag: '必修课' },
      { id: 3, title: '停车技巧大全', description: '侧方停车、倒车入库、坡道停车等实用场景全覆盖', instructor: '王教练', duration: '4 课时', level: '初级', levelColor: '#06d6a0', students: 1500, rating: 4.9, lessons: 8, accent: '#f59e0b', tag: '高好评', new: true },
    ]
  },
  {
    id: 2, name: '进阶驾驶', glyph: '◈', desc: '突破极限，精进技艺',
    courses: [
      { id: 4, title: '赛道驾驶技巧', description: '专业赛道驾驶技术与线路选择，让你的驾驶达到新高度', instructor: '刘车手', duration: '12 课时', level: '中级', levelColor: '#f59e0b', students: 650, rating: 4.9, lessons: 18, accent: '#ef4444', tag: '热门', hot: true },
      { id: 5, title: '高性能车操控', description: '掌握大马力车辆的操控技巧，感受极致驾驶乐趣', instructor: '陈技师', duration: '10 课时', level: '中级', levelColor: '#f59e0b', students: 520, rating: 4.8, lessons: 14, accent: '#a855f7', tag: '进阶推荐' },
      { id: 6, title: '雨天驾驶安全', description: '湿滑路面的驾驶技巧与安全要点，全天候驾驶无忧', instructor: '赵教练', duration: '5 课时', level: '中级', levelColor: '#f59e0b', students: 890, rating: 4.6, lessons: 10, accent: '#0ea5e9', tag: '安全必学' },
    ]
  },
  {
    id: 3, name: '车辆保养', glyph: '⬡', desc: '爱护座驾，延长车命',
    courses: [
      { id: 7, title: '日常保养知识', description: '学会基本的车辆检查和保养方法，做自己的汽车医生', instructor: '孙技师', duration: '6 课时', level: '初级', levelColor: '#06d6a0', students: 1100, rating: 4.7, lessons: 11, accent: '#06d6a0', tag: '实用必备' },
      { id: 8, title: '故障诊断基础', description: '识别常见故障并进行初步判断，避免被坑修车', instructor: '周师傅', duration: '8 课时', level: '中级', levelColor: '#f59e0b', students: 750, rating: 4.8, lessons: 13, accent: '#f59e0b', tag: '省钱神课', new: true },
    ]
  },
  {
    id: 4, name: '特种驾驶', glyph: '◉', desc: '挑战极限，征服一切',
    courses: [
      { id: 9, title: '越野驾驶技术', description: '复杂地形的通过技巧和脱困方法，征服每一寸山野', instructor: '吴队长', duration: '15 课时', level: '高级', levelColor: '#ef4444', students: 420, rating: 4.9, lessons: 22, accent: '#84cc16', tag: '极限挑战', hot: true },
      { id: 10, title: '防御性驾驶', description: '预见危险并提前规避，打造一道无形的安全屏障', instructor: '郑教官', duration: '10 课时', level: '高级', levelColor: '#ef4444', students: 680, rating: 4.9, lessons: 16, accent: '#f97316', tag: '安全进阶' },
    ]
  }
])

const filteredCourses = computed(() => {
  const cat = categories.value[selectedCategory.value]
  if (!searchQuery.value.trim()) return cat.courses
  const q = searchQuery.value.toLowerCase()
  return cat.courses.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.instructor.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
  )
})

const allStats = computed(() => ({
  totalCourses: categories.value.reduce((s, c) => s + c.courses.length, 0),
  totalStudents: categories.value.reduce((s, c) => s + c.courses.reduce((ss, cc) => ss + cc.students, 0), 0),
  avgRating: (categories.value.reduce((s, c) => s + c.courses.reduce((ss, cc) => ss + cc.rating, 0), 0) /
      categories.value.reduce((s, c) => s + c.courses.length, 0)).toFixed(1)
}))

const features = [
  { icon: '🎯', title: '精准课程匹配', desc: 'AI 智能推荐，按需学习' },
  { icon: '🏅', title: '官方认证证书', desc: '完成后颁发权威证书' },
  { icon: '🔄', title: '终身有效学习', desc: '购买后永久回看复习' },
  { icon: '💬', title: '1v1 答疑服务', desc: '教练在线解答疑问' },
]

const goToCourse = (id: number) => router.push(`/course/${id}`)
</script>

<template>
  <div class="cp-root">
    <!-- ░░ Background ░░ -->
    <div class="cp-bg">
      <div class="bg-orb o1" /><div class="bg-orb o2" /><div class="bg-orb o3" />
      <div class="bg-grid" />
      <div class="bg-noise" />
    </div>

    <!-- ═══════════ HERO ═══════════ -->
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-label">
          <span class="pulse-dot" />驾驶技能学习平台
        </div>
        <h1 class="hero-title">
          掌握驾驶的<br />
          <span class="title-gradient">每一个维度</span>
        </h1>
        <p class="hero-desc">
          从新手上路到赛道极限，{{ allStats.totalCourses }} 门精品课程，
          {{ (allStats.totalStudents / 1000).toFixed(0) }}K+ 学员共同进步
        </p>

        <!-- Search -->
        <div class="hero-search">
          <svg class="s-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input v-model="searchQuery" class="search-inp" placeholder="搜索课程、教练名…" />
          <button class="search-btn">搜索</button>
        </div>

        <!-- Platform stats -->
        <div class="hero-stats">
          <div class="hstat" v-for="s in [
            { val: allStats.totalCourses + '门', lbl: '精品课程' },
            { val: (allStats.totalStudents/1000).toFixed(0)+'K+', lbl: '注册学员' },
            { val: allStats.avgRating, lbl: '平均评分' },
            { val: '100%', lbl: '证书认可率' },
          ]" :key="s.lbl">
            <span class="hstat-val">{{ s.val }}</span>
            <span class="hstat-lbl">{{ s.lbl }}</span>
          </div>
        </div>
      </div>

      <!-- decorative floating cards -->
      <div class="hero-deco">
        <div class="deco-card dc1">
          <span class="dc-icon">🏎️</span>
          <span class="dc-text">赛道专业课</span>
        </div>
        <div class="deco-card dc2">
          <div class="dc-progress">
            <div class="dc-bar" style="width:72%"/>
          </div>
          <span class="dc-text">学习进度 72%</span>
        </div>
        <div class="deco-card dc3">
          <span class="dc-star">★★★★★</span>
          <span class="dc-text">满分好评</span>
        </div>
      </div>
    </section>

    <!-- ═══════════ CATEGORY NAV ═══════════ -->
    <section class="cat-section">
      <div class="cat-inner">
        <div class="cat-tabs">
          <button
              v-for="(cat, idx) in categories"
              :key="cat.id"
              class="cat-btn"
              :class="{ active: selectedCategory === idx }"
              @click="selectedCategory = idx"
          >
            <span class="cat-glyph">{{ cat.glyph }}</span>
            <div class="cat-text">
              <span class="cat-name">{{ cat.name }}</span>
              <span class="cat-desc">{{ cat.desc }}</span>
            </div>
            <span class="cat-count">{{ cat.courses.length }}</span>
          </button>
        </div>
      </div>
    </section>

    <!-- ═══════════ COURSE GRID ═══════════ -->
    <section class="courses-section">
      <div class="courses-inner">
        <div class="section-head">
          <h2 class="section-title">
            {{ categories[selectedCategory].name }}
            <span class="section-sub">· {{ filteredCourses.length }} 门课程</span>
          </h2>
          <div class="sort-wrap">
            <select class="sort-sel">
              <option>综合排序</option>
              <option>评分最高</option>
              <option>最多学员</option>
              <option>最新上线</option>
            </select>
          </div>
        </div>

        <div class="courses-grid">
          <TransitionGroup name="fade">
            <div
                v-for="course in filteredCourses"
                :key="course.id"
                class="course-card"
                @click="goToCourse(course.id)"
                @mouseenter="hoveredCard = course.id"
                @mouseleave="hoveredCard = null"
            >
              <!-- Thumbnail zone -->
              <div class="card-thumb" :style="{ background: `linear-gradient(135deg, ${course.accent}28, ${course.accent}0a)` }">
                <div class="thumb-glyph" :style="{ color: course.accent + '55' }">
                  {{ categories[selectedCategory].glyph }}
                </div>
                <div class="thumb-overlay">
                  <button class="preview-btn">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                    预览课程
                  </button>
                </div>
                <!-- Badges -->
                <div class="badge-group">
                  <span class="level-badge" :style="{ background: course.levelColor + '22', color: course.levelColor, borderColor: course.levelColor + '44' }">
                    {{ course.level }}
                  </span>
                  <span v-if="course.hot" class="hot-badge">🔥 热门</span>
                  <span v-if="course.new" class="new-badge">✦ 新上</span>
                </div>
                <!-- Accent line -->
                <div class="accent-line" :style="{ background: course.accent }" />
              </div>

              <!-- Card body -->
              <div class="card-body">
                <div class="card-tag">{{ course.tag }}</div>
                <h3 class="card-title">{{ course.title }}</h3>
                <p class="card-desc">{{ course.description }}</p>

                <div class="card-meta">
                  <div class="meta-pill">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                    {{ course.instructor }}
                  </div>
                  <div class="meta-pill">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    {{ course.duration }}
                  </div>
                  <div class="meta-pill">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z"/>
                      <path d="M20.5 10H19V8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                      <path d="M9.5 14c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5S8 21.33 8 20.5v-5c0-.83.67-1.5 1.5-1.5z"/>
                      <path d="M3.5 14H5v1.5c0 .83-.67 1.5-1.5 1.5S2 16.33 2 15.5 2.67 14 3.5 14z"/>
                      <path d="M14 14.5c0-.83.67-1.5 1.5-1.5h5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5H15.5c-.83 0-1.5-.67-1.5-1.5z"/>
                      <path d="M15.5 19H14v1.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/>
                      <path d="M10 9.5C10 8.67 9.33 8 8.5 8H3.5C2.67 8 2 8.67 2 9.5S2.67 11 3.5 11H8.5c.83 0 1.5-.67 1.5-1.5z"/>
                      <path d="M8.5 5H10V3.5C10 2.67 9.33 2 8.5 2S7 2.67 7 3.5 7.67 5 8.5 5z"/>
                    </svg>
                    {{ course.lessons }} 节
                  </div>
                </div>

                <div class="card-footer">
                  <div class="footer-left">
                    <div class="rating-row">
                      <span class="stars" :style="{ color: '#f59e0b' }">★★★★★</span>
                      <span class="rating-num">{{ course.rating }}</span>
                    </div>
                    <span class="students-count">{{ course.students.toLocaleString() }} 人</span>
                  </div>
                  <button class="card-cta" :style="{ background: course.accent, boxShadow: `0 4px 16px ${course.accent}44` }">
                    立即学习
                  </button>
                </div>
              </div>
            </div>
          </TransitionGroup>

          <!-- Empty state -->
          <div v-if="filteredCourses.length === 0" class="empty-state">
            <div class="empty-glyph">◌</div>
            <p>未找到匹配课程</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════ FEATURES ═══════════ -->
    <section class="features-section">
      <div class="feat-inner">
        <div class="feat-label">平台优势</div>
        <h2 class="feat-title">为什么选择我们</h2>
        <div class="feat-grid">
          <div class="feat-card" v-for="(f, i) in features" :key="i" :style="{ animationDelay: i * 0.1 + 's' }">
            <div class="feat-icon">{{ f.icon }}</div>
            <h3 class="feat-name">{{ f.title }}</h3>
            <p class="feat-desc">{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════ CTA BANNER ═══════════ -->
    <section class="cta-banner">
      <div class="cta-inner">
        <h2 class="cta-title">准备好开始你的驾驶旅程了吗？</h2>
        <p class="cta-sub">加入 {{ (allStats.totalStudents / 1000).toFixed(0) }}K+ 学员，今天开始第一节课</p>
        <div class="cta-btns">
          <button class="cta-primary">免费试学</button>
          <button class="cta-ghost">查看全部课程</button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');

/* ─── Variables & Root ─── */
:root {
  --c-bg: #060a12;
  --c-surface: rgba(255,255,255,.04);
  --c-border: rgba(255,255,255,.07);
  --c-text: #e8edf5;
  --c-muted: rgba(255,255,255,.4);
  --c-accent: #4f6ef7;
}

.cp-root {
  min-height: 100vh;
  font-family: 'Sora', sans-serif;
  background: var(--c-bg);
  color: var(--c-text);
  overflow-x: hidden;
}

/* ─── Background ─── */
.cp-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
.bg-orb { position: absolute; border-radius: 50%; filter: blur(160px); }
.o1 { width: 800px; height: 800px; background: radial-gradient(circle, rgba(79,110,247,.18), transparent); top: -300px; left: -200px; animation: drift1 22s ease-in-out infinite alternate; }
.o2 { width: 600px; height: 600px; background: radial-gradient(circle, rgba(168,85,247,.12), transparent); bottom: 0; right: -100px; animation: drift2 18s ease-in-out infinite alternate; }
.o3 { width: 400px; height: 400px; background: radial-gradient(circle, rgba(6,214,160,.1), transparent); top: 50%; left: 40%; animation: drift3 25s ease-in-out infinite alternate; }
@keyframes drift1 { to { transform: translate(80px, 100px); } }
@keyframes drift2 { to { transform: translate(-60px, -80px); } }
@keyframes drift3 { to { transform: translate(40px, -60px) scale(1.3); } }
.bg-grid {
  position: absolute; inset: 0;
  background-image: linear-gradient(rgba(255,255,255,.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.018) 1px, transparent 1px);
  background-size: 60px 60px;
}
.bg-noise {
  position: absolute; inset: 0; opacity: .025;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

/* ─── Hero ─── */
.hero {
  position: relative; z-index: 1;
  min-height: 92vh;
  display: flex; align-items: center;
  padding: 120px 80px 80px;
  overflow: hidden;
}
.hero-inner { max-width: 620px; flex-shrink: 0; }

.hero-label {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 7px 16px; border-radius: 20px;
  background: rgba(79,110,247,.12); border: 1px solid rgba(79,110,247,.25);
  color: #7c9ff5; font-size: .8rem; font-weight: 600; letter-spacing: .05em;
  text-transform: uppercase; margin-bottom: 28px;
}
.pulse-dot {
  width: 7px; height: 7px; border-radius: 50%; background: #4f6ef7;
  animation: pulse 1.6s ease-in-out infinite;
}
@keyframes pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: .5; transform: scale(1.4); } }

.hero-title {
  font-size: clamp(2.6rem, 5vw, 4.5rem);
  font-weight: 800; line-height: 1.08;
  margin: 0 0 20px; letter-spacing: -.02em;
}
.title-gradient {
  background: linear-gradient(135deg, #4f6ef7 0%, #a855f7 50%, #06d6a0 100%);
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent;
}
.hero-desc {
  font-size: 1.1rem; color: var(--c-muted); line-height: 1.7;
  margin: 0 0 40px;
}

.hero-search {
  display: flex; align-items: center;
  background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.12);
  border-radius: 14px; padding: 6px 6px 6px 18px;
  margin-bottom: 48px; max-width: 520px;
  transition: all .25s;
}
.hero-search:focus-within { border-color: rgba(79,110,247,.5); background: rgba(255,255,255,.1); box-shadow: 0 0 0 4px rgba(79,110,247,.12); }
.s-icon { color: var(--c-muted); flex-shrink: 0; }
.search-inp {
  flex: 1; border: none; background: transparent; padding: 10px 14px;
  color: var(--c-text); font-family: 'Sora', sans-serif; font-size: .95rem;
}
.search-inp:focus { outline: none; }
.search-inp::placeholder { color: rgba(255,255,255,.25); }
.search-btn {
  padding: 11px 24px; border-radius: 10px; border: none; cursor: pointer;
  background: linear-gradient(135deg, #4f6ef7, #7b5ea7); color: #fff;
  font-family: 'Sora', sans-serif; font-size: .88rem; font-weight: 600;
  transition: all .2s;
}
.search-btn:hover { filter: brightness(1.1); transform: translateY(-1px); }

.hero-stats { display: flex; gap: 32px; flex-wrap: wrap; }
.hstat { display: flex; flex-direction: column; gap: 3px; }
.hstat-val { font-family: 'JetBrains Mono', monospace; font-size: 1.4rem; font-weight: 700; color: #fff; }
.hstat-lbl { font-size: .75rem; color: var(--c-muted); letter-spacing: .04em; }

/* Decorative cards */
.hero-deco {
  position: absolute; right: 80px; top: 50%;
  transform: translateY(-50%);
  display: flex; flex-direction: column; gap: 18px;
}
.deco-card {
  background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.1);
  backdrop-filter: blur(20px); border-radius: 14px;
  padding: 16px 20px; display: flex; align-items: center; gap: 12px;
  font-size: .85rem; color: var(--c-text);
  animation: float 4s ease-in-out infinite;
}
.dc1 { animation-delay: 0s; }
.dc2 { animation-delay: 1.3s; }
.dc3 { animation-delay: 2.6s; }
@keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
.dc-icon { font-size: 22px; }
.dc-star { color: #f59e0b; font-size: 13px; }
.dc-progress { width: 100px; height: 4px; background: rgba(255,255,255,.1); border-radius: 2px; overflow: hidden; }
.dc-bar { height: 100%; background: linear-gradient(90deg, #4f6ef7, #06d6a0); border-radius: 2px; }
.dc-text { font-size: .82rem; color: var(--c-muted); }

/* ─── Category section ─── */
.cat-section {
  position: relative; z-index: 1;
  border-top: 1px solid var(--c-border);
  border-bottom: 1px solid var(--c-border);
  background: rgba(0,0,0,.3);
  backdrop-filter: blur(20px);
}
.cat-inner {
  max-width: 1200px; margin: 0 auto; padding: 0 40px;
}
.cat-tabs {
  display: flex; gap: 0;
}
.cat-btn {
  display: flex; align-items: center; gap: 14px;
  flex: 1; padding: 22px 24px;
  border: none; border-right: 1px solid var(--c-border);
  background: transparent; cursor: pointer; color: var(--c-muted);
  transition: all .25s; position: relative;
}
.cat-btn:last-child { border-right: none; }
.cat-btn:hover { background: rgba(255,255,255,.04); color: var(--c-text); }
.cat-btn.active { color: var(--c-text); background: rgba(79,110,247,.08); }
.cat-btn.active::after {
  content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, #4f6ef7, #a855f7);
}
.cat-glyph { font-size: 20px; flex-shrink: 0; }
.cat-text { display: flex; flex-direction: column; gap: 2px; text-align: left; }
.cat-name { font-size: .9rem; font-weight: 600; }
.cat-desc { font-size: .73rem; opacity: .6; }
.cat-count {
  margin-left: auto; font-family: 'JetBrains Mono', monospace;
  font-size: .78rem; padding: 3px 9px; border-radius: 20px;
  background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1);
  color: var(--c-muted); flex-shrink: 0;
}

/* ─── Courses section ─── */
.courses-section { position: relative; z-index: 1; padding: 60px 0; }
.courses-inner { max-width: 1200px; margin: 0 auto; padding: 0 40px; }

.section-head {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 36px;
}
.section-title { font-size: 1.6rem; font-weight: 700; margin: 0; }
.section-sub { color: var(--c-muted); font-weight: 400; font-size: 1rem; }
.sort-sel {
  background: var(--c-surface); border: 1px solid var(--c-border);
  color: var(--c-text); padding: 9px 14px; border-radius: 9px;
  font-family: 'Sora', sans-serif; font-size: .85rem; cursor: pointer;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 22px;
}

/* ─── Course Card ─── */
.course-card {
  background: var(--c-surface); border: 1px solid var(--c-border);
  border-radius: 18px; overflow: hidden; cursor: pointer;
  transition: all .3s ease;
  display: flex; flex-direction: column;
}
.course-card:hover {
  border-color: rgba(255,255,255,.16);
  transform: translateY(-8px);
  box-shadow: 0 24px 60px rgba(0,0,0,.5);
}

.card-thumb {
  position: relative; height: 168px; overflow: hidden;
  display: flex; align-items: center; justify-content: center;
}
.thumb-glyph {
  font-size: 7rem; font-weight: 800; line-height: 1;
  font-family: 'JetBrains Mono', monospace; user-select: none;
  transition: transform .4s ease;
}
.course-card:hover .thumb-glyph { transform: scale(1.1) rotate(-5deg); }
.thumb-overlay {
  position: absolute; inset: 0; background: rgba(0,0,0,.5);
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity .3s;
}
.course-card:hover .thumb-overlay { opacity: 1; }
.preview-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 20px; border-radius: 10px; border: none; cursor: pointer;
  background: rgba(255,255,255,.9); color: #060a12;
  font-family: 'Sora', sans-serif; font-size: .85rem; font-weight: 600;
}
.badge-group {
  position: absolute; top: 12px; left: 12px;
  display: flex; flex-direction: column; gap: 5px;
}
.level-badge {
  padding: 3px 9px; border-radius: 6px; font-size: .7rem; font-weight: 600;
  border: 1px solid; font-family: 'JetBrains Mono', monospace;
}
.hot-badge, .new-badge {
  padding: 3px 8px; border-radius: 6px; font-size: .68rem; font-weight: 600;
  backdrop-filter: blur(6px);
}
.hot-badge { background: rgba(239,68,68,.25); color: #fca5a5; border: 1px solid rgba(239,68,68,.3); }
.new-badge { background: rgba(79,110,247,.25); color: #a5b4fc; border: 1px solid rgba(79,110,247,.3); }
.accent-line {
  position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
  transform: scaleX(0); transition: transform .35s ease;
}
.course-card:hover .accent-line { transform: scaleX(1); }

.card-body { padding: 20px; flex: 1; display: flex; flex-direction: column; }
.card-tag { font-size: .7rem; font-weight: 600; color: var(--c-muted); letter-spacing: .08em; text-transform: uppercase; margin-bottom: 8px; }
.card-title { font-size: 1.05rem; font-weight: 700; margin: 0 0 8px; line-height: 1.3; }
.card-desc { font-size: .82rem; color: var(--c-muted); line-height: 1.6; margin: 0 0 16px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

.card-meta { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
.meta-pill {
  display: flex; align-items: center; gap: 5px;
  padding: 5px 10px; border-radius: 6px; font-size: .75rem;
  background: rgba(255,255,255,.05); color: var(--c-muted);
  border: 1px solid var(--c-border);
}

.card-footer {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: auto; padding-top: 16px;
  border-top: 1px solid var(--c-border);
}
.footer-left { display: flex; flex-direction: column; gap: 3px; }
.rating-row { display: flex; align-items: center; gap: 6px; }
.stars { font-size: .8rem; }
.rating-num { font-family: 'JetBrains Mono', monospace; font-size: .85rem; font-weight: 600; color: #fff; }
.students-count { font-size: .72rem; color: var(--c-muted); }
.card-cta {
  padding: 9px 18px; border-radius: 9px; border: none; cursor: pointer;
  color: #fff; font-family: 'Sora', sans-serif; font-size: .82rem; font-weight: 600;
  transition: all .2s;
}
.card-cta:hover { filter: brightness(1.15); transform: translateY(-1px); }

/* Empty state */
.empty-state {
  grid-column: 1/-1; text-align: center; padding: 80px 20px;
  color: var(--c-muted);
}
.empty-glyph { font-size: 4rem; opacity: .2; font-family: 'JetBrains Mono', monospace; margin-bottom: 16px; }

/* ─── Features ─── */
.features-section {
  position: relative; z-index: 1;
  padding: 80px 0;
  border-top: 1px solid var(--c-border);
}
.feat-inner { max-width: 1200px; margin: 0 auto; padding: 0 40px; text-align: center; }
.feat-label {
  display: inline-block; margin-bottom: 12px;
  font-size: .75rem; font-weight: 600; letter-spacing: .12em; text-transform: uppercase;
  color: #7c9ff5;
}
.feat-title { font-size: 2rem; font-weight: 700; margin: 0 0 48px; }
.feat-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
}
.feat-card {
  padding: 32px 24px; border-radius: 16px;
  background: var(--c-surface); border: 1px solid var(--c-border);
  text-align: center; transition: all .3s;
  animation: fadeUp .6s both;
}
.feat-card:hover { transform: translateY(-6px); border-color: rgba(255,255,255,.14); background: rgba(255,255,255,.07); }
@keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
.feat-icon { font-size: 2.4rem; margin-bottom: 14px; }
.feat-name { font-size: 1rem; font-weight: 700; margin: 0 0 8px; }
.feat-desc { font-size: .83rem; color: var(--c-muted); line-height: 1.6; margin: 0; }

/* ─── CTA Banner ─── */
.cta-banner {
  position: relative; z-index: 1;
  margin: 0 40px 80px; border-radius: 24px;
  background: linear-gradient(135deg, rgba(79,110,247,.15) 0%, rgba(168,85,247,.1) 50%, rgba(6,214,160,.08) 100%);
  border: 1px solid rgba(79,110,247,.25);
  overflow: hidden;
}
.cta-banner::before {
  content: ''; position: absolute; inset: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
.cta-inner { position: relative; padding: 60px; text-align: center; }
.cta-title { font-size: 2.2rem; font-weight: 800; margin: 0 0 12px; letter-spacing: -.01em; }
.cta-sub { font-size: 1rem; color: var(--c-muted); margin: 0 0 36px; }
.cta-btns { display: flex; gap: 14px; justify-content: center; }
.cta-primary {
  padding: 14px 36px; border-radius: 12px; border: none; cursor: pointer;
  background: linear-gradient(135deg, #4f6ef7, #7b5ea7); color: #fff;
  font-family: 'Sora', sans-serif; font-size: 1rem; font-weight: 600;
  transition: all .25s;
}
.cta-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(79,110,247,.4); }
.cta-ghost {
  padding: 14px 36px; border-radius: 12px; cursor: pointer;
  background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.15);
  color: var(--c-text); font-family: 'Sora', sans-serif; font-size: 1rem; font-weight: 500;
  transition: all .25s;
}
.cta-ghost:hover { background: rgba(255,255,255,.12); }

/* ─── Transitions ─── */
.fade-enter-active, .fade-leave-active { transition: all .3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(12px); }

/* ─── Responsive ─── */
@media (max-width: 1024px) {
  .hero { padding: 100px 40px 60px; }
  .hero-deco { display: none; }
  .cat-tabs { overflow-x: auto; }
  .cat-btn { min-width: 160px; }
}
@media (max-width: 768px) {
  .hero { padding: 80px 24px 48px; }
  .courses-inner, .feat-inner { padding: 0 20px; }
  .cta-banner { margin: 0 20px 60px; }
  .cta-inner { padding: 40px 24px; }
  .cta-title { font-size: 1.6rem; }
  .cta-btns { flex-direction: column; align-items: center; }
  .courses-grid { grid-template-columns: 1fr; }
}
</style>