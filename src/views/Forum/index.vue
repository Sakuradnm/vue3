<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';

// ── State ────────────────────────────────────────────────
const activeCategory = ref('all');
const searchQuery = ref('');
const sortBy = ref('hot');
const showCompose = ref(false);
const likedPosts = reactive(new Set());
const bookmarked = reactive(new Set());
const hoveredPost = ref(-1);
const mouseX = ref(0);
const mouseY = ref(0);
let particleRafId = null;
let observers = [];

// ── Data ────────────────────────────────────────────────
const categories = [
  { id: 'all',      label: '全部',      icon: '◈', count: 128, color: '#00ffb4' },
  { id: 'frontend', label: '前端开发',  icon: '⬡', count: 42,  color: '#00c8ff' },
  { id: 'algo',     label: '算法与数据', icon: '◆', count: 31,  color: '#a78bfa' },
  { id: 'backend',  label: '后端架构',  icon: '◉', count: 28,  color: '#ff6b35' },
  { id: 'design',   label: 'UI/UX 设计',icon: '◇', count: 15,  color: '#ffd93d' },
  { id: 'career',   label: '求职经验',  icon: '◎', count: 12,  color: '#00ffb4' },
];

const posts = ref([
  {
    id: 1, category: 'frontend', categoryLabel: '前端开发',
    title: '分享：Vue 3 Composition API 完整工程实践笔记（含源码）',
    preview: '整理了三个月真实项目中的 Vue3 最佳实践，涵盖状态管理、组合式函数封装、性能优化等核心话题，附完整可运行示例代码。',
    author: 'fe_master', avatar: 'FM', avatarColor: '#00c8ff',
    time: '2小时前', views: 1842, likes: 234, comments: 67,
    tags: ['Vue3', 'Composition API', '工程实践'],
    pinned: true, solved: false, hot: true,
    score: 234,
  },
  {
    id: 2, category: 'algo', categoryLabel: '算法',
    title: '双指针 + 滑动窗口：从入门到 LeetCode Hard 的完整解题路径',
    preview: '系统梳理了双指针与滑动窗口的所有变体题型，每种模式配有思维导图与3道例题，刷完这份资料可以解决 90% 的相关题目。',
    author: 'algo_core', avatar: 'AC', avatarColor: '#a78bfa',
    time: '4小时前', views: 2310, likes: 389, comments: 92,
    tags: ['算法', 'LeetCode', '双指针'],
    pinned: false, solved: true, hot: true,
    score: 389,
  },
  {
    id: 3, category: 'backend', categoryLabel: '后端',
    title: '微服务架构实战：从单体到分布式的完整迁移指南',
    preview: '记录了我们团队半年的微服务改造历程，包含服务拆分策略、接口契约设计、分布式事务处理等核心难点，有踩坑记录。',
    author: 'backend_x', avatar: 'BX', avatarColor: '#ff6b35',
    time: '6小时前', views: 987, likes: 156, comments: 44,
    tags: ['微服务', 'Node.js', '架构设计'],
    pinned: false, solved: false, hot: false,
    score: 156,
  },
  {
    id: 4, category: 'design', categoryLabel: 'UI/UX',
    title: '2024 Figma 工作流：Auto Layout + Variables 完整教程',
    preview: '深度讲解 Figma 最新特性的实际应用，包含设计系统搭建、组件库规范、设计与开发交付规范，附 Figma 源文件。',
    author: 'ux_craft', avatar: 'UC', avatarColor: '#ffd93d',
    time: '昨天', views: 654, likes: 98, comments: 23,
    tags: ['Figma', '设计系统', 'Auto Layout'],
    pinned: false, solved: false, hot: false,
    score: 98,
  },
  {
    id: 5, category: 'frontend', categoryLabel: '前端',
    title: '【求助】TypeScript 泛型约束与条件类型的最佳实践？',
    preview: '在项目中遇到了一些复杂的泛型场景，想了解大家在实际项目中如何处理 infer、条件类型链、以及泛型函数重载等问题。',
    author: 'ts_learner', avatar: 'TL', avatarColor: '#00ffb4',
    time: '昨天', views: 432, likes: 45, comments: 38,
    tags: ['TypeScript', '泛型', '类型体操'],
    pinned: false, solved: false, hot: false,
    score: 45,
  },
  {
    id: 6, category: 'career', categoryLabel: '求职',
    title: '大厂前端面试总结：200 道高频题 + 答题框架（2024最新）',
    preview: '花了两个月整理的面试题库，涵盖字节、腾讯、阿里、美团等大厂真题，每道题都有详细解析和答题思路，亲测有效。',
    author: 'offer_hunter', avatar: 'OH', avatarColor: '#00c8ff',
    time: '2天前', views: 5621, likes: 892, comments: 213,
    tags: ['面试', '求职', '前端'],
    pinned: false, solved: false, hot: true,
    score: 892,
  },
  {
    id: 7, category: 'algo', categoryLabel: '算法',
    title: '图论精讲：BFS/DFS/Dijkstra 可视化教程 + 动画演示',
    preview: '用动画的方式讲解图论中最核心的几种算法，每个算法都有交互式可视化演示，学完能独立实现各类图论题目。',
    author: 'graph_viz', avatar: 'GV', avatarColor: '#a78bfa',
    time: '3天前', views: 1234, likes: 267, comments: 56,
    tags: ['图论', 'BFS', 'DFS', '可视化'],
    pinned: false, solved: true, hot: false,
    score: 267,
  },
  {
    id: 8, category: 'backend', categoryLabel: '后端',
    title: 'Redis 实战：缓存穿透、击穿、雪崩的终极解决方案',
    preview: '深度分析 Redis 在生产环境中的常见问题及其解决方案，包含布隆过滤器、互斥锁、多级缓存等核心设计模式。',
    author: 'redis_pro', avatar: 'RP', avatarColor: '#ff6b35',
    time: '3天前', views: 2108, likes: 334, comments: 78,
    tags: ['Redis', '缓存', '后端优化'],
    pinned: false, solved: false, hot: false,
    score: 334,
  },
]);

const hotTopics = [
  { rank: 1, title: 'Vue3 vs React 2024 大比拼', replies: 203, color: '#ff6b35' },
  { rank: 2, title: '大厂算法面试高频题汇总', replies: 187, color: '#ffd93d' },
  { rank: 3, title: 'TypeScript 5.0 新特性解析', replies: 134, color: '#a78bfa' },
  { rank: 4, title: '前端工程化最佳实践 2024', replies: 98, color: '#00c8ff' },
  { rank: 5, title: 'Docker + K8s 入门到实战', replies: 76, color: '#00ffb4' },
];

const activeUsers = [
  { name: 'fe_master', avatar: 'FM', color: '#00c8ff', posts: 42, online: true },
  { name: 'algo_core', avatar: 'AC', color: '#a78bfa', posts: 38, online: true },
  { name: 'redis_pro', avatar: 'RP', color: '#ff6b35', posts: 29, online: false },
  { name: 'ux_craft', avatar: 'UC', color: '#ffd93d', posts: 24, online: true },
];

// ── Computed ─────────────────────────────────────────────
const filteredPosts = computed(() => {
  let list = posts.value;
  if (activeCategory.value !== 'all') {
    list = list.filter(p => p.category === activeCategory.value);
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.preview.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
    );
  }
  list = [...list].sort((a, b) => {
    if (sortBy.value === 'hot') return b.score - a.score;
    if (sortBy.value === 'new') return b.id - a.id;
    if (sortBy.value === 'views') return b.views - a.views;
    return 0;
  });
  return list;
});

const activeCatData = computed(() =>
    categories.find(c => c.id === activeCategory.value) || categories[0]
);

// ── Actions ───────────────────────────────────────────────
function toggleLike(id) {
  if (likedPosts.has(id)) {
    likedPosts.delete(id);
    const p = posts.value.find(p => p.id === id);
    if (p) p.likes--;
  } else {
    likedPosts.add(id);
    const p = posts.value.find(p => p.id === id);
    if (p) p.likes++;
  }
}
function toggleBookmark(id) {
  if (bookmarked.has(id)) bookmarked.delete(id);
  else bookmarked.add(id);
}
function fmtNum(n) {
  return n >= 1000 ? (n / 1000).toFixed(1) + 'k' : n;
}

// ── Particles ─────────────────────────────────────────────
function initParticles(canvas) {
  const ctx = canvas.getContext('2d');
  let W = window.innerWidth, H = window.innerHeight;
  canvas.width = W; canvas.height = H;
  const count = Math.floor((W * H) / 12000);
  const pts = Array.from({ length: count }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.18, vy: (Math.random() - 0.5) * 0.18,
    r: Math.random() * 1.1 + 0.3,
    alpha: Math.random() * 0.35 + 0.08,
    color: ['0,255,180', '0,200,255', '80,255,200'][Math.floor(Math.random() * 3)],
  }));
  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 110) {
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(0,255,180,${0.04 * (1 - d / 110)})`;
          ctx.lineWidth = 0.4;
          ctx.stroke();
        }
      }
      const p = pts[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
      ctx.fill();
    }
    particleRafId = requestAnimationFrame(draw);
  }
  draw();
  window.addEventListener('resize', () => {
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W; canvas.height = H;
  });
}

function initObservers(root) {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.08 });
  root.querySelectorAll('.fade-up').forEach(el => obs.observe(el));
  observers.push(obs);
}

function onMouseMove(e) {
  mouseX.value = e.clientX;
  mouseY.value = e.clientY;
}

onMounted(() => {
  const root = document.querySelector('.forum-root');
  const canvas = root?.querySelector('.bg-canvas');
  if (canvas) initParticles(canvas);
  if (root) initObservers(root);
  window.addEventListener('mousemove', onMouseMove);
});
onUnmounted(() => {
  if (particleRafId) cancelAnimationFrame(particleRafId);
  observers.forEach(o => o.disconnect());
  window.removeEventListener('mousemove', onMouseMove);
});
</script>

<template>
  <div class="forum-root">
    <canvas class="bg-canvas"></canvas>
    <div class="noise-layer"></div>
    <div class="cursor-glow" :style="`left:${mouseX}px;top:${mouseY}px`"></div>

    <!-- ══ NAV ════════════════════════════════════════════ -->
    <nav class="top-nav">
      <div class="nav-left">
        <div class="nav-logo">
          <svg viewBox="0 0 32 32" fill="none">
            <polygon points="16,2 30,10 30,22 16,30 2,22 2,10"
                     stroke="#00ffb4" stroke-width="1.5" fill="rgba(0,255,180,0.06)"/>
            <circle cx="16" cy="16" r="3" fill="#00ffb4"/>
          </svg>
          <span class="logo-text">COURSENET<em>.io</em></span>
        </div>
        <div class="nav-sep"></div>
        <div class="nav-breadcrumb">
          <a href="#">首页</a>
          <span>›</span>
          <span class="bc-current">知识论坛</span>
        </div>
      </div>
      <div class="nav-search">
        <div class="search-wrap">
          <svg class="s-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input v-model="searchQuery" placeholder="搜索帖子、标签、作者…" class="search-input"/>
          <span v-if="searchQuery" class="s-clear" @click="searchQuery = ''">✕</span>
        </div>
      </div>
      <div class="nav-right">
        <div class="nav-stat">
          <span class="ns-dot online"></span>
          <span class="ns-val">{{ activeUsers.filter(u=>u.online).length }}</span>
          <span class="ns-label">在线</span>
        </div>
        <button class="compose-btn" @click="showCompose = !showCompose">
          <span class="cb-sweep"></span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          发布帖子
        </button>
      </div>
    </nav>

    <!-- ══ COMPOSE MODAL ══════════════════════════════════ -->
    <transition name="modal-fade">
      <div v-if="showCompose" class="compose-overlay" @click.self="showCompose = false">
        <div class="compose-modal">
          <div class="cm-header">
            <span class="cm-tag">[ NEW_POST ]</span>
            <h3 class="cm-title">发布新帖</h3>
            <button class="cm-close" @click="showCompose = false">✕</button>
          </div>
          <div class="cm-body">
            <input class="cm-field" placeholder="帖子标题…" />
            <div class="cm-cats">
              <button v-for="c in categories.slice(1)" :key="c.id"
                      class="cm-cat-btn" :style="`--cc:${c.color}`">
                {{ c.icon }} {{ c.label }}
              </button>
            </div>
            <textarea class="cm-textarea" placeholder="分享你的知识、问题或资源…" rows="6"></textarea>
            <input class="cm-field" placeholder="标签（用空格分隔）…" />
          </div>
          <div class="cm-footer">
            <button class="cm-cancel" @click="showCompose = false">取消</button>
            <button class="cm-submit">
              <span class="cb-sweep"></span>
              发布帖子
            </button>
          </div>
          <div class="cm-deco"></div>
        </div>
      </div>
    </transition>

    <!-- ══ FORUM HERO ══════════════════════════════════════ -->
    <header class="forum-hero fade-up">
      <div class="fh-bg-grid"></div>
      <div class="fh-inner">
        <div class="fh-tag">[ KNOWLEDGE FORUM ]</div>
        <h1 class="fh-title">
          <span class="fht-a">知识</span>
          <span class="fht-b">共振</span>
          <span class="fht-c">· SIGNAL EXCHANGE</span>
        </h1>
        <p class="fh-sub">提问、分享、讨论——让每一个问题都找到答案，让每一份知识都产生回响</p>
        <div class="fh-live-stats">
          <div v-for="s in [
            { val: '128', label: '活跃帖子', icon: '◈' },
            { val: '4.2k', label: '本月回复', icon: '◉' },
            { val: '892', label: '活跃用户', icon: '◆' },
          ]" :key="s.label" class="fh-stat">
            <span class="fhs-icon">{{ s.icon }}</span>
            <span class="fhs-val">{{ s.val }}</span>
            <span class="fhs-label">{{ s.label }}</span>
          </div>
        </div>
      </div>
      <div class="fh-rings">
        <div class="fhr fhr-1"></div>
        <div class="fhr fhr-2"></div>
      </div>
    </header>

    <!-- ══ MAIN LAYOUT ════════════════════════════════════ -->
    <div class="forum-layout">

      <!-- ── SIDEBAR LEFT ─────────────────────────────── -->
      <aside class="sidebar-left fade-up">
        <div class="sl-section">
          <div class="sl-title">[ CATEGORIES ]</div>
          <div class="cat-list">
            <button v-for="cat in categories" :key="cat.id"
                    class="cat-item"
                    :class="{ active: activeCategory === cat.id }"
                    :style="`--cc:${cat.color}`"
                    @click="activeCategory = cat.id">
              <span class="ci-icon">{{ cat.icon }}</span>
              <span class="ci-label">{{ cat.label }}</span>
              <span class="ci-count">{{ cat.count }}</span>
              <div class="ci-bar"></div>
            </button>
          </div>
        </div>

        <div class="sl-section">
          <div class="sl-title">[ HOT TOPICS ]</div>
          <div class="hot-list">
            <div v-for="t in hotTopics" :key="t.rank" class="hot-item">
              <span class="hi-rank" :style="`color:${t.color}`">{{ String(t.rank).padStart(2,'0') }}</span>
              <div class="hi-content">
                <span class="hi-title">{{ t.title }}</span>
                <span class="hi-replies">{{ t.replies }} 回复</span>
              </div>
            </div>
          </div>
        </div>

        <div class="sl-section">
          <div class="sl-title">[ ACTIVE USERS ]</div>
          <div class="user-list">
            <div v-for="u in activeUsers" :key="u.name" class="user-item">
              <div class="ui-avatar" :style="`border-color:${u.color}44`">
                <span :style="`color:${u.color}`">{{ u.avatar }}</span>
                <div v-if="u.online" class="ui-online"></div>
              </div>
              <div class="ui-info">
                <span class="ui-name">{{ u.name }}</span>
                <span class="ui-posts">{{ u.posts }} 篇帖子</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- ── MAIN CONTENT ──────────────────────────────── -->
      <main class="main-content">

        <!-- Toolbar -->
        <div class="toolbar fade-up">
          <div class="tb-left">
            <span class="tb-count">
              共 <em>{{ filteredPosts.length }}</em> 条结果
            </span>
            <span v-if="activeCategory !== 'all'" class="tb-active-cat"
                  :style="`color:${activeCatData.color};border-color:${activeCatData.color}33;background:${activeCatData.color}0d`">
              {{ activeCatData.icon }} {{ activeCatData.label }}
              <span @click="activeCategory='all'" style="cursor:pointer;margin-left:0.4rem;opacity:0.6">✕</span>
            </span>
          </div>
          <div class="tb-right">
            <div class="sort-group">
              <button v-for="s in [
                {id:'hot', label:'热度'},
                {id:'new', label:'最新'},
                {id:'views', label:'浏览'},
              ]" :key="s.id"
                      class="sort-btn" :class="{ active: sortBy === s.id }"
                      @click="sortBy = s.id">
                {{ s.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Post list -->
        <transition-group name="post-list" tag="div" class="posts-list">
          <article v-for="(post, i) in filteredPosts" :key="post.id"
                   class="post-card fade-up"
                   :style="`animation-delay:${i * 0.06}s`"
                   @mouseenter="hoveredPost = post.id"
                   @mouseleave="hoveredPost = -1">

            <!-- Pinned indicator -->
            <div v-if="post.pinned" class="pc-pinned">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              置顶
            </div>

            <div class="pc-layout">
              <!-- Left: vote -->
              <div class="pc-vote">
                <button class="vote-btn" :class="{ liked: likedPosts.has(post.id) }"
                        @click.stop="toggleLike(post.id)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3z"/>
                    <path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/>
                  </svg>
                  <span>{{ fmtNum(post.likes) }}</span>
                </button>
                <div class="vote-sep"></div>
                <div class="pc-comments-n">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                  </svg>
                  {{ post.comments }}
                </div>
              </div>

              <!-- Right: content -->
              <div class="pc-body">
                <div class="pc-meta">
                  <span class="pc-cat" :style="`
                    color:${categories.find(c=>c.id===post.category)?.color || '#00ffb4'};
                    border-color:${categories.find(c=>c.id===post.category)?.color || '#00ffb4'}33;
                    background:${categories.find(c=>c.id===post.category)?.color || '#00ffb4'}0d
                  `">
                    {{ post.categoryLabel }}
                  </span>
                  <span v-if="post.hot" class="pc-hot">🔥 HOT</span>
                  <span v-if="post.solved" class="pc-solved">✓ SOLVED</span>
                </div>

                <h2 class="pc-title">{{ post.title }}</h2>
                <p class="pc-preview">{{ post.preview }}</p>

                <div class="pc-tags">
                  <span v-for="tag in post.tags" :key="tag" class="pc-tag"># {{ tag }}</span>
                </div>

                <div class="pc-footer">
                  <div class="pcf-author">
                    <div class="pcf-avatar" :style="`border-color:${post.avatarColor}44`">
                      <span :style="`color:${post.avatarColor}`">{{ post.avatar }}</span>
                    </div>
                    <div class="pcf-info">
                      <span class="pcf-name">{{ post.author }}</span>
                      <span class="pcf-time">{{ post.time }}</span>
                    </div>
                  </div>
                  <div class="pcf-actions">
                    <span class="pcf-views">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                      {{ fmtNum(post.views) }}
                    </span>
                    <button class="pcf-bookmark"
                            :class="{ active: bookmarked.has(post.id) }"
                            @click.stop="toggleBookmark(post.id)">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                      </svg>
                    </button>
                    <button class="pcf-share">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/>
                        <circle cx="18" cy="19" r="3"/>
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Hover progress bar -->
            <div class="pc-progress"
                 :style="`width:${hoveredPost === post.id ? '100%' : '0'}`"
                 :class="`color-${post.category}`"></div>

            <!-- Corner deco -->
            <div class="pc-corner tl"></div>
            <div class="pc-corner br"></div>
          </article>
        </transition-group>

        <!-- Empty state -->
        <div v-if="filteredPosts.length === 0" class="empty-state fade-up">
          <div class="es-icon">◈</div>
          <p class="es-title">未找到匹配内容</p>
          <p class="es-sub">尝试不同的关键词或分类</p>
        </div>

        <!-- Load more -->
        <div v-if="filteredPosts.length > 0" class="load-more fade-up">
          <button class="lm-btn">
            <span class="lm-sweep"></span>
            加载更多帖子
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <polyline points="19 12 12 19 5 12"/>
            </svg>
          </button>
        </div>
      </main>

      <!-- ── SIDEBAR RIGHT ─────────────────────────────── -->
      <aside class="sidebar-right fade-up">
        <div class="sr-section">
          <div class="sr-title">[ SYSTEM STATUS ]</div>
          <div class="sys-status">
            <div v-for="s in [
              { label: '服务器', status: 'online', latency: '12ms' },
              { label: '搜索引擎', status: 'online', latency: '8ms' },
              { label: '文件存储', status: 'online', latency: '45ms' },
            ]" :key="s.label" class="sys-item">
              <div class="ssi-dot" :class="s.status"></div>
              <span class="ssi-label">{{ s.label }}</span>
              <span class="ssi-latency">{{ s.latency }}</span>
            </div>
          </div>
        </div>

        <div class="sr-section">
          <div class="sr-title">[ TODAY'S ACTIVITY ]</div>
          <div class="activity-chart">
            <div v-for="(h, i) in [3,7,5,9,6,12,8,14,10,7,11,9,6,4,8,11,7,5,9,13,10,8,6,4]"
                 :key="i" class="ac-bar"
                 :style="`height:${h * 4}px;animation-delay:${i*0.04}s`">
            </div>
          </div>
          <div class="ac-labels">
            <span>00:00</span><span>12:00</span><span>24:00</span>
          </div>
        </div>

        <div class="sr-section">
          <div class="sr-title">[ TAG CLOUD ]</div>
          <div class="tag-cloud">
            <span v-for="t in [
              {name:'Vue3', w:700},
              {name:'算法', w:800},
              {name:'TypeScript', w:600},
              {name:'React', w:650},
              {name:'Node.js', w:550},
              {name:'设计模式', w:500},
              {name:'面试', w:900},
              {name:'CSS', w:600},
              {name:'Python', w:580},
              {name:'架构', w:620},
            ]" :key="t.name"
                  class="tc-tag"
                  :style="`font-size:${0.5 + (t.w/900)*0.35}rem;opacity:${0.4 + (t.w/900)*0.5}`">
              {{ t.name }}
            </span>
          </div>
        </div>

        <div class="sr-section">
          <div class="sr-title">[ QUICK ACTIONS ]</div>
          <div class="quick-actions">
            <a href="#" class="qa-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              上传学习资料
            </a>
            <a href="#" class="qa-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              搜索资源库
            </a>
            <a href="#" class="qa-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
              </svg>
              浏览社区成员
            </a>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=JetBrains+Mono:wght@300;400;600&family=Noto+Sans+SC:wght@300;400;500;700&display=swap');

/* ─── TOKENS ─────────────────────────────────────────── */
:root {
  --g:  #00ffb4;
  --g2: #00c8ff;
  --g3: #a78bfa;
  --g4: #ff6b35;
  --bg:  #020b10;
  --bg2: #050f18;
  --bg3: #03080d;
  --bdr:  rgba(0,255,180,0.08);
  --bdrb: rgba(0,255,180,0.22);
  --text: #c8f0e0;
  --muted: rgba(150,210,180,0.35);
  --fd: 'Orbitron', sans-serif;
  --fm: 'JetBrains Mono', monospace;
  --fb: 'Noto Sans SC', sans-serif;
  --es: cubic-bezier(0.25,1,0.5,1);
}

*,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }

.forum-root {
  background: var(--bg);
  color: var(--text);
  font-family: var(--fb);
  min-height: 100vh;
  overflow-x: hidden;
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
  background: radial-gradient(circle, rgba(0,255,180,0.028) 0%, transparent 55%);
  pointer-events: none;
  transition: left 0.07s, top 0.07s;
}

/* ─── FADE UP ─────────────────────────────────────────── */
.fade-up {
  opacity: 0; transform: translateY(22px);
  transition: opacity 0.7s var(--es), transform 0.7s var(--es);
}
.fade-up.visible { opacity:1; transform:translateY(0); }

/* ─── NAV ─────────────────────────────────────────────── */
.top-nav {
  position: fixed; top:0; left:0; right:0; z-index: 200;
  height: 62px;
  display: flex; align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  background: rgba(2,11,16,0.78);
  backdrop-filter: blur(22px) saturate(1.5);
  border-bottom: 1px solid var(--bdr);
}
.nav-left { display: flex; align-items: center; gap: 1.2rem; }
.nav-logo {
  display: flex; align-items: center; gap: 0.65rem;
  font-family: var(--fd); font-size: 0.7rem; font-weight: 700;
  letter-spacing: 0.18em; color: #fff; flex-shrink: 0;
}
.nav-logo svg { width: 24px; height: 24px; }
.nav-logo em { font-style:normal; color: var(--g); }
.nav-sep {
  width: 1px; height: 22px;
  background: var(--bdr);
}
.nav-breadcrumb {
  display: flex; align-items: center; gap: 0.5rem;
  font-family: var(--fm); font-size: 0.58rem;
  letter-spacing: 0.1em; color: var(--muted);
}
.nav-breadcrumb a { color: var(--muted); text-decoration: none; transition: color 0.2s; }
.nav-breadcrumb a:hover { color: var(--g); }
.bc-current { color: var(--g); }

.nav-search { flex: 1; max-width: 380px; margin: 0 2rem; }
.search-wrap {
  position: relative;
  display: flex; align-items: center;
}
.s-icon {
  position: absolute; left: 0.85rem;
  width: 14px; height: 14px; color: var(--muted);
}
.search-input {
  width: 100%; height: 36px;
  background: rgba(0,255,180,0.04);
  border: 1px solid var(--bdr);
  color: var(--text);
  font-family: var(--fm); font-size: 0.65rem;
  letter-spacing: 0.08em;
  padding: 0 2.4rem 0 2.4rem;
  outline: none;
  transition: border-color 0.25s, background 0.25s;
  clip-path: polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,6px 100%,0 calc(100% - 6px));
}
.search-input::placeholder { color: var(--muted); }
.search-input:focus {
  border-color: rgba(0,255,180,0.28);
  background: rgba(0,255,180,0.06);
}
.s-clear {
  position: absolute; right: 0.8rem;
  font-size: 0.6rem; color: var(--muted);
  cursor: pointer; transition: color 0.2s;
}
.s-clear:hover { color: var(--g); }

.nav-right { display: flex; align-items: center; gap: 1.2rem; }
.nav-stat {
  display: flex; align-items: center; gap: 0.45rem;
  font-family: var(--fm); font-size: 0.6rem;
}
.ns-dot { width: 6px; height: 6px; border-radius: 50%; }
.ns-dot.online { background: var(--g); box-shadow: 0 0 8px var(--g); animation: blink 1.4s infinite; }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
.ns-val { color: var(--g); font-weight: 600; }
.ns-label { color: var(--muted); }

.compose-btn {
  display: flex; align-items: center; gap: 0.55rem;
  font-family: var(--fm); font-size: 0.65rem;
  letter-spacing: 0.12em; color: #000;
  background: var(--g); border: none; cursor: pointer;
  padding: 0.55rem 1.2rem;
  position: relative; overflow: hidden;
  clip-path: polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px));
  transition: background 0.3s, box-shadow 0.3s;
}
.compose-btn:hover {
  background: #fff;
  box-shadow: 0 0 30px rgba(0,255,180,0.45);
}
.compose-btn svg { width: 14px; height: 14px; }
.cb-sweep {
  position: absolute; top:0; left:-100%; width:60%; height:100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transition: left 0.5s var(--es);
}
.compose-btn:hover .cb-sweep { left: 150%; }

/* ─── COMPOSE MODAL ──────────────────────────────────── */
.compose-overlay {
  position: fixed; inset: 0; z-index: 500;
  background: rgba(2,11,16,0.8);
  backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
}
.compose-modal {
  width: 580px; max-width: 95vw;
  background: var(--bg2);
  border: 1px solid var(--bdrb);
  position: relative; overflow: hidden;
  clip-path: polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,16px 100%,0 calc(100% - 16px));
}
.cm-header {
  display: flex; align-items: center; gap: 1rem;
  padding: 1.4rem 1.8rem;
  border-bottom: 1px solid var(--bdr);
}
.cm-tag {
  font-family: var(--fm); font-size: 0.55rem;
  letter-spacing: 0.2em; color: var(--g); opacity: 0.7;
}
.cm-title {
  font-family: var(--fd); font-size: 0.85rem;
  font-weight: 700; letter-spacing: 0.14em; color: #fff;
  flex: 1;
}
.cm-close {
  background: none; border: none; color: var(--muted);
  font-size: 0.75rem; cursor: pointer;
  transition: color 0.2s;
}
.cm-close:hover { color: var(--g); }

.cm-body { padding: 1.8rem; display: flex; flex-direction: column; gap: 1rem; }
.cm-field {
  width: 100%; height: 40px;
  background: rgba(0,255,180,0.03);
  border: 1px solid var(--bdr);
  color: var(--text); font-family: var(--fm);
  font-size: 0.68rem; letter-spacing: 0.08em;
  padding: 0 1rem; outline: none;
  transition: border-color 0.25s;
}
.cm-field::placeholder { color: var(--muted); }
.cm-field:focus { border-color: var(--bdrb); }
.cm-textarea {
  width: 100%; resize: vertical;
  background: rgba(0,255,180,0.03);
  border: 1px solid var(--bdr);
  color: var(--text); font-family: var(--fb);
  font-size: 0.8rem; line-height: 1.7;
  padding: 0.85rem 1rem; outline: none;
  transition: border-color 0.25s;
}
.cm-textarea::placeholder { color: var(--muted); }
.cm-textarea:focus { border-color: var(--bdrb); }

.cm-cats { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.cm-cat-btn {
  font-family: var(--fm); font-size: 0.56rem;
  letter-spacing: 0.1em;
  color: var(--cc, var(--g));
  background: rgba(0,255,180,0.03);
  border: 1px solid rgba(0,255,180,0.1);
  padding: 0.3rem 0.75rem; cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}
.cm-cat-btn:hover {
  background: rgba(0,255,180,0.08);
  border-color: var(--cc, var(--g));
}

.cm-footer {
  display: flex; justify-content: flex-end; gap: 0.75rem;
  padding: 1.2rem 1.8rem;
  border-top: 1px solid var(--bdr);
}
.cm-cancel {
  font-family: var(--fm); font-size: 0.65rem;
  letter-spacing: 0.1em; color: var(--muted);
  background: none; border: 1px solid var(--bdr);
  padding: 0.55rem 1.2rem; cursor: pointer;
  transition: color 0.25s, border-color 0.25s;
}
.cm-cancel:hover { color: var(--text); border-color: var(--bdrb); }
.cm-submit {
  font-family: var(--fm); font-size: 0.65rem;
  letter-spacing: 0.12em; color: #000;
  background: var(--g); border: none; cursor: pointer;
  padding: 0.55rem 1.5rem;
  position: relative; overflow: hidden;
  clip-path: polygon(0 0,calc(100% - 7px) 0,100% 7px,100% 100%,7px 100%,0 calc(100% - 7px));
  transition: background 0.3s, box-shadow 0.3s;
}
.cm-submit:hover { background: #fff; box-shadow: 0 0 20px rgba(0,255,180,0.4); }
.cm-deco {
  position: absolute; right: -40px; bottom: -40px;
  width: 120px; height: 120px;
  border: 1px solid rgba(0,255,180,0.06);
  border-radius: 50%;
}
.modal-fade-enter-active,.modal-fade-leave-active { transition: opacity 0.3s; }
.modal-fade-enter-from,.modal-fade-leave-to { opacity: 0; }

/* ─── FORUM HERO ─────────────────────────────────────── */
.forum-hero {
  position: relative; z-index: 2;
  padding: 90px 2rem 3rem;
  border-bottom: 1px solid var(--bdr);
  overflow: hidden;
}
.fh-bg-grid {
  position: absolute; inset: 0;
  background-image:
      linear-gradient(rgba(0,255,180,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,255,180,0.025) 1px, transparent 1px);
  background-size: 52px 52px;
  mask-image: radial-gradient(ellipse 90% 100% at 50% 0%, black 30%, transparent 100%);
}
.fh-inner { position: relative; z-index: 2; }
.fh-tag {
  font-family: var(--fm); font-size: 0.56rem;
  letter-spacing: 0.28em; color: var(--g); opacity: 0.65;
  margin-bottom: 0.8rem;
}
.fh-title {
  display: flex; align-items: baseline; gap: 0.8rem;
  margin-bottom: 0.8rem; flex-wrap: wrap;
}
.fht-a {
  font-family: var(--fd);
  font-size: clamp(2.5rem, 6vw, 5rem);
  font-weight: 900; letter-spacing: 0.06em;
  color: transparent; -webkit-text-stroke: 1.5px rgba(0,255,180,0.3);
}
.fht-b {
  font-family: var(--fd);
  font-size: clamp(2.5rem, 6vw, 5rem);
  font-weight: 900; letter-spacing: 0.04em;
  background: linear-gradient(95deg, var(--g) 0%, var(--g2) 60%, #fff 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 40px rgba(0,255,180,0.4));
}
.fht-c {
  font-family: var(--fm); font-size: 0.65rem;
  letter-spacing: 0.22em; color: var(--muted);
  align-self: flex-end; padding-bottom: 0.5rem;
}
.fh-sub {
  font-size: 0.86rem; color: rgba(150,210,180,0.55);
  font-weight: 300; margin-bottom: 2rem;
}
.fh-live-stats {
  display: flex; gap: 2.5rem; align-items: center;
}
.fh-stat {
  display: flex; align-items: center; gap: 0.6rem;
}
.fhs-icon { color: var(--g); font-size: 0.75rem; opacity: 0.7; }
.fhs-val {
  font-family: var(--fd); font-size: 1.1rem;
  font-weight: 700; color: var(--g);
  filter: drop-shadow(0 0 8px rgba(0,255,180,0.4));
}
.fhs-label {
  font-family: var(--fm); font-size: 0.54rem;
  letter-spacing: 0.12em; color: var(--muted);
}

.fh-rings {
  position: absolute; right: 4vw; top: 50%;
  transform: translateY(-50%);
  pointer-events: none; z-index: 1;
}
.fhr {
  position: absolute; border-radius: 50%;
  border: 1px solid rgba(0,255,180,0.04);
  top: 50%; left: 50%; transform: translate(-50%,-50%);
}
.fhr-1 { width: 300px; height: 300px; animation: spin1 20s linear infinite; }
.fhr-2 { width: 450px; height: 450px; animation: spin1 32s linear infinite reverse; }
@keyframes spin1 {
  from { transform: translate(-50%,-50%) rotate(0deg); }
  to   { transform: translate(-50%,-50%) rotate(360deg); }
}

/* ─── LAYOUT ─────────────────────────────────────────── */
.forum-layout {
  position: relative; z-index: 2;
  display: grid;
  grid-template-columns: 210px 1fr 200px;
  gap: 0;
  max-width: 1400px;
  margin: 0 auto;
}

/* ─── SIDEBAR SHARED ─────────────────────────────────── */
.sidebar-left, .sidebar-right {
  border-right: 1px solid var(--bdr);
  padding: 2rem 0;
  position: sticky; top: 62px;
  height: calc(100vh - 62px);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(0,255,180,0.1) transparent;
}
.sidebar-right { border-right: none; border-left: 1px solid var(--bdr); }

.sl-section, .sr-section {
  padding: 1.5rem 1.2rem;
  border-bottom: 1px solid var(--bdr);
}
.sl-title, .sr-title {
  font-family: var(--fm); font-size: 0.52rem;
  letter-spacing: 0.22em; color: var(--g); opacity: 0.6;
  margin-bottom: 1rem;
}

/* Categories */
.cat-list { display: flex; flex-direction: column; gap: 2px; }
.cat-item {
  display: flex; align-items: center; gap: 0.65rem;
  font-family: var(--fb); font-size: 0.75rem;
  color: var(--muted);
  background: none; border: none; cursor: pointer;
  padding: 0.6rem 0.75rem;
  position: relative; overflow: hidden;
  transition: color 0.25s;
  text-align: left; width: 100%;
  --cc: var(--g);
}
.cat-item::before {
  content: ''; position: absolute; inset: 0;
  background: rgba(0,255,180,0.05);
  transform: scaleX(0); transform-origin: left;
  transition: transform 0.3s var(--es);
}
.cat-item:hover { color: var(--text); }
.cat-item:hover::before { transform: scaleX(1); }
.cat-item.active {
  color: var(--cc);
  background: rgba(0,255,180,0.04);
}
.cat-item.active::before { transform: scaleX(1); background: rgba(0,255,180,0.04); }
.ci-icon { font-size: 0.7rem; color: var(--cc); opacity: 0.7; flex-shrink: 0; }
.ci-label { flex: 1; }
.ci-count {
  font-family: var(--fm); font-size: 0.5rem;
  color: var(--muted);
}
.ci-bar {
  position: absolute; left: 0; top: 20%; bottom: 20%;
  width: 2px; background: var(--cc);
  box-shadow: 0 0 6px var(--cc);
  opacity: 0; transition: opacity 0.25s;
}
.cat-item.active .ci-bar { opacity: 1; }

/* Hot topics */
.hot-list { display: flex; flex-direction: column; gap: 0.65rem; }
.hot-item { display: flex; align-items: flex-start; gap: 0.65rem; }
.hi-rank {
  font-family: var(--fd); font-size: 0.6rem;
  font-weight: 700; flex-shrink: 0; line-height: 1.4;
}
.hi-content { flex: 1; }
.hi-title {
  font-size: 0.72rem; color: rgba(180,230,200,0.65);
  line-height: 1.45; display: block;
  transition: color 0.2s; cursor: default;
}
.hot-item:hover .hi-title { color: var(--text); }
.hi-replies {
  font-family: var(--fm); font-size: 0.5rem;
  color: var(--muted); letter-spacing: 0.06em;
}

/* Active users */
.user-list { display: flex; flex-direction: column; gap: 0.75rem; }
.user-item { display: flex; align-items: center; gap: 0.65rem; }
.ui-avatar {
  width: 30px; height: 30px; border-radius: 50%;
  border: 1px solid; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  position: relative;
}
.ui-avatar span {
  font-family: var(--fd); font-size: 0.5rem;
  font-weight: 700; letter-spacing: 0.06em;
}
.ui-online {
  position: absolute; bottom: -1px; right: -1px;
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--g); border: 1px solid var(--bg2);
  box-shadow: 0 0 6px var(--g);
}
.ui-info { flex: 1; min-width: 0; }
.ui-name { font-size: 0.7rem; color: var(--text); display: block; }
.ui-posts {
  font-family: var(--fm); font-size: 0.5rem;
  color: var(--muted);
}

/* ─── MAIN ────────────────────────────────────────────── */
.main-content {
  padding: 1.8rem;
  border-right: 1px solid var(--bdr);
}

/* Toolbar */
.toolbar {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--bdr);
}
.tb-left { display: flex; align-items: center; gap: 0.75rem; }
.tb-count {
  font-family: var(--fm); font-size: 0.6rem;
  letter-spacing: 0.1em; color: var(--muted);
}
.tb-count em { font-style:normal; color: var(--g); }
.tb-active-cat {
  font-family: var(--fm); font-size: 0.56rem;
  letter-spacing: 0.1em;
  padding: 0.2rem 0.65rem; border: 1px solid;
}
.sort-group { display: flex; gap: 2px; }
.sort-btn {
  font-family: var(--fm); font-size: 0.58rem;
  letter-spacing: 0.12em; color: var(--muted);
  background: none; border: 1px solid var(--bdr);
  padding: 0.38rem 0.85rem; cursor: pointer;
  transition: color 0.25s, background 0.25s, border-color 0.25s;
}
.sort-btn:hover { color: var(--text); border-color: var(--bdrb); }
.sort-btn.active {
  color: var(--g); background: rgba(0,255,180,0.06);
  border-color: rgba(0,255,180,0.25);
}

/* Posts list */
.posts-list { display: flex; flex-direction: column; gap: 1px; }

/* Post card */
.post-card {
  background: var(--bg2);
  border: 1px solid var(--bdr);
  position: relative; overflow: hidden;
  cursor: pointer;
  transition: background 0.3s, transform 0.25s var(--es), border-color 0.3s;
  margin-bottom: 1px;
}
.post-card:hover {
  background: rgba(4,14,22,0.9);
  border-color: rgba(0,255,180,0.15);
  transform: translateX(3px);
}

.pc-pinned {
  display: flex; align-items: center; gap: 0.4rem;
  font-family: var(--fm); font-size: 0.5rem;
  letter-spacing: 0.14em; color: #ffd93d;
  background: rgba(255,217,61,0.06);
  border-bottom: 1px solid rgba(255,217,61,0.12);
  padding: 0.4rem 1.5rem;
}
.pc-pinned svg { width: 10px; height: 10px; fill: #ffd93d; }

.pc-layout {
  display: flex; gap: 0;
}

/* Vote column */
.pc-vote {
  flex-shrink: 0; width: 64px;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 0.5rem;
  padding: 1.4rem 0.5rem;
  border-right: 1px solid var(--bdr);
}
.vote-btn {
  display: flex; flex-direction: column; align-items: center; gap: 0.2rem;
  background: none; border: none; cursor: pointer;
  color: var(--muted);
  font-family: var(--fm); font-size: 0.58rem;
  transition: color 0.25s, filter 0.25s;
}
.vote-btn svg { width: 18px; height: 18px; }
.vote-btn:hover { color: var(--g); }
.vote-btn.liked { color: var(--g); filter: drop-shadow(0 0 6px var(--g)); }

.vote-sep {
  width: 24px; height: 1px;
  background: var(--bdr);
}
.pc-comments-n {
  display: flex; flex-direction: column; align-items: center; gap: 0.2rem;
  font-family: var(--fm); font-size: 0.52rem;
  color: var(--muted);
}
.pc-comments-n svg { width: 14px; height: 14px; }

/* Card body */
.pc-body { flex: 1; padding: 1.2rem 1.4rem; min-width: 0; }

.pc-meta {
  display: flex; align-items: center; gap: 0.5rem;
  margin-bottom: 0.6rem; flex-wrap: wrap;
}
.pc-cat {
  font-family: var(--fm); font-size: 0.5rem;
  letter-spacing: 0.12em; padding: 0.15rem 0.5rem;
  border: 1px solid;
}
.pc-hot {
  font-family: var(--fm); font-size: 0.5rem;
  letter-spacing: 0.1em; color: #ff6b35;
}
.pc-solved {
  font-family: var(--fm); font-size: 0.5rem;
  letter-spacing: 0.1em; color: var(--g);
}

.pc-title {
  font-size: 0.95rem; font-weight: 600; color: #fff;
  line-height: 1.4; margin-bottom: 0.55rem;
  transition: color 0.25s;
}
.post-card:hover .pc-title { color: var(--g); }

.pc-preview {
  font-size: 0.78rem; line-height: 1.75;
  color: rgba(150,210,180,0.5); font-weight: 300;
  margin-bottom: 0.75rem;
  display: -webkit-box; -webkit-line-clamp: 2;
  -webkit-box-orient: vertical; overflow: hidden;
}

.pc-tags { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 1rem; }
.pc-tag {
  font-family: var(--fm); font-size: 0.5rem;
  letter-spacing: 0.08em; color: var(--muted);
  background: rgba(0,255,180,0.04);
  border: 1px solid rgba(0,255,180,0.07);
  padding: 0.15rem 0.5rem;
  transition: color 0.2s, border-color 0.2s;
}
.post-card:hover .pc-tag { color: rgba(0,255,180,0.6); border-color: rgba(0,255,180,0.15); }

.pc-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(0,255,180,0.04);
}
.pcf-author { display: flex; align-items: center; gap: 0.6rem; }
.pcf-avatar {
  width: 26px; height: 26px; border-radius: 50%;
  border: 1px solid; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.pcf-avatar span { font-family: var(--fd); font-size: 0.45rem; font-weight: 700; }
.pcf-info { display: flex; flex-direction: column; gap: 0.05rem; }
.pcf-name { font-family: var(--fm); font-size: 0.6rem; color: var(--text); }
.pcf-time { font-family: var(--fm); font-size: 0.5rem; color: var(--muted); }

.pcf-actions { display: flex; align-items: center; gap: 0.5rem; }
.pcf-views {
  display: flex; align-items: center; gap: 0.3rem;
  font-family: var(--fm); font-size: 0.55rem; color: var(--muted);
}
.pcf-views svg { width: 12px; height: 12px; }
.pcf-bookmark, .pcf-share {
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px;
  background: none; border: 1px solid var(--bdr);
  color: var(--muted); cursor: pointer;
  transition: color 0.25s, border-color 0.25s, background 0.25s;
}
.pcf-bookmark svg, .pcf-share svg { width: 12px; height: 12px; }
.pcf-bookmark:hover, .pcf-share:hover {
  color: var(--g); border-color: rgba(0,255,180,0.25);
  background: rgba(0,255,180,0.05);
}
.pcf-bookmark.active { color: var(--g); border-color: rgba(0,255,180,0.3); background: rgba(0,255,180,0.08); }

/* Progress bar on hover */
.pc-progress {
  position: absolute; bottom: 0; left: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--g), var(--g2));
  box-shadow: 0 0 8px var(--g);
  transition: width 0.4s var(--es);
}
.pc-progress.color-frontend { background: linear-gradient(90deg, #00c8ff, #00ffb4); }
.pc-progress.color-algo { background: linear-gradient(90deg, #a78bfa, #00c8ff); }
.pc-progress.color-backend { background: linear-gradient(90deg, #ff6b35, #ffd93d); }
.pc-progress.color-design { background: linear-gradient(90deg, #ffd93d, #ff6b35); }
.pc-progress.color-career { background: linear-gradient(90deg, #00ffb4, #00c8ff); }

/* Corner decoration */
.pc-corner {
  position: absolute;
  width: 10px; height: 10px;
  border-color: rgba(0,255,180,0.15); border-style: solid;
  transition: border-color 0.3s, width 0.3s, height 0.3s;
}
.pc-corner.tl { top:0; left:0; border-width: 1px 0 0 1px; }
.pc-corner.br { bottom:0; right:0; border-width: 0 1px 1px 0; }
.post-card:hover .pc-corner {
  border-color: rgba(0,255,180,0.35);
  width: 14px; height: 14px;
}

/* Post list transition */
.post-list-enter-active { transition: all 0.4s var(--es); }
.post-list-leave-active { transition: all 0.3s var(--es); }
.post-list-enter-from { opacity:0; transform:translateY(12px); }
.post-list-leave-to   { opacity:0; transform:translateX(-12px); }

/* Empty state */
.empty-state {
  text-align: center; padding: 5rem 2rem;
}
.es-icon {
  font-size: 3rem; color: rgba(0,255,180,0.1);
  margin-bottom: 1rem;
  animation: esFloat 3s ease-in-out infinite;
}
@keyframes esFloat {
  0%,100%{ transform:translateY(0); }
  50%{ transform:translateY(-10px); }
}
.es-title {
  font-family: var(--fd); font-size: 1rem;
  letter-spacing: 0.14em; color: rgba(0,255,180,0.25);
  margin-bottom: 0.5rem;
}
.es-sub {
  font-family: var(--fm); font-size: 0.62rem;
  letter-spacing: 0.1em; color: var(--muted);
}

/* Load more */
.load-more {
  display: flex; justify-content: center;
  padding: 2.5rem 0;
}
.lm-btn {
  display: flex; align-items: center; gap: 0.65rem;
  font-family: var(--fm); font-size: 0.65rem;
  letter-spacing: 0.14em; color: var(--muted);
  background: none; border: 1px solid var(--bdr);
  padding: 0.85rem 2rem; cursor: pointer;
  position: relative; overflow: hidden;
  clip-path: polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px));
  transition: color 0.3s, border-color 0.3s, background 0.3s;
}
.lm-btn svg { width: 14px; height: 14px; }
.lm-btn:hover {
  color: var(--g); border-color: rgba(0,255,180,0.3);
  background: rgba(0,255,180,0.04);
}
.lm-sweep {
  position: absolute; top:0; left:-110%; width:60%; height:100%;
  background: linear-gradient(90deg, transparent, rgba(0,255,180,0.08), transparent);
  transition: left 0.6s var(--es);
}
.lm-btn:hover .lm-sweep { left: 150%; }

/* ─── SIDEBAR RIGHT ──────────────────────────────────── */
/* System status */
.sys-status { display: flex; flex-direction: column; gap: 0.6rem; }
.sys-item {
  display: flex; align-items: center; gap: 0.6rem;
  font-family: var(--fm); font-size: 0.58rem;
}
.ssi-dot {
  width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
}
.ssi-dot.online {
  background: var(--g); box-shadow: 0 0 8px var(--g);
  animation: blink 2s infinite;
}
.ssi-label { flex: 1; color: rgba(160,220,190,0.55); }
.ssi-latency { color: var(--g); font-size: 0.5rem; }

/* Activity chart */
.activity-chart {
  display: flex; align-items: flex-end;
  gap: 2px; height: 60px; margin-bottom: 0.4rem;
}
.ac-bar {
  flex: 1; min-width: 3px;
  background: linear-gradient(to top, var(--g), var(--g2));
  opacity: 0.35; border-radius: 1px;
  animation: barIn 0.5s ease-out both;
  transition: opacity 0.2s;
}
.ac-bar:hover { opacity: 0.8; }
@keyframes barIn { from{transform:scaleY(0);transform-origin:bottom;} to{transform:scaleY(1);} }

.ac-labels {
  display: flex; justify-content: space-between;
  font-family: var(--fm); font-size: 0.46rem;
  color: var(--muted); letter-spacing: 0.06em;
}

/* Tag cloud */
.tag-cloud {
  display: flex; flex-wrap: wrap; gap: 0.4rem;
}
.tc-tag {
  font-family: var(--fm); letter-spacing: 0.06em;
  color: rgba(0,255,180,0.7); cursor: default;
  transition: color 0.2s, text-shadow 0.2s;
}
.tc-tag:hover { color: var(--g); text-shadow: 0 0 12px var(--g); }

/* Quick actions */
.quick-actions { display: flex; flex-direction: column; gap: 2px; }
.qa-item {
  display: flex; align-items: center; gap: 0.65rem;
  font-family: var(--fm); font-size: 0.6rem;
  letter-spacing: 0.1em; color: var(--muted);
  text-decoration: none;
  padding: 0.6rem 0.5rem;
  border: 1px solid transparent;
  transition: color 0.25s, background 0.25s, border-color 0.25s;
}
.qa-item svg { width: 14px; height: 14px; flex-shrink: 0; }
.qa-item:hover {
  color: var(--g); background: rgba(0,255,180,0.04);
  border-color: rgba(0,255,180,0.1);
}

/* ─── RESPONSIVE ─────────────────────────────────────── */
@media(max-width:1200px){
  .forum-layout{ grid-template-columns: 190px 1fr; }
  .sidebar-right{ display: none; }
}
@media(max-width:860px){
  .forum-layout{ grid-template-columns: 1fr; }
  .sidebar-left{ display: none; }
  .top-nav{ flex-wrap: wrap; height: auto; padding: 0.75rem 1rem; gap: 0.75rem; }
  .nav-search{ max-width: 100%; order: 3; width: 100%; margin: 0; }
  .fh-rings{ display: none; }
}
@media(max-width:600px){
  .pc-vote{ width: 52px; }
  .fh-title{ flex-direction: column; gap: 0; }
  .fh-live-stats{ gap: 1.5rem; }
}
</style>