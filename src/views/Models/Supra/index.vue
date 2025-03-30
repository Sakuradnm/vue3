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
    title: 'Heritage Reborn',
    x: '-4%',
    y: '25%',
    text: `GR Supra 将丰田的传奇跑车血统与现代工程和
    卓越的设计。与宝马合作开发的第五代 Supra 提供了完美的
    力量、控和风格的平衡，致敬其标志性的前辈，同时设定新的基准
    为了性能。`
  },
  {
    title: 'Track Precision',
    x: '51%',
    y: '10%',
    text: `GR Supra 采用赛车 DNA 设计，具有完美平衡的底盘、自适应悬架、
    以及低重心，可实现出色的作。以驾驶员为中心的驾驶舱提供直观的控制
    和卓越的舒适性，而先进的空气动力学性能确保了高速下的稳定性和效率。`
  },
  {
    title: 'Pure Performance',
    x: '0%',
    y: '-5%',
    text: `雕刻的引擎盖下是一个强大的涡轮增压发动机，可提供令人振奋的加速
    以及难忘的驾驶体验。通过 TOYOTA GAZOO Racing 的精确调校，GR Supra 的
    响应迅速的动力总成和完美的重量分配在驾驶员和机器之间建立了和谐的联系。`
  }
])

const supraModels = reactive<SupraModel[]>([
  {
    name: 'GR Supra 2.0',
    engine: '2.0L Twin-Scroll Turbocharged Inline-4',
    image: '/models/Supra/Supra-2.0.jpg',
    price: 43540,
    torque: '295 lb-ft (400 Nm) at 1,550-4,400 rpm',
    horsepower: '255 HP (190 kW) at 5,000-6,500 rpm',
    weight: 1520
  },
  {
    name: 'GR Supra 3.0',
    engine: '3.0L Twin-Scroll Turbocharged Inline-6',
    image: '/models/Supra/Supra-3.0.jpg',
    price: 52500,
    torque: '368 lb-ft (499 Nm) at 1,800-5,000 rpm',
    horsepower: '382 HP (285 kW) at 5,800-6,500 rpm',
    weight: 1570
  },
])

export default defineComponent({
  name: 'SupraPage',
  setup() {
    const selectedModel = ref<SupraModel | null>(null)
    const appearanceSection = ref<HTMLElement | null>(null)

    const customizationOptions = reactive<CustomizationOption[]>([
      {
        title: '外观',
        description: '低趴流线型车身设计，融合经典与现代美学。',
        image: '/models/Supra/appearance.jpg'
      },
      {
        title: '内饰',
        description: '驾驶者导向的座舱设计，提供最佳的操控体验与豪华感。',
        image: '/models/Supra/interior.jpg'
      },
      {
        title: '性能',
        description: '由GAZOO Racing调校的底盘与引擎，提供出色的动力与操控性能。',
        image: '/models/Supra/performance.jpg'
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

    const selectModel = (model: SupraModel) => {
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
  <div class="car-page supra-theme">
    <!-- 视频主页 -->
    <div class="car-hero">
      <video autoplay loop muted playsinline class="hero-video">
        <source src="/videos/supra.mp4" type="video/mp4">
      </video>
      <div class="hero-overlay">
        <div class="hero-content">
          <h1>TOYOTA GR SUPRA</h1>
          <p class="hero-subtitle">BORN FROM RACING</p>
          <div class="hero-actions">
            <button @click="scrollToModels" class="cta-button primary">探索车型</button>
            <button @click="openReserveModal" class="cta-button secondary">立即预约</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 标题区域 -->
    <div class="gallery-header">
      The Supra Legacy
      <p>——————探索GR Supra视觉图鉴</p>
    </div>

    <!-- 汽车展示1 + 内饰框架1 -->
    <div class="car-showcase">
      <div class="photos-content">
        <img src="/models/Supra/show1.jpg">
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
          <h2>DRIVER-FOCUSED COCKPIT</h2>
          <p class="subtitle">————PRECISION MEETS COMFORT</p>
        </div>

        <!-- 主部件：内容区 -->
        <div class="main-section">
          <div class="image-column">
            <img src="/models/Supra/1.jpg" alt="Supra Interior">
          </div>
          <div class="content-column">
            <div class="content-block">
              <h3>赛车风格的设计</h3>
              <p>GR Supra 的驾驶舱通过不对称的中控台、赛车风格的座椅和
                完美定位的控制装置。每个元素都旨在在驾驶员和机器之间建立直观的联系。
              </p>
            </div>
            <div class="content-block">
              <h3>优质工艺</h3>
              <p>Alcantara 和皮革表面与整个机舱的碳纤维装饰相得益彰。数模仪表组
                提供一目了然的重要信息，而平视显示器让您在紧张的驾驶过程中始终关注道路。
              </p>
            </div>
          </div>
        </div>

        <!-- 副部件：底部说明区 -->
        <div class="sub-section footer-section">
          <p>符合人体工程学的优化控制装置确保在高性能驾驶期间，所有功能都触手可及。
          </p>
        </div>
      </div>
    </div>

    <!-- 汽车展示2 + 内饰框架2 -->
    <div class="car-showcase">
      <div class="photos-content">
        <img src="/models/Supra/show2.jpg" alt="supra-overview-2">
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
          <h2>先进的技术</h2>
          <p class="subtitle">————INNOVATION FOR PERFORMANCE</p>
        </div>

        <!-- 主部件：内容区（镜像布局） -->
        <div class="main-section">
          <div class="image-column">
            <img src="/models/Supra/2.jpg" alt="Supra Technology">
          </div>
          <div class="content-column">
            <div class="content-block">
              <h3>智能驾驶系统</h3>
              <p>GR Supra 配备先进的驾驶员辅助系统，可提高安全性和性能。自适应可变悬架
                不断调整阻尼力，以根据路况和驾驶风格优化控性和乘坐舒适性。
              </p>
            </div>
            <div class="content-block">
              <h3>可定制的驾驶模式</h3>
              <p>在正常和运动模式之间进行选择，以立即改变 Supra 的角色。运动模式提高了油门响应，
                收紧转向感觉，并增强排气音效，带来更具吸引力的驾驶体验。
              </p>
            </div>
          </div>
        </div>

        <!-- 副部件：底部说明区 -->
        <div class="sub-section footer-section">
          <p>配备 Toyota Supra Command 的 8.8 英寸触摸屏提供无缝连接和车辆控制。
          </p>
        </div>
      </div>
    </div>

    <!-- 汽车展示3 + 外观框架 -->
    <div class="car-showcase">
      <div class="photos-content">
        <img src="/models/Supra/show3.jpg" alt="supra-overview-3">
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
          <h2>卓越的空气动力学性能</h2>
          <p class="subtitle">————FORM FOLLOWS FUNCTION</p>
        </div>

        <!-- 双列布局 -->
        <div class="grid-cols-2">
          <!-- 左列：上图下文 -->
          <div class="card">
            <div class="card-top">
              <img src="/models/Supra/4.jpg">
            </div>
            <div class="card-bottom">
              <h3>精密工程</h3>
              <p>GR Supra 的雕刻车身旨在优化气流，具有功能性通风口和进气口，可降低升力
                并改善冷却。双气泡车顶向赛车传统致敬，同时提高了头部空间和空气动力学效率。
              </p>
            </div>
          </div>

          <!-- 右列：文下图 -->
          <div class="card reverse">
            <div class="card-bottom">
              <img src="/models/Supra/3.jpg">
            </div>
            <div class="card-top">
              <h3>标志性设计</h3>
              <p>独特的六透镜 LED 大灯构成了激进的前仪表板，而集成的后扰流板和
                宽阔的姿态营造出威严的存在感。Supra 的廓形极具辨识度，结合了经典比例
                采用现代空气动力学原理。</p>
            </div>
          </div>
        </div>

        <!-- 底部说明 -->
        <div class="sub-section footer-section">
          <p>锻造的 19 英寸合金轮毂搭配高性能轮胎，提供最佳抓地力和引人注目的美感。
          </p>
        </div>
      </div>
    </div>

    <!-- Models Section -->
    <div class="gtr-models">
      <div class="gtr-models-title" ref="appearanceSection">
        <h1>Choose Your GR Supra</h1>
        <p>Engineering Excellence in Two Forms</p>
      </div>
      <div class="models-container">
        <div
            class="model-card"
            v-for="(model, index) in supraModels"
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
      <h2>Customize Your GR Supra</h2>
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

.supra-theme {
  --supra-red: #e50000;
  --supra-dark-red: #9b0000;
  --supra-light-red: #ff3232;
  --supra-accent: #ff0000;
}

/* Hero adjustments */
.hero-content h1 {
  text-shadow: 5px 5px 2px var(--supra-dark-red),
  5px 0 2px hsla(0, 100%, 50%, 0.47),
  0 0 50px hsla(0, 100%, 40%, 0.99);
}

.hero-subtitle {
  text-shadow: 5px 5px 2px var(--supra-dark-red),
  5px 0 2px hsla(0, 100%, 50%, 0.47),
  0 0 50px hsla(0, 100%, 40%, 0.99);
}

.cta-button.primary {
  background: rgba(229, 0, 0, 0.47);
}

.cta-button.secondary {
  color: var(--supra-light-red);
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
  text-shadow: 5px 5px 2px var(--supra-dark-red),
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
  box-shadow: 0 8px 30px rgba(255, 0, 0, 0.3);
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
  text-shadow: 5px 5px 2px var(--supra-dark-red),
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
  color: rgb(255, 150, 150);
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
  text-shadow: 5px 5px 2px var(--supra-dark-red),
  5px 0 2px hsla(0, 100%, 50%, 0.47),
  0 0 50px hsla(0, 100%, 40%, 0.4);
}
</style>