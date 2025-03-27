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


    const customizationOptions = reactive<CustomizationOption[]>([
      {
        title: 'Exterior Colors',
        description: 'Choose from exclusive color palettes',
        image: '/models/Gtr/gt-r.jpg'
      },
      {
        title: 'Interior Trim',
        description: 'Premium leather and carbon fiber options',
        image: '/models/Gtr/Trim.jpg'
      },
      {
        title: 'Performance Packages',
        description: 'Enhance your GT-R\'s capabilities',
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
  <div class="gtr-page">
    <!-- 视频主页 -->
    <section class="gtr-hero">
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
    </section>


    <!-- 外观设计 -->
    <section class="appearance-overview">
      <!-- 1 -->
      <div class="grid" style="background-color: rgb(255,255,255);"></div>
      <div class="appearance-title">
        <h1>Appearance and design</h1>
        <p>外观 / 轮胎和轮毂</p>
      </div>
      <div class="appearance-grid" style="display: grid">
        <div class="grid-card">
          <img src="/models/Gtr/1.jpg" alt="appearance and design">
          <div class="text-card" >
            <h3 style="margin: 1rem 0 1rem -4rem;">Rays 铝合金锻造轮毂</h3>
            <p style="margin: 1rem 0.5rem 1rem -3rem;">我们选择防爆轮胎是因为它们本身侧壁较厚，能够承受高负荷。
              与住友橡胶共同开发的DUNLOP SPSPORT MAXX GT 600 DSST，专为承受赛道驾驶而设计，这是作为GT-R诞生的汽车的命运。</p>
          </div>
          <router-link to="#" style="color: white; margin-left: 10px">详细内容 ▶</router-link>
        </div>
        <div class="grid-card">
          <img src="/models/Gtr/2.jpg" alt="appearance and design">
          <div class="text-card">
            <h3 style="margin: 1rem 0 1rem -4rem;">FUJITSUBO钛合金消声器</h3>
            <p style="margin: 1rem 0.5rem 1rem -3rem;">全新钛合金消声器，可产生令人着迷的喷气声音。饰面经过热处理，重现了钛金属独有的精致蓝色。它可减少压力损失并有助于提高动力性能。</p>
          </div>
          <router-link to="#" style="color: white; margin-left: 10px">详细内容 ▶</router-link>
        </div>
      </div>

      <!-- 2 -->
      <div class="appearance-title">
        <p style="margin-top: 2rem">座椅 / 驾驶舱</p>
      </div>
      <div class="appearance-block">
        <div class="block-card">
          <div class="text-card" style="margin: 3rem 2rem 0 0">
            <h3 style="margin: 0 0 1rem -1rem;">内饰由工匠精心打造并由工艺大师完成</h3>
            <p >纳帕皮革*被称为高品质真皮。除此以外，仪表板的顶面上粘贴了一大块精心挑选的皮革。无缝的“一体式”生产需要熟练工匠的先进技术。</p>
            <p>此外，整个车内都采用了复杂的缝线，包括手工缝制的座椅装饰。 高品质的驾驶舱使人们能够平静、舒适地驾驶这款卓越的超级跑车。</p>
            <p style="font-size: 0.7rem">蓝色天堂内饰（前后半苯胺皮革座椅）+ Nappa 皮革仪表板，时尚内饰（前后半苯胺皮革座椅）+ Nappa 皮革仪表板（GT-R Premium 版制造商选项）。</p>
            <router-link to="#" style="color: white">详细内容 ▶</router-link>
          </div>
          <img src="/models/Gtr/3.jpg" alt="appearance and design">
        </div>
        <div class="block-card">
          <img src="/models/Gtr/4.jpg" alt="appearance and design">
          <div class="text-card">
            <h3 style="margin: 0 0 1rem -1rem">按功能划分的驾驶舱</h3>
            <p style="font-size: 1rem;margin: 0 0 0 -0.5rem;">驾驶舱的设计非常适合日常超高速驾驶，分为四个区域：</p>
            <p>1.起始区域 ：使从发动机启动到行车前的一系列操作能够安全、顺畅地行驶。</p>
            <P>2.司机操作区 ：驾驶员无需改变驾驶姿势即可设定开关和操作换挡拨片，提高注意力。</P>
            <p>3.可视性和信息区 ：车门后视镜、组合仪表和多功能仪表水平放置，以避免混淆。我们还特别注意灯光的亮度，以提高即时可见度。</p>
            <p>4.乘客座位接待区 ：门把手、扶手和其他功能为乘客营造出豪华和舒适的感觉。</p>
            <router-link to="#" style="color: white">详细内容 ▶</router-link>
          </div>
        </div>
      </div>
      <div class="grid" style="background-color: rgb(255,255,255);"></div>
    </section>

    <!-- 车型展示 -->
    <section class="gtr-models" >
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
            <img :src="model.image" :alt="model.name">
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
              <div class="action-buttons">
                <router-link to="#" class="detail-link">查看更多相关内容<span class="arrow">▶</span></router-link>
                <router-link to="#" class="build-link">Build It<span class="arrow">▶</span></router-link>
              </div>
            </div>
          </div>
      </div>
    </section>
    <div class="grid" style="background-color: rgb(1,10,14);"></div>



    <!-- 客户改车 -->
    <section class="customization">
      <h2>Personalize Your GT-R</h2>
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
    </section>
  </div>
</template>



<style scoped>
.gtr-page {
  color: rgba(255, 255, 255, 0.78);
  background-color: white;
}
.grid {
  margin: 0 auto 1rem;
  width: 80%;
  height: 1px;
  border-radius: 2px;
}

/* 视频主页 */
.gtr-hero {
  height: 100vh;
  position: relative;
  overflow: hidden;
}
.hero-video {
  width: 100%;
  height: 100%;
}
.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: linear-gradient(to top, rgb(1, 10, 14), transparent, rgb(1, 10, 14));
}
.hero-content {
  text-align: center;
  color: white;
  z-index: 1;
}
.hero-content h1 {
  font-size: 4rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}
.hero-subtitle {
  font-size: 2rem;
  margin-bottom: 2rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

/* 主页选项 */
.hero-actions {
  position: relative;
  display: flex;
  gap: 2rem;
  justify-content: center;
}
.cta-button {
  padding: 1rem 2rem;
  border-radius: 30px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}
.cta-button.primary {
  background: rgba(255, 255, 255, 0.47);
  color: white;
}
.cta-button.secondary {
  background: transparent;
  color: white;
  border: 2px solid white;
}
.cta-button:hover {
  border: 2px solid rgba(255, 255, 255, 0.37);
  background: rgba(221, 221, 221, 0.4);
}

/************************************************************
 * 外观设计
 ************************************************************/
.appearance-overview {
  padding: 3rem;
  height: auto;
  margin: 0;
  position: relative;
  background-color: black;
}
.appearance-title {
  color: white;
  display: block;
  text-align: center;
  position: relative;
  margin: 2rem;
  h1 {
    width: 100%;
    position: relative;
    text-shadow: -2px 0 2px hsl(0, 0%, 100%),0 2px 2px hsla(198, 87%, 3%, 0.44), 2px 0 10px hsl(198, 87%, 3%);
    font-size: 3rem;
  }
  p {
    position: relative;
    display: inline-block;
    font-size: 1.7rem;
    &::before {
      content: '';
      position: absolute;
      top: 0;
      transform: translateY(-50%);
      width: 4rem;
      height: 4px;
      background: rgba(255, 0, 0, 0.8);
      box-shadow: 0 0 2px hsl(0, 0%, 100%),
      0 2px 2px hsl(198, 87%, 3%),
      2px 7px 10px hsla(358, 100%, 50%, 0.4);
      border-radius: 2px;
    }
  }
}
.appearance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 2fr));
  column-gap: 10rem;
  row-gap: 4rem;
  max-width: 1200px;
  margin: 0 auto;
}
.grid-card {
  border-radius: 10px;
  margin-bottom: 10rem;
  img {
    object-fit: cover;
    width: 100%;
    height: 100%;
    border-radius: 10px;
  }
}
.appearance-block {
  gap: 4rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 3rem;
}
.block-card {
  display: flex;
  height: 100%;
  border-radius: 10px;
  margin-bottom: 7rem;
  img {
    object-fit: cover;
    width: 60%;
    height: 60%;
    border-radius: 10px;
  }
}
.text-card {
  text-shadow: 0 0 2px hsla(0, 0%, 100%, 0.62),0 0 2px hsl(198, 87%, 3%), 0 0 2px hsla(0, 0%, 100%, 0);
  margin: 0 4rem;
  h3 {
    color: white;
    font-size: 1.3rem;
  }
  p {
    margin: 0.5rem auto;
    font-size: 0.9rem;
  }
}


/************************************************************
 * 车型展示
 ************************************************************/
.gtr-models {
  position: relative;
  padding: 5rem;
  margin: 0 auto;
  background-image: linear-gradient(to bottom, rgb(1, 10, 14), rgb(255, 255, 255));
}
.gtr-models-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
  h1 {
    text-shadow: -2px 0 2px hsl(0, 0%, 100%),0 2px 2px hsla(198, 87%, 3%, 0.44), 2px 0 10px hsl(198, 87%, 3%);
    font-size: 3rem;
  }
  p {
    font-size: 1.5rem;
  }
}
.models-container {
  border-radius: 10px;
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  background-color: white;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 3rem;
  padding: 2rem;
  &::before {
    content: '';
    top: 35%;
    left: 50%;
    position: absolute;
    width: 1px;
    height: 60%;
    background: rgba(1, 10, 14, 0.61);
  }
}
.model-card {
  height: 600px;
  width: 100%;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease;
  background: white;
  border-radius: 10px;
}
.model-card img {
  width: 100%;
  height: 200px;
  object-fit: contain;
  display: block;
  margin: 0 auto;
  transition: transform 0.3s ease;
}
/* 模型信息 */
.model-info {
  padding-left: 1rem;
  position: static;
  margin: 0 auto 0 0;
}
.model-info h1 {
  color: black;
  font-size: 2.2rem;
  top: 0;
  margin-bottom: 1.5rem;
}
.price {
  font-size: 2rem;
  color: #010a0e;
  font-weight: 700;
}
.price-note {
  font-size: 0.8rem;
  color: rgb(113, 34, 22);
  margin: 0.5rem auto;
}
.specs p {
  color: #444;
  margin: 0.5rem 0;
  font-size: 0.9rem;
  position: relative;
}

/* 选项 */
.action-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 3rem;
}
.detail-link, .build-link {
  color: #010a0e;
  text-decoration: none;
  position: relative;
  padding: 0.5rem 1rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
}
.build-link {
  background: rgb(131, 131, 124);
  color: white;
}

/* 箭头动画 */
.detail-link:hover .arrow,
.build-link:hover .arrow {
  transform: translateX(5px);
}
.arrow {
  margin-left: 0.5rem;
  transition: transform 0.3s ease;
}


/************************************************************
 * 客户个性化选项
 ************************************************************/
.customization {
  padding: 4rem 0;
  background-image: linear-gradient(to top, rgb(1, 10, 14), rgb(255, 255, 255));
}
.customization h2 {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
}
.customization-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}
.custom-option {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
}
.custom-option img {
  width: 100%;
  height: 250px;
  object-fit: cover;
  transition: transform 0.3s ease;
}
.custom-option:hover img {
  transform: scale(1.1);
}
.option-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  color: white;
}
.option-overlay h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}
.modal-content img {
  width: 100%;
  height: auto;
  border-radius: 5px;
  margin: 1rem 0;
}



@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.5rem;
  }

  .hero-actions {
    flex-direction: column;
  }

  .cta-button {
    width: 100%;
  }
}
</style>
