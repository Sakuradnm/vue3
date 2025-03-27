<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

interface MaintenanceItem {
  id: number
  title: string
  description: string
  icon: string
  period: string
}

interface MaintenancePackage {
  id: number
  title: string
  price: number
  features: string[]
  recommended: boolean
}

const router = useRouter()
const activeTab = ref(0)
const carModel = ref('')
const showBookingForm = ref(false)
const formSubmitted = ref(false)

const maintenanceItems = ref<MaintenanceItem[]>([
  {
    id: 1,
    title: '常规保养',
    description: '包括机油、机滤更换，全车系统检查',
    icon: 'oil-change',
    period: '每10,000公里或12个月'
  },
  {
    id: 2,
    title: '制动系统检查',
    description: '刹车片、刹车盘和制动液检查与更换',
    icon: 'brake',
    period: '每20,000公里或24个月'
  },
  {
    id: 3,
    title: '空调系统保养',
    description: '空调系统清洁、冷媒检查和更换',
    icon: 'ac',
    period: '每30,000公里或36个月'
  },
  {
    id: 4,
    title: '电池检测',
    description: '蓄电池健康状态检查和维护',
    icon: 'battery',
    period: '每15,000公里或18个月'
  }
])

const maintenancePackages = ref<MaintenancePackage[]>([
  {
    id: 1,
    title: '基础保养',
    price: 1280,
    features: ['机油更换', '机滤更换', '空气滤清器检查', '轮胎气压检查', '基础安全检查'],
    recommended: false
  },
  {
    id: 2,
    title: '全面保养',
    price: 2480,
    features: ['机油更换', '机滤更换', '空气滤清器更换', '空调滤清器更换', '轮胎检查与轮换', '制动系统检查', '电池检测', '全车电子系统诊断'],
    recommended: true
  },
  {
    id: 3,
    title: '豪华保养',
    price: 3680,
    features: ['高级合成机油更换', '全套滤清器更换', '制动液更换', '转向助力液检查', '变速箱油检查', '底盘部件检查', '灯光系统检修', '高级内饰清洁', '全车电子系统诊断', '四轮定位'],
    recommended: false
  }
])

const currentYear = new Date().getFullYear()
const carYears = Array.from({ length: 10 }, (_, i) => currentYear - i)
const carModels = ['豪华轿车A', '豪华轿车B', 'SUV-X', 'SUV-Y', '跑车Z', '纯电动E1', '混动H1']

const bookingInfo = ref({
  name: '',
  phone: '',
  carModel: '',
  carYear: '',
  packageId: 0,
  date: '',
  notes: ''
})

const selectPackage = (id: number) => {
  bookingInfo.value.packageId = id
  showBookingForm.value = true
  window.scrollTo({
    top: document.getElementById('booking-form')?.offsetTop,
    behavior: 'smooth'
  })
}

const submitForm = () => {
  // 实际应用中这里会发送API请求
  console.log('提交预约信息:', bookingInfo.value)
  formSubmitted.value = true
  setTimeout(() => {
    formSubmitted.value = false
    showBookingForm.value = false
    bookingInfo.value = {
      name: '',
      phone: '',
      carModel: '',
      carYear: '',
      packageId: 0,
      date: '',
      notes: ''
    }
  }, 3000)
}

onMounted(() => {
  // 可以在这里加载用户车辆信息或其他数据
})
</script>

<template>
  <div class="maintenance-page">
    <!-- 顶部横幅 -->
    <section class="hero-banner">
      <div class="hero-content">
        <h1>专业保养检查</h1>
        <p>为您的爱车提供高品质的维护与呵护</p>
        <button class="primary-btn" @click="showBookingForm = true">立即预约</button>
      </div>
    </section>

    <!-- 保养项目介绍 -->
    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2>保养项目</h2>
          <p>我们提供全方位的保养检查服务，保障您的用车安全和舒适</p>
        </div>

        <div class="maintenance-grid">
          <div
              v-for="item in maintenanceItems"
              :key="item.id"
              class="maintenance-card"
          >
            <div class="maintenance-icon">
              <svg-icon :name="item.icon" width="48" height="48" />
            </div>
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
            <div class="maintenance-period">{{ item.period }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 品牌优势 -->
    <section class="section brand-advantage">
      <div class="container">
        <div class="section-header light">
          <h2>品牌优势</h2>
          <p>选择我们的专业保养服务，让您的爱车始终如新</p>
        </div>

        <div class="advantages">
          <div class="advantage-item">
            <h3>原厂配件</h3>
            <p>100%使用原厂配件，保证品质与安全</p>
          </div>
          <div class="advantage-item">
            <h3>专业技师</h3>
            <p>经过严格培训的专业技师团队</p>
          </div>
          <div class="advantage-item">
            <h3>先进设备</h3>
            <p>配备国际领先的检测和维修设备</p>
          </div>
          <div class="advantage-item">
            <h3>贴心服务</h3>
            <p>一对一专属顾问全程跟进服务</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 保养套餐 -->
    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2>保养套餐</h2>
          <p>为不同需求的车主提供多样化选择</p>
        </div>

        <div class="packages-container">
          <div
              v-for="pkg in maintenancePackages"
              :key="pkg.id"
              class="package-card"
              :class="{ 'recommended': pkg.recommended }"
          >
            <div v-if="pkg.recommended" class="recommended-tag">推荐</div>
            <h3>{{ pkg.title }}</h3>
            <div class="price">¥{{ pkg.price }}</div>
            <ul class="feature-list">
              <li v-for="(feature, index) in pkg.features" :key="index">
                {{ feature }}
              </li>
            </ul>
            <button
                class="package-btn"
                :class="{ 'primary-btn': pkg.recommended }"
                @click="selectPackage(pkg.id)"
            >
              选择此套餐
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 预约表单 -->
    <section id="booking-form" class="section booking-section" v-if="showBookingForm">
      <div class="container">
        <div class="section-header">
          <h2>预约保养</h2>
          <p>填写以下信息，我们将尽快安排您的保养服务</p>
        </div>

        <div class="booking-form-container" v-if="!formSubmitted">
          <form @submit.prevent="submitForm" class="booking-form">
            <div class="form-group">
              <label for="name">姓名</label>
              <input
                  type="text"
                  id="name"
                  v-model="bookingInfo.name"
                  required
                  placeholder="请输入您的姓名"
              >
            </div>
            <div class="form-group">
              <label for="phone">联系电话</label>
              <input
                  type="tel"
                  id="phone"
                  v-model="bookingInfo.phone"
                  required
                  placeholder="请输入您的联系电话"
              >
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="carModel">车型</label>
                <select id="carModel" v-model="bookingInfo.carModel" required>
                  <option value="" disabled>请选择车型</option>
                  <option v-for="model in carModels" :key="model" :value="model">
                    {{ model }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label for="carYear">年份</label>
                <select id="carYear" v-model="bookingInfo.carYear" required>
                  <option value="" disabled>请选择年份</option>
                  <option v-for="year in carYears" :key="year" :value="year">
                    {{ year }}
                  </option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label for="date">预约日期</label>
              <input type="date" id="date" v-model="bookingInfo.date" required>
            </div>
            <div class="form-group">
              <label for="notes">备注</label>
              <textarea
                  id="notes"
                  v-model="bookingInfo.notes"
                  placeholder="请输入其他需要说明的事项"
                  rows="3"
              ></textarea>
            </div>
            <div class="form-actions">
              <button type="submit" class="primary-btn">提交预约</button>
            </div>
          </form>
        </div>
        <div class="submission-success" v-else>
          <div class="success-icon">
            <svg-icon name="check-circle" width="64" height="64" />
          </div>
          <h3>预约成功</h3>
          <p>我们已收到您的预约信息，客服将在24小时内与您联系确认详情</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.maintenance-page {
  color: #333;
  background-color: white;
}

.hero-banner {
  height: 600px;
  background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/brand/ultra.png');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  margin-top: 80px; /* 为导航栏留出空间 */
}

.hero-content {
  max-width: 800px;
  padding: 0 20px;
}

.hero-content h1 {
  font-size: 3rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.hero-content p {
  font-size: 1.5rem;
  margin-bottom: 2rem;
}

.section {
  padding: 80px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-header {
  text-align: center;
  margin-bottom: 60px;
}

.section-header h2 {
  font-size: 2.5rem;
  font-weight: 500;
  margin-bottom: 1rem;
}

.section-header p {
  font-size: 1.2rem;
  max-width: 700px;
  margin: 0 auto;
  color: #666;
}

.section-header.light h2,
.section-header.light p {
  color: white;
}

.brand-advantage {
  background-color: #010a0e;
  color: white;
}

.maintenance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 30px;
}

.maintenance-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
  padding: 30px;
  text-align: center;
  transition: transform 0.3s, box-shadow 0.3s;
}

.maintenance-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.maintenance-icon {
  margin-bottom: 20px;
  color: #010a0e;
}

.maintenance-card h3 {
  font-size: 1.5rem;
  margin-bottom: 15px;
}

.maintenance-card p {
  color: #666;
  margin-bottom: 15px;
}

.maintenance-period {
  font-size: 0.9rem;
  color: #888;
  font-style: italic;
}

.advantages {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 40px;
}

.advantage-item {
  text-align: center;
}

.advantage-item h3 {
  font-size: 1.5rem;
  margin-bottom: 15px;
}

.packages-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
}

.package-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
  padding: 30px;
  text-align: center;
  position: relative;
  transition: transform 0.3s;
}

.package-card:hover {
  transform: translateY(-10px);
}

.package-card.recommended {
  border: 2px solid #010a0e;
}

.recommended-tag {
  position: absolute;
  top: -12px;
  right: 20px;
  background: #010a0e;
  color: white;
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 0.9rem;
}

.package-card h3 {
  font-size: 1.8rem;
  margin-bottom: 15px;
}

.price {
  font-size: 2.5rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: #010a0e;
}

.feature-list {
  text-align: left;
  margin-bottom: 30px;
  min-height: 200px;
  padding-left: 20px;
}

.feature-list li {
  margin-bottom: 10px;
  position: relative;
}

.feature-list li:before {
  content: "✓";
  position: absolute;
  left: -20px;
  color: #010a0e;
}

.booking-form-container {
  max-width: 700px;
  margin: 0 auto;
}

.booking-form {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

input, select, textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-actions {
  margin-top: 30px;
  text-align: center;
}

.primary-btn, .package-btn {
  padding: 12px 30px;
  border-radius: 30px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.primary-btn {
  background: #010a0e;
  color: white;
}

.primary-btn:hover {
  background: #021c27;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.package-btn {
  background: white;
  color: #010a0e;
  border: 1px solid #010a0e;
}

.package-btn:hover {
  background: #f5f5f5;
}

.submission-success {
  text-align: center;
  padding: 60px 20px;
}

.success-icon {
  color: #4caf50;
  margin-bottom: 20px;
}

.submission-success h3 {
  font-size: 2rem;
  margin-bottom: 15px;
}

@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 2rem;
  }

  .hero-content p {
    font-size: 1.2rem;
  }

  .section-header h2 {
    font-size: 2rem;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .booking-form {
    padding: 20px;
  }
}
</style>
