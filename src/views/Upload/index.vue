NEW_FILE_CODE
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const uploadForm = ref({
  title: '',
  description: '',
  category: '',
  tags: ''
})

const uploadedFiles = ref<File[]>([])
const previewImages = ref<string[]>([])
const isUploading = ref(false)
const uploadProgress = ref(0)
const showMessage = ref(false)
const messageText = ref('')
const messageType = ref<'success' | 'error'>('success')

const categories = [
  { value: 'model', label: '3D 模型' },
  { value: 'texture', label: '材质贴图' },
  { value: 'course', label: '教程课程' },
  { value: 'resource', label: '资源素材' }
]

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (!files) return

  Array.from(files).forEach(file => {
    if (validateFile(file)) {
      uploadedFiles.value.push(file)
      createPreview(file)
    }
  })

  // 清空 input 值，允许重复选择同一文件
  target.value = ''
}

const validateFile = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'model/gltf-binary', 'model/gltf+json']
  const maxSize = 50 * 1024 * 1024 // 50MB

  if (!validTypes.includes(file.type)) {
    showNotification('不支持的文件格式', 'error')
    return false
  }

  if (file.size > maxSize) {
    showNotification('文件大小不能超过 50MB', 'error')
    return false
  }

  return true
}

const createPreview = (file: File) => {
  if (file.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        previewImages.value.push(e.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }
}

const removeFile = (index: number) => {
  uploadedFiles.value.splice(index, 1)
  previewImages.value.splice(index, 1)
}

const handleSubmit = async () => {
  if (!validateForm()) return

  isUploading.value = true
  uploadProgress.value = 0

  try {
    // 模拟上传过程
    const formData = new FormData()
    formData.append('title', uploadForm.value.title)
    formData.append('description', uploadForm.value.description)
    formData.append('category', uploadForm.value.category)
    formData.append('tags', uploadForm.value.tags)

    uploadedFiles.value.forEach((file, index) => {
      formData.append(`files[${index}]`, file)
    })

    // 模拟上传进度
    const progressInterval = setInterval(() => {
      uploadProgress.value += 10
      if (uploadProgress.value >= 100) {
        clearInterval(progressInterval)
      }
    }, 300)

    // TODO: 实际的上传 API 调用
    // await api.upload(formData)

    setTimeout(() => {
      isUploading.value = false
      showNotification('上传成功！', 'success')
      resetForm()
    }, 3000)

  } catch (error) {
    isUploading.value = false
    showNotification('上传失败，请重试', 'error')
  }
}

const validateForm = (): boolean => {
  if (!uploadForm.value.title.trim()) {
    showNotification('请输入标题', 'error')
    return false
  }

  if (!uploadForm.value.category) {
    showNotification('请选择分类', 'error')
    return false
  }

  if (uploadedFiles.value.length === 0) {
    showNotification('请至少上传一个文件', 'error')
    return false
  }

  return true
}

const resetForm = () => {
  uploadForm.value = {
    title: '',
    description: '',
    category: '',
    tags: ''
  }
  uploadedFiles.value = []
  previewImages.value = []
  uploadProgress.value = 0
}

const showNotification = (text: string, type: 'success' | 'error') => {
  messageText.value = text
  messageType.value = type
  showMessage.value = true

  setTimeout(() => {
    showMessage.value = false
  }, 3000)
}

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="upload-page">
    <div class="upload-container">
      <!-- 头部导航 -->
      <div class="upload-header">
        <button class="back-btn" @click="goBack">
          <svg-icon name="arrow-left" :width="24" :height="24" />
        </button>
        <h1 class="upload-title">上传内容</h1>
      </div>

      <!-- 上传表单 -->
      <div class="upload-form">
        <!-- 文件上传区域 -->
        <div class="upload-area">
          <label class="upload-label" for="file-input">
            <div class="upload-icon">
              <svg-icon name="cloud-upload" :width="48" :height="48" />
            </div>
            <p class="upload-text">点击或拖拽文件到此处上传</p>
            <p class="upload-hint">支持 JPG、PNG、WEBP、GLTF、GLB 格式，最大 50MB</p>
          </label>
          <input
              id="file-input"
              type="file"
              multiple
              accept="image/*,.gltf,.glb"
              @change="handleFileChange"
              class="file-input"
          />
        </div>

        <!-- 预览区域 -->
        <div v-if="previewImages.length > 0" class="preview-grid">
          <div v-for="(preview, index) in previewImages" :key="index" class="preview-item">
            <img :src="preview" :alt="`预览${index + 1}`" class="preview-image" />
            <button class="remove-btn" @click="removeFile(index)">
              <svg-icon name="close" :width="20" :height="20" />
            </button>
            <div class="file-info">
              <span class="file-name">{{ uploadedFiles[index].name }}</span>
              <span class="file-size">{{ (uploadedFiles[index].size / 1024 / 1024).toFixed(2) }} MB</span>
            </div>
          </div>
        </div>

        <!-- 表单字段 -->
        <div class="form-fields">
          <div class="form-group">
            <label class="form-label" for="title">标题 *</label>
            <input
                id="title"
                v-model="uploadForm.title"
                type="text"
                placeholder="请输入标题"
                class="form-input"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="category">分类 *</label>
            <select
                id="category"
                v-model="uploadForm.category"
                class="form-select"
            >
              <option value="" disabled>请选择分类</option>
              <option v-for="cat in categories" :key="cat.value" :value="cat.value">
                {{ cat.label }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="description">描述</label>
            <textarea
                id="description"
                v-model="uploadForm.description"
                placeholder="请描述您的作品..."
                rows="4"
                class="form-textarea"
            ></textarea>
          </div>

          <div class="form-group">
            <label class="form-label" for="tags">标签</label>
            <input
                id="tags"
                v-model="uploadForm.tags"
                type="text"
                placeholder="用逗号分隔标签，例如：汽车，3D 模型，红色"
                class="form-input"
            />
          </div>
        </div>

        <!-- 提交按钮 -->
        <button
            class="submit-btn"
            :disabled="isUploading"
            @click="handleSubmit"
        >
          <span v-if="!isUploading">立即上传</span>
          <span v-else class="uploading-text">
            上传中... {{ uploadProgress }}%
          </span>
          <div v-if="isUploading" class="progress-bar">
            <div class="progress-fill" :style="{ width: `${uploadProgress}%` }"></div>
          </div>
        </button>
      </div>
    </div>

    <!-- 通知消息 -->
    <transition name="fade">
      <div v-if="showMessage" class="notification" :class="`notification--${messageType}`">
        <svg-icon :name="messageType === 'success' ? 'check' : 'error'" :width="24" :height="24" />
        <span>{{ messageText }}</span>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.upload-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0c1420 0%, #010a0e 100%);
  padding: 120px 20px 40px;
}

.upload-container {
  max-width: 900px;
  margin: 0 auto;
}

.upload-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
}

.back-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(-5px);
}

.upload-title {
  color: #fff;
  font-size: 2rem;
  font-weight: 600;
  margin: 0;
}

.upload-form {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 40px;
  backdrop-filter: blur(10px);
}

.upload-area {
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 60px 20px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  margin-bottom: 30px;
}

.upload-area:hover {
  border-color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.02);
}

.upload-label {
  display: block;
  cursor: pointer;
}

.upload-icon {
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.upload-text {
  color: #fff;
  font-size: 1.1rem;
  margin: 0 0 8px 0;
  font-weight: 500;
}

.upload-hint {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
  margin: 0;
}

.file-input {
  display: none;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.preview-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.preview-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  display: block;
}

.remove-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  border: none;
  color: #fff;
  padding: 5px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background: rgba(255, 0, 0, 0.8);
  transform: scale(1.1);
}

.file-info {
  padding: 12px;
}

.file-name {
  display: block;
  color: #fff;
  font-size: 0.9rem;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  display: block;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 30px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  color: #fff;
  font-size: 0.95rem;
  font-weight: 500;
}

.form-input,
.form-select,
.form-textarea {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px 16px;
  color: #fff;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.08);
}

.form-textarea {
  resize: vertical;
  font-family: inherit;
}

.form-select option {
  background: #0c1420;
  color: #fff;
}

.submit-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #00d4ff 0%, #0099ff 100%);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 212, 255, 0.3);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.uploading-text {
  display: block;
  margin-bottom: 8px;
}

.progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 0 0 8px 8px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #fff;
  transition: width 0.3s ease;
}

.notification {
  position: fixed;
  top: 100px;
  right: 20px;
  background: rgba(1, 10, 14, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #fff;
  font-size: 1rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  z-index: 2000;
}

.notification--success {
  border-color: rgba(0, 255, 128, 0.3);
}

.notification--error {
  border-color: rgba(255, 0, 0, 0.3);
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

@media (max-width: 768px) {
  .upload-page {
    padding-top: 100px;
  }

  .upload-form {
    padding: 24px;
  }

  .upload-title {
    font-size: 1.5rem;
  }

  .preview-grid {
    grid-template-columns: 1fr;
  }
}
</style>
