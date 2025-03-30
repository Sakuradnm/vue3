<script lang="ts">
import { defineComponent, ref, reactive } from 'vue'

// 定义接口来明确类型
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

const gtrModels = reactive<GTRModel[]>([
  {
    name: 'GTR-Premium',
    engine: 'VR38DETT V6',
    image: '/models/Gtr/GTR-Premium.jpg',
    price: 103372,
    torque: '451 lb-ft (612 Nm) at 3,200-6,000 rpm',
    horsepower: '523 HP (390 kW) at 6,400 rpm',
    weight: 1247
  },
  {
    name: 'GTR-Nismo',
    engine: 'VR38DETT V6',
    image: '/models/Gtr/GTR-Nismo.jpg',
    price: 199523,
    torque: '481 lb-ft (652 Nm) at 3,200-5,200 rpm',
    horsepower: '545 HP (405 kW) at 6,300 rpm',
    weight: 1740
  },
])
export default defineComponent({
  name: 'GTRPage',
  setup() {
    // 使用泛型和接口明确类型
    const selectedModel = ref<GTRModel | null>(null)
    const appearanceSection = ref<HTMLElement | null>(null)


    const contentList = reactive([
      {
        title: 'Specifications',
        x: '45%',
        y: '1%',
        text: `GT-R 从出厂开始就要求极高的性能和可靠性。
        至关重要的是轮胎能够在任何可能的情况下支撑惯性载荷，并在超高速转弯和制动时始终提供稳定的抓地力。
        我们选择防爆轮胎是因为它们本身侧壁较厚，能够承受高负荷。
        与住友橡胶共同开发的DUNLOP SPSPORT MAXX GT 600 DSST，专为承受赛道驾驶而设计，这是作为GT-R诞生的汽车的命运。`
      },
      {
        title: 'Heritage',
        x: '5%',
        y: '10%',
        text: `多年来，我们在纽博格林赛道学到的是软式长行程悬架的有效性。
        这提高了轮胎在起伏路面上的跟随能力，使驾驶员能够充分利用抓地力。
        因此，转向修正量减少，使驾驶员能够根据需要控制车辆，同时减少疲劳。
        同时，车辆的垂直重力波动减小，从而形成可提供高品质乘坐体验的悬架。`
      },
      {
        title: 'Track Package',
        x: '45%',
        y: '1%',
        text: `当悬架与轻的非悬挂重量相结合时，其真正的威力才能显现出来。
        与赛车运动领域享有盛誉的公司 Rays 合作开发的铝锻造车轮结合了高刚性和轻量化设计。
        优化的形状提供了优异的单位质量车轮表面刚度。据说减少1公斤非簧载重量就相当于减少10公斤簧载重量。
        通过平稳吸收不平坦路面的冲击，它可以提高轮胎的跟踪能力并有助于舒适的驾驶。`
      }
    ])

    const customizationOptions = reactive<CustomizationOption[]>([
      {
        title: '外观',
        description: '采用碳纤维，因显示环境的不同，机身颜色可能与实际颜色出现差异。',
        image: '/models/Gtr/Appearance.jpg'
      },
      {
        title: '内饰',
        description: '采用以表面而非点来支撑上身的座椅结构，提供高品质的舒适感。',
        image: '/models/Gtr/Trim.jpg'
      },
      {
        title: '性能',
        description: '自诞生的那一刻起就势不可挡，自首次亮相以来，不断得到不懈的改进，',
        image: '/models/Gtr/Packages.jpg'
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
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <div class="car-page">
    <!-- 视频主页 -->
    <div class="car-hero">
      <video autoplay loop muted playsinline class="hero-video">
        <source src="/videos/gtr.mp4" type="video/mp4">
      </video>
      <div class="hero-overlay">
        <div class="hero-content">
          <h1>NISSAN GT-R</h1>
          <p class="hero-subtitle">The Ultimate Performance Machine</p>
          <div class="hero-actions">
            <button @click="scrollToModels" class="cta-button primary">探索车型</button>
            <button @click="openReserveModal" class="cta-button secondary">立即预约</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 标题区域 -->
    <div class="gallery-header" style="background-color: rgb(1,10,14)">Gallery Presentation
      <p>——————探索GT-R视觉图鉴</p>
    </div>

    <!-- 汽车展示 -->
    <div class="car-overview">
      <div class="overview-box" v-for="(_, index) in 3" :key="index">
        <div class="overview-card">
          <div class="photos-content">
            <img :src="`/models/Gtr/show${index + 1}.jpg`" :alt="`gtr-overview-${index + 1}`">
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
      <!-- 1 -->
      <div class="grid" style="background-color: rgb(255,255,255);"></div>
      <div class="appearance-title">
        <h1>Appearance and design</h1>
        <p>外观 / 轮胎和轮毂</p>
      </div>
      <div class="appearance-grid">
        <div class="grid-card">
            <div class="grid-image-wrapper">
              <img src="/models/Gtr/1.jpg" alt="appearance and design">
            </div>
            <div class="grid-content-wrapper">
              <div class="grid-text-card" >
                <h3>铝合金锻造轮毂</h3>
                <p>选择防爆轮胎是因为它们本身侧壁较厚，能够承受高负荷。
                  与住友橡胶共同开发，专为承受赛道驾驶而设计，这是作为GT-R诞生的汽车的命运。</p>
              </div>
              <div class="grid-card-footer">
                <router-link to="#">详细内容 ▶</router-link>
              </div>
            </div>
        </div>
        <div class="grid-card">
            <div class="grid-image-wrapper">
              <img src="/models/Gtr/2.jpg" alt="appearance and design">
            </div>
            <div class="grid-content-wrapper">
              <div class="grid-text-card">
                <h3>钛合金消声器</h3>
                <p>全新钛合金消声器，可产生令人着迷的喷气声音。
                  饰面经过热处理，重现了钛金属独有的精致蓝色。它可减少压力损失并有助于提高动力性能。</p>
              </div>
              <div class="grid-card-footer">
                <router-link to="#">详细内容 ▶</router-link>
              </div>
            </div>
        </div>
      </div>

      <!-- 2 -->
      <div class="appearance-title">
        <p style="margin-top: 2rem">座椅 / 驾驶舱</p>
      </div>
      <div class="appearance-block">
        <div class="block-card">
          <div class="block-content-wrapper">
            <div class="block-text-card">
              <h3>内饰由工匠精心打造并由工艺大师完成</h3>
              <p >纳帕皮革*被称为高品质真皮。除此以外，仪表板的顶面上粘贴了一大块精心挑选的皮革。无缝的“一体式”生产需要熟练工匠的先进技术。</p>
              <p>此外，整个车内都采用了复杂的缝线，包括手工缝制的座椅装饰。 高品质的驾驶舱使人们能够平静、舒适地驾驶这款卓越的超级跑车。</p>
              <p style="font-size: 0.7rem">蓝色天堂内饰（前后半苯胺皮革座椅）+ Nappa 皮革仪表板，时尚内饰（前后半苯胺皮革座椅）+ Nappa 皮革仪表板（GT-R Premium 版制造商选项）。</p>
            </div>
            <div class="block-card-footer">
              <router-link to="#">详细内容 ▶</router-link>
            </div>
          </div>
          <div class="block-image-wrapper">
            <img src="/models/Gtr/3.jpg" alt="appearance and design">
          </div>
        </div>
        <div class="grid1" style="background-color: rgb(255,255,255);"></div>
        <div class="block-card">
          <div class="block-image-wrapper">
            <img src="/models/Gtr/4.jpg" alt="appearance and design">
          </div>
          <div class="block-content-wrapper">
            <div class="block-text-card">
              <h3>按功能划分的驾驶舱</h3>
              <p style="font-size: 1rem;">驾驶舱的设计非常适合日常超高速驾驶，分为四个区域：</p>
              <p>1.起始区域 ：使从发动机启动到行车前的一系列操作能够安全、顺畅地行驶。</p>
              <P>2.司机操作区 ：驾驶员无需改变驾驶姿势即可设定开关和操作换挡拨片，提高注意力。</P>
              <p>3.可视性和信息区 ：车门后视镜、组合仪表和多功能仪表水平放置，以避免混淆。我们还特别注意灯光的亮度，以提高即时可见度。</p>
              <p>4.乘客座位接待区 ：门把手、扶手和其他功能为乘客营造出豪华和舒适的感觉。</p>
            </div>
            <div class="block-card-footer">
              <router-link to="#" >详细内容 ▶</router-link>
            </div>
          </div>
        </div>
      </div>
      <div class="grid" style="background-color: rgb(255,255,255);"></div>
    </div>

    <!-- 车型展示 -->
    <div class="gtr-models" >
      <div class="gtr-models-title" ref="appearanceSection">
        <h1>Discover Your GT-R</h1>
        <p>2 unique grades to choose from</p>
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
            <router-link to="#" class="build-link">Build It<span class="arrow">▶</span></router-link>
          </div>
        </div>

      </div>
    </div>
    <div class="grid" style="background-color: rgb(1,10,14);"></div>



    <!-- 客户改车 -->
    <div class="customization">
      <h2>Personalize Your GT-R</h2>
      <div class="customization-grid">
        <div
            v-for="(option, index) in customizationOptions"
            :key="index"
            class="custom-option"
        >
          <img :src="option.image" :alt="option.title">
          <div class="option-overlay">
            <h3>{{option.title }}</h3>
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
