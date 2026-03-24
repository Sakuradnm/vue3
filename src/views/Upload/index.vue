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

    <!-- 主体 -->
    <div class="upload-main">
      <div class="upload-inner">

        <!-- 左侧主要表单 -->
        <div class="form-left">

          <!-- 基本信息 -->
          <div class="content-block fade-up">
            <div class="cb-header">
              <span class="cb-tag">[ BASIC INFO ]</span>
              <h2 class="cb-title">基本信息</h2>
            </div>
            <div class="form-group">
              <label>课程标题 <span class="required">*</span></label>
              <input type="text" v-model="form.title" placeholder="例：新手驾驶入门完全指南" class="form-input" maxlength="50">
              <div class="input-hint">{{ form.title.length }} / 50 字</div>
            </div>
            <div class="form-group">
              <label>难度等级</label>
              <div class="level-selector">
                <button v-for="level in levels" :key="level" class="level-btn"
                        :class="{ active: form.level === level }"
                        @click="form.level = level">{{ level }}</button>
              </div>
            </div>
            <div class="form-group" style="margin-bottom:0">
              <label>课程描述 <span class="required">*</span></label>
              <textarea v-model="form.description" rows="5" placeholder="详细介绍课程内容、学习目标及适合人群……" class="form-input"></textarea>
            </div>
          </div>

          <!-- 课程大纲 -->
          <div class="content-block fade-up">
            <div class="cb-header">
              <span class="cb-tag">[ CURRICULUM ]</span>
              <h2 class="cb-title">课程大纲</h2>
            </div>

            <div v-for="(chapter, cIdx) in form.chapters" :key="cIdx" class="chapter-card">
              <div class="chapter-header">
                <div class="chapter-number-badge">
                  <span class="chapter-num-text">CH {{ String(cIdx + 1).padStart(2, '0') }}</span>
                </div>
                <input type="text" v-model="chapter.title" placeholder="章节标题" class="chapter-title-input">
                <button class="remove-chapter" @click="removeChapter(cIdx)" v-if="form.chapters.length > 1" title="删除章节">✕</button>
              </div>

              <div class="chapter-meta">
                <span class="meta-item">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  课时 {{ chapter.videos.length }}
                </span>
                <span class="meta-item">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  总时长 {{ chapterTotalDuration(chapter) }}
                </span>
                <span class="meta-item" v-if="chapter.files && chapter.files.length">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  文件 {{ chapter.files.length }}
                </span>
              </div>

              <!-- 视频列表 -->
              <div class="videos-list">
                <div v-for="(video, vIdx) in chapter.videos" :key="'v'+vIdx" class="video-item">
                  <div class="vi-left">
                    <span class="video-type-icon video">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    </span>
                    <span class="video-number">{{ cIdx + 1 }}.{{ String(vIdx + 1).padStart(2,'0') }}</span>
                    <input type="text" v-model="video.title" placeholder="视频标题" class="video-title-input">
                  </div>
                  <div class="vi-right">
                    <input type="text" v-model="video.duration" placeholder="mm:ss" class="video-duration-input">
                    <label class="upload-file-trigger" :class="{ uploaded: video.fileName }" :title="video.fileName || '上传视频文件'">
                      <input type="file" accept="video/*" @change="(e) => handleVideoFileChange(e, cIdx, vIdx)" style="display:none">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      <span class="ufm-label">{{ video.fileName ? shortFileName(video.fileName) : '上传' }}</span>
                    </label>
                    <button class="remove-video" @click="removeVideo(cIdx, vIdx)" v-if="chapter.videos.length > 1" title="删除">✕</button>
                  </div>
                </div>
              </div>

              <!-- PDF 文件列表 -->
              <div class="files-list" v-if="chapter.files && chapter.files.length">
                <div v-for="(file, fIdx) in chapter.files" :key="'f'+fIdx" class="file-item">
                  <div class="fi-left">
                    <span class="video-type-icon pdf">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                    </span>
                    <input type="text" v-model="file.title" placeholder="文件标题" class="video-title-input">
                  </div>
                  <div class="fi-right">
                    <span class="file-name-tag">{{ shortFileName(file.fileName) }}</span>
                    <button class="remove-video" @click="removeFile(cIdx, fIdx)" title="删除">✕</button>
                  </div>
                </div>
              </div>

              <!-- 添加按钮行 -->
              <div class="chapter-actions">
                <button class="add-video" @click="addVideo(cIdx)">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  添加视频
                </button>
                <label class="add-pdf-trigger">
                  <input type="file" accept=".pdf,application/pdf" @change="(e) => handlePdfFileChange(e, cIdx)" style="display:none" multiple>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  上传 PDF
                </label>
              </div>
            </div>

            <button class="add-chapter" @click="addChapter">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              添加章节
            </button>
          </div>
        </div>

        <!-- 右侧预览卡 -->
        <aside class="sidebar-right">

          <!-- 发布预览卡 -->
          <div class="sidebar-card preview-card fade-up">
            <div class="sc-tag">[ PREVIEW ]</div>
            <h3 class="sc-title">发布预览</h3>

            <!-- 课程名称预览 -->
            <div class="preview-title-area">
              <div class="preview-level-badge">{{ form.level }}</div>
              <p class="preview-course-title">{{ form.title || '请输入课程标题…' }}</p>
            </div>

            <!-- 描述预览 -->
            <div class="preview-desc-area" v-if="form.description">
              <p class="preview-desc-text">{{ truncatedDescription }}</p>
              <span class="preview-more" v-if="form.description.length > 80">…展开</span>
            </div>
            <div class="preview-desc-area empty" v-else>
              <p class="preview-desc-text placeholder">课程描述将在这里显示</p>
            </div>

            <!-- 大纲预览 -->
            <div class="preview-outline">
              <div class="po-header">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                课程大纲
              </div>
              <div v-for="(chapter, cIdx) in previewChapters" :key="cIdx" class="po-chapter">
                <div class="po-chapter-title">
                  <span class="po-ch-num">{{ String(cIdx + 1).padStart(2,'0') }}</span>
                  {{ chapter.title || '未命名章节' }}
                </div>
                <div class="po-videos">
                  <div v-for="(v, vIdx) in chapter.videos.slice(0, 2)" :key="vIdx" class="po-video-item">
                    <span class="po-dot video"></span>
                    <span class="po-v-title">{{ v.title || '未命名视频' }}</span>
                    <span class="po-dur" v-if="v.duration">{{ v.duration }}</span>
                  </div>
                  <div class="po-more" v-if="chapter.videos.length > 2">+{{ chapter.videos.length - 2 }} 个课时</div>
                  <div class="po-more pdf-more" v-if="chapter.files && chapter.files.length">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    {{ chapter.files.length }} 份 PDF 文件
                  </div>
                </div>
              </div>
              <div class="po-more-chapters" v-if="form.chapters.length > 2">
                还有 {{ form.chapters.length - 2 }} 个章节未显示
              </div>
            </div>

            <!-- 统计栏 -->
            <div class="preview-stats">
              <div class="stat-item">
                <span class="stat-val">{{ form.chapters.length }}</span>
                <span class="stat-label">章节</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <span class="stat-val">{{ totalVideos }}</span>
                <span class="stat-label">视频</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <span class="stat-val">{{ totalFiles }}</span>
                <span class="stat-label">文件</span>
              </div>
            </div>

            <button class="publish-btn large" @click="publish">
              <span class="cb-sweep"></span>
              发布课程
            </button>
            <button class="draft-btn" @click="saveDraft">保存草稿</button>
          </div>

          <!-- 提示卡 -->
          <div class="sidebar-card fade-up">
            <div class="sc-tag">[ TIPS ]</div>
            <h3 class="sc-title">上传提示</h3>
            <ul class="tip-list">
              <li>标题建议 5–30 字，清晰描述内容</li>
              <li>视频时长格式 mm:ss，例如 15:30</li>
              <li>支持 mp4、mov 等主流视频格式</li>
              <li>上传视频后将自动读取时长</li>
              <li>PDF 文件建议用作配套讲义资料</li>
              <li>可随时保存草稿，稍后继续编辑</li>
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

interface VideoItem {
  title: string
  duration: string
  fileName?: string
  file?: File
}

interface FileItem {
  title: string
  fileName: string
  file: File
}

interface Chapter {
  title: string
  videos: VideoItem[]
  files: FileItem[]
}

const form = ref<{
  title: string
  level: string
  description: string
  chapters: Chapter[]
}>({
  title: '',
  level: '初级',
  description: '',
  chapters: [
    {
      title: '第一章：驾驶基础认知',
      videos: [
        { title: '车辆仪表盘逐项解读', duration: '15:30' },
        { title: '座椅与后视镜的精确调整', duration: '12:45' },
      ],
      files: []
    }
  ]
})

// ─── 计算属性 ───
const truncatedDescription = computed(() => form.value.description.slice(0, 80))
const previewChapters = computed(() => form.value.chapters.slice(0, 2))
const totalVideos = computed(() => form.value.chapters.reduce((acc, ch) => acc + ch.videos.length, 0))
const totalFiles = computed(() => form.value.chapters.reduce((acc, ch) => acc + (ch.files?.length || 0), 0))

// ─── 工具函数 ───
function shortFileName(name: string) {
  if (!name) return ''
  if (name.length <= 12) return name
  const ext = name.split('.').pop()
  return name.slice(0, 8) + '…' + (ext ? '.' + ext : '')
}

function chapterTotalDuration(chapter: Chapter) {
  let totalSec = 0
  chapter.videos.forEach(v => {
    const parts = v.duration.split(':')
    if (parts.length === 2) {
      totalSec += (parseInt(parts[0]) || 0) * 60 + (parseInt(parts[1]) || 0)
    }
  })
  if (totalSec === 0) return '—'
  const mins = Math.floor(totalSec / 60)
  const secs = totalSec % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// ─── 章节 / 视频 / 文件操作 ───
function addChapter() {
  form.value.chapters.push({
    title: `第 ${form.value.chapters.length + 1} 章`,
    videos: [{ title: '', duration: '' }],
    files: []
  })
}
function removeChapter(idx: number) { form.value.chapters.splice(idx, 1) }
function addVideo(chapterIdx: number) {
  form.value.chapters[chapterIdx].videos.push({ title: '', duration: '' })
}
function removeVideo(chapterIdx: number, videoIdx: number) {
  form.value.chapters[chapterIdx].videos.splice(videoIdx, 1)
}
function removeFile(chapterIdx: number, fileIdx: number) {
  form.value.chapters[chapterIdx].files.splice(fileIdx, 1)
}

// ─── 文件上传处理 ───
function handleVideoFileChange(e: Event, chapterIdx: number, videoIdx: number) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const video = form.value.chapters[chapterIdx].videos[videoIdx]
  video.fileName = file.name
  video.file = file
  // 自动读取视频时长
  const url = URL.createObjectURL(file)
  const vid = document.createElement('video')
  vid.preload = 'metadata'
  vid.onloadedmetadata = () => {
    const sec = Math.floor(vid.duration)
    video.duration = `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, '0')}`
    URL.revokeObjectURL(url)
  }
  vid.src = url
  input.value = ''
}

function handlePdfFileChange(e: Event, chapterIdx: number) {
  const input = e.target as HTMLInputElement
  const files = input.files
  if (!files || !files.length) return
  if (!form.value.chapters[chapterIdx].files) form.value.chapters[chapterIdx].files = []
  Array.from(files).forEach(file => {
    form.value.chapters[chapterIdx].files.push({
      title: file.name.replace(/\.pdf$/i, ''),
      fileName: file.name,
      file
    })
  })
  input.value = ''
}

function saveDraft() { alert('草稿已保存') }
function publish() {
  if (!form.value.title.trim()) { alert('请填写课程标题'); return }
  if (!form.value.description.trim()) { alert('请填写课程描述'); return }
  alert('课程发布成功！')
}
function goBack() { router.back() }

// ─── 粒子背景 ───
function initParticles(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!
  let W = window.innerWidth, H = window.innerHeight
  canvas.width = W; canvas.height = H
  const count = Math.floor((W * H) / 12000)
  const pts = Array.from({ length: count }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.18, vy: (Math.random() - 0.5) * 0.18,
    r: Math.random() * 1.1 + 0.3, alpha: Math.random() * 0.35 + 0.08,
    color: ['0,255,180', '0,200,255', '80,255,200'][Math.floor(Math.random() * 3)],
  }))
  function draw() {
    ctx.clearRect(0, 0, W, H)
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y
        const d = Math.sqrt(dx * dx + dy * dy)
        if (d < 110) {
          ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y)
          ctx.strokeStyle = `rgba(0,255,180,${0.04 * (1 - d / 110)})`; ctx.lineWidth = 0.4; ctx.stroke()
        }
      }
      const p = pts[i]; p.x += p.vx; p.y += p.vy
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${p.color},${p.alpha})`; ctx.fill()
    }
    particleRafId = requestAnimationFrame(draw)
  }
  draw()
  window.addEventListener('resize', () => {
    W = window.innerWidth; H = window.innerHeight; canvas.width = W; canvas.height = H
  })
}

function initObservers(root: Element) {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
  }, { threshold: 0.05 })
  root.querySelectorAll('.fade-up').forEach(el => obs.observe(el))
  observers.push(obs)
}

function onMouseMove(e: MouseEvent) { mouseX.value = e.clientX; mouseY.value = e.clientY }

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
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=JetBrains+Mono:wght@300;400;600&family=Noto+Sans+SC:wght@300;400;500;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.upload-root {
  background: #020b10; color: #c8f0e0;
  font-family: 'Noto Sans SC', sans-serif;
  min-height: 100vh; overflow-x: hidden; position: relative;
}

/* ─── 背景层 ─── */
.bg-canvas { position: fixed; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; }
.noise-layer {
  position: fixed; inset: 0; z-index: 1; pointer-events: none; opacity: 0.022;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 180px;
}
.cursor-glow {
  position: fixed; z-index: 1; width: 500px; height: 500px;
  transform: translate(-50%,-50%);
  background: radial-gradient(circle, rgba(0,255,180,0.028) 0%, transparent 55%);
  pointer-events: none; transition: left 0.07s, top 0.07s;
}

/* ─── 动画 ─── */
.fade-up {
  opacity: 0; transform: translateY(22px);
  transition: opacity 0.7s cubic-bezier(0.25,1,0.5,1), transform 0.7s cubic-bezier(0.25,1,0.5,1);
}
.fade-up.visible { opacity: 1; transform: translateY(0); }

/* ─── 导航 ─── */
.top-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 200; height: 64px;
  display: flex; align-items: center; justify-content: space-between; padding: 0 48px;
  background: rgba(2,4,8,0.82); backdrop-filter: blur(24px);
  border-bottom: 1px solid rgba(0,212,255,0.08);
}
.nav-left { display: flex; align-items: center; gap: 18px; }
.nav-logo {
  display: flex; align-items: center; gap: 10px;
  font-family: 'Orbitron', sans-serif; font-size: 1.1rem; font-weight: 700;
  letter-spacing: 0.1em; color: #c8f0e0; flex-shrink: 0;
}
.logo-text em { font-style: normal; color: #00d4ff; }
.back-btn {
  display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 9px;
  background: rgba(0,212,255,0.06); border: 1px solid rgba(0,212,255,0.08);
  color: rgba(150,210,180,0.45); font-family: 'Noto Sans SC', sans-serif;
  font-size: 0.84rem; cursor: pointer; transition: all 0.2s;
}
.back-btn:hover { color: #c8f0e0; background: rgba(0,212,255,0.1); border-color: rgba(0,212,255,0.22); }
.nav-right { display: flex; align-items: center; gap: 12px; }
.compose-btn {
  display: flex; align-items: center; gap: 6px; padding: 9px 22px; border-radius: 9px;
  border: none; cursor: pointer;
  background: linear-gradient(135deg, #0060cc, #00d4ff); color: #fff;
  font-family: 'Noto Sans SC', sans-serif; font-size: 0.88rem; font-weight: 600;
  position: relative; overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,180,255,0.3); transition: all 0.25s;
}
.compose-btn:hover { box-shadow: 0 8px 30px rgba(0,180,255,0.5); transform: translateY(-1px); }
.publish-btn {
  display: flex; align-items: center; gap: 6px; padding: 9px 22px; border-radius: 9px;
  border: none; cursor: pointer;
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

/* ─── 主体布局 ─── */
.upload-main {
  position: relative; z-index: 2;
  padding: 84px 48px 64px; max-width: 1400px; margin: 0 auto;
}
.upload-inner {
  display: grid; grid-template-columns: 1fr 340px;
  gap: 32px; align-items: start;
}
.form-left { display: flex; flex-direction: column; gap: 18px; }

/* ─── 内容块 ─── */
.content-block {
  background: rgba(8,20,44,0.6); border: 1px solid rgba(0,212,255,0.08);
  border-radius: 14px; padding: 26px 30px; transition: border-color 0.25s;
}
.content-block:hover { border-color: rgba(0,212,255,0.18); }
.cb-header { margin-bottom: 20px; }
.cb-tag {
  font-family: 'JetBrains Mono', monospace; font-size: 0.68rem;
  letter-spacing: 0.14em; color: #00d4ff; opacity: 0.7; display: block; margin-bottom: 4px;
}
.cb-title {
  font-family: 'Orbitron', sans-serif; font-size: 1.05rem; font-weight: 600;
  letter-spacing: 0.04em; color: #c8f0e0;
}

/* ─── 表单 ─── */
.form-group { margin-bottom: 22px; }
.form-group label {
  display: block; font-family: 'JetBrains Mono', monospace; font-size: 0.72rem;
  color: rgba(150,210,180,0.45); margin-bottom: 7px; letter-spacing: 0.06em;
}
.required { color: #ff6b6b; }
.form-input {
  width: 100%; padding: 12px 16px;
  background: rgba(0,0,0,0.3); border: 1px solid rgba(0,212,255,0.1);
  border-radius: 8px; color: #c8f0e0;
  font-family: 'Noto Sans SC', sans-serif; font-size: 0.9rem; transition: all 0.2s;
}
.form-input:focus { outline: none; border-color: rgba(0,212,255,0.4); box-shadow: 0 0 0 3px rgba(0,212,255,0.08); }
textarea.form-input { resize: vertical; line-height: 1.7; }
.input-hint {
  font-family: 'JetBrains Mono', monospace; font-size: 0.65rem;
  color: rgba(150,210,180,0.28); text-align: right; margin-top: 4px;
}

/* 难度选择 */
.level-selector { display: flex; gap: 8px; }
.level-btn {
  flex: 1; padding: 10px; background: rgba(0,0,0,0.3);
  border: 1px solid rgba(0,212,255,0.1); border-radius: 8px;
  color: rgba(150,210,180,0.4); font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem; cursor: pointer; transition: all 0.2s;
}
.level-btn.active {
  background: rgba(0,212,255,0.12); border-color: rgba(0,212,255,0.45);
  color: #00d4ff; box-shadow: 0 0 12px rgba(0,212,255,0.18);
}
.level-btn:hover:not(.active) { border-color: rgba(0,212,255,0.2); color: rgba(0,212,255,0.7); }

/* ─── 章节卡片 ─── */
.chapter-card {
  background: rgba(0,0,0,0.22); border-radius: 10px; padding: 16px 18px;
  margin-bottom: 14px; border: 1px solid rgba(0,212,255,0.07); transition: border-color 0.2s;
}
.chapter-card:hover { border-color: rgba(0,212,255,0.14); }
.chapter-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.chapter-number-badge {
  padding: 4px 10px; background: rgba(0,212,255,0.08);
  border: 1px solid rgba(0,212,255,0.18); border-radius: 6px; flex-shrink: 0;
}
.chapter-num-text {
  font-family: 'Orbitron', sans-serif; font-size: 0.72rem; font-weight: 700;
  color: #00d4ff; letter-spacing: 0.1em;
}
.chapter-title-input {
  flex: 1; padding: 8px 12px; background: rgba(0,0,0,0.3);
  border: 1px solid rgba(0,212,255,0.1); border-radius: 6px;
  color: #c8f0e0; font-family: 'Noto Sans SC', sans-serif; font-size: 0.85rem; transition: border-color 0.2s;
}
.chapter-title-input:focus { outline: none; border-color: rgba(0,212,255,0.35); }
.remove-chapter {
  width: 28px; height: 28px; border-radius: 6px; flex-shrink: 0;
  background: rgba(255,107,107,0.08); border: 1px solid rgba(255,107,107,0.18);
  color: #ff8a8a; cursor: pointer; font-size: 0.75rem;
  display: flex; align-items: center; justify-content: center; transition: all 0.2s;
}
.remove-chapter:hover { background: rgba(255,107,107,0.18); color: #ff6b6b; }
.chapter-meta {
  display: flex; gap: 18px; margin-bottom: 12px;
  font-family: 'JetBrains Mono', monospace; font-size: 0.68rem; color: rgba(150,210,180,0.35);
}
.meta-item { display: flex; align-items: center; gap: 5px; }

/* ─── 视频/文件条目 ─── */
.videos-list, .files-list { margin-bottom: 6px; }
.video-item, .file-item {
  display: flex; align-items: center; justify-content: space-between;
  gap: 8px; padding: 6px 8px; border-radius: 7px; margin-bottom: 5px;
  background: rgba(0,212,255,0.02); border: 1px solid transparent; transition: border-color 0.18s;
}
.video-item:hover, .file-item:hover { border-color: rgba(0,212,255,0.1); }
.vi-left, .fi-left { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; }
.vi-right, .fi-right { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
.video-type-icon {
  width: 22px; height: 22px; border-radius: 5px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.video-type-icon.video { background: rgba(0,200,255,0.12); color: #00d4ff; }
.video-type-icon.pdf { background: rgba(255,100,100,0.12); color: #ff7a7a; }
.video-number {
  font-family: 'JetBrains Mono', monospace; font-size: 0.7rem;
  color: rgba(0,212,255,0.5); min-width: 30px; text-align: center; flex-shrink: 0;
}
.video-title-input {
  flex: 1; padding: 5px 9px; background: rgba(0,0,0,0.3);
  border: 1px solid rgba(0,212,255,0.08); border-radius: 5px;
  color: #c8f0e0; font-family: 'Noto Sans SC', sans-serif;
  font-size: 0.8rem; min-width: 0; transition: border-color 0.2s;
}
.video-title-input:focus { outline: none; border-color: rgba(0,212,255,0.3); }
.video-duration-input {
  width: 64px; padding: 5px 8px; background: rgba(0,0,0,0.3);
  border: 1px solid rgba(0,212,255,0.08); border-radius: 5px;
  color: #c8f0e0; font-family: 'JetBrains Mono', monospace;
  font-size: 0.78rem; text-align: center; transition: border-color 0.2s;
}
.video-duration-input:focus { outline: none; border-color: rgba(0,212,255,0.3); }
.upload-file-trigger {
  display: flex; align-items: center; gap: 4px; cursor: pointer;
  padding: 4px 9px; border-radius: 5px;
  background: rgba(0,212,255,0.06); border: 1px solid rgba(0,212,255,0.15);
  color: rgba(0,212,255,0.7); font-family: 'JetBrains Mono', monospace;
  font-size: 0.68rem; transition: all 0.2s; white-space: nowrap; max-width: 100px;
}
.upload-file-trigger:hover { background: rgba(0,212,255,0.12); color: #00d4ff; }
.upload-file-trigger.uploaded { background: rgba(0,255,157,0.07); border-color: rgba(0,255,157,0.25); color: rgba(0,255,157,0.8); }
.ufm-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 62px; }
.remove-video {
  width: 22px; height: 22px; border-radius: 4px; flex-shrink: 0;
  background: rgba(255,107,107,0.08); border: 1px solid rgba(255,107,107,0.15);
  color: #ff8a8a; cursor: pointer; font-size: 0.7rem;
  display: flex; align-items: center; justify-content: center; transition: all 0.2s;
}
.remove-video:hover { background: rgba(255,107,107,0.18); color: #ff6b6b; }
.file-name-tag {
  font-family: 'JetBrains Mono', monospace; font-size: 0.67rem;
  color: rgba(255,120,120,0.75); background: rgba(255,100,100,0.07);
  padding: 3px 7px; border-radius: 4px; border: 1px solid rgba(255,100,100,0.12);
  max-width: 96px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

/* ─── 添加按钮行 ─── */
.chapter-actions { display: flex; gap: 8px; margin-top: 8px; }
.add-video, .add-pdf-trigger {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
  padding: 8px; border-radius: 6px; cursor: pointer;
  font-family: 'JetBrains Mono', monospace; font-size: 0.74rem; transition: all 0.2s;
}
.add-video {
  background: transparent; border: 1px dashed rgba(0,212,255,0.18); color: rgba(0,212,255,0.55);
}
.add-video:hover { border-color: rgba(0,212,255,0.4); color: #00d4ff; background: rgba(0,212,255,0.03); }
.add-pdf-trigger {
  background: transparent; border: 1px dashed rgba(255,120,120,0.18); color: rgba(255,120,120,0.55);
}
.add-pdf-trigger:hover { border-color: rgba(255,120,120,0.4); color: #ff8a8a; background: rgba(255,100,100,0.03); }
.add-chapter {
  display: flex; align-items: center; justify-content: center; gap: 7px;
  width: 100%; padding: 11px; border-radius: 8px; cursor: pointer;
  background: transparent; border: 1px dashed rgba(0,212,255,0.14);
  color: rgba(0,212,255,0.5); font-family: 'JetBrains Mono', monospace;
  font-size: 0.78rem; margin-top: 4px; transition: all 0.2s;
}
.add-chapter:hover { border-color: rgba(0,212,255,0.35); color: #00d4ff; background: rgba(0,212,255,0.02); }

/* ─── 侧边栏 ─── */
.sidebar-right { display: flex; flex-direction: column; gap: 14px; position: sticky; top: 84px; }
.sidebar-card {
  background: rgba(8,20,44,0.65); border: 1px solid rgba(0,212,255,0.08);
  border-radius: 14px; padding: 20px 22px; transition: border-color 0.2s;
}
.sidebar-card:hover { border-color: rgba(0,212,255,0.15); }
.sc-tag {
  font-family: 'JetBrains Mono', monospace; font-size: 0.65rem;
  letter-spacing: 0.18em; color: #00d4ff; opacity: 0.65; margin-bottom: 6px;
  display: flex; align-items: center; gap: 8px;
}
.sc-tag::before { content: ''; display: block; width: 14px; height: 1px; background: #00d4ff; opacity: 0.7; }
.sc-title {
  font-family: 'Orbitron', sans-serif; font-size: 0.88rem; font-weight: 600;
  letter-spacing: 0.06em; color: #c8f0e0; margin-bottom: 16px;
}

/* ─── 课程名称预览 ─── */
.preview-title-area {
  margin-bottom: 12px; padding: 14px;
  background: rgba(0,0,0,0.22); border-radius: 9px; border: 1px solid rgba(0,212,255,0.08);
}
.preview-level-badge {
  display: inline-block; padding: 2px 8px; border-radius: 4px; margin-bottom: 8px;
  font-family: 'JetBrains Mono', monospace; font-size: 0.62rem; letter-spacing: 0.1em;
  background: rgba(0,212,255,0.1); border: 1px solid rgba(0,212,255,0.2); color: #00d4ff;
}
.preview-course-title {
  font-family: 'Noto Sans SC', sans-serif; font-size: 0.95rem; font-weight: 700;
  color: #e8f8f0; line-height: 1.5; word-break: break-all;
}

/* ─── 描述预览 ─── */
.preview-desc-area {
  margin-bottom: 14px; padding: 10px 12px;
  background: rgba(0,0,0,0.15); border-radius: 7px;
  border-left: 2px solid rgba(0,212,255,0.25);
}
.preview-desc-area.empty { border-left-color: rgba(150,210,180,0.1); }
.preview-desc-text { font-size: 0.75rem; color: rgba(150,210,180,0.65); line-height: 1.65; }
.preview-desc-text.placeholder { color: rgba(150,210,180,0.2); font-style: italic; }
.preview-more { font-size: 0.67rem; color: rgba(0,212,255,0.5); cursor: pointer; margin-top: 3px; display: block; }

/* ─── 大纲预览 ─── */
.preview-outline {
  margin-bottom: 16px; background: rgba(0,0,0,0.18); border-radius: 8px; overflow: hidden;
  border: 1px solid rgba(0,212,255,0.07);
}
.po-header {
  display: flex; align-items: center; gap: 7px; padding: 9px 12px;
  background: rgba(0,212,255,0.05); border-bottom: 1px solid rgba(0,212,255,0.07);
  font-family: 'JetBrains Mono', monospace; font-size: 0.68rem;
  letter-spacing: 0.08em; color: rgba(0,212,255,0.65);
}
.po-chapter { padding: 10px 12px; border-bottom: 1px solid rgba(0,212,255,0.05); }
.po-chapter:last-child { border-bottom: none; }
.po-chapter-title {
  display: flex; align-items: center; gap: 7px; margin-bottom: 6px;
  font-size: 0.78rem; color: #c8f0e0; font-weight: 500;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.po-ch-num {
  font-family: 'JetBrains Mono', monospace; font-size: 0.62rem;
  color: #00d4ff; background: rgba(0,212,255,0.1); padding: 1px 5px; border-radius: 3px; flex-shrink: 0;
}
.po-videos { padding-left: 4px; }
.po-video-item {
  display: flex; align-items: center; gap: 6px;
  font-size: 0.7rem; color: rgba(150,210,180,0.55); margin-bottom: 3px; line-height: 1.4;
}
.po-v-title { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
.po-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
.po-dot.video { background: rgba(0,212,255,0.5); }
.po-dur {
  margin-left: auto; font-family: 'JetBrains Mono', monospace;
  font-size: 0.62rem; color: rgba(0,212,255,0.35); flex-shrink: 0;
}
.po-more {
  font-family: 'JetBrains Mono', monospace; font-size: 0.65rem;
  color: rgba(0,212,255,0.35); margin-top: 3px; padding-left: 11px; display: flex; align-items: center; gap: 4px;
}
.po-more.pdf-more { color: rgba(255,120,120,0.45); }
.po-more-chapters {
  padding: 7px 12px; font-family: 'JetBrains Mono', monospace; font-size: 0.65rem;
  color: rgba(0,212,255,0.4); text-align: center; border-top: 1px dashed rgba(0,212,255,0.1);
}

/* ─── 统计栏 ─── */
.preview-stats {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px; background: rgba(0,0,0,0.2); border-radius: 8px; margin-bottom: 16px;
}
.stat-item { display: flex; flex-direction: column; align-items: center; flex: 1; }
.stat-val {
  font-family: 'Orbitron', monospace; font-size: 1.2rem; color: #c8f0e0; font-weight: 700;
}
.stat-label {
  font-family: 'JetBrains Mono', monospace; font-size: 0.6rem;
  color: rgba(150,210,180,0.35); margin-top: 2px; letter-spacing: 0.06em;
}
.stat-divider { width: 1px; height: 28px; background: rgba(0,212,255,0.1); }

.publish-btn.large {
  width: 100%; padding: 14px; font-size: 0.95rem; margin-bottom: 8px;
  justify-content: center; border-radius: 10px;
}
.draft-btn {
  width: 100%; padding: 11px; background: transparent;
  border: 1px solid rgba(0,212,255,0.2); border-radius: 9px;
  color: rgba(0,212,255,0.55); font-family: 'Noto Sans SC', sans-serif;
  font-size: 0.85rem; cursor: pointer; transition: all 0.2s;
}
.draft-btn:hover { border-color: rgba(0,212,255,0.4); color: #00d4ff; }

/* ─── 提示列表 ─── */
.tip-list { list-style: none; }
.tip-list li {
  font-size: 0.73rem; color: rgba(150,210,180,0.55);
  margin-bottom: 8px; padding-left: 14px; position: relative; line-height: 1.5;
}
.tip-list li::before { content: '▸'; position: absolute; left: 0; color: rgba(0,212,255,0.5); font-size: 0.65rem; }

/* ─── 响应式 ─── */
@media (max-width: 1100px) {
  .upload-inner { grid-template-columns: 1fr; }
  .sidebar-right { position: static; }
}
@media (max-width: 768px) {
  .top-nav { padding: 0 20px; }
  .upload-main { padding: 80px 16px 48px; }
  .chapter-actions { flex-direction: column; }
  .vi-right { flex-wrap: wrap; }
}
</style>