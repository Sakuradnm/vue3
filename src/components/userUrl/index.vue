<template>
  <div class="avatar-uploader">
    <div class="avatar-preview" :style="{ backgroundImage: modelValue ? `url(${modelValue})` : 'none' }">
      <div v-if="!modelValue" class="avatar-placeholder">{{ placeholder }}</div>
      <div class="avatar-overlay" v-if="editable">
        <button class="upload-btn" @click="triggerUpload">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <span>更换</span>
        </button>
      </div>
    </div>
    <input 
      ref="fileInput" 
      type="file" 
      accept="image/*" 
      @change="handleFileChange" 
      style="display: none"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  modelValue: string
  placeholder?: string
  editable?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'change': [value: string]
}>()

const fileInput = ref<HTMLInputElement>()

const triggerUpload = () => {
  fileInput.value?.click()
}

const handleFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择图片文件')
    return
  }

  if (file.size > 500 * 1024) {
    ElMessage.error('图片大小不能超过500KB')
    return
  }

  const reader = new FileReader()
  reader.onload = (event) => {
    const base64 = event.target?.result as string
    emit('update:modelValue', base64)
    emit('change', base64)
    ElMessage.success('头像已更新')
  }
  reader.readAsDataURL(file)

  input.value = ''
}
</script>

<style scoped>
.avatar-uploader {
  position: relative;
  display: inline-block;
}

.avatar-preview {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  background-color: #141b2d;
  position: relative;
  overflow: hidden;
  border: 3px solid transparent;
  background-image: linear-gradient(#141b2d, #141b2d), linear-gradient(135deg, #4f6ef7, #a855f7);
  background-origin: border-box;
  background-clip: content-box, border-box;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Space Mono', monospace;
  font-size: 32px;
  font-weight: 700;
  color: #7c9ff5;
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.avatar-preview:hover .avatar-overlay {
  opacity: 1;
}

.upload-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.upload-btn:hover {
  background: rgba(255, 255, 255, 0.25);
}

.upload-btn svg {
  width: 16px;
  height: 16px;
}
</style>
