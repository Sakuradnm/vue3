<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { getAllCategories, getSubCategoriesByCategoryId, getCoursesBySubCategoryId } from '@/api/course'

const router = useRouter()
const selectedCategory = ref(-1)
const selectedSubCategory = ref(-1)
const searchQuery = ref('')
const debouncedSearchQuery = ref('')
const hoveredCard = ref<number | null>(null)
const mouseX = ref(0)
const mouseY = ref(0)
let particleRafId: number | null = null
let observers: IntersectionObserver[] = []
const categories = ref<any[]>([])
const loading = ref(true)

// 搜索相关状态
const searchInputFocused = ref(false)
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

// 分页相关状态
const currentPage = ref(1)
const pageSize = 6

// 平台优势数据
const features = ref([
  { icon: '📚', title: '国家标准体系', desc: '严格遵循GB/T 13745-2009学科分类，构建系统化知识框架' },
  { icon: '🎓', title: '权威师资团队', desc: '来自顶尖院校的教授与行业专家联合授课' },
  { icon: '📈', title: '动态学习路径', desc: 'AI智能推荐，根据学习进度实时调整课程安排' },
  { icon: '🏆', title: '认证证书体系', desc: '完成课程可获得国家认可的学习证书' },
  { icon: '🌐', title: '跨学科融合', desc: '打破学科壁垒，培养复合型知识结构' },
  { icon: '⚡', title: '实时更新', desc: '紧跟学科前沿，课程内容每年动态迭代' }
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
  groupIndex?: number
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
  rating: parseFloat((4.5 + Math.random() * 0.5).toFixed(1)),
  lessons: Math.floor(Math.random() * 30) + 20,
  accent: accents[cIndex % accents.length],
  tag: '核心课程',
  new: Math.random() > 0.7,
  hot: Math.random() > 0.8
})

const loadCategories = async () => {
  try {
    const categoryData = await getAllCategories()
    categories.value = await Promise.all(
        categoryData.map(async (cat: any, index: number) => {
          const subCategoryData = await getSubCategoriesByCategoryId(cat.id)
          const filteredSubs = subCategoryData.filter((sub: any) => sub.categoryId === cat.id)
          const uniqueSubsMap = new Map<number, any>()
          filteredSubs.forEach((sub: any) => {
            if (!uniqueSubsMap.has(sub.id)) uniqueSubsMap.set(sub.id, sub)
          })
          const uniqueSubCategoryData = Array.from(uniqueSubsMap.values())
          const subCategories: SubCategory[] = await Promise.all(
              uniqueSubCategoryData.map(async (sub: any, subIndex: number) => {
                const courseData = await getCoursesBySubCategoryId(sub.id)
                const courses: Course[] = courseData.map((course: any, cIndex: number) => ({
                  id: course.id,
                  title: course.name,
                  description: course.description || '系统化课程讲解，涵盖核心知识点与实战应用',
                  instructor: '名师主讲',
                  duration: '24 课时',
                  level: ['初级', '中级', '高级'][Math.floor(Math.random() * 3)],
                  levelColor: levelColors[Math.floor(Math.random() * levelColors.length)],
                  students: Math.floor(Math.random() * 5000) + 500,
                  rating: parseFloat((4.5 + Math.random() * 0.5).toFixed(1)),
                  lessons: Math.floor(Math.random() * 30) + 20,
                  accent: accents[cIndex % accents.length],
                  tag: '核心课程',
                  new: Math.random() > 0.7,
                  hot: Math.random() > 0.8
                }))
                return {
                  id: sub.id,
                  name: sub.name,
                  code: `${cat.id}.${subIndex + 1}`,
                  categoryId: cat.id,
                  groupIndex: subIndex + 1,
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
  } catch (error) {
    console.error('加载分类失败:', error)
    ElMessage.error('加载学科分类失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// ─── 当前大类的子分类列表 ───────────────────────────────────
const currentSubCategories = computed(() => {
  if (!categories.value || !categories.value[selectedCategory.value]) return []
  return categories.value[selectedCategory.value]?.subCategories || []
})

// ─── 当前选中子分类的课程 ────────────────────────────────────
const currentSubCategoryCourses = computed(() => {
  const subs = currentSubCategories.value
  if (subs.length && selectedSubCategory.value >= 0 && selectedSubCategory.value < subs.length) {
    return subs[selectedSubCategory.value].courses
  }
  return []
})

// ─── 所有课程扁平化（用于搜索建议） ─────────────────────────
const allCoursesFlat = computed(() => {
  if (!categories.value || categories.value.length === 0) return []
  const courses: Array<Course & { categoryName?: string; subCategoryName?: string }> = []
  categories.value.forEach(cat => {
    cat.subCategories.forEach(sub => {
      sub.courses.forEach(course => {
        courses.push({ ...course, categoryName: cat.name, subCategoryName: sub.name })
      })
    })
  })
  return courses
})

// ─── 搜索建议（基于实时 searchQuery，即时响应，最多 4 个） ──
const searchSuggestions = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return []
  return allCoursesFlat.value
      .filter(c =>
          c.title.toLowerCase().includes(q) ||
          c.instructor.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      )
      .slice(0, 4)
})

// ─── 建议框显示：纯计算属性，无需手动维护 ───────────────────
const showSearchSuggestions = computed(() =>
    searchInputFocused.value &&
    searchQuery.value.trim().length > 0 &&
    searchSuggestions.value.length > 0
)

// ─── isSearching：直接从 searchQuery 计算 ───────────────────
const isSearching = computed(() => searchQuery.value.trim().length > 0)

// ─── 课程网格过滤（使用防抖后的 debouncedSearchQuery） ──────
const filteredCourses = computed(() => {
  let courses: Course[]
  if (selectedSubCategory.value >= 0) {
    courses = currentSubCategoryCourses.value
  } else if (selectedCategory.value >= 0) {
    const cat = categories.value[selectedCategory.value]
    courses = cat ? cat.subCategories.flatMap(sub => sub.courses) : []
  } else {
    courses = categories.value.flatMap(cat => cat.subCategories.flatMap(sub => sub.courses))
  }
  const q = debouncedSearchQuery.value.trim().toLowerCase()
  if (!q) return courses
  return courses.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.instructor.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
  )
})

// ─── 分页后的课程列表 ────────────────────────────────────────
const paginatedCourses = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredCourses.value.slice(start, end)
})

// ─── 总页数 ──────────────────────────────────────────────────
const totalPages = computed(() => Math.ceil(filteredCourses.value.length / pageSize))

// ─── 监听筛选条件变化，重置页码 ──────────────────────────────
watch([selectedCategory, selectedSubCategory, debouncedSearchQuery], () => {
  currentPage.value = 1
})

// ─── 页码切换方法 ────────────────────────────────────────────
const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  // 滚动到课程区域顶部
  setTimeout(() => {
    const el = document.querySelector('.courses-section')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, 100)
}

// ─── 生成页码数组（用于显示页码按钮） ─────────────────────────
const pageNumbers = computed(() => {
  const pages = []
  const maxVisible = 5 // 最多显示5个页码按钮
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// ─── 全局统计 ────────────────────────────────────────────────
const allStats = computed(() => {
  if (!categories.value || categories.value.length === 0) {
    return { totalCourses: 0, totalStudents: 0, avgRating: '0.0' }
  }
  let totalCourses = 0, totalStudents = 0, totalRatingSum = 0
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

// ─── 搜索输入处理：建议框即时，课程网格防抖 300ms ───────────
const handleSearchInput = () => {
  // if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  // searchDebounceTimer = setTimeout(() => {
  //   debouncedSearchQuery.value = searchQuery.value
  // }, 300)
}

const handleSearchFocus = () => {
  searchInputFocused.value = true
}

const closeSearchSuggestions = () => {
  // 延迟 200ms，确保 mousedown 点击建议项能先触发
  setTimeout(() => {
    searchInputFocused.value = false
  }, 200)
}

const selectSuggestion = (course: Course) => {
  searchQuery.value = course.title
  debouncedSearchQuery.value = course.title  // 立即同步，跳过防抖
  searchInputFocused.value = false
  setTimeout(scrollToCoursesSection, 100)
}

const handleSearch = () => {
  debouncedSearchQuery.value = searchQuery.value  // 立即触发，跳过防抖
  searchInputFocused.value = false
  setTimeout(scrollToCoursesSection, 100)
}

// ─── 高亮搜索文本 ────────────────────────────────────────────
const highlightText = (text: string, query: string) => {
  if (!query.trim()) return text
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.split(regex).map(part =>
      part.toLowerCase() === query.toLowerCase()
          ? `<mark class="highlight">${part}</mark>`
          : part
  ).join('')
}

// ─── 滚动到课程区域 ──────────────────────────────────────────
const scrollToCoursesSection = () => {
  const el = document.querySelector('.courses-section')
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// ─── 大类点击 ────────────────────────────────────────────────
const handleCategoryClick = (idx: number) => {
  if (selectedCategory.value === idx && selectedSubCategory.value >= 0 && idx >= 0) {
    selectedSubCategory.value = -1
  } else if (selectedCategory.value === idx && idx >= 0) {
    selectedCategory.value = -1
    selectedSubCategory.value = -1
  } else {
    selectedCategory.value = idx
    selectedSubCategory.value = -1
  }
}

const onMouseMove = (e: MouseEvent) => {
  mouseX.value = e.clientX
  mouseY.value = e.clientY
}

// ─── 粒子系统 ────────────────────────────────────────────────
const initParticles = (canvas: HTMLCanvasElement) => {
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
  const draw = () => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return
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
      p.x += p.vx; p.y += p.vy
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${p.color},${p.alpha})`
      ctx.fill()
    }
    particleRafId = requestAnimationFrame(draw)
  }
  draw()
  const onResize = () => {
    W = window.innerWidth; H = window.innerHeight
    canvas.width = W; canvas.height = H
  }
  window.addEventListener('resize', onResize)
  return () => {
    window.removeEventListener('resize', onResize)
    if (particleRafId) cancelAnimationFrame(particleRafId)
  }
}

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

let cleanupParticles: (() => void) | null = null

onMounted(() => {
  loadCategories()
  setTimeout(() => {
    const root = document.querySelector('.cp-root')
    const canvas = root?.querySelector('.bg-canvas') as HTMLCanvasElement
    if (canvas) cleanupParticles = initParticles(canvas) ?? null
    if (root) initObservers(root)
  }, 100)
  window.addEventListener('mousemove', onMouseMove)
})

onUnmounted(() => {
  if (cleanupParticles) cleanupParticles()
  observers.forEach(o => o.disconnect())
  window.removeEventListener('mousemove', onMouseMove)
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
})
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
        <p class="hero-desc">中华人民共和国学科分类标准 · 系统化学习路径</p>

        <div class="hero-search" @click.stop>
          <svg class="s-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
              v-model="searchQuery"
              class="search-inp"
              placeholder="搜索课程名称、讲师或描述..."
              @input="handleSearchInput"
              @focus="handleSearchFocus"
              @blur="closeSearchSuggestions"
              @keydown.enter="handleSearch"
              @keydown.escape="searchInputFocused = false"
          />
          <button class="search-btn" @click="handleSearch">搜索</button>

          <!-- 搜索建议下拉框（computed 驱动，自动响应） -->
          <transition name="suggestion-fade">
            <div v-if="showSearchSuggestions" class="search-suggestions">
              <div
                  v-for="course in searchSuggestions"
                  :key="`suggestion-${course.id}`"
                  class="suggestion-item"
                  @mousedown.prevent="selectSuggestion(course)"
              >
                <div class="suggestion-content">
                  <div class="suggestion-title" v-html="highlightText(course.title, searchQuery)"></div>
                  <div class="suggestion-meta">
                    <span class="suggestion-category">{{ course.categoryName }} · {{ course.subCategoryName }}</span>
                    <span class="suggestion-instructor">{{ course.instructor }}</span>
                  </div>
                </div>
                <svg class="suggestion-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
              <div class="suggestion-footer">
                <span class="suggestion-hint">按 Enter 查看全部 {{ filteredCourses.length }} 个结果</span>
              </div>
            </div>
          </transition>
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
          <div class="dc-progress"><div class="dc-bar" style="width:68%"/></div>
          <span class="dc-text">学习进度 68%</span>
        </div>
        <div class="deco-card dc3">
          <span class="dc-star">★★★★★</span>
          <span class="dc-text">权威学科体系</span>
        </div>
      </div>
    </section>

    <!-- ═══════════ 主要内容区域 ═══════════ -->
    <section class="main-content">
      <div class="content-wrapper">

        <!-- ═══════════ 左侧一级学科导航 ═══════════ -->
        <aside class="category-sidebar">
          <div class="sidebar-header">
            <span class="sidebar-icon">◈</span>
            <span class="sidebar-title">学科分类</span>
          </div>

          <button
              class="category-item"
              :class="{ active: selectedCategory === -1 }"
              @click="handleCategoryClick(-1)"
          >
            <span class="cat-glyph">◎</span>
            <div class="cat-info">
              <span class="cat-name">全部分类</span>
              <span class="cat-code">ALL</span>
            </div>
            <span class="cat-count">
              {{ categories.reduce((acc, cat) => acc + cat.subCategories?.reduce((a: number, s: any) => a + (s.courses?.length || 0), 0), 0) }}
            </span>
          </button>

          <div class="category-list">
            <div
                v-for="(cat, idx) in (categories || [])"
                :key="`cat-${cat.id}`"
                class="category-group"
            >
              <button
                  class="category-item"
                  :class="{ active: selectedCategory === idx }"
                  @click="handleCategoryClick(idx)"
              >
                <span class="cat-glyph">{{ cat.glyph || '◈' }}</span>
                <div class="cat-info">
                  <span class="cat-name">{{ cat.name }}</span>
                  <span class="cat-code">{{ cat.code }}</span>
                </div>
                <span class="cat-count">{{ cat.subCategories?.reduce((acc: number, sub: any) => acc + (sub.courses?.length || 0), 0) || 0 }}</span>
              </button>

              <transition name="expand">
                <div v-if="selectedCategory === idx" class="subcat-embedded">
                  <div class="subcat-embedded-header">
                    <h4 class="subcat-embedded-title">{{ cat.name }} · 细分方向</h4>
                    <button
                        v-if="selectedSubCategory >= 0"
                        class="clear-btn-embedded"
                        @click="selectedSubCategory = -1"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                      清除选择
                    </button>
                  </div>
                  <div class="subcat-embedded-buttons">
                    <button
                        v-for="(sub, subIdx) in cat.subCategories"
                        :key="`sub-${sub.id}`"
                        class="subcat-btn-embedded"
                        :class="{ active: selectedSubCategory === subIdx }"
                        @click="selectedSubCategory = subIdx"
                    >
                      <span class="subcat-code">{{ sub.code }}</span>
                      <span class="subcat-name">{{ sub.name }}</span>
                      <span class="subcat-count">{{ sub.courses?.length || 0 }}</span>
                    </button>
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </aside>

        <!-- ═══════════ 右侧内容区 ═══════════ -->
        <main class="content-area">
          <section class="courses-section">
            <div class="courses-inner">
              <div class="section-head">
                <h2 class="section-title">
                  {{ selectedCategory < 0 ? '全部课程' :
                    selectedSubCategory >= 0
                        ? `${categories[selectedCategory]?.name} · ${currentSubCategories[selectedSubCategory]?.name}`
                        : `${categories[selectedCategory]?.name} · 全部课程`
                  }}
                  <span class="section-sub" v-if="!isSearching">· {{ filteredCourses.length }} 门课程</span>
                  <span class="section-sub searching-text" v-else>· 找到 {{ filteredCourses.length }} 个相关课程</span>
                </h2>
                <div class="sort-wrap" v-show="!isSearching">
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
                      v-for="course in paginatedCourses"
                      :key="course.id"
                      class="course-card"
                      @click="goToCourse(course.id)"
                      @mouseenter="hoveredCard = course.id"
                      @mouseleave="hoveredCard = null"
                  >
                    <div class="card-thumb" :style="{ background: `linear-gradient(135deg, ${course.accent}28, ${course.accent}0a)` }">
                      <div class="thumb-glyph" :style="{ color: course.accent + '55' }">
                        {{ categories[selectedCategory]?.glyph || '◈' }}
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
                      <h3 class="card-title" v-html="highlightText(course.title, searchQuery)"></h3>
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

                <div v-if="paginatedCourses.length === 0" class="empty-state">
                  <div class="empty-glyph">◌</div>
                  <p>{{ isSearching ? '未找到匹配的课程' : '该分类下暂无课程' }}</p>
                </div>
              </div>

              <!-- ═══════════ 分页控件 ═══════════ -->
              <div v-if="totalPages > 1" class="pagination-container">
                <div class="pagination-info">
                  共 {{ filteredCourses.length }} 门课程 · 第 {{ currentPage }}/{{ totalPages }} 页
                </div>
                <div class="pagination-controls">
                  <button
                      class="page-btn prev-btn"
                      :disabled="currentPage === 1"
                      @click="goToPage(currentPage - 1)"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="15 18 9 12 15 6"/>
                    </svg>
                    上一页
                  </button>

                  <div class="page-numbers">
                    <button
                        v-for="page in pageNumbers"
                        :key="page"
                        class="page-number-btn"
                        :class="{ active: page === currentPage }"
                        @click="goToPage(page)"
                    >
                      {{ page }}
                    </button>
                  </div>

                  <button
                      class="page-btn next-btn"
                      :disabled="currentPage === totalPages"
                      @click="goToPage(currentPage + 1)"
                  >
                    下一页
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </section>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=JetBrains+Mono:wght@300;400;600&family=Noto+Sans+SC:wght@300;400;500;700&display=swap');

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
  min-height: 90vh;
  display: flex;
  align-items: center;
  padding: 10px 150px 80px;
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
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
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

/* ─── Search ──────────────────────────────────────────── */
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
  position: relative;
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
.search-inp:focus { outline: none; }
.search-inp::placeholder { color: rgba(150, 210, 180, 0.5); }
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
  z-index: 2;
  flex-shrink: 0;
}
.search-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 28px rgba(0, 180, 255, 0.5);
}

/* ─── 搜索建议下拉框 ──────────────────────────────────── */
.search-suggestions {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: rgba(8, 24, 46, 0.98);
  border: 1px solid rgba(0, 212, 255, 0.25);
  border-radius: 12px;
  overflow: hidden;
  backdrop-filter: blur(20px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(0, 212, 255, 0.15);
  z-index: 100;
}
.suggestion-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid rgba(0, 212, 255, 0.08);
}
.suggestion-item:last-of-type { border-bottom: none; }
.suggestion-item:hover { background: rgba(0, 212, 255, 0.1); }
.suggestion-content { flex: 1; min-width: 0; }
.suggestion-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #c8f0e0;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.suggestion-title :deep(.highlight) {
  background: rgba(0, 255, 180, 0.2);
  color: #00ffb4;
  padding: 1px 3px;
  border-radius: 3px;
  font-weight: 700;
}
.suggestion-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.75rem;
  color: rgba(150, 210, 180, 0.6);
}
.suggestion-category {
  font-family: 'JetBrains Mono', monospace;
  color: rgba(0, 212, 255, 0.7);
}
.suggestion-instructor { color: rgba(150, 210, 180, 0.5); }
.suggestion-arrow {
  flex-shrink: 0;
  color: rgba(0, 212, 255, 0.5);
  margin-left: 12px;
  transition: all 0.2s;
}
.suggestion-item:hover .suggestion-arrow {
  color: #00d4ff;
  transform: translateX(3px);
}
.suggestion-footer {
  padding: 8px 16px;
  background: rgba(0, 212, 255, 0.04);
  border-top: 1px solid rgba(0, 212, 255, 0.08);
}
.suggestion-hint {
  font-size: 0.72rem;
  color: rgba(150, 210, 180, 0.45);
  font-family: 'JetBrains Mono', monospace;
}

/* ─── 建议框动画 ──────────────────────────────────────── */
.suggestion-fade-enter-active,
.suggestion-fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.suggestion-fade-enter-from,
.suggestion-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* ─── Stats row ───────────────────────────────────────── */
.hero-stats { display: flex; flex-wrap: wrap; }
.hstat {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-right: 36px;
  margin-right: 36px;
  border-right: 1px solid rgba(0, 212, 255, 0.08);
}
.hstat:last-child { border-right: none; padding-right: 0; margin-right: 0; }
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

/* ─── Deco floating cards ─────────────────────────────── */
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
.dc1 { animation: floatCard 5s ease-in-out infinite; }
.dc2 { animation: floatCard 5s ease-in-out infinite -1.7s; }
.dc3 { animation: floatCard 5s ease-in-out infinite -3.4s; }
@keyframes floatCard {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-9px); }
}
.dc-icon { font-size: 1.6rem; }
.dc-star { color: #ffd93d; font-size: 0.82rem; filter: drop-shadow(0 0 6px #ffd93d); }
.dc-progress { width: 90px; height: 4px; background: rgba(0, 212, 255, 0.1); border-radius: 2px; overflow: hidden; }
.dc-bar { height: 100%; border-radius: 2px; background: linear-gradient(90deg, #0060cc, #00d4ff); }
.dc-text { font-size: 0.8rem; color: rgba(150, 210, 180, 0.5); font-family: 'JetBrains Mono', monospace; }

/* ─── 主要内容布局 ────────────────────────────────────── */
.main-content {
  position: relative;
  z-index: 1;
  padding: 60px 80px;
  background: rgba(2, 10, 18, 0.5);
}
.content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 40px;
  align-items: start;
}

/* ─── 左侧分类侧边栏 ──────────────────────────────────── */
.category-sidebar {
  position: sticky;
  top: 80px;
  background: rgba(8, 20, 44, 0.6);
  border: 1px solid rgba(0, 212, 255, 0.12);
  border-radius: 16px;
  padding: 20px 16px;
  backdrop-filter: blur(20px);
}
.sidebar-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid rgba(0, 212, 255, 0.15);
}
.sidebar-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.25);
  border-radius: 8px;
  font-size: 1rem;
  color: #00d4ff;
}
.sidebar-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: #c8f0e0;
  letter-spacing: 0.04em;
}
.category-list { display: flex; flex-direction: column; gap: 12px; }
.category-group { display: flex; flex-direction: column; gap: 8px; }
.category-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(0, 212, 255, 0.03);
  border: 1px solid rgba(0, 212, 255, 0.08);
  cursor: pointer;
  transition: all 0.25s;
  text-align: left;
  width: 100%;
}
.category-item:hover {
  background: rgba(0, 212, 255, 0.08);
  border-color: rgba(0, 212, 255, 0.2);
  transform: translateX(4px);
}
.category-item.active {
  background: rgba(0, 212, 255, 0.12);
  border-color: rgba(0, 212, 255, 0.35);
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.15);
}
.category-item .cat-glyph {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 212, 255, 0.06);
  border: 1px solid rgba(0, 212, 255, 0.12);
  border-radius: 6px;
  font-size: 1rem;
  color: #00d4ff;
  transition: all 0.25s;
}
.category-item.active .cat-glyph {
  background: rgba(0, 212, 255, 0.14);
  border-color: rgba(0, 212, 255, 0.4);
  box-shadow: 0 0 16px rgba(0, 212, 255, 0.4);
}
.category-item .cat-info { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.category-item .cat-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #c8f0e0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.category-item .cat-code {
  font-size: 0.65rem;
  color: rgba(150, 210, 180, 0.6);
  font-family: 'JetBrains Mono', monospace;
}
.category-item .cat-count {
  flex-shrink: 0;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(0, 212, 255, 0.08);
  border: 1px solid rgba(0, 212, 255, 0.15);
  color: rgba(150, 210, 180, 0.7);
}
.category-item.active .cat-count {
  background: rgba(0, 212, 255, 0.18);
  color: #00d4ff;
  border-color: rgba(0, 212, 255, 0.3);
}

/* ─── 嵌入侧边栏的子分类区域 ─────────────────────────── */
.subcat-embedded {
  margin-left: 12px;
  margin-right: 4px;
  padding: 12px 12px 12px 16px;
  background: rgba(0, 212, 255, 0.04);
  border-left: 2px solid rgba(0, 212, 255, 0.3);
  border-radius: 8px;
}
.subcat-embedded-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.subcat-embedded-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  color: #00d4ff;
  margin: 0;
  letter-spacing: 0.03em;
}
.clear-btn-embedded {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 6px;
  color: rgba(255, 107, 107, 0.9);
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.2s;
}
.clear-btn-embedded:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.5);
}
.subcat-embedded-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-height: 240px;
  overflow-y: auto;
  padding-right: 4px;
}
.subcat-btn-embedded {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  background: rgba(0, 212, 255, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.15);
  color: rgba(200, 240, 224, 0.7);
  font-size: 0.75rem;
  font-family: 'JetBrains Mono', monospace;
  cursor: pointer;
  transition: all 0.2s;
}
.subcat-btn-embedded:hover {
  background: rgba(0, 212, 255, 0.12);
  border-color: rgba(0, 212, 255, 0.35);
  color: #c8f0e0;
  transform: translateX(2px);
}
.subcat-btn-embedded.active {
  background: rgba(0, 212, 255, 0.2);
  border-color: #00d4ff;
  color: #00d4ff;
  box-shadow: 0 0 12px rgba(0, 212, 255, 0.2);
}
.subcat-btn-embedded .subcat-code { font-size: 0.65rem; opacity: 0.7; }
.subcat-btn-embedded .subcat-name { font-weight: 500; font-size: 0.75rem; }
.subcat-btn-embedded .subcat-count {
  font-size: 0.65rem;
  background: rgba(0, 0, 0, 0.4);
  padding: 2px 5px;
  border-radius: 999px;
  margin-left: 2px;
}

/* ─── 展开/折叠动画 ───────────────────────────────────── */
.expand-enter-active,
.expand-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ─── 右侧内容区 ──────────────────────────────────────── */
.content-area { min-width: 0; }

/* ─── 课程区域 ────────────────────────────────────────── */
.courses-section {
  position: relative;
  z-index: 1;
  padding: 60px 0 80px;
}
.courses-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 48px;
  /* 固定最小高度，防止课程数量变化时布局跳动卡顿 */
  min-height: 600px;
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
.searching-text { color: rgba(0, 212, 255, 0.7); }
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
.sort-sel:hover { border-color: #00d4ff; }
.sort-sel:focus { outline: none; border-color: #00d4ff; }

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
  gap: 20px;
  /* contain 限制重排范围，避免影响外部布局 */
  contain: layout;
}

/* ─── Course Card ─────────────────────────────────────── */
.course-card {
  background: rgba(8, 20, 44, 0.6);
  border: 1px solid rgba(0, 212, 255, 0.08);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition: transform 0.32s ease, border-color 0.32s ease, box-shadow 0.32s ease;
  position: relative;
  /* 开启 GPU 合成层，隔离卡片动画对父级布局的影响 */
  will-change: transform;
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
.course-card:hover::before { opacity: 1; }

/* Thumbnail */
.card-thumb {
  position: relative;
  height: 168px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.card-thumb::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  opacity: 0.09;
  background-image:
      linear-gradient(rgba(0, 212, 255, 0.6) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 212, 255, 0.6) 1px, transparent 1px);
  background-size: 24px 24px;
}
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
.course-card:hover .thumb-overlay { opacity: 1; }
.preview-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 22px;
  border-radius: 999px;
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
.course-card:hover .accent-line { transform: scaleX(1); }

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
.course-card:hover .card-title { color: #00d4ff; }
.card-title :deep(.highlight) {
  background: rgba(0, 255, 180, 0.18);
  color: #00ffb4;
  padding: 1px 3px;
  border-radius: 3px;
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
.card-meta { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
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
.footer-left { display: flex; flex-direction: column; gap: 2px; }
.rating-row { display: flex; align-items: center; gap: 6px; }
.stars { font-size: 0.78rem; }
.rating-num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.88rem;
  font-weight: 600;
  color: #ffd93d;
}
.students-count { font-size: 0.7rem; color: rgba(150, 210, 180, 0.5); }
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
  transition: filter 0.2s, transform 0.2s;
}
.card-cta:hover { filter: brightness(1.18); transform: translateY(-1px); }

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
  0%, 93%, 100% { transform: none; opacity: 0.15; }
  94% { transform: skewX(-4deg); opacity: 0.25; filter: hue-rotate(90deg); }
  96% { transform: skewX(3deg); opacity: 0.2; }
}

/* ─── SCROLLBAR ───────────────────────────────────────── */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: #020b10; }
::-webkit-scrollbar-thumb { background: rgba(0, 212, 255, 0.2); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: rgba(0, 212, 255, 0.4); }

/* ─── PAGINATION ──────────────────────────────────────── */
.pagination-container {
  margin-top: 48px;
  padding: 24px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.pagination-info {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.82rem;
  color: rgba(150, 210, 180, 0.6);
  letter-spacing: 0.03em;
}
.pagination-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}
.page-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  background: rgba(0, 212, 255, 0.06);
  border: 1px solid rgba(0, 212, 255, 0.18);
  color: rgba(200, 240, 224, 0.85);
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.2s;
}
.page-btn:hover:not(:disabled) {
  background: rgba(0, 212, 255, 0.12);
  border-color: rgba(0, 212, 255, 0.35);
  transform: translateY(-1px);
}
.page-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.page-numbers {
  display: flex;
  gap: 6px;
}
.page-number-btn {
  min-width: 36px;
  height: 36px;
  padding: 0 8px;
  border-radius: 8px;
  background: rgba(0, 212, 255, 0.04);
  border: 1px solid rgba(0, 212, 255, 0.12);
  color: rgba(200, 240, 224, 0.75);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.2s;
}
.page-number-btn:hover {
  background: rgba(0, 212, 255, 0.1);
  border-color: rgba(0, 212, 255, 0.3);
  color: #c8f0e0;
}
.page-number-btn.active {
  background: linear-gradient(135deg, rgba(0, 96, 204, 0.6), rgba(0, 212, 255, 0.6));
  border-color: #00d4ff;
  color: #fff;
  box-shadow: 0 0 16px rgba(0, 212, 255, 0.35);
  font-weight: 600;
}

/* ─── RESPONSIVE ──────────────────────────────────────── */
@media (max-width: 1024px) {
  .main-content { padding: 40px 40px; }
  .content-wrapper { grid-template-columns: 1fr; }
  .category-sidebar { position: relative; top: 0; }
  .category-list { flex-direction: column; }
}
@media (max-width: 768px) {
  .hero { padding: 80px 24px 60px; }
  .hero-deco { display: none; }
  .main-content { padding: 30px 20px; }
  .courses-inner { padding: 0 16px; }
  .category-sidebar { padding: 16px; }
  .subcat-embedded { margin-left: 8px; padding: 10px; }
  .subcat-embedded-buttons { gap: 6px; }
  .subcat-btn-embedded { padding: 4px 8px; font-size: 0.7rem; }
  .pagination-controls {
    flex-wrap: wrap;
    justify-content: center;
  }
  .page-numbers {
    order: -1;
    width: 100%;
    justify-content: center;
    margin-bottom: 8px;
  }
}
</style>