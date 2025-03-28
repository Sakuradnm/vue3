<script setup lang="ts">
import { ref, reactive } from 'vue'

interface DodgeModel {
  name: string
  engine: string
  image: string
  price: number
  horsepower: number
  torque: number
  acceleration: string
  topSpeed: number
}

interface CustomizationOption {
  title: string
  description: string
  image: string
}

const selectedModel = ref<DodgeModel | null>(null)
const performanceSection = ref<HTMLElement | null>(null)

const dodgeModels = reactive<DodgeModel[]>([
  {
    name: 'Challenger SRT Hellcat',
    engine: '6.2L HEMI V8',
    image: '/models/Dodge/hellcat.jpg',
    price: 698000,
    horsepower: 717,
    torque: 650,
    acceleration: '0-60 mph 3.6秒',
    topSpeed: 199
  },
  {
    name: 'Charger SRT Hellcat',
    engine: '6.2L HEMI V8',
    image: '/models/Dodge/charger-hellcat.jpg',
    price: 728000,
    horsepower: 717,
    torque: 650,
    acceleration: '0-60 mph 3.7秒',
    topSpeed: 199
  },
  {
    name: 'Durango SRT Hellcat',
    engine: '6.2L HEMI V8',
    image: '/models/Dodge/durango-hellcat.jpg',
    price: 828000,
    horsepower: 710,
    torque: 645,
    acceleration: '0-60 mph 3.5秒',
    topSpeed: 180
  }
])

const customizationOptions = reactive<CustomizationOption[]>([
  {
    title: '外观套件',
    description: '宽体套件与碳纤维空气动力学组件',
    image: '/models/Dodge/exterior.jpg'
  },
  {
    title: '性能升级',
    description: '赛道套件及高性能制动系统',
    image: '/models/Dodge/performance.jpg'
  },
  {
    title: '内饰定制',
    description: 'Alcantara材质与碳纤维装饰',
    image: '/models/Dodge/interior.jpg'
  }
])

const scrollToModels = () => {
  performanceSection.value?.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  })
}

const selectModel = (model: DodgeModel) => {
  selectedModel.value = model
}

const closeModal = () => {
  selectedModel.value = null
  document.body.style.overflow = 'auto'
}

const openReserveModal = () => {
  alert('预约系统即将上线！')
}

const initiateReservation = () => {
  if (selectedModel.value) {
    alert(`预约 ${selectedModel.value.name}`)
  }
}
</script>

<template>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <div class="dodge-page">
    <!-- 视频主页 -->
    <div class="dodge-hero">
      <video autoplay loop muted playsinline class="hero-video">
        <source src="/videos/dodge.mp4" type="video/mp4">
      </video>
      <div class="hero-overlay">
        <div class="hero-content">
          <h1>DODGE SRT® HELLCAT</h1>
          <p class="hero-subtitle">The American Muscle Legend</p>
          <div class="hero-actions">
            <button @click="scrollToModels" class="cta-button primary">探索车型</button>
            <button @click="openReserveModal" class="cta-button secondary">立即预约</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 性能展示 -->
    <div class="performance-overview">
      <div class="grid" style="background-color: #c41e3a;"></div>
      <div class="performance-title">
        <h1>Performance Specs</h1>
        <p>性能 / 参数</p>
      </div>
      <div class="performance-grid">
        <div class="grid-card">
          <div class="grid-image-wrapper">
            <img src="" alt="HEMI Engine">
          </div>
          <div class="grid-content-wrapper">
            <div class="grid-text-card">
              <h3>6.2L HEMI V8</h3>
              <p>机械增压发动机带来717匹马力<br>650 lb-ft扭矩的狂暴输出</p>
            </div>
            <div class="grid-card-footer">
              <router-link to="#" style="color: white;">技术详情 ▶</router-link>
            </div>
          </div>
        </div>
        <div class="grid-card">
          <div class="grid-image-wrapper">
            <img src="" alt="Transmission">
          </div>
          <div class="grid-content-wrapper">
            <div class="grid-text-card">
              <h3>8速自动变速箱</h3>
              <p>经过赛道调校的快速换挡变速箱<br>提供毫秒级换挡响应</p>
            </div>
            <div class="grid-card-footer">
              <router-link to="#" style="color: white;">技术详情 ▶</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 车型展示 -->
    <div class="dodge-models" ref="performanceSection">
      <div class="models-title">
        <h1>Discover Your HELLCAT</h1>
        <p>3 款极致性能车型</p>
      </div>
      <div class="models-container">
        <div
            v-for="(model, index) in dodgeModels"
            :key="index"
            class="model-card"
        >
          <div class="grid2" style="background-color: #2d2d2d;"></div>
          <img class="model-image" :src="model.image" :alt="model.name">
          <div class="model-info">
            <h1>{{ model.name }}</h1>
            <div class="price-container">
              <div class="price">¥{{ model.price.toLocaleString() }}</div>
              <div class="price-note">建议零售价*</div>
            </div>
            <div class="specs">
              <p>发动机：{{ model.engine }}</p>
              <p>马力：{{ model.horsepower }}HP</p>
              <p>扭矩：{{ model.torque }} lb-ft</p>
              <p>加速：{{ model.acceleration }}</p>
            </div>
          </div>
          <div class="action-buttons">
            <router-link to="#" class="detail-link">查看更多<span class="arrow">▶</span></router-link>
            <router-link to="#" class="build-link">立即定制<span class="arrow">▶</span></router-link>
          </div>
        </div>
      </div>
    </div>
    <div class="grid" style="background-color: #2d2d2d;"></div>

    <!-- 客户定制 -->
    <div class="customization">
      <h2>Personalize Your HELLCAT</h2>
      <div class="customization-grid">
        <div
            v-for="(option, index) in customizationOptions"
            :key="index"
            class="custom-option"
        >
          <img :src="option.image" :alt="option.title">
          <div class="option-overlay">
            <h3>{{ option.title }}</h3>
            <p>{{ option.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 基础样式 */
.dodge-page {
  color: rgba(255, 255, 255, 0.78);
  background-color: #1a1a1a;
}

.grid {
  margin: 0 auto 1rem;
  width: 80%;
  height: 1px;
  border-radius: 2px;
}

/************************************************************
 * 视频主页
 ************************************************************/
.dodge-hero {
  height: 100vh;
}

.hero-video {
  object-fit: cover;
  width: 100%;
  height: 100%;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: linear-gradient(to top, #2d2d2d, transparent, #2d2d2d);
}

.hero-content {
  text-align: center;
  color: white;
  z-index: 1;
}

.hero-content h1 {
  font-size: 4rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.hero-subtitle {
  font-size: 2rem;
  margin-bottom: 2rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

/* 主页选项 */
.hero-actions {
  position: relative;
  display: flex;
  gap: 2rem;
  justify-content: center;
}

.cta-button {
  padding: 1rem 2rem;
  border-radius: 30px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.cta-button.primary {
  background: #c41e3a;
  color: white;
}

.cta-button.secondary {
  background: transparent;
  color: white;
  border: 2px solid white;
}

.cta-button:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

/************************************************************
 * 性能展示
 ************************************************************/
.performance-overview {
  padding: 3rem;
  background-color: #2d2d2d;
}

.performance-title {
  color: white;
  display: block;
  text-align: center;
  position: relative;
  margin: 1rem;
}

.performance-title h1 {
  width: 100%;
  position: relative;
  text-shadow: -2px 0 2px hsl(0, 0%, 100%),0 2px 2px hsla(0, 0%, 0%, 0.44), 2px 0 10px hsl(0, 0%, 0%);
  font-size: 3rem;
}

.performance-title p {
  margin: 0 auto;
  width: 100%;
  position: relative;
  display: inline-block;
  font-size: 2rem;
}

.performance-title p::before {
  content: '';
  position: absolute;
  top: 0;
  transform: translateY(-50%);
  width: 4rem;
  height: 4px;
  background: #c41e3a;
  box-shadow: 0 0 2px hsl(0, 0%, 100%),
  0 2px 2px hsl(0, 0%, 0%),
  2px 7px 10px hsla(358, 100%, 50%, 0.4);
  border-radius: 2px;
}

/* 其他样式保持与GTR一致，仅修改颜色相关值 */
.models-title h1 {
  color: #c41e3a;
}

.price {
  color: #c41e3a;
}

.build-link {
  background: #c41e3a;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .model-image {
    height: 180px;
    max-width: none;
    width: 100vw;
    margin-left: -1rem;
    margin-right: -1rem;
  }

  .models-container {
    padding: 0;
  }

  .model-card {
    padding: 1rem;
  }

  .hero-content h1 {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.5rem;
  }
}
</style>
