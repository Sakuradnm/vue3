<script lang="ts">
import { defineComponent, ref, reactive } from 'vue'

// Define interfaces for type safety
interface GTRModel {
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
    title: 'Performance',
    x: '-4%',
    y: '25%',
    text: `GT-R跑车配备强大的3.8升双涡轮增压V6引擎，提供565马力和467磅英尺扭矩，
    0-60英里/小时加速仅需2.7秒。采用高级全轮驱动系统ATTESA E-TS，
    可根据驾驶条件实时调整前后动力分配，提供无与伦比的操控性和稳定性。
    GT-R NISMO由NISMO赛车部门调校，进一步提升了这款传奇超跑的性能极限。`
  },
  {
    title: 'Heritage',
    x: '51%',
    y: '10%',
    text: `日产GT-R继承了"哥斯拉"的传奇，从1969年首款Skyline GT-R到如今的R35，
    始终代表着日本汽车工业的巅峰技术。现代GT-R延续了Skyline系列的赛道DNA，
    同时融合了最新的空气动力学、电子控制和材料科学，成为街道合法的赛车。`
  },
  {
    title: 'Takumi Craftsmanship',
    x: '0%',
    y: '-5%',
    text: `每台GT-R引擎均由单一技师手工组装，被称为"Takumi"的大师级工匠在无尘室环境中精心打造每个部件。
    引擎盖上的签名铭牌证明了这一点。车身的每一处曲线不仅追求美学，更是为了优化空气动力学性能，
    降低风阻系数的同时提供足够的下压力。这种工匠精神使GT-R成为艺术与工程的完美结合。`
  }
])

const gtrModels = reactive<GTRModel[]>([
  {
    name: 'GT-R Premium',
    engine: '3.8L Twin-Turbo V6',
    image: '/models/GTR/GTR-Premium.jpg',
    price: 113540,
    torque: '467 lb-ft (633 Nm) at 3,300-5,800 rpm',
    horsepower: '565 HP (421 kW) at 6,800 rpm',
    weight: 1752
  },
  {
    name: 'GT-R NISMO',
    engine: '3.8L Twin-Turbo V6',
    image: '/models/GTR/GTR-NISMO.jpg',
    price: 210740,
    torque: '481 lb-ft (652 Nm) at 3,600-5,600 rpm',
    horsepower: '600 HP (447 kW) at 6,800 rpm',
    weight: 1720
  },
])

export default defineComponent({
  name: 'GTRPage',
  setup() {
    const selectedModel = ref<GTRModel | null>(null)
    const appearanceSection = ref<HTMLElement | null>(null)

    const customizationOptions = reactive<CustomizationOption[]>([
      {
        title: '外观',
        description: '空气动力学设计与碳纤维部件完美结合，提供最佳下压力与散热性能。',
        image: '/models/GTR/Appearance.jpg'
      },
      {
        title: '内饰',
        description: '精湛工艺与高级材质打造赛车风格座舱，提供极致驾驶体验与舒适性。',
        image: '/models/GTR/Trim.jpg'
      },
      {
        title: '性能',
        description: '专业赛道调校套件与定制化选项，进一步提升这款传奇超跑的极限性能。',
        image: '/models/GTR/Packages.jpg'
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

    const selectModel = (model: GTRModel) => {
      selectedModel.value = model
    }

    const closeModal = () => {
      selectedModel.value = null
      document.body.style.overflow = 'auto'
    }

    const openReserveModal = () => {
      alert('GT-R预约系统即将上线!')
    }

    const initiateReservation = () => {
      if (selectedModel.value) {
        alert(`预约 ${selectedModel.value.name}`)
      }
    }

    return {
      contentList,
      gtrModels,
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
        <source src="/videos/gtr.mp4" type="video/mp4">
      </video>
      <div class="hero-overlay">
        <div class="hero-content">
          <h1>NISSAN GT-R</h1>
          <p class="hero-subtitle">——Legendary performance, unmatched——</p>
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
      <p>——————探索GT-R视觉图鉴</p>
    </div>

    <!-- 汽车展示1 + 内饰框架1 -->
    <div class="car-showcase">
      <div class="photos-content">
        <img src="/models/GTR/show1.jpg">
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
          <h2>GT-R驾驶舱体验</h2>
          <p class="subtitle">————Racing Cockpit Design</p>
        </div>

        <!-- 主部件：内容区 -->
        <div class="main-section">
          <div class="image-column">
            <img src="/models/GTR/1.jpg" alt="内饰设计">
          </div>
          <div class="content-column">
            <div class="content-block">
              <h3>赛车风格驾驶舱</h3>
              <p>GT-R驾驶舱采用倾向驾驶者的中控设计，所有控制按钮触手可及。真皮与Alcantara®材质座椅提供极佳的侧向支撑力，
                确保驾驶者在高速过弯时保持最佳位置，同时兼顾长途驾驶的舒适性。</p>
            </div>
            <div class="content-block">
              <h3>先进技术融合</h3>
              <p>8英寸触控屏幕整合导航系统和驾驶模式选择，同时提供专为GT-R设计的性能监测系统，
                可实时显示发动机油温、涡轮增压压力、传动系统工作状态等关键数据，让驾驶者随时掌握车辆状态。</p>
            </div>
          </div>
        </div>

        <!-- 副部件：底部说明区 -->
        <div class="sub-section footer-section">
          <p>精湛工艺与最先进技术的完美结合，打造极致驾驶体验</p>
        </div>
      </div>
    </div>

    <!-- 汽车展示2 + 内饰框架2 -->
    <div class="car-showcase">
      <div class="photos-content">
        <img src="/models/GTR/show2.jpg" alt="gtr-overview-2">
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
          <h2>工程与艺术的结合</h2>
          <p class="subtitle">————Engineering Excellence</p>
        </div>

        <!-- 主部件：内容区（镜像布局） -->
        <div class="main-section">
          <div class="image-column">
            <img src="/models/GTR/2.jpg" alt="工程设计">
          </div>
          <div class="content-column">
            <div class="content-block">
              <h3>高级材质选择</h3>
              <p>NISMO版本采用碳纤维Recaro®赛车座椅，减轻重量同时提供极佳支撑性。中控台和门板采用手工缝制的高级真皮包裹，
                触感细腻，彰显豪华质感。</p>
            </div>
            <div class="content-block">
              <h3>驾驶者为中心</h3>
              <p>人体工程学方向盘带有红色中心标记，提供精准转向反馈。换挡拨片采用镁合金材质，
                冷触感与精准操作感受完美结合，实现赛车级别的换挡体验。</p>
            </div>
          </div>
        </div>

        <!-- 副部件：底部说明区 -->
        <div class="sub-section footer-section">
          <p>每个细节都经过精心打造，为驾驶者提供直观、精确的操控体验</p>
        </div>
      </div>
    </div>

    <!-- 汽车展示3 + 外观框架 -->
    <div class="car-showcase">
      <div class="photos-content">
        <img src="/models/GTR/show3.jpg" alt="gtr-overview-3">
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
          <h2>空气动力学优化</h2>
          <p class="subtitle">————Aerodynamic Perfection</p>
        </div>

        <!-- 双列布局 -->
        <div class="grid-cols-2">
          <!-- 左列：上图下文 -->
          <div class="card">
            <div class="card-top">
              <img src="/models/GTR/3.jpg">
            </div>
            <div class="card-bottom">
              <h3>高性能轮毂设计</h3>
              <p>20英寸锻造铝合金轮毂采用Y型辐条设计，不仅减轻非簧载质量，还提供最佳的散热性能。
                搭配专为GT-R开发的Dunlop SP Sport MAXX GT600 DSST CTT高性能轮胎，提供超凡的抓地力与操控精准度。</p>
            </div>
          </div>

          <!-- 右列：文下图 -->
          <div class="card reverse">
            <div class="card-bottom">
              <img src="/models/GTR/4.jpg">
            </div>
            <div class="card-top">
              <h3>碳纤维空气组件</h3>
              <p>NISMO版本配备碳纤维前后扰流板、侧裙和大型尾翼，不仅降低车重，更提供显著的下压力增益。
                前保险杠进气口经过赛道验证的设计，优化引擎和制动系统的冷却效率，同时减少前轮周围的湍流。</p>
            </div>
          </div>
        </div>

        <!-- 底部说明 -->
        <div class="sub-section footer-section">
          <p>每一处设计都通过计算流体力学分析和风洞测试验证，实现极致性能</p>
        </div>
      </div>
    </div>

    <!-- Models Section -->
    <div class="gtr-models">
      <div class="gtr-models-title" ref="appearanceSection">
        <h1>选择您的GT-R</h1>
        <p>两种卓越车型，彰显不同个性</p>
      </div>
      <div class="models-container">
        <div
            class="model-card"
            v-for="(model, index) in gtrModels"
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
      <h2>定制您的GT-R</h2>
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

/* GTR特定样式 - 灰色为主，黑色为主题 */
.car-page {
  color: rgba(230, 230, 230, 0.9);
  background: #111111;
}

.hero-content h1 {
  font-size: 4.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 5px 5px 2px hsl(0, 0%, 20%),
  5px 0 2px hsla(0, 0%, 100%, 0.47),
  0 0 50px hsla(0, 0%, 70%, 0.99);
}

.hero-subtitle {
  font-size: 2rem;
  margin-bottom: 2rem;
  text-shadow: 5px 5px 2px hsl(0, 0%, 20%),
  5px 0 2px hsla(0, 0%, 100%, 0.47),
  0 0 50px hsla(0, 0%, 70%, 0.99);
}

.cta-button.primary {
  background: rgba(70, 70, 70, 0.6);
  color: #ffffff;
  text-shadow: 0 1px 10px hsla(0, 0%, 0%, 0.7);
  border: 2px solid rgba(160, 160, 160, 0.4);
}

.cta-button.secondary {
  background: transparent;
  color: #aaaaaa;
  border: 2px solid rgba(180, 180, 180, 0.8);
}

.cta-button:hover {
  border: 2px solid rgba(255, 255, 255, 0.37);
  background: rgba(100, 100, 100, 0.5);
}

.gallery-header {
  background: linear-gradient(
      to bottom,
      rgb(0, 0, 0) 40%,
      rgb(30, 30, 30) 100%
  );
  color: rgba(230, 230, 230, 0.9);
  text-shadow: -5px 4px 4px hsla(0, 0%, 40%, 0.45),
  7px 2px 8px hsla(0, 0%, 30%, 0.61),
  2px 0 50px hsl(0, 0%, 50%);
}

.gallery-header p {
  color: rgba(200, 200, 200, 0.7);
  text-shadow: 0 0 2px hsl(0, 0%, 100%),
  0 2px 2px hsla(0, 0%, 60%, 0.82),
  2px 0 5px hsl(0, 0%, 40%);
}

.interior-frame {
  background: #151515;
}

.header-section h2 {
  color: #e6e6e6;
  text-shadow: 5px 5px 2px hsl(0, 0%, 20%),
  5px 0 2px hsla(0, 0%, 100%, 0.47),
  0 0 50px hsla(0, 0%, 70%, 0.99);
}

.header-section .subtitle {
  color: rgba(170, 170, 170, 0.8);
}

.content-block {
  background: rgba(60, 60, 60, 0.2);
  border: 1px solid rgba(100, 100, 100, 0.24);
}

.content-block h3 {
  color: #e6e6e6;
}

.card-top {
  background: linear-gradient(to left, rgba(70, 70, 70, 0.1), transparent);
}

.card-bottom {
  background: linear-gradient(to right, rgba(70, 70, 70, 0.1), transparent);
}

.gtr-models {
  background-image: linear-gradient(to bottom, rgb(20, 20, 20), rgb(230, 230, 230));
}

.gtr-models-title h1 {
  text-shadow: 5px 5px 2px hsl(0, 0%, 20%),
  5px 0 2px hsla(0, 0%, 100%, 0.47),
  0 0 50px hsla(0, 0%, 70%, 0.41);
}

.model-card {
  background: white;
}

.detail-link:hover {
  color: rgba(80, 80, 80, 0.71);
}

.build-link {
  border: 2px solid rgba(70, 70, 70, 0.54);
  background: rgba(120, 120, 120, 0.29);
}

.build-link:hover {
  border: 2px solid rgba(40, 40, 40, 0.47);
  background: rgba(50, 50, 50, 0.58);
  color: rgba(230, 230, 230, 0.9);
}

.customization {
  background-image: linear-gradient(to top, rgb(20, 20, 20), rgb(230, 230, 230));
}

.customization h2 {
  text-shadow: 5px 5px 2px hsl(0, 0%, 20%),
  5px 0 2px hsla(0, 0%, 100%, 0.47),
  0 0 50px hsla(0, 0%, 70%, 0.4);
}

/* 内饰框架 */
.interior-frame img {
  border-radius: 8px;
  box-shadow: 0 8px 30px rgba(150, 150, 150, 0.2);
}

/* 照片文本框样式调整 */
.text-box {
  background: rgba(30, 30, 30, 0.65);
  backdrop-filter: blur(5px);
}

.text-box h1 {
  color: #e6e6e6;
}

.text-box p {
  color: rgba(220, 220, 220, 0.9);
}
</style>