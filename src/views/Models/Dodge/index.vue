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
    title: 'Pure Power',
    x: '-4%',
    y: '25%',
    text: `道奇 Hellcat 配备 6.2L HEMI® V8 增压发动机，性能出众，
    可产生高达 807 马力和 707 磅英尺的扭矩。体验令人震撼的加速性能，
    超越福特野马 GT500 和雪佛兰科迈罗 ZL1 等竞争对手，使 Hellcat 成为无可争议的
    美国肌肉车之王。`
  },
  {
    title: 'Legacy',
    x: '51%',
    y: '10%',
    text: `2025 款 Hellcat 是道奇高性能传统的终极体现。
    它拥有威风凛凛的设计、震撼人心的排气声和令人震撼的动力，代表了现代肌肉车的巅峰。
    没有一款前轮驱动跑车能比得上 Hellcat 后轮驱动美国肌肉车血统所带来的原始、震撼的体验。`
  },
  {
    title: 'Track Domination',
    x: '0%',
    y: '-5%',
    text: `Hellcat 将精密工程与传奇的 HEMI® 动力相结合，打造出一款适合赛道的
    街车，无论是在直线加速赛道还是在弯道上都同样得心应手。凭借先进的性能技术
    和以驾驶员为中心的功能，2025 Hellcat 为追求极致美式肌肉车的性能爱好者提供了卓越的价值。`
  }
])

const hellcatModels = reactive<HellcatModel[]>([
  {
    name: 'Hellcat',
    engine: '6.2L Supercharged HEMI® V8',
    image: '/models/Hellcat/hellcat-base.jpg',
    price: 69995,
    torque: '707 lb-ft (959 Nm) at 4,000 rpm',
    horsepower: '717 HP (535 kW) at 6,000 rpm',
    weight: 2080
  },
  {
    name: 'Hellcat Redeye',
    engine: '6.2L High-Output Supercharged HEMI® V8',
    image: '/models/Hellcat/hellcat-redeye.jpg',
    price: 79995,
    torque: '707 lb-ft (959 Nm) at 4,500 rpm',
    horsepower: '807 HP (602 kW) at 6,300 rpm',
    weight: 2100
  },
])

export default defineComponent({
  name: 'HellcatPage',
  setup() {
    const selectedModel = ref<HellcatModel | null>(null)
    const appearanceSection = ref<HTMLElement | null>(null)

    const customizationOptions = reactive<CustomizationOption[]>([
      {
        title: '外观',
        description: '凶悍的车身线条与空气动力学设计，展现极致美式肌肉车魅力。',
        image: '/models/Hellcat/appearance.jpg'
      },
      {
        title: '内饰',
        description: '赛车风格座椅与驾驶舱设计，提供极致性能体验与舒适性。',
        image: '/models/Hellcat/interior.jpg'
      },
      {
        title: '性能',
        description: '强大的后轮驱动与精准底盘调校，极致操控与动力输出。',
        image: '/models/Hellcat/performance.jpg'
      }
    ])

    const scrollToModels = () => {
      if (appearanceSection.value) {
        appearanceSection.value.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }
    }

    const selectModel = (model: HellcatModel) => {
      selectedModel.value = model
    }

    const closeModal = () => {
      selectedModel.value = null
      document.body.style.overflow = 'auto'
    }

    const openReserveModal = () => {
      alert('Reservation system coming soon!')
    }

    const initiateReservation = () => {
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
  <div class="car-page hellcat-theme">
    <!-- 视频主页 -->
    <div class="car-hero">
      <video autoplay loop muted playsinline class="hero-video">
        <source src="/videos/hellcat.mp4" type="video/mp4">
      </video>
      <div class="hero-overlay">
        <div class="hero-content">
          <h1>DODGE HELLCAT</h1>
          <p class="hero-subtitle">——UNLEASH THE BEAST——</p>
          <div class="hero-actions">
            <button @click="scrollToModels" class="cta-button primary">探索车型</button>
            <button @click="openReserveModal" class="cta-button secondary">立即预约</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 标题区域 -->
    <div class="gallery-header">
      Beast Mode Gallery
      <p>——————探索HELLCAT视觉图鉴</p>
    </div>

    <!-- 汽车展示1 + 内饰框架1 -->
    <div class="car-showcase">
      <div class="photos-content">
        <img src="/models/Hellcat/show1.jpg">
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
          <h2>赛车风格的内饰</h2>
          <p class="subtitle">————PERFORMANCE COCKPIT DESIGN</p>
        </div>

        <!-- 主部件：内容区 -->
        <div class="main-section">
          <div class="image-column">
            <img src="/models/Hellcat/1.jpg" alt="Hellcat Interior">
          </div>
          <div class="content-column">
            <div class="content-block">
              <h3>以驾驶员为中心的环境</h3>
              <p>Hellcat 配备优质 Laguna 真皮座椅，并配有强力支撑，让您在高性能驾驶过程中稳稳坐稳。
                所有控制装置都触手可及，确保驾驶员可以专注于道路和令人振奋的驾驶体验。
              </p>
            </div>
            <div class="content-block">
                <h3>优质材料</h3>
              <p>Hellcat 内饰的每一个接触点都采用优质材料精心打造。
                从带红色缝线的皮革包裹平底方向盘到真正的碳纤维装饰，内饰将奢华与赛车美学融为一体。</p>
            </div>
          </div>
        </div>

        <!-- 副部件：底部说明区 -->
        <div class="sub-section footer-section">
          <p>以性能为导向的控制装置旨在实现最佳的驾驶员参与和控制。
          </p>
        </div>
      </div>
    </div>

    <!-- 汽车展示2 + 内饰框架2 -->
    <div class="car-showcase">
      <div class="photos-content">
        <img src="/models/Hellcat/show2.jpg" alt="hellcat-overview-2">
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
          <h2>性能技术</h2>
          <p class="subtitle">————ADVANCED DRIVER INTERFACE</p>
        </div>

        <!-- 主部件：内容区（镜像布局） -->
        <div class="main-section">
          <div class="image-column">
            <img src="/models/Hellcat/2.jpg" alt="Hellcat Technology">
          </div>
          <div class="content-column">
            <div class="content-block">
              <h3>SRT 性能页面</h3>
              <p>通过独有的 SRT 性能页面监控和调整 Hellcat 性能的各个方面，允许实时跟踪马力、重力、反应时间等……
              </p>
            </div>
            <div class="content-block">
              <h3>可定制的驾驶模式</h3>
              <p>通过可选择的驾驶模式（包括街道、运动、赛道和自定义设置）定制您的 Hellcat 的性能，这些模式可以调整马力、变速箱换档点、牵引力控制和悬架……
              </p>
            </div>
          </div>
        </div>

        <!-- 副部件：底部说明区 -->
        <div class="sub-section footer-section">
          <p>带有 SRT Performance Pages 的 8.4 英寸 Uconnect 触摸屏可即时访问车辆性能数据</p>
        </div>
      </div>
    </div>

    <!-- 汽车展示3 + 外观框架 -->
    <div class="car-showcase">
      <div class="photos-content">
        <img src="/models/Hellcat/show3.jpg" alt="hellcat-overview-3">
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
          <h2>霸气外观</h2>
          <p class="subtitle">————FORM FOLLOWS FUNCTION</p>
        </div>

        <!-- 双列布局 -->
        <div class="grid-cols-2">
          <!-- 左列：上图下文 -->
          <div class="card">
            <div class="card-top">
              <img src="/models/Hellcat/3.jpg">
            </div>
            <div class="card-bottom">
              <h3>性能组件</h3>
              <p>Hellcat 采用 20 英寸缎黑色锻造铝轮毂，重量轻但非常坚固，可以承受巨大的动力。
                采用倍耐力 P Zero 高性能轮胎，它们为直线加速和转弯提供出色的抓地力。
              </p>
            </div>
          </div>

          <!-- 右列：文下图 -->
          <div class="card reverse">
            <div class="card-bottom">
              <img src="/models/Hellcat/4.jpg">
            </div>
            <div class="card-top">
              <h3>双排气系统</h3>
              <p>Hellcat 的主动排气系统不仅能产生标志性的 HEMI 轰鸣声，还能优化排气流量以实现最佳性能。
                只需按一下按钮，电子控制阀门便可将排气声从细微的咆哮调节为全面的轰鸣。
              </p>
            </div>
          </div>
        </div>

        <!-- 底部说明 -->
        <div class="sub-section footer-section">
          <p>功能性引擎盖进气口和散热装置可改善发动机冷却效果，并降低高速时的升力
          </p>
        </div>
      </div>
    </div>

    <!-- Models Section -->
    <div class="gtr-models">
      <div class="gtr-models-title" ref="appearanceSection">
        <h1>Choose Your Hellcat</h1>
        <p>2 Beasts to Unleash</p>
      </div>
      <div class="models-container">
        <div
            class="model-card"
            v-for="(model, index) in hellcatModels"
            :key="index"
        >
          <div class="grid2" style="background-color: rgb(80, 0, 0);"></div>
          <img class="model-image" :src="model.image" :alt="model.name">
          <div class="model-info">
            <h1>{{ model.name }}</h1>
            <div class="price-container">
              <div class="price">${{ model.price.toLocaleString() }}</div>
              <div class="price-note">Starting MSRP*</div>
            </div>
            <div class="specs">
              <p>车重：{{ model.weight }}kg</p>
              <p>发动机：{{ model.engine }}</p>
              <p>马力：{{ model.horsepower }}</p>
              <p>扭矩：{{ model.torque }}</p>
            </div>
          </div>
          <div class="action-buttons">
            <router-link to="#" class="detail-link">Details<span class="arrow">▶</span></router-link>
            <router-link to="#" class="build-link">Build It <span class="arrow">▶</span></router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Customization Section -->
    <div class="customization">
      <h2>Customize Your Hellcat</h2>
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

.hellcat-theme {
  --hellcat-red: #8B0000;
  --hellcat-dark-red: #590000;
  --hellcat-light-red: #c10000;
  --hellcat-accent: #ff0000;
}

/* Hero adjustments */
.hero-content h1 {
  text-shadow: 5px 5px 2px var(--hellcat-dark-red),
  5px 0 2px hsla(0, 100%, 50%, 0.47),
  0 0 50px hsla(0, 100%, 40%, 0.99);
}

.hero-subtitle {
  text-shadow: 5px 5px 2px var(--hellcat-dark-red),
  5px 0 2px hsla(0, 100%, 50%, 0.47),
  0 0 50px hsla(0, 100%, 40%, 0.99);
}

.cta-button.primary {
  background: rgba(200, 0, 0, 0.47);
}

.cta-button.secondary {
  color: var(--hellcat-light-red);
}

/* Header adjustments */
.gallery-header {
  text-shadow: -5px 4px 4px hsla(0, 95%, 37%, 0.45),
  7px 2px 8px hsla(0, 66%, 34%, 0.61),
  2px 0 50px hsl(0, 100%, 45%);
}

.gallery-header p {
  text-shadow: 0 0 2px hsl(0, 0%, 100%),
  0 2px 2px hsla(0, 100%, 51%, 0.82),
  2px 0 5px hsl(0, 76%, 32%);
}

/* Section headers */
.header-section h2 {
  text-shadow: 5px 5px 2px var(--hellcat-dark-red),
  5px 0 2px hsla(0, 100%, 50%, 0.47),
  0 0 50px hsla(0, 100%, 45%, 0.99);
}

.header-section .subtitle {
  color: rgba(255, 0, 0, 0.8);
}

/* Interior frame */
.interior-frame {
  background: #000000;
}

.interior-frame img {
  border-radius: 8px;
  box-shadow: 0 8px 30px rgba(200, 0, 0, 0.3);
}

/* Content blocks */
.content-block {
  background: rgba(70, 0, 0, 0.18);
  border: 1px solid rgba(255, 0, 0, 0.24);
}

/* Card styling */
.card-top {
  background: linear-gradient(to left, rgba(255, 0, 0, 0.08), transparent);
}

.card-bottom {
  background: linear-gradient(to right, rgba(255, 0, 0, 0.08), transparent);
}

/* Models section */
.gtr-models {
  background-image: linear-gradient(to bottom, rgb(0, 0, 0), rgb(50, 0, 0));
}

.gtr-models-title h1 {
  text-shadow: 5px 5px 2px var(--hellcat-dark-red),
  5px 0 2px hsla(0, 100%, 50%, 0.47),
  0 0 50px hsla(0, 100%, 45%, 0.41);
}

.models-container {
  background-color: rgb(10, 0, 0);
}

.models-container::before {
  background: rgb(80, 0, 0);
}

.model-card {
  background: rgb(10, 0, 0);
}

.model-info h1,
.price {
  color: #ffffff;
}

.price-note {
  color: rgb(200, 100, 100);
}

.specs p {
  color: #cccccc;
}

.detail-link, .build-link {
  color: #ffffff;
  background: rgba(80, 0, 0, 0.5);
}

.build-link {
  border: 2px solid rgba(255, 0, 0, 0.54);
  background: rgba(120, 0, 0, 0.29);
}

.detail-link:hover {
  color: rgba(255, 150, 150, 0.71);
}

.build-link:hover {
  border: 2px solid rgba(255, 0, 0, 0.47);
  background: rgba(150, 0, 0, 0.58);
}

/* Customization section */
.customization {
  background-image: linear-gradient(to top, rgb(0, 0, 0), rgb(50, 0, 0));
}

.customization h2 {
  text-shadow: 5px 5px 2px var(--hellcat-dark-red),
  5px 0 2px hsla(0, 100%, 50%, 0.47),
  0 0 50px hsla(0, 100%, 40%, 0.4);
}
</style>