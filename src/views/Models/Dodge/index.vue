<script lang="ts">
import { defineComponent, ref, reactive } from 'vue'

// Define interfaces for type safety
interface HellcatModel {
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
    x: '50%',
    y: '-5%',
    text: `*部分车型配置和颜色可能与实际不符，请以实际车辆为准。
                *规格和设备如有变更，恕不另行通知。
                *3D图像是CG图像。实际颜色可能与所示不同。
                *如果您选择特殊的油漆颜色或防刮保护层，车辆价格将与其他车身颜色不同。
                *部分照片为合成图。
                *列出的制造商和经销商选项仅供选择。
                *预计价格仅供参考。屏幕上显示的价格或屏幕打印件上打印的价格不具有销售价格的效力。`
  },
  {
    title: 'Heritage',
    x: '1%',
    y: '1%',
    text: `DODGE SRT® HELLCAT延续了美国肌肉车的强悍血统。
                它代表了美国汽车工程的巅峰之作，将原始动力
                与先进技术完美结合。HELLCAT系列搭载全球量产车中
                最强大的V8发动机之一，成为性能与力量的象征。`
  },
  {
    title: 'Track Package',
    x: '50%',
    y: '20%',
    text: `*车辆价格为截至2024年3月北美地区的制造商建议零售价（不含税）。
                *税费、汽车责任强制保险、销售费用、选配价格（制造商和经销商）、配件价格等不包含在内。
                *HELLCAT系列配备了先进的Launch Control系统，帮助驾驶者实现最佳起步加速效果。
                *所有HELLCAT车型均配备独特的双钥匙系统，黑钥匙限制输出马力，红钥匙则释放全部动力潜能。
                *请注意，车辆规格和装备可能与实际车辆不同，具体配置请咨询当地经销商。`
  }
])


const hellcatModels = reactive<HellcatModel[]>([
  {
    name: 'Charger Hellcat',
    engine: '6.2L HEMI® Hellcat V8',
    image: '/models/Hellcat/charger-hellcat.jpg',
    price: 74900,
    torque: '650 lb-ft (881 Nm) at 4,800 rpm',
    horsepower: '717 HP (535 kW) at 6,000 rpm',
    weight: 4586
  },
  {
    name: 'Hellcat Redeye',
    engine: 'Hellcat High-Output V8',
    image: '/models/Hellcat/challenger-hellcat-redeye.jpg',
    price: 80590,
    torque: '707 lb-ft (959 Nm) at 4,500 rpm',
    horsepower: '797 HP (594 kW) at 6,300 rpm',
    weight: 4451
  },
])

export default defineComponent({
  name: 'HellcatPage',
  setup() {
    // Using generics and interfaces for type safety
    const selectedModel = ref<HellcatModel | null>(null)
    const appearanceSection = ref<HTMLElement | null>(null)

    const customizationOptions = reactive<CustomizationOption[]>([
      {
        title: '外观',
        description: '侵略性的外观设计与空气动力学完美结合，提供极致性能和视觉冲击力。',
        image: '/models/Hellcat/appearance.jpg'
      },
      {
        title: '内饰',
        description: '高级材质和赛车风格的座椅，提供舒适感和极致驾驶体验。',
        image: '/models/Hellcat/interior.jpg'
      },
      {
        title: '性能',
        description: '超强动力输出与先进的驾驶技术，带来无与伦比的驾驶体验。',
        image: '/models/Hellcat/performance.jpg'
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

    const selectModel = (model: HellcatModel) => {
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
      hellcatModels,
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
        <source src="/videos/hellcat.mp4" type="video/mp4">
      </video>
      <div class="hero-overlay">
        <div class="hero-content">
          <h1>DODGE SRT® HELLCAT</h1>
          <p class="hero-subtitle">Unleash the Beast</p>
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
      <p>——————探索HELLCAT视觉图鉴</p>
    </div>

    <!-- 汽车展示 -->
    <div class="car-overview">
      <div class="overview-box" v-for="(_, index) in 3" :key="index">
        <div class="overview-card">
          <div class="photos-content">
            <img :src="`/models/Hellcat/show${index + 1}.jpg`" :alt="`hellcat-overview-${index + 1}`">
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

    <!-- 外观设计 -->
    <div class="appearance-overview">
      <div class="grid" style="background-color: rgb(255,255,255);"></div>
      <div class="appearance-title">
        <h1>Appearance and Design</h1>
        <p>外观 / 性能部件</p>
      </div>
      <div class="appearance-grid">
        <div class="grid-card">
          <div class="grid-image-wrapper">
            <img src="/models/Hellcat/1.jpg" alt="appearance and design">
          </div>
          <div class="grid-content-wrapper">
            <div class="grid-text-card">
              <h3>功能性引擎盖</h3>
              <p>双进气口设计的引擎盖不仅提升了视觉冲击力，更是实现有效进气和散热的关键性能部件。每一处设计都兼顾美学与功能性，确保发动机在高负荷运转时保持最佳工作温度。</p>
            </div>
            <div class="grid-card-footer">
              <router-link to="#">详细内容 ▶</router-link>
            </div>
          </div>
        </div>
        <div class="grid-card">
          <div class="grid-image-wrapper">
            <img src="/models/Hellcat/2.jpg" alt="appearance and design">
          </div>
          <div class="grid-content-wrapper">
            <div class="grid-text-card">
              <h3>前轴宽体</h3>
              <p>SRT Power Chiller ®使用汽车的空调系统来冷却进气，向发动机输送更多的氧气，从而增加其燃烧和原始功率。
                每个挡泥板上增加的 3.5 英寸不仅可以占据视线，而且还增强了车辆的抓地力、操控性和稳定性。</p>
            </div>
            <div class="grid-card-footer">
              <router-link to="#">详细内容 ▶</router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- 内饰部分 -->
      <div class="appearance-title">
        <p style="margin-top: 2rem">内饰 / 驾驶舱</p>
      </div>
      <div class="appearance-block">
        <div class="block-card">
          <div class="block-content-wrapper">
            <div class="block-text-card">
              <h3>性能导向的豪华内饰</h3>
              <p>HELLCAT系列内饰采用高级Laguna真皮材质，配合醒目的对比色缝线，彰显其高性能血统与豪华品质。</p>
              <p>主要特点包括：
                - 赛车风格座椅，提供卓越侧向支撑
                - 平底方向盘，带红色12点位标记
                - SRT专属仪表盘，带220mph速度表
                - 醒目的HELLCAT徽标装饰</p>
            </div>
            <div class="block-card-footer">
              <router-link to="#">详细内容 ▶</router-link>
            </div>
          </div>
          <div class="block-image-wrapper">
            <img src="/models/Hellcat/3.jpg" alt="interior design">
          </div>
        </div>
        <div class="block-card">
          <div class="block-image-wrapper">
            <img src="/models/Hellcat/4.jpg" alt="interior design">
          </div>
          <div class="block-content-wrapper">
            <div class="block-text-card">
              <h3>个性化的控制台</h3>
              <p>进入 Charger SRT ® Hellcat Widebody，发现其技术先进的内饰，其赛车风格的皮革装饰座椅和方向盘使其既舒适又无情。
                汽车外部和内部均饰有 Hellcat 徽章，这让 Charger SRT ® Hellcat Redeye 难以忽视且令人难以忘怀。
                坐在方向盘后面，Charger SRT ® Hellcat Redeye 经过精心设计，兼具性能和豪华。 </p>
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
        <h1>Discover Your HELLCAT</h1>
        <p>2 Iconic Models to Choose From</p>
      </div>
      <div class="models-container">
        <div
            class="model-card"
            v-for="(model, index) in hellcatModels"
            :key="index"
        >
          <div class="grid2" style="background-color: rgb(10,10,10);"></div>
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
            <router-link to="#" class="detail-link">查看更多<span class="arrow">▶</span></router-link>
            <router-link to="#" class="build-link">Build It <span class="arrow">▶</span></router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Customization Section -->
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
@import "@/styles/models.css";
</style>