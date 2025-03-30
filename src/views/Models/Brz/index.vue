<script lang="ts">
import { defineComponent, ref, reactive } from 'vue'

// Define interfaces for type safety
interface BRZModel {
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
    x: '-4%',
    y: '25%',
    text: `BRZ 跑车配备强大的 2.4 升直喷 SUBARU BOXER ®发动机，可提供 228 马力和令人惊叹的 0-60 MPH 加速乐趣，
    为您提供比 Mazda MX-5 Miata 或 Honda Civic Si 更高的标准马力。
    为了实现更精确的控制，Subaru BRZ tS 由 Subaru Tecnica International (STI) 的赛车运动专家设计，
    以增强 BRZ 已经享有盛誉的操控性，从而实现更令人兴奋的性能。`
  },
  {
    title: 'Heritage',
    x: '51%',
    y: '10%',
    text: `2025 BRZ 拥有标志性的跑车布局——双门、前置发动机、后轮驱动——以及极佳的操控性，是一款能让任何驾驶体验都令人激动不已的斯巴鲁跑车。
    前轮驱动的本田思域 Si 和大众 GTI 根本无法与 BRZ 经典、平衡的后轮驱动设计相提并论。`
  },
  {
    title: 'Track Package',
    x: '0%',
    y: '-5%',
    text: `BRZ 结合了精密的工程设计、值得信赖的安全技术和周到的功能，作为一款经济实惠的跑车，
    它为您提供了卓越的价值：后轮驱动的刺激感和日常驾驶的便利性。对质量、可靠性和价值的承诺是 2025 款 BRZ 成为《消费者报告》推荐车型的原因之一。
    您知道您可以依靠 BRZ 在每次驾驶中提供高性能的刺激感，因为斯巴鲁被 ACSI 评为产品质量第一2。`
  }
])

const brzModels = reactive<BRZModel[]>([
  {
    name: 'BRZ Premium',
    engine: '2.4L BOXER 4-cylinder',
    image: '/models/Brz/BRZ-Premium.jpg',
    price: 28595,
    torque: '184 lb-ft (250 Nm) at 3,700 rpm',
    horsepower: '228 HP (170 kW) at 7,000 rpm',
    weight: 1276
  },
  {
    name: 'BRZ Limited',
    engine: '2.4L BOXER 4-cylinder',
    image: '/models/Brz/BRZ-Limited.jpg',
    price: 31095,
    torque: '184 lb-ft (250 Nm) at 3,700 rpm',
    horsepower: '228 HP (170 kW) at 7,000 rpm',
    weight: 1289
  },
])

export default defineComponent({
  name: 'BRZPage',
  setup() {
    const selectedModel = ref<BRZModel | null>(null)
    const appearanceSection = ref<HTMLElement | null>(null)

    const customizationOptions = reactive<CustomizationOption[]>([
      {
        title: '外观',
        description: '低重心设计与空气动力学完美结合，流线型车身彰显运动气息。',
        image: '/models/Brz/Appearance.jpg'
      },
      {
        title: '内饰',
        description: '运动型座椅提供最佳支撑和舒适性，驾驶舱设计聚焦驾驶者体验。',
        image: '/models/Brz/Trim.jpg'
      },
      {
        title: '性能',
        description: '后轮驱动布局与精准底盘调校，带来纯粹的驾驶乐趣和灵活操控。',
        image: '/models/Brz/Packages.jpg'
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

    const selectModel = (model: BRZModel) => {
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
      brzModels,
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
        <source src="/videos/brz.mp4" type="video/mp4">
      </video>
      <div class="hero-overlay">
        <div class="hero-content">
          <h1>SUBARU BRZ</h1>
          <p class="hero-subtitle">纯粹驾驶乐趣</p>
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
      <p>——————探索BRZ视觉图鉴</p>
    </div>

    <!-- 汽车展示1 + 内饰框架1 -->
    <div class="car-showcase">
      <div class="photos-content">
          <img src="/models/Brz/show1.jpg">
          <div class="text-box" :style="{ left: contentList[0].x, top: contentList[0].y }">
            <h1>{{ contentList[0].title }}</h1>
            <p>{{ contentList[0].text }}</p>
          </div>
      </div>
    </div>

    <!-- 内饰框架1 -->
    <div class="content-frame interior-frame">
      <div class="interior-container">
        <!-- 副部件：顶部标题区 -->
        <div class="sub-section header-section">
          <h2>专注驾驶的内饰设计</h2>
          <p class="subtitle">————Ergonomic Cockpit Design</p>
        </div>

        <!-- 主部件：内容区 -->
        <div class="main-section">
          <div class="image-column">
            <img src="/models/Brz/3.jpg" alt="内饰设计">
          </div>
          <div class="content-column">
            <div class="content-block">
              <h3>以驾驶者为中心</h3>
              <p>Limited版本配备Ultrasuede®材质座椅，增强支撑性和舒适度，同时减少驾驶时的滑动。
                功能性的内饰布局让所有控制按钮触手可及，确保驾驶者专注于路况和驾驶体验。</p>
            </div>
            <div class="content-block">
              <h3>材质工艺</h3>
              <p>BRZ的内饰以驾驶者为中心设计，配备带红色缝线的运动座椅，提供出色的侧向支撑。
                真皮包裹的方向盘带有红色缝线，提供最佳握感和控制力，尽显运动气息。</p>
            </div>
          </div>
        </div>

        <!-- 副部件：底部说明区 -->
        <div class="sub-section footer-section">
          <p>所有控制按钮触手可及，确保驾驶者保持最佳坐姿</p>
        </div>
      </div>
    </div>

    <!-- 汽车展示2 + 内饰框架2 -->
    <div class="car-showcase">
      <div class="photos-content">
          <img src="/models/Brz/show2.jpg" alt="brz-overview-2">
          <div class="text-box" :style="{ left: contentList[1].x, top: contentList[1].y }">
            <h1>{{ contentList[1].title }}</h1>
            <p>{{ contentList[1].text }}</p>
          </div>
      </div>
    </div>

    <!-- 内饰框架2 -->
    <div class="content-frame interior-frame">
      <div class="interior-container reverse-layout">
        <!-- 副部件：顶部标题区 -->
        <div class="sub-section header-section">
          <h2>人体工程学设计</h2>
          <p class="subtitle">————Human-Centric Design</p>
        </div>

        <!-- 主部件：内容区（镜像布局） -->
        <div class="main-section">

            <div class="image-column">
              <img src="/models/Brz/4.jpg" alt="人机工程设计">
            </div>
            <div class="content-column">
              <div class="content-block">
                <h3>人体工程学设计</h3>
                <p>所有控制按钮呈扇形分布，确保驾驶者手不离方向盘即可完成主要操作...</p>
              </div>
              <div class="content-block">
                <h3>显示系统优化</h3>
                <p>7英寸液晶仪表盘信息布局经过人因工程学优化...</p>
              </div>
            </div>
        </div>

        <!-- 副部件：底部说明区 -->
        <div class="sub-section footer-section">
          <p>方向盘角度与中控台倾斜度经过风洞测试优化，最大限度减少驾驶疲劳</p>
        </div>
      </div>
    </div>

    <!-- 汽车展示3 + 外观框架 -->
    <div class="car-showcase">
      <div class="photos-content">
          <img src="/models/Brz/show3.jpg" alt="brz-overview-3">
          <div class="text-box" :style="{ left: contentList[2].x, top: contentList[2].y }">
            <h1>{{ contentList[2].title }}</h1>
            <p>{{ contentList[2].text }}</p>
          </div>
      </div>
    </div>

    <!-- 外观框架 -->
    <div class="content-frame exterior-frame">
      <div class="exterior-container">
        <!-- 顶部标题 -->
        <div class="sub-section header-section">
          <h2>外观设计亮点</h2>
          <p class="subtitle">————Aerodynamic Excellence</p>
        </div>

        <!-- 双列布局 -->
        <div class="grid-cols-2">
          <!-- 左列：上图下文 -->
          <div class="card">
            <div class="card-top">
              <img src="/models/Brz/1.jpg">
            </div>
            <div class="card-bottom">
              <h3>运动轮毂设计</h3>
              <p>17英寸（Premium）或18英寸（Limited）铝合金轮毂，采用多辐条设计，提供卓越的强度与轻量化特性。
                配备高性能米其林Pilot Sport 4轮胎，提供出色的抓地力与转向反馈。</p>
            </div>
          </div>

          <!-- 右列：文下图 -->
          <div class="card reverse">
            <div class="card-bottom">
              <img src="/models/Brz/2.jpg">
            </div>
            <div class="card-top">
              <h3>双出排气系统</h3>
              <p>BRZ配备双出排气管设计，不仅增强了视觉效果，更提供了令人振奋的引擎声浪。
                精心调校的排气系统减少了背压，提升发动机性能，同时优化中低转速的扭矩输出。</p>
            </div>
          </div>
        </div>

        <!-- 底部说明 -->
        <div class="sub-section footer-section">
          <p>空气动力学组件经过风洞测试优化，提升高速行驶稳定性</p>
        </div>
      </div>
    </div>

    <!-- Models Section -->
    <div class="gtr-models">
      <div class="gtr-models-title" ref="appearanceSection">
        <h1>Discover Your BRZ</h1>
        <p>2 Unique Grades to Choose From</p>
      </div>
      <div class="models-container">
        <div
            class="model-card"
            v-for="(model, index) in brzModels"
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
            <router-link to="#" class="detail-link">查看更多<span class="arrow">▶</span></router-link>
            <router-link to="#" class="build-link">Build It <span class="arrow">▶</span></router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Customization Section -->
    <div class="customization">
      <h2>Personalize Your BRZ</h2>
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
/* 内饰框架 */
.interior-frame {
  background: #000000;
  img {
    border-radius: 8px;
    box-shadow: 0 8px 30px rgba(0, 108, 250, 0.3);
  }
}
</style>