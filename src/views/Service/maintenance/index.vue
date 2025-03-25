<script setup lang="ts">
import { ref } from 'vue'

interface MaintenanceService {
  title: string
  description: string
  icon: string
  features: string[]
}

const maintenanceServices = ref<MaintenanceService[]>([
  {
    title: '定期保养',
    description: '专业的定期保养服务，确保您的爱车始终保持最佳状态',
    icon: 'clock',
    features: [
      '机油更换',
      '滤芯更换',
      '制动系统检查',
      '轮胎检查与平衡'
    ]
  },
  {
    title: '系统诊断',
    description: '使用先进的诊断设备，全面检查车辆各个系统',
    icon: 'service',
    features: [
      '发动机诊断',
      '变速箱检查',
      '电气系统检测',
      '排放系统检查'
    ]
  },
  {
    title: '预防性维护',
    description: '提前发现并解决潜在问题，预防故障发生',
    icon: 'warranty',
    features: [
      '冷却系统检查',
      '转向系统检查',
      '悬挂系统检查',
      '电池检查'
    ]
  }
])

const selectedService = ref<MaintenanceService | null>(null)
const showBookingModal = ref(false)

const openBookingModal = (service: MaintenanceService) => {
  selectedService.value = service
  showBookingModal.value = true
}

const closeBookingModal = () => {
  showBookingModal.value = false
  selectedService.value = null
}
</script>

<template>
  <div class="maintenance-page">
    <!-- 页面标题 -->
    <section class="hero-section">
      <div class="hero-content">
        <h1>专业保养服务</h1>
        <p>为您的爱车提供全方位的专业保养服务，确保安全与性能</p>
      </div>
    </section>

    <!-- 服务列表 -->
    <section class="services-section">
      <div class="services-grid">
        <div v-for="service in maintenanceServices" :key="service.title" class="service-card">
          <div class="service-icon">
            <svg-icon :name="service.icon" :width="48" height="48" />
          </div>
          <h2>{{ service.title }}</h2>
          <p>{{ service.description }}</p>
          <ul class="features-list">
            <li v-for="feature in service.features" :key="feature">{{ feature }}</li>
          </ul>
          <button class="book-button" @click="openBookingModal(service)">
            预约服务
          </button>
        </div>
      </div>
    </section>

    <!-- 预约模态框 -->
    <div v-if="showBookingModal" class="modal-overlay" @click="closeBookingModal">
      <div class="modal-content" @click.stop>
        <h2>预约{{ selectedService?.title }}</h2>
        <p>{{ selectedService?.description }}</p>
        <div class="booking-form">
          <div class="form-group">
            <label>姓名</label>
            <input type="text" placeholder="请输入您的姓名" />
          </div>
          <div class="form-group">
            <label>联系电话</label>
            <input type="tel" placeholder="请输入您的联系电话" />
          </div>
          <div class="form-group">
            <label>预约日期</label>
            <input type="date" />
          </div>
          <div class="form-group">
            <label>预约时间</label>
            <select>
              <option value="09:00">09:00</option>
              <option value="10:00">10:00</option>
              <option value="11:00">11:00</option>
              <option value="14:00">14:00</option>
            </select>
          </div>
          <div class="form-group">
            <label>备注信息</label>
            <textarea placeholder="请输入其他需求或问题"></textarea>
          </div>
        </div>
        <div class="modal-actions">
          <button class="cancel-button" @click="closeBookingModal">取消</button>
          <button class="confirm-button">确认预约</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.maintenance-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.hero-section {
  height: 400px;
  background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
              url('/home/performance-bg.jpg') center/cover;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
}

.hero-content {
  max-width: 800px;
  padding: 0 20px;
}

.hero-content h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.hero-content p {
  font-size: 1.2rem;
  opacity: 0.9;
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

.book-button {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  width: 100%;
}

.book-button:hover {
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

.booking-form {
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
.form-group select,
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
