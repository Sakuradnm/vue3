<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Post {
  id: number
  title: string
  content: string
  author: string
  initials: string
  avatarColor: string
  category: string
  tags: string[]
  likes: number
  comments: number
  views: number
  createdAt: string
  isLiked: boolean
  isPinned?: boolean
  isHot?: boolean
}

const activeCategory = ref('all')
const searchQuery = ref('')
const showPostModal = ref(false)
const newPostTitle = ref('')
const newPostContent = ref('')
const newPostCategory = ref('math')
const newPostTags = ref('')
const mouseX = ref(0)
const mouseY = ref(0)

const categories = [
  { id: 'all', name: '全部', emoji: '✦' },
  { id: 'math', name: '数学', emoji: '∑' },
  { id: 'science', name: '理科', emoji: '⚗' },
  { id: 'language', name: '语文英语', emoji: '✍' },
  { id: 'history', name: '历史地理', emoji: '🌐' },
  { id: 'exam', name: '备考经验', emoji: '🎯' },
  { id: 'resource', name: '资料分享', emoji: '📂' },
]

const posts = ref<Post[]>([
  {
    id: 1,
    title: '高数微积分学习路线分享 — 从入门到精通',
    content: '整理了一份完整的高数学习路线，涵盖极限、导数、积分，附带习题集和视频资源，适合大一新生和考研备考...',
    author: '数学达人',
    initials: 'SX',
    avatarColor: '#6C63FF',
    category: 'math',
    tags: ['高数', '微积分', '考研'],
    likes: 342, comments: 87, views: 5821,
    createdAt: '2 小时前',
    isLiked: false, isPinned: true, isHot: true
  },
  {
    id: 2,
    title: '大学物理公式速查手册 PDF — 期末必备',
    content: '自己整理的大物公式手册，包含力学、热学、电磁学、光学全部核心公式，已经帮助 500+ 同学顺利通过...',
    author: '物理小能手',
    initials: 'WL',
    avatarColor: '#00C9A7',
    category: 'science',
    tags: ['大物', '公式', '期末'],
    likes: 521, comments: 134, views: 9230,
    createdAt: '5 小时前',
    isLiked: true, isHot: true
  },
  {
    id: 3,
    title: '四六级备考策略 — 60 天从 400 到 600 分',
    content: '分享我自己的备考经历，重点讲听力突破方法、阅读技巧和写作模板，附带单词书推荐和刷题网站...',
    author: 'CET达人',
    initials: 'CE',
    avatarColor: '#FF6B6B',
    category: 'language',
    tags: ['四六级', '英语', '备考'],
    likes: 289, comments: 96, views: 4150,
    createdAt: '1 天前',
    isLiked: false
  },
  {
    id: 4,
    title: '线性代数思维导图 — 期末冲刺版',
    content: '用思维导图梳理线性代数核心知识点：行列式、矩阵、向量空间、线性变换，视觉化理解更轻松...',
    author: '代数控',
    initials: 'DX',
    avatarColor: '#FFB347',
    category: 'math',
    tags: ['线代', '思维导图', '冲刺'],
    likes: 198, comments: 45, views: 3340,
    createdAt: '2 天前',
    isLiked: false
  },
  {
    id: 5,
    title: '考研政治马原知识体系构建方法论',
    content: '从框架到细节，带你系统梳理马克思主义哲学、政治经济学和科学社会主义，逻辑理解比死记硬背有效 10 倍...',
    author: '政治满分',
    initials: 'ZZ',
    avatarColor: '#C56BFF',
    category: 'exam',
    tags: ['考研', '政治', '马原'],
    likes: 412, comments: 201, views: 7890,
    createdAt: '3 天前',
    isLiked: true
  },
  {
    id: 6,
    title: '免费学习网站大合集 — 收藏起来备用',
    content: '整理了 30+ 个免费优质学习平台：Khan Academy、Coursera 免费课、B 站公开课等，各学科全覆盖...',
    author: '资源猎手',
    initials: 'ZY',
    avatarColor: '#4ECDC4',
    category: 'resource',
    tags: ['免费资源', '网站', '合集'],
    likes: 876, comments: 234, views: 15600,
    createdAt: '1 周前',
    isLiked: false, isHot: true
  }
])

const filteredPosts = computed(() => {
  let result = posts.value
  if (activeCategory.value !== 'all') {
    result = result.filter(p => p.category === activeCategory.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
    )
  }
  return result
})

const totalStats = computed(() => ({
  posts: posts.value.length * 128,
  likes: posts.value.reduce((s, p) => s + p.likes, 0) * 14,
  views: posts.value.reduce((s, p) => s + p.views, 0)
}))

const toggleLike = (post: Post) => {
  post.isLiked = !post.isLiked
  post.likes += post.isLiked ? 1 : -1
}

const createPost = () => {
  if (!newPostTitle.value.trim() || !newPostContent.value.trim()) return
  const tags = newPostTags.value.split(/[,，]/).map(t => t.trim()).filter(Boolean)
  posts.value.unshift({
    id: Date.now(),
    title: newPostTitle.value,
    content: newPostContent.value,
    author: '当前用户',
    initials: 'ME',
    avatarColor: '#6C63FF',
    category: newPostCategory.value,
    tags,
    likes: 0, comments: 0, views: 0,
    createdAt: '刚刚',
    isLiked: false
  })
  showPostModal.value = false
  newPostTitle.value = ''
  newPostContent.value = ''
  newPostTags.value = ''
}

const fmt = (n: number) => {
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return n.toString()
}

const handleMouseMove = (e: MouseEvent) => {
  mouseX.value = e.clientX
  mouseY.value = e.clientY
}

onMounted(() => window.addEventListener('mousemove', handleMouseMove))
onUnmounted(() => window.removeEventListener('mousemove', handleMouseMove))
</script>

<template>
  <div class="forum-root">
    <!-- Cursor ambient glow -->
    <div class="cursor-glow" :style="{ left: mouseX + 'px', top: mouseY + 'px' }" />
    <div class="bg-grid" />
    <div class="bg-orb orb1" />
    <div class="bg-orb orb2" />

    <!-- HERO -->
    <section class="hero">
      <div class="eyebrow">
        <span class="pulse-dot" /><span>知识共享平台 · LEARN TOGETHER</span>
      </div>
      <h1 class="hero-title">
        <span class="t1">一起学习</span>
        <span class="t2">共同进步</span>
      </h1>
      <p class="hero-sub">优质学习资料 · 学习心得分享 · 与同学共同成长</p>
      <div class="stats-bar">
        <div class="stat"><span class="sn">{{ fmt(totalStats.posts) }}</span><span class="sl">篇帖子</span></div>
        <div class="sd" /><div class="stat"><span class="sn">{{ fmt(totalStats.likes) }}</span><span class="sl">次点赞</span></div>
        <div class="sd" /><div class="stat"><span class="sn">{{ fmt(totalStats.views) }}+</span><span class="sl">次浏览</span></div>
      </div>
      <button class="hero-btn" @click="showPostModal = true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
        发布帖子
      </button>
    </section>

    <!-- SEARCH -->
    <div class="search-wrap">
      <div class="search-box">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input v-model="searchQuery" placeholder="搜索课程、资料、学习方法..." />
        <kbd v-if="!searchQuery">⌘K</kbd>
      </div>
    </div>

    <!-- CATEGORIES -->
    <nav class="cat-nav">
      <button
          v-for="cat in categories" :key="cat.id"
          class="cat-pill" :class="{ active: activeCategory === cat.id }"
          @click="activeCategory = cat.id"
      >
        <span>{{ cat.emoji }}</span> {{ cat.name }}
      </button>
    </nav>

    <!-- POSTS -->
    <main class="posts-grid">
      <article
          v-for="(post, i) in filteredPosts" :key="post.id"
          class="post-card" :class="{ pinned: post.isPinned }"
          :style="{ animationDelay: i * 70 + 'ms' }"
      >
        <div class="card-glow" :style="{ background: post.avatarColor }" />

        <div class="card-badges" v-if="post.isPinned || post.isHot">
          <span v-if="post.isPinned" class="badge bp">📌 置顶</span>
          <span v-if="post.isHot" class="badge bh">🔥 热门</span>
        </div>

        <div class="card-meta">
          <div class="avatar" :style="{ background: post.avatarColor }">{{ post.initials }}</div>
          <div>
            <div class="aname">{{ post.author }}</div>
            <div class="atime">{{ post.createdAt }}</div>
          </div>
          <div class="ctag">{{ categories.find(c => c.id === post.category)?.name }}</div>
        </div>

        <h3 class="card-title">{{ post.title }}</h3>
        <p class="card-body">{{ post.content }}</p>

        <div class="card-tags">
          <span v-for="tag in post.tags" :key="tag" class="tag">#{{ tag }}</span>
        </div>

        <div class="card-footer">
          <button class="stat-btn" :class="{ liked: post.isLiked }" @click.stop="toggleLike(post)">
            <svg width="15" height="15" viewBox="0 0 24 24" :fill="post.isLiked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            {{ fmt(post.likes) }}
          </button>
          <button class="stat-btn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            {{ fmt(post.comments) }}
          </button>
          <button class="stat-btn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            {{ fmt(post.views) }}
          </button>
          <span class="card-arrow">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </span>
        </div>
      </article>

      <div v-if="filteredPosts.length === 0" class="empty">
        <div class="empty-icon">🔍</div>
        <p>暂无相关内容</p>
        <button class="hero-btn small" @click="searchQuery = ''; activeCategory = 'all'">清除筛选</button>
      </div>
    </main>

    <!-- MODAL -->
    <Teleport to="body">
      <Transition name="mfade">
        <div v-if="showPostModal" class="overlay" @click.self="showPostModal = false">
          <Transition name="mslide">
            <div v-if="showPostModal" class="modal">
              <div class="mhead">
                <h2>发布新帖</h2>
                <button class="xbtn" @click="showPostModal = false">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
              </div>
              <div class="mbody">
                <div class="field">
                  <label>标题 <span class="req">*</span></label>
                  <input v-model="newPostTitle" placeholder="起一个吸引人的标题..." maxlength="60" />
                  <span class="cc">{{ newPostTitle.length }}/60</span>
                </div>
                <div class="field">
                  <label>分类 <span class="req">*</span></label>
                  <select v-model="newPostCategory">
                    <option v-for="cat in categories.slice(1)" :key="cat.id" :value="cat.id">
                      {{ cat.emoji }} {{ cat.name }}
                    </option>
                  </select>
                </div>
                <div class="field">
                  <label>内容 <span class="req">*</span></label>
                  <textarea v-model="newPostContent" placeholder="分享你的学习心得、资料内容或疑问..." rows="6" />
                </div>
                <div class="field">
                  <label>标签（逗号分隔）</label>
                  <input v-model="newPostTags" placeholder="如：高数, 期末, 资料" />
                </div>
              </div>
              <div class="mfoot">
                <button class="cbtn" @click="showPostModal = false">取消</button>
                <button class="sbtn" @click="createPost" :disabled="!newPostTitle.trim() || !newPostContent.trim()">发布帖子 →</button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,400&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.forum-root {
  font-family: 'DM Sans', sans-serif;
  min-height: 100vh;
  background: #060912;
  color: #dde1ed;
  overflow-x: hidden;
  position: relative;
}

/* BG */
.cursor-glow {
  position: fixed; width: 700px; height: 700px; border-radius: 50%;
  background: radial-gradient(circle, rgba(108,99,255,0.07) 0%, transparent 65%);
  transform: translate(-50%,-50%); pointer-events: none; z-index: 0;
  transition: left 0.12s linear, top 0.12s linear;
}
.bg-grid {
  position: fixed; inset: 0;
  background-image: linear-gradient(rgba(108,99,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(108,99,255,0.035) 1px, transparent 1px);
  background-size: 56px 56px; z-index: 0; pointer-events: none;
}
.bg-orb {
  position: fixed; border-radius: 50%; filter: blur(120px); pointer-events: none; z-index: 0;
  animation: orbFloat 12s ease-in-out infinite alternate;
}
.orb1 { width: 500px; height: 500px; background: rgba(108,99,255,0.12); top: -200px; left: -100px; }
.orb2 { width: 400px; height: 400px; background: rgba(0,201,167,0.08); bottom: -100px; right: -100px; animation-delay: -6s; }
@keyframes orbFloat { from { transform: translate(0,0) scale(1); } to { transform: translate(40px,30px) scale(1.1); } }

/* HERO */
.hero { position: relative; z-index: 1; text-align: center; padding: 110px 24px 64px; }

.eyebrow {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(108,99,255,0.1); border: 1px solid rgba(108,99,255,0.22);
  border-radius: 100px; padding: 5px 16px; margin-bottom: 28px;
  font-size: 0.82rem; font-weight: 500; color: #9d96ff; letter-spacing: 0.05em; text-transform: uppercase;
}
.pulse-dot {
  width: 7px; height: 7px; border-radius: 50%; background: #6C63FF;
  box-shadow: 0 0 0 0 rgba(108,99,255,0.5);
  animation: pulse 2s infinite;
}
@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(108,99,255,0.5); } 70% { box-shadow: 0 0 0 8px rgba(108,99,255,0); } 100% { box-shadow: 0 0 0 0 rgba(108,99,255,0); } }

.hero-title {
  font-family: 'Syne', sans-serif;
  font-size: clamp(2.8rem, 9vw, 5.8rem);
  font-weight: 800; line-height: 1.0; letter-spacing: -0.04em;
  margin-bottom: 20px; display: flex; flex-direction: column; align-items: center; gap: 4px;
}
.t1 { color: #e8eaf0; animation: fadeUp 0.7s ease both; }
.t2 {
  background: linear-gradient(135deg, #6C63FF 0%, #00C9A7 55%, #FFB347 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  animation: fadeUp 0.7s 0.1s ease both;
}
@keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

.hero-sub { color: rgba(221,225,237,0.45); font-size: 1.1rem; font-weight: 300; margin-bottom: 36px; letter-spacing: 0.01em; animation: fadeUp 0.7s 0.2s ease both; }

.stats-bar {
  display: inline-flex; align-items: center; gap: 0;
  background: rgba(255,255,255,0.028); border: 1px solid rgba(255,255,255,0.07);
  border-radius: 18px; padding: 16px 32px; margin-bottom: 36px;
  backdrop-filter: blur(16px); animation: fadeUp 0.7s 0.3s ease both;
}
.stat { text-align: center; padding: 0 24px; }
.sn { display: block; font-family: 'Syne', sans-serif; font-size: 1.6rem; font-weight: 700; color: #fff; letter-spacing: -0.02em; }
.sl { font-size: 0.76rem; color: rgba(221,225,237,0.38); font-weight: 300; }
.sd { width: 1px; height: 32px; background: rgba(255,255,255,0.07); }

.hero-btn {
  display: inline-flex; align-items: center; gap: 8px;
  background: linear-gradient(135deg, #6C63FF 0%, #4ECDC4 100%);
  border: none; border-radius: 100px; color: #fff;
  font-family: 'DM Sans', sans-serif; font-size: 0.97rem; font-weight: 500;
  padding: 14px 32px; cursor: pointer;
  transition: all 0.35s cubic-bezier(0.34,1.56,0.64,1);
  box-shadow: 0 8px 32px rgba(108,99,255,0.35);
  animation: fadeUp 0.7s 0.4s ease both;
}
.hero-btn:hover { transform: translateY(-3px) scale(1.03); box-shadow: 0 16px 48px rgba(108,99,255,0.55); }
.hero-btn.small { font-size: 0.88rem; padding: 10px 24px; margin-top: 14px; animation: none; }

/* SEARCH */
.search-wrap { position: relative; z-index: 1; max-width: 560px; margin: 0 auto 28px; padding: 0 24px; }
.search-box {
  display: flex; align-items: center; gap: 12px;
  background: rgba(255,255,255,0.035); border: 1px solid rgba(255,255,255,0.09);
  border-radius: 16px; padding: 14px 20px; backdrop-filter: blur(12px);
  transition: all 0.25s ease;
}
.search-box:focus-within { border-color: rgba(108,99,255,0.45); background: rgba(108,99,255,0.055); box-shadow: 0 0 0 3px rgba(108,99,255,0.1); }
.search-box svg { color: rgba(221,225,237,0.3); flex-shrink: 0; }
.search-box input { flex: 1; background: none; border: none; color: #dde1ed; font-family: 'DM Sans', sans-serif; font-size: 0.95rem; outline: none; }
.search-box input::placeholder { color: rgba(221,225,237,0.28); }
kbd { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 2px 8px; font-size: 0.76rem; color: rgba(221,225,237,0.3); }

/* CATEGORIES */
.cat-nav { position: relative; z-index: 1; display: flex; gap: 8px; padding: 0 24px 32px; overflow-x: auto; scrollbar-width: none; max-width: 1200px; margin: 0 auto; }
.cat-nav::-webkit-scrollbar { display: none; }
.cat-pill {
  display: inline-flex; align-items: center; gap: 6px; flex-shrink: 0;
  background: rgba(255,255,255,0.035); border: 1px solid rgba(255,255,255,0.075);
  border-radius: 100px; color: rgba(221,225,237,0.55);
  font-family: 'DM Sans', sans-serif; font-size: 0.87rem; font-weight: 400;
  padding: 8px 18px; cursor: pointer; transition: all 0.22s ease;
}
.cat-pill:hover { background: rgba(255,255,255,0.07); color: #dde1ed; }
.cat-pill.active { background: rgba(108,99,255,0.18); border-color: rgba(108,99,255,0.38); color: #a09fff; }

/* GRID */
.posts-grid {
  position: relative; z-index: 1;
  display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 20px; padding: 0 24px 100px; max-width: 1200px; margin: 0 auto;
}

/* CARD */
.post-card {
  position: relative;
  background: rgba(255,255,255,0.022); border: 1px solid rgba(255,255,255,0.065);
  border-radius: 22px; padding: 26px; cursor: pointer; overflow: hidden;
  transition: all 0.38s cubic-bezier(0.34,1.3,0.64,1);
  animation: cardIn 0.55s ease both;
}
@keyframes cardIn { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }
.post-card:hover { border-color: rgba(108,99,255,0.28); transform: translateY(-8px) scale(1.01); box-shadow: 0 28px 70px rgba(0,0,0,0.55); }
.post-card.pinned { border-color: rgba(108,99,255,0.18); background: rgba(108,99,255,0.035); }

.card-glow {
  position: absolute; width: 220px; height: 220px; border-radius: 50%;
  bottom: -90px; right: -90px; opacity: 0; filter: blur(70px);
  transition: opacity 0.5s ease; pointer-events: none;
}
.post-card:hover .card-glow { opacity: 0.18; }

.card-badges { display: flex; gap: 6px; margin-bottom: 14px; }
.badge { font-size: 0.73rem; font-weight: 500; padding: 3px 10px; border-radius: 100px; }
.bp { background: rgba(108,99,255,0.14); color: #a09fff; border: 1px solid rgba(108,99,255,0.22); }
.bh { background: rgba(255,107,107,0.1); color: #ff9090; border: 1px solid rgba(255,107,107,0.18); }

.card-meta { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.avatar {
  width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.77rem; color: #fff;
}
.aname { font-size: 0.87rem; font-weight: 500; color: #e8eaf0; }
.atime { font-size: 0.77rem; color: rgba(221,225,237,0.32); }
.ctag { margin-left: auto; font-size: 0.77rem; color: rgba(221,225,237,0.45); background: rgba(255,255,255,0.045); border: 1px solid rgba(255,255,255,0.07); border-radius: 8px; padding: 3px 10px; }

.card-title { font-family: 'Syne', sans-serif; font-size: 1.05rem; font-weight: 700; color: #fff; line-height: 1.4; margin-bottom: 10px; letter-spacing: -0.01em; }
.card-body { font-size: 0.875rem; color: rgba(221,225,237,0.48); line-height: 1.75; font-weight: 300; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 16px; }

.card-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 20px; }
.tag { font-size: 0.75rem; color: #6C63FF; background: rgba(108,99,255,0.1); border-radius: 6px; padding: 2px 8px; font-weight: 500; }

.card-footer { display: flex; align-items: center; gap: 2px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.055); }
.stat-btn {
  display: inline-flex; align-items: center; gap: 5px;
  background: none; border: none; color: rgba(221,225,237,0.38);
  font-family: 'DM Sans', sans-serif; font-size: 0.82rem;
  cursor: pointer; padding: 6px 10px; border-radius: 8px; transition: all 0.2s ease;
}
.stat-btn:hover { color: #dde1ed; background: rgba(255,255,255,0.045); }
.stat-btn.liked { color: #ff6b6b; }
.card-arrow { margin-left: auto; color: rgba(221,225,237,0.18); display: flex; align-items: center; transition: all 0.3s ease; }
.post-card:hover .card-arrow { color: #6C63FF; transform: translateX(4px); }

/* EMPTY */
.empty { grid-column: 1/-1; text-align: center; padding: 80px 20px; color: rgba(221,225,237,0.35); }
.empty-icon { font-size: 3rem; margin-bottom: 14px; }

/* MODAL */
.overlay { position: fixed; inset: 0; background: rgba(6,9,18,0.88); backdrop-filter: blur(18px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 24px; }
.modal { background: #0e1321; border: 1px solid rgba(255,255,255,0.09); border-radius: 26px; width: 100%; max-width: 560px; max-height: 92vh; overflow-y: auto; box-shadow: 0 40px 120px rgba(0,0,0,0.85); }
.mhead { display: flex; justify-content: space-between; align-items: center; padding: 28px 32px 20px; border-bottom: 1px solid rgba(255,255,255,0.06); }
.mhead h2 { font-family: 'Syne', sans-serif; font-size: 1.4rem; font-weight: 700; color: #fff; }
.xbtn { background: rgba(255,255,255,0.055); border: none; color: rgba(221,225,237,0.6); width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease; }
.xbtn:hover { background: rgba(255,255,255,0.1); color: #fff; }
.mbody { padding: 24px 32px; display: flex; flex-direction: column; gap: 20px; }
.field { display: flex; flex-direction: column; gap: 7px; position: relative; }
.field label { font-size: 0.84rem; font-weight: 500; color: rgba(221,225,237,0.65); }
.req { color: #ff6b6b; }
.cc { position: absolute; right: 12px; bottom: 12px; font-size: 0.74rem; color: rgba(221,225,237,0.28); }
.field input, .field select, .field textarea {
  background: rgba(255,255,255,0.038); border: 1px solid rgba(255,255,255,0.085);
  border-radius: 12px; padding: 12px 16px; color: #dde1ed;
  font-family: 'DM Sans', sans-serif; font-size: 0.94rem; outline: none; transition: all 0.22s ease;
}
.field input:focus, .field select:focus, .field textarea:focus { border-color: rgba(108,99,255,0.5); background: rgba(108,99,255,0.048); box-shadow: 0 0 0 3px rgba(108,99,255,0.1); }
.field textarea { resize: vertical; line-height: 1.7; font-family: 'DM Sans', sans-serif; }
.field select option { background: #0e1321; }
.mfoot { display: flex; gap: 12px; justify-content: flex-end; padding: 20px 32px 28px; border-top: 1px solid rgba(255,255,255,0.055); }
.cbtn { background: rgba(255,255,255,0.055); border: 1px solid rgba(255,255,255,0.09); border-radius: 12px; color: rgba(221,225,237,0.65); font-family: 'DM Sans', sans-serif; font-size: 0.94rem; padding: 11px 24px; cursor: pointer; transition: all 0.2s; }
.cbtn:hover { background: rgba(255,255,255,0.09); }
.sbtn { background: linear-gradient(135deg, #6C63FF, #4ECDC4); border: none; border-radius: 12px; color: #fff; font-family: 'DM Sans', sans-serif; font-size: 0.94rem; font-weight: 500; padding: 11px 28px; cursor: pointer; transition: all 0.25s ease; box-shadow: 0 4px 20px rgba(108,99,255,0.3); }
.sbtn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(108,99,255,0.5); }
.sbtn:disabled { opacity: 0.38; cursor: not-allowed; }

/* TRANSITIONS */
.mfade-enter-active, .mfade-leave-active { transition: opacity 0.28s ease; }
.mfade-enter-from, .mfade-leave-to { opacity: 0; }
.mslide-enter-active, .mslide-leave-active { transition: all 0.35s cubic-bezier(0.34,1.56,0.64,1); }
.mslide-enter-from, .mslide-leave-to { opacity: 0; transform: scale(0.88) translateY(24px); }

/* RESPONSIVE */
@media (max-width: 768px) {
  .hero { padding: 80px 20px 48px; }
  .posts-grid { grid-template-columns: 1fr; padding: 0 16px 60px; }
  .stats-bar { padding: 12px 16px; }
  .stat { padding: 0 14px; }
  .modal { border-radius: 20px; }
  .mhead, .mbody, .mfoot { padding-left: 20px; padding-right: 20px; }
}
</style>