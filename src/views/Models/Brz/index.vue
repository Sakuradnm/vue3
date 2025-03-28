<script setup lang="ts">
import { ref, reactive } from 'vue'

interface BRZModel {
  name: string
  engine: string
  image: string
  price: number
  torque: string
  horsepower: string
  weight: number
  acceleration: string
}

interface CustomizationOption {
  title: string;
  description: string;
  image: string;
}

const brzModels = reactive<BRZModel[]>([
  {
    name: 'BRZ Premium',
    engine: 'FA24 2.4L水平对置',
    image: '',
    price: 328600,
    torque: '250 N·m @ 3700 rpm',
    horsepower: '231 HP @ 7000 rpm',
    weight: 1279,
    acceleration: '0-100km/h 6.3秒'
  },
  {
    name: 'BRZ tS',
    engine: 'FA24 2.4L水平对置',
    image: '',
    price: 368000,
    torque: '250 N·m @ 3700 rpm',
    horsepower: '231 HP @ 7000 rpm',
    weight: 1318,
    acceleration: '0-100km/h 6.1秒'
  },
])

const customizationOptions = reactive<CustomizationOption[]>([
  {
    title: '外观',
    description: '空气动力学套件与STI外观组件',
    image: ''
  },
  {
    title: '内饰',
    description: 'Recaro赛车座椅与Alcantara材质',
    image: ''
  },
  {
    title: '性能',
    description: 'STI性能套件与底盘强化',
    image: ''
  }
])

const selectedModel = ref<BRZModel | null>(null)
const appearanceSection = ref<HTMLElement | null>(null)

const scrollToModels = () => {
  appearanceSection.value?.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  })
}

// 保持与GTR相同的交互逻辑
const selectModel = (model: BRZModel) => {
  selectedModel.value = model
}

const closeModal = () => {
  selectedModel.value = null
  document.body.style.overflow = 'auto'
}

const openReserveModal = () => {
  alert('预订系统即将上线！')
}

const initiateReservation = () => {
  if (selectedModel.value) {
    alert(`预订 ${selectedModel.value.name}`)
  }
}
</script>

<template>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <div class="brz-page">
    <!-- 视频主页 -->
    <div class="brz-hero">
      <video autoplay loop muted playsinline class="hero-video">
        <source src="/videos/brz.mp4" type="video/mp4">
      </video>
      <div class="hero-overlay">
        <div class="hero-content">
          <h1>SUBARU BRZ</h1>
          <p class="hero-subtitle">纯粹驾趣 天生赛道</p>
          <div class="hero-actions">
            <button @click="scrollToModels" class="cta-button primary">探索车型</button>
            <button @click="openReserveModal" class="cta-button secondary">立即预订</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 设计亮点 -->
    <div class="design-overview">
      <div class="grid" style="background-color: rgb(255,255,255);"></div>
      <div class="design-title">
        <h1>Design Philosophy</h1>
        <p>设计 / 理念</p>
      </div>
      <div class="design-grid">
        <div class="grid-card">
          <div class="grid-image-wrapper">
            <img src="" alt="低重心设计">
          </div>
          <div class="grid-content-wrapper">
            <div class="grid-text-card" >
              <h3>超低重心布局</h3>
              <p>水平对置发动机+后轮驱动的经典布局，重心高度仅460mm，实现最佳重量分配比（前53:后47）</p>
            </div>
            <div class="grid-card-footer">
              <router-link to="#" style="color: white;">详细内容 ▶</router-link>
            </div>
          </div>
        </div>
        <div class="grid-card">
          <div class="grid-image-wrapper">
            <img src="" alt="空气动力学">
          </div>
          <div class="grid-content-wrapper">
            <div class="grid-text-card">
              <h3>空气动力学</h3>
              <p>前保险杠导流孔+侧裙导流设计+鸭尾式扰流板，实现0.27Cd风阻系数</p>
            </div>
            <div class="grid-card-footer">
              <router-link to="#" style="color: white;">详细内容 ▶</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 车型展示 -->
    <div class="brz-models" ref="appearanceSection">
      <div class="models-title">
        <h1>BRZ 车型系列</h1>
        <p>2 种配置选择</p>
      </div>
      <div class="models-container">
        <div
            v-for="(model, index) in brzModels"
            :key="index"
            class="model-card"
        >
          <div class="grid2" style="background-color: #002c5d;"></div>
          <img class="model-image" :src="model.image" :alt="model.name">
          <div class="model-info">
            <h1>{{ model.name }}</h1>
            <div class="price-container">
              <div class="price">¥{{ model.price.toLocaleString() }}</div>
              <div class="price-note">建议零售价*</div>
            </div>
            <div class="specs">
              <p>车重：{{ model.weight }}kg</p>
              <p>发动机：{{ model.engine }}</p>
              <p>马力：{{ model.horsepower }}</p>
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
    <div class="grid" style="background-color: #002c5d;"></div>

    <!-- 定制选项 -->
    <div class="customization">
      <h2>个性化您的 BRZ</h2>
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
.brz-page {
  color: rgba(255, 255, 255, 0.78);
  background-color: white;
}

/* 颜色主题调整 */
.cta-button.primary {
  background: #0078D4;
}

.grid-card-footer a:hover,
.build-link {
  background: #0078D4;
}

.price {
  color: #0078D4;
}

.models-title h1 {
  text-shadow: -2px 0 2px hsl(0, 0%, 100%),
  0 2px 2px hsla(212, 100%, 18%, 0.44),
  2px 0 10px hsl(212, 100%, 18%);
}

.design-title p::before {
  background: #0078D4;
  box-shadow: 0 0 2px hsl(0, 0%, 100%),
  0 2px 2px hsl(212, 100%, 18%),
  2px 7px 10px hsla(212, 100%, 41%, 0.4);
}

/* 背景渐变调整 */
.hero-overlay {
  background-image: linear-gradient(to top, #002c5d, transparent, #002c5d);
}

.customization {
  background-image: linear-gradient(to bottom, #002c5d, rgb(255, 255, 255));
}

/* 移动端优化 */
@media (max-width: 768px) {
  .model-image {
    height: 200px;
  }

  .hero-content h1 {
    font-size: 2.8rem;
  }

  .grid-text-card {
    height: auto;
    padding-bottom: 2rem;
  }
}

/* 其他样式继承自GTR原版CSS */
/* 保持原有结构，仅替换颜色相关值 */
</style>
