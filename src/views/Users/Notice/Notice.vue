<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeTab = ref<'system' | 'personal'>('system')
const notices = ref<any[]>([])

// ─── Toast ────────────────────────────────────────────────────────
const toast = ref<{ msg: string; type: 'ok' | 'err' } | null>(null)
const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
  toast.value = { msg, type }
  setTimeout(() => (toast.value = null), 2800)
}

onMounted(() => {
  loadNotices()
})

const loadNotices = () => {
  const systemNoticesStr = localStorage.getItem('systemNotices')
  const userNoticesStr = localStorage.getItem('userNotices')
  const systemNotices = systemNoticesStr ? JSON.parse(systemNoticesStr) : []
  const userNotices = userNoticesStr ? JSON.parse(userNoticesStr) : []

  // Demo data if empty
  const demoSystem = systemNotices.length ? systemNotices : [
    { id: 's1', title: '平台维护公告', message: '系统将于本周六凌晨 2:00 ~ 4:00 进行例行维护，期间服务暂停。', timestamp: Date.now() - 3600000, isRead: false },
    { id: 's2', title: '新功能上线：AI 学习助手', message: '我们全新推出 AI 驱动的学习路径规划功能，立即体验个性化课程推荐。', timestamp: Date.now() - 86400000, isRead: true },
    { id: 's3', title: '服务条款更新', message: '我们更新了用户服务协议，请在继续使用前查阅最新条款内容。', timestamp: Date.now() - 172800000, isRead: true },
  ]
  const demoUser = userNotices.length ? userNotices : [
    { id: 'u1', title: '您的课程证书已生成', message: '恭喜完成「SUBARU BRZ 改装教程」，您的结课证书已可下载。', timestamp: Date.now() - 7200000, isRead: false },
    { id: 'u2', title: '学习目标提醒', message: '距本周学习目标还差 2 小时，坚持一下就能达成！', timestamp: Date.now() - 43200000, isRead: false },
    { id: 'u3', title: '积分到账通知', message: '您通过每日学习获得 +50 积分，当前总积分：4820。', timestamp: Date.now() - 259200000, isRead: true },
  ]

  notices.value = [
    ...demoSystem.map((n: any) => ({ ...n, type: 'system' })),
    ...demoUser.map((n: any) => ({ ...n, type: 'personal' }))
  ]
}

const filteredNotices = computed(() =>
    notices.value.filter(n => n.type === activeTab.value)
)

const unreadCount = computed(() => notices.value.filter(n => !n.isRead).length)
const unreadSystem = computed(() => notices.value.filter(n => n.type === 'system' && !n.isRead).length)
const unreadPersonal = computed(() => notices.value.filter(n => n.type === 'personal' && !n.isRead).length)

const markAsRead = (notice: any) => {
  notice.isRead = true
  window.dispatchEvent(new Event('storage'))
}

const markAllAsRead = () => {
  filteredNotices.value.forEach(n => { n.isRead = true })
  window.dispatchEvent(new Event('storage'))
  showToast('已全部标记为已读')
}

const deleteNotice = (notice: any) => {
  notices.value = notices.value.filter(n => n.id !== notice.id)
  showToast('通知已删除')
}

const getTimeAgo = (timestamp: number) => {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  const d = new Date(timestamp)
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

    <!-- Toast -->
    <Transition name="toast">
      <div v-if="toast" class="toast" :class="toast.type">
        <span class="toast-icon">{{ toast.type === 'ok' ? '✓' : '✕' }}</span>
        {{ toast.msg }}
      </div>
    </Transition>

    <div class="nc-layout">

      <!-- ── Header ── -->
      <div class="nc-header">
        <button class="back-btn" @click="goBack">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div class="header-text">
          <h1 class="page-title">消息通知</h1>
          <p class="page-sub">管理你的系统与个人通知</p>
        </div>
        <div class="unread-pill" v-if="unreadCount > 0">
          <span class="unread-dot" />
          {{ unreadCount }} 条未读
        </div>
      </div>

      <!-- ── Tabs + Actions ── -->
      <div class="toolbar">
        <div class="tabs">
          <button
              v-for="tab in [
              { key: 'system',   label: '系统通知', count: unreadSystem },
              { key: 'personal', label: '个人通知', count: unreadPersonal },
            ]"
              :key="tab.key"
              class="tab-btn"
              :class="{ active: activeTab === tab.key }"
              @click="activeTab = tab.key as any"
          >
            {{ tab.label }}
            <span v-if="tab.count > 0" class="tab-badge">{{ tab.count }}</span>
          </button>
        </div>
        <button class="mark-all-btn" @click="markAllAsRead"
                v-if="filteredNotices.some(n => !n.isRead)">
          全部已读
        </button>
      </div>

      <!-- ── Notice List ── -->
      <div class="notice-list">
        <TransitionGroup name="notice">
          <div
              v-for="notice in filteredNotices"
              :key="notice.id"
              class="notice-card"
              :class="{ unread: !notice.isRead }"
          >
            <!-- Unread indicator -->
            <div class="unread-bar" v-if="!notice.isRead" />

            <div class="notice-icon-wrap" :class="notice.type">
              <span v-if="notice.type === 'system'">📢</span>
              <span v-else>🔔</span>
            </div>

            <div class="notice-body">
              <div class="notice-top">
                <h3 class="notice-title">{{ notice.title }}</h3>
                <div class="notice-meta">
                  <span class="notice-time">{{ getTimeAgo(notice.timestamp) }}</span>
                  <span v-if="!notice.isRead" class="unread-tag">未读</span>
                </div>
              </div>
              <p class="notice-msg">{{ notice.message }}</p>
            </div>

            <div class="notice-actions">
              <button v-if="!notice.isRead" class="act-btn read" @click="markAsRead(notice)" title="标记已读">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </button>
              <button class="act-btn del" @click="deleteNotice(notice)" title="删除">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
              </button>
            </div>
          </div>
        </TransitionGroup>

        <!-- Empty -->
        <div v-if="filteredNotices.length === 0" class="empty-state">
          <div class="empty-icon">◎</div>
          <p class="empty-title">暂无{{ activeTab === 'system' ? '系统' : '个人' }}通知</p>
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
  background: #070b10;
  color: #e8eaf0;
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
  background: radial-gradient(circle, #3a5bd9, transparent);
  top: -250px; right: -200px;
  animation: pulse1 16s ease-in-out infinite alternate;
}
.orb2 {
  width: 450px; height: 450px;
  background: radial-gradient(circle, #7c3aed, transparent);
  bottom: -100px; left: -100px;
  animation: pulse2 20s ease-in-out infinite alternate;
}
@keyframes pulse1 { to { transform: translate(-40px, 60px) scale(1.1); } }
@keyframes pulse2 { to { transform: translate(40px, -40px) scale(0.95); } }
.bg-grid {
  position: absolute; inset: 0;
  background-image:
      linear-gradient(rgba(255,255,255,.022) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,.022) 1px, transparent 1px);
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
  background: rgba(255,255,255,.07);
  border: 1px solid rgba(255,255,255,.1);
  color: rgba(255,255,255,.7); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all .2s;
}
.back-btn:hover { background: rgba(255,255,255,.14); color: #fff; transform: translateX(-2px); }
.header-text { flex: 1; }
.page-title { font-size: 1.7rem; font-weight: 600; margin: 0 0 2px; }
.page-sub { font-size: .82rem; color: rgba(255,255,255,.38); margin: 0; }

.unread-pill {
  display: flex; align-items: center; gap: 7px;
  padding: 7px 14px; border-radius: 20px;
  background: rgba(255,77,109,.1);
  border: 1px solid rgba(255,77,109,.25);
  color: #ff6b8a; font-size: .8rem; font-weight: 500;
  font-family: 'Space Mono', monospace;
}
.unread-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #ff4d6d;
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
  border: 1px solid rgba(255,255,255,.08);
  background: rgba(255,255,255,.04);
  color: rgba(255,255,255,.45);
  font-family: 'DM Sans', sans-serif; font-size: .88rem; font-weight: 500;
  cursor: pointer; transition: all .2s;
}
.tab-btn:hover { background: rgba(255,255,255,.08); color: rgba(255,255,255,.8); }
.tab-btn.active {
  background: rgba(79,110,247,.18);
  border-color: rgba(79,110,247,.4);
  color: #7c9ff5;
}
.tab-badge {
  font-size: .7rem; font-weight: 700;
  padding: 2px 7px; border-radius: 10px;
  background: #ff4d6d; color: #fff;
  font-family: 'Space Mono', monospace;
}

.mark-all-btn {
  padding: 9px 18px; border-radius: 10px;
  border: 1px solid rgba(79,110,247,.3);
  background: rgba(79,110,247,.1);
  color: #7c9ff5; font-family: 'DM Sans', sans-serif; font-size: .85rem;
  cursor: pointer; transition: all .2s;
}
.mark-all-btn:hover { background: rgba(79,110,247,.2); }

/* ─── Notice List ─── */
.notice-list { display: flex; flex-direction: column; gap: 10px; }

.notice-card {
  display: flex; align-items: flex-start; gap: 14px;
  padding: 20px; border-radius: 14px;
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.07);
  position: relative; overflow: hidden;
  transition: all .25s;
}
.notice-card:hover {
  background: rgba(255,255,255,.07);
  border-color: rgba(255,255,255,.12);
  transform: translateX(4px);
}
.notice-card.unread {
  background: rgba(79,110,247,.05);
  border-color: rgba(79,110,247,.15);
}

.unread-bar {
  position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
  background: linear-gradient(180deg, #4f6ef7, #a855f7);
  border-radius: 2px 0 0 2px;
}

.notice-icon-wrap {
  width: 42px; height: 42px; border-radius: 11px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; font-size: 18px;
}
.notice-icon-wrap.system   { background: rgba(79,110,247,.15); }
.notice-icon-wrap.personal { background: rgba(168,85,247,.15); }

.notice-body { flex: 1; min-width: 0; }
.notice-top {
  display: flex; justify-content: space-between; align-items: flex-start;
  gap: 12px; margin-bottom: 7px;
}
.notice-title {
  font-size: .95rem; font-weight: 600; margin: 0;
  color: #e8eaf0;
}
.notice-meta { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.notice-time { font-size: .75rem; color: rgba(255,255,255,.3); font-family: 'Space Mono', monospace; }
.unread-tag {
  font-size: .68rem; padding: 2px 7px; border-radius: 10px;
  background: rgba(79,110,247,.2); color: #7c9ff5;
  font-family: 'Space Mono', monospace; font-weight: 700;
}
.notice-msg {
  font-size: .85rem; color: rgba(255,255,255,.5);
  line-height: 1.6; margin: 0;
}

.notice-actions { display: flex; flex-direction: column; gap: 7px; flex-shrink: 0; }
.act-btn {
  width: 30px; height: 30px; border-radius: 8px; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all .2s;
}
.act-btn.read { background: rgba(6,214,160,.1); color: #06d6a0; }
.act-btn.read:hover { background: rgba(6,214,160,.22); }
.act-btn.del { background: rgba(255,77,109,.1); color: #ff4d6d; }
.act-btn.del:hover { background: rgba(255,77,109,.22); }

/* ─── Empty ─── */
.empty-state {
  text-align: center; padding: 80px 20px;
}
.empty-icon {
  font-size: 4rem; color: rgba(255,255,255,.12);
  font-family: 'Space Mono', monospace;
  margin-bottom: 20px;
}
.empty-title { font-size: 1.05rem; font-weight: 500; color: rgba(255,255,255,.35); margin: 0 0 6px; }
.empty-sub   { font-size: .82rem; color: rgba(255,255,255,.2); margin: 0; }

/* ─── Toast ─── */
.toast {
  position: fixed; top: 28px; right: 28px; z-index: 200;
  display: flex; align-items: center; gap: 10px;
  padding: 12px 20px; border-radius: 12px;
  font-size: .88rem; font-weight: 500;
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 30px rgba(0,0,0,.4);
}
.toast.ok  { background: rgba(6,214,160,.15); border: 1px solid rgba(6,214,160,.3); color: #06d6a0; }
.toast.err { background: rgba(255,77,109,.15); border: 1px solid rgba(255,77,109,.3); color: #ff4d6d; }
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