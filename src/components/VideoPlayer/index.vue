<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'

interface Props {
  visible: boolean
  videoUrl: string
  title?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'close'): void
}>()

const videoRef = ref<HTMLVideoElement | null>(null)

// 关闭播放器
const close = () => {
  if (videoRef.value) {
    videoRef.value.pause()
    videoRef.value.currentTime = 0
  }
  emit('close')
}

// ESC键关闭
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    close()
  }
}

watch(() => props.visible, (newVal) => {
  if (newVal) {
    document.addEventListener('keydown', handleKeydown)
    document.body.style.overflow = 'hidden'
    // 加载视频
    if (videoRef.value && props.videoUrl) {
      videoRef.value.load()
      // 自动播放
      videoRef.value.play().catch(err => {
        console.log('自动播放被阻止:', err)
      })
    }
  } else {
    document.removeEventListener('keydown', handleKeydown)
    document.body.style.overflow = ''
    if (videoRef.value) {
      videoRef.value.pause()
    }
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Transition name="modal">
    <div v-if="visible" class="video-modal-overlay" @click.self="close">
      <div class="video-modal-container">
        <!-- 头部 -->
        <div class="video-modal-header">
          <h3 class="video-title">{{ title || '视频播放' }}</h3>
          <button class="close-btn" @click="close" title="关闭 (ESC)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- 视频播放器 - 使用浏览器默认控制栏 -->
        <div class="video-player-wrapper">
          <video
            ref="videoRef"
            :src="videoUrl"
            class="video-element"
            controls
            autoplay
            preload="metadata"
            playsinline
          ></video>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* 遮罩层 */
.video-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

/* 容器 */
.video-modal-container {
  width: 90%;
  max-width: 1200px;
  background: #1a1a1a;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* 头部 */
.video-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.video-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(255, 68, 68, 0.2);
  color: #ff4444;
  transform: rotate(90deg);
}

/* 视频播放器 */
.video-player-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
}

.video-element {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* 过渡动画 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .video-modal-container,
.modal-leave-active .video-modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from .video-modal-container,
.modal-leave-to .video-modal-container {
  transform: scale(0.9) translateY(20px);
}

/* 响应式 */
@media (max-width: 768px) {
  .video-modal-container {
    width: 95%;
    max-width: 100%;
  }

  .video-modal-header {
    padding: 12px 16px;
  }

  .video-title {
    font-size: 14px;
  }
}
</style>
