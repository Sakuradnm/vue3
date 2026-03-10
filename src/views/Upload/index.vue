<template>
  <div class="upload-root">
    <canvas class="bg-canvas"></canvas>
    <div class="noise-layer"></div>
    <div class="cursor-glow" :style="{ left: mouseX + 'px', top: mouseY + 'px' }"></div>

    <!-- 导航栏 -->
    <nav class="top-nav">
      <div class="nav-left">
        <div class="nav-logo">
          <svg viewBox="0 0 36 36" width="32" height="32">
            <polygon points="18,2 32,10 32,26 18,34 4,26 4,10" fill="rgba(0,212,255,0.08)" stroke="#00d4ff" stroke-width="1.5"/>
            <polygon points="18,8 27,13 27,23 18,28 9,23 9,13" fill="rgba(0,212,255,0.12)"/>
            <circle cx="18" cy="18" r="3" fill="#00d4ff"/>
          </svg>
          <span class="logo-text">COURSENET<em>.io</em></span>
        </div>
        <button class="back-btn" @click="goBack">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          返回
        </button>
      </div>
      <div class="nav-right">
        <button class="compose-btn" @click="saveDraft">
          <span class="cb-sweep"></span>
          保存草稿
        </button>
        <button class="publish-btn" @click="publish">
          <span class="cb-sweep"></span>
          发布课程
        </button>
      </div>
    </nav>

    <!-- 主体：上传表单 -->
    <div class="upload-main">
      <div class="upload-inner">
        <!-- 左侧主要表单 -->
        <div class="form-left">
          <!-- 基本信息区块 -->
          <div class="content-block fade-up">
            <div class="cb-header">
              <span class="cb-tag">[ BASIC ]</span>
              <h2 class="cb-title">基本信息</h2>
            </div>
            <div class="form-group">
              <label>课程标题 <span class="required">*</span></label>
              <input type="text" v-model="form.title" placeholder="例：新手驾驶入门" class="form-input">
            </div>
            <div class="form-group">
              <label>副标题</label>
              <input type="text" v-model="form.subtitle" placeholder="简短有力的描述" class="form-input">
            </div>
            <div class="form-row">
              <div class="form-group half">
                <label>价格 (¥) <span class="required">*</span></label>
                <input type="number" v-model="form.price" placeholder="299" class="form-input">
              </div>
              <div class="form-group half">
                <label>原价</label>
                <input type="number" v-model="form.originalPrice" placeholder="599" class="form-input">
              </div>
            </div>
            <div class="form-group">
              <label>难度等级</label>
              <div class="level-selector">
                <button v-for="level in levels" :key="level" class="level-btn"
                        :class="{ active: form.level === level }"
                        @click="form.level = level">{{ level }}</button>
              </div>
            </div>
            <div class="form-group">
              <label>课程描述</label>
              <textarea v-model="form.description" rows="4" placeholder="详细介绍课程内容……" class="form-input"></textarea>
            </div>
          </div>

          <!-- 课程大纲区块 (章节 + 视频) -->
          <div class="content-block fade-up">
            <div class="cb-header">
              <span class="cb-tag">[ CURRICULUM ]</span>
              <h2 class="cb-title">课程大纲</h2>
            </div>
            <div v-for="(chapter, cIdx) in form.chapters" :key="cIdx" class="chapter-card">
              <div class="chapter-header">
                <span class="chapter-number">第 {{ cIdx + 1 }} 章</span>
                <input type="text" v-model="chapter.title" placeholder="章节标题" class="chapter-title-input">
                <button class="remove-chapter" @click="removeChapter(cIdx)" v-if="form.chapters.length > 1">✕</button>
              </div>
              <div class="chapter-meta">
                <span class="meta-item">课时数: {{ chapter.videos.length }}</span>
                <span class="meta-item">总时长: {{ chapterTotalDuration(chapter) }}</span>
              </div>
              <div class="videos-list">
                <div v-for="(video, vIdx) in chapter.videos" :key="vIdx" class="video-item">
                  <span class="video-number">{{ cIdx + 1 }}.{{ vIdx + 1 }}</span>
                  <input type="text" v-model="video.title" placeholder="视频标题" class="video-title-input">
                  <input type="text" v-model="video.duration" placeholder="时长 (例：15:30)" class="video-duration-input">
                  <label class="free-checkbox">
                    <input type="checkbox" v-model="video.isFree">
                    <span class="free-label">免费</span>
                  </label>
                  <button class="remove-video" @click="removeVideo(cIdx, vIdx)" v-if="chapter.videos.length > 1">✕</button>
                </div>
              </div>
              <button class="add-video" @click="addVideo(cIdx)">+ 添加视频</button>
            </div>
            <button class="add-chapter" @click="addChapter">+ 添加章节</button>
          </div>
        </div>

        <!-- 右侧发布卡 -->
        <aside class="sidebar-right">
          <div class="sidebar-card fade-up">
            <div class="sc-tag">[ PUBLISH ]</div>
            <h3 class="sc-title">发布预览</h3>
            <div class="price-preview">
              <span class="preview-current">¥{{ form.price }}</span>
              <span class="preview-original" v-if="form.originalPrice">¥{{ form.originalPrice }}</span>
              <span class="preview-badge" v-if="form.originalPrice">{{ discount }}折</span>
            </div>
            <div class="preview-stats">
              <div class="stat-item"><span class="stat-label">章节</span> {{ form.chapters.length }}</div>
              <div class="stat-item"><span class="stat-label">视频</span> {{ totalVideos }}</div>
              <div class="stat-item"><span class="stat-label">难度</span> {{ form.level }}</div>
            </div>
            <button class="publish-btn large" @click="publish">
              <span class="cb-sweep"></span>
              发布课程
            </button>
            <button class="draft-btn" @click="saveDraft">
              保存草稿
            </button>
            <div class="sc-tip">
              <span class="tip-icon">◉</span> 填写所有带 <span class="required">*</span> 的字段
            </div>
          </div>

          <div class="sidebar-card fade-up">
            <div class="sc-tag">[ TIPS ]</div>
            <h3 class="sc-title">上传提示</h3>
            <ul class="tip-list">
              <li>✓ 标题建议 5-20 字</li>
              <li>✓ 视频时长格式 mm:ss</li>
              <li>✓ 免费课可以吸引学员</li>
              <li>✓ 可随时保存草稿</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const mouseX = ref(0)
const mouseY = ref(0)
let particleRafId: number | null = null
let observers: IntersectionObserver[] = []

const levels = ['初级', '中级', '高级']

const form = ref({
  title: '',
  subtitle: '',
  price: 299,
  originalPrice: 599,
  level: '初级',
  description: '',
  objectives: ['掌握车辆基本操控', '理解核心交通规则'],
  requirements: ['年满 18 周岁', '持有学习驾照'],
  chapters: [
    {
      title: '第一章：驾驶基础认知',
      videos: [
        { title: '车辆仪表盘逐项解读', duration: '15:30', isFree: true },
        { title: '座椅与后视镜的精确调整', duration: '12:45', isFree: false },
      ]
    }
  ],
  instructor: {
    name: '张教练',
    title: '国家一级驾驶教练 · 前职业赛车手',
    bio: '拥有 15 年驾驶教学经验，累计培训学员超过 5000 人。'
  }
})

const discount = computed(() => {
  if (!form.value.originalPrice) return ''
  return ((form.value.price / form.value.originalPrice) * 10).toFixed(1)
})

const totalVideos = computed(() => {
  return form.value.chapters.reduce((acc, ch) => acc + ch.videos.length, 0)
})

function chapterTotalDuration(chapter: any) {
  // 简单模拟：返回总分钟数估算，实际可计算mm:ss总和
  let totalSec = 0
  chapter.videos.forEach((v: any) => {
    const parts = v.duration.split(':')
    if (parts.length === 2) {
      totalSec += parseInt(parts[0]) * 60 + parseInt(parts[1])
    }
  })
  const mins = Math.floor(totalSec / 60)
  const secs = totalSec % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function addObjective() { form.value.objectives.push('') }
function removeObjective(idx: number) { form.value.objectives.splice(idx, 1) }
function addRequirement() { form.value.requirements.push('') }
function removeRequirement(idx: number) { form.value.requirements.splice(idx, 1) }

function addChapter() {
  form.value.chapters.push({ title: '新章节', videos: [{ title: '', duration: '', isFree: false }] })
}
function removeChapter(idx: number) { form.value.chapters.splice(idx, 1) }
function addVideo(chapterIdx: number) {
  form.value.chapters[chapterIdx].videos.push({ title: '', duration: '', isFree: false })
}
function removeVideo(chapterIdx: number, videoIdx: number) {
  form.value.chapters[chapterIdx].videos.splice(videoIdx, 1)
}

function saveDraft() {
  // 模拟保存草稿
  alert('草稿已保存')
}
function publish() {
  // 模拟发布
  alert('课程发布成功！')
}
function goBack() { router.back() }

// 初始化粒子背景（复制自课程详情页）
function initParticles(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!
  let W = window.innerWidth, H = window.innerHeight
  canvas.width = W; canvas.height = H
  const count = Math.floor((W * H) / 12000)
  const pts = Array.from({ length: count }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.18, vy: (Math.random() - 0.5) * 0.18,
    r: Math.random() * 1.1 + 0.3,
    alpha: Math.random() * 0.35 + 0.08,
    color: ['0,255,180', '0,200,255', '80,255,200'][Math.floor(Math.random() * 3)],
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
  window.addEventListener('resize', () => {
    W = window.innerWidth; H = window.innerHeight
    canvas.width = W; canvas.height = H
  })
}

function initObservers(root: Element) {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
  }, { threshold: 0.08 })
  root.querySelectorAll('.fade-up').forEach(el => obs.observe(el))
  observers.push(obs)
}

function onMouseMove(e: MouseEvent) {
  mouseX.value = e.clientX
  mouseY.value = e.clientY
}

onMounted(() => {
  const root = document.querySelector('.upload-root')!
  const canvas = root.querySelector('.bg-canvas') as HTMLCanvasElement
  if (canvas) initParticles(canvas)
  if (root) initObservers(root)
  window.addEventListener('mousemove', onMouseMove)
})

onUnmounted(() => {
  if (particleRafId) cancelAnimationFrame(particleRafId)
  observers.forEach(o => o.disconnect())
  window.removeEventListener('mousemove', onMouseMove)
})
</script>

<style scoped>
/* 完全复用课程详情页的基础样式，并添加表单特有样式 */
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=JetBrains+Mono:wght@300;400;600&family=Noto+Sans+SC:wght@300;400;500;700&display=swap');

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.upload-root {
  background: #020b10;
  color: #c8f0e0;
  font-family: 'Noto Sans SC', sans-serif;
  min-height: 100vh;
  overflow-x: hidden;
  position: relative;
}

/* 背景层 */
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

/* 淡入动画 */
.fade-up {
  opacity: 0; transform: translateY(22px);
  transition: opacity 0.7s cubic-bezier(0.25,1,0.5,1), transform 0.7s cubic-bezier(0.25,1,0.5,1);
}
.fade-up.visible { opacity:1; transform:translateY(0); }

/* 导航栏 (复用) */
.top-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 200; height: 64px;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 48px;
  background: rgba(2,4,8,0.82); backdrop-filter: blur(24px);
  border-bottom: 1px solid rgba(0,212,255,0.08);
}
.nav-left { display: flex; align-items: center; gap: 18px; }
.nav-logo { display: flex; align-items: center; gap: 10px; font-family: 'Orbitron', sans-serif; font-size: 1.1rem; font-weight: 700; letter-spacing: 0.1em; color: #c8f0e0; flex-shrink: 0; }
.logo-text em { font-style: normal; color: #00d4ff; }
.back-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 16px; border-radius: 9px;
  background: rgba(0,212,255,0.06); border: 1px solid rgba(0,212,255,0.08);
  color: rgba(150,210,180,0.35); font-family: 'Noto Sans SC', sans-serif; font-size: 0.84rem; cursor: pointer;
  transition: all 0.2s;
}
.back-btn:hover { color: #c8f0e0; background: rgba(0,212,255,0.1); border-color: rgba(0,212,255,0.22); }
.nav-right { display: flex; align-items: center; gap: 12px; }
.compose-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 9px 22px; border-radius: 9px; border: none; cursor: pointer;
  background: linear-gradient(135deg, #0060cc, #00d4ff); color: #fff;
  font-family: 'Noto Sans SC', sans-serif; font-size: 0.88rem; font-weight: 600;
  position: relative; overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,180,255,0.3); transition: all 0.25s;
}
.compose-btn:hover { box-shadow: 0 8px 30px rgba(0,180,255,0.5); transform: translateY(-1px); }
.publish-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 9px 22px; border-radius: 9px; border: none; cursor: pointer;
  background: linear-gradient(135deg, #00a07a, #00ff9d); color: #000;
  font-family: 'Noto Sans SC', sans-serif; font-size: 0.88rem; font-weight: 600;
  position: relative; overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,255,157,0.3); transition: all 0.25s;
}
.publish-btn:hover { box-shadow: 0 8px 30px rgba(0,255,157,0.5); transform: translateY(-1px); }
.cb-sweep {
  position: absolute; top: 0; left: -100%; width: 60%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
  transition: left 0.5s cubic-bezier(0.25,1,0.5,1);
}
.compose-btn:hover .cb-sweep,
.publish-btn:hover .cb-sweep { left: 150%; }

/* 主内容区域 */
.upload-main {
  position: relative; z-index: 2;
  padding: 84px 48px 48px;
  max-width: 1400px;
  margin: 0 auto;
}
.upload-inner {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 32px;
  align-items: start;
}

/* 左侧表单区域 */
.form-left {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 内容块 (复用课程详情页 .content-block) */
.content-block {
  background: rgba(8,20,44,0.6); border: 1px solid rgba(0,212,255,0.08);
  border-radius: 12px; padding: 24px 28px; margin-bottom: 0;
  transition: border-color 0.2s;
}
.content-block:hover { border-color: rgba(0,212,255,0.22); }
.cb-header { margin-bottom: 18px; }
.cb-tag { font-family: 'JetBrains Mono', monospace; font-size: 0.68rem; letter-spacing: 0.14em; color: #00d4ff; opacity: 0.7; display: block; margin-bottom: 4px; }
.cb-title { font-family: 'Orbitron', sans-serif; font-size: 1.1rem; font-weight: 600; letter-spacing: 0.04em; color: #c8f0e0; }

/* 表单元素 */
.form-group {
  margin-bottom: 20px;
}
.form-group label {
  display: block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  color: rgba(150,210,180,0.35);
  margin-bottom: 6px;
  letter-spacing: 0.04em;
}
.required {
  color: #ff6b6b;
}
.form-input {
  width: 100%;
  padding: 12px 16px;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(0,212,255,0.1);
  border-radius: 8px;
  color: #c8f0e0;
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 0.9rem;
  transition: all 0.2s;
}
.form-input:focus {
  outline: none;
  border-color: rgba(0,212,255,0.4);
  box-shadow: 0 0 0 2px rgba(0,212,255,0.1);
}
textarea.form-input {
  resize: vertical;
  line-height: 1.6;
}
.form-row {
  display: flex;
  gap: 16px;
}
.half {
  flex: 1;
}

/* 难度选择器 */
.level-selector {
  display: flex;
  gap: 8px;
}
.level-btn {
  flex: 1;
  padding: 10px;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(0,212,255,0.1);
  border-radius: 8px;
  color: rgba(150,210,180,0.35);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}
.level-btn.active {
  background: rgba(0,212,255,0.15);
  border-color: rgba(0,212,255,0.4);
  color: #00d4ff;
  box-shadow: 0 0 10px rgba(0,212,255,0.2);
}

/* 列表项 (目标/要求) */
.list-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.list-input {
  flex: 1;
}
.remove-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: rgba(255,107,107,0.1);
  border: 1px solid rgba(255,107,107,0.2);
  color: #ff8a8a;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.remove-btn:hover {
  background: rgba(255,107,107,0.2);
  border-color: rgba(255,107,107,0.4);
  color: #ff6b6b;
}
.add-btn {
  background: transparent;
  border: 1px dashed rgba(0,212,255,0.2);
  border-radius: 8px;
  padding: 10px;
  color: rgba(0,212,255,0.6);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  width: 100%;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 4px;
}
.add-btn:hover {
  border-color: rgba(0,212,255,0.4);
  color: #00d4ff;
  background: rgba(0,212,255,0.02);
}

/* 章节卡片 */
.chapter-card {
  background: rgba(0,0,0,0.2);
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid rgba(0,212,255,0.08);
}
.chapter-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}
.chapter-number {
  font-family: 'Orbitron', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  color: #00d4ff;
  letter-spacing: 0.08em;
  white-space: nowrap;
  padding: 4px 10px;
  background: rgba(0,212,255,0.08);
  border-radius: 6px;
  border: 1px solid rgba(0,212,255,0.15);
}
.chapter-title-input {
  flex: 1;
  padding: 8px 12px;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(0,212,255,0.1);
  border-radius: 6px;
  color: #c8f0e0;
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 0.85rem;
}
.remove-chapter {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: rgba(255,107,107,0.1);
  border: 1px solid rgba(255,107,107,0.2);
  color: #ff8a8a;
  cursor: pointer;
}
.chapter-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  color: rgba(150,210,180,0.35);
}
.videos-list {
  margin-bottom: 12px;
}
.video-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.video-number {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  color: rgba(0,212,255,0.6);
  letter-spacing: 0.04em;
  white-space: nowrap;
  padding: 4px 8px;
  background: rgba(0,212,255,0.04);
  border-radius: 4px;
  min-width: 42px;
  text-align: center;
}
.video-title-input {
  flex: 2;
  padding: 6px 10px;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(0,212,255,0.1);
  border-radius: 6px;
  color: #c8f0e0;
  font-size: 0.8rem;
}
.video-duration-input {
  width: 70px;
  padding: 6px 10px;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(0,212,255,0.1);
  border-radius: 6px;
  color: #c8f0e0;
  font-size: 0.8rem;
  text-align: center;
}
.free-checkbox {
  display: flex;
  align-items: center;
  gap: 4px;
  color: rgba(150,210,180,0.35);
  font-size: 0.75rem;
}
.free-label {
  cursor: pointer;
}
.remove-video {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background: rgba(255,107,107,0.1);
  border: 1px solid rgba(255,107,107,0.2);
  color: #ff8a8a;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.add-video, .add-chapter {
  background: transparent;
  border: 1px dashed rgba(0,212,255,0.2);
  border-radius: 6px;
  padding: 8px;
  color: rgba(0,212,255,0.6);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  width: 100%;
  cursor: pointer;
  margin-top: 8px;
}
.add-video:hover, .add-chapter:hover {
  border-color: rgba(0,212,255,0.4);
  color: #00d4ff;
}
.add-chapter {
  margin-top: 0;
}

/* 右侧发布卡 */
.sidebar-right {
  display: flex;
  flex-direction: column;
  gap: 14px;
  position: sticky;
  top: 84px;
}
.sidebar-card {
  background: rgba(8,20,44,0.6); border: 1px solid rgba(0,212,255,0.08);
  border-radius: 12px; padding: 20px 22px; position: relative;
}
.sc-tag { font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; letter-spacing: 0.18em; color: #00d4ff; opacity: 0.65; margin-bottom: 6px; display: flex; align-items: center; gap: 8px; }
.sc-tag::before { content:''; display:block; width:14px; height:1px; background:#00d4ff; opacity:0.7; }
.sc-title { font-family: 'Orbitron', sans-serif; font-size: 0.9rem; font-weight: 600; letter-spacing: 0.06em; color: #c8f0e0; margin-bottom: 14px; }

.price-preview {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 16px;
}
.preview-current {
  font-family: 'JetBrains Mono', monospace;
  font-size: 2rem;
  color: #fff;
}
.preview-original {
  font-family: 'JetBrains Mono', monospace;
  font-size: 1rem;
  color: rgba(255,255,255,0.25);
  text-decoration: line-through;
}
.preview-badge {
  padding: 2px 8px;
  background: rgba(255,107,53,0.15);
  border: 1px solid rgba(255,107,53,0.3);
  color: #ff8a4c;
  border-radius: 6px;
  font-size: 0.7rem;
  font-family: 'JetBrains Mono', monospace;
}
.preview-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  background: rgba(0,0,0,0.2);
  padding: 12px;
  border-radius: 8px;
}
.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9rem;
  color: #c8f0e0;
}
.stat-label {
  font-size: 0.6rem;
  color: rgba(150,210,180,0.35);
  letter-spacing: 0.06em;
}
.publish-btn.large {
  width: 100%;
  padding: 14px;
  font-size: 1rem;
  margin-bottom: 8px;
  justify-content: center;
}
.draft-btn {
  width: 100%;
  padding: 12px;
  background: transparent;
  border: 1px solid rgba(0,212,255,0.2);
  border-radius: 8px;
  color: rgba(0,212,255,0.6);
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}
.draft-btn:hover {
  border-color: rgba(0,212,255,0.4);
  color: #00d4ff;
}
.sc-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 16px;
  font-size: 0.7rem;
  color: rgba(150,210,180,0.35);
  font-family: 'JetBrains Mono', monospace;
}
.tip-icon {
  color: #00d4ff;
}
.tip-list {
  list-style: none;
}
.tip-list li {
  font-size: 0.75rem;
  color: rgba(150,210,180,0.6);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.tip-list li::before {
  content: "➤";
  color: #00d4ff;
  font-size: 0.6rem;
}

/* 响应式 */
@media (max-width: 1100px) {
  .upload-inner {
    grid-template-columns: 1fr;
  }
  .sidebar-right {
    position: static;
  }
}
@media (max-width: 768px) {
  .top-nav { padding: 0 20px; }
  .upload-main { padding: 84px 20px 40px; }
  .form-row { flex-direction: column; gap: 0; }
  .video-item { flex-wrap: wrap; }
  .video-title-input { flex: 1 1 100%; }
}
</style>
