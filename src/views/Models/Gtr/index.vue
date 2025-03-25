<script lang="ts">
import { defineComponent, ref, reactive } from 'vue'

// 定义接口来明确类型
interface GTRModel {
  name: string;
  shortDescription: string;
  fullDescription: string;
  image: string;
  price: number;
  horsepower: number;
}

interface CustomizationOption {
  title: string;
  description: string;
  image: string;
}
export default defineComponent({
  name: 'GTRPage',
  setup() {
    // 使用泛型和接口明确类型
    const selectedModel = ref<GTRModel | null>(null)
    const appearanceSection = ref<HTMLElement | null>(null)

    const gtrModels = reactive<GTRModel[]>([
      {
        name: 'GT-R Premium',
        shortDescription: 'The Classic Performance',
        fullDescription: 'The entry point to GT-R performance, delivering uncompromising power and precision.',
        image: '/models/Gtr/Premium.jpg',
        price: 103747,
        horsepower: 565
      },
      {
        name: 'GT-R NISMO',
        shortDescription: 'Motorsport Inspired',
        fullDescription: 'The ultimate track-focused machine, developed with racing DNA.',
        image: '/models/Gtr/Nismo.jpg',
        price: 200245,
        horsepower: 600
      },
    ])

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
    <section class="appearance-overview" ref="appearanceSection">
      <!-- 1 -->
      <div class="appearance-title">
        <h1>Appearance and design</h1>
        <div class="grid-row"></div>
        <p>外观 / 轮胎和轮毂</p>
      </div>
      <div class="appearance-grid">
        <div class="appearance-card">
          <img src="/models/Gtr/1.jpg" alt="appearance and design">
              <h3>Rays 铝合金锻造轮毂</h3>
              <p>我们选择防爆轮胎是因为它们本身侧壁较厚，能够承受高负荷。
                与住友橡胶共同开发的DUNLOP SPSPORT MAXX GT 600 DSST，专为承受赛道驾驶而设计，这是作为GT-R诞生的汽车的命运。
                <router-link to="#" style="color: white">详细内容 ▶</router-link>
              </p>
        </div>
        <div class="appearance-card">
          <img src="/models/Gtr/2.jpg" alt="appearance and design">
          <h3>FUJITSUBO钛合金消声器</h3>
          <p>全新钛合金消声器，可产生令人着迷的喷气声音。饰面经过热处理，重现了钛金属独有的精致蓝色。它可减少压力损失并有助于提高动力性能。
            <router-link to="#" style="color: white">详细内容 ▶</router-link>
          </p>
        </div>
      </div>

      <!-- 2 -->
      <div class="appearance-title">
        <div class="grid-row"></div>
        <p>驾驶舱 / 座椅</p>
      </div>
      <div class="appearance-grid">
        <div class="appearance-card">
          <img src="/models/Gtr/3.jpg" alt="appearance and design">
          <h3>最精致的内饰由工匠精心打造并由工艺大师完成</h3>
          <p>纳帕皮革*被称为高品质真皮。除此以外，仪表板的顶面上粘贴了一大块精心挑选的皮革。无缝的“一体式”生产需要熟练工匠的先进技术。此外，整个车内都采用了复杂的缝线，包括手工缝制的座椅装饰。高品质的驾驶舱使人们能够平静、舒适地驾驶这款卓越的超级跑车。
            *蓝色天堂内饰（前后半苯胺皮革座椅）+ Nappa 皮革仪表板，时尚内饰（前后半苯胺皮革座椅）+ Nappa 皮革仪表板（GT-R Premium 版制造商选项）。
            <router-link to="#" style="color: white">详细内容 ▶</router-link>
          </p>
        </div>
        <div class="appearance-card">
          <img src="/models/Gtr/4.jpg" alt="appearance and design">
          <h3>按功能划分的驾驶舱</h3>
          <p>驾驶舱的设计非常适合日常超高速驾驶，分为四个区域。
            第一个是“起始区域”。使从发动机启动到行车前的一系列操作能够安全、顺畅地行驶。
            第二个是“司机操作区”。驾驶员无需改变驾驶姿势即可设定开关和操作换挡拨片，提高注意力。
            第三是“可视性和信息区”。车门后视镜、组合仪表和多功能仪表水平放置，以避免混淆。我们还特别注意灯光的亮度，以提高即时可见度。
            第四个是“乘客座位接待区”。门把手、扶手和其他功能为乘客营造出豪华和舒适的感觉。
            <router-link to="#" style="color: white">详细内容 ▶</router-link>
          </p>
        </div>
      </div>
    </section>


    <!-- 车型展示 -->
    <section class="gtr-models">
      <div class="gtr-models-title">
        <h1>Discover Your GR Supra</h1>
        <p>2 unique grades to choose from</p>
      </div>
      <div class="models-container">
        <div
            v-for="(model, index) in gtrModels"
            :key="index"
            class="model-card"
            @click="selectModel(model)"
        >
          <img :src="model.image" :alt="model.name">
          <div class="model-info">
            <h3>{{ model.name }}</h3>
            <p>{{ model.shortDescription }}</p>
            <span class="model-price">Starting at ${{ model.price.toLocaleString() }}</span>
          </div>
        </div>
      </div>
    </section>


    <!-- Technical Specifications -->
    <section class="technical-specs">
      <div class="specs-content">
        <div class="specs-text">
          <h2>Engineering Precision</h2>
          <p>The GT-R represents the pinnacle of Nissan's engineering prowess. Meticulously crafted by master technicians, each vehicle embodies a perfect blend of cutting-edge technology and pure performance.</p>
        </div>
        <div class="specs-details">
          <div class="spec-group">
            <h3>动力系统</h3>
            <ul>
              <li>3.8L Twin-Turbocharged V6</li>
              <li>Handcrafted Engine</li>
              <li>Dual Clutch Transmission</li>
            </ul>
          </div>
          <div class="spec-group">
            <h3>Performance</h3>
            <ul>
              <li>All-Wheel Drive</li>
              <li>Advanced Aerodynamics</li>
              <li>Carbon Fiber Components</li>
            </ul>
          </div>
          <div class="spec-group">
            <h3>Technology</h3>
            <ul>
              <li>Advanced Vehicle Dynamic Control</li>
              <li>Adaptive Suspension</li>
              <li>Multiple Drive Modes</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Customization Options -->
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

    <!-- Modal for Model Details -->
    <div v-if="selectedModel" class="modal model-modal">
      <div class="modal-content">
        <span @click="closeModal" class="close-btn">&times;</span>
        <h2>{{ selectedModel.name }}</h2>
        <img :src="selectedModel.image" :alt="selectedModel.name">
        <div class="model-details">
          <p>{{ selectedModel.fullDescription }}</p>
          <div class="model-specs">
            <div class="spec">
              <strong>Price:</strong> ${{ selectedModel.price.toLocaleString() }}
            </div>
            <div class="spec">
              <strong>Horsepower:</strong> {{ selectedModel.horsepower }} HP
            </div>
          </div>
          <button @click="initiateReservation" class="reserve-btn">Reserve This Model</button>
        </div>
      </div>
    </div>
  </div>
</template>



<style scoped>
.gtr-page {
  color: #ffffff;
  background-color: #010a0e;
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
  padding: 4rem 2rem 5rem;
  height: 100rem;
}
.grid-row {
  margin: 5rem 0 0.5rem 1rem;
  width: 3.5rem;
  height: 4px;
  background: rgba(255, 0, 0, 0.8);
  border-radius: 2px;
  display: flex;
}
.appearance-title {
  display: flow;
  position: relative;
  text-align: left;
  h1 {
    margin: 0;
    text-shadow: -2px 0 2px hsl(0, 0%, 100%),0 2px 2px hsl(198, 87%, 3%), 2px 0 10px hsla(48, 100%, 50%, 0.55);
    font-size: 3rem;
  }
  p {
    margin-left: 1rem;
    margin-top: 0;
    font-size: 1.5rem;
  }
}
.appearance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 4rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 3rem;
  img {
    object-fit: cover;
    width: 100%;
    height: 100%;
  }
}
.appearance-card {
  border-radius: 10px;
  margin-bottom: 5rem;
  img {

    border-radius: 10px;
  }
  h3 {
    margin-top: 1rem;
    font-size: 1.1rem;
  }
  p {
    text-indent: 2em;
    font-size: 0.9rem;
  }

}


/************************************************************
 * 车型展示
 ************************************************************/
.gtr-models {
  background: #dddddd;
  padding: 1rem 2rem 5rem;
}
.gtr-models-title {
  color: white;
  text-shadow:  0 0 2px hsl(60, 1%, 69%),0 0 2px hsla(198, 87%, 3%, 0.24), 1px 0 2px hsl(198, 87%, 3%);
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
  h1 {
    font-size: 2.5rem;
  }
  p {
    font-size: 1.5rem;
  }
}
.models-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.model-card {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.3s ease;
}

.model-card:hover {
  transform: translateY(-5px);
}

.model-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.model-info {
  padding: 1.5rem;
}

.model-info h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.model-price {
  display: block;
  font-size: 1.2rem;
  color: #e60012;
  margin-top: 1rem;
}

.technical-specs {
  padding: 4rem 0;
  background: #f5f5f5;
}

.specs-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.specs-text {
  text-align: center;
  margin-bottom: 3rem;
}

.specs-text h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.specs-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.spec-group {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.spec-group h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #e60012;
}

.spec-group ul {
  list-style: none;
  padding: 0;
}

.spec-group li {
  margin-bottom: 0.5rem;
  padding-left: 1.5rem;
  position: relative;
}

.spec-group li:before {
  content: "•";
  color: #e60012;
  position: absolute;
  left: 0;
}

.customization {
  padding: 4rem 0;
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

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 2rem;
  cursor: pointer;
  color: #666;
}

.modal-content img {
  width: 100%;
  height: auto;
  border-radius: 5px;
  margin: 1rem 0;
}

.model-details {
  margin-top: 2rem;
}

.model-specs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
}

.reserve-btn {
  background: #e60012;
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 30px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.reserve-btn:hover {
  background: #cc0000;
  transform: translateY(-3px);
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

  .performance-grid,
  .models-container,
  .customization-grid {
    grid-template-columns: 1fr;
  }
}
</style>
