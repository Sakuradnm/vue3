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

    const contentList = reactive([
      {
        title: 'Specifications',
        x: '45%',
        y: '5%',
        text: `*规格和设备如有变更，恕不另行通知。
        *3D 图像由计算机生成。实际颜色可能有所不同。
        *特殊油漆颜色或保护膜可能会影响车辆定价。
        *一些照片是合成图像。
        *制造商和经销商选项仅供参考。
        *价格为估算价格，不构成销售报价。
        *价格为制造商建议的零售价，截至 2024 年 3 月。
        *不包括税费、保险费、销售费和附加选项。`
      },
      {
        title: 'Heritage',
        x: '4%',
        y: '1%',
        text: `小米 SU7 Ultra 代表了小米汽车在性能领域的巅峰之作。
        它融合了最先进的电动技术和创新的设计理念，
        为驾驶者带来前所未有的驾驶体验。每一处细节都经过精心打造，
        完美诠释了"科技与艺术的完美结合"。`
      },
      {
        title: 'Track Package',
        x: '46%',
        y: '1%',
        text: `为赛道爱好者量身定制，提升车辆赛道性能。包含倍适登® EVO R for Ultra 绞牙减振器套装、ENDLESS® MA45B高性能制动片
        21 英寸锻造轮毂及配套的倍耐力®P ZERO™ 第五代高性能轮胎+同规格半热熔轮胎等，专为追求赛道极限驾驶的车手设计。`
      }
    ])

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
        appearanceSection.value.scrollIntoView({
          behavior: 'smooth',
          block: 'start' // 添加精确滚动定位
        })
      }
    }

    const selectModel = (model: UltraModel) => {
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
  <div class="car-page">
    <!-- 视频主页 -->
    <div class="car-hero">
      <video autoplay loop muted playsinline class="hero-video">
        <source src="/videos/ultra.mp4" type="video/mp4">
      </video>
      <div class="hero-overlay">
        <div class="hero-content">
          <h1>小米 SU7 ULTRA</h1>
          <p class="hero-subtitle">重新定义汽车卓越</p>
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
      <p>——————Discover the Ultra Legacy</p>
    </div>

    <!-- 汽车展示 -->
    <div class="car-overview">
      <div class="overview-box" v-for="(_, index) in 3" :key="index">
        <div class="overview-card">
          <div class="photos-content">
            <img :src="`/models/Ultra/show${index + 1}.jpg`" :alt="`ultra-overview-${index + 1}`">
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
        <p>空气动力学 / 巅峰动力</p>
      </div>
      <div class="appearance-grid">
        <div class="grid-card">
          <div class="grid-image-wrapper">
            <img src="/models/Ultra/1.jpg" alt="appearance and design">
          </div>
          <div class="grid-content-wrapper">
            <div class="grid-text-card">
              <h3>空气动力学设计</h3>
              <p>小米 SU7 Ultra 的外观设计融合了空气动力学原理，
                通过精心设计的车身线条和主动式空气动力学系统，
                实现了超低风阻系数，同时保持了极具未来感的视觉效果。</p>
            </div>
            <div class="grid-card-footer">
              <router-link to="#">详细内容 ▶</router-link>
            </div>
          </div>
        </div>
        <div class="grid-card">
          <div class="grid-image-wrapper">
            <img src="/models/Ultra/2.jpg" alt="appearance and design">
          </div>
          <div class="grid-content-wrapper">
            <div class="grid-text-card">
              <h3>巅峰动力性能</h3>
              <p>搭载与小米SU7 Ultra 原型车一致的超级三电机系统，三电机四驱驱动，爆发出 1548PS 的惊人马力！
                赛道级高功率电池包专为赛道工况打造， 1330kW 超强峰值放电性能，闭式双腔空气悬架系统，软硬调节区间更大，轻松应对赛道挑战。</p>
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
              <h3>智能座舱</h3>
              <p>基于小米澎湃OS 的互联互通能力，实现手机、车机、智能家居的深度互动。
                行业领先的小爱语音大模型，结合全车感知能力，带来更加丰富细腻的智能座舱体验。
                小米 SU7 Ultra 的内饰设计将科技与豪华完美融合：</p>
                <p>- 全息投影仪表盘
                - 智能语音控制系统
                - 自适应座椅
                - 环绕式音响系统
                - 智能氛围灯</p>
            </div>
            <div class="block-card-footer">
              <router-link to="#">详细内容 ▶</router-link>
            </div>
          </div>
          <div class="block-image-wrapper">
            <img src="/models/Ultra/3.jpg" alt="interior design">
          </div>
        </div>
        <div class="block-card">
          <div class="block-image-wrapper">
            <img src="/models/Ultra/4.jpg" alt="interior design">
          </div>
          <div class="block-content-wrapper">
            <div class="block-text-card">
              <h3>丰富的驾驶模式</h3>
              <p>专属「小米赛道大师APP」，内置赛道信息和圈速排行，支持全车的丰富的参数调整和显示，
                强大的圈速数据管理分析能力，帮助赛后分析复盘，进一步提升车手赛道表现。
                提供多种驾驶模式，包含 5 种街道模式，3 种赛道模式和
                2 种特殊模式，不同的悬架软硬、动力释放、转向力度等参数匹配，
                适应不同路况和驾驶需求，从新手到车手均可轻松驾驭。</p>
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
        <h1>Discover Your Ultra</h1>
        <p>两种极致配置</p>
      </div>
      <div class="models-container">
        <div
            class="model-card"
            v-for="(model, index) in ultraModels"
            :key="index"
        >
          <div class="grid2" style="background-color: rgb(1,10,14);"></div>
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
      <h2>Personalize Your Ultra</h2>
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
