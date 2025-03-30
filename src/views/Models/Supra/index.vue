<script lang="ts">
import { defineComponent, ref, reactive } from 'vue'

// Define interfaces for type safety
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

const contentList = reactive([
  {
    title: 'Specifications',
    text: `*规格和设备如有变更，恕不另行通知。
                *3D 图像由计算机生成。实际颜色可能有所不同。
                *特殊油漆颜色或保护膜可能会影响车辆定价。
                *一些照片是合成图像。
                *制造商和经销商选项仅供参考。
                *价格为估算价格，不构成销售报价。
                *价格为制造商建议的零售价，截至 2024 年 3 月，东京地区。
                *不包括税费、保险费、销售费和附加选项。`
  },
  {
    title: 'Heritage',
    text: `GR Supra 延续了丰田标志性跑车的传奇血统。
                它是与宝马合作开发的，代表了
                日本和德国汽车工程的巅峰。GR Supra 将尖端技术
                与纯粹的驾驶体验相结合，是性能
                和精度的证明。`
  },
  {
    title: 'Track Package',
    text: `2024赛季，TOYOTA GAZOO Racing（TGR）将连续第六个赛季夺得制造商冠军。
    2025 年，该车队将继续使用两辆 GR010 HYBRID 赛车参赛，该赛车配备了在 WEC 比赛中不断发展的赛车混合动力系统。
    车手阵容将继续由拥有WEC胜利、世界锦标赛等丰富经验的天才车手组成，并将继续为“以赛车运动为起点制造更好的汽车”和“追求赛车运动的吸引力和可持续的赛车活动”做出贡献。`
  }
])

const supraModels = reactive<SupraModel[]>([
  {
    name: 'GR Supra 2.0',
    engine: '2.0L B48 Inline-4 Turbo',
    image: '/models/Supra/Supra-2.0.jpg',
    price: 54900,
    torque: '295 lb-ft (400 Nm) at 1,550-4,400 rpm',
    horsepower: '255 HP (190 kW) at 5,000-6,500 rpm',
    weight: 1541
  },
  {
    name: 'GR Supra 3.0',
    engine: '3.0L B58 Inline-6 Turbo',
    image: '/models/Supra/Supra-3.0.jpg',
    price: 72460,
    torque: '365 lb-ft (495 Nm) at 1,700-4,500 rpm',
    horsepower: '382 HP (285 kW) at 5,800-6,500 rpm',
    weight: 1611
  },
])

export default defineComponent({
  name: 'SupraPage',
  setup() {
    const selectedModel = ref<SupraModel | null>(null)
    const appearanceSection = ref<HTMLElement | null>(null)

    const customizationOptions = reactive<CustomizationOption[]>([
      {
        title: 'Exterior',
        description: '雕刻的空气动力学设计，具有精确的线条和运动姿态。',
        image: '/models/Supra/Exterior.jpg'
      },
      {
        title: 'Interior',
        description: '以驾驶员为中心的驾驶舱采用优质材料和先进技术。',
        image: '/models/Supra/Interior.jpg'
      },
      {
        title: 'Performance',
        description: '采用尖端性能技术，旨在带来纯粹的驾驶乐趣。',
        image: '/models/Supra/Performance.jpg'
      }
    ])

    const scrollToModels = () => {
      if (appearanceSection.value) {
        appearanceSection.value.scrollIntoView({
          behavior: 'smooth',
          block: 'start' // 添加精确滚动定位
        })
      }
    }

    const selectModel = (model: SupraModel) => {
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
      contentList,
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
  <div class="car-page">
    <!-- 视频主页 -->
    <div class="car-hero">
      <video autoplay loop muted playsinline class="hero-video">
        <source src="/videos/supra.mp4" type="video/mp4">
      </video>
      <div class="hero-overlay">
        <div class="hero-content">
          <h1>TOYOTA GR SUPRA</h1>
          <p class="hero-subtitle">Pure Driving Excitement</p>
          <div class="hero-actions">
            <button @click="scrollToModels" class="cta-button primary">探索车型</button>
            <button @click="openReserveModal" class="cta-button secondary">立即预约</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 标题区域 -->
    <div class="gallery-header">
      Gallery Presentation
      <p>——————Discover the GR Supra Legacy</p>
    </div>

    <!-- 汽车展示 -->
    <div class="car-overview">
      <div class="overview-box" v-for="(_, index) in 3" :key="index">
        <div class="overview-card">
          <div class="photos-content">
            <img :src="`/models/Supra/show${index + 1}.jpg`" :alt="`supra-overview-${index + 1}`">
            <div class="text-box"
                 :style="{
              left: contentList[index].x,
              top: contentList[index].y
            }">
              <h1>{{ contentList[index].title }}</h1>
              <p>{{ contentList[index].text }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 外观概览 -->
    <div class="appearance-overview">
      <div class="grid" style="background-color: rgb(255,255,255);"></div>
      <div class="appearance-title">
        <h1>Appearance and Design</h1>
        <p>外观/空气动力学</p>
      </div>
      <div class="appearance-grid">
        <div class="grid-card">
          <div class="grid-image-wrapper">
            <img src="/models/Supra/Appearance.jpg" alt="appearance and design">
          </div>
          <div class="grid-content-wrapper">
            <div class="grid-text-card">
              <h3>车轮性能</h3>
              <p>轻质锻造合金轮毂旨在减轻非悬挂重量
                并改善操控性。它们包裹在高性能轮胎中，提供
                出色的抓地力，并有助于 Supra 的动态驾驶特性。</p>
            </div>
            <div class="grid-card-footer">
              <router-link to="#">详细内容 ▶</router-link>
            </div>
          </div>
        </div>
        <div class="grid-card">
          <div class="grid-image-wrapper">
            <img src="/models/Supra/show1.jpg" alt="appearance and design">
          </div>
          <div class="grid-content-wrapper">
            <div class="grid-text-card">
              <h3>空气动力学设计</h3>
              <p>GR Supra 的外观经过精心雕琢，堪称空气动力学工程的杰作。
                每条曲线和线条都旨在提高性能、减少阻力并营造出引人注目的视觉效果。</p>
            </div>
            <div class="grid-card-footer">
              <router-link to="#">详细内容 ▶</router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- 内饰部分 -->
      <div class="appearance-title">
        <p style="margin-top: 2rem">内饰/驾驶舱</p>
      </div>
      <div class="appearance-block">
        <div class="block-card">
          <div class="block-content-wrapper">
            <div class="block-text-card">
              <h3>以驾驶员为中心的驾驶舱</h3>
              <p>内饰经过精心设计，旨在为驾驶员和机器之间创造完美的连接。
                优质材料、符合人体工程学的布局和先进的技术相结合，带来身临其境的驾驶体验。</p>
              <p>主要特点包括：
                - 真皮方向盘
                - 数字仪表盘
                - 增强侧向支撑的运动型座椅
                - 直观的信息娱乐系统</p>
            </div>
            <div class="block-card-footer">
              <router-link to="#">详细内容 ▶</router-link>
            </div>
          </div>
          <div class="block-image-wrapper">
            <img src="/models/Supra/cockpit.jpg" alt="interior design">
          </div>
        </div>

        <div class="block-card">
          <div class="block-image-wrapper">
            <img src="/models/Supra/command.jpg" alt="interior design">
          </div>
          <div class="block-content-wrapper">
            <div class="block-text-card">
              <h3>Supra Command</h3>
              <p>Supra 控制拨盘让您可以访问 GR Supra 的主要多媒体功能。
                其触摸式表面让您可以用手指输入导航系统的地址并放大和缩小地图。选择功能就像旋转和按下拨盘一样简单。</p>
            </div>
            <div class="block-card-footer">
              <router-link to="#">详细内容 ▶</router-link>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Models Section -->
    <div class="gtr-models">
      <div class="gtr-models-title" ref="appearanceSection">
        <h1>Discover Your Supra</h1>
        <p>2 Unique Grades to Choose From</p>
      </div>
      <div class="models-container">
        <div
            class="model-card"
            v-for="(model, index) in supraModels"
            :key="index"
        >
          <div class="grid2" style="background-color: rgb(1,10,14);"></div>
          <img class="model-image" :src="model.image" :alt="model.name">
          <div class="model-info">
            <h1>{{ model.name }}</h1>
            <div class="price-container">
              <div class="price">${{ model.price.toLocaleString() }}</div>
              <div class="price-note">建议零售价*</div>
            </div>
            <div class="specs">
              <p>车重：{{ model.weight }}kg</p>
              <p>发动机：{{ model.engine }}</p>
              <p>马力：{{ model.horsepower }}</p>
              <p>扭矩：{{ model.torque }}</p>
            </div>
          </div>
          <div class="action-buttons">
            <router-link to="#" class="detail-link">产看更多<span class="arrow">▶</span></router-link>
            <router-link to="#" class="build-link">Build It <span class="arrow">▶</span></router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Customization Section -->
    <div class="customization">
      <h2>Personalize Your GR Supra</h2>
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
@import "@/styles/models.css";

</style>
