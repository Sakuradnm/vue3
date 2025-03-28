<script lang="ts">
import { defineComponent, ref, reactive } from 'vue'

interface SupraModel {
  name: string
  engine: string
  image: string
  price: number
  torque: string
  horsepower: string
  weight: number
}

interface CustomizationOption {
  title: string;
  description: string;
  image: string;
}

const supraModels = reactive<SupraModel[]>([
  {
    name: 'Supra 3.0L PRO',
    engine: 'B58 3.0L 直列六缸涡轮增压',
    image: '/models/supra/supra-pro.jpg',
    price: 628000,
    torque: '500 Nm @ 1600-4500 rpm',
    horsepower: '340 HP (255 kW)',
    weight: 1495
  },
  {
    name: 'Supra GR',
    engine: 'B58 3.0L 直列六缸涡轮增压',
    image: '/models/supra/supra-gr.jpg',
    price: 728000,
    torque: '500 Nm @ 1800-5000 rpm',
    horsepower: '382 HP (285 kW)',
    weight: 1511
  },
])

export default defineComponent({
  name: 'SupraPage',
  setup() {
    const selectedModel = ref<SupraModel | null>(null)
    const appearanceSection = ref<HTMLElement | null>(null)

    const customizationOptions = reactive<CustomizationOption[]>([
      {
        title: '运动外观',
        description: '可选GR空气动力学套件，包含前唇、侧裙和后扩散器',
        image: '/models/supra/exterior.jpg'
      },
      {
        title: '性能升级',
        description: 'Track模式悬挂调校、Brembo制动系统与运动排气',
        image: '/models/supra/performance.jpg'
      },
      {
        title: '内饰定制',
        description: 'Alcantara运动方向盘、碳纤维饰板与JBL音响系统',
        image: '/models/supra/interior.jpg'
      }
    ])

    // 保持原有方法逻辑...

    const scrollToModels = () => {
      if (appearanceSection.value) {
        appearanceSection.value.scrollIntoView({
          behavior: 'smooth',
          block: 'start' // 添加精确滚动定位
        })
      }
    }

    const selectModel = (model: GTRModel) => {
      selectedModel.value = model
    }

    const closeModal = () => {
      selectedModel.value = null
      document.body.style.overflow = 'auto' // 解除滚动锁定

    }

    const openReserveModal = () => {
      // 预订逻辑的占位符
      alert('Reservation system coming soon!')
    }

    const initiateReservation = () => {
      // 添加类型检查
      if (selectedModel.value) {
        alert(`Reserving ${selectedModel.value.name}`)
      }
    }

    return {
      supraModels,
      customizationOptions,
      selectedModel,
      appearanceSection,
      scrollToModels,
      selectModel,
      closeModal,
      openReserveModal,
      initiateReservation
    }
  }
})
</script>

<template>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <div class="supra-page">
    <!-- 视频主页 -->
    <div class="supra-hero">
      <video autoplay loop muted playsinline class="hero-video">
        <source src="/videos/supra.mp4" type="video/mp4">
      </video>
      <div class="hero-overlay">
        <div class="hero-content">
          <h1>TOYOTA GR SUPRA</h1>
          <p class="hero-subtitle">Born From The Track</p>
          <div class="hero-actions">
            <button @click="scrollToModels" class="cta-button primary">探索车型</button>
            <button @click="openReserveModal" class="cta-button secondary">立即预定</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 外观设计 -->
    <div class="appearance-overview">
      <div class="grid" style="background-color: #ff4200;"></div>
      <div class="appearance-title">
        <h1>赛道基因设计</h1>
        <p>空气动力学 / 轻量化</p>
      </div>
      <div class="appearance-grid">
        <div class="grid-card">
          <div class="grid-image-wrapper">
            <img src="#" alt="空气动力学">
          </div>
          <div class="grid-content-wrapper">
            <div class="grid-text-card">
              <h3>主动式空气动力学</h3>
              <p>车尾主动式扰流板可根据车速自动调整角度，在高速时提供额外下压力，配合底部扩散器实现最佳空气动力学效能。</p>
            </div>
            <div class="grid-card-footer">
              <router-link to="#" style="color: white;">详细内容 ▶</router-link>
            </div>
          </div>
        </div>
        <div class="grid-card">
          <div class="grid-image-wrapper">
            <img src="#" alt="轻量化">
          </div>
          <div class="grid-content-wrapper">
            <div class="grid-text-card">
              <h3>铝合金车身架构</h3>
              <p>采用铝合金发动机舱盖和车门结构，配合碳纤维车顶设计，实现1.5吨级的轻盈车身，保持完美50:50前后配重比。</p>
            </div>
            <div class="grid-card-footer">
              <router-link to="#" style="color: white;">详细内容 ▶</router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- 内饰部分 -->
      <div class="appearance-title">
        <p style="margin-top: 2rem">驾驶舱 / 人机工程</p>
      </div>
      <div class="appearance-block">
        <div class="block-card">
          <div class="block-content-wrapper">
            <div class="block-text-card">
              <h3>以驾驶者为中心的座舱</h3>
              <p>低矮坐姿配合HUD抬头显示器，所有操控界面向驾驶者倾斜7度，镁合金换挡拨片与12扬声器JBL音响系统带来沉浸式驾驶体验。</p>
              <p>运动座椅采用Alcantara与真皮混搭材质，提供激烈驾驶时的完美支撑，同时保持长途舒适性。</p>
            </div>
            <div class="block-card-footer">
              <router-link to="#" style="color: white;">详细内容 ▶</router-link>
            </div>
          </div>
          <div class="block-image-wrapper">
            <img src="#" alt="驾驶舱">
          </div>
        </div>
        <div class="grid1" style="background-color: #ff4200;"></div>
        <div class="block-card">
          <div class="block-image-wrapper">
            <img src="#" alt="科技配置">
          </div>
          <div class="block-content-wrapper">
            <div class="block-text-card">
              <h3>赛道化数字仪表</h3>
              <p>12.3寸全液晶仪表提供三种显示模式：
                <br>1. 标准模式：显示基础行车信息
                <br>2. 运动模式：突出转速和G值显示
                <br>3. 赛道模式：专业级圈速计时与动力分配状态
              </p>
              <p>搭配8.8寸中控触屏，集成GR专属车辆状态监控系统</p>
            </div>
            <div class="block-card-footer">
              <router-link to="#" style="color: white;">详细内容 ▶</router-link>
            </div>
          </div>
        </div>
      </div>
      <div class="grid" style="background-color: #ff4200;"></div>
    </div>

    <!-- 车型展示 -->
    <div class="supra-models" ref="appearanceSection">
      <div class="models-title">
        <h1>选择你的SUPRA</h1>
        <p>两种性能版本</p>
      </div>
      <div class="models-container">
        <div
            class="model-card"
            v-for="(model, index) in supraModels"
            :key="index"
        >
          <div class="grid2" style="background-color: #1a1a1a;"></div>
          <img class="model-image" :src="model.image" :alt="model.name">
          <div class="model-info">
            <h1>{{ model.name }}</h1>
            <div class="price-container">
              <div class="price">¥{{ model.price.toLocaleString() }}</div>
              <div class="price-note">厂商指导价</div>
            </div>
            <div class="specs">
              <p>整备质量：{{ model.weight }}kg</p>
              <p>发动机：{{ model.engine }}</p>
              <p>最大马力：{{ model.horsepower }}</p>
              <p>峰值扭矩：{{ model.torque }}</p>
            </div>
          </div>
          <div class="action-buttons">
            <router-link to="#" class="detail-link">配置详情<span class="arrow">▶</span></router-link>
            <router-link to="#" class="build-link">个性定制<span class="arrow">▶</span></router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- 定制选项 -->
    <div class="customization">
      <h2>GR专属定制</h2>
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
.supra-page {
  background: #1a1a1a;
}

.cta-button.primary {
  background: rgba(255, 66, 0, 0.9);
}
.cta-button.secondary {
  border-color: #ff4200;
  color: #ff4200;
}
.cta-button:hover {
  background: rgba(255, 66, 0, 0.7);
}

.hero-overlay {
  background-image: linear-gradient(to top, #1a1a1a, transparent, #1a1a1a);
}

.models-container {
  background: linear-gradient(to right, #2a2a2a, #3a3a3a);
}

.price {
  color: #ff4200;
}

.models-title h1 {
  text-shadow: 0 0 15px rgba(255, 66, 0, 0.6);
}

.model-card {
  background: #2a2a2a;
  border: 1px solid rgba(255, 66, 0, 0.3);
}

.model-info h1 {
  color: #ff4200;
}

/* 保持原有响应式设计... */
</style>
