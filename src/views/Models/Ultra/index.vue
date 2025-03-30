<script lang="ts">
import { defineComponent, ref, reactive } from 'vue'

// Define interfaces for type safety
interface SU7Model {
  name: string
  engine: string
  image: string
  price: number
  torque: string
  horsepower: string
  weight: number
  range: string
}

interface CustomizationOption {
  title: string;
  description: string;
  image: string;
}

const contentList = reactive([
  {
    title: '极速性能',
    x: '-4%',
    y: '25%',
    text: `SU7 ULTRA 配备强大的双电机全轮驱动系统，可提供 1,075 马力和令人惊叹的 0-100 km/h 2.78 秒加速能力，
    超越特斯拉 Model S Plaid。为了实现更精确的高速稳定性，SU7 ULTRA 采用了主动式空气动力学系统和自适应悬挂，
    结合碳纤维车身部件，打造出赛道级别的操控体验。`
  },
  {
    title: '创新科技',
    x: '51%',
    y: '10%',
    text: `2025 SU7 ULTRA 搭载最新一代自动驾驶系统，通过高性能计算芯片和超过 20 个传感器，提供 L3 级别自动驾驶功能。
    独特的无线充电技术和全息触控显示屏带来了科技与奢华的完美融合，让驾驶者体验未来出行方式。`
  },
  {
    title: '豪华体验',
    x: '0%',
    y: '-5%',
    text: `SU7 ULTRA 采用最高级别的内饰材质和工艺，带来豪华轿跑的顶级舒适感受。
    座舱采用环保可持续材质，搭配 21 扬声器高保真音响系统，提供剧院级的声音体验。
    同时，标配的主动降噪系统创造出一个宁静的驾乘环境，即使高速行驶也能保持车内的宁静感。`
  }
])

const su7Models = reactive<SU7Model[]>([
  {
    name: 'SU7 ULTRA Performance',
    engine: '双电机全轮驱动',
    image: '/models/Ultra/Ultra-Performance.jpg',
    price: 549900,
    torque: '1,040 Nm',
    horsepower: '1,075 HP (800 kW)',
    weight: 2160,
    range: '800 km (CLTC)'
  },
  {
    name: 'SU7 ULTRA Max Range',
    engine: '双电机全轮驱动',
    image: '/models/Ultra/SU7-Ultra-Max.jpg',
    price: 588800,
    torque: '950 Nm',
    horsepower: '915 HP (675 kW)',
    weight: 2210,
    range: '1,000 km (CLTC)'
  },
])

export default defineComponent({
  name: 'SU7UltraPage',
  setup() {
    const selectedModel = ref<SU7Model | null>(null)
    const appearanceSection = ref<HTMLElement | null>(null)

    const customizationOptions = reactive<CustomizationOption[]>([
      {
        title: '跑车外观',
        description: '空气动力学设计与碳纤维元素融合，动感姿态展现电动超跑魅力。',
        image: '/models/Ultra/Appearance.jpg'
      },
      {
        title: '豪华内饰',
        description: '环保材质与奢华工艺完美结合，营造舒适与科技并存的驾驶舱体验。',
        image: '/models/Ultra/Trim.jpg'
      },
      {
        title: '驾驶模式',
        description: '多种驾驶模式适应不同路况与驾驶需求，从舒适通勤到激情赛道均可从容应对。',
        image: '/models/Ultra/Packages.jpg'
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

    const selectModel = (model: SU7Model) => {
      selectedModel.value = model
    }

    const closeModal = () => {
      selectedModel.value = null
      document.body.style.overflow = 'auto'
    }

    const openReserveModal = () => {
      alert('预约系统即将推出!')
    }

    const initiateReservation = () => {
      if (selectedModel.value) {
        alert(`正在预订 ${selectedModel.value.name}`)
      }
    }

    return {
      contentList,
      su7Models,
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
        <source src="/videos/ultra.mp4" type="video/mp4">
      </video>
      <div class="hero-overlay">
        <div class="hero-content">
          <h1>SU7 ULTRA</h1>
          <p class="hero-subtitle">——Ultimate electric performance——</p>
          <div class="hero-actions">
            <button @click="scrollToModels" class="cta-button primary">探索车型</button>
            <button @click="openReserveModal" class="cta-button secondary">立即预约</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 标题区域 -->
    <div class="gallery-header">
      Ultra Experience
      <p>——————探索SU7 ULTRA视觉图鉴</p>
    </div>

    <!-- 汽车展示1 + 内饰框架1 -->
    <div class="car-showcase">
      <div class="photos-content">
        <img src="/models/Ultra/show1.jpg">
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
          <h2>未来科技驾驶舱</h2>
          <p class="subtitle">————Next Generation Cockpit</p>
        </div>

        <!-- 主部件：内容区 -->
        <div class="main-section">
          <div class="image-column">
            <img src="/models/Ultra/1.jpg" alt="内饰设计">
          </div>
          <div class="content-column">
            <div class="content-block">
              <h3>全息显示技术</h3>
              <p>ULTRA版本配备16.8英寸曲面OLED触控屏和全息抬头显示系统，所有关键信息直观呈现，
                让驾驶者能够在不移开视线的情况下获取所需信息，提升行车安全性。</p>
            </div>
            <div class="content-block">
              <h3>豪华功能</h3>
              <p>SU7 ULTRA内饰采用高级环保材质，配备零重力座椅，提供多达15种按摩模式和通风加热功能。
                车内集成环境氛围灯系统，可根据驾驶模式和音乐自动调节灯光氛围。</p>
            </div>
          </div>
        </div>

        <!-- 副部件：底部说明区 -->
        <div class="sub-section footer-section">
          <p>全息触控界面提供直观的操作体验，无需复杂菜单即可控制车辆各项功能</p>
        </div>
      </div>
    </div>

    <!-- 汽车展示2 + 内饰框架2 -->
    <div class="car-showcase">
      <div class="photos-content">
        <img src="/models/Ultra/show2.jpg" alt="su7-overview-2">
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
          <h2>智能交互系统</h2>
          <p class="subtitle">————AI-Powered Experience</p>
        </div>

        <!-- 主部件：内容区（镜像布局） -->
        <div class="main-section">
          <div class="image-column">
            <img src="/models/Ultra/2.jpg" alt="智能交互系统">
          </div>
          <div class="content-column">
            <div class="content-block">
              <h3>人工智能助手</h3>
              <p>SU7 ULTRA搭载先进的AI语音助手，支持自然语言交互和情境感知，让车辆操控变得更加直观和简单...</p>
            </div>
            <div class="content-block">
              <h3>个性化设置</h3>
              <p>车辆能够学习驾驶者的习惯和偏好，自动调整座椅、空调、音乐和驾驶模式，提供真正个性化的驾驶体验...</p>
            </div>
          </div>
        </div>

        <!-- 副部件：底部说明区 -->
        <div class="sub-section footer-section">
          <p>AI系统每次驾驶都会学习和优化，随着使用时间的增加，体验将不断提升</p>
        </div>
      </div>
    </div>

    <!-- 汽车展示3 + 外观框架 -->
    <div class="car-showcase">
      <div class="photos-content">
        <img src="/models/Ultra/show3.jpg" alt="su7-overview-3">
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
          <h2>超跑级外观设计</h2>
          <p class="subtitle">————Supercar Aesthetics</p>
        </div>

        <!-- 双列布局 -->
        <div class="grid-cols-2">
          <!-- 左列：上图下文 -->
          <div class="card">
            <div class="card-top">
              <img src="/models/Ultra/3.jpg">
            </div>
            <div class="card-bottom">
              <h3>性能轮毂设计</h3>
              <p>21英寸锻造铝合金轮毂采用空气动力学优化设计，减少风阻的同时提升制动系统散热效率。
                配备高性能米其林PS4 S轮胎，提供卓越的抓地力与操控稳定性，同时保持舒适的日常驾驶体验。</p>
            </div>
          </div>

          <!-- 右列：文下图 -->
          <div class="card reverse">
            <div class="card-bottom">
              <img src="/models/Ultra/4.jpg">
            </div>
            <div class="card-top">
              <h3>主动空气动力学系统</h3>
              <p>SU7 ULTRA配备可调节后扰流板和主动式进气格栅，能够根据速度和驾驶模式自动调整，优化空气动力学性能。
                在高速模式下，系统能提供最多35%的下压力增益，大幅提升高速稳定性和弯道表现。</p>
            </div>
          </div>
        </div>

        <!-- 底部说明 -->
        <div class="sub-section footer-section">
          <p>所有空气动力学组件均经过风洞测试和赛道验证，确保最佳性能</p>
        </div>
      </div>
    </div>

    <!-- Models Section -->
    <div class="gtr-models">
      <div class="gtr-models-title" ref="appearanceSection">
        <h1>Choose your SU7 ULTRA</h1>
        <p>Two top performance configurations</p>
      </div>
      <div class="models-container">
        <div
            class="model-card"
            v-for="(model, index) in su7Models"
            :key="index"
        >
          <div class="grid2" style="background-color: rgb(26, 26, 0);"></div>
          <img class="model-image" :src="model.image" :alt="model.name">
          <div class="model-info">
            <h1>{{ model.name }}</h1>
            <div class="price-container">
              <div class="price">${{ model.price.toLocaleString() }}</div>
              <div class="price-note">建议零售价*</div>
            </div>
            <div class="specs">
              <p>车重：{{ model.weight }}kg</p>
              <p>动力系统：{{ model.engine }}</p>
              <p>功率：{{ model.horsepower }}</p>
              <p>扭矩：{{ model.torque }}</p>
              <p>续航里程：{{ model.range }}</p>
            </div>
          </div>
          <div class="action-buttons">
            <router-link to="#" class="detail-link">查看更多<span class="arrow">▶</span></router-link>
            <router-link to="#" class="build-link">定制我的车 <span class="arrow">▶</span></router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Customization Section -->
    <div class="customization">
      <h2>个性化您的SU7 ULTRA</h2>
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
/* 重写样式，以黄色为主题 */
.interior-frame {
  background: #000000;
}
.interior-frame img {
  border-radius: 8px;
  box-shadow: 0 8px 30px rgba(255, 215, 0, 0.3);
}
.hero-content h1 {
  text-shadow: 5px 5px 2px hsl(51, 100%, 40%),
  5px 0 2px hsla(0, 0%, 100%, 0.47),
  0 0 50px hsla(51, 100%, 50%, 0.99);
}
.hero-subtitle {
  text-shadow: 5px 5px 2px hsl(51, 100%, 40%),
  5px 0 2px hsla(0, 0%, 100%, 0.47),
  0 0 50px hsla(51, 100%, 50%, 0.99);
}
.cta-button.primary {
  background: rgba(255, 215, 0, 0.47);
  color: #000000;
  text-shadow: 0 1px 10px hsla(0, 0%, 0%, 0.3);
  font-weight: bold;
}
.cta-button.secondary {
  color: #ffd700;
  border: 2px solid #ffd700;
}
.gallery-header {
  text-shadow: -5px 4px 4px hsla(51, 100%, 50%, 0.45),
  7px 2px 8px hsla(51, 100%, 40%, 0.61),
  2px 0 50px hsl(51, 100%, 50%);
}
.gallery-header p {
  text-shadow: 0 0 2px hsl(0, 0%, 100%),
  0 2px 2px hsla(51, 100%, 51%, 0.82),
  2px 0 5px hsl(51, 100%, 40%);
}
.header-section h2 {
  text-shadow: 5px 5px 2px hsl(51, 100%, 40%),
  5px 0 2px hsla(0, 0%, 100%, 0.47),
  0 0 50px hsla(51, 100%, 50%, 0.99);
}
.header-section .subtitle {
  color: rgba(255, 215, 0, 0.8);
}
.card-top {
  background: linear-gradient(to left, rgba(255, 215, 0, 0.08), transparent);
}
.card-bottom {
  background: linear-gradient(to right, rgba(255, 215, 0, 0.08), transparent);
}
.gtr-models {
  background-image: linear-gradient(to bottom, rgb(0, 0, 0), rgb(26, 26, 0));
}
.gtr-models-title h1 {
  text-shadow: 5px 5px 2px hsl(51, 100%, 40%),
  5px 0 2px hsla(0, 0%, 100%, 0.47),
  0 0 50px hsla(51, 100%, 50%, 0.41);
}
.models-container {
  background-color: rgb(20, 20, 0);
}
.models-container::before {
  background: rgb(255, 215, 0);
}
.model-card {
  background: rgb(20, 20, 0);
}
.model-info h1 {
  color: #ffd700;
}
.price {
  color: #ffffff;
}
.price-note {
  color: rgb(255, 215, 0);
}
.specs p {
  color: #dddddd;
}
.detail-link, .build-link {
  background: rgba(255, 215, 0, 0.1);
  color: #ffd700;
}
.build-link {
  border: 2px solid rgba(255, 215, 0, 0.54);
  background: rgba(26, 26, 0, 0.5);
}
.detail-link:hover {
  color: rgba(255, 215, 0, 0.71);
}
.build-link:hover {
  border: 2px solid rgba(255, 215, 0, 0.8);
  background: rgba(40, 40, 0, 0.8);
  color: rgba(255, 215, 0, 1);
}
.customization {
  background-image: linear-gradient(to top, rgb(0, 0, 0), rgb(26, 26, 0));
}
.customization h2 {
  text-shadow: 5px 5px 2px hsl(51, 100%, 40%),
  5px 0 2px hsla(0, 0%, 100%, 0.47),
  0 0 50px hsla(51, 100%, 50%, 0.4);
}
.content-block {
  background: rgba(26, 26, 0, 0.3);
  border: 1px solid rgba(255, 215, 0, 0.24);
}
</style>