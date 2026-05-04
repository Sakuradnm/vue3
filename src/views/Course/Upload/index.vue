<template>
  <div class="upload-root">
    <canvas class="bg-canvas"></canvas>
    <div class="noise-layer"></div>
    <div class="cursor-glow" :style="{ left: mouseX + 'px', top: mouseY + 'px' }"></div>

    <!-- 导航栏 -->
    <nav class="top-nav">
      <div class="nav-left">
        <div class="nav-logo">
          <svg viewBox="0 0 32 32" fill="none">
            <polygon points="16,2 30,10 30,22 16,30 2,22 2,10"
                     stroke="#0066FF" stroke-width="1.5" fill="rgba(0,102,255,0.06)"/>
            <circle cx="16" cy="16" r="3" fill="#0066FF"/>
          </svg>
          <span class="logo-text">COURSENET<em>.io</em></span>
        </div>
        <button class="back-btn" @click="goBack">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          返回
        </button>
      </div>
      <div class="nav-right">
        <button class="draft-btn" @click="saveDraft" :disabled="loading">
          <span class="cb-sweep"></span>
          保存草稿
        </button>
        <button class="publish-btn" @click="publish" :disabled="loading">
          <span class="cb-sweep"></span>
          {{ loading ? '发布中...' : '发布课程' }}
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
            <div class="block-header">
              <div class="bh-tag">[ BASIC INFO ]</div>
              <h3 class="bh-title">基本信息</h3>
            </div>

            <div class="form-group">
              <label class="form-label">课程标题 <span class="required">*</span></label>
              <input type="text" v-model="form.title" placeholder="输入课程标题..." class="form-input" maxlength="50">
              <div class="char-count">{{ form.title.length }}/50</div>
            </div>

            <div class="form-row">
              <div class="form-group half">
                <label class="form-label">一级分类 <span class="required">*</span></label>
                <select v-model="form.categoryId" @change="handleCategoryChange(Number(form.categoryId))" class="form-input">
                  <option value="0" disabled>请选择一级分类</option>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                    {{ cat.name }}
                  </option>
                </select>
              </div>
              <div class="form-group half">
                <label class="form-label">二级分类 <span class="required">*</span></label>
                <select v-model="form.subCategoryId" @change="handleSubCategoryChange(Number(form.subCategoryId))" class="form-input" :disabled="!form.categoryId">
                  <option value="0" disabled>{{ form.categoryId ? '请选择二级分类' : '请先选择一级分类' }}</option>
                  <option v-for="sub in filteredSubCategories" :key="sub.id" :value="sub.id">
                    {{ sub.name }}
                  </option>
                </select>
              </div>
            </div>

            <div class="form-group" style="margin-bottom:0">
              <label class="form-label">课程描述 <span class="required">*</span></label>
              <textarea v-model="form.description" rows="5" placeholder="详细介绍课程内容、学习目标及适合人群……" class="form-textarea"></textarea>
            </div>
          </div>

          <!-- 详细信息 -->
          <div class="content-block fade-up">
            <div class="block-header">
              <div class="bh-tag">[ DETAIL INFO ]</div>
              <h3 class="bh-title">详细信息</h3>
            </div>

            <div class="form-group">
              <label class="form-label">课程简介</label>
              <textarea v-model="form.introduction" rows="4" placeholder="简要介绍课程的背景、价值和核心内容……" class="form-textarea"></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">学习目标</label>
              <textarea v-model="form.learningObjectives" rows="4" placeholder="学习本课程后能掌握什么技能或知识（每行一条）……" class="form-textarea"></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">主要内容</label>
              <textarea v-model="form.mainContent" rows="4" placeholder="课程涵盖的主要知识点和内容模块（每行一条）……" class="form-textarea"></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">适用人群</label>
              <textarea v-model="form.targetAudience" rows="4" placeholder="适合哪些人群学习本课程（每行一条）……" class="form-textarea"></textarea>
            </div>

            <div class="form-group" style="margin-bottom:0">
              <label class="form-label">教学特色</label>
              <textarea v-model="form.teachingFeatures" rows="4" placeholder="本课程的教学特点、优势和亮点（每行一条）……" class="form-textarea"></textarea>
            </div>
          </div>

          <!-- 课程大纲 -->
          <div class="content-block fade-up">
            <div class="block-header">
              <div class="bh-tag">[ CURRICULUM ]</div>
              <h3 class="bh-title">课程大纲</h3>
            </div>

            <div v-for="(chapter, cIdx) in form.chapters" :key="cIdx" class="chapter-card">
              <div class="chapter-header">
                <div class="chapter-number-badge">
                  <span class="chapter-num-text">CH {{ String(cIdx + 1).padStart(2, '0') }}</span>
                </div>
                <input type="text" v-model="chapter.title" placeholder="第n章：章节标题" class="chapter-title-input">
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
                    <input type="text" v-model="video.title" placeholder="n.n 标题" class="video-title-input">
                  </div>
                  <div class="vi-right">
                    <input type="text" v-model="video.duration" placeholder="mm:ss" class="video-duration-input">
                    <label class="upload-file-trigger" :class="{ uploaded: video.file }" :title="video.file?.name || '上传视频文件'">
                      <input type="file" accept="video/*" @change="(e) => handleVideoFileChange(e, cIdx, vIdx)" style="display:none">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      <span class="ufm-label">{{ video.file ? shortFileName(video.file.name) : '上传' }}</span>
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
                    <span class="file-name-tag">{{ file.file ? shortFileName(file.file.name) : '' }}</span>
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
            <div class="preview-content">
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

            <button class="publish-btn large" @click="publish" :disabled="loading">
              <span class="cb-sweep"></span>
              {{ loading ? '发布中...' : '发布课程' }}
            </button>

            <div class="draft-actions">
              <button class="draft-btn" @click="saveDraft" :disabled="loading">保存草稿</button>
              <button class="load-draft-btn" @click="loadDraft">加载草稿</button>
            </div>

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
import { ref, computed, onMounted, onUnmounted, h } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { uploadCourse, getFullCourseTree, type CourseTreeItem, type SubCategoryWithCourses, uploadFile } from '@/api/course.ts'
import { checkDuplicateCourse } from '@/api/courseReview'
import { getUserInfo } from '@/utils/session'

const router = useRouter()
const mouseX = ref(0)
const mouseY = ref(0)
let particleRafId: number | null = null
let observers: IntersectionObserver[] = []

const categories = ref<CourseTreeItem[]>([])
const filteredSubCategories = ref<SubCategoryWithCourses[]>([])
const loading = ref(false)

interface VideoItem {
  title: string
  duration: string
  // fileName字段已从数据库中删除
  file?: File
  resourceUrl?: string
}

interface FileItem {
  title: string
  // fileName字段已从数据库中删除
  file: File
  resourceUrl?: string
  // fileSize字段已从数据库中删除
}

interface Chapter {
  title: string
  videos: VideoItem[]
  files: FileItem[]
}

const form = ref<{
  title: string
  description: string
  subCategoryId: number
  categoryId: number
  detailIntro: string
  introduction: string
  learningObjectives: string
  mainContent: string
  targetAudience: string
  teachingFeatures: string
  chapters: Chapter[]
}>({
  title: '',
  description: '',
  subCategoryId: 0,
  categoryId: 0,
  detailIntro: '',
  introduction: '',
  learningObjectives: '',
  mainContent: '',
  targetAudience: '',
  teachingFeatures: '',
  chapters: [
    {
      title: '第一章：课程导论',
      videos: [
        { title: '课程介绍与学习目标', duration: 'xx:xx' },
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
async function handleVideoFileChange(e: Event, chapterIdx: number, videoIdx: number) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  if (!file.type.startsWith('video/')) {
    ElMessage.error('请上传视频文件')
    return
  }

  const video = form.value.chapters[chapterIdx].videos[videoIdx]
  // fileName字段已从数据库中删除，不再设置
  video.file = file

  // 显示上传中提示
  const loadingMsg = ElMessage({
    message: '正在上传视频...',
    type: 'info',
    duration: 0
  })

  try {
    // 上传文件到服务器
    const result = await uploadFile(file)
    
    // 保存URL
    video.resourceUrl = result.url
    
    loadingMsg.close()
    ElMessage.success('视频上传成功')

    // 读取视频时长
    const url = URL.createObjectURL(file)
    const vid = document.createElement('video')
    vid.preload = 'metadata'
    vid.onloadedmetadata = () => {
      const sec = Math.floor(vid.duration)
      video.duration = `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, '0')}`
      URL.revokeObjectURL(url)
    }
    vid.src = url
  } catch (error: any) {
    loadingMsg.close()
    ElMessage.error(error.message || '视频上传失败')
  }
  
  input.value = ''
}

async function handlePdfFileChange(e: Event, chapterIdx: number) {
  const input = e.target as HTMLInputElement
  const files = input.files
  if (!files || !files.length) return

  if (!form.value.chapters[chapterIdx].files) form.value.chapters[chapterIdx].files = []

  // 显示上传中提示
  const loadingMsg = ElMessage({
    message: `正在上传 ${files.length} 个文件...`,
    type: 'info',
    duration: 0
  })

  try {
    for (const file of Array.from(files)) {
      if (file.type !== 'application/pdf') {
        ElMessage.warning(`${file.name} 不是PDF文件，已跳过`)
        continue
      }

      // 上传文件到服务器
      const result = await uploadFile(file)

      // 添加到文件列表
      form.value.chapters[chapterIdx].files.push({
        title: file.name.replace(/\.pdf$/i, ''),
        // fileName字段已从数据库中删除，不再设置
        file,
        resourceUrl: result.url,
        // fileSize字段已从数据库中删除，不再设置
      })
    }

    loadingMsg.close()
    ElMessage.success('文件上传成功')
  } catch (error: any) {
    loadingMsg.close()
    ElMessage.error(error.message || '文件上传失败')
  }
  
  input.value = ''
}

async function loadCategories() {
  try {
    const data = await getFullCourseTree()
    categories.value = data
  } catch (error) {
    ElMessage.error('加载分类失败')
  }
}

function handleCategoryChange(categoryId: number) {
  form.value.categoryId = categoryId
  form.value.subCategoryId = 0

  const selectedCategory = categories.value.find(cat => cat.id === categoryId)
  if (selectedCategory) {
    filteredSubCategories.value = selectedCategory.subCategories
  } else {
    filteredSubCategories.value = []
  }
}

function handleSubCategoryChange(subCategoryId: number) {
  form.value.subCategoryId = subCategoryId
}

async function saveDraft() {
  try {
    const draftData = {
      title: form.value.title,
      description: form.value.description,
      subCategoryId: form.value.subCategoryId,
      categoryId: form.value.categoryId,
      detailIntro: form.value.detailIntro,
      introduction: form.value.introduction,
      learningObjectives: form.value.learningObjectives,
      mainContent: form.value.mainContent,
      targetAudience: form.value.targetAudience,
      teachingFeatures: form.value.teachingFeatures,
      chapters: form.value.chapters,
      savedAt: new Date().toISOString()
    }
    localStorage.setItem('course_draft', JSON.stringify(draftData))
    ElMessage.success('草稿已保存到本地')
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      ElMessage.error('存储空间不足，请清理浏览器缓存或删除旧草稿')
    } else {
      ElMessage.error('保存草稿失败')
    }
  }
}

function loadDraft() {
  const draft = localStorage.getItem('course_draft')
  if (draft) {
    try {
      const draftData = JSON.parse(draft)

      form.value.title = draftData.title || ''
      form.value.description = draftData.description || ''
      form.value.subCategoryId = draftData.subCategoryId || 0
      form.value.categoryId = draftData.categoryId || 0
      form.value.detailIntro = draftData.detailIntro || ''
      form.value.introduction = draftData.introduction || ''
      form.value.learningObjectives = draftData.learningObjectives || ''
      form.value.mainContent = draftData.mainContent || ''
      form.value.targetAudience = draftData.targetAudience || ''
      form.value.teachingFeatures = draftData.teachingFeatures || ''
      form.value.chapters = draftData.chapters || [{
        title: '第一章：课程导论',
        videos: [{ title: '课程介绍与学习目标', duration: '15:30' }],
        files: []
      }]

      if (draftData.savedAt) {
        const savedDate = new Date(draftData.savedAt)
        ElMessage.success(`已恢复草稿（保存于 ${savedDate.toLocaleString('zh-CN')}）`)
      } else {
        ElMessage.success('已恢复上次保存的草稿')
      }

      if (form.value.categoryId) {
        handleCategoryChange(form.value.categoryId)
      }
    } catch (e) {
      ElMessage.error('加载草稿失败，草稿可能已损坏')
    }
  } else {
    ElMessage.info('没有找到草稿')
  }
}

async function publish() {
  if (!form.value.title.trim()) {
    ElMessage.warning('请填写课程标题')
    return
  }
  if (!form.value.description.trim()) {
    ElMessage.warning('请填写课程描述')
    return
  }
  if (!form.value.subCategoryId) {
    ElMessage.warning('请选择课程分类')
    return
  }

  // 先检查课程名称是否重复
  loading.value = true
  try {
    const userInfo = getUserInfo()
    let teacherName = '匿名教师'
    if (userInfo) {
      if (userInfo.nickname || userInfo.username) {
        teacherName = userInfo.nickname || userInfo.username
      }
    }
    
    const duplicateResult = await checkDuplicateCourse(form.value.title, form.value.subCategoryId, teacherName)
    
    // duplicateResult是字符串"PASS"或者拦截器已经抛出错误
    // 如果能走到这里说明查重通过
  } catch (error: any) {
    // 查重失败，拦截器已经显示了错误信息
    console.error('检查课程重复失败:', error)
    loading.value = false
    return
  }

  // 查重通过后，立即显示倒计时弹窗
  loading.value = false
  
  // 创建自定义倒计时浮动框
  const countdownDiv = document.createElement('div')
  countdownDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 30px 40px;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.15);
    z-index: 9999;
    text-align: center;
    min-width: 400px;
  `
  
  countdownDiv.innerHTML = `
    <div style="font-size: 20px; font-weight: bold; color: #67C23A; margin-bottom: 15px;">
      ✓ 提交中...
    </div>
    <div style="font-size: 16px; color: #606266; margin-bottom: 20px;">
      课程已提交审核，请等待管理员审批
    </div>
    <div style="font-size: 32px; font-weight: bold; color: #409EFF; margin-bottom: 10px;">
      <span id="countdown-number">3</span>秒后自动跳转
    </div>
    <div style="font-size: 12px; color: #909399;">
      正在提交数据...
    </div>
  `
  
  document.body.appendChild(countdownDiv)
  
  // 倒计时逻辑
  let countdown = 3
  let hasError = false
  const timer = setInterval(() => {
    countdown--
    const numberEl = document.getElementById('countdown-number')
    if (numberEl) {
      numberEl.textContent = countdown.toString()
    }
    
    if (countdown <= 0) {
      clearInterval(timer)
      // 如果没有错误，则跳转
      if (!hasError && document.body.contains(countdownDiv)) {
        document.body.removeChild(countdownDiv)
        router.push('/Course')
      }
    }
  }, 1000)

  // 同时异步提交数据
  try {
    const userInfo = getUserInfo()
    let teacherName = '匿名教师'

    if (userInfo) {
      if (userInfo.nickname || userInfo.username) {
        teacherName = userInfo.nickname || userInfo.username
      }
    }

    const uploadData = {
      title: form.value.title,
      description: form.value.description,
      instructor: teacherName,
      subCategoryId: form.value.subCategoryId,
      categoryId: form.value.categoryId,
      introduction: form.value.introduction,
      learningObjectives: form.value.learningObjectives,
      mainContent: form.value.mainContent,
      targetAudience: form.value.targetAudience,
      teachingFeatures: form.value.teachingFeatures,
      chapters: form.value.chapters.map(chapter => ({
        title: chapter.title,
        videos: chapter.videos.map(video => ({
          title: video.title,
          duration: video.duration,
          resourceUrl: video.resourceUrl || ''
          // fileName字段已从数据库中删除，不再发送
        })),
        files: chapter.files.map(file => ({
          title: file.title,
          resourceUrl: file.resourceUrl || ''
          // fileName和fileSize字段已从数据库中删除，不再发送
        }))
      }))
    }

    const result = await uploadCourse(uploadData)

    // result是reviewId（数字），拦截器已经处理了code检查
    // 如果能走到这里说明上传成功
    if (result) {
      // 更新弹窗内容为成功
      const titleEl = countdownDiv.querySelector('div:first-child')
      if (titleEl) {
        titleEl.innerHTML = '✓ 提交成功'
      }
      
      const statusEl = countdownDiv.querySelector('div:nth-child(4)')
      if (statusEl) {
        statusEl.textContent = '数据提交成功'
      }
      
      const reviewId = result
      if (reviewId) {
        // 清除草稿
        localStorage.removeItem('course_draft')
        // 设置刷新标志
        sessionStorage.setItem('courseNeedRefresh', 'true')
      }
    } else {
      // 理论上不会走到这里，因为拦截器会处理错误
      hasError = true
      const titleEl = countdownDiv.querySelector('div:first-child')
      if (titleEl) {
        titleEl.innerHTML = '✗ 提交失败'
        titleEl.style.color = '#F56C6C'
      }
      const messageEl = countdownDiv.querySelector('div:nth-child(2)')
      if (messageEl) {
        messageEl.textContent = '发布失败'
      }
      const statusEl = countdownDiv.querySelector('div:nth-child(4)')
      if (statusEl) {
        statusEl.textContent = '请修改后重新提交'
      }
      clearInterval(timer)
      setTimeout(() => {
        if (document.body.contains(countdownDiv)) {
          document.body.removeChild(countdownDiv)
        }
      }, 3000)
    }
  } catch (error: any) {
    // 上传失败，拦截器已经显示了错误信息
    // 更新弹窗内容为失败
    hasError = true
    const titleEl = countdownDiv.querySelector('div:first-child')
    if (titleEl) {
      titleEl.innerHTML = '✗ 提交失败'
      titleEl.style.color = '#F56C6C'
    }
    const messageEl = countdownDiv.querySelector('div:nth-child(2)')
    if (messageEl) {
      messageEl.textContent = error.message || '发布失败'
    }
    const statusEl = countdownDiv.querySelector('div:nth-child(4)')
    if (statusEl) {
      statusEl.textContent = '请修改后重新提交'
    }
    // 停止倒计时
    clearInterval(timer)
    // 3秒后自动关闭错误弹窗
    setTimeout(() => {
      if (document.body.contains(countdownDiv)) {
        document.body.removeChild(countdownDiv)
      }
    }, 3000)
  }
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

  loadCategories()
  loadDraft()
})
onUnmounted(() => {
  if (particleRafId) cancelAnimationFrame(particleRafId)
  observers.forEach(o => o.disconnect())
  window.removeEventListener('mousemove', onMouseMove)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=JetBrains+Mono:wght@300;400;600&family=Noto+Sans+SC:wght@300;400;500;700&display=swap');

*,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }

.upload-root {
  background: #ffffff;
  color: #1a1a1a;
  font-family: 'Noto Sans SC', sans-serif;
  min-height: 100vh;
  position: relative;
}

/* ─── BG ─────────────────────────────────────────────── */
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
  background: radial-gradient(circle, rgba(0, 102, 255, 0.04) 0%, transparent 55%);
  pointer-events: none;
  transition: left 0.07s, top 0.07s;
}

/* ─── FADE UP ─────────────────────────────────────────── */
.fade-up {
  opacity: 0; transform: translateY(22px);
  transition: opacity 0.7s cubic-bezier(0.25,1,0.5,1), transform 0.7s cubic-bezier(0.25,1,0.5,1);
}
.fade-up.visible { opacity:1; transform:translateY(0); }

/* ─── NAV ─────────────────────────────────────────────── */
.top-nav {
  position: fixed; top:0; left:0; right:0; z-index: 200;
  height: 62px;
  display: flex; align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(22px) saturate(1.5);
  border-bottom: 1px solid rgba(0, 102, 255, 0.1);
}
.nav-left { display: flex; align-items: center; gap: 1.2rem; }
.nav-logo {
  display: flex; align-items: center; gap: 0.65rem;
  font-family: 'Orbitron', sans-serif; font-size: 0.7rem; font-weight: 700;
  letter-spacing: 0.18em; color: #1a1a1a; flex-shrink: 0;
}
.nav-logo svg { width: 24px; height: 24px; }
.logo-text em { font-style:normal; color: #0066FF; }

.back-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 16px; border-radius: 8px;
  background: rgba(0, 102, 255, 0.05);
  border: 1px solid rgba(0, 102, 255, 0.15);
  color: #1a1a1a;
  font-family: 'Noto Sans SC', sans-serif; font-size: 0.85rem;
  cursor: pointer; transition: all 0.25s;
}
.back-btn:hover {
  background: rgba(0, 102, 255, 0.1);
  border-color: rgba(0, 102, 255, 0.3);
}

.nav-right { display: flex; align-items: center; gap: 1rem; }
.draft-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 9px 22px; border-radius: 9px;
  border: 1px solid rgba(0, 102, 255, 0.3);
  background: rgba(0, 102, 255, 0.05);
  color: #0066FF;
  font-family: 'Noto Sans SC', sans-serif; font-size: 0.88rem; font-weight: 600;
  cursor: pointer; position: relative; overflow: hidden;
  transition: all 0.25s;
  text-align: center;
}
.draft-btn:hover:not(:disabled) {
  background: rgba(0, 102, 255, 0.1);
  border-color: rgba(0, 102, 255, 0.5);
}
.draft-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.publish-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 9px 22px; border-radius: 9px;
  border: none; cursor: pointer;
  background: linear-gradient(135deg, #0066FF, #00D4FF);
  color: #fff;
  font-family: 'Noto Sans SC', sans-serif; font-size: 0.88rem; font-weight: 600;
  position: relative; overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,102,255,0.3);
  transition: all 0.25s;
}
.publish-btn:hover:not(:disabled) {
  box-shadow: 0 8px 30px rgba(0,102,255,0.5);
  transform: translateY(-1px);
}
.publish-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.cb-sweep {
  position: absolute; top: 0; left: -100%; width: 60%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
  transition: left 0.5s cubic-bezier(0.25,1,0.5,1);
}
.publish-btn:hover .cb-sweep,
.draft-btn:hover .cb-sweep { left: 150%; }

/* ─── 主体布局 ─── */
.upload-main {
  position: relative; z-index: 2;
  padding: 84px 48px 64px; max-width: 1400px; margin: 0 auto;
}
.upload-inner {
  display: grid; grid-template-columns: 1fr 340px;
  gap: 32px; align-items: start;
}
.form-left { display: flex; flex-direction: column; gap: 24px; }

/* ─── 内容块 ─── */
.content-block {
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 32px;
  position: relative;
  overflow: hidden;
}
.block-header {
  margin-bottom: 24px;
}
.bh-tag {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.6rem;
  letter-spacing: 0.15em;
  color: #0066FF;
  margin-bottom: 8px;
}
.bh-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: #1a1a1a;
}

/* ─── 表单样式 ─── */
.form-group {
  margin-bottom: 20px;
}
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.form-group.half {
  margin-bottom: 0;
}
.form-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
}
.required {
  color: #ff4444;
}
.form-input {
  width: 100%;
  padding: 12px 16px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 0.95rem;
  color: #1a1a1a;
  transition: all 0.25s;
}
.form-input:focus {
  outline: none;
  border-color: #0066FF;
  box-shadow: 0 0 0 3px rgba(0,102,255,0.1);
}
.form-input[readonly] {
  background: #f5f5f5;
  cursor: not-allowed;
}
.char-count {
  text-align: right;
  font-size: 0.75rem;
  color: #999;
  margin-top: 4px;
}
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 0.95rem;
  color: #1a1a1a;
  line-height: 1.7;
  resize: vertical;
  transition: all 0.25s;
}
.form-textarea:focus {
  outline: none;
  border-color: #0066FF;
  box-shadow: 0 0 0 3px rgba(0,102,255,0.1);
}

/* 难度选择 */
.level-selector {
  display: flex;
  gap: 8px;
}
.level-btn {
  flex: 1;
  padding: 10px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  color: #666;
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.25s;
}
.level-btn.active {
  background: rgba(0,102,255,0.08);
  border-color: #0066FF;
  color: #0066FF;
}
.level-btn:hover:not(.active) {
  border-color: #0066FF;
  color: #0066FF;
}

/* ─── 章节卡片 ─── */
.chapter-card {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 16px;
  transition: all 0.25s;
}
.chapter-card:hover {
  border-color: #0066FF;
  box-shadow: 0 2px 12px rgba(0,102,255,0.08);
}
.chapter-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.chapter-number-badge {
  padding: 4px 10px;
  background: rgba(0,102,255,0.08);
  border: 1px solid rgba(0,102,255,0.15);
  border-radius: 6px;
  flex-shrink: 0;
}
.chapter-num-text {
  font-family: 'Orbitron', sans-serif;
  font-size: 0.72rem;
  font-weight: 700;
  color: #0066FF;
  letter-spacing: 0.1em;
}
.chapter-title-input {
  flex: 1;
  padding: 10px 14px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  color: #1a1a1a;
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 0.95rem;
  transition: all 0.25s;
}
.chapter-title-input:focus {
  outline: none;
  border-color: #0066FF;
  box-shadow: 0 0 0 3px rgba(0,102,255,0.08);
}
.remove-chapter {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  flex-shrink: 0;
  background: rgba(255,68,68,0.08);
  border: 1px solid rgba(255,68,68,0.18);
  color: #ff4444;
  cursor: pointer;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.remove-chapter:hover {
  background: rgba(255,68,68,0.15);
  color: #ff4444;
}
.chapter-meta {
  display: flex;
  gap: 18px;
  margin-bottom: 14px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.72rem;
  color: #999;
}
.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

/* ─── 视频/文件条目 ─── */
.videos-list, .files-list {
  margin-bottom: 8px;
}
.video-item, .file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  background: #f8f9fa;
  border: 1px solid transparent;
  transition: all 0.2s;
}
.video-item:hover, .file-item:hover {
  border-color: rgba(0,102,255,0.15);
  background: #fff;
}
.vi-left, .fi-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}
.vi-right, .fi-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.video-type-icon {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.video-type-icon.video {
  background: rgba(0,102,255,0.1);
  color: #0066FF;
}
.video-type-icon.pdf {
  background: rgba(255,107,53,0.1);
  color: #ff6b35;
}
.video-number {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  color: #0066FF;
  min-width: 32px;
  text-align: center;
  flex-shrink: 0;
}
.video-title-input {
  flex: 1;
  padding: 8px 12px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  color: #1a1a1a;
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 0.9rem;
  min-width: 0;
  transition: all 0.2s;
}
.video-title-input:focus {
  outline: none;
  border-color: #0066FF;
  box-shadow: 0 0 0 3px rgba(0,102,255,0.08);
}
.video-duration-input {
  width: 72px;
  padding: 8px 10px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  color: #1a1a1a;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.82rem;
  text-align: center;
  transition: all 0.2s;
}
.video-duration-input:focus {
  outline: none;
  border-color: #0066FF;
  box-shadow: 0 0 0 3px rgba(0,102,255,0.08);
}
.upload-file-trigger {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 6px;
  background: rgba(0,102,255,0.06);
  border: 1px solid rgba(0,102,255,0.15);
  color: #0066FF;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.72rem;
  transition: all 0.2s;
  white-space: nowrap;
  max-width: 110px;
}
.upload-file-trigger:hover {
  background: rgba(0,102,255,0.12);
  color: #0066FF;
}
.upload-file-trigger.uploaded {
  background: rgba(0,200,100,0.08);
  border-color: rgba(0,200,100,0.25);
  color: #00c864;
}
.ufm-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 65px;
}
.remove-video {
  width: 24px;
  height: 24px;
  border-radius: 5px;
  flex-shrink: 0;
  background: rgba(255,68,68,0.08);
  border: 1px solid rgba(255,68,68,0.15);
  color: #ff6b6b;
  cursor: pointer;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.remove-video:hover {
  background: rgba(255,68,68,0.15);
  color: #ff4444;
}
.file-name-tag {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.72rem;
  color: #ff6b35;
  background: rgba(255,107,53,0.08);
  padding: 4px 8px;
  border-radius: 5px;
  border: 1px solid rgba(255,107,53,0.15);
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ─── 添加按钮行 ─── */
.chapter-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}
.add-video, .add-pdf-trigger {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  border-radius: 7px;
  cursor: pointer;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.78rem;
  transition: all 0.2s;
}
.add-video {
  background: transparent;
  border: 1px dashed rgba(0,102,255,0.25);
  color: #0066FF;
}
.add-video:hover {
  border-color: #0066FF;
  background: rgba(0,102,255,0.04);
}
.add-pdf-trigger {
  background: transparent;
  border: 1px dashed rgba(255,107,53,0.25);
  color: #ff6b35;
}
.add-pdf-trigger:hover {
  border-color: #ff6b35;
  background: rgba(255,107,53,0.04);
}
.add-chapter {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 13px;
  border-radius: 9px;
  cursor: pointer;
  background: transparent;
  border: 1px dashed rgba(0,102,255,0.2);
  color: #0066FF;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.82rem;
  margin-top: 6px;
  transition: all 0.2s;
}
.add-chapter:hover {
  border-color: #0066FF;
  background: rgba(0,102,255,0.04);
}

/* ─── 侧边栏 ─── */
.sidebar-right {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 84px;
}
.sidebar-card {
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 24px;
  transition: all 0.2s;
}
.sidebar-card:hover {
  border-color: rgba(0,102,255,0.15);
}
.sc-tag {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  letter-spacing: 0.18em;
  color: #0066FF;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.sc-tag::before {
  content: '';
  display: block;
  width: 14px;
  height: 1px;
  background: #0066FF;
  opacity: 0.7;
}
.sc-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: #1a1a1a;
  margin-bottom: 18px;
}

/* ─── 课程名称预览 ─── */
.preview-content {
  margin-bottom: 14px;
  padding: 16px;
  background: #fff;
  border-radius: 10px;
  border: 1px solid #e8e8e8;
}
.preview-level-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 5px;
  margin-bottom: 10px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.68rem;
  letter-spacing: 0.1em;
  background: rgba(0,102,255,0.08);
  border: 1px solid rgba(0,102,255,0.2);
  color: #0066FF;
}
.preview-course-title {
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 1.05rem;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.5;
  word-break: break-all;
}

/* ─── 描述预览 ─── */
.preview-desc-area {
  margin-bottom: 16px;
  padding: 12px 14px;
  background: #fff;
  border-radius: 8px;
  border-left: 3px solid rgba(0,102,255,0.3);
}
.preview-desc-area.empty {
  border-left-color: #e0e0e0;
}
.preview-desc-text {
  font-size: 0.82rem;
  color: #666;
  line-height: 1.65;
}
.preview-desc-text.placeholder {
  color: #bbb;
  font-style: italic;
}
.preview-more {
  font-size: 0.72rem;
  color: #0066FF;
  cursor: pointer;
  margin-top: 4px;
  display: block;
}

/* ─── 大纲预览 ─── */
.preview-outline {
  margin-bottom: 18px;
  background: #fff;
  border-radius: 9px;
  overflow: hidden;
  border: 1px solid #e8e8e8;
}
.po-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: rgba(0,102,255,0.04);
  border-bottom: 1px solid #e8e8e8;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  color: #0066FF;
}
.po-chapter {
  padding: 12px 14px;
  border-bottom: 1px solid #f0f0f0;
}
.po-chapter:last-child {
  border-bottom: none;
}
.po-chapter-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 0.85rem;
  color: #1a1a1a;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.po-ch-num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.68rem;
  color: #0066FF;
  background: rgba(0,102,255,0.08);
  padding: 2px 6px;
  border-radius: 4px;
  flex-shrink: 0;
}
.po-videos {
  padding-left: 6px;
}
.po-video-item {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 0.75rem;
  color: #666;
  margin-bottom: 4px;
  line-height: 1.4;
}
.po-v-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}
.po-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}
.po-dot.video {
  background: #0066FF;
}
.po-dur {
  margin-left: auto;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.68rem;
  color: #0066FF;
  flex-shrink: 0;
}
.po-more {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  color: #0066FF;
  margin-top: 4px;
  padding-left: 13px;
  display: flex;
  align-items: center;
  gap: 5px;
}
.po-more.pdf-more {
  color: #ff6b35;
}
.po-more-chapters {
  padding: 8px 14px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  color: #0066FF;
  text-align: center;
  border-top: 1px dashed #e8e8e8;
}

/* ─── 统计栏 ─── */
.preview-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px;
  background: #fff;
  border-radius: 9px;
  margin-bottom: 18px;
  border: 1px solid #e8e8e8;
}
.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}
.stat-val {
  font-family: 'Orbitron', monospace;
  font-size: 1.3rem;
  color: #1a1a1a;
  font-weight: 700;
}
.stat-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  color: #999;
  margin-top: 3px;
  letter-spacing: 0.06em;
}
.stat-divider {
  width: 1px;
  height: 32px;
  background: #e8e8e8;
}

.publish-btn.large {
  width: 100%;
  padding: 15px;
  font-size: 1rem;
  margin-bottom: 16px;
  justify-content: center;
  border-radius: 10px;
}
.draft-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
  justify-content: center;
}
.draft-btn, .load-draft-btn {
  padding: 12px 28px;
  background: #ffffff;
  border-radius: 10px;
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s;
  text-align: center;
  white-space: nowrap;
}
.draft-btn {
  border: 2px solid rgba(0,102,255,0.3);
  color: #0066FF;
}
.draft-btn:hover:not(:disabled) {
  background: rgba(0,102,255,0.05);
  border-color: #0066FF;
  box-shadow: 0 2px 8px rgba(0,102,255,0.15);
}
.draft-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.load-draft-btn {
  border: 2px solid rgba(0,200,100,0.3);
  color: #00c864;
}
.load-draft-btn:hover {
  background: rgba(0,200,100,0.05);
  border-color: #00c864;
  box-shadow: 0 2px 8px rgba(0,200,100,0.15);
}

/* ─── 提示列表 ─── */
.tip-list {
  list-style: none;
}
.tip-list li {
  font-size: 0.78rem;
  color: #666;
  margin-bottom: 10px;
  padding-left: 16px;
  position: relative;
  line-height: 1.5;
}
.tip-list li::before {
  content: '▸';
  position: absolute;
  left: 0;
  color: #0066FF;
  font-size: 0.7rem;
}

/* ─── 响应式 ─── */
@media (max-width: 1100px) {
  .upload-inner {
    grid-template-columns: 1fr;
  }
  .sidebar-right {
    position: static;
  }
}
@media (max-width: 768px) {
  .top-nav {
    padding: 0 20px;
  }
  .upload-main {
    padding: 80px 16px 48px;
  }
  .form-row {
    grid-template-columns: 1fr;
  }
  .chapter-actions {
    flex-direction: column;
  }
  .vi-right {
    flex-wrap: wrap;
  }
}
</style>
