<template>
  <div class="home" ref="homeRef">

    <!-- ===== HERO SECTION ===== -->
    <section class="hero" ref="heroRef">
      <canvas class="hero-canvas" ref="canvasRef"></canvas>
      <div class="hero-grid-overlay"></div>

      <div class="hero-content" :class="{ 'is-visible': heroVisible }">
        <div class="hero-badge">
          <span class="badge-dot"></span>
          <span>2,400+ 门课程已上线</span>
        </div>
        <h1 class="hero-title">
          <span class="line line-1">知识无边界</span>
          <span class="line line-2">共享<em>无限制</em></span>
        </h1>
        <p class="hero-sub">
          汇聚全球顶尖课程资料，由学习者为学习者构建的开放知识平台。<br>
          上传、发现、成长——从这里开始。
        </p>
        <div class="hero-actions">
          <router-link to="/explore">
            <button class="btn-primary">
              <span>探索课程库</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </router-link>
          <router-link to="/upload">
            <button class="btn-ghost">上传资料</button>
          </router-link>
        </div>
        <div class="hero-stats">
          <div class="stat" v-for="s in stats" :key="s.label">
            <strong>{{ s.value }}</strong>
            <span>{{ s.label }}</span>
          </div>
        </div>
      </div>

      <div class="hero-visual">
        <div class="card-stack">
          <div class="float-card card-a">
            <div class="card-icon">📐</div>
            <div class="card-text">
              <strong>线性代数笔记</strong>
              <span>MIT 18.06 精讲版</span>
            </div>
            <div class="card-tag">数学</div>
          </div>
          <div class="float-card card-b">
            <div class="card-icon">⚗️</div>
            <div class="card-text">
              <strong>有机化学总结</strong>
              <span>反应机理全解</span>
            </div>
            <div class="card-tag">化学</div>
          </div>
          <div class="float-card card-c">
            <div class="card-icon">💻</div>
            <div class="card-text">
              <strong>算法导论习题解</strong>
              <span>CLRS 完整版</span>
            </div>
            <div class="card-tag">CS</div>
          </div>
          <div class="float-card card-d">
            <div class="progress-ring-wrap">
              <svg class="progress-ring" viewBox="0 0 60 60">
                <circle cx="30" cy="30" r="24" class="ring-bg"/>
                <circle cx="30" cy="30" r="24" class="ring-fill" stroke-dasharray="150.8" stroke-dashoffset="37.7"/>
              </svg>
              <span class="ring-pct">75%</span>
            </div>
            <span class="ring-label">完成进度</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== MARQUEE ===== -->
    <div class="marquee-strip">
      <div class="marquee-track">
        <span v-for="t in marqueeItems.concat(marqueeItems)" :key="Math.random()">{{ t }}</span>
      </div>
    </div>

    <!-- ===== FEATURES ===== -->
    <section class="features" ref="featuresRef">
      <div class="section-header" :class="{ 'is-visible': featuresVisible }">
        <span class="overline">平台特性</span>
        <h2>为学习者打造<br>每一个细节</h2>
      </div>
      <div class="features-grid" :class="{ 'is-visible': featuresVisible }">
        <div class="feature-card fc-large">
          <div class="fc-icon-wrap">
            <div class="fc-icon">🔍</div>
          </div>
          <h3>智能搜索</h3>
          <p>语义级别的资料搜索引擎，精准匹配你的学习需求，超越关键词的理解。</p>
          <div class="fc-demo">
            <div class="search-demo">
              <span class="search-cursor">微积分 期末</span>
              <span class="search-blink">|</span>
            </div>
            <div class="search-results">
              <div class="sr-item" v-for="r in searchDemo" :key="r">{{ r }}</div>
            </div>
          </div>
        </div>
        <div class="feature-card fc-mid">
          <div class="fc-icon-wrap"><div class="fc-icon">📦</div></div>
          <h3>一键打包</h3>
          <p>将整门课程的资料打包下载，学习更系统、更高效。</p>
        </div>
        <div class="feature-card fc-mid">
          <div class="fc-icon-wrap"><div class="fc-icon">🤝</div></div>
          <h3>协作笔记</h3>
          <p>多人实时编辑、评注，知识在交流中升华。</p>
        </div>
        <div class="feature-card fc-wide">
          <div class="fc-icon-wrap"><div class="fc-icon">📊</div></div>
          <h3>学习追踪</h3>
          <p>可视化你的学习旅程，记录每一份进步。</p>
          <div class="track-bar-wrap">
            <div class="track-bar" v-for="(b, i) in trackBars" :key="i" :style="{ '--h': b.h, '--c': b.c, animationDelay: i * 0.1 + 's' }"></div>
          </div>
        </div>
        <div class="feature-card fc-accent">
          <div class="fc-icon-wrap"><div class="fc-icon">🌐</div></div>
          <h3>多语言支持</h3>
          <p>中、英、日、德… 打破语言壁垒，世界知识触手可及。</p>
          <div class="lang-tags">
            <span v-for="l in langs" :key="l">{{ l }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== SHOWCASE / SCROLLING CONTENT ===== -->
    <section class="showcase" ref="showcaseRef">
      <div class="showcase-sticky">
        <div class="showcase-text-panel" :class="{ 'is-visible': showcaseVisible }">
          <div class="showcase-steps">
            <div
                class="ss-step"
                v-for="(step, i) in showcaseSteps"
                :key="i"
                :class="{ active: activeStep === i }"
                @click="activeStep = i"
            >
              <span class="ss-num">0{{ i + 1 }}</span>
              <div class="ss-content">
                <h3>{{ step.title }}</h3>
                <p>{{ step.desc }}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="showcase-visual-panel">
          <transition name="panel-fade" mode="out-in">
            <div class="sv-mockup" :key="activeStep">
              <div class="sv-screen" :class="'screen-' + activeStep">
                <template v-if="activeStep === 0">
                  <div class="mock-upload">
                    <div class="upload-zone">
                      <div class="upload-icon">☁️</div>
                      <p>拖拽或点击上传</p>
                      <span>.pdf .docx .pptx .md</span>
                    </div>
                    <div class="upload-list">
                      <div class="ul-item" v-for="f in mockFiles" :key="f.name">
                        <span class="ulf-icon">{{ f.icon }}</span>
                        <span class="ulf-name">{{ f.name }}</span>
                        <span class="ulf-bar"><span :style="{ width: f.pct }"></span></span>
                      </div>
                    </div>
                  </div>
                </template>
                <template v-if="activeStep === 1">
                  <div class="mock-browse">
                    <div class="mb-filter">
                      <span v-for="f in browseFilters" :key="f" :class="{ active: f === '全部' }">{{ f }}</span>
                    </div>
                    <div class="mb-grid">
                      <div class="mb-card" v-for="c in browseCards" :key="c.title">
                        <div class="mb-cover" :style="{ background: c.bg }">{{ c.emoji }}</div>
                        <div class="mb-info">
                          <strong>{{ c.title }}</strong>
                          <span>{{ c.author }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
                <template v-if="activeStep === 2">
                  <div class="mock-community">
                    <div class="mc-thread" v-for="t in threads" :key="t.name">
                      <div class="mc-avatar" :style="{ background: t.color }">{{ t.name[0] }}</div>
                      <div class="mc-msg">
                        <strong>{{ t.name }}</strong>
                        <p>{{ t.msg }}</p>
                      </div>
                      <span class="mc-like">♥ {{ t.like }}</span>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </section>

    <!-- ===== TESTIMONIALS ===== -->
    <section class="testimonials" ref="testimonialsRef">
      <div class="section-header" :class="{ 'is-visible': testimonialsVisible }">
        <span class="overline">用户心声</span>
        <h2>学习者的真实体验</h2>
      </div>
      <div class="testi-track-wrap">
        <div class="testi-track">
          <div class="testi-card" v-for="t in testimonials.concat(testimonials)" :key="Math.random()">
            <div class="testi-stars">★★★★★</div>
            <p>"{{ t.text }}"</p>
            <div class="testi-author">
              <div class="testi-avatar" :style="{ background: t.color }">{{ t.name[0] }}</div>
              <div>
                <strong>{{ t.name }}</strong>
                <span>{{ t.role }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== CTA FINAL ===== -->
    <section class="cta-final" ref="ctaRef">
      <div class="cta-bg-grid"></div>
      <div class="cta-content" :class="{ 'is-visible': ctaVisible }">
        <span class="overline">现在加入</span>
        <h2>你的学习，<br>从这一刻升级</h2>
        <p>免费注册，立即访问 2,400+ 门课程资料</p>
        <div class="cta-input-row">
          <input type="email" placeholder="输入你的邮箱地址" class="cta-email-input" />
          <button class="btn-primary">
            <span>免费开始</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
        <span class="cta-note">无需信用卡 · 随时取消 · 永久免费层</span>
      </div>
    </section>

  </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      heroVisible: false,
      featuresVisible: false,
      showcaseVisible: false,
      testimonialsVisible: false,
      ctaVisible: false,
      activeStep: 0,
      stats: [
        { value: '2,400+', label: '课程资料' },
        { value: '18K+', label: '活跃用户' },
        { value: '96%', label: '好评率' },
      ],
      marqueeItems: [
        '📐 高等数学', '💻 算法导论', '⚗️ 有机化学', '📖 英语写作',
        '🎨 设计原理', '📊 统计学', '🌍 世界历史', '🔬 分子生物学',
        '🎵 乐理基础', '🏛️ 经济学原理', '🔭 天体物理', '💡 电路分析',
      ],
      searchDemo: ['📄 微积分期末真题 2023', '📋 高等数学章节总结', '🗂️ 极限与导数专题'],
      trackBars: [
        { h: '40%', c: '#3B82F6' }, { h: '65%', c: '#8B5CF6' }, { h: '50%', c: '#06B6D4' },
        { h: '80%', c: '#3B82F6' }, { h: '55%', c: '#8B5CF6' }, { h: '90%', c: '#06B6D4' },
        { h: '45%', c: '#3B82F6' }, { h: '70%', c: '#8B5CF6' },
      ],
      langs: ['中文', 'English', '日本語', 'Deutsch', 'Français', 'Español'],
      showcaseSteps: [
        { title: '上传你的资料', desc: '支持 PDF、Word、PPT、Markdown 等格式，一键上传，自动分类整理，让知识立刻被发现。' },
        { title: '发现精品内容', desc: '智能推荐引擎根据你的学习方向，为你呈现最相关的课程笔记、习题和总结。' },
        { title: '连接学习社群', desc: '与全球数万名学习者交流，获得反馈，共同进步——学习不再孤独。' },
      ],
      mockFiles: [
        { icon: '📄', name: '线性代数笔记.pdf', pct: '100%' },
        { icon: '📊', name: '期末复习PPT.pptx', pct: '72%' },
        { icon: '📝', name: '习题解答.docx', pct: '45%' },
      ],
      browseFilters: ['全部', '数学', '物理', '计算机', '语言'],
      browseCards: [
        { title: '数据结构精讲', author: '张同学', bg: 'linear-gradient(135deg,#1a1a3e,#3b82f6)', emoji: '🌳' },
        { title: '量子力学导论', author: 'Wei L.', bg: 'linear-gradient(135deg,#0d2137,#06b6d4)', emoji: '⚛️' },
        { title: '概率论与统计', author: '李教授整理', bg: 'linear-gradient(135deg,#1e0a3c,#8b5cf6)', emoji: '🎲' },
        { title: '英语学术写作', author: 'Sarah K.', bg: 'linear-gradient(135deg,#0a2e1e,#10b981)', emoji: '✍️' },
      ],
      threads: [
        { name: '张宇轩', color: '#3b82f6', msg: '有人有《流体力学》第三章的习题解答吗？', like: 12 },
        { name: 'Mei W.', color: '#8b5cf6', msg: '刚上传了完整的操作系统笔记，欢迎取用！', like: 47 },
        { name: '陈思远', color: '#06b6d4', msg: '感谢那份微积分总结，期末考试救了我！', like: 89 },
      ],
      testimonials: [
        { text: '这个平台改变了我备考的方式，资料质量远超我的预期。', name: '林小雨', role: '清华大学 · 计算机系大三', color: '#3b82f6' },
        { text: '我上传了自己的笔记，没想到帮助了这么多同学，太有成就感了！', name: 'Kevin Z.', role: 'UC Berkeley · 数学系研究生', color: '#8b5cf6' },
        { text: '智能搜索真的太准了，找到了一份完美契合我需求的资料。', name: '吴依晨', role: '复旦大学 · 经济学大二', color: '#10b981' },
        { text: '多语言支持让我能找到英文和中文的对照资料，学习效率翻倍。', name: 'Amara N.', role: '北京大学 · 留学生', color: '#f59e0b' },
        { text: '社区讨论功能非常活跃，总能在这里找到解答疑惑的人。', name: '赵铭远', role: '上海交通大学 · 物理系大四', color: '#ef4444' },
      ],
      _stepTimer: null,
    }
  },
  mounted() {
    this.initCanvas()
    this.setupObservers()
    this._stepTimer = setInterval(() => {
      this.activeStep = (this.activeStep + 1) % this.showcaseSteps.length
    }, 4000)
  },
  beforeDestroy() {
    clearInterval(this._stepTimer)
  },
  methods: {
    setupObservers() {
      const opts = { threshold: 0.15 }
      const sections = [
        ['heroRef', 'heroVisible'],
        ['featuresRef', 'featuresVisible'],
        ['showcaseRef', 'showcaseVisible'],
        ['testimonialsRef', 'testimonialsVisible'],
        ['ctaRef', 'ctaVisible'],
      ]
      sections.forEach(([ref, flag]) => {
        const el = this.$refs[ref]
        if (!el) return
        const obs = new IntersectionObserver(([e]) => {
          if (e.isIntersecting) { this[flag] = true; obs.disconnect() }
        }, opts)
        obs.observe(el)
      })
    },
    initCanvas() {
      const canvas = this.$refs.canvasRef
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      let W, H, dots = [], raf
      const resize = () => {
        W = canvas.width = canvas.offsetWidth
        H = canvas.height = canvas.offsetHeight
        dots = Array.from({ length: 60 }, () => ({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
          r: Math.random() * 2 + 1,
          a: Math.random(),
        }))
      }
      resize()
      window.addEventListener('resize', resize)
      const draw = () => {
        ctx.clearRect(0, 0, W, H)
        dots.forEach(d => {
          d.x += d.vx; d.y += d.vy
          if (d.x < 0 || d.x > W) d.vx *= -1
          if (d.y < 0 || d.y > H) d.vy *= -1
          ctx.beginPath()
          ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(99,179,237,${d.a * 0.5})`
          ctx.fill()
        })
        dots.forEach((a, i) => {
          dots.slice(i + 1).forEach(b => {
            const dx = a.x - b.x, dy = a.y - b.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < 120) {
              ctx.beginPath()
              ctx.moveTo(a.x, a.y)
              ctx.lineTo(b.x, b.y)
              ctx.strokeStyle = `rgba(99,179,237,${(1 - dist / 120) * 0.15})`
              ctx.lineWidth = 1
              ctx.stroke()
            }
          })
        })
        raf = requestAnimationFrame(draw)
      }
      draw()
      this._cancelCanvas = () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
    },
  },
}
</script>

<style lang="scss">
/* =========================================
   DESIGN TOKENS
   ========================================= */
:root {
  --bg: #040d18;
  --bg-2: #070f1e;
  --bg-card: rgba(255,255,255,0.04);
  --border: rgba(255,255,255,0.08);
  --accent: #3b82f6;
  --accent-2: #8b5cf6;
  --accent-3: #06b6d4;
  --text: #e2e8f0;
  --text-muted: #64748b;
  --radius: 16px;
  --radius-sm: 10px;
  --font-display: 'Sora', 'PingFang SC', sans-serif;
  --font-body: 'Plus Jakarta Sans', 'PingFang SC', sans-serif;
}

@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.home {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-body);
  overflow-x: hidden;
}

/* =========================================
   HERO
   ========================================= */
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 120px 8vw 80px;
  overflow: hidden;
  gap: 4rem;

  @media (max-width: 900px) {
    flex-direction: column;
    padding: 100px 6vw 60px;
    text-align: center;
  }
}

.hero-canvas {
  position: absolute; inset: 0; width: 100%; height: 100%;
  pointer-events: none; z-index: 0;
}
.hero-grid-overlay {
  position: absolute; inset: 0;
  background-image:
      linear-gradient(rgba(99,179,237,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(99,179,237,0.04) 1px, transparent 1px);
  background-size: 60px 60px;
  z-index: 0;
}

.hero-content {
  position: relative; z-index: 2;
  flex: 0 0 52%;
  opacity: 0; transform: translateY(40px);
  transition: opacity 0.9s cubic-bezier(.16,1,.3,1), transform 0.9s cubic-bezier(.16,1,.3,1);
  &.is-visible { opacity: 1; transform: none; }
}

.hero-badge {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(59,130,246,0.12); border: 1px solid rgba(59,130,246,0.25);
  color: var(--accent); border-radius: 999px;
  padding: 6px 14px; font-size: 0.82rem; font-weight: 500;
  margin-bottom: 1.5rem;
  .badge-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--accent); animation: pulse-dot 2s infinite;
  }
}
@keyframes pulse-dot {
  0%,100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.6); }
  50% { box-shadow: 0 0 0 5px rgba(59,130,246,0); }
}

.hero-title {
  font-family: var(--font-display);
  font-size: clamp(2.8rem, 5.5vw, 4.8rem);
  font-weight: 800; line-height: 1.1;
  margin-bottom: 1.5rem;
  .line { display: block; overflow: hidden; }
  .line-1 { color: var(--text); }
  .line-2 { color: transparent;
    background: linear-gradient(90deg, var(--accent), var(--accent-2), var(--accent-3));
    -webkit-background-clip: text; background-clip: text;
    em { font-style: normal; }
  }
}

.hero-sub {
  font-size: 1.05rem; line-height: 1.75;
  color: var(--text-muted); max-width: 520px;
  margin-bottom: 2.5rem;
  @media (max-width: 900px) { margin: 0 auto 2rem; }
}

.hero-actions {
  display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 3rem;
  @media (max-width: 900px) { justify-content: center; }
}

.btn-primary {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 14px 28px; border: none; border-radius: 999px;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  color: #fff; font-size: 0.95rem; font-weight: 600; cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  svg { width: 16px; height: 16px; transition: transform 0.2s; }
  &:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(59,130,246,0.4); svg { transform: translateX(3px); } }
}
.btn-ghost {
  display: inline-flex; align-items: center;
  padding: 14px 28px; border: 1px solid var(--border);
  border-radius: 999px; background: transparent;
  color: var(--text); font-size: 0.95rem; font-weight: 500; cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  &:hover { border-color: rgba(255,255,255,0.25); background: rgba(255,255,255,0.05); }
}

.hero-stats {
  display: flex; gap: 2rem;
  @media (max-width: 900px) { justify-content: center; }
  .stat {
    display: flex; flex-direction: column;
    strong { font-family: var(--font-display); font-size: 1.6rem; font-weight: 700; color: #fff; }
    span { font-size: 0.78rem; color: var(--text-muted); margin-top: 2px; }
  }
}

/* ---- Hero Visual (floating cards) ---- */
.hero-visual {
  position: relative; z-index: 2; flex: 0 0 42%;
  display: flex; justify-content: center; align-items: center;
  @media (max-width: 900px) { width: 100%; margin-top: 2rem; }
}
.card-stack { position: relative; width: 340px; height: 400px; }

.float-card {
  position: absolute;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  backdrop-filter: blur(16px);
  border-radius: var(--radius);
  padding: 18px;
  display: flex; align-items: center; gap: 12px;
  font-size: 0.85rem;
  box-shadow: 0 20px 60px rgba(0,0,0,0.4);
  .card-icon { font-size: 1.8rem; }
  .card-text { flex: 1;
    strong { display: block; color: #fff; font-weight: 600; margin-bottom: 2px; }
    span { color: var(--text-muted); font-size: 0.78rem; }
  }
  .card-tag { background: rgba(59,130,246,0.15); color: var(--accent); border-radius: 6px; padding: 3px 8px; font-size: 0.72rem; font-weight: 600; white-space: nowrap; }
}
.card-a { top: 0; left: 0; width: 280px; animation: float-a 4s ease-in-out infinite; }
.card-b { top: 120px; right: 0; width: 260px; animation: float-b 5s ease-in-out infinite; }
.card-c { bottom: 60px; left: 20px; width: 270px; animation: float-c 4.5s ease-in-out infinite; }
.card-d {
  top: 50px; right: -20px; width: 130px;
  flex-direction: column; align-items: center; gap: 6px;
  animation: float-b 3.5s ease-in-out infinite reverse;
  .ring-label { font-size: 0.72rem; color: var(--text-muted); }
}
.progress-ring-wrap { position: relative; width: 60px; height: 60px;
  .ring-pct { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 0.78rem; font-weight: 700; color: var(--accent); }
}
.progress-ring { transform: rotate(-90deg);
  .ring-bg { fill: none; stroke: rgba(255,255,255,0.08); stroke-width: 4; }
  .ring-fill { fill: none; stroke: var(--accent); stroke-width: 4; stroke-linecap: round; }
}

@keyframes float-a { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
@keyframes float-b { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-16px); } }
@keyframes float-c { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }

/* =========================================
   MARQUEE
   ========================================= */
.marquee-strip {
  overflow: hidden; white-space: nowrap;
  border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
  padding: 14px 0; background: rgba(255,255,255,0.02);
}
.marquee-track {
  display: inline-flex; gap: 2.5rem;
  animation: marquee 30s linear infinite;
  span { font-size: 0.85rem; color: var(--text-muted); font-weight: 500; padding: 0 0.5rem; }
}
@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }

/* =========================================
   SECTION HEADER (SHARED)
   ========================================= */
.section-header {
  text-align: center; margin-bottom: 4rem;
  opacity: 0; transform: translateY(30px);
  transition: opacity 0.8s ease, transform 0.8s ease;
  &.is-visible { opacity: 1; transform: none; }
  .overline { font-size: 0.78rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--accent); display: block; margin-bottom: 0.8rem; }
  h2 { font-family: var(--font-display); font-size: clamp(2rem, 3.5vw, 3rem); font-weight: 800; line-height: 1.2; color: #fff; }
}

/* =========================================
   FEATURES
   ========================================= */
.features {
  padding: 8rem 8vw;
  .features-grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 1.25rem;
    opacity: 0; transform: translateY(40px);
    transition: opacity 0.9s ease 0.2s, transform 0.9s ease 0.2s;
    &.is-visible { opacity: 1; transform: none; }
  }
}

.feature-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 2rem;
  transition: border-color 0.3s, transform 0.3s, background 0.3s;
  &:hover { border-color: rgba(59,130,246,0.3); transform: translateY(-4px); background: rgba(59,130,246,0.05); }
  h3 { font-family: var(--font-display); font-size: 1.2rem; font-weight: 700; color: #fff; margin-bottom: 0.7rem; }
  p { font-size: 0.88rem; color: var(--text-muted); line-height: 1.7; }
  .fc-icon-wrap { margin-bottom: 1rem; }
  .fc-icon { font-size: 2rem; }
}

.fc-large { grid-column: span 5; }
.fc-mid   { grid-column: span 3; }
.fc-wide  { grid-column: span 4; }
.fc-accent { grid-column: span 4; background: linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1)); border-color: rgba(139,92,246,0.2); }

@media (max-width: 1024px) {
  .fc-large, .fc-mid, .fc-wide, .fc-accent { grid-column: span 6; }
}
@media (max-width: 640px) {
  .fc-large, .fc-mid, .fc-wide, .fc-accent { grid-column: span 12; }
}

/* Search demo */
.fc-demo { margin-top: 1.5rem; }
.search-demo {
  background: rgba(0,0,0,0.3); border: 1px solid var(--border);
  border-radius: var(--radius-sm); padding: 10px 14px;
  font-size: 0.85rem; color: var(--text); margin-bottom: 10px;
  display: flex; align-items: center; gap: 4px;
}
.search-blink { animation: blink 1s step-end infinite; }
@keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
.search-results { display: flex; flex-direction: column; gap: 6px;
  .sr-item { background: rgba(255,255,255,0.04); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 8px 12px; font-size: 0.8rem; color: var(--text-muted); transition: background 0.2s; &:hover { background: rgba(59,130,246,0.08); color: var(--text); } }
}

/* Track bars */
.track-bar-wrap { display: flex; align-items: flex-end; gap: 6px; height: 80px; margin-top: 1.5rem; }
.track-bar {
  flex: 1; height: var(--h); border-radius: 4px 4px 0 0;
  background: var(--c); opacity: 0.7;
  animation: grow-bar 1.2s cubic-bezier(.16,1,.3,1) both;
  animation-delay: var(--delay, 0s);
}
@keyframes grow-bar { from { transform: scaleY(0); transform-origin: bottom; } to { transform: scaleY(1); } }

/* Lang tags */
.lang-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 1rem;
  span { background: rgba(255,255,255,0.07); border: 1px solid var(--border); border-radius: 6px; padding: 4px 10px; font-size: 0.75rem; color: var(--text-muted); }
}

/* =========================================
   SHOWCASE
   ========================================= */
.showcase {
  padding: 6rem 8vw;
  .showcase-sticky {
    display: flex; gap: 5rem; align-items: center;
    @media (max-width: 900px) { flex-direction: column; }
  }
}

.showcase-text-panel {
  flex: 0 0 44%;
  opacity: 0; transform: translateX(-30px);
  transition: opacity 0.9s ease, transform 0.9s ease;
  &.is-visible { opacity: 1; transform: none; }
}
.showcase-steps { display: flex; flex-direction: column; gap: 0; }
.ss-step {
  display: flex; gap: 1.25rem;
  padding: 1.5rem; border-radius: var(--radius);
  cursor: pointer; transition: background 0.3s;
  &.active { background: rgba(59,130,246,0.08); }
  .ss-num { font-family: var(--font-display); font-size: 2rem; font-weight: 800; color: var(--border); transition: color 0.3s; min-width: 2.5rem; }
  &.active .ss-num { color: var(--accent); }
  h3 { font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem; }
  p { font-size: 0.88rem; color: var(--text-muted); line-height: 1.7; }
}

.showcase-visual-panel { flex: 1; }
.sv-mockup {
  background: rgba(255,255,255,0.04); border: 1px solid var(--border);
  border-radius: 20px; overflow: hidden;
  box-shadow: 0 40px 80px rgba(0,0,0,0.5);
}
.sv-screen {
  padding: 2rem; min-height: 380px;
}
.panel-fade-enter-active, .panel-fade-leave-active { transition: opacity 0.35s ease, transform 0.35s ease; }
.panel-fade-enter { opacity: 0; transform: translateY(10px); }
.panel-fade-leave-to { opacity: 0; transform: translateY(-10px); }

/* Mockup screens */
.mock-upload { display: flex; flex-direction: column; gap: 1.25rem; }
.upload-zone {
  border: 2px dashed rgba(59,130,246,0.3); border-radius: var(--radius);
  padding: 2rem; text-align: center;
  .upload-icon { font-size: 2rem; margin-bottom: 0.5rem; }
  p { color: var(--text); font-weight: 600; font-size: 0.9rem; }
  span { font-size: 0.75rem; color: var(--text-muted); }
}
.upload-list { display: flex; flex-direction: column; gap: 8px; }
.ul-item { display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.04); border-radius: 8px; padding: 8px 12px;
  .ulf-icon { font-size: 1.1rem; }
  .ulf-name { flex: 1; font-size: 0.8rem; color: var(--text); }
  .ulf-bar { width: 70px; height: 4px; background: rgba(255,255,255,0.08); border-radius: 2px;
    span { display: block; height: 100%; background: var(--accent); border-radius: 2px; }
  }
}

.mock-browse {}
.mb-filter { display: flex; gap: 8px; margin-bottom: 1rem; flex-wrap: wrap;
  span { padding: 5px 14px; border-radius: 999px; font-size: 0.78rem; background: rgba(255,255,255,0.05); border: 1px solid var(--border); color: var(--text-muted); cursor: pointer;
    &.active { background: var(--accent); color: #fff; border-color: transparent; }
  }
}
.mb-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.mb-card { border-radius: var(--radius-sm); overflow: hidden; background: rgba(255,255,255,0.04); border: 1px solid var(--border);
  .mb-cover { height: 90px; display: flex; align-items: center; justify-content: center; font-size: 2.2rem; }
  .mb-info { padding: 10px 12px;
    strong { display: block; font-size: 0.82rem; color: #fff; margin-bottom: 2px; }
    span { font-size: 0.72rem; color: var(--text-muted); }
  }
}

.mock-community { display: flex; flex-direction: column; gap: 12px; }
.mc-thread { display: flex; align-items: flex-start; gap: 12px;
  .mc-avatar { width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; color: #fff; }
  .mc-msg { flex: 1; background: rgba(255,255,255,0.04); border-radius: 12px; padding: 10px 14px;
    strong { display: block; font-size: 0.8rem; color: #fff; margin-bottom: 4px; }
    p { font-size: 0.82rem; color: var(--text-muted); line-height: 1.5; }
  }
  .mc-like { font-size: 0.75rem; color: var(--text-muted); white-space: nowrap; margin-top: 10px; }
}

/* =========================================
   TESTIMONIALS
   ========================================= */
.testimonials {
  padding: 6rem 0;
  overflow: hidden;
  .section-header { padding: 0 8vw; margin-bottom: 3rem; }
}
.testi-track-wrap { overflow: hidden; }
.testi-track {
  display: flex; gap: 1.5rem;
  animation: testi-scroll 40s linear infinite;
  width: max-content; padding: 1rem 0;
}
@keyframes testi-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.testi-track:hover { animation-play-state: paused; }

.testi-card {
  width: 320px; flex-shrink: 0;
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 1.75rem;
  transition: border-color 0.3s;
  &:hover { border-color: rgba(59,130,246,0.3); }
  .testi-stars { color: #f59e0b; font-size: 0.8rem; margin-bottom: 0.75rem; }
  p { font-size: 0.88rem; color: var(--text-muted); line-height: 1.7; margin-bottom: 1.25rem; font-style: italic; }
  .testi-author { display: flex; align-items: center; gap: 10px;
    .testi-avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; color: #fff; flex-shrink: 0; }
    strong { display: block; font-size: 0.85rem; color: #fff; font-weight: 600; }
    span { font-size: 0.75rem; color: var(--text-muted); }
  }
}

/* =========================================
   CTA FINAL
   ========================================= */
.cta-final {
  position: relative; padding: 8rem 8vw;
  overflow: hidden;
  background: radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.12), transparent 70%);
  &::before { content: ''; position: absolute; inset: 0; border-top: 1px solid var(--border); }
}
.cta-bg-grid {
  position: absolute; inset: 0;
  background-image:
      linear-gradient(rgba(59,130,246,0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(59,130,246,0.05) 1px, transparent 1px);
  background-size: 50px 50px;
  pointer-events: none;
}
.cta-content {
  position: relative; z-index: 1;
  max-width: 600px; margin: 0 auto; text-align: center;
  opacity: 0; transform: translateY(40px);
  transition: opacity 0.9s ease, transform 0.9s ease;
  &.is-visible { opacity: 1; transform: none; }
  .overline { font-size: 0.78rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--accent); display: block; margin-bottom: 0.8rem; }
  h2 { font-family: var(--font-display); font-size: clamp(2.2rem, 4vw, 3.2rem); font-weight: 800; color: #fff; line-height: 1.15; margin-bottom: 1rem; }
  p { color: var(--text-muted); font-size: 1rem; margin-bottom: 2rem; }
}
.cta-input-row {
  display: flex; gap: 10px; justify-content: center;
  @media (max-width: 600px) { flex-direction: column; align-items: stretch; }
}
.cta-email-input {
  flex: 1; max-width: 280px; padding: 14px 18px;
  background: rgba(255,255,255,0.06); border: 1px solid var(--border);
  border-radius: 999px; color: var(--text); font-size: 0.9rem;
  outline: none; transition: border-color 0.2s;
  &::placeholder { color: var(--text-muted); }
  &:focus { border-color: var(--accent); }
}
.cta-note { display: block; font-size: 0.75rem; color: var(--text-muted); margin-top: 1rem; }
</style>