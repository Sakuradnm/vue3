<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const activeTab = ref<'system' | 'personal'>('system')
const notices = ref<any[]>([])

onMounted(() => {
  loadNotices()
})

const loadNotices = () => {
  const systemNoticesStr = localStorage.getItem('systemNotices')
  const userNoticesStr = localStorage.getItem('userNotices')

  const systemNotices = systemNoticesStr ? JSON.parse(systemNoticesStr) : []
  const userNotices = userNoticesStr ? JSON.parse(userNoticesStr) : []

  notices.value = [
    ...systemNotices.map((n: any) => ({ ...n, type: 'system' })),
    ...userNotices.map((n: any) => ({ ...n, type: 'personal' }))
  ]
}

const filteredNotices = computed(() => {
  if (activeTab.value === 'system') {
    return notices.value.filter(n => n.type === 'system')
  } else {
    return notices.value.filter(n => n.type === 'personal')
  }
})

const unreadCount = computed(() => {
  return notices.value.filter(n => !n.isRead).length
})

const markAsRead = (notice: any) => {
  notice.isRead = true

  if (notice.type === 'system') {
    const systemNoticesStr = localStorage.getItem('systemNotices')
    const systemNotices = systemNoticesStr ? JSON.parse(systemNoticesStr) : []
    const index = systemNotices.findIndex((n: any) => n.id === notice.id)
    if (index !== -1) {
      systemNotices[index].isRead = true
      localStorage.setItem('systemNotices', JSON.stringify(systemNotices))
    }
  } else {
    const userNoticesStr = localStorage.getItem('userNotices')
    const userNotices = userNoticesStr ? JSON.parse(userNoticesStr) : []
    const index = userNotices.findIndex((n: any) => n.id === notice.id)
    if (index !== -1) {
      userNotices[index].isRead = true
      localStorage.setItem('userNotices', JSON.stringify(userNotices))
    }
  }

  window.dispatchEvent(new Event('storage'))
}

const markAllAsRead = () => {
  const currentNotices = filteredNotices.value

  currentNotices.forEach(notice => {
    markAsRead(notice)
  })

  ElMessage.success('已全部标记为已读')
  loadNotices()
}

const deleteNotice = (notice: any) => {
  if (notice.type === 'system') {
    const systemNoticesStr = localStorage.getItem('systemNotices')
    const systemNotices = systemNoticesStr ? JSON.parse(systemNoticesStr) : []
    const filtered = systemNotices.filter((n: any) => n.id !== notice.id)
    localStorage.setItem('systemNotices', JSON.stringify(filtered))
  } else {
    const userNoticesStr = localStorage.getItem('userNotices')
    const userNotices = userNoticesStr ? JSON.parse(userNoticesStr) : []
    const filtered = userNotices.filter((n: any) => n.id !== notice.id)
    localStorage.setItem('userNotices', JSON.stringify(filtered))
  }

  ElMessage.success('通知已删除')
  loadNotices()
}

const getTimeAgo = (timestamp: number) => {
  const now = Date.now()
  const diff = now - timestamp

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`

  const date = new Date(timestamp)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const getNoticeIcon = (type: string) => {
  if (type === 'system') return '📢'
  return '👤'
}

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="notice-container">
    <div class="notice-header">
      <button class="back-btn" @click="goBack">
        <svg-icon name="menu" :width="24" :height="24" style="transform: rotate(90deg);"/>
      </button>
      <h1 class="notice-title">我的通知</h1>
      <div class="notice-stats">
        <span class="stats-label">未读：</span>
        <span class="stats-count">{{ unreadCount }}</span>
      </div>
    </div>

    <div class="tabs-container">
      <div
          class="tab"
          :class="{ active: activeTab === 'system' }"
          @click="activeTab = 'system'"
      >
        系统信息
        <span class="tab-count">{{ filteredNotices.filter(n => !n.isRead && n.type === 'system').length }}</span>
      </div>
      <div
          class="tab"
          :class="{ active: activeTab === 'personal' }"
          @click="activeTab = 'personal'"
      >
        个人信息
        <span class="tab-count">{{ filteredNotices.filter(n => !n.isRead && n.type === 'personal').length }}</span>
      </div>
    </div>

    <div class="notices-actions">
      <button class="action-btn" @click="markAllAsRead">
        全部已读
      </button>
    </div>

    <div class="notices-list">
      <div
          v-for="notice in filteredNotices"
          :key="notice.id"
          class="notice-item"
          :class="{ unread: !notice.isRead }"
      >
        <div class="notice-icon">
          {{ getNoticeIcon(notice.type) }}
        </div>
        <div class="notice-content">
          <div class="notice-title-row">
            <h3 class="notice-item-title">{{ notice.title }}</h3>
            <span class="notice-time">{{ getTimeAgo(notice.timestamp) }}</span>
          </div>
          <p class="notice-message">{{ notice.message }}</p>
        </div>
        <div class="notice-actions">
          <button
              v-if="!notice.isRead"
              class="mark-read-btn"
              @click="markAsRead(notice)"
          >
            标记已读
          </button>
          <button class="delete-btn" @click="deleteNotice(notice)">
            删除
          </button>
        </div>
      </div>

      <div v-if="filteredNotices.length === 0" class="empty-state">
        <svg-icon name="user" :width="80" :height="80" style="opacity: 0.3;"/>
        <p class="empty-text">暂无{{ activeTab === 'system' ? '系统' : '个人' }}通知</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notice-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0c1f2e 0%, #061016 100%);
  padding: 40px 20px;
}

.notice-header {
  max-width: 900px;
  margin: 0 auto 30px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.back-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(-5px);
}

.notice-title {
  color: #fff;
  font-size: 2rem;
  font-weight: 700;
  flex: 1;
  margin: 0;
}

.notice-stats {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.05);
  padding: 8px 16px;
  border-radius: 20px;
}

.stats-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
}

.stats-count {
  color: #ff6b6b;
  font-size: 1.2rem;
  font-weight: 700;
}

.tabs-container {
  max-width: 900px;
  margin: 0 auto 20px;
  display: flex;
  gap: 15px;
  background: rgba(255, 255, 255, 0.05);
  padding: 5px;
  border-radius: 12px;
}

.tab {
  flex: 1;
  padding: 12px 24px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 500;
}

.tab:hover {
  background: rgba(255, 255, 255, 0.1);
}

.tab.active {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

.tab-count {
  background: #ff6b6b;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 600;
}

.notices-actions {
  max-width: 900px;
  margin: 0 auto 20px;
  display: flex;
  justify-content: flex-end;
}

.action-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 8px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}

.notices-list {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.notice-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  gap: 15px;
  transition: all 0.3s ease;
}

.notice-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateX(5px);
}

.notice-item.unread {
  border-left: 3px solid #ff6b6b;
  background: rgba(255, 107, 107, 0.05);
}

.notice-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.notice-content {
  flex: 1;
  overflow: hidden;
}

.notice-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.notice-item-title {
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}

.notice-time {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
  flex-shrink: 0;
}

.notice-message {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
  margin: 0;
  line-height: 1.5;
}

.notice-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.mark-read-btn,
.delete-btn {
  background: transparent;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.mark-read-btn {
  color: #4ecdc4;
  border: 1px solid rgba(78, 205, 196, 0.3);
}

.mark-read-btn:hover {
  background: rgba(78, 205, 196, 0.1);
}

.delete-btn {
  color: #ff6b6b;
  border: 1px solid rgba(255, 107, 107, 0.3);
}

.delete-btn:hover {
  background: rgba(255, 107, 107, 0.1);
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.4);
}

.empty-text {
  margin-top: 20px;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .notice-header {
    padding: 0 10px;
  }

  .notice-title {
    font-size: 1.5rem;
  }

  .tabs-container {
    padding: 3px;
  }

  .tab {
    padding: 10px 16px;
    font-size: 0.9rem;
  }

  .notice-item {
    padding: 15px;
  }

  .notice-item-title {
    font-size: 1rem;
  }

  .notice-actions {
    flex-direction: column;
    gap: 5px;
  }
}
</style>
