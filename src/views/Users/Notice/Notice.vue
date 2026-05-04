<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getUserNotifications, markAsRead as markNotificationRead, markAllAsRead as markAllRead } from '@/api/notification'
import type { UserNotification } from '@/api/notification'
import { ElMessage } from 'element-plus'

const router = useRouter()
const notices = ref<any[]>([])
const loading = ref(false)

// 当前登录用户
const userId = ref<number | null>(null)

// 通知类型映射
const notificationTypeMap: Record<string, { label: string; icon: string; color: string }> = {
  comment_reply: { label: '评论回复', icon: '💬', color: '#409eff' },
  like_comment: { label: '点赞', icon: '', color: '#67c23a' },
  admin_reply: { label: '管理员回复', icon: '📢', color: '#e6a23c' },
  lecturer_application: { label: '讲师申请', icon: '🎓', color: '#f56c6c' }
}

// 获取通知类型样式
const getNotificationTypeInfo = (type: string) => {
  return notificationTypeMap[type] || { label: '通知', icon: '🔔', color: '#909399' }
}

onMounted(async () => {
  // 尝试从多个可能的key获取用户信息
  const userStr = localStorage.getItem('userInfo') || localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : {}
  userId.value = user.id
  console.log('当前用户ID:', userId.value)
  
  if (!userId.value) {
    ElMessage.error('未登录，请先登录')
    router.push('/Users')
    return
  }
  
  await loadNotices()
})

const loadNotices = async () => {
  loading.value = true
  try {
    if (!userId.value) {
      console.error('用户ID为空，无法加载通知')
      return
    }
    
    console.log('开始加载用户通知，用户ID:', userId.value)
    
    // 从后端获取用户通知（拦截器已经提取了data，直接是数组）
    const apiNotices = await getUserNotifications(userId.value)
    console.log('获取到的通知数据:', apiNotices)
    
    // 确保apiNotices是数组
    const noticesArray = Array.isArray(apiNotices) ? apiNotices : []
    
    // 直接显示用户通知，添加timestamp和message字段
    notices.value = noticesArray.map((n: any) => ({
      ...n,
      timestamp: new Date(n.createdAt).getTime(),
      message: n.content
    }))
    
    console.log('通知列表:', notices.value)
  } catch (error) {
    console.error('加载通知失败:', error)
    ElMessage.error('加载通知失败')
  } finally {
    loading.value = false
  }
}

const unreadCount = computed(() => notices.value.filter(n => !n.isRead).length)

const markAllAsRead = async () => {
  try {
    // 标记所有通知为已读
    if (userId.value) {
      await markAllRead(userId.value)
    }
    notices.value.forEach(n => { n.isRead = true })
    ElMessage.success('已全部标记为已读')
    // 重新加载
    await loadNotices()
  } catch (error) {
    console.error('全部标记已读失败:', error)
    ElMessage.error('操作失败')
  }
}

// 点击通知跳转
const handleNoticeClick = async (notice: any) => {
  // 根据relatedType跳转到对应页面
  if (notice.relatedType === 'forum_post' && notice.relatedId) {
    // 评论回复通知:relatedId 是帖子ID
    // 先标记为已读
    try {
      if (userId.value) {
        await markNotificationRead(notice.id, userId.value)
      }
    } catch (error) {
      console.error('标记已读失败:', error)
    }
    // 跳转到帖子详情页,使用路径参数格式
    router.push(`/forum/${notice.relatedId}`)
  } else if (notice.relatedType === 'forum_comment' && notice.relatedId) {
    // 点赞通知:relatedId 是评论ID,需要先查询评论获取帖子ID
    try {
      // 先标记为已读
      if (userId.value) {
        await markNotificationRead(notice.id, userId.value)
      }
      const { getCommentById } = await import('@/api/forum')
      const comment = await getCommentById(notice.relatedId)
      if (comment && comment.postId) {
        router.push(`/forum/${comment.postId}`)
      } else {
        ElMessage.warning('无法找到对应的帖子')
      }
    } catch (error) {
      console.error('获取评论信息失败:', error)
      ElMessage.error('跳转失败')
    }
  }
}

const getTimeAgo = (timestamp: number | string) => {
  const time = typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp
  const diff = Date.now() - time
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  const d = new Date(time)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

const goBack = () => router.back()
</script>

<template>
  <div class="nc-root">
    <!-- Background -->
    <div class="nc-bg">
      <div class="bg-orb orb1" />
      <div class="bg-orb orb2" />
      <div class="bg-grid" />
    </div>

    <!-- Toast (保留兼容) -->
    <!-- Toast功能已改为ElMessage -->

    <div class="nc-layout">

      <!-- ── Header ─ -->
      <div class="nc-header">
        <button class="back-btn" @click="goBack">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div class="header-text">
          <h1 class="page-title">消息通知</h1>
          <p class="page-sub">查看你的所有通知消息</p>
        </div>
        <div class="unread-pill" v-if="unreadCount > 0">
          <span class="unread-dot" />
          {{ unreadCount }} 条未读
        </div>
      </div>

      <!-- ── Actions ── -->
      <div class="toolbar">
        <button class="mark-all-btn" @click="markAllAsRead"
                v-if="notices.some(n => !n.isRead)">
          全部已读
        </button>
      </div>

      <!-- ── Notice List ── -->
      <div class="notice-list" v-loading="loading">
        <TransitionGroup name="notice">
          <div
              v-for="notice in notices"
              :key="notice.id"
              class="notice-card"
              :class="{ unread: !notice.isRead }"
              @click="handleNoticeClick(notice)"
          >
            <!-- Unread indicator -->
            <div class="unread-bar" v-if="!notice.isRead" />

            <div class="notice-icon-wrap">
              <span>{{ getNotificationTypeInfo(notice.notificationType || '').icon }}</span>
            </div>

            <div class="notice-body">
              <div class="notice-top">
                <h3 class="notice-title">{{ notice.title }}</h3>
                <div class="notice-meta">
                  <span class="notice-time">{{ getTimeAgo(notice.timestamp || notice.createdAt) }}</span>
                  <span v-if="!notice.isRead" class="unread-tag">未读</span>
                </div>
              </div>
              <p class="notice-msg">{{ notice.message || notice.content }}</p>
            </div>
          </div>
        </TransitionGroup>

        <!-- Empty -->
        <div v-if="!loading && notices.length === 0" class="empty-state">
          <div class="empty-icon">◎</div>
          <p class="empty-title">暂无通知</p>
          <p class="empty-sub">新通知到来时将在此显示</p>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap');

/* ─── Root ─── */
.nc-root {
  min-height: 100vh;
  font-family: 'DM Sans', sans-serif;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 50%, #f0f7ff 100%);
  color: #1a1a1a;
  position: relative;
  overflow-x: hidden;
}

/* ─── Background ─── */
.nc-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
.bg-orb {
  position: absolute; border-radius: 50%;
  filter: blur(140px); opacity: 0.15;
}
.orb1 {
  width: 700px; height: 700px;
  background: radial-gradient(circle, rgba(0,102,255,0.06), transparent);
  top: -250px; right: -200px;
  animation: pulse1 16s ease-in-out infinite alternate;
}
.orb2 {
  width: 450px; height: 450px;
  background: radial-gradient(circle, rgba(139,92,246,0.05), transparent);
  bottom: -100px; left: -100px;
  animation: pulse2 20s ease-in-out infinite alternate;
}
@keyframes pulse1 { to { transform: translate(-40px, 60px) scale(1.1); } }
@keyframes pulse2 { to { transform: translate(40px, -40px) scale(0.95); } }
.bg-grid {
  position: absolute; inset: 0;
  background-image:
      linear-gradient(rgba(0,102,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,102,255,0.025) 1px, transparent 1px);
  background-size: 52px 52px;
}

/* ─── Layout ─── */
.nc-layout {
  position: relative; z-index: 1;
  max-width: 780px; margin: 0 auto;
  padding: 48px 24px 80px;
}

/* ─── Header ─── */
.nc-header {
  display: flex; align-items: center; gap: 18px;
  margin-bottom: 40px;
}
.back-btn {
  width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0;
  background: #ffffff;
  border: 1px solid #dee2e6;
  color: #6c757d; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all .2s;
}
.back-btn:hover { background: #f8f9fa; color: #1a1a1a; transform: translateX(-2px); }
.header-text { flex: 1; }
.page-title { font-size: 1.7rem; font-weight: 600; margin: 0 0 2px; color: #1a1a1a; }
.page-sub { font-size: .82rem; color: #6c757d; margin: 0; }

.unread-pill {
  display: flex; align-items: center; gap: 7px;
  padding: 7px 14px; border-radius: 20px;
  background: rgba(239,68,68,0.08);
  border: 1px solid rgba(239,68,68,0.2);
  color: #dc2626; font-size: .8rem; font-weight: 500;
  font-family: 'Space Mono', monospace;
}
.unread-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #ef4444;
  animation: blink 1.4s ease-in-out infinite;
}
@keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: .3; } }

/* ─── Toolbar ─── */
.toolbar {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 24px;
}
.tabs { display: flex; gap: 6px; }
.tab-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 20px; border-radius: 10px;
  border: 1px solid #dee2e6;
  background: #ffffff;
  color: #6c757d;
  font-family: 'DM Sans', sans-serif; font-size: .88rem; font-weight: 500;
  cursor: pointer; transition: all .2s;
}
.tab-btn:hover { background: #f8f9fa; color: #1a1a1a; }
.tab-btn.active {
  background: rgba(0,102,255,0.08);
  border-color: rgba(0,102,255,0.3);
  color: #0066FF;
}
.tab-badge {
  font-size: .7rem; font-weight: 700;
  padding: 2px 7px; border-radius: 10px;
  background: #ef4444; color: #fff;
  font-family: 'Space Mono', monospace;
}

.mark-all-btn {
  padding: 9px 18px; border-radius: 10px;
  border: 1px solid rgba(0,102,255,0.3);
  background: rgba(0,102,255,0.08);
  color: #0066FF; font-family: 'DM Sans', sans-serif; font-size: .85rem;
  cursor: pointer; transition: all .2s;
}
.mark-all-btn:hover { background: rgba(0,102,255,0.12); }

/* ─── Notice List ─── */
.notice-list { display: flex; flex-direction: column; gap: 10px; }

.notice-card {
  display: flex; align-items: flex-start; gap: 14px;
  padding: 20px; border-radius: 14px;
  background: #ffffff;
  border: 1px solid #e9ecef;
  position: relative; overflow: hidden;
  transition: all .25s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.notice-card:hover {
  background: #f8f9fa;
  border-color: #dee2e6;
  transform: translateX(4px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}
.notice-card.unread {
  background: rgba(0,102,255,0.03);
  border-color: rgba(0,102,255,0.2);
}

.unread-bar {
  position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
  background: linear-gradient(180deg, #0066FF, #8B5CF6);
  border-radius: 2px 0 0 2px;
}

.notice-icon-wrap {
  width: 42px; height: 42px; border-radius: 11px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; font-size: 18px;
}
.notice-icon-wrap.system   { background: rgba(0,102,255,0.1); }
.notice-icon-wrap.personal { background: rgba(139,92,246,0.1); }

.notice-body { flex: 1; min-width: 0; }
.notice-top {
  display: flex; justify-content: space-between; align-items: flex-start;
  gap: 12px; margin-bottom: 7px;
}
.notice-title {
  font-size: .95rem; font-weight: 600; margin: 0;
  color: #1a1a1a;
}
.notice-meta { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.notice-time { font-size: .75rem; color: #adb5bd; font-family: 'Space Mono', monospace; }
.unread-tag {
  font-size: .68rem; padding: 2px 7px; border-radius: 10px;
  background: rgba(0,102,255,0.1); color: #0066FF;
  font-family: 'Space Mono', monospace; font-weight: 700;
}
.notice-msg {
  font-size: .85rem; color: #6c757d;
  line-height: 1.6; margin: 0;
}

/* ─── Empty ─── */
.empty-state {
  text-align: center; padding: 80px 20px;
}
.empty-icon {
  font-size: 4rem; color: #dee2e6;
  font-family: 'Space Mono', monospace;
  margin-bottom: 20px;
}
.empty-title { font-size: 1.05rem; font-weight: 500; color: #6c757d; margin: 0 0 6px; }
.empty-sub   { font-size: .82rem; color: #adb5bd; margin: 0; }

/* ─── Toast ─── */
.toast {
  position: fixed; top: 28px; right: 28px; z-index: 200;
  display: flex; align-items: center; gap: 10px;
  padding: 12px 20px; border-radius: 12px;
  font-size: .88rem; font-weight: 500;
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.1);
}
.toast.ok  { background: rgba(6,214,160,0.1); border: 1px solid rgba(6,214,160,0.3); color: #059669; }
.toast.err { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: #dc2626; }
.toast-icon { font-size: 15px; font-weight: 700; }

/* ─── Transitions ─── */
.toast-enter-active, .toast-leave-active { transition: all .3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(18px); }

.notice-enter-active { transition: all .3s ease; }
.notice-leave-active { transition: all .25s ease; }
.notice-enter-from   { opacity: 0; transform: translateY(10px); }
.notice-leave-to     { opacity: 0; transform: translateX(20px); }

/* ─── Responsive ─── */
@media (max-width: 600px) {
  .nc-layout { padding: 28px 16px 60px; }
  .page-title { font-size: 1.4rem; }
  .notice-card { padding: 16px; }
  .toolbar { flex-direction: column; align-items: stretch; gap: 10px; }
  .tabs { justify-content: stretch; }
  .tab-btn { flex: 1; justify-content: center; }
  .mark-all-btn { text-align: center; }
}
</style>