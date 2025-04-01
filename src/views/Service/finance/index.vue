<script setup lang="ts">
import { ref } from 'vue'

interface FinanceService {
  title: string
  description: string
  icon: string
  features: string[]
  interestRate?: string
  term?: string
}

const financeServices = ref<FinanceService[]>([
  {
    title: '分期付款',
    description: '灵活的分期付款方案，轻松实现购车梦想',
    icon: 'payment',
    features: [
      '首付低至30%',
      '最长60期分期',
      '灵活的还款方式',
      '快速审批流程'
    ],
    interestRate: '年利率低至3.99%',
    term: '12-60期可选'
  },
  {
    title: '汽车保险',
    description: '全方位的保险保障，为您的爱车保驾护航',
    icon: 'insurance',
    features: [
      '交强险',
      '商业险',
      '第三者责任险',
      '车损险'
    ]
  },
  {
    title: '置换服务',
    description: '专业的二手车置换服务，轻松升级座驾',
    icon: 'exchange',
    features: [
      '免费评估',
      '一站式服务',
      '快速过户',
      '专业检测'
    ]
  }
])

const selectedService = ref<FinanceService | null>(null)
const showConsultModal = ref(false)

const openConsultModal = (service: FinanceService) => {
  selectedService.value = service
  showConsultModal.value = true
}

const closeConsultModal = () => {
  showConsultModal.value = false
  selectedService.value = null
}
</script>

<template>
  <div class="finance-page">
    <!-- 页面标题 -->
    <section class="hero-section">
        <div class="hero-image">
          <img src="/service/Finance.jpg" alt="hero-img">
        </div>
        <div class="hero-text">
          <h1>金融服务</h1>
          <p>为您提供全方位的汽车金融服务，轻松实现购车梦想</p>
        </div>
    </section>

    <!-- 服务列表 -->
    <section class="services-section">
      <div class="services-grid">
        <div v-for="service in financeServices" :key="service.title" class="service-card">
          <div class="service-icon">
            <svg-icon :name="service.icon" :width="48" height="48" />
          </div>
          <h2>{{ service.title }}</h2>
          <p>{{ service.description }}</p>
          <ul class="features-list">
            <li v-for="feature in service.features" :key="feature">{{ feature }}</li>
          </ul>
          <div v-if="service.interestRate" class="rate-info">
            <p class="rate">{{ service.interestRate }}</p>
            <p class="term">{{ service.term }}</p>
          </div>
          <button class="consult-button" @click="openConsultModal(service)">
            立即咨询
          </button>
        </div>
      </div>
    </section>

    <!-- 咨询模态框 -->
    <div v-if="showConsultModal" class="modal-overlay" @click="closeConsultModal">
      <div class="modal-content" @click.stop>
        <h2>{{ selectedService?.title }}服务咨询</h2>
        <p>{{ selectedService?.description }}</p>
        <div class="consult-form">
          <div class="form-group">
            <label>姓名</label>
            <input type="text" placeholder="请输入您的姓名" />
          </div>
          <div class="form-group">
            <label>联系电话</label>
            <input type="tel" placeholder="请输入您的联系电话" />
          </div>
          <div class="form-group">
            <label>意向车型</label>
            <input type="text" placeholder="请输入您感兴趣的车型" />
          </div>
          <div class="form-group">
            <label>咨询内容</label>
            <textarea placeholder="请输入您的具体需求或问题"></textarea>
          </div>
        </div>
        <div class="modal-actions">
          <button class="cancel-button" @click="closeConsultModal">取消</button>
          <button class="confirm-button">提交咨询</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  color: #1a1a1a;
  background-color: white;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.finance-page {
  position: relative;
  min-height: 400px;
  margin-top: 72px;
  overflow: hidden;
}

.hero-section {
  background-image: linear-gradient(rgb(0, 0, 0), transparent);
  position: relative;
  min-height: 400px;
  overflow: hidden;
}

.hero-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.hero-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.hero-text {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
  height: 100%;
  min-height: 400px;
  background: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.2));
}

.hero-text h1 {
  font-size: 3rem;
  color: white;
  text-shadow: 0 1px 4px rgb(1, 10, 14), 0 2px 8px rgb(255, 233, 0), 0 3px 16px rgb(255, 255, 255);
  margin-bottom: 1rem;
  max-width: 800px;
  background: transparent;
}

.hero-text p {
  background: transparent;
  font-size: 1.25rem;
  color: white;
  text-shadow: 0 1px 4px rgb(1, 10, 14), 0 2px 8px rgb(255, 233, 0), 0 3px 16px rgb(255, 255, 255);
  margin-bottom: 2rem;
}

.services-section {
  padding: 4rem 5%;
  max-width: 1200px;
  margin: 0 auto;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.service-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.service-card:hover {
  transform: translateY(-5px);
}

.service-icon {
  margin-bottom: 1.5rem;
  color: #007bff;
}

.service-card h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #333;
}

.service-card p {
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.features-list {
  list-style: none;
  padding: 0;
  margin-bottom: 1.5rem;
}

.features-list li {
  padding: 0.5rem 0;
  color: #555;
  display: flex;
  align-items: center;
}

.features-list li::before {
  content: "•";
  color: #007bff;
  margin-right: 0.5rem;
}

.rate-info {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.rate {
  color: #e74c3c;
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  background: transparent;
}

.term {
  background: transparent;
  color: #666;
  font-size: 0.9rem;
}

.consult-button {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  width: 100%;
}

.consult-button:hover {
  background: #0056b3;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h2 {
  margin-bottom: 1rem;
  color: #333;
}

.consult-form {
  margin: 2rem 0;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group textarea {
  height: 100px;
  resize: vertical;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.cancel-button,
.confirm-button {
  padding: 0.8rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-button {
  background: #f8f9fa;
  color: #333;
  border: 1px solid #ddd;
}

.confirm-button {
  background: #007bff;
  color: white;
  border: none;
}

.cancel-button:hover {
  background: #e9ecef;
}

.confirm-button:hover {
  background: #0056b3;
}

@media (max-width: 768px) {
  .hero-section {
    height: 300px;
  }

  .hero-content h1 {
    font-size: 2rem;
  }

  .services-section {
    padding: 2rem 20px;
  }

  .service-card {
    padding: 1.5rem;
  }
}
</style>
