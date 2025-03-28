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

    <!-- 图片展示 -->
    <div class="car-overview">
      <div class="overview-box">
        <div class="overview-card">
          <div class="text-box">
            <h1>Overview</h1>
            <p>*除车门把手、车门后视镜、 A 柱、侧梁和后翼外，所有车身颜色涂漆区域均采用防刮保护膜。
              *规格和设备如有变更，恕不另行通知。
              *3D图像是CG图像。实际颜色可能与所示不同。
              *如果您选择特殊的油漆颜色或防刮保护层，车辆价格将与其他车身颜色不同。
              * 部分照片为合成图。
              *列出的制造商和经销商选项仅供选择。
              *预计价格仅供参考。屏幕上显示的价格或屏幕打印件上打印的价格不具有销售价格的效力。
              *车辆价格为截至 2024 年 3 月东京地区的制造商建议零售价（含消费税）。税费（不含消费税）、汽车责任强制保险、销售费用、选配价格（制造商和经销商）、配件价格等不包含在内。
              *请注意，车辆规格和装备可能与实际车辆不同。</p>
          </div>
        </div>
        <div class="photos-content">
          <img src="/models/Gtr/show1.jpg" alt="gtr-overview">
        </div>
      </div>
      <div class="overview-box">
        <div class="overview-card">
          <div class="text-box">
            <h1>Overview</h1>
            <p>*除车门把手、车门后视镜、 A 柱、侧梁和后翼外，所有车身颜色涂漆区域均采用防刮保护膜。
              *规格和设备如有变更，恕不另行通知。
              *3D图像是CG图像。实际颜色可能与所示不同。
              *如果您选择特殊的油漆颜色或防刮保护层，车辆价格将与其他车身颜色不同。
              * 部分照片为合成图。
              *列出的制造商和经销商选项仅供选择。
              *预计价格仅供参考。屏幕上显示的价格或屏幕打印件上打印的价格不具有销售价格的效力。
              *车辆价格为截至 2024 年 3 月东京地区的制造商建议零售价（含消费税）。税费（不含消费税）、汽车责任强制保险、销售费用、选配价格（制造商和经销商）、配件价格等不包含在内。
              *请注意，车辆规格和装备可能与实际车辆不同。</p>
          </div>
        </div>
        <div class="photos-content">
          <img src="/models/Gtr/show2.jpg" alt="gtr-overview">
        </div>
      </div>
      <div class="overview-box">
        <div class="overview-card">
          <div class="text-box">
            <h1>Overview</h1>
            <p>*除车门把手、车门后视镜、 A 柱、侧梁和后翼外，所有车身颜色涂漆区域均采用防刮保护膜。
              *规格和设备如有变更，恕不另行通知。
              *3D图像是CG图像。实际颜色可能与所示不同。
              *如果您选择特殊的油漆颜色或防刮保护层，车辆价格将与其他车身颜色不同。
              * 部分照片为合成图。
              *列出的制造商和经销商选项仅供选择。
              *预计价格仅供参考。屏幕上显示的价格或屏幕打印件上打印的价格不具有销售价格的效力。
              *车辆价格为截至 2024 年 3 月东京地区的制造商建议零售价（含消费税）。税费（不含消费税）、汽车责任强制保险、销售费用、选配价格（制造商和经销商）、配件价格等不包含在内。
              *请注意，车辆规格和装备可能与实际车辆不同。</p>
          </div>
        </div>
        <div class="photos-content">
          <img src="/models/Gtr/show3.jpg" alt="gtr-overview">
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
                <router-link to="#" style="color: white;">详细内容 ▶</router-link>
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
                <router-link to="#" style="color: white;">详细内容 ▶</router-link>
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
              <router-link to="#" style="color: white;">详细内容 ▶</router-link>
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
              <router-link to="#" style="color: white; ">详细内容 ▶</router-link>
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
/* 基础样式 */
.car-page {
  color: rgba(255, 255, 255, 0.78);
  background-color: white;
}
.grid {
  margin: 0 auto 1rem;
  width: 90%;
  height: 1px;
  border-radius: 2px;
  transform: translateY(-50%);
}
/************************************************************
 * 视频主页
 ************************************************************/
.car-hero {
  height: 100vh;
}
.hero-video {
  object-fit: cover;
  width: 100%;
  height: 100%;
}
.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  align-items: center;
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
 * 视觉标题
 ************************************************************/
.gallery-header {
  position: relative;
  z-index: 10;
  text-align: center;
  background: linear-gradient(
      to bottom,
      rgba(1, 10, 14, 0.6) 40%,
      rgba(1, 10, 14, 1) 100%
  );
  height: 100%;
  font-size: 2.5rem;
  color: rgba(255,255,255,0.9);
  text-shadow: 0 4px 4px hsla(0, 0%, 100%, 0.65),0 2px 2px hsl(198, 87%, 3%);
}

.gallery-header p {
  font-style: italic;
  margin-left: 8rem;
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 1rem;
  text-shadow: 0 0 2px hsla(0, 0%, 100%, 0.51),0 2px 2px hsla(198, 87%, 3%, 0.44), 2px 0 5px hsl(0, 0%, 100%);
}
/************************************************************
 * 外观框架基础设计
 ************************************************************/
.car-overview {
  position: relative;
  overflow: hidden;
  margin-top: -10rem; /* 向上收拢间距 */
  padding-top: 10rem; /* 补偿空间 */
  background: linear-gradient(
      to bottom,
      rgba(1, 10, 14, 0.9) 0%,
      rgba(10, 10, 10, 0.6) 30%,
      #0a0a0a 100%
  ), #0a0a0a ;
}
.car-overview::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
      45deg,
      transparent 48%,
      rgba(131, 23, 41, 0.23) 50%,
      transparent 52%
  );
  animation: glowFlow 12s infinite linear;
  pointer-events: none;
}
@keyframes glowFlow {
  0% { transform: translate(0,0) rotate(0deg); }
  100% { transform: translate(50%,50%) rotate(360deg); }
}
.overview-box {
  display: grid;
  position: relative;
  width: 100%;
  height: auto;
  background:
      radial-gradient(
          ellipse at 50% -20%,
          rgba(196, 30, 58, 0.15) 0%,
          transparent 70%
      ),
      linear-gradient(
          to bottom right,
          rgba(0,0,0,0.8) 0%,
          #000 100%
      );
  box-shadow: 0 0 30px rgba(0,0,0,0.3);
}

.photos-content {
  margin-top: 2rem;
  position: relative;
  width: 100vw;
  left: 50%;
  transform: translateX(-50%);
  height: 100%;
}
.photos-content img {
  width: 100%;
  height: auto;
  object-fit: cover;
  object-position: center;
}
.overview-card {
  position: absolute;
  z-index: 2;
  padding: 2rem;
  background-image: linear-gradient(to bottom,
  rgb(1, 10, 14),
  rgba(1, 10, 14, 0.7),
  transparent,
  rgba(1, 10, 14, 0.7),
  rgb(1, 10, 14));
  width: 100%;
  height: 100%;
}
.text-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 6rem auto;
  width: 40rem;
  height: auto;
}
/* 标题装饰线特效增强 */
.text-box h1::before {
  background: linear-gradient(to bottom, #c41e3a, #8a1428);
  box-shadow: 0 0 10px rgba(196,30,58,0.5);
}


/************************************************************
 * 外观框架基础设计
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
  margin: 1rem;
  h1 {
    width: 100%;
    position: relative;
    text-shadow: -2px 0 2px hsl(0, 0%, 100%),0 2px 2px hsla(198, 87%, 3%, 0.44), 2px 0 10px hsl(198, 87%, 3%);
    font-size: 3rem;
  }
  p {
    margin: 0 auto;
    width: 100%;
    position: relative;
    display: inline-block;
    font-size: 2rem;
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
.grid-card-footer {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 2;
}

/************************************************************
 * 外观 / 轮胎和轮毂设计
 ************************************************************/
.appearance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 2fr));
  column-gap: 10rem;
  gap: 5rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 3rem;
}
.grid-card {
  border-radius: 10px;
}
.grid-image-wrapper {
  width: 100%;
  height: 300px;
  position: relative;
  border-radius: 10px;
}
.grid-image-wrapper img {
  border-radius: 10px;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}
.grid-content-wrapper {
  padding: 1rem;
  position: relative;
}
.grid-text-card {
  padding: 0 1rem;
  height: 160px;
  text-shadow: 0 0 2px hsla(0, 0%, 100%, 0.62),0 0 2px hsl(198, 87%, 3%), 0 0 2px hsla(0, 0%, 100%, 0);
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
 * 座椅 / 驾驶舱设计
 ************************************************************/
.appearance-block {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}
.block-card {
  display: flex;
  gap: 2rem;
  min-height: 400px;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
}

/* 下部分布局（左图片右文字） */
.block-card:nth-child(2) {
  flex-direction: row;
}
.block-image-wrapper {
  width: 100%;
  height: 300px;
  position: relative;
  border-radius: 10px;
}
.block-image-wrapper img {
  border-radius: 10px;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}
.block-content-wrapper {
  flex: 1;
  min-width: 45%;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  border-radius: 8px;
}
.block-text-card {
  position: relative;
  display: flex;
  flex-direction: column;
  text-shadow: 0 0 2px hsla(0, 0%, 100%, 0.62),0 0 2px hsl(198, 87%, 3%), 0 0 2px hsla(0, 0%, 100%, 0);
  h3 {
    font-size: 1.5rem;
    color: #fff;
  }
  p {
    margin: 0.5rem auto;
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.9);
  }
}
.block-card-footer {
  margin-top: auto;
  padding-top: 1.5rem;
}


/************************************************************
 * 车型展示
 ************************************************************/
.gtr-models {
  position: relative;
  padding: 4rem;
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
  padding: 1rem;
  display: flex;
  gap: 2rem;
  max-width: 1200px;
  height: auto;
  margin: 0 auto;
  border-radius: 10px;
  position: relative;
  background-color: white;
}
.model-card {
  border-radius: 10px;

  display: block;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  background: white;
  height: 100%;
  width: 100%;
  position: relative;
  transition: transform 0.3s ease;
  overflow: visible;
  padding: 1rem 0;
}
.model-image {
  width: 100%;
  max-width: 400px;
  height: 220px;
  object-fit: contain;
  margin: 0 auto;
  display: block;

}
/* 模型信息 */
.model-info {
  padding: 0 2rem;
  position: static;
}
.model-info h1 {
  color: black;
  font-size: 2.2rem;
  top: 0;
  margin-bottom: 1rem;
}
.price {
  font-size: 2rem;
  color: #010a0e;
  font-weight: 700;
}
.price-note {
  font-size: 0.8rem;
  color: rgb(113, 34, 22);
  margin: 0 auto 1rem;
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
  margin-top: 2rem;
}
.detail-link, .build-link {
  white-space: nowrap;
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 16px;
  border-radius: 20px;
  backdrop-filter: blur(5px);
  color: #010a0e;
  text-decoration: none;
  position: relative;
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
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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
  height: auto;
  border-radius: 5px;
  margin: 1rem 0;
  max-width: 100%;
}



@media (max-width: 768px) {
  /* 主页视频框架 */
  .hero-content h1 {
    font-size: 2.5rem;
  }
  .hero-subtitle {
    font-size: 1.2rem;
  }
  .hero-actions {
    flex-direction: column;
  }
  .cta-button {
    width: 100%;
  }
  .grid-image-wrapper {
    height: 300px;
  }

  /* 标题设计 */
  .gallery-header {
    padding: 2rem 0;
    margin-top: -4rem;
    clip-path: polygon(0 0, 100% 15%, 100% 100%, 0% 100%);
  }
  .gallery-header h2 {
    font-size: 2rem;
    transform: translateY(2rem);
  }
  .gallery-header p {
    font-size: 1.2rem;
  }

  /* 图片展示 */
  .car-overview {
    margin-top: -10rem;
    padding-top: 8rem;
  }
  .overview-box {
    min-height: 400px;
  }
  .photos-content img {
    height: 400px;
  }
  .overview-card {
    max-width: 100%;
    padding: 1rem;
  }
  .text-box {
    margin: 2rem auto;
    width: 80%;
    font-size: 0.8rem;
  }


  /* 外观 / 轮胎和轮毂设计 */
  .appearance-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  /* 座椅 / 驾驶舱设计 */
  .block-card {
    flex-direction: column !important;
  }
  .grid1 {
    margin: 0 auto 1rem;
    width: 60%;
    height: 1px;
    border-radius: 2px;
    transform: translateY(-50%);
  }
  .block-card:nth-child(2) .block-image-wrapper {
    order: 0;
  }
  .block-image-wrapper {
    min-height: 300px;
    height: 100px;
  }
  .block-content-wrapper,
  .block-image-wrapper {
    min-width: 100%;
  }

  /* 车型展示 */
  .gtr-models {
    padding: 1rem;
    background-image: linear-gradient(to bottom, rgb(1, 10, 14), #fff);
  }
  .models-container {
    flex-direction: column;
    height: auto;
    padding: 1rem;
    gap: 3rem;
  }
  .grid2 {
    margin: 0 auto 1rem;
    width: 60%;
    height: 1px;
    border-radius: 2px;
    transform: translateY(-50%);
  }
  .model-card {
    padding: 0;
    overflow: hidden;
    height: auto;
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  .model-image {
    height: 180px;
    max-width: none;
    width: 100vw;
    margin-left: -1rem;
    margin-right: -1rem;
  }
  .model-info {
    padding: 0;

    h1 {
      font-size: 1.8rem;
      text-align: center;
    }
  }

  .price {
    font-size: 1.5rem;
    text-align: center;
  }

  .specs {
    p {
      font-size: 0.85rem;
      text-align: center;
    }
  }

  .action-buttons {
    flex-direction: column;
    gap: 1rem;
    margin-top: 1.5rem;

    a {
      justify-content: center;
      padding: 12px 24px;
    }
  }
  /* 增加点击热区优化 */
  .detail-link, .build-link {
    min-height: 44px;
  }
}

</style>
