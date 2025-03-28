<script lang="ts">
import { defineComponent, ref, reactive } from 'vue'

interface UltraModel {
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

const ultraModels = reactive<UltraModel[]>([
  {
    name: 'Ultra Vantage',
    engine: 'V8 4.0L 双涡轮增压',
    image: '/models/Ultra/ultra-vantage.jpg',
    price: 1280000,
    torque: '685 Nm @ 2000-5000 rpm',
    horsepower: '535 HP (402 kW)',
    weight: 1630
  },
  {
    name: 'Ultra Nebula',
    engine: 'V12 6.5L 自然吸气',
    image: '/models/Ultra/ultra-nebula.jpg',
    price: 2580000,
    torque: '720 Nm @ 5500 rpm',
    horsepower: '765 HP (574 kW)',
    weight: 1695
  },
])

export default defineComponent({
  name: 'UltraPage',
  setup() {
    const selectedModel = ref<UltraModel | null>(null)
    const appearanceSection = ref<HTMLElement | null>(null)

    const customizationOptions = reactive<CustomizationOption[]>([
      {
        title: '空气动力学',
        description: '主动式尾翼系统，三级可调扩散器，碳纤维前唇',
        image: '/models/Ultra/aero.jpg'
      },
      {
        title: '性能套件',
        description: '赛道级悬挂调校，陶瓷复合制动系统，钛合金排气',
        image: '/models/Ultra/performance.jpg'
      },
      {
        title: '奢华内饰',
        description: '半苯胺真皮座椅，航空铝饰板，全息投影仪表',
        image: '/models/Ultra/interior.jpg'
      }
    ])

    const scrollToModels = () => {
      if (appearanceSection.value) {
        appearanceSection.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }

    const selectModel = (model: UltraModel) => {
      selectedModel.value = model
    }

    const closeModal = () => {
      selectedModel.value = null
      document.body.style.overflow = 'auto'
    }

    const openReserveModal = () => {
      alert('预定系统即将上线!')
    }

    const initiateReservation = () => {
      if (selectedModel.value) {
        alert(`预定 ${selectedModel.value.name}`)
      }
    }

    return {
      ultraModels,
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
  <div class="ultra-page">
    <!-- 视频主页 -->
    <div class="ultra-hero">
      <video autoplay loop muted playsinline class="hero-video">
        <source src="/videos/ultra.mp4" type="video/mp4">
      </video>
      <div class="hero-overlay">
        <div class="hero-content">
          <h1>ULTRA HYPER SERIES</h1>
          <p class="hero-subtitle">Redefining Automotive Excellence</p>
          <div class="hero-actions">
            <button @click="scrollToModels" class="cta-button primary">探索极致</button>
            <button @click="openReserveModal" class="cta-button secondary">尊享预定</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 科技展示 -->
    <div class="tech-overview">
      <div class="grid" style="background-color: #00b4ff;"></div>
      <div class="tech-title">
        <h1>Aerodynamic Mastery</h1>
        <p>空气动力学 / 轻量化科技</p>
      </div>
      <div class="tech-grid">
        <div class="grid-card">
          <div class="grid-image-wrapper">
            <img src="" alt="空气动力学">
          </div>
          <div class="grid-content-wrapper">
            <div class="grid-text-card">
              <h3>主动流体力学系统</h3>
              <p>搭载48组可调式气动翼片，实时根据车速、转向角度和G值自动调整，配合底部主动扩散器实现近乎零升力的完美气动平衡。</p>
            </div>
            <div class="grid-card-footer">
              <router-link to="#" style="color: white;">技术详解 ▶</router-link>
            </div>
          </div>
        </div>
        <div class="grid-card">
          <div class="grid-image-wrapper">
            <img src="" alt="轻量化">
          </div>
          <div class="grid-content-wrapper">
            <div class="grid-text-card">
              <h3>全碳纤维单体壳</h3>
              <p>采用航空级T1100碳纤维材质，配合3D编织技术打造的一体式座舱结构，实现1580kg的超轻整备质量，抗扭刚度达到42,000Nm/deg。</p>
            </div>
            <div class="grid-card-footer">
              <router-link to="#" style="color: white;">材料科学 ▶</router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- 动力系统 -->
      <div class="tech-title">
        <p style="margin-top: 2rem">动力核心 / 传动科技</p>
      </div>
      <div class="tech-block">
        <div class="block-card">
          <div class="block-content-wrapper">
            <div class="block-text-card">
              <h3>混合动力单元</h3>
              <p>前置4.0L V8双涡轮增压发动机与后轴800V电机组成混合动力系统，综合输出功率达1220马力。配备F1衍生的ERS能量回收系统，可在全力加速时提供额外200马力的boost模式。</p>
              <p>8速双离合变速箱采用碳纤维同步环，换挡速度缩短至80毫秒，配合电子限滑差速器实现精准扭矩分配。</p>
            </div>
            <div class="block-card-footer">
              <router-link to="#" style="color: white;">动力详解 ▶</router-link>
            </div>
          </div>
          <div class="block-image-wrapper">
            <img src="" alt="动力系统">
          </div>
        </div>
        <div class="grid1" style="background-color: #00b4ff;"></div>
        <div class="block-card">
          <div class="block-image-wrapper">
            <img src="" alt="数字座舱">
          </div>
          <div class="block-content-wrapper">
            <div class="block-text-card">
              <h3>全息交互座舱</h3>
              <p>1. 驾驶模式选择：提供街道、运动、赛道、飘移四种预设模式<br>
                2. 全息HUD：将导航、性能参数投射至前风挡<br>
                3. 生物识别：通过方向盘传感器实时监测驾驶员状态<br>
                4. 智能助手：AI副驾可自动调整车辆设置</p>
            </div>
            <div class="block-card-footer">
              <router-link to="#" style="color: white;">交互科技 ▶</router-link>
            </div>
          </div>
        </div>
      </div>
      <div class="grid" style="background-color: #00b4ff;"></div>
    </div>

    <!-- 车型展示 -->
    <div class="ultra-models" ref="appearanceSection">
      <div class="models-title">
        <h1>ULTRA 车系</h1>
        <p>两种巅峰配置</p>
      </div>
      <div class="models-container">
        <div
            class="model-card"
            v-for="(model, index) in ultraModels"
            :key="index"
        >
          <div class="grid2" style="background-color: #001a26;"></div>
          <img class="model-image" :src="model.image" :alt="model.name">
          <div class="model-info">
            <h1>{{ model.name }}</h1>
            <div class="price-container">
              <div class="price">¥{{ model.price.toLocaleString() }}</div>
              <div class="price-note">起售价（含基础配置）</div>
            </div>
            <div class="specs">
              <p>整备质量：{{ model.weight }}kg</p>
              <p>动力单元：{{ model.engine }}</p>
              <p>最大马力：{{ model.horsepower }}</p>
              <p>峰值扭矩：{{ model.torque }}</p>
            </div>
          </div>
          <div class="action-buttons">
            <router-link to="#" class="detail-link">技术参数<span class="arrow">▶</span></router-link>
            <router-link to="#" class="build-link">高级定制<span class="arrow">▶</span></router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- 定制服务 -->
    <div class="customization">
      <h2>BESPOKE 高级定制</h2>
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
.ultra-page {
  color: rgba(255, 255, 255, 0.9);
  background: #001a26;
}

/* 动态渐变背景 */
.ultra-hero {
  background: linear-gradient(135deg, #001a26 0%, #003d5c 100%);
}

.cta-button.primary {
  background: rgba(0, 180, 255, 0.9);
  box-shadow: 0 0 15px rgba(0, 180, 255, 0.4);
}
.cta-button.secondary {
  border: 2px solid #00b4ff;
  color: #00b4ff;
}
.cta-button:hover {
  background: rgba(0, 180, 255, 0.7);
}

.models-container {
  background: linear-gradient(to right, #001a26, #002837);
  border: 1px solid rgba(0, 180, 255, 0.2);
}

.model-info h1 {
  color: #00b4ff;
  text-shadow: 0 0 10px rgba(0, 180, 255, 0.3);
}

.price {
  color: #00b4ff;
  font-size: 2.2rem;
}

.specs p {
  color: #8ab4c8;
}

/* 科技感边框效果 */
.grid-card, .block-card {
  border: 1px solid rgba(0, 180, 255, 0.3);
  background: rgba(0, 40, 60, 0.5);
  backdrop-filter: blur(10px);
}

/* 动态投影 */
.model-card:hover {
  box-shadow: 0 0 30px rgba(0, 180, 255, 0.2);
}

/* 响应式优化 */
@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 2.8rem;
  }

  .model-image {
    height: 200px;
  }

  .price {
    font-size: 1.8rem;
  }

  .specs p {
    font-size: 0.9rem;
  }

  .action-buttons a {
    padding: 10px 20px;
  }
}

/* 新增光晕效果 */
@keyframes halo {
  0% { opacity: 0.3; }
  50% { opacity: 0.6; }
  100% { opacity: 0.3; }
}

.models-title h1::after {
  content: "";
  position: absolute;
  width: 120%;
  height: 20px;
  background: radial-gradient(circle, rgba(0,180,255,0.4) 0%, transparent 70%);
  filter: blur(15px);
  animation: halo 3s ease-in-out infinite;
}
</style>
