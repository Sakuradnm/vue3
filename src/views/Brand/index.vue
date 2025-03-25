<template>
  <div class="brand-page">
    <!-- 添加视差背景 -->
    <div class="parallax-hero">
      <div class="hero-content">
      </div>
    </div>

    <!-- 品牌历史时间轴 -->
    <section class="history reveal-section">
      <div class="section-container">
        <h2 class="reveal-item">品牌历程</h2>
        <div class="timeline">
          <div class="timeline-item reveal-item"
               v-for="(milestone, index) in milestones"
               :key="milestone.year"
               :style="{ transitionDelay: index * 0.2 + 's' }">
            <div class="timeline-content">
              <div class="year">{{ milestone.year }}</div>
              <div class="content">
                <h3>{{ milestone.title }}</h3>
                <p>{{ milestone.description }}</p>
                <div class="image-wrapper reveal-item" @mouseover="zoomImage" @mouseleave="unzoomImage">
                  <img v-if="milestone.image" :src="milestone.image" :alt="milestone.title">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 工厂参观 -->
    <section class="factory-tour reveal-section">
      <div class="section-container">
        <h2 class="reveal-item">智能工厂</h2>
        <div class="factory-content">
          <div class="factory-video reveal-item">
            <video controls poster="/brand/ultra.png">
              <source src="/videos/home2.mp4" type="video/mp4">
            </video>
          </div>
          <div class="factory-info reveal-item">
            <h3>世界级智能制造基地</h3>
            <p>采用业界领先的智能制造技术，打造高品质汽车产品。</p>
            <ul class="factory-features">
              <li class="reveal-item" v-for="(feature, index) in factoryFeatures"
                  :key="index"
                  :style="{ transitionDelay: index * 0.1 + 's' }">
                <i :class="feature.icon"></i>
                <span>{{ feature.text }}</span>
              </li>
            </ul>
            <button class="tour-btn reveal-item" @click="startVirtualTour">
              开启虚拟工厂之旅
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 可持续发展 -->
    <section class="sustainability reveal-section">
      <div class="section-container">
        <h2 class="reveal-item">可持续发展</h2>
        <div class="sustainability-grid">
          <div class="sustainability-card reveal-item"
               v-for="(card, index) in sustainabilityCards"
               :key="card.title"
               :style="{ transitionDelay: index * 0.15 + 's' }">
            <div class="card-icon">
              <i :class="card.icon"></i>
            </div>
            <h3>{{ card.title }}</h3>
            <p>{{ card.description }}</p>
            <div class="progress-bar">
              <div class="progress" :style="{ width: card.progress + '%' }"></div>
              <span>{{ card.progress }}% 完成</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 虚拟工厂参观弹窗 -->
    <transition name="modal">
      <div class="virtual-tour-modal" v-if="showVirtualTour" @click.self="closeVirtualTour">
        <div class="modal-content">
          <button class="close-btn" @click="closeVirtualTour">
            <i class="fas fa-times"></i>
          </button>
          <div class="tour-container">
            <div class="tour-placeholder">
              VR工厂展示
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'Brand',
  data () {
    return {
      showVirtualTour: false,
      milestones: [
        {
          year: '2010',
          title: '品牌创立',
          description: '以"科技创新，引领未来"为愿景，开启智能汽车新纪元',
          image: '/brand/milestone-2010.jpg'
        },
        {
          year: '2015',
          title: '首款车型发布',
          description: '首款纯电动SUV问世，开创行业新标准',
          image: '/brand/milestone-2015.jpg'
        },
        {
          year: '2018',
          title: '智能工厂投产',
          description: '世界级智能制造基地正式投产，年产能10万台',
          image: '/brand/milestone-2018.jpg'
        },
        {
          year: '2020',
          title: '全球化布局',
          description: '产品远销海外，建立全球研发中心网络',
          image: '/brand/milestone-2020.jpg'
        }
      ],
      sustainabilityCards: [
        {
          title: '环保生产',
          description: '100%使用可再生能源，打造零碳排放工厂',
          progress: 75,
          icon: 'fas fa-leaf'
        },
        {
          title: '材料回收',
          description: '95%的材料可回收再利用，践行循环经济',
          progress: 95,
          icon: 'fas fa-recycle'
        },
        {
          title: '碳中和',
          description: '2030年实现全产业链碳中和目标',
          progress: 40,
          icon: 'fas fa-tree'
        }
      ],
      factoryFeatures: [
        { icon: 'fas fa-robot', text: '智能机器人' },
        { icon: 'fas fa-microchip', text: 'AI质检系统' },
        { icon: 'fas fa-industry', text: '绿色生产' }
      ]
    }
  },
  mounted () {
    this.initScrollReveal()
    window.addEventListener('scroll', this.handleScroll)
  },
  beforeDestroy () {
    window.removeEventListener('scroll', this.handleScroll)
  },
  methods: {
    startVirtualTour () {
      this.showVirtualTour = true
      document.body.style.overflow = 'hidden'
    },
    closeVirtualTour () {
      this.showVirtualTour = false
      document.body.style.overflow = 'auto'
    },
    handleScroll () {
      this.revealOnScroll()
    },
    initScrollReveal () {
      this.$nextTick(() => {
        this.revealOnScroll()
      })
    },
    revealOnScroll () {
      const reveals = document.querySelectorAll('.reveal-section, .reveal-item')
      reveals.forEach(element => {
        const elementTop = element.getBoundingClientRect().top
        const elementBottom = element.getBoundingClientRect().bottom
        const windowHeight = window.innerHeight
        const revealPoint = 150

        if (elementTop < windowHeight - revealPoint && elementBottom > 0) {
          element.classList.add('active')
        }
      })
    },
    zoomImage(event) {
      const img = event.currentTarget.querySelector('img')
      if (img) {
        img.style.transform = 'scale(1.1)'
      }
    },
    unzoomImage(event) {
      const img = event.currentTarget.querySelector('img')
      if (img) {
        img.style.transform = 'scale(1)'
      }
    }
  }
}
</script>

<style scoped>
.brand-page {
  background-image: linear-gradient(to bottom, rgba(1, 10, 14, 0.7), transparent);
  padding-top: 72px;
}

/* 视差背景样式 */
.parallax-hero {
  height: 100vh;
  background-image: url('/brand/parallax-layer3.webp');
  background-attachment: fixed;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.parallax-hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
}

.hero-content {
  height: 100vh;
  background-image: url('/brand/parallax-layer2.webp');
  background-attachment: fixed;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  position: relative;
  z-index: 1;
}


/************************************************************
 * 品牌历程样式
 ************************************************************/
.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}
section {
  margin-bottom: 6rem;
}
h2 {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
}

/* 时间轴样式 */
.timeline {
  position: relative;
  padding: 2rem 0;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #007bff;
  transform: translateX(-50%);
}

.timeline-item {
  margin-bottom: 4rem;
  position: relative;
}

.timeline-item:nth-child(odd) .timeline-content {
  margin-left: 50%;
  padding-left: 3rem;
}

.timeline-item:nth-child(even) .timeline-content {
  margin-right: 50%;
  padding-right: 3rem;
  text-align: right;
}

.timeline-content {
  position: relative;
}

.timeline-content::before {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  background: #007bff;
  border-radius: 50%;
  top: 0;
}

.timeline-item:nth-child(odd) .timeline-content::before {
  left: -10px;
}

.timeline-item:nth-child(even) .timeline-content::before {
  right: -10px;
}

.year {
  font-size: 2rem;
  font-weight: 700;
  color: #007bff;
  margin-bottom: 1rem;
}

.timeline-content img {
  max-width: 100%;
  border-radius: 8px;
  margin-top: 1rem;
}

/************************************************************
 * 工厂参观样式
 ************************************************************/
.factory-content {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 3rem;
  align-items: center;
}
.factory-video {
  position: relative;
  padding-top: 56.25%;
}
.factory-video video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}
.factory-features {
  list-style: none;
  padding: 0;
  margin: 2rem 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}
.factory-features li {
  text-align: center;
}
.factory-features i {
  font-size: 2rem;
  color: #007bff;
  margin-bottom: 0.5rem;
}
.tour-btn {
  padding: 1rem 2rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.tour-btn:hover {
  background: #0056b3;
}

/************************************************************
 * 可持续发展样式
 ************************************************************/
.sustainability-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}
.sustainability-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}
.card-icon {
  font-size: 3rem;
  color: #007bff;
  margin-bottom: 1rem;
}
.progress-bar {
  background: #f8f9fa;
  border-radius: 10px;
  height: 10px;
  margin-top: 1.5rem;
  position: relative;
}
.progress {
  background: #007bff;
  height: 100%;
  border-radius: 10px;
  transition: width 1s ease;
}
.progress-bar span {
  position: absolute;
  right: 0;
  top: -25px;
  font-size: 0.9rem;
  color: #666;
}

/************************************************************
 * 虚拟工厂参观弹窗样式
 ************************************************************/
.virtual-tour-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  width: 90%;
  max-width: 1200px;
  height: 80vh;
  border-radius: 8px;
  position: relative;
}
.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: #333;
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 1;
}
.tour-container {
  width: 100%;
  height: 100%;
}
.tour-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  font-size: 1.5rem;
  color: #666;
}





/* 滚动显示基础样式 */
.reveal-section,
.reveal-item {
  opacity: 0;
  transform: translateY(50px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, opacity;
}

.reveal-section.active,
.reveal-item.active {
  opacity: 1;
  transform: translateY(0);
}

/* 图片容器动画 */
.image-wrapper {
  overflow: hidden;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.image-wrapper.active {
  opacity: 1;
  transform: translateY(0);
}

.image-wrapper img {
  transform: scale(1.1);
  transition: transform 1.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.image-wrapper.active img {
  transform: scale(1);
}

/* 时间轴项目动画优化 */
.timeline-item {
  opacity: 0;
  transform: translateX(-50px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.timeline-item:nth-child(even) {
  transform: translateX(50px);
}

.timeline-item.active {
  opacity: 1;
  transform: translateX(0);
}

/* 工厂特性动画 */
.factory-features li {
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.factory-features li.active {
  opacity: 1;
  transform: translateY(0);
}

/* 可持续发展卡片动画 */
.sustainability-card {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.sustainability-card.active {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* 进度条动画优化 */
.progress {
  width: 0 !important;
  transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.sustainability-card.active .progress {
  width: inherit !important;
}

/* 视差滚动效果 */
.section-container {
  position: relative;
  z-index: 1;
}

.section-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: inherit;
  transform: translateZ(-1px) scale(1.1);
  z-index: -1;
}

/* 性能优化 */
@media (prefers-reduced-motion: reduce) {
  .reveal-section,
  .reveal-item,
  .timeline-item,
  .image-wrapper,
  .factory-features li,
  .sustainability-card,
  .progress {
    transition: none !important;
    animation: none !important;
  }
}


/* 增强时间轴样式 */
.timeline-content {
  background: rgba(255, 255, 255, 0.95);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 123, 255, 0.1);
  transition: transform 0.3s ease;
}

.timeline-content:hover {
  transform: translateY(-5px);
}

.image-wrapper {
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.image-wrapper img {
  transition: transform 0.5s ease;
}

.image-wrapper:hover img {
  transform: scale(1.1);
}


/* 响应式优化 */
@media (max-width: 768px) {
  .parallax-hero {
    height: 60vh;
  }
  .hero-content h1 {
    font-size: 2.5rem;
  }
  .hero-content p {
    font-size: 1.2rem;
  }
  .timeline::before {
    left: 0;
  }
  .timeline-item:nth-child(odd) .timeline-content,
  .timeline-item:nth-child(even) .timeline-content {
    margin: 0;
    padding-left: 2rem;
    text-align: left;
  }
  .timeline-item:nth-child(odd) .timeline-content::before,
  .timeline-item:nth-child(even) .timeline-content::before {
    left: -10px;
    right: auto;
  }
  .factory-content {
    grid-template-columns: 1fr;
  }
  .sustainability-grid {
    grid-template-columns: 1fr;
  }
}
</style>
