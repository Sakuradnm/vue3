<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getAllCategories, getSubCategoriesByCategoryId, getCoursesBySubCategoryId } from '@/api/course'

const router = useRouter()
const selectedCategory = ref(0)
const selectedSubCategory = ref(0)
const searchQuery = ref('')
const hoveredCard = ref<number | null>(null)
const mouseX = ref(0)
const mouseY = ref(0)
let particleRafId: number | null = null
let observers: IntersectionObserver[] = []
const categories = ref<any[]>([])
const loading = ref(true)

// 平台优势数据
const features = ref([
  {
    icon: '📚',
    title: '国家标准体系',
    desc: '严格遵循GB/T 13745-2009学科分类，构建系统化知识框架'
  },
  {
    icon: '🎓',
    title: '权威师资团队',
    desc: '来自顶尖院校的教授与行业专家联合授课'
  },
  {
    icon: '📈',
    title: '动态学习路径',
    desc: 'AI智能推荐，根据学习进度实时调整课程安排'
  },
  {
    icon: '🏆',
    title: '认证证书体系',
    desc: '完成课程可获得国家认可的学习证书'
  },
  {
    icon: '🌐',
    title: '跨学科融合',
    desc: '打破学科壁垒，培养复合型知识结构'
  },
  {
    icon: '⚡',
    title: '实时更新',
    desc: '紧跟学科前沿，课程内容每年动态迭代'
  }
])

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

interface SubCategory {
  id: number
  name: string
  code: string
  courses: Course[]
}

interface Category {
  id: number
  name: string
  code: string
  glyph: string
  desc: string
  subCategories: SubCategory[]
}

const glyphs = ['◈', '◉', '⬡', '◎', '◈', '⬟']
const levelColors = ['#06d6a0', '#f59e0b', '#ef4444']
const accents = ['#4f6ef7', '#0ea5e9', '#a855f7', '#ef4444', '#f97316', '#84cc16', '#06d6a0']

const generateMockCourse = (name: string, cIndex: number): Course => ({
  id: Math.random(),
  title: name,
  description: '系统化课程讲解，涵盖核心知识点与实战应用',
  instructor: '名师主讲',
  duration: '24 课时',
  level: ['初级', '中级', '高级'][Math.floor(Math.random() * 3)],
  levelColor: levelColors[Math.floor(Math.random() * levelColors.length)],
  students: Math.floor(Math.random() * 5000) + 500,
  rating: (4.5 + Math.random() * 0.5).toFixed(1),
  lessons: Math.floor(Math.random() * 30) + 20,
  accent: accents[cIndex % accents.length],
  tag: '核心课程',
  new: Math.random() > 0.7,
  hot: Math.random() > 0.8
})

const loadCategories = async () => {
  try {
    const categoryData = await getAllCategories()
    console.log('一级分类数据:', categoryData)

    categories.value = await Promise.all(
        categoryData.map(async (cat: any, index: number) => {
          const subCategoryData = await getSubCategoriesByCategoryId(cat.id)
          console.log(`分类 ${cat.name} 的二级分类:`, subCategoryData)

          const subCategories: SubCategory[] = await Promise.all(
              subCategoryData.map(async (sub: any) => {
                const courseData = await getCoursesBySubCategoryId(sub.id)
                console.log(`二级分类 ${sub.name} 的课程:`, courseData)

                const courses: Course[] = courseData.map((course: any, cIndex: number) =>
                    generateMockCourse(course.name, cIndex)
                )

                return {
                  id: sub.id,
                  name: sub.name,
                  code: `${cat.id}.${sub.id}`,
                  courses
                }
              })
          )

          return {
            id: cat.id,
            name: cat.name,
            code: `${cat.id * 100}`,
            glyph: glyphs[index % glyphs.length],
            desc: cat.description || '探索学科奥秘',
            subCategories
          }
        })
    )
    console.log('最终组装的分类数据:', categories.value)
  } catch (error) {
    console.error('加载分类失败:', error)
    ElMessage.error('加载学科分类失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 当前大类的子分类列表
const currentSubCategories = computed(() => {
  if (!categories.value || !categories.value[selectedCategory.value]) {
    return []
  }
  return categories.value[selectedCategory.value]?.subCategories || []
})

// 当前选中的子分类中的课程列表（原始）
const currentSubCategoryCourses = computed(() => {
  const subs = currentSubCategories.value
  if (subs.length && selectedSubCategory.value < subs.length) {
    return subs[selectedSubCategory.value].courses
  }
  return []
})

// 搜索过滤后的课程
const filteredCourses = computed(() => {
  const courses = currentSubCategoryCourses.value
  if (!searchQuery.value.trim()) return courses
  const q = searchQuery.value.toLowerCase()
  return courses.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.instructor.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
  )
})

// 全局统计数据（基于所有学科分类）
const allStats = computed(() => {
  if (!categories.value || categories.value.length === 0) {
    return {
      totalCourses: 0,
      totalStudents: 0,
      avgRating: '0.0'
    }
  }

  let totalCourses = 0
  let totalStudents = 0
  let totalRatingSum = 0
  categories.value.forEach(cat => {
    cat.subCategories.forEach(sub => {
      sub.courses.forEach(course => {
        totalCourses++
        totalStudents += course.students
        totalRatingSum += course.rating
      })
    })
  })
  return {
    totalCourses,
    totalStudents,
    avgRating: totalCourses ? (totalRatingSum / totalCourses).toFixed(1) : '0.0'
  }
})

const goToCourse = (courseId: number) => {
  router.push(`/course/${courseId}`)
}

const onMouseMove = (e: MouseEvent) => {
  mouseX.value = e.clientX
  mouseY.value = e.clientY
}

// 粒子系统（带连线效果）
const initParticles = (canvas) => {
  let W = window.innerWidth, H = window.innerHeight;
  canvas.width = W;
  canvas.height = H;

  const count = Math.floor((W * H) / 12000);
  const pts = Array.from({ length: count }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.18,
    vy: (Math.random() - 0.5) * 0.18,
    r: Math.random() * 1.1 + 0.3,
    alpha: Math.random() * 0.35 + 0.08,
    color: ['0,255,180', '0,200,255', '80,255,200'][Math.floor(Math.random() * 3)],
  }));

  const draw = () => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);

    // 连线
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 110) {
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(0,255,180,${0.04 * (1 - d / 110)})`;
          ctx.lineWidth = 0.4;
          ctx.stroke();
        }
      }

      // 移动 & 绘制粒子
      const p = pts[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
      ctx.fill();
    }

    particleRafId = requestAnimationFrame(draw);
  };

  draw();

  const onResize = () => {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;
  };
  window.addEventListener('resize', onResize);

  // 返回清理函数
  return () => {
    window.removeEventListener('resize', onResize);
    if (particleRafId) cancelAnimationFrame(particleRafId);
  };
};

const initObservers = (root: Element) => {
  const elements = root.querySelectorAll('.fade-up')
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.1 })

  elements.forEach(el => observer.observe(el))
  observers.push(observer)
}
let cleanupParticles = null;

onMounted(() => {
  loadCategories();

  setTimeout(() => {
    const root = document.querySelector('.cp-root');
    const canvas = root?.querySelector('.bg-canvas');
    if (canvas) cleanupParticles = initParticles(canvas);
    if (root) initObservers(root);
  }, 100);

  window.addEventListener('mousemove', onMouseMove);
});

onUnmounted(() => {
  if (cleanupParticles) cleanupParticles();
  observers.forEach(o => o.disconnect());
  window.removeEventListener('mousemove', onMouseMove);
});

</script>

<template>
  <div class="cp-root">
    <canvas class="bg-canvas"></canvas>
    <div class="noise-layer"></div>
    <div class="cursor-glow" :style="`left:${mouseX}px;top:${mouseY}px`"></div>

    <!-- ═══════════ HERO ═══════════ -->
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-label">
          <span class="pulse-dot" />GB/T 13745-2009 · 学科分类与代码
        </div>
        <h1 class="hero-title">
          探索学科<br />
          <span class="title-gradient">知识体系全景</span>
        </h1>
        <p class="hero-desc">
          中华人民共和国学科分类标准 · 系统化学习路径
        </p>

        <div class="hero-search">
          <svg class="s-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input v-model="searchQuery" class="search-inp" placeholder="在当前学科分类中搜索课程..." />
          <button class="search-btn">搜索</button>
        </div>

        <div class="hero-stats">
          <div class="hstat" v-for="s in [
            { val: (allStats.totalCourses || 0) + '门', lbl: '全学科课程' },
            { val: ((allStats.totalStudents || 0)/1000).toFixed(0)+'K+', lbl: '注册学员' },
            { val: allStats.avgRating || '0.0', lbl: '平均评分' },
            { val: '100%', lbl: '证书认可率' },
          ]" :key="s.lbl">
            <span class="hstat-val">{{ s.val }}</span>
            <span class="hstat-lbl">{{ s.lbl }}</span>
          </div>
        </div>
      </div>

      <div class="hero-deco">
        <div class="deco-card dc1">
          <span class="dc-icon">📐</span>
          <span class="dc-text">数学 · 110.11</span>
        </div>
        <div class="deco-card dc2">
          <div class="dc-progress">
            <div class="dc-bar" style="width:68%"/>
          </div>
          <span class="dc-text">学习进度 68%</span>
        </div>
        <div class="deco-card dc3">
          <span class="dc-star">★★★★★</span>
          <span class="dc-text">权威学科体系</span>
        </div>
      </div>
    </section>

    <!-- ═══════════ 一级学科导航（大类）═══════════ -->
    <section class="cat-section">
      <div class="cat-inner">
        <div class="cat-tabs">
          <button
              v-for="(cat, idx) in (categories || [])"
              :key="cat.id"
              class="cat-btn"
              :class="{ active: selectedCategory === idx }"
              @click="selectedCategory = idx"
          >
            <span class="cat-glyph">{{ cat.glyph || '◈' }}</span>
            <div class="cat-text">
              <span class="cat-name">{{ cat.name }}</span>
              <span class="cat-desc">{{ cat.code }} · {{ cat.desc }}</span>
            </div>
            <span class="cat-count">{{ cat.subCategories?.reduce((acc, sub) => acc + (sub.courses?.length || 0), 0) || 0 }}</span>
          </button>
        </div>
      </div>
    </section>

    <!-- ═══════════ 二级学科导航（小类）═══════════ -->
    <section class="subcat-section">
      <div class="subcat-inner">
        <div class="subcat-tabs">
          <button
              v-for="(sub, idx) in (currentSubCategories || [])"
              :key="sub.id"
              class="subcat-btn"
              :class="{ active: selectedSubCategory === idx }"
              @click="selectedSubCategory = idx"
          >
            <span class="subcat-code">{{ sub.code }}</span>
            <span class="subcat-name">{{ sub.name }}</span>
            <span class="subcat-count">{{ sub.courses?.length || 0 }}</span>
          </button>
        </div>
      </div>
    </section>

    <!-- ═══════════ 课程网格 ═══════════ -->
    <section class="courses-section">
      <div class="courses-inner">
        <div class="section-head">
          <h2 class="section-title" v-if="categories[selectedCategory]">
            {{ categories[selectedCategory].name }} · {{ currentSubCategories[selectedSubCategory]?.name || '' }}
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
              <div class="card-thumb" :style="{ background: `linear-gradient(135deg, ${course.accent}28, ${course.accent}0a)` }">
                <div class="thumb-glyph" :style="{ color: course.accent + '55' }">
                  {{ categories[selectedCategory]?.glyph }}
                </div>
                <div class="thumb-overlay">
                  <button class="preview-btn">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                    预览课程
                  </button>
                </div>
                <div class="badge-group">
                  <span class="level-badge" :style="{ background: course.levelColor + '22', color: course.levelColor, borderColor: course.levelColor + '44' }">
                    {{ course.level }}
                  </span>
                  <span v-if="course.hot" class="hot-badge">🔥 热门</span>
                  <span v-if="course.new" class="new-badge">✦ 新上</span>
                </div>
                <div class="accent-line" :style="{ background: course.accent }" />
              </div>

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
        <h2 class="feat-title">为什么选择国家标准学科体系</h2>
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
        <h2 class="cta-title">开启你的学科探索之旅</h2>
        <p class="cta-sub">加入 {{ (allStats.totalStudents / 1000).toFixed(0) }}K+ 学员，依据国家标准构建知识体系</p>
        <div class="cta-btns">
          <button class="cta-primary">免费试学</button>
          <button class="cta-ghost">查看全部课程</button>
        </div>
      </div>
    </section>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=JetBrains+Mono:wght@300;400;600&family=Noto+Sans+SC:wght@300;400;500;700&display=swap');

/* ══ DESIGN TOKENS ══ */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.cp-root {
  background: #020b10;
  color: #c8f0e0;
  font-family: 'Noto Sans SC', sans-serif;
  min-height: 100vh;
  overflow-x: hidden;
  position: relative;
}

/* ─── BACKGROUND EFFECTS ─────────────────────────────────────── */
.bg-canvas {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}
.noise-layer {
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  opacity: 0.022;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 180px;
}
.cursor-glow {
  position: fixed;
  z-index: 1;
  width: 500px;
  height: 500px;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, rgba(0, 255, 180, 0.028) 0%, transparent 55%);
  pointer-events: none;
  transition: left 0.07s, top 0.07s;
}

/* ─── FADE UP ─────────────────────────────────────────── */
.fade-up {
  opacity: 0;
  transform: translateY(22px);
  transition: opacity 0.7s cubic-bezier(0.25, 1, 0.5, 1), transform 0.7s cubic-bezier(0.25, 1, 0.5, 1);
}
.fade-up.visible {
  opacity: 1;
  transform: translateY(0);
}

/* ─── HERO ────────────────────────────────────────────── */
.hero {
  position: relative;
  z-index: 1;
  min-height: 92vh;
  display: flex;
  align-items: center;
  padding: 100px 80px 80px;
  overflow: hidden;
}
.hero-inner {
  max-width: 620px;
  flex-shrink: 0;
}

.hero-label {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 6px 18px;
  margin-bottom: 30px;
  border-radius: 999px;
  border: 1px solid rgba(0, 212, 255, 0.28);
  background: rgba(0, 212, 255, 0.06);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  color: #00d4ff;
  letter-spacing: 0.12em;
}
.pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #00ff9d;
  box-shadow: 0 0 8px #00ff9d;
  animation: blink 1.4s steps(1) infinite;
}
@keyframes blink {
  0%,
  49% {
    opacity: 1;
  }
  50%,
  100% {
    opacity: 0;
  }
}

.hero-title {
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(2.8rem, 5.5vw, 5rem);
  font-weight: 700;
  line-height: 1.05;
  margin: 0 0 18px;
  letter-spacing: 0.02em;
}
.title-gradient {
  display: block;
  background: linear-gradient(110deg, #00d4ff 0%, #4fa3ff 40%, #a78bfa 80%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 24px rgba(0, 212, 255, 0.4));
}
.hero-desc {
  font-size: 1.05rem;
  color: rgba(200, 240, 224, 0.85);
  line-height: 1.8;
  margin: 0 0 40px;
  font-weight: 300;
}

/* Search */
.hero-search {
  display: flex;
  align-items: center;
  background: rgba(8, 24, 46, 0.9);
  border: 1px solid rgba(0, 212, 255, 0.22);
  border-radius: 12px;
  padding: 6px 6px 6px 20px;
  margin-bottom: 52px;
  max-width: 520px;
  transition: all 0.3s;
}
.hero-search:focus-within {
  border-color: #00d4ff;
  box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.15), 0 0 30px rgba(0, 212, 255, 0.2);
}
.s-icon {
  color: rgba(150, 210, 180, 0.5);
  flex-shrink: 0;
}
.search-inp {
  flex: 1;
  border: none;
  background: transparent;
  padding: 10px 14px;
  color: #c8f0e0;
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 0.95rem;
}
.search-inp:focus {
  outline: none;
}
.search-inp::placeholder {
  color: rgba(150, 210, 180, 0.5);
}
.search-btn {
  padding: 11px 28px;
  border-radius: 9px;
  border: none;
  cursor: pointer;
  background: linear-gradient(135deg, #0060cc, #00d4ff);
  color: #fff;
  font-size: 0.88rem;
  font-weight: 600;
  font-family: 'Noto Sans SC', sans-serif;
  letter-spacing: 0.04em;
  box-shadow: 0 4px 20px rgba(0, 180, 255, 0.3);
  transition: all 0.2s;
}
.search-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 28px rgba(0, 180, 255, 0.5);
}

/* Stats row */
.hero-stats {
  display: flex;
  flex-wrap: wrap;
}
.hstat {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-right: 36px;
  margin-right: 36px;
  border-right: 1px solid rgba(0, 212, 255, 0.08);
}
.hstat:last-child {
  border-right: none;
  padding-right: 0;
  margin-right: 0;
}
.hstat-val {
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.6rem;
  color: #00d4ff;
  text-shadow: 0 0 22px rgba(0, 212, 255, 0.5);
}
.hstat-lbl {
  font-size: 0.73rem;
  color: rgba(150, 210, 180, 0.5);
  letter-spacing: 0.05em;
}

/* Deco floating cards */
.hero-deco {
  position: absolute;
  right: 80px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.deco-card {
  background: rgba(8, 22, 44, 0.92);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 12px;
  padding: 14px 18px;
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
  font-size: 0.85rem;
  color: #c8f0e0;
}
.dc1 {
  animation: floatCard 5s ease-in-out infinite;
}
.dc2 {
  animation: floatCard 5s ease-in-out infinite -1.7s;
}
.dc3 {
  animation: floatCard 5s ease-in-out infinite -3.4s;
}
@keyframes floatCard {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-9px);
  }
}
.dc-icon {
  font-size: 1.6rem;
}
.dc-star {
  color: #ffd93d;
  font-size: 0.82rem;
  filter: drop-shadow(0 0 6px #ffd93d);
}
.dc-progress {
  width: 90px;
  height: 4px;
  background: rgba(0, 212, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}
.dc-bar {
  height: 100%;
  border-radius: 2px;
  background: linear-gradient(90deg, #0060cc, #00d4ff);
}
.dc-text {
  font-size: 0.8rem;
  color: rgba(150, 210, 180, 0.5);
  font-family: 'JetBrains Mono', monospace;
}

/* ─── CATEGORY NAV ────────────────────────────────────── */
.cat-section {
  position: relative;
  z-index: 2;
  background: rgba(2, 6, 14, 0.95);
  border-top: 1px solid rgba(0, 212, 255, 0.08);
  border-bottom: 1px solid rgba(0, 212, 255, 0.08);
  backdrop-filter: blur(24px);
}
.cat-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 48px;
}
.cat-tabs {
  display: flex;
  overflow-x: auto;
  scrollbar-width: none;
}
.cat-tabs::-webkit-scrollbar {
  display: none;
}

.cat-btn {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
  min-width: 140px;
  padding: 18px 22px;
  border: none;
  border-right: 1px solid rgba(0, 212, 255, 0.08);
  border-bottom: 2px solid transparent;
  background: transparent;
  cursor: pointer;
  color: rgba(150, 210, 180, 0.5);
  font-family: 'Noto Sans SC', sans-serif;
  transition: all 0.25s;
  position: relative;
}
.cat-btn:last-child {
  border-right: none;
}
.cat-btn:hover {
  color: #c8f0e0;
  background: rgba(0, 212, 255, 0.04);
}
.cat-btn.active {
  color: #00d4ff;
  border-bottom-color: #00d4ff;
  background: rgba(0, 212, 255, 0.05);
}

/* Icon-wrap for glyph */
.cat-glyph {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  background: rgba(0, 212, 255, 0.06);
  border: 1px solid rgba(0, 212, 255, 0.12);
  transition: all 0.25s;
}
.cat-btn.active .cat-glyph {
  background: rgba(0, 212, 255, 0.14);
  border-color: rgba(0, 212, 255, 0.35);
  box-shadow: 0 0 18px rgba(0, 212, 255, 0.5);
}
.cat-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  text-align: left;
  flex: 1;
}
.cat-name {
  font-size: 0.88rem;
  font-weight: 600;
  white-space: nowrap;
}
.cat-desc {
  font-size: 0.72rem;
  opacity: 0.6;
}
.cat-count {
  margin-left: auto;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.72rem;
  padding: 2px 9px;
  border-radius: 999px;
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.15);
  color: rgba(150, 210, 180, 0.5);
  flex-shrink: 0;
}
.cat-btn.active .cat-count {
  background: rgba(0, 212, 255, 0.2);
  color: #00d4ff;
}

/* ─── 二级学科导航（小类）样式 ─────────────────────────── */
.subcat-section {
  position: relative;
  z-index: 1;
  background: rgba(2, 10, 18, 0.8);
  border-bottom: 1px solid rgba(0, 212, 255, 0.1);
  backdrop-filter: blur(12px);
  margin-top: -1px;
}
.subcat-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 12px 48px;
}
.subcat-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.subcat-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  border-radius: 999px;
  background: rgba(0, 212, 255, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.15);
  color: rgba(200, 240, 224, 0.7);
  font-size: 0.8rem;
  font-family: 'JetBrains Mono', monospace;
  cursor: pointer;
  transition: all 0.2s;
}
.subcat-btn:hover {
  background: rgba(0, 212, 255, 0.12);
  border-color: rgba(0, 212, 255, 0.35);
  color: #c8f0e0;
}
.subcat-btn.active {
  background: rgba(0, 212, 255, 0.2);
  border-color: #00d4ff;
  color: #00d4ff;
  box-shadow: 0 0 12px rgba(0, 212, 255, 0.2);
}
.subcat-code {
  font-size: 0.7rem;
  opacity: 0.7;
}
.subcat-name {
  font-weight: 500;
}
.subcat-count {
  font-size: 0.7rem;
  background: rgba(0, 0, 0, 0.4);
  padding: 2px 6px;
  border-radius: 999px;
  margin-left: 4px;
}

/* ─── COURSES ─────────────────────────────────────────── */
.courses-section {
  position: relative;
  z-index: 1;
  padding: 60px 0 80px;
}
.courses-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 48px;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 36px;
}
.section-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 1.8rem;
  font-weight: 600;
  margin: 0;
  letter-spacing: 0.04em;
}
.section-sub {
  color: rgba(150, 210, 180, 0.5);
  font-weight: 400;
  font-size: 1rem;
}
.sort-sel {
  padding: 9px 16px;
  border-radius: 9px;
  background: rgba(8, 20, 38, 0.9);
  border: 1px solid rgba(0, 212, 255, 0.08);
  color: rgba(200, 240, 224, 0.85);
  font-size: 0.82rem;
  font-family: 'Noto Sans SC', sans-serif;
  cursor: pointer;
  transition: border-color 0.2s;
}
.sort-sel:hover {
  border-color: #00d4ff;
}
.sort-sel:focus {
  outline: none;
  border-color: #00d4ff;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
  gap: 20px;
}

/* ── Course Card ── */
.course-card {
  background: rgba(8, 20, 44, 0.6);
  border: 1px solid rgba(0, 212, 255, 0.08);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition: all 0.32s ease;
  position: relative;
}
.course-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
  z-index: 0;
  background: radial-gradient(ellipse at 50% 0%, rgba(0, 212, 255, 0.07), transparent 60%);
}
.course-card:hover {
  border-color: rgba(0, 212, 255, 0.38);
  transform: translateY(-7px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.55), 0 0 40px rgba(0, 212, 255, 0.08);
}
.course-card:hover::before {
  opacity: 1;
}

/* Thumbnail */
.card-thumb {
  position: relative;
  height: 168px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
/* Circuit grid */
.card-thumb::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  opacity: 0.09;
  background-image: linear-gradient(rgba(0, 212, 255, 0.6) 1px, transparent 1px),
  linear-gradient(90deg, rgba(0, 212, 255, 0.6) 1px, transparent 1px);
  background-size: 24px 24px;
}
/* Top-left corner bracket */
.card-thumb::after {
  content: '';
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 4;
  width: 18px;
  height: 18px;
  border-top: 1.5px solid rgba(0, 212, 255, 0.55);
  border-left: 1.5px solid rgba(0, 212, 255, 0.55);
}
.thumb-glyph {
  position: relative;
  z-index: 1;
  font-size: 6rem;
  font-weight: 800;
  line-height: 1;
  font-family: 'JetBrains Mono', monospace;
  user-select: none;
  opacity: 0.2;
  filter: blur(1px);
  transition: transform 0.5s ease, opacity 0.3s;
}
.course-card:hover .thumb-glyph {
  transform: scale(1.2) rotate(-8deg);
  opacity: 0.28;
}

.thumb-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  background: rgba(2, 6, 14, 0.68);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}
.course-card:hover .thumb-overlay {
  opacity: 1;
}
.preview-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 22px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  background: rgba(0, 212, 255, 0.14);
  border: 1px solid rgba(0, 212, 255, 0.5);
  color: #00d4ff;
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
  letter-spacing: 0.04em;
}

/* Badges */
.badge-group {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.level-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 9px;
  border-radius: 5px;
  font-size: 0.67rem;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.04em;
  border: 1px solid;
  backdrop-filter: blur(8px);
}
.hot-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 9px;
  border-radius: 5px;
  font-size: 0.67rem;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  background: rgba(255, 69, 69, 0.15);
  color: #ff6b6b;
  border: 1px solid rgba(255, 69, 69, 0.28);
  backdrop-filter: blur(8px);
}
.new-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 9px;
  border-radius: 5px;
  font-size: 0.67rem;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  background: rgba(0, 212, 255, 0.12);
  color: #00d4ff;
  border: 1px solid rgba(0, 212, 255, 0.28);
  backdrop-filter: blur(8px);
}
.accent-line {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2.5px;
  z-index: 3;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
}
.course-card:hover .accent-line {
  transform: scaleX(1);
}

/* Card body */
.card-body {
  padding: 18px 20px 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}
.card-tag {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.68rem;
  letter-spacing: 0.1em;
  color: rgba(150, 210, 180, 0.5);
  text-transform: uppercase;
  margin-bottom: 8px;
}
.card-title {
  font-size: 1.02rem;
  font-weight: 700;
  margin: 0 0 8px;
  line-height: 1.35;
  color: #c8f0e0;
  transition: color 0.2s;
}
.course-card:hover .card-title {
  color: #00d4ff;
}
.card-desc {
  font-size: 0.8rem;
  color: rgba(200, 240, 224, 0.85);
  line-height: 1.65;
  margin: 0 0 14px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 14px;
}
.meta-pill {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.73rem;
  background: rgba(255, 255, 255, 0.04);
  color: rgba(150, 210, 180, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.06);
}
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 14px;
  border-top: 1px solid rgba(0, 212, 255, 0.08);
}
.footer-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.rating-row {
  display: flex;
  align-items: center;
  gap: 6px;
}
.stars {
  font-size: 0.78rem;
}
.rating-num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.88rem;
  font-weight: 600;
  color: #ffd93d;
}
.students-count {
  font-size: 0.7rem;
  color: rgba(150, 210, 180, 0.5);
}
.card-cta {
  padding: 9px 18px;
  border-radius: 9px;
  border: none;
  cursor: pointer;
  color: #fff;
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  transition: all 0.2s;
}
.card-cta:hover {
  filter: brightness(1.18);
  transform: translateY(-1px);
}

/* Empty */
.empty-state {
  grid-column: 1/-1;
  text-align: center;
  padding: 100px 24px;
  color: rgba(150, 210, 180, 0.5);
}
.empty-glyph {
  font-family: 'JetBrains Mono', monospace;
  font-size: 5rem;
  opacity: 0.15;
  margin-bottom: 20px;
  animation: glitch 3s infinite;
}
@keyframes glitch {
  0%,
  93%,
  100% {
    transform: none;
    opacity: 0.15;
  }
  94% {
    transform: skewX(-4deg);
    opacity: 0.25;
    filter: hue-rotate(90deg);
  }
  96% {
    transform: skewX(3deg);
    opacity: 0.2;
  }
}

/* ─── FEATURES ────────────────────────────────────────── */
.features-section {
  position: relative;
  z-index: 1;
  padding: 80px 0;
  border-top: 1px solid rgba(0, 212, 255, 0.08);
}
.feat-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 48px;
}
.feat-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.73rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #00d4ff;
  margin-bottom: 10px;
}
.feat-label::before {
  content: '';
  display: block;
  width: 24px;
  height: 1px;
  background: #00d4ff;
}
.feat-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 2.2rem;
  font-weight: 600;
  margin: 0 0 48px;
  letter-spacing: 0.04em;
}
.feat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 18px;
}
.feat-card {
  background: rgba(8, 20, 44, 0.6);
  border: 1px solid rgba(0, 212, 255, 0.08);
  border-radius: 12px;
  padding: 28px 24px;
  text-align: center;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
  animation: fadeUpCard 0.6s both;
}
.feat-card::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00d4ff, transparent);
  transform: scaleX(0);
  transition: transform 0.4s;
}
.feat-card:hover {
  border-color: rgba(0, 212, 255, 0.32);
  transform: translateY(-5px);
}
.feat-card:hover::after {
  transform: scaleX(1);
}
@keyframes fadeUpCard {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
.feat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 12px;
  margin: 0 auto 16px;
  font-size: 1.8rem;
  background: rgba(0, 212, 255, 0.07);
  border: 1px solid rgba(0, 212, 255, 0.15);
}
.feat-name {
  font-size: 0.98rem;
  font-weight: 700;
  margin: 0 0 8px;
}
.feat-desc {
  font-size: 0.8rem;
  color: rgba(200, 240, 224, 0.85);
  line-height: 1.65;
  margin: 0;
}

/* ─── CTA ─────────────────────────────────────────────── */
.cta-banner {
  position: relative;
  z-index: 1;
  margin: 0 48px 80px;
  border-radius: 20px;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(0, 55, 140, 0.3), rgba(0, 28, 80, 0.6) 40%, rgba(80, 20, 150, 0.2));
  border: 1px solid rgba(0, 212, 255, 0.22);
}
.cta-banner::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2300d4ff' fill-opacity='0.04'%3E%3Cpath d='M20 20v-20h-1v20h-20v1h20v20h1v-20h20v-1h-20z'/%3E%3C/g%3E%3C/svg%3E");
}
.cta-banner::after {
  content: '';
  position: absolute;
  width: 420px;
  height: 420px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 90, 255, 0.22), transparent 70%);
  filter: blur(80px);
  top: -120px;
  left: -80px;
  pointer-events: none;
}
.cta-inner {
  position: relative;
  padding: 72px 60px;
  text-align: center;
  z-index: 1;
}
.cta-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 2.4rem;
  font-weight: 700;
  margin: 0 0 14px;
  letter-spacing: 0.04em;
}
.cta-sub {
  font-size: 1rem;
  color: rgba(200, 240, 224, 0.85);
  margin: 0 0 40px;
  line-height: 1.7;
}
.cta-btns {
  display: flex;
  gap: 14px;
  justify-content: center;
  flex-wrap: wrap;
}
.cta-primary {
  padding: 14px 42px;
  border-radius: 11px;
  border: none;
  cursor: pointer;
  background: linear-gradient(135deg, #0050cc, #00d4ff);
  color: #fff;
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  box-shadow: 0 8px 32px rgba(0, 180, 255, 0.38);
  transition: all 0.25s;
}
.cta-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 44px rgba(0, 180, 255, 0.58);
}
.cta-ghost {
  padding: 14px 42px;
  border-radius: 11px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(0, 212, 255, 0.26);
  color: #c8f0e0;
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  transition: all 0.25s;
}
.cta-ghost:hover {
  background: rgba(0, 212, 255, 0.1);
  border-color: #00d4ff;
}

/* ─── TRANSITIONS ─────────────────────────────────────── */
.fade-enter-active {
  transition: all 0.32s cubic-bezier(0.25, 1, 0.5, 1);
}
.fade-leave-active {
  transition: all 0.22s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(14px) scale(0.97);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.97);
}

/* ─── SCROLLBAR ───────────────────────────────────────── */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: #020b10;
}
::-webkit-scrollbar-thumb {
  background: rgba(0, 212, 255, 0.2);
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 212, 255, 0.4);
}

/* ─── RESPONSIVE ──────────────────────────────────────── */
@media (max-width: 1024px) {
  .hero {
    padding: 100px 40px 60px;
  }
  .hero-deco {
    display: none;
  }
  .cat-tabs {
    overflow-x: auto;
  }
  .cat-btn {
    min-width: 140px;
  }
  .courses-inner,
  .feat-inner {
    padding: 0 24px;
  }
}
@media (max-width: 768px) {
  .hero {
    padding: 80px 24px 48px;
  }
  .courses-inner,
  .feat-inner {
    padding: 0 20px;
  }
  .cta-banner {
    margin: 0 20px 60px;
  }
  .cta-inner {
    padding: 48px 24px;
  }
  .cta-title {
    font-size: 1.8rem;
  }
  .cta-btns {
    flex-direction: column;
    align-items: center;
  }
  .courses-grid {
    grid-template-columns: 1fr;
  }
  .hstat {
    padding-right: 20px;
    margin-right: 20px;
  }
}
</style>