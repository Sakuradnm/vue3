<template>
  <div v-if="visible" class="document-preview-overlay" @click="handleOverlayClick">
    <div class="document-preview-container" @click.stop>
      <!-- 头部工具栏 -->
      <div class="preview-header">
        <div class="header-left">
          <div class="file-icon" :class="fileType">
            <svg v-if="fileType === 'pdf'" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
            </svg>
            <svg v-else-if="['doc', 'docx'].includes(fileType)" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 12h2v5H8zm4 0h2v5h-2zm4 0h2v5h-2z"/>
            </svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
            </svg>
          </div>
          <div class="file-info">
            <h3 class="file-title">{{ fileName }}</h3>
            <p class="file-meta" v-if="fileSize">文件大小: {{ formatFileSize(fileSize) }}</p>
          </div>
        </div>
        <div class="header-right">
          <button class="btn-download" @click="handleDownload" title="下载">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            下载
          </button>
          <button class="btn-close" @click="handleClose" title="关闭">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- 预览内容区域 -->
      <div class="preview-content">
        <!-- PDF预览 - 使用iframe -->
        <iframe
          v-if="fileType === 'pdf'"
          :src="fileUrl"
          class="preview-frame"
          frameborder="0"
        ></iframe>

        <!-- Office文档预览 - 使用微软/Google在线预览服务 -->
        <iframe
          v-else-if="['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(fileType)"
          :src="getOfficePreviewUrl(fileUrl)"
          class="preview-frame"
          frameborder="0"
        ></iframe>

        <!-- 文本文件预览 -->
        <div v-else-if="['txt', 'md'].includes(fileType)" class="text-preview">
          <pre class="text-content">{{ textContent }}</pre>
        </div>

        <!-- 不支持预览的文件类型提示 -->
        <div v-else class="unsupported-preview">
          <div class="unsupported-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <h3>该文件类型暂不支持在线预览</h3>
          <p>请点击下载按钮查看文件内容</p>
          <button class="btn-download-large" @click="handleDownload">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            下载文件
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

interface Props {
  visible: boolean
  fileUrl: string
  fileName: string
  fileType: string
  fileSize?: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const textContent = ref('')

// 关闭预览
const handleClose = () => {
  emit('close')
}

// 点击遮罩层关闭
const handleOverlayClick = () => {
  handleClose()
}

// 下载文件
const handleDownload = () => {
  if (!props.fileUrl) {
    ElMessage.warning('文件链接无效')
    return
  }
  
  // 创建临时链接下载
  const link = document.createElement('a')
  link.href = props.fileUrl
  link.download = props.fileName
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  ElMessage.success('开始下载')
}

// 获取Office文档预览URL（使用Google Docs Viewer或Microsoft Office Online）
const getOfficePreviewUrl = (url: string) => {
  // 使用Google Docs Viewer作为备选
  return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`
}

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  if (!bytes) return '未知大小'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(2) + ' MB'
  return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB'
}

// 加载文本文件内容
const loadTextContent = async () => {
  if (!['txt', 'md'].includes(props.fileType)) return
  
  try {
    const response = await fetch(props.fileUrl)
    textContent.value = await response.text()
  } catch (error) {
    console.error('加载文本文件失败:', error)
    textContent.value = '文件加载失败'
  }
}

// 监听文件URL变化，重新加载内容
watch(() => props.fileUrl, () => {
  if (props.visible && ['txt', 'md'].includes(props.fileType)) {
    loadTextContent()
  }
})

onMounted(() => {
  if (props.visible && ['txt', 'md'].includes(props.fileType)) {
    loadTextContent()
  }
})

// 监听ESC键关闭
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    handleClose()
  }
}

watch(() => props.visible, (newVal) => {
  if (newVal) {
    document.addEventListener('keydown', handleKeyDown)
  } else {
    document.removeEventListener('keydown', handleKeyDown)
  }
})
</script>

<style scoped>
.document-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.document-preview-container {
  width: 90vw;
  height: 90vh;
  background: #fff;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-info {
  flex: 1;
}

.file-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: white;
}

.file-meta {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.header-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.btn-download {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-download:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.btn-close {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.preview-content {
  flex: 1;
  position: relative;
  background: #f5f5f5;
  overflow: hidden;
}

.preview-frame {
  width: 100%;
  height: 100%;
  border: none;
}

.text-preview {
  width: 100%;
  height: 100%;
  overflow: auto;
  padding: 24px;
  background: white;
}

.text-content {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.unsupported-preview {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
  gap: 16px;
}

.unsupported-icon {
  width: 120px;
  height: 120px;
  background: #f0f0f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}

.unsupported-preview h3 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.unsupported-preview p {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.btn-download-large {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-download-large:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

@media (max-width: 768px) {
  .document-preview-container {
    width: 100vw;
    height: 100vh;
    border-radius: 0;
  }
  
  .preview-header {
    padding: 12px 16px;
  }
  
  .file-title {
    font-size: 14px;
  }
  
  .btn-download span {
    display: none;
  }
}
</style>
