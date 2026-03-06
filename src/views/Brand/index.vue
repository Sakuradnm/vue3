<script setup>
import { onMounted, onUnmounted, ref, reactive } from 'vue';

const rootRef = ref(null);
const mouseX = ref(0);
const mouseY = ref(0);
const scrollY = ref(0);
const activeTab = ref(0);
const hoveredMember = ref(-1);
const countersStarted = ref(false);
const counts = reactive({ resources: 0, users: 0, topics: 0, rating: 0 });

let rafId = null;
let particleRafId = null;
let observers = [];

// ── Mouse tracking ──────────────────────────────────────
function onMouseMove(e) {
  mouseX.value = e.clientX;
  mouseY.value = e.clientY;
}

// ── Scroll ──────────────────────────────────────────────
function onScroll() {
  scrollY.value = window.scrollY;
}

// ── Particle System ─────────────────────────────────────
function initParticles(canvas) {
  const ctx = canvas.getContext('2d');
  let W = window.innerWidth, H = window.innerHeight;
  canvas.width = W; canvas.height = H;

  const count = Math.floor((W * H) / 8000);
  const pts = [];
  for (let i = 0; i < count; i++) {
    pts.push({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.22, vy: (Math.random() - 0.5) * 0.22,
      r: Math.random() * 1.2 + 0.3,
      alpha: Math.random() * 0.4 + 0.1,
      color: ['0,255,180', '0,200,255', '100,255,200'][Math.floor(Math.random() * 3)],
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 120) {
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(0,255,180,${0.045 * (1 - d / 120)})`;
          ctx.lineWidth = 0.4;
          ctx.stroke();
        }
      }
      pts[i].x += pts[i].vx; pts[i].y += pts[i].vy;
      if (pts[i].x < 0) pts[i].x = W; if (pts[i].x > W) pts[i].x = 0;
      if (pts[i].y < 0) pts[i].y = H; if (pts[i].y > H) pts[i].y = 0;
      ctx.beginPath();
      ctx.arc(pts[i].x, pts[i].y, pts[i].r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${pts[i].color},${pts[i].alpha})`;
      ctx.fill();
    }
    particleRafId = requestAnimationFrame(draw);
  }
  draw();

  const onResize = () => {
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W; canvas.height = H;
  };
  window.addEventListener('resize', onResize);
}

// ── Counters ─────────────────────────────────────────────
function startCounters() {
  if (countersStarted.value) return;
  countersStarted.value = true;
  const targets = { resources: 12800, users: 4200, topics: 320, rating: 4.9 };
  const dur = 2400;
  const start = performance.now();
  function tick(now) {
    const t = Math.min((now - start) / dur, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    counts.resources = Math.round(targets.resources * ease);
    counts.users = Math.round(targets.users * ease);
    counts.topics = Math.round(targets.topics * ease);
    counts.rating = parseFloat((targets.rating * ease).toFixed(1));
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ── IntersectionObserver ──────────────────────────────────
function initObservers() {
  // Fade-in elements
  const fadeEls = rootRef.value?.querySelectorAll('.fade-in');
  const fadeObs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
  }, { threshold: 0.15 });
  fadeEls?.forEach(el => fadeObs.observe(el));
  observers.push(fadeObs);

  // Counters
  const metricsEl = rootRef.value?.querySelector('.metrics-wrap');
  const metObs = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) startCounters();
  }, { threshold: 0.4 });
  if (metricsEl) metObs.observe(metricsEl);
  observers.push(metObs);

  // Stagger lines
  const staggerEls = rootRef.value?.querySelectorAll('.stagger-line');
  const staggerObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const lines = e.target.querySelectorAll('.sl-item');
        lines.forEach((l, i) => {
          setTimeout(() => l.classList.add('visible'), i * 90);
        });
      }
    });
  }, { threshold: 0.2 });
  staggerEls?.forEach(el => staggerObs.observe(el));
  observers.push(staggerObs);
}

const tabs = [
  { key: 'mission', label: '使命', icon: '◈' },
  { key: 'vision', label: '愿景', icon: '◉' },
  { key: 'values', label: '价值', icon: '◆' },
];

const tabContents = [
  {
    title: '打破知识壁垒',
    body: '我们相信，优质的学习资源不应被价格或渠道所限制。CourseNet 的核心使命是建立一个开放、透明、持续生长的知识共享网络——让每一位学习者都能平等地获取、贡献并传播知识。',
    items: ['开放访问，永久免费', '知识民主化', '打破信息不对称'],
  },
  {
    title: '构建知识生态',
    body: '我们的愿景是成为全球规模最大、质量最高的中文技术课程资源库。通过 AI 智能推荐、社区协作评注、多维知识图谱，形成一个有机生长、自我进化的学习生态系统。',
    items: ['AI 驱动的个性化推荐', '社区共建内容体系', '知识图谱与关联发现'],
  },
  {
    title: '开放·协作·共享',
    body: '我们以开放的态度拥抱每一位贡献者，以协作的精神构建每一个功能，以共享的理念运营整个平台。质量、诚信与互助是我们不妥协的核心价值观。',
    items: ['贡献者优先文化', '透明化运营机制', '社区自治与共建'],
  },
];

const team = [
  { name: 'Ariel Chen', role: '联合创始人 / CEO', tag: '产品 & 战略', avatar: 'AC', color: '#00ffb4' },
  { name: 'Kevin Liu', role: '联合创始人 / CTO', tag: '全栈架构', avatar: 'KL', color: '#00c8ff' },
  { name: 'Mia Zhang', role: '设计总监', tag: 'UX & 品牌', avatar: 'MZ', color: '#a78bfa' },
  { name: 'Ray Wang', role: 'AI 负责人', tag: '机器学习', avatar: 'RW', color: '#ff6b35' },
  { name: 'Sora Lin', role: '社区运营', tag: '用户增长', avatar: 'SL', color: '#ffd93d' },
  { name: 'Echo Yu', role: '内容质控', tag: '知识架构', avatar: 'EY', color: '#00ffb4' },
];

const timeline = [
  { year: '2021', month: 'Q4', title: '项目启动', desc: '三位工程师在深夜咖啡馆讨论了一个想法：如果学习资料可以像开源代码一样共享呢？' },
  { year: '2022', month: 'Q2', title: '内测上线', desc: '首个版本发布，支持 PDF 上传与基础搜索，200 名早期用户在 48 小时内贡献了 1000+ 资源。' },
  { year: '2022', month: 'Q4', title: 'AI 引擎集成', desc: '引入语义搜索与智能标签系统，资源发现效率提升 340%，用户留存率突破 68%。' },
  { year: '2023', month: 'Q2', title: '社区协作功能', desc: '上线评注、协作编辑与知识图谱，月活突破 2000，资源库达到 5000+。' },
  { year: '2024', month: 'Q1', title: 'v2.0 发布', desc: '全面重构平台架构，支持 50+ 格式，实时同步，多端适配。12800+ 资源，4200+ 学习者。' },
];

onMounted(() => {
  const canvas = rootRef.value?.querySelector('.bg-canvas');
  if (canvas) initParticles(canvas);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('scroll', onScroll, { passive: true });
  initObservers();
});

onUnmounted(() => {
  if (particleRafId) cancelAnimationFrame(particleRafId);
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('scroll', onScroll);
  observers.forEach(o => o.disconnect());
});
</script>

<template>
  <div ref="rootRef" class="about-root"
       :style="`--mx:${mouseX}px;--my:${mouseY}px`">

    <canvas class="bg-canvas"></canvas>
    <div class="noise-layer"></div>

    <!-- ══ CURSOR GLOW ════════════════════════════════════ -->
    <div class="cursor-glow"
         :style="`left:${mouseX}px;top:${mouseY}px`"></div>

    <!-- ══ NAV ════════════════════════════════════════════ -->
    <nav class="top-nav">
      <div class="nav-logo">
        <svg viewBox="0 0 32 32" fill="none">
          <polygon points="16,2 30,10 30,22 16,30 2,22 2,10"
                   stroke="#00ffb4" stroke-width="1.5" fill="rgba(0,255,180,0.06)"/>
          <circle cx="16" cy="16" r="3" fill="#00ffb4"/>
        </svg>
        <span>COURSENET<em>.io</em></span>
      </div>
      <div class="nav-breadcrumb">
        <a href="#">首页</a>
        <span class="sep">›</span>
        <span class="current">关于我们</span>
      </div>
    </nav>

    <!-- ══ HERO ═══════════════════════════════════════════ -->
    <section class="hero">
      <!-- Rotating hex rings -->
      <div class="hex-rings">
        <div class="hr hr-1"></div>
        <div class="hr hr-2"></div>
        <div class="hr hr-3"></div>
      </div>
      <!-- Scan lines -->
      <div class="scan-overlay"></div>

      <div class="hero-inner">
        <div class="hero-badge fade-in">
          <span class="bd-glyph">[ ABOUT ]</span>
          <span class="bd-sep">·</span>
          <span class="bd-version">SYS.INFO v2.0</span>
        </div>

        <h1 class="hero-h1">
          <span class="h1-line line-a fade-in">我们是谁</span>
          <span class="h1-line line-b fade-in">WE ARE</span>
          <span class="h1-line line-c fade-in">
            <span class="glitch" data-text="COURSENET">COURSENET</span>
          </span>
        </h1>

        <p class="hero-sub fade-in">
          一群相信知识应该自由流动的工程师、设计师与教育者——<br/>
          我们正在重新定义在线学习资源的共享方式。
        </p>

        <!-- Animated divider -->
        <div class="hero-divider fade-in">
          <div class="hd-track">
            <div class="hd-fill"></div>
          </div>
          <span class="hd-label">SCROLL TO EXPLORE</span>
          <div class="hd-arrow">
            <div class="arrow-line"></div>
            <div class="arrow-head"></div>
          </div>
        </div>
      </div>

      <!-- Floating data cards -->
      <div class="float-cards">
        <div class="fc fc-1 fade-in">
          <div class="fc-label">FOUNDED</div>
          <div class="fc-val">2021.Q4</div>
        </div>
        <div class="fc fc-2 fade-in">
          <div class="fc-label">TEAM SIZE</div>
          <div class="fc-val">24</div>
        </div>
        <div class="fc fc-3 fade-in">
          <div class="fc-label">MISSION</div>
          <div class="fc-val">OPEN EDU</div>
        </div>
      </div>
    </section>

    <!-- ══ METRICS ════════════════════════════════════════ -->
    <section class="metrics-wrap">
      <div class="metrics-grid">
        <div v-for="(m, i) in [
          { val: counts.resources, suffix: '+', label: '共享资源', sub: 'TOTAL RESOURCES', color: '#00ffb4' },
          { val: counts.users, suffix: '+', label: '活跃学习者', sub: 'ACTIVE LEARNERS', color: '#00c8ff' },
          { val: counts.topics, suffix: '+', label: '课程专题', sub: 'COURSE TOPICS', color: '#a78bfa' },
          { val: counts.rating, suffix: '', label: '平均评分', sub: 'AVG RATING / 5.0', color: '#ffd93d' },
        ]" :key="i" class="metric-item fade-in" :style="`--mc:${m.color}`">
          <div class="mi-bar"></div>
          <div class="mi-num">
            {{ m.val.toLocaleString() }}<span class="mi-suf">{{ m.suffix }}</span>
          </div>
          <div class="mi-label">{{ m.label }}</div>
          <div class="mi-sub">{{ m.sub }}</div>
          <div class="mi-ring"></div>
        </div>
      </div>
    </section>

    <!-- ══ STORY ══════════════════════════════════════════ -->
    <section class="story-section">
      <div class="sec-tag fade-in">[ OUR STORY ]</div>
      <div class="story-layout">
        <div class="story-left fade-in">
          <h2 class="story-title">
            一个深夜的<br/>
            <span class="gt">疯狂想法</span>
          </h2>
          <div class="story-accent-line"></div>
        </div>
        <div class="story-right stagger-line">
          <p class="sl-item story-p">
            2021 年末，三位程序员在深圳的一家 24 小时咖啡馆里，喝着第三杯美式，抱怨着同一个问题：为什么网上到处都是碎片化的课程资料，却没有一个地方能把它们系统地汇聚起来？
          </p>
          <p class="sl-item story-p">
            那晚，我们在餐巾纸上画出了 CourseNet 的第一个原型。不是为了商业，而是因为我们切实地需要它——相信还有无数像我们一样的学习者，同样需要它。
          </p>
          <p class="sl-item story-p">
            三年后，这个「疯狂想法」演变成了一个拥有 12800+ 资源、4200+ 学习者的开放知识网络。而我们的目标，从未改变。
          </p>
          <div class="sl-item story-sig">
            <div class="sig-line"></div>
            <span>— The CourseNet Founders, 2021</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ══ MISSION / VISION / VALUES ══════════════════════ -->
    <section class="mvv-section">
      <div class="sec-tag fade-in">[ CORE PILLARS ]</div>
      <h2 class="sec-title fade-in">我们的核心理念</h2>

      <div class="mvv-tabs fade-in">
        <button v-for="(tab, i) in tabs" :key="tab.key"
                class="mvv-tab"
                :class="{ active: activeTab === i }"
                @click="activeTab = i">
          <span class="tab-icon">{{ tab.icon }}</span>
          {{ tab.label }}
        </button>
      </div>

      <div class="mvv-panel">
        <transition name="tab-slide" mode="out-in">
          <div :key="activeTab" class="mvv-content">
            <div class="mc-left">
              <h3 class="mc-title">{{ tabContents[activeTab].title }}</h3>
              <p class="mc-body">{{ tabContents[activeTab].body }}</p>
            </div>
            <div class="mc-right">
              <div v-for="(item, i) in tabContents[activeTab].items"
                   :key="i" class="mc-item">
                <div class="mci-check">
                  <svg viewBox="0 0 20 20" fill="none">
                    <polyline points="4,10 8,14 16,6" stroke="#00ffb4" stroke-width="2"/>
                  </svg>
                </div>
                <span>{{ item }}</span>
              </div>
            </div>
          </div>
        </transition>
        <div class="mvv-deco">
          <div class="mvv-hex"></div>
        </div>
      </div>
    </section>

    <!-- ══ TIMELINE ════════════════════════════════════════ -->
    <section class="timeline-section">
      <div class="sec-tag fade-in">[ HISTORY ]</div>
      <h2 class="sec-title fade-in">成长轨迹</h2>

      <div class="timeline">
        <div class="tl-spine"></div>
        <div v-for="(ev, i) in timeline" :key="i"
             class="tl-item fade-in"
             :class="i % 2 === 0 ? 'left' : 'right'">
          <div class="tl-card">
            <div class="tlc-top">
              <span class="tlc-year">{{ ev.year }}</span>
              <span class="tlc-month">{{ ev.month }}</span>
            </div>
            <h3 class="tlc-title">{{ ev.title }}</h3>
            <p class="tlc-desc">{{ ev.desc }}</p>
            <div class="tlc-glow"></div>
          </div>
          <div class="tl-node">
            <div class="tln-outer"></div>
            <div class="tln-inner"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══ TEAM ═══════════════════════════════════════════ -->
    <section class="team-section">
      <div class="sec-tag fade-in">[ THE TEAM ]</div>
      <h2 class="sec-title fade-in">核心成员</h2>
      <p class="sec-sub fade-in">一群热爱技术、相信开放教育的建设者</p>

      <div class="team-grid">
        <div v-for="(m, i) in team" :key="i"
             class="member-card fade-in"
             :style="`--mc:${m.color}`"
             @mouseenter="hoveredMember = i"
             @mouseleave="hoveredMember = -1">
          <div class="mc-avatar" :style="`border-color:${m.color}44`">
            <div class="mca-inner" :style="`background:linear-gradient(135deg,${m.color}22,${m.color}08)`">
              <span :style="`color:${m.color}`">{{ m.avatar }}</span>
            </div>
            <div class="mca-ring" :style="`border-color:${m.color}30`"></div>
            <div class="mca-ring r2" :style="`border-color:${m.color}15`"></div>
          </div>
          <div class="mc-info">
            <h3 class="mci-name">{{ m.name }}</h3>
            <p class="mci-role">{{ m.role }}</p>
            <span class="mci-tag" :style="`color:${m.color};border-color:${m.color}33;background:${m.color}0a`">
              {{ m.tag }}
            </span>
          </div>
          <div class="mc-scan"></div>
          <div class="mc-corner tl"></div>
          <div class="mc-corner tr"></div>
          <div class="mc-corner bl"></div>
          <div class="mc-corner br"></div>
        </div>
      </div>
    </section>

    <!-- ══ TECH STACK ══════════════════════════════════════ -->
    <section class="tech-section fade-in">
      <div class="sec-tag">[ TECH STACK ]</div>
      <h2 class="sec-title">技术基础</h2>
      <div class="tech-orbit">
        <div class="to-center">
          <svg viewBox="0 0 48 48" fill="none">
            <polygon points="24,4 44,14 44,34 24,44 4,34 4,14"
                     stroke="#00ffb4" stroke-width="1.2" fill="rgba(0,255,180,0.06)"/>
            <circle cx="24" cy="24" r="5" fill="#00ffb4"/>
          </svg>
          <span>CORE</span>
        </div>
        <div class="to-ring r1"></div>
        <div class="to-ring r2"></div>
        <div v-for="(tech, i) in [
          {name:'Vue 3', color:'#42d392', angle: 0},
          {name:'Node.js', color:'#68a063', angle: 60},
          {name:'PostgreSQL', color:'#336791', angle: 120},
          {name:'Redis', color:'#dc382d', angle: 180},
          {name:'AI/ML', color:'#00c8ff', angle: 240},
          {name:'ElasticSearch', color:'#f9a825', angle: 300},
        ]" :key="i" class="tech-node"
             :style="`
            --angle:${tech.angle}deg;
            --tc:${tech.color};
            transform: rotate(${tech.angle}deg) translateX(120px) rotate(-${tech.angle}deg)
          `">
          <span>{{ tech.name }}</span>
        </div>
      </div>
    </section>

    <!-- ══ OPEN SOURCE ════════════════════════════════════ -->
    <section class="oss-section">
      <div class="oss-inner fade-in">
        <div class="oss-badge">OPEN SOURCE</div>
        <h2 class="oss-title">
          我们是<span class="gt">开放的</span>
        </h2>
        <p class="oss-desc">
          CourseNet 的核心模块已在 GitHub 开源。我们相信透明是信任的基础——<br/>
          欢迎 PR、Issue、Fork，共同构建更好的知识共享基础设施。
        </p>
        <div class="oss-stats">
          <div v-for="s in [
            {val:'2.1k', label:'Stars'},
            {val:'340', label:'Forks'},
            {val:'89', label:'Contributors'},
          ]" :key="s.label" class="oss-stat">
            <div class="oss-val">{{ s.val }}</div>
            <div class="oss-slabel">{{ s.label }}</div>
          </div>
        </div>
        <div class="oss-btns">
          <a href="#" class="btn-primary">
            <span class="bp-sweep"></span>
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            查看源码
          </a>
          <a href="#" class="btn-ghost">贡献指南 →</a>
        </div>
        <div class="oss-grid-deco"></div>
      </div>
    </section>

    <!-- ══ JOIN CTA ════════════════════════════════════════ -->
    <section class="join-section">
      <div class="js-glow"></div>
      <div class="js-content fade-in">
        <p class="js-sys">// NETWORK READY — KNOWLEDGE FLOWING</p>
        <h2 class="js-title">
          <span>加入我们的</span>
          <span class="gt">使命</span>
        </h2>
        <p class="js-desc">
          无论是上传一份笔记，还是全职加入团队——<br/>
          每一位参与者都是这个开放知识网络的共同缔造者。
        </p>
        <div class="js-btns">
          <a href="#" class="btn-primary lg">
            <span class="bp-sweep"></span>
            开始共享资料
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </a>
          <a href="#" class="btn-ghost lg">
            加入我们的团队
          </a>
        </div>
      </div>
      <div class="js-hex-ring"></div>
    </section>

    <!-- ══ FOOTER ══════════════════════════════════════════ -->
    <footer class="site-footer">
      <div class="sf-line"></div>
      <div class="sf-row">
        <div class="sf-brand">
          <svg viewBox="0 0 32 32" fill="none" width="22" height="22">
            <polygon points="16,2 30,10 30,22 16,30 2,22 2,10"
                     stroke="#00ffb4" stroke-width="1.5" fill="rgba(0,255,180,0.06)"/>
            <circle cx="16" cy="16" r="3" fill="#00ffb4"/>
          </svg>
          <span class="sf-name">COURSENET<em>.io</em></span>
        </div>
        <span class="sf-copy">© 2024 COURSENET.io — OPEN KNOWLEDGE, FOREVER</span>
        <div class="sf-links">
          <a href="#">隐私政策</a>
          <a href="#">使用条款</a>
          <a href="#">联系我们</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=JetBrains+Mono:wght@300;400;600&family=Noto+Sans+SC:wght@300;400;500;700&display=swap');

/* ─── TOKENS ──────────────────────────────────────────── */
:root {
  --g:    #00ffb4;
  --g2:   #00c8ff;
  --g3:   #a78bfa;
  --g4:   #ff6b35;
  --bg:   #020b10;
  --bg2:  #050f18;
  --bg3:  #03080d;
  --border:   rgba(0,255,180,0.08);
  --border-b: rgba(0,255,180,0.25);
  --text:  #c8f0e0;
  --muted: rgba(150,210,180,0.35);
  --fd: 'Orbitron', sans-serif;
  --fm: 'JetBrains Mono', monospace;
  --fb: 'Noto Sans SC', sans-serif;
  --ease-s: cubic-bezier(0.25,1,0.5,1);
  --ease-b: cubic-bezier(0.34,1.56,0.64,1);
}

/* ─── RESET ───────────────────────────────────────────── */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
.about-root{
  background: var(--bg);
  color: var(--text);
  font-family: var(--fb);
  overflow-x: hidden;
  position: relative;
  min-height: 100vh;
}

/* ─── BG + EFFECTS ────────────────────────────────────── */
.bg-canvas{
  position: fixed; inset: 0;
  width: 100%; height: 100%;
  pointer-events: none; z-index: 0;
}
.noise-layer{
  position: fixed; inset: 0; z-index: 1;
  pointer-events: none; opacity: 0.025;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 200px;
}
.cursor-glow{
  position: fixed; z-index: 1;
  width: 600px; height: 600px;
  transform: translate(-50%,-50%);
  background: radial-gradient(circle, rgba(0,255,180,0.035) 0%, transparent 55%);
  pointer-events: none;
  transition: left 0.08s, top 0.08s;
}

/* ─── NAV ─────────────────────────────────────────────── */
.top-nav{
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  height: 60px;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 6vw;
  background: rgba(2,11,16,0.7);
  backdrop-filter: blur(20px) saturate(1.5);
  border-bottom: 1px solid var(--border);
}
.nav-logo{
  display: flex; align-items: center; gap: 0.7rem;
  font-family: var(--fd); font-size: 0.74rem;
  font-weight: 700; letter-spacing: 0.18em; color: #fff;
}
.nav-logo svg{ width: 26px; height: 26px; }
.nav-logo em{ font-style: normal; color: var(--g); }

.nav-breadcrumb{
  font-family: var(--fm); font-size: 0.6rem;
  letter-spacing: 0.12em; color: var(--muted);
  display: flex; align-items: center; gap: 0.5rem;
}
.nav-breadcrumb a{ color: var(--muted); text-decoration: none; transition: color 0.2s; }
.nav-breadcrumb a:hover{ color: var(--g); }
.nav-breadcrumb .sep{ color: rgba(0,255,180,0.2); }
.nav-breadcrumb .current{ color: var(--g); }

/* ─── FADE-IN SYSTEM ──────────────────────────────────── */
.fade-in{
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.75s var(--ease-s), transform 0.75s var(--ease-s);
}
.fade-in.visible{
  opacity: 1; transform: translateY(0);
}

.sl-item{
  opacity: 0; transform: translateX(-20px);
  transition: opacity 0.6s var(--ease-s), transform 0.6s var(--ease-s);
}
.sl-item.visible{
  opacity: 1; transform: translateX(0);
}

/* ─── SHARED ──────────────────────────────────────────── */
.sec-tag{
  font-family: var(--fm); font-size: 0.58rem;
  letter-spacing: 0.26em; color: var(--g); opacity: 0.65;
  margin-bottom: 1rem;
}
.sec-title{
  font-family: var(--fd);
  font-size: clamp(1.5rem, 3.2vw, 2.6rem);
  font-weight: 700; letter-spacing: 0.14em;
  color: #fff; margin-bottom: 0.75rem;
}
.sec-sub{
  font-size: 0.85rem; color: var(--muted);
  font-weight: 300; margin-bottom: 3rem;
}
.gt{
  background: linear-gradient(90deg, var(--g), var(--g2));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 28px rgba(0,255,180,0.4));
}

/* ─── HERO ────────────────────────────────────────────── */
.hero{
  position: relative; z-index: 2;
  min-height: 100vh;
  display: flex; align-items: center;
  padding: 100px 6vw 60px;
  border-bottom: 1px solid var(--border);
  overflow: hidden;
}

/* Hex rings */
.hex-rings{
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  pointer-events: none;
}
.hr{
  position: absolute;
  border: 1px solid rgba(0,255,180,0.04);
  border-radius: 50%;
}
.hr-1{ width: 600px; height: 600px; animation: spinRing 25s linear infinite; }
.hr-2{ width: 900px; height: 900px; animation: spinRing 40s linear infinite reverse; }
.hr-3{ width: 1200px; height: 1200px; animation: spinRing 60s linear infinite; }
@keyframes spinRing{
  from{ transform: translate(-50%,-50%) rotate(0deg) translate(50%,50%); }
  to  { transform: translate(-50%,-50%) rotate(360deg) translate(50%,50%); }
}
/* Fix: simpler spin */
.hr{ top: 50%; left: 50%; transform: translate(-50%,-50%); }
.hr-1{ animation: spinS 25s linear infinite; }
.hr-2{ animation: spinS 40s linear infinite reverse; }
.hr-3{ animation: spinS 60s linear infinite; }
@keyframes spinS{
  from{ transform: translate(-50%,-50%) rotate(0deg); }
  to  { transform: translate(-50%,-50%) rotate(360deg); }
}

/* Scan lines */
.scan-overlay{
  position: absolute; inset: 0; pointer-events: none;
  background: repeating-linear-gradient(to bottom,
  transparent, transparent 3px, rgba(0,0,0,0.05) 3px, rgba(0,0,0,0.05) 4px);
}

.hero-inner{ position: relative; z-index: 2; flex: 1; }

.hero-badge{
  display: inline-flex; align-items: center; gap: 0.8rem;
  font-family: var(--fm); font-size: 0.58rem;
  letter-spacing: 0.28em; color: var(--g);
  margin-bottom: 2.5rem;
}
.bd-glyph{
  background: rgba(0,255,180,0.08);
  border: 1px solid rgba(0,255,180,0.2);
  padding: 0.35rem 0.75rem;
  animation: glowPulse 2.5s ease-in-out infinite;
}
@keyframes glowPulse{
  0%,100%{ box-shadow: 0 0 0px rgba(0,255,180,0); }
  50%     { box-shadow: 0 0 20px rgba(0,255,180,0.2); }
}
.bd-sep{ color: rgba(0,255,180,0.2); }
.bd-version{ color: var(--muted); }

.hero-h1{ margin-bottom: 1.8rem; }
.h1-line{ display: block; }

.line-a{
  font-family: var(--fd);
  font-size: clamp(0.7rem, 1.4vw, 1rem);
  font-weight: 400; letter-spacing: 0.4em;
  color: var(--muted); margin-bottom: 0.2rem;
  transition-delay: 0.1s;
}
.line-b{
  font-family: var(--fd);
  font-size: clamp(4rem, 12vw, 11rem);
  font-weight: 900; letter-spacing: 0.04em;
  color: transparent; -webkit-text-stroke: 1.5px rgba(0,255,180,0.22);
  line-height: 0.85;
  transition-delay: 0.2s;
}
.line-c{
  font-family: var(--fd);
  font-size: clamp(4rem, 12vw, 11rem);
  font-weight: 900; letter-spacing: 0.04em;
  line-height: 0.9;
  transition-delay: 0.3s;
}

/* Glitch effect */
.glitch{
  position: relative; display: inline-block;
  background: linear-gradient(100deg, var(--g) 0%, var(--g2) 55%, #fff 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 50px rgba(0,255,180,0.45));
  animation: glitchBase 6s infinite;
}
.glitch::before,.glitch::after{
  content: attr(data-text);
  position: absolute; left: 0; top: 0;
  background: linear-gradient(100deg, var(--g) 0%, var(--g2) 55%, #fff 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}
.glitch::before{
  animation: glitchTop 6s infinite;
  clip-path: polygon(0 0,100% 0,100% 35%,0 35%);
}
.glitch::after{
  animation: glitchBot 6s infinite;
  clip-path: polygon(0 65%,100% 65%,100% 100%,0 100%);
}
@keyframes glitchBase{ 0%,90%,100%{ transform: none; } 91%{ transform: skewX(-0.5deg); } 93%{ transform: skewX(0.5deg); } }
@keyframes glitchTop{
  0%,89%,100%{ transform: none; opacity: 0; }
  90%{ transform: translateX(-3px); opacity: 0.7; }
  92%{ transform: translateX(2px); opacity: 0; }
}
@keyframes glitchBot{
  0%,91%,100%{ transform: none; opacity: 0; }
  92%{ transform: translateX(3px); opacity: 0.6; }
  94%{ transform: translateX(-1px); opacity: 0; }
}

.hero-sub{
  font-size: 0.9rem; line-height: 1.9;
  color: rgba(150,210,180,0.6); font-weight: 300;
  max-width: 500px; margin-bottom: 3rem;
  transition-delay: 0.35s;
}

.hero-divider{
  display: flex; align-items: center; gap: 1.2rem;
  transition-delay: 0.45s;
}
.hd-track{
  width: 120px; height: 1px;
  background: rgba(0,255,180,0.1); overflow: hidden;
}
.hd-fill{
  height: 100%;
  background: linear-gradient(90deg, var(--g), var(--g2));
  animation: scanFill 2s ease-in-out infinite;
}
@keyframes scanFill{
  0%{ width:0; margin-left:0; }
  50%{ width:100%; margin-left:0; }
  100%{ width:0; margin-left:100%; }
}
.hd-label{
  font-family: var(--fm); font-size: 0.52rem;
  letter-spacing: 0.26em; color: var(--muted);
}
.hd-arrow{
  display: flex; flex-direction: column;
  align-items: center; gap: 2px;
  animation: bounce 2s ease-in-out infinite;
}
@keyframes bounce{
  0%,100%{ transform: translateY(0); }
  50%{ transform: translateY(5px); }
}
.arrow-line{
  width: 1px; height: 18px;
  background: linear-gradient(to bottom, var(--g), transparent);
}
.arrow-head{
  width: 0; height: 0;
  border-left: 3px solid transparent;
  border-right: 3px solid transparent;
  border-top: 5px solid var(--g);
}

/* Floating cards */
.float-cards{
  position: absolute; right: 6vw; top: 50%;
  transform: translateY(-50%);
  display: flex; flex-direction: column; gap: 1rem;
  z-index: 2;
}
.fc{
  background: rgba(5,15,24,0.88);
  border: 1px solid var(--border);
  backdrop-filter: blur(16px);
  padding: 1rem 1.5rem;
  animation: fcFloat 4s ease-in-out infinite;
}
.fc-1{ animation-delay: 0s; }
.fc-2{ animation-delay: 1.2s; }
.fc-3{ animation-delay: 0.6s; }
@keyframes fcFloat{
  0%,100%{ transform: translateY(0); }
  50%{ transform: translateY(-8px); }
}
.fc-label{
  font-family: var(--fm); font-size: 0.5rem;
  letter-spacing: 0.2em; color: var(--muted); margin-bottom: 0.3rem;
}
.fc-val{
  font-family: var(--fd); font-size: 0.9rem;
  font-weight: 600; color: var(--g);
  letter-spacing: 0.12em;
}

/* ─── METRICS ─────────────────────────────────────────── */
.metrics-wrap{
  position: relative; z-index: 2;
  border-bottom: 1px solid var(--border);
}
.metrics-grid{
  display: grid; grid-template-columns: repeat(4,1fr);
}
.metric-item{
  padding: 3rem 2.5rem;
  border-right: 1px solid var(--border);
  position: relative; overflow: hidden;
  transition: background 0.35s;
  --mc: var(--g);
}
.metric-item:last-child{ border-right: none; }
.metric-item:hover{ background: rgba(0,255,180,0.02); }

.mi-bar{
  position: absolute; top: 0; left: 0;
  width: 2px; height: 0;
  background: var(--mc);
  box-shadow: 0 0 12px var(--mc);
  animation: barGrow 1.5s ease-out forwards;
  animation-delay: var(--di, 0s);
}
@keyframes barGrow{ to{ height: 100%; } }
.metric-item:nth-child(1){ --di: 0.1s; }
.metric-item:nth-child(2){ --di: 0.25s; }
.metric-item:nth-child(3){ --di: 0.4s; }
.metric-item:nth-child(4){ --di: 0.55s; }

.mi-num{
  font-family: var(--fd);
  font-size: clamp(1.8rem, 3vw, 2.8rem);
  font-weight: 700; line-height: 1;
  background: linear-gradient(145deg, #fff 20%, var(--mc));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 18px rgba(0,255,180,0.3));
  margin-bottom: 0.5rem;
}
.mi-suf{ font-size: 0.7em; opacity: 0.7; }
.mi-label{ font-size: 0.82rem; color: var(--text); margin-bottom: 0.2rem; }
.mi-sub{
  font-family: var(--fm); font-size: 0.5rem;
  letter-spacing: 0.18em; color: var(--muted);
}
.mi-ring{
  position: absolute; right: 1.5rem; top: 50%;
  transform: translateY(-50%);
  width: 60px; height: 60px;
  border: 1px solid rgba(0,255,180,0.05);
  border-radius: 50%;
}
.mi-ring::before{
  content: ''; position: absolute; inset: 10px;
  border: 1px solid rgba(0,255,180,0.03);
  border-radius: 50%;
}

/* ─── STORY ───────────────────────────────────────────── */
.story-section{
  position: relative; z-index: 2;
  padding: 7rem 6vw;
  border-bottom: 1px solid var(--border);
}
.story-layout{
  display: grid; grid-template-columns: 1fr 1.6fr;
  gap: 8vw; align-items: start;
  margin-top: 2rem;
}
.story-title{
  font-family: var(--fd);
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: 900; letter-spacing: 0.06em;
  color: #fff; line-height: 1.15;
  margin-bottom: 1.5rem;
}
.story-accent-line{
  width: 60px; height: 2px;
  background: linear-gradient(90deg, var(--g), transparent);
  box-shadow: 0 0 12px var(--g);
}
.story-p{
  font-size: 0.88rem; line-height: 2;
  color: rgba(160,220,190,0.62); font-weight: 300;
  margin-bottom: 1.5rem;
}
.story-sig{
  display: flex; align-items: center; gap: 1rem;
  font-family: var(--fm); font-size: 0.62rem;
  letter-spacing: 0.1em; color: var(--muted);
  margin-top: 1rem;
}
.sig-line{ width: 40px; height: 1px; background: var(--border-b); }

/* ─── MVV ─────────────────────────────────────────────── */
.mvv-section{
  position: relative; z-index: 2;
  padding: 7rem 6vw;
  border-bottom: 1px solid var(--border);
}
.mvv-tabs{
  display: flex; gap: 0;
  margin-bottom: 0;
  border: 1px solid var(--border);
  width: fit-content;
  overflow: hidden;
}
.mvv-tab{
  display: flex; align-items: center; gap: 0.6rem;
  font-family: var(--fm); font-size: 0.66rem;
  letter-spacing: 0.16em;
  color: var(--muted);
  background: transparent; border: none;
  padding: 0.85rem 2rem; cursor: pointer;
  position: relative; overflow: hidden;
  transition: color 0.3s;
  border-right: 1px solid var(--border);
}
.mvv-tab:last-child{ border-right: none; }
.mvv-tab::after{
  content: ''; position: absolute;
  inset: 0; background: rgba(0,255,180,0.06);
  transform: scaleX(0); transform-origin: left;
  transition: transform 0.35s var(--ease-s);
}
.mvv-tab:hover{ color: var(--text); }
.mvv-tab:hover::after{ transform: scaleX(1); }
.mvv-tab.active{
  color: var(--g);
  background: rgba(0,255,180,0.04);
}
.mvv-tab.active::before{
  content: ''; position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 2px; background: var(--g);
  box-shadow: 0 0 8px var(--g);
}
.tab-icon{ font-size: 0.7rem; }

.mvv-panel{
  position: relative;
  border: 1px solid var(--border);
  border-top: none;
  background: var(--bg2);
  overflow: hidden;
  min-height: 260px;
}
.mvv-content{
  display: grid; grid-template-columns: 1.2fr 1fr;
  gap: 4rem; padding: 3rem;
}
.mc-title{
  font-family: var(--fd);
  font-size: clamp(1.2rem, 2.2vw, 1.8rem);
  font-weight: 700; color: #fff;
  letter-spacing: 0.1em; margin-bottom: 1rem;
}
.mc-body{
  font-size: 0.84rem; line-height: 1.95;
  color: rgba(160,220,190,0.6); font-weight: 300;
}
.mc-item{
  display: flex; align-items: center; gap: 0.85rem;
  font-size: 0.82rem; color: rgba(160,220,190,0.7);
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(0,255,180,0.04);
}
.mci-check{
  width: 22px; height: 22px; flex-shrink: 0;
  border: 1px solid rgba(0,255,180,0.25);
  display: flex; align-items: center; justify-content: center;
}
.mci-check svg{ width: 14px; height: 14px; }

.mvv-deco{
  position: absolute; right: 2rem; top: 50%;
  transform: translateY(-50%); opacity: 0.05;
}
.mvv-hex{
  width: 180px; height: 180px;
  border: 1px solid var(--g);
  clip-path: polygon(50% 0%,93.3% 25%,93.3% 75%,50% 100%,6.7% 75%,6.7% 25%);
  animation: hexSpin 8s linear infinite;
}
@keyframes hexSpin{ from{transform:rotate(0deg);} to{transform:rotate(360deg);} }

/* Tab transition */
.tab-slide-enter-active,.tab-slide-leave-active{
  transition: all 0.35s var(--ease-s);
}
.tab-slide-enter-from{ opacity:0; transform:translateX(18px); }
.tab-slide-leave-to  { opacity:0; transform:translateX(-18px); }

/* ─── TIMELINE ────────────────────────────────────────── */
.timeline-section{
  position: relative; z-index: 2;
  padding: 7rem 6vw;
  border-bottom: 1px solid var(--border);
}
.timeline{
  position: relative;
  margin-top: 3rem;
}
.tl-spine{
  position: absolute;
  left: 50%; top: 0; bottom: 0;
  width: 1px;
  background: linear-gradient(to bottom, transparent, var(--g) 15%, var(--g) 85%, transparent);
  transform: translateX(-50%);
  box-shadow: 0 0 8px rgba(0,255,180,0.3);
}
.tl-item{
  display: flex;
  align-items: center;
  margin-bottom: 3rem;
  position: relative;
  gap: 4rem;
}
.tl-item.left{ flex-direction: row; padding-right: 50%; }
.tl-item.right{ flex-direction: row-reverse; padding-left: 50%; }

.tl-card{
  flex: 1;
  background: var(--bg2);
  border: 1px solid var(--border);
  padding: 1.8rem 2rem;
  position: relative; overflow: hidden;
  transition: background 0.35s, transform 0.3s var(--ease-s);
}
.tl-card:hover{
  background: rgba(0,255,180,0.02);
  transform: translateY(-3px);
}
.tlc-top{
  display: flex; align-items: center; gap: 0.75rem;
  margin-bottom: 0.6rem;
}
.tlc-year{
  font-family: var(--fd); font-size: 0.7rem;
  font-weight: 600; color: var(--g);
  letter-spacing: 0.1em;
}
.tlc-month{
  font-family: var(--fm); font-size: 0.55rem;
  color: var(--muted); letter-spacing: 0.12em;
  background: rgba(0,255,180,0.06);
  padding: 0.1rem 0.4rem;
}
.tlc-title{
  font-family: var(--fb); font-size: 0.95rem;
  font-weight: 600; color: #fff; margin-bottom: 0.5rem;
}
.tlc-desc{
  font-size: 0.78rem; line-height: 1.85;
  color: rgba(150,210,180,0.55); font-weight: 300;
}
.tlc-glow{
  position: absolute; bottom: -30px; right: -30px;
  width: 100px; height: 100px;
  background: radial-gradient(circle, rgba(0,255,180,0.06) 0%, transparent 65%);
  pointer-events: none;
}

.tl-node{
  position: absolute; left: 50%;
  transform: translate(-50%, 0);
  display: flex; align-items: center; justify-content: center;
}
.tln-outer{
  width: 18px; height: 18px;
  border: 1px solid rgba(0,255,180,0.4);
  border-radius: 50%;
  animation: nodePulse 2.5s ease-in-out infinite;
}
@keyframes nodePulse{
  0%,100%{ box-shadow: 0 0 0 0 rgba(0,255,180,0); }
  50%{ box-shadow: 0 0 0 8px rgba(0,255,180,0.05); }
}
.tln-inner{
  position: absolute;
  width: 7px; height: 7px;
  background: var(--g);
  border-radius: 50%;
  box-shadow: 0 0 12px var(--g);
}

/* ─── TEAM ────────────────────────────────────────────── */
.team-section{
  position: relative; z-index: 2;
  padding: 7rem 6vw;
  border-bottom: 1px solid var(--border);
}
.team-grid{
  display: grid;
  grid-template-columns: repeat(3,1fr);
  gap: 1px;
  background: var(--border);
  border: 1px solid var(--border);
}
.member-card{
  background: var(--bg2);
  padding: 2.4rem 2rem;
  position: relative; overflow: hidden;
  display: flex; flex-direction: column;
  align-items: center; gap: 1.2rem;
  cursor: default;
  transition: background 0.35s, transform 0.3s var(--ease-s);
  --mc: var(--g);
}
.member-card:hover{
  background: var(--bg3);
  transform: translateY(-3px);
  z-index: 1;
}

/* Scan line on hover */
.mc-scan{
  position: absolute; top: -100%; left: 0; right: 0;
  height: 1px; background: var(--mc); opacity: 0.4;
  transition: top 0s;
  box-shadow: 0 0 8px var(--mc);
}
.member-card:hover .mc-scan{
  top: 100%;
  transition: top 0.6s linear;
}

/* Corner decorations */
.mc-corner{
  position: absolute;
  width: 12px; height: 12px;
  border-color: rgba(0,255,180,0.2);
  border-style: solid;
  transition: border-color 0.3s, width 0.3s, height 0.3s;
}
.mc-corner.tl{ top: 0; left: 0; border-width: 1px 0 0 1px; }
.mc-corner.tr{ top: 0; right: 0; border-width: 1px 1px 0 0; }
.mc-corner.bl{ bottom: 0; left: 0; border-width: 0 0 1px 1px; }
.mc-corner.br{ bottom: 0; right: 0; border-width: 0 1px 1px 0; }
.member-card:hover .mc-corner{
  border-color: var(--mc); width: 18px; height: 18px;
}

.mc-avatar{
  position: relative; width: 72px; height: 72px;
  border: 1px solid; border-radius: 50%;
}
.mca-inner{
  width: 100%; height: 100%; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.mca-inner span{
  font-family: var(--fd); font-size: 0.72rem;
  font-weight: 700; letter-spacing: 0.1em;
}
.mca-ring{
  position: absolute; inset: -8px;
  border: 1px solid; border-radius: 50%;
  animation: ringRotate 8s linear infinite;
}
.mca-ring.r2{
  inset: -16px;
  animation-direction: reverse;
  animation-duration: 12s;
}
@keyframes ringRotate{
  from{ transform: rotate(0deg); }
  to{ transform: rotate(360deg); }
}

.mc-info{
  display: flex; flex-direction: column;
  align-items: center; gap: 0.35rem; text-align: center;
}
.mci-name{ font-size: 0.88rem; font-weight: 500; color: #fff; }
.mci-role{
  font-family: var(--fm); font-size: 0.58rem;
  letter-spacing: 0.1em; color: var(--muted);
}
.mci-tag{
  font-family: var(--fm); font-size: 0.5rem;
  letter-spacing: 0.12em;
  padding: 0.2rem 0.65rem;
  border: 1px solid; margin-top: 0.2rem;
}

/* ─── TECH ORBIT ──────────────────────────────────────── */
.tech-section{
  position: relative; z-index: 2;
  padding: 7rem 6vw;
  border-bottom: 1px solid var(--border);
  display: flex; flex-direction: column;
  align-items: center;
}
.tech-orbit{
  position: relative;
  width: 300px; height: 300px;
  margin-top: 3rem;
}
.to-center{
  position: absolute; inset: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 0.5rem;
  z-index: 2;
}
.to-center svg{ width: 42px; height: 42px; }
.to-center span{
  font-family: var(--fm); font-size: 0.52rem;
  letter-spacing: 0.22em; color: var(--g);
}
.to-ring{
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%,-50%);
  border-radius: 50%; border: 1px solid rgba(0,255,180,0.07);
}
.to-ring.r1{ width: 240px; height: 240px; animation: spinS 10s linear infinite; }
.to-ring.r2{ width: 300px; height: 300px; animation: spinS 16s linear infinite reverse; }

.tech-node{
  position: absolute; top: 50%; left: 50%;
  transform-origin: center;
  z-index: 1;
}
.tech-node span{
  font-family: var(--fm); font-size: 0.56rem;
  letter-spacing: 0.1em; color: var(--muted);
  background: rgba(5,15,24,0.9);
  border: 1px solid var(--border);
  padding: 0.3rem 0.65rem;
  white-space: nowrap;
  transition: color 0.25s, border-color 0.25s;
}
.tech-node:hover span{ color: var(--g); border-color: rgba(0,255,180,0.3); }

/* ─── OSS ─────────────────────────────────────────────── */
.oss-section{
  position: relative; z-index: 2;
  padding: 7rem 6vw;
  border-bottom: 1px solid var(--border);
}
.oss-inner{
  position: relative;
  max-width: 700px; margin: 0 auto;
  text-align: center;
}
.oss-grid-deco{
  position: absolute; inset: -3rem;
  background-image:
      linear-gradient(rgba(0,255,180,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,255,180,0.025) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%);
  z-index: -1;
}
.oss-badge{
  display: inline-block;
  font-family: var(--fm); font-size: 0.56rem;
  letter-spacing: 0.26em; color: var(--g);
  background: rgba(0,255,180,0.06);
  border: 1px solid rgba(0,255,180,0.2);
  padding: 0.35rem 1rem; margin-bottom: 1.5rem;
}
.oss-title{
  font-family: var(--fd);
  font-size: clamp(2.5rem, 6vw, 5rem);
  font-weight: 900; color: #fff;
  letter-spacing: 0.06em; margin-bottom: 1.5rem;
}
.oss-desc{
  font-size: 0.86rem; line-height: 1.95;
  color: var(--muted); font-weight: 300;
  margin-bottom: 2.5rem;
}
.oss-stats{
  display: flex; justify-content: center; gap: 3rem;
  margin-bottom: 2.5rem;
}
.oss-stat{ text-align: center; }
.oss-val{
  font-family: var(--fd); font-size: 1.6rem;
  font-weight: 700; color: var(--g);
  filter: drop-shadow(0 0 12px rgba(0,255,180,0.4));
}
.oss-slabel{
  font-family: var(--fm); font-size: 0.54rem;
  letter-spacing: 0.14em; color: var(--muted);
}
.oss-btns{
  display: flex; gap: 1rem; justify-content: center;
}

/* ─── BUTTONS ─────────────────────────────────────────── */
.btn-primary{
  display: inline-flex; align-items: center; gap: 0.7rem;
  font-family: var(--fm); font-size: 0.7rem;
  letter-spacing: 0.14em; color: #000;
  background: var(--g); padding: 0.9rem 2rem;
  text-decoration: none; position: relative; overflow: hidden;
  clip-path: polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px));
  transition: background 0.3s, box-shadow 0.3s, transform 0.2s;
}
.btn-primary:hover{
  background: #fff;
  box-shadow: 0 0 48px rgba(0,255,180,0.5);
  transform: translateY(-2px);
}
.btn-primary svg{ width: 16px; height: 16px; }
.btn-primary.lg{ font-size: 0.76rem; padding: 1.05rem 2.5rem; }
.bp-sweep{
  position: absolute; top:0; left:-110%; width:60%; height:100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
  transition: left 0.55s var(--ease-s);
}
.btn-primary:hover .bp-sweep{ left:160%; }

.btn-ghost{
  display: inline-flex; align-items: center;
  font-family: var(--fm); font-size: 0.7rem;
  letter-spacing: 0.14em; color: var(--muted);
  background: none; border: 1px solid var(--border);
  padding: 0.88rem 1.8rem; text-decoration: none;
  clip-path: polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px));
  transition: color 0.25s, border-color 0.25s, transform 0.2s;
}
.btn-ghost:hover{ color: var(--text); border-color: var(--border-b); transform: translateY(-2px); }
.btn-ghost.lg{ font-size: 0.74rem; padding: 1rem 2.2rem; }

/* ─── JOIN CTA ────────────────────────────────────────── */
.join-section{
  position: relative; z-index: 2;
  padding: 9rem 6vw 8rem;
  text-align: center; overflow: hidden;
}
.js-glow{
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%,-50%);
  width: 800px; height: 400px;
  background: radial-gradient(ellipse, rgba(0,200,255,0.06) 0%, transparent 60%);
  pointer-events: none;
}
.js-content{ position: relative; z-index: 1; }
.js-sys{
  font-family: var(--fm); font-size: 0.58rem;
  letter-spacing: 0.22em; color: rgba(0,255,180,0.4);
  margin-bottom: 1.8rem;
}
.js-title{
  font-family: var(--fd);
  font-size: clamp(3rem, 8vw, 7.5rem);
  font-weight: 900; letter-spacing: -0.01em;
  line-height: 1; margin-bottom: 1.5rem;
  display: flex; flex-direction: column;
  align-items: center; gap: 0;
}
.js-desc{
  font-size: 0.88rem; color: var(--muted);
  line-height: 1.9; font-weight: 300;
  max-width: 400px; margin: 0 auto 2.5rem;
}
.js-btns{
  display: flex; gap: 1.2rem; justify-content: center;
}
.js-hex-ring{
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%,-50%);
  width: 700px; height: 700px;
  border: 1px solid rgba(0,255,180,0.03);
  border-radius: 50%;
  animation: spinS 35s linear infinite;
  pointer-events: none;
}
.js-hex-ring::before{
  content: ''; position: absolute; inset: 80px;
  border: 1px solid rgba(0,255,180,0.02);
  border-radius: 50%;
}

/* ─── FOOTER ──────────────────────────────────────────── */
.site-footer{
  position: relative; z-index: 2;
  padding: 2rem 6vw;
  border-top: 1px solid var(--border);
}
.sf-line{
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--g), transparent);
  margin-bottom: 1.5rem; opacity: 0.2;
}
.sf-row{
  display: flex; align-items: center;
  justify-content: space-between;
}
.sf-brand{
  display: flex; align-items: center; gap: 0.6rem;
  font-family: var(--fd); font-size: 0.72rem;
  font-weight: 700; letter-spacing: 0.16em; color: #fff;
}
.sf-brand em{ font-style: normal; color: var(--g); }
.sf-copy{
  font-family: var(--fm); font-size: 0.52rem;
  letter-spacing: 0.1em; color: rgba(0,255,180,0.18);
}
.sf-links{ display: flex; gap: 1.5rem; }
.sf-links a{
  font-family: var(--fm); font-size: 0.56rem;
  letter-spacing: 0.1em; color: var(--muted);
  text-decoration: none; transition: color 0.25s;
}
.sf-links a:hover{ color: var(--g); }

/* ─── RESPONSIVE ──────────────────────────────────────── */
@media(max-width:1100px){
  .story-layout{ grid-template-columns: 1fr; gap: 3rem; }
  .team-grid{ grid-template-columns: repeat(2,1fr); }
  .metrics-grid{ grid-template-columns: repeat(2,1fr); }
  .metric-item{ border-bottom: 1px solid var(--border); }
}
@media(max-width:860px){
  .float-cards{ display: none; }
  .mvv-content{ grid-template-columns: 1fr; }
  .tl-item.left,.tl-item.right{
    flex-direction: column; padding: 0 0 0 3rem;
  }
  .tl-spine{ left: 0; }
  .tl-node{ left: 0; }
  .oss-stats{ gap: 2rem; }
  .js-btns,.oss-btns{ flex-direction: column; align-items: center; }
  .sf-row{ flex-direction: column; gap: 1rem; text-align: center; }
}
@media(max-width:600px){
  .team-grid{ grid-template-columns: 1fr; }
  .metrics-grid{ grid-template-columns: 1fr 1fr; }
}
</style>