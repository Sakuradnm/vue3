<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface UploadedFile {
  file: File
  preview: string | null
  id: string
}

const form = ref({ title: '', description: '', category: '', tags: '', license: 'free' })
const uploadedFiles = ref<UploadedFile[]>([])
const isUploading = ref(false)
const uploadProgress = ref(0)
const isDragging = ref<boolean>(false)
const notification = ref<{ show: boolean; text: string; type: 'success' | 'error' }>({ show: false, text: '', type: 'success' })
const mouseX = ref(0)
const mouseY = ref(0)
const currentStep = ref(1)

const categories = [
  { value: 'notes', label: '课程笔记', emoji: '📝' },
  { value: 'exam', label: '历年真题', emoji: '📋' },
  { value: 'video', label: '视频资源', emoji: '🎬' },
  { value: 'book', label: '电子书籍', emoji: '📚' },
  { value: 'mind', label: '思维导图', emoji: '🗺️' },
  { value: 'code', label: '代码项目', emoji: '💻' },
]

const licenses = [
  { value: 'free', label: '完全免费', desc: '任何人均可免费下载' },
  { value: 'share', label: '分享后可取', desc: '分享帖子后解锁下载' },
  { value: 'points', label: '积分兑换', desc: '消耗积分下载' },
]

const isFormValid = computed(() =>
    form.value.title.trim() && form.value.category && uploadedFiles.value.length > 0
)

const totalSize = computed(() =>
    uploadedFiles.value.reduce((s, f) => s + f.file.size, 0)
)

const fmtSize = (b: number) => {
  if (b >= 1024 * 1024) return (b / 1024 / 1024).toFixed(1) + ' MB'
  if (b >= 1024) return (b / 1024).toFixed(0) + ' KB'
  return b + ' B'
}

const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files) processFiles(Array.from(files))
}

const handleFileChange = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (files) processFiles(Array.from(files))
  ;(e.target as HTMLInputElement).value = ''
}

const processFiles = (files: File[]) => {
  files.forEach(file => {
    const maxSize = 100 * 1024 * 1024
    if (file.size > maxSize) { notify('文件不能超过 100MB', 'error'); return }

    const id = Math.random().toString(36).slice(2)
    const uploaded: UploadedFile = { file, preview: null, id }

    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = e => { uploaded.preview = e.target?.result as string }
      reader.readAsDataURL(file)
    }

    uploadedFiles.value.push(uploaded)
  })
}

const removeFile = (id: string) => {
  uploadedFiles.value = uploadedFiles.value.filter(f => f.id !== id)
}

const handleSubmit = async () => {
  if (!isFormValid.value) return
  isUploading.value = true
  uploadProgress.value = 0

  const interval = setInterval(() => {
    uploadProgress.value = Math.min(uploadProgress.value + Math.random() * 12, 95)
  }, 200)

  await new Promise(r => setTimeout(r, 2800))
  clearInterval(interval)
  uploadProgress.value = 100

  await new Promise(r => setTimeout(r, 400))
  isUploading.value = false
  notify('资料上传成功！审核后将公开发布 🎉', 'success')
  resetForm()
}

const resetForm = () => {
  form.value = { title: '', description: '', category: '', tags: '', license: 'free' }
  uploadedFiles.value = []
  uploadProgress.value = 0
  currentStep.value = 1
}

const notify = (text: string, type: 'success' | 'error') => {
  notification.value = { show: true, text, type }
  setTimeout(() => { notification.value.show = false }, 4000)
}

const getFileIcon = (file: File) => {
  if (file.type.startsWith('image/')) return '🖼️'
  if (file.type.includes('pdf')) return '📄'
  if (file.type.includes('zip') || file.type.includes('rar')) return '📦'
  if (file.name.match(/\.(ppt|pptx)$/i)) return '📊'
  if (file.name.match(/\.(doc|docx)$/i)) return '📝'
  if (file.name.match(/\.(xls|xlsx)$/i)) return '📈'
  if (file.name.match(/\.(mp4|mov|avi)$/i)) return '🎬'
  return '📎'
}

const handleMouseMove = (e: MouseEvent) => {
  mouseX.value = e.clientX
  mouseY.value = e.clientY
}
onMounted(() => window.addEventListener('mousemove', handleMouseMove))
onUnmounted(() => window.removeEventListener('mousemove', handleMouseMove))
</script>

<template>
  <div class="upload-root">
    <div class="cursor-glow" :style="{ left: mouseX + 'px', top: mouseY + 'px' }" />
    <div class="bg-grid" />
    <div class="bg-orb o1" />
    <div class="bg-orb o2" />
    <div class="bg-orb o3" />

    <div class="page-wrap">
      <!-- LEFT: FORM -->
      <div class="form-side">
        <!-- Step indicator -->
        <div class="steps">
          <div v-for="n in 3" :key="n" class="step" :class="{ active: currentStep >= n, done: currentStep > n }">
            <div class="step-dot">
              <span v-if="currentStep <= n">{{ n }}</span>
              <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg>
            </div>
            <span class="step-label">{{ ['选择文件', '填写信息', '发布设置'][n-1] }}</span>
            <div v-if="n < 3" class="step-line" :class="{ filled: currentStep > n }" />
          </div>
        </div>

        <h1 class="page-title">上传学习资料</h1>
        <p class="page-sub">分享你的笔记、真题和学习心得，帮助更多同学</p>

        <!-- STEP 1: File Upload -->
        <div class="section" v-show="currentStep === 1">
          <div
              class="drop-zone"
              :class="{ dragging: isDragging, 'has-files': uploadedFiles.length > 0 }"
              @dragover.prevent="isDragging = true"
              @dragleave="isDragging = false"
              @drop.prevent="handleDrop"
          >
            <label class="drop-label" for="file-inp">
              <div class="drop-icon-wrap">
                <div class="drop-ring" />
                <div class="drop-ring r2" />
                <svg class="drop-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <p class="drop-text">拖拽文件到此，或 <span class="drop-link">点击选择</span></p>
              <p class="drop-hint">支持 PDF · Word · PPT · 图片 · 视频 · 压缩包 · 最大 100MB</p>
            </label>
            <input id="file-inp" type="file" multiple @change="handleFileChange" class="file-input" />
          </div>

          <!-- File list -->
          <div v-if="uploadedFiles.length > 0" class="file-list">
            <div class="file-list-header">
              <span>已选文件 ({{ uploadedFiles.length }})</span>
              <span class="total-size">共 {{ fmtSize(totalSize) }}</span>
            </div>
            <TransitionGroup name="flist" tag="div">
              <div v-for="uf in uploadedFiles" :key="uf.id" class="file-item">
                <div class="file-thumb">
                  <img v-if="uf.preview" :src="uf.preview" alt="preview" />
                  <span v-else class="file-emoji">{{ getFileIcon(uf.file) }}</span>
                </div>
                <div class="file-info">
                  <span class="fname">{{ uf.file.name }}</span>
                  <span class="fsize">{{ fmtSize(uf.file.size) }}</span>
                </div>
                <button class="rm-btn" @click="removeFile(uf.id)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
              </div>
            </TransitionGroup>
          </div>

          <button class="next-btn" :disabled="uploadedFiles.length === 0" @click="currentStep = 2">
            下一步：填写信息
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>

        <!-- STEP 2: Info -->
        <div class="section" v-show="currentStep === 2">
          <div class="field">
            <label>资料标题 <span class="req">*</span></label>
            <input v-model="form.title" placeholder="例如：大学物理期末公式速查手册" maxlength="80" />
            <span class="cc">{{ form.title.length }}/80</span>
          </div>

          <div class="field">
            <label>资料类别 <span class="req">*</span></label>
            <div class="cat-grid">
              <button
                  v-for="cat in categories" :key="cat.value"
                  class="cat-option" :class="{ selected: form.category === cat.value }"
                  @click="form.category = cat.value"
              >
                <span class="co-emoji">{{ cat.emoji }}</span>
                {{ cat.label }}
              </button>
            </div>
          </div>

          <div class="field">
            <label>内容简介</label>
            <textarea v-model="form.description" placeholder="描述资料的内容、适用范围、使用方法等..." rows="4" />
          </div>

          <div class="field">
            <label>标签（逗号分隔）</label>
            <input v-model="form.tags" placeholder="如：高数, 期末, 大一" />
          </div>

          <div class="step-btns">
            <button class="back-btn" @click="currentStep = 1">← 上一步</button>
            <button class="next-btn" :disabled="!form.title.trim() || !form.category" @click="currentStep = 3">
              下一步：发布设置
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>

        <!-- STEP 3: Publish settings -->
        <div class="section" v-show="currentStep === 3">
          <div class="field">
            <label>下载权限</label>
            <div class="license-list">
              <div
                  v-for="lic in licenses" :key="lic.value"
                  class="license-opt" :class="{ selected: form.license === lic.value }"
                  @click="form.license = lic.value"
              >
                <div class="lic-radio" :class="{ sel: form.license === lic.value }" />
                <div>
                  <div class="lic-label">{{ lic.label }}</div>
                  <div class="lic-desc">{{ lic.desc }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Preview summary -->
          <div class="summary">
            <div class="summary-title">发布预览</div>
            <div class="summary-row"><span>标题</span><strong>{{ form.title || '—' }}</strong></div>
            <div class="summary-row"><span>类别</span><strong>{{ categories.find(c => c.value === form.category)?.label || '—' }}</strong></div>
            <div class="summary-row"><span>文件数</span><strong>{{ uploadedFiles.length }} 个文件（{{ fmtSize(totalSize) }}）</strong></div>
            <div class="summary-row"><span>权限</span><strong>{{ licenses.find(l => l.value === form.license)?.label }}</strong></div>
          </div>

          <!-- Upload progress -->
          <div v-if="isUploading" class="progress-wrap">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: uploadProgress + '%' }" />
              <div class="progress-glow" :style="{ left: uploadProgress + '%' }" />
            </div>
            <div class="progress-text">正在上传... {{ Math.round(uploadProgress) }}%</div>
          </div>

          <div class="step-btns">
            <button class="back-btn" @click="currentStep = 2">← 上一步</button>
            <button class="submit-btn" :disabled="isUploading || !isFormValid" @click="handleSubmit">
              <span v-if="!isUploading">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2 11 13"/><path d="M22 2 15 22 11 13 2 9l20-7z"/></svg>
                立即发布
              </span>
              <span v-else class="uploading">
                <span class="spin">⟳</span> 上传中...
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- RIGHT: Info panel -->
      <aside class="info-side">
        <div class="info-card">
          <div class="info-header">
            <div class="info-icon">✨</div>
            <h3>上传须知</h3>
          </div>
          <ul class="info-list">
            <li>请上传原创或经授权的学习资料</li>
            <li>禁止上传违规、侵权内容</li>
            <li>资料通过审核后公开，通常 24h 内完成</li>
            <li>每次上传最多 10 个文件</li>
          </ul>
        </div>

        <div class="info-card reward">
          <div class="info-header">
            <div class="info-icon">🏆</div>
            <h3>上传奖励</h3>
          </div>
          <div class="reward-list">
            <div class="reward-item">
              <span class="r-label">上传资料</span>
              <span class="r-pts">+10 积分</span>
            </div>
            <div class="reward-item">
              <span class="r-label">资料被下载</span>
              <span class="r-pts">+2 积分/次</span>
            </div>
            <div class="reward-item">
              <span class="r-label">获得点赞</span>
              <span class="r-pts">+1 积分/个</span>
            </div>
            <div class="reward-item">
              <span class="r-label">精选资料奖励</span>
              <span class="r-pts hot">+50 积分</span>
            </div>
          </div>
        </div>

        <div class="info-card stats-card">
          <div class="info-header">
            <div class="info-icon">📊</div>
            <h3>平台数据</h3>
          </div>
          <div class="plat-stats">
            <div class="pstat"><span class="ps-n">12,847</span><span class="ps-l">份资料</span></div>
            <div class="pstat"><span class="ps-n">38,291</span><span class="ps-l">名用户</span></div>
            <div class="pstat"><span class="ps-n">521k</span><span class="ps-l">次下载</span></div>
          </div>
        </div>
      </aside>
    </div>

    <!-- NOTIFICATION -->
    <Teleport to="body">
      <Transition name="notif">
        <div v-if="notification.show" class="notif" :class="notification.type">
          <span class="notif-icon">{{ notification.type === 'success' ? '✓' : '✕' }}</span>
          {{ notification.text }}
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,400&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.upload-root {
  font-family: 'DM Sans', sans-serif;
  min-height: 100vh;
  background: #060912;
  color: #dde1ed;
  position: relative;
  overflow-x: hidden;
}

/* BG */
.cursor-glow { position: fixed; width: 600px; height: 600px; border-radius: 50%; background: radial-gradient(circle, rgba(0,201,167,0.065) 0%, transparent 65%); transform: translate(-50%,-50%); pointer-events: none; z-index: 0; transition: left 0.12s linear, top 0.12s linear; }
.bg-grid { position: fixed; inset: 0; background-image: linear-gradient(rgba(108,99,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(108,99,255,0.03) 1px, transparent 1px); background-size: 56px 56px; z-index: 0; pointer-events: none; }
.bg-orb { position: fixed; border-radius: 50%; filter: blur(130px); pointer-events: none; z-index: 0; animation: of 14s ease-in-out infinite alternate; }
.o1 { width: 450px; height: 450px; background: rgba(108,99,255,0.1); top: -150px; left: -150px; }
.o2 { width: 350px; height: 350px; background: rgba(0,201,167,0.08); bottom: -100px; right: 0; animation-delay: -5s; }
.o3 { width: 300px; height: 300px; background: rgba(255,179,71,0.06); top: 40%; left: 40%; animation-delay: -10s; }
@keyframes of { from { transform: translate(0,0) scale(1); } to { transform: translate(30px,25px) scale(1.12); } }

/* PAGE LAYOUT */
.page-wrap { position: relative; z-index: 1; display: grid; grid-template-columns: 1fr 320px; gap: 32px; max-width: 1100px; margin: 0 auto; padding: 48px 24px 80px; }

/* FORM SIDE */
.form-side {}

/* STEPS */
.steps { display: flex; align-items: center; margin-bottom: 36px; }
.step { display: flex; align-items: center; gap: 8px; }
.step-dot { width: 28px; height: 28px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.12); background: transparent; display: flex; align-items: center; justify-content: center; font-size: 0.78rem; color: rgba(221,225,237,0.35); transition: all 0.35s ease; flex-shrink: 0; }
.step.active .step-dot { border-color: #6C63FF; background: rgba(108,99,255,0.2); color: #a09fff; }
.step.done .step-dot { border-color: #00C9A7; background: rgba(0,201,167,0.2); color: #00C9A7; }
.step-label { font-size: 0.82rem; color: rgba(221,225,237,0.35); white-space: nowrap; transition: color 0.3s; }
.step.active .step-label, .step.done .step-label { color: rgba(221,225,237,0.75); }
.step-line { flex: 1; height: 1px; background: rgba(255,255,255,0.08); margin: 0 12px; min-width: 20px; transition: background 0.4s; }
.step-line.filled { background: rgba(0,201,167,0.4); }

.page-title { font-family: 'Syne', sans-serif; font-size: 2.2rem; font-weight: 800; color: #fff; letter-spacing: -0.03em; margin-bottom: 8px; }
.page-sub { color: rgba(221,225,237,0.42); font-size: 0.95rem; font-weight: 300; margin-bottom: 36px; }

/* SECTION */
.section { display: flex; flex-direction: column; gap: 24px; animation: fadeIn 0.35s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

/* DROP ZONE */
.drop-zone {
  border: 2px dashed rgba(255,255,255,0.1); border-radius: 20px; padding: 56px 24px;
  text-align: center; cursor: pointer; transition: all 0.3s ease; position: relative; overflow: hidden;
  background: rgba(255,255,255,0.015);
}
.drop-zone:hover, .drop-zone.dragging { border-color: rgba(108,99,255,0.5); background: rgba(108,99,255,0.04); }
.drop-zone.has-files { border-color: rgba(0,201,167,0.3); }
.drop-label { display: block; cursor: pointer; }
.file-input { display: none; }

.drop-icon-wrap { position: relative; width: 72px; height: 72px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; }
.drop-ring { position: absolute; inset: 0; border-radius: 50%; border: 1px solid rgba(108,99,255,0.2); animation: ringPulse 2.5s ease-in-out infinite; }
.drop-ring.r2 { animation-delay: 1.2s; inset: -8px; }
@keyframes ringPulse { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 0.7; transform: scale(1.05); } }
.drop-icon { color: rgba(108,99,255,0.7); position: relative; }

.drop-text { font-size: 1.05rem; color: #dde1ed; margin-bottom: 8px; font-weight: 400; }
.drop-link { color: #6C63FF; font-weight: 500; text-decoration: underline; text-underline-offset: 3px; }
.drop-hint { font-size: 0.82rem; color: rgba(221,225,237,0.3); font-weight: 300; }

/* FILE LIST */
.file-list { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; overflow: hidden; }
.file-list-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 0.82rem; color: rgba(221,225,237,0.5); }
.total-size { color: rgba(221,225,237,0.35); }
.file-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.04); transition: background 0.2s; }
.file-item:last-child { border-bottom: none; }
.file-item:hover { background: rgba(255,255,255,0.03); }
.file-thumb { width: 38px; height: 38px; border-radius: 8px; overflow: hidden; background: rgba(255,255,255,0.06); flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
.file-thumb img { width: 100%; height: 100%; object-fit: cover; }
.file-emoji { font-size: 1.2rem; }
.file-info { flex: 1; min-width: 0; }
.fname { display: block; font-size: 0.87rem; color: #dde1ed; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.fsize { font-size: 0.76rem; color: rgba(221,225,237,0.35); }
.rm-btn { background: rgba(255,255,255,0.05); border: none; color: rgba(221,225,237,0.4); width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: all 0.2s; }
.rm-btn:hover { background: rgba(255,80,80,0.15); color: #ff6b6b; }

/* FIELDS */
.field { display: flex; flex-direction: column; gap: 8px; position: relative; }
.field label { font-size: 0.85rem; font-weight: 500; color: rgba(221,225,237,0.65); }
.req { color: #ff6b6b; }
.cc { position: absolute; right: 12px; bottom: 12px; font-size: 0.74rem; color: rgba(221,225,237,0.28); }
.field input, .field textarea {
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.085);
  border-radius: 12px; padding: 12px 16px; color: #dde1ed;
  font-family: 'DM Sans', sans-serif; font-size: 0.94rem; outline: none; transition: all 0.22s;
}
.field input:focus, .field textarea:focus { border-color: rgba(108,99,255,0.5); background: rgba(108,99,255,0.048); box-shadow: 0 0 0 3px rgba(108,99,255,0.1); }
.field textarea { resize: vertical; line-height: 1.7; }

/* CAT GRID */
.cat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.cat-option { background: rgba(255,255,255,0.038); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 12px 10px; color: rgba(221,225,237,0.6); font-family: 'DM Sans', sans-serif; font-size: 0.85rem; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 6px; transition: all 0.22s; }
.cat-option:hover { background: rgba(255,255,255,0.07); color: #dde1ed; }
.cat-option.selected { background: rgba(108,99,255,0.18); border-color: rgba(108,99,255,0.4); color: #a09fff; }
.co-emoji { font-size: 1.3rem; }

/* LICENSE */
.license-list { display: flex; flex-direction: column; gap: 10px; }
.license-opt { display: flex; align-items: center; gap: 14px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 16px; cursor: pointer; transition: all 0.22s; }
.license-opt:hover { background: rgba(255,255,255,0.055); }
.license-opt.selected { background: rgba(108,99,255,0.1); border-color: rgba(108,99,255,0.35); }
.lic-radio { width: 18px; height: 18px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.2); flex-shrink: 0; transition: all 0.2s; position: relative; }
.lic-radio.sel { border-color: #6C63FF; background: rgba(108,99,255,0.3); }
.lic-radio.sel::after { content: ''; position: absolute; inset: 3px; border-radius: 50%; background: #6C63FF; }
.lic-label { font-size: 0.9rem; font-weight: 500; color: #dde1ed; margin-bottom: 2px; }
.lic-desc { font-size: 0.8rem; color: rgba(221,225,237,0.4); }

/* SUMMARY */
.summary { background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; overflow: hidden; }
.summary-title { padding: 14px 18px 12px; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 0.9rem; color: rgba(221,225,237,0.7); border-bottom: 1px solid rgba(255,255,255,0.06); }
.summary-row { display: flex; justify-content: space-between; align-items: center; padding: 11px 18px; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 0.87rem; }
.summary-row:last-child { border-bottom: none; }
.summary-row span { color: rgba(221,225,237,0.4); }
.summary-row strong { color: #dde1ed; font-weight: 400; max-width: 60%; text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* PROGRESS */
.progress-wrap { display: flex; flex-direction: column; gap: 10px; }
.progress-bar { height: 6px; background: rgba(255,255,255,0.07); border-radius: 100px; overflow: visible; position: relative; }
.progress-fill { height: 100%; border-radius: 100px; background: linear-gradient(90deg, #6C63FF, #00C9A7); transition: width 0.25s ease; position: relative; }
.progress-glow { position: absolute; top: 50%; transform: translate(-50%, -50%); width: 12px; height: 12px; border-radius: 50%; background: #00C9A7; box-shadow: 0 0 12px #00C9A7; transition: left 0.25s ease; }
.progress-text { font-size: 0.82rem; color: rgba(221,225,237,0.5); text-align: center; }

/* BUTTONS */
.step-btns { display: flex; gap: 12px; }
.back-btn { background: rgba(255,255,255,0.055); border: 1px solid rgba(255,255,255,0.09); border-radius: 12px; color: rgba(221,225,237,0.6); font-family: 'DM Sans', sans-serif; font-size: 0.94rem; padding: 12px 20px; cursor: pointer; transition: all 0.2s; }
.back-btn:hover { background: rgba(255,255,255,0.09); color: #dde1ed; }
.next-btn {
  display: inline-flex; align-items: center; gap: 8px;
  background: linear-gradient(135deg, #6C63FF, #4ECDC4); border: none;
  border-radius: 12px; color: #fff;
  font-family: 'DM Sans', sans-serif; font-size: 0.94rem; font-weight: 500;
  padding: 12px 24px; cursor: pointer; flex: 1; justify-content: center;
  transition: all 0.28s cubic-bezier(0.34,1.56,0.64,1);
  box-shadow: 0 4px 20px rgba(108,99,255,0.28);
}
.next-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(108,99,255,0.48); }
.next-btn:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }
.submit-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  background: linear-gradient(135deg, #00C9A7, #6C63FF);
  border: none; border-radius: 12px; color: #fff;
  font-family: 'DM Sans', sans-serif; font-size: 1rem; font-weight: 500;
  padding: 14px 32px; cursor: pointer; flex: 1;
  transition: all 0.28s cubic-bezier(0.34,1.56,0.64,1);
  box-shadow: 0 4px 24px rgba(0,201,167,0.3);
}
.submit-btn:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,201,167,0.5); }
.submit-btn:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }
.uploading { display: flex; align-items: center; gap: 6px; }
.spin { display: inline-block; animation: spin 1s linear infinite; font-size: 1.1rem; }
@keyframes spin { to { transform: rotate(360deg); } }

/* INFO SIDE */
.info-side { display: flex; flex-direction: column; gap: 16px; }
.info-card { background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 24px; }
.info-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.info-icon { font-size: 1.2rem; }
.info-header h3 { font-family: 'Syne', sans-serif; font-size: 0.95rem; font-weight: 700; color: #e8eaf0; }
.info-list { list-style: none; display: flex; flex-direction: column; gap: 10px; }
.info-list li { font-size: 0.85rem; color: rgba(221,225,237,0.55); padding-left: 16px; position: relative; line-height: 1.5; }
.info-list li::before { content: '·'; position: absolute; left: 4px; color: #6C63FF; font-weight: 700; }

.reward.info-card { border-color: rgba(255,179,71,0.15); background: rgba(255,179,71,0.03); }
.reward-list { display: flex; flex-direction: column; gap: 10px; }
.reward-item { display: flex; justify-content: space-between; align-items: center; }
.r-label { font-size: 0.85rem; color: rgba(221,225,237,0.55); }
.r-pts { font-size: 0.85rem; font-weight: 600; color: #FFB347; font-family: 'Syne', sans-serif; }
.r-pts.hot { color: #ff6b6b; }

.stats-card { border-color: rgba(108,99,255,0.15); background: rgba(108,99,255,0.025); }
.plat-stats { display: flex; justify-content: space-between; }
.pstat { text-align: center; }
.ps-n { display: block; font-family: 'Syne', sans-serif; font-size: 1.3rem; font-weight: 700; color: #fff; letter-spacing: -0.02em; }
.ps-l { font-size: 0.76rem; color: rgba(221,225,237,0.38); }

/* FILE LIST TRANSITION */
.flist-enter-active, .flist-leave-active { transition: all 0.3s ease; }
.flist-enter-from { opacity: 0; transform: translateX(-12px); }
.flist-leave-to { opacity: 0; transform: translateX(12px); }

/* NOTIFICATION */
.notif {
  position: fixed; bottom: 32px; right: 32px; z-index: 2000;
  display: flex; align-items: center; gap: 10px;
  background: #0e1321; border: 1px solid rgba(255,255,255,0.1);
  border-radius: 14px; padding: 14px 20px;
  font-size: 0.92rem; box-shadow: 0 16px 48px rgba(0,0,0,0.7);
  max-width: 360px; backdrop-filter: blur(16px);
}
.notif.success { border-color: rgba(0,201,167,0.35); }
.notif.error { border-color: rgba(255,107,107,0.35); }
.notif-icon { width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 700; flex-shrink: 0; }
.notif.success .notif-icon { background: rgba(0,201,167,0.18); color: #00C9A7; }
.notif.error .notif-icon { background: rgba(255,107,107,0.15); color: #ff6b6b; }

.notif-enter-active, .notif-leave-active { transition: all 0.4s cubic-bezier(0.34,1.56,0.64,1); }
.notif-enter-from, .notif-leave-to { opacity: 0; transform: translateY(20px) scale(0.9); }

/* RESPONSIVE */
@media (max-width: 900px) {
  .page-wrap { grid-template-columns: 1fr; }
  .info-side { order: -1; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .stats-card { grid-column: 1/-1; }
}
@media (max-width: 600px) {
  .page-wrap { padding: 32px 16px 60px; }
  .page-title { font-size: 1.7rem; }
  .cat-grid { grid-template-columns: repeat(2, 1fr); }
  .info-side { grid-template-columns: 1fr; }
  .stats-card { grid-column: auto; }
  .topnav { padding: 0 20px; }
  .nav-links { display: none; }
}
</style>