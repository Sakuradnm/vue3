<script setup lang="ts">
import { ref, reactive } from 'vue'

interface DodgeModel {
  name: string
  shortDescription: string
  fullDescription: string
  image: string
  price: number
  horsepower: number
  acceleration: string
  topSpeed: number
  torque: number
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
    shortDescription: '美式肌肉传奇',
    fullDescription: '搭载6.2L HEMI V8机械增压发动机，带来极致的美式肌肉车体验。',
    image: '/models/Dodge/hellcat.jpg',
    price: 698000,
    horsepower: 717,
    acceleration: '0-60 mph in 3.6 seconds',
    topSpeed: 199,
    torque: 650
  },
  {
    name: 'Charger SRT Hellcat',
    shortDescription: '四门性能猛兽',
    fullDescription: '四门轿车的极致性能代表，完美平衡实用性与运动性能。',
    image: '/models/Dodge/charger-hellcat.jpg',
    price: 728000,
    horsepower: 717,
    acceleration: '0-60 mph in 3.7 seconds',
    topSpeed: 199,
    torque: 650
  },
  {
    name: 'Durango SRT Hellcat',
    shortDescription: 'SUV性能之王',
    fullDescription: '全球最强大的量产SUV之一，完美诠释美式肌肉SUV的极致性能。',
    image: '/models/Dodge/durango-hellcat.jpg',
    price: 828000,
    horsepower: 710,
    acceleration: '0-60 mph in 3.5 seconds',
    topSpeed: 180,
    torque: 645
  }
])

const customizationOptions = reactive<CustomizationOption[]>([
  {
    title: '外观套件',
    description: '宽体套件、碳纤维扰流板',
    image: '/models/Dodge/exterior.jpg'
  },
  {
    title: '内饰定制',
    description: 'Alcantara材质和碳纤维装饰',
    image: '/models/Dodge/interior.jpg'
  },
  {
    title: '性能升级',
    description: '赛道套件和制动系统',
    image: '/models/Dodge/performance.jpg'
  }
])

const scrollToModels = () => {
  performanceSection.value?.scrollIntoView({ behavior: 'smooth' })
}

const selectModel = (model: DodgeModel) => {
  selectedModel.value = model
}

const closeModal = () => {
  selectedModel.value = null
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
  <div class="dodge-page">
    <!-- 视频主页 -->
    <section class="dodge-hero">
      <video autoplay loop muted playsinline class="hero-video">
        <source src="/videos/dodge.mp4" type="video/mp4">
      </video>
      <div class="hero-overlay">
        <div class="hero-content">
          <h1>SRT® HELLCAT</h1>
          <p class="hero-subtitle">美式肌肉传奇</p>
          <div class="hero-actions">
            <button @click="scrollToModels" class="cta-button primary">探索车型</button>
            <button @click="openReserveModal" class="cta-button secondary">立即预约</button>
          </div>
        </div>
      </div>
    </section>

    <!-- 性能展示 -->
    <section class="performance-overview" ref="performanceSection">
      <div class="performance-grid">
        <div class="performance-card">
          <div class="performance-icon">
            <i class="icon-speedometer"></i>
          </div>
          <h3>加速性能</h3>
          <p>0-60 mph 3.6秒</p>
        </div>
        <div class="performance-card">
          <div class="performance-icon">
            <i class="icon-engine"></i>
          </div>
          <h3>动力输出</h3>
          <p>717 HP V8</p>
        </div>
        <div class="performance-card">
          <div class="performance-icon">
            <i class="icon-torque"></i>
          </div>
          <h3>扭矩</h3>
          <p>650 lb-ft</p>
        </div>
        <div class="performance-card">
          <div class="performance-icon">
            <i class="icon-speed"></i>
          </div>
          <h3>最高时速</h3>
          <p>199 mph</p>
        </div>
      </div>
    </section>

    <!-- 车型展示 -->
    <section class="dodge-models">
      <h2>DODGE 车型系列</h2>
      <div class="models-container">
        <div
          v-for="(model, index) in dodgeModels"
          :key="index"
          class="model-card"
          @click="selectModel(model)"
        >
          <img :src="model.image" :alt="model.name">
          <div class="model-info">
            <h3>{{ model.name }}</h3>
            <p>{{ model.shortDescription }}</p>
            <span class="model-price">起价 ¥{{ model.price.toLocaleString() }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Technical Specifications -->
    <section class="technical-specs">
      <div class="specs-content">
        <div class="specs-text">
          <h2>工程精粹</h2>
          <p>DODGE完美诠释了美式肌肉车的精髓。每一款车型都搭载强大的HEMI发动机，带来无与伦比的驾驶体验。</p>
        </div>
        <div class="specs-details">
          <div class="spec-group">
            <h3>动力系统</h3>
            <ul>
              <li>6.2L HEMI V8机械增压</li>
              <li>高流量进气系统</li>
              <li>8速自动变速箱</li>
            </ul>
          </div>
          <div class="spec-group">
            <h3>底盘系统</h3>
            <ul>
              <li>自适应悬挂系统</li>
              <li>高性能制动系统</li>
              <li>运动调校转向</li>
            </ul>
          </div>
          <div class="spec-group">
            <h3>驾驶模式</h3>
            <ul>
              <li>赛道模式</li>
              <li>运动模式</li>
              <li>舒适模式</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Customization Options -->
    <section class="customization">
      <h2>个性化定制</h2>
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
    </section>

    <!-- Modal for Model Details -->
    <div v-if="selectedModel" class="modal model-modal">
      <div class="modal-content">
        <span @click="closeModal" class="close-btn">&times;</span>
        <h2>{{ selectedModel.name }}</h2>
        <img :src="selectedModel.image" :alt="selectedModel.name">
        <div class="model-details">
          <p>{{ selectedModel.fullDescription }}</p>
          <div class="model-specs">
            <div class="spec">
              <strong>价格:</strong> ¥{{ selectedModel.price.toLocaleString() }}
            </div>
            <div class="spec">
              <strong>马力:</strong> {{ selectedModel.horsepower }} HP
            </div>
            <div class="spec">
              <strong>扭矩:</strong> {{ selectedModel.torque }} lb-ft
            </div>
            <div class="spec">
              <strong>加速:</strong> {{ selectedModel.acceleration }}
            </div>
            <div class="spec">
              <strong>最高时速:</strong> {{ selectedModel.topSpeed }} mph
            </div>
          </div>
          <button @click="initiateReservation" class="reserve-btn">预约此车型</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dodge-page {
  color: #333;
}

.dodge-hero {
  height: 100vh;
  position: relative;
  overflow: hidden;
}

.hero-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
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

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.cta-button {
  padding: 1rem 2rem;
  border-radius: 30px;
  font-size: 1.1rem;
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
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.performance-overview {
  padding: 4rem 0;
  background: #f5f5f5;
}

.performance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.performance-card {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.performance-card:hover {
  transform: translateY(-5px);
}

.performance-icon {
  font-size: 2.5rem;
  color: #c41e3a;
  margin-bottom: 1rem;
}

.performance-card h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.dodge-models {
  padding: 4rem 0;
}

.dodge-models h2 {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
}

.models-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.model-card {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.3s ease;
}

.model-card:hover {
  transform: translateY(-5px);
}

.model-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.model-info {
  padding: 1.5rem;
}

.model-info h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.model-price {
  display: block;
  font-size: 1.2rem;
  color: #c41e3a;
  margin-top: 1rem;
}

.technical-specs {
  padding: 4rem 0;
  background: #f5f5f5;
}

.specs-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.specs-text {
  text-align: center;
  margin-bottom: 3rem;
}

.specs-text h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.specs-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.spec-group {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.spec-group h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #c41e3a;
}

.spec-group ul {
  list-style: none;
  padding: 0;
}

.spec-group li {
  margin-bottom: 0.5rem;
  padding-left: 1.5rem;
  position: relative;
}

.spec-group li:before {
  content: "•";
  color: #c41e3a;
  position: absolute;
  left: 0;
}

.customization {
  padding: 4rem 0;
}

.customization h2 {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
}

.customization-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.custom-option {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
}

.custom-option img {
  width: 100%;
  height: 250px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.custom-option:hover img {
  transform: scale(1.1);
}

.option-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  color: white;
}

.option-overlay h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 2rem;
  cursor: pointer;
  color: #666;
}

.modal-content img {
  width: 100%;
  height: auto;
  border-radius: 5px;
  margin: 1rem 0;
}

.model-details {
  margin-top: 2rem;
}

.model-specs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
}

.reserve-btn {
  background: #c41e3a;
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 30px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.reserve-btn:hover {
  background: #a01830;
  transform: translateY(-3px);
}

@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.5rem;
  }

  .hero-actions {
    flex-direction: column;
  }

  .cta-button {
    width: 100%;
  }

  .performance-grid,
  .models-container,
  .customization-grid {
    grid-template-columns: 1fr;
  }
}
</style>
