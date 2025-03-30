<script setup lang="ts">
import { ref } from 'vue'

interface ServiceCenter {
  id: number
  name: string
  address: string
  phone: string
  hours: string
  services: string[]
  latitude: number
  longitude: number
}

interface FaqItem {
  question: string
  answer: string
}

const activeTab = ref(0)
const activeAccordion = ref(-1)
const showContactForm = ref(false)
const formSubmitted = ref(false)

const serviceCenters = ref<ServiceCenter[]>([
  {
    id: 1,
    name: '北京中央服务中心',
    address: '北京市朝阳区建国路88号',
    phone: '010-12345678',
    hours: '周一至周日 8:00-20:00',
    services: ['常规保养', '故障诊断', '零部件更换', '车辆改装', '全车美容'],
    latitude: 39.9042,
    longitude: 116.4074
  },
  {
    id: 2,
    name: '上海旗舰服务中心',
    address: '上海市浦东新区世纪大道1号',
    phone: '021-87654321',
    hours: '周一至周日 8:00-20:00',
    services: ['常规保养', '故障诊断', '零部件更换', '车辆改装', '全车美容'],
    latitude: 31.2304,
    longitude: 121.4737
  },
  {
    id: 3,
    name: '广州服务中心',
    address: '广州市天河区天河路385号',
    phone: '020-98765432',
    hours: '周一至周日 8:30-19:30',
    services: ['常规保养', '故障诊断', '零部件更换', '车辆改装'],
    latitude: 23.1291,
    longitude: 113.2644
  }
])

const faqItems = ref<FaqItem[]>([
  {
    question: '新车首次保养应该在什么时候进行？',
    answer: '新车首次保养一般在行驶5000公里或购车后6个月内进行，以先到达者为准。首次保养主要检查车辆各系统运行状况，更换机油和机滤，确保车辆在磨合期后能够正常运行。建议您按照车辆使用手册中的建议时间进行保养。'
  },
  {
    question: '售后服务的预约方式有哪些？',
    answer: '您可以通过以下几种方式预约售后服务：1. 官方网站在线预约；2. 拨打全国统一服务热线；3. 通过官方APP进行预约；4. 直接前往就近的授权服务中心咨询预约。预约时请准备好您的车架号、行驶里程以及具体需求，以便我们更好地为您安排服务。'
  },
  {
    question: '车辆保修期是多久？',
    answer: '我们的标准保修期为整车5年或10万公里（以先到达者为准）。动力总成系统享有8年或15万公里的延长保修。电池系统提供8年或20万公里的质保。具体保修内容和条款可能因车型和购买时间有所不同，详情请参考您的车辆保修手册或咨询客服人员。'
  },
  {
    question: '如何申请道路救援服务？',
    answer: '当您的车辆在道路上发生故障或事故需要救援时，可以拨打我们24小时道路救援热线。请提供您的车架号、位置信息和故障描述，我们会根据您的位置派遣最近的救援人员前往协助。所有在保修期内的车辆均享有免费道路救援服务，保修期外的车辆则需支付相应费用。'
  },
  {
    question: '是否提供上门服务？',
    answer: '是的，我们提供上门服务。对于日常保养和小型维修，您可以预约上门服务。我们的技师会在约定时间前往您指定的地点进行服务。上门服务需提前48小时预约，并可能受到服务区域限制。部分复杂维修项目可能无法通过上门服务完成，需要车辆到店进行。'
  },
  {
    question: '如何查询零配件的真伪？',
    answer: '所有原厂零配件都带有专属防伪标识。您可以通过以下方式验证零配件真伪：1. 扫描零配件包装上的QR码；2. 在官方APP中输入零配件编号进行查询；3. 联系我们的客服中心提供零配件编号进行核验。我们强烈建议您只在授权服务中心或官方渠道购买零配件，以确保质量和安全。'
  }
])

const contactInfo = ref({
  name: '',
  phone: '',
  email: '',
  vinCode: '',
  category: '',
  message: ''
})

const submitForm = () => {
  // 实际应用中这里会发送API请求
  console.log('提交联系信息:', contactInfo.value)
  formSubmitted.value = true
  setTimeout(() => {
    formSubmitted.value = false
    showContactForm.value = false
    contactInfo.value = {
      name: '',
      phone: '',
      email: '',
      vinCode: '',
      category: '',
      message: ''
    }
  }, 3000)
}

const toggleAccordion = (index: number) => {
  activeAccordion.value = activeAccordion.value === index ? -1 : index
}

// 模拟初始化地图的函数，实际应用中会使用真实的地图API
// const initMap = () => {
//   console.log('地图初始化')
// }
</script>

<template>
  <div class="aftersales-page">
    <!-- 顶部横幅 -->
    <section class="hero-content">
      <h1>一站式售后服务</h1>
      <p>全方位守护您的用车体验</p>
      <button class="primary-btn" @click="showContactForm = true">联系我们
      </button>
    </section>

    <!-- 服务类别标签页 -->
    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2>我们的服务</h2>
          <p>提供全面、专业、高效的售后服务体系</p>
        </div>

        <div class="tabs">
          <div class="tab-nav">
            <button
                class="tab-btn"
                :class="{ active: activeTab === 0 }"
                @click="activeTab = 0"
            >
              保修服务
            </button>
            <button
                class="tab-btn"
                :class="{ active: activeTab === 1 }"
                @click="activeTab = 1"
            >
              道路救援
            </button>
            <button
                class="tab-btn"
                :class="{ active: activeTab === 2 }"
                @click="activeTab = 2"
            >
              零配件服务
            </button>
            <button
                class="tab-btn"
                :class="{ active: activeTab === 3 }"
                @click="activeTab = 3"
            >
              增值服务
            </button>
          </div>

          <div class="tab-content">
            <!-- 保修服务 -->
            <div v-show="activeTab === 0" class="tab-pane">
              <div class="service-content">
                <div class="service-image">
                  <img src="/service/repair.png" alt="保修服务" />
                </div>
                <div class="service-details">
                  <h3>全面保修政策</h3>
                  <p>我们为所有新车提供全面的保修服务，让您无忧驾驶。</p>
                  <ul class="service-list">
                    <li>整车5年或10万公里质保</li>
                    <li>动力总成8年或15万公里延长质保</li>
                    <li>电池系统8年或20万公里质保</li>
                    <li>免费获取软件升级</li>
                    <li>24小时技术支持</li>
                  </ul>
                  <button class="outline-btn">了解更多</button>
                </div>
              </div>
            </div>

            <!-- 道路救援 -->
            <div v-show="activeTab === 1" class="tab-pane">
              <div class="service-content">
                <div class="service-image">
                  <img src="/service/road.png" alt="道路救援" />
                </div>
                <div class="service-details">
                  <h3>全天候道路救援</h3>
                  <p>无论您身在何处，我们的救援团队随时待命，为您提供及时救助。</p>
                  <ul class="service-list">
                    <li>24/7全天候救援服务</li>
                    <li>全国范围内60分钟响应</li>
                    <li>现场维修支持</li>
                    <li>免费拖车服务（100公里内）</li>
                    <li>临时交通安排</li>
                  </ul>
                  <div class="emergency-contact">
                    <p class="contact-label">救援热线：</p>
                    <p class="contact-number">400-888-8888</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 零配件服务 -->
            <div v-show="activeTab === 2" class="tab-pane">
              <div class="service-content">
                <div class="service-image">
                  <img src="/service/part.png" alt="零配件服务" />
                </div>
                <div class="service-details">
                  <h3>原厂零配件供应</h3>
                  <p>提供原装进口零配件，保证品质与车辆完美兼容。</p>
                  <ul class="service-list">
                    <li>全球原厂配件网络</li>
                    <li>48小时快速配送</li>
                    <li>一年质保期</li>
                    <li>防伪溯源系统</li>
                    <li>线上配件商城</li>
                  </ul>
                  <button class="outline-btn">查询配件</button>
                </div>
              </div>
            </div>

            <!-- 增值服务 -->
            <div v-show="activeTab === 3" class="tab-pane">
              <div class="service-content">
                <div class="service-image">
                  <img src="/brand/ultra.png" alt="增值服务" />
                </div>
                <div class="service-details">
                  <h3>尊享增值服务</h3>
                  <p>享受更多专属定制服务，提升您的用车体验。</p>
                  <ul class="service-list">
                    <li>车辆美容护理</li>
                    <li>定制改装方案</li>
                    <li>软件定制升级</li>
                    <li>专属技师服务</li>
                    <li>会员积分计划</li>
                  </ul>
                  <button class="outline-btn">加入会员</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 服务中心地图 -->
    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2>服务中心</h2>
          <p>遍布全国的服务网络，随时随地为您提供支持</p>
        </div>

        <div class="service-centers">
          <div class="centers-list">
            <div
                v-for="center in serviceCenters"
                :key="center.id"
                class="center-card"
            >
              <h3>{{ center.name }}</h3>
              <p class="center-info"><span class="info-label">地址：</span>{{ center.address }}</p>
              <p class="center-info"><span class="info-label">电话：</span>{{ center.phone }}</p>
              <p class="center-info"><span class="info-label">营业时间：</span>{{ center.hours }}</p>
              <div class="center-services">
                <p class="info-label">服务项目：</p>
                <div class="service-tags">
                  <span
                      v-for="(service, index) in center.services"
                      :key="index"
                      class="service-tag"
                  >
                    {{ service }}
                  </span>
                </div>
              </div>
              <button class="outline-btn">预约服务</button>
            </div>
          </div>

          <div class="centers-map" ref="mapContainer">
            <!-- 地图将通过JS初始化，这里是容器 -->
            <div class="map-placeholder">
              <p>地图加载中...</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 常见问题 -->
    <section class="section bg-light">
      <div class="container">
        <div class="section-header">
          <h2>常见问题</h2>
          <p>解答您关心的热门问题</p>
        </div>

        <div class="faq-accordion">
          <div
              v-for="(item, index) in faqItems"
              :key="index"
              class="accordion-item"
              :class="{ active: activeAccordion === index }"
          >
            <div class="accordion-header" @click="toggleAccordion(index)">
              <h3>{{ item.question }}</h3>
              <span class="accordion-icon">
                {{ activeAccordion === index ? '−' : '+' }}
              </span>
            </div>
            <div
                class="accordion-content"
                :style="{ display: activeAccordion === index ? 'block' : 'none' }"
            >
              <p>{{ item.answer }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 联系我们表单 (弹窗) -->
    <div class="modal" v-if="showContactForm">
      <div class="modal-overlay" @click="showContactForm = false"></div>
      <div class="modal-container">
        <button class="modal-close" @click="showContactForm = false">&times;</button>

        <div class="modal-header">
          <h2>联系我们</h2>
          <p>请填写以下表格，我们将尽快与您联系</p>
        </div>

        <div v-if="!formSubmitted" class="modal-body">
          <form @submit.prevent="submitForm" class="contact-form">
            <div class="form-group">
              <label for="name">姓名</label>
              <input
                  type="text"
                  id="name"
                  v-model="contactInfo.name"
                  required
                  placeholder="请输入您的姓名"
              />
            </div>

            <div class="form-group">
              <label for="phone">电话</label>
              <input
                  type="tel"
                  id="phone"
                  v-model="contactInfo.phone"
                  required
                  placeholder="请输入您的联系电话"
              />
            </div>

            <div class="form-group">
              <label for="email">邮箱</label>
              <input
                  type="email"
                  id="email"
                  v-model="contactInfo.email"
                  placeholder="请输入您的电子邮箱"
              />
            </div>

            <div class="form-group">
              <label for="vinCode">车架号</label>
              <input
                  type="text"
                  id="vinCode"
                  v-model="contactInfo.vinCode"
                  placeholder="选填，请输入您的车架号"
              />
            </div>

            <div class="form-group">
              <label for="category">问题类别</label>
              <select id="category" v-model="contactInfo.category" required>
                <option value="">请选择问题类别</option>
                <option value="maintenance">保养维修</option>
                <option value="parts">零配件咨询</option>
                <option value="warranty">保修政策</option>
                <option value="roadside">道路救援</option>
                <option value="other">其他问题</option>
              </select>
            </div>

            <div class="form-group">
              <label for="message">问题描述</label>
              <textarea
                  id="message"
                  v-model="contactInfo.message"
                  required
                  placeholder="请详细描述您的问题或需求"
                  rows="4"
              ></textarea>
            </div>

            <button type="submit" class="primary-btn">提交</button>
          </form>
        </div>

        <div v-else class="modal-body">
          <div class="success-message">
            <div class="success-icon">✓</div>
            <h3>提交成功</h3>
            <p>感谢您的反馈，我们将尽快与您联系！</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 基础样式 */
* {
  color: #1a1a1a;
  background-color: white;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
  color: #333;
  line-height: 1.6;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}

/* 按钮样式 */
.primary-btn {
  background-color: #0066cc;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.primary-btn:hover {
  background-color: #0055aa;
}

.outline-btn {
  background-color: transparent;
  color: #0066cc;
  border: 1px solid #0066cc;
  padding: 10px 20px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.outline-btn:hover {
  background-color: #f0f7ff;
}

/* 区块样式 */
.section {
  padding: 60px 0;
}

.section-header {
  text-align: center;
  margin-bottom: 40px;
}

.section-header h2 {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 10px;
}

.section-header p {
  font-size: 16px;
  color: #666;
}

.bg-light {
  background-color: #f8f9fa;
}

/* 顶部横幅 */
.hero-content {
  background-image: linear-gradient(rgba(0, 0, 0, 0.52), rgba(255, 255, 255, 0)), url('/brand/ultra.png');
  background-size: cover;
  background-position: center;
  padding: 120px 0;
  text-align: center;
}

.hero-content h1 {
  color: white;
  text-shadow: 0 2px 4px rgb(122, 255, 241);
  background-color: transparent;
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 16px;
}

.hero-content p {
  background-color:transparent;
  color: white;
  font-size: 20px;
  margin-bottom: 24px;
}

/* 标签页样式 */
.tabs {
  margin-bottom: 40px;
}

.tab-nav {
  display: flex;
  border-bottom: 1px solid #ddd;
  margin-bottom: 20px;
}

.tab-btn {
  padding: 12px 24px;
  background: none;
  border: none;
  font-size: 16px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
}

.tab-btn.active {
  color: #0066cc;
  border-bottom: 2px solid #0066cc;
}

.tab-btn:hover {
  color: #0066cc;
}

.service-content {
  display: flex;
  align-items: center;
  gap: 40px;
}

.service-image {
  flex: 1;
  border-radius: 8px;
  overflow: hidden;
}

.service-image img {
  width: 100%;
  height: auto;
  display: block;
}

.service-details {
  flex: 1;
}

.service-details h3 {
  font-size: 24px;
  margin-bottom: 16px;
}

.service-details p {
  margin-bottom: 20px;
  color: #666;
}

.service-list {
  list-style: none;
  margin-bottom: 24px;
}

.service-list li {
  padding-left: 24px;
  position: relative;
  margin-bottom: 10px;
}

.service-list li:before {
  content: "✓";
  color: #0066cc;
  position: absolute;
  left: 0;
}

.emergency-contact {
  background-color: #f0f7ff;
  padding: 16px;
  border-radius: 8px;
  margin-top: 24px;
}

.contact-label {
  background-color: transparent;
  font-weight: 500;
  margin-bottom: 4px;
}

.contact-number {
  background-color: transparent;
  font-size: 24px;
  font-weight: 700;
  color: #0066cc;
}

/* 服务中心样式 */
.service-centers {
  display: flex;
  gap: 30px;
}

.centers-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.center-card {
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 20px;
}

.center-card h3 {
  font-size: 20px;
  margin-bottom: 16px;
}

.center-info {
  margin-bottom: 8px;
}

.info-label {
  font-weight: 500;
  color: #666;
}

.center-services {
  margin-top: 12px;
  margin-bottom: 16px;
}

.service-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.service-tag {
  background-color: #f0f7ff;
  color: #0066cc;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 14px;
}

.centers-map {
  flex: 1;
  min-height: 400px;
  background-color: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

.map-placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
}

/* FAQ 手风琴样式 */
.faq-accordion {
  max-width: 800px;
  margin: 0 auto;
}

.accordion-item {
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
}

.accordion-header {
  padding: 16px 20px;
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.accordion-header h3 {
  font-size: 18px;
  font-weight: 500;
}

.accordion-icon {
  font-size: 24px;
  color: #0066cc;
}

.accordion-content {
  padding: 0 20px 20px;
  border-top: 1px solid #eee;
}

.accordion-item.active .accordion-header {
  background-color: #f0f7ff;
}

/* 弹窗样式 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-container {
  position: relative;
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  z-index: 1001;
}

.modal-close {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
  text-align: center;
}

.modal-body {
  padding: 20px;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 6px;
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.form-group textarea {
  resize: vertical;
}

.success-message {
  text-align: center;
  padding: 20px;
}

.success-icon {
  background-color: #4caf50;
  color: white;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  margin: 0 auto 16px;
}

.success-message h3 {
  font-size: 20px;
  margin-bottom: 8px;
}

.success-message p {
  color: #666;
}



/* 响应式设计 */
@media (max-width: 992px) {
  .service-content {
    flex-direction: column;
  }

  .service-centers {
    flex-direction: column;
  }

  .centers-map {
    min-height: 300px;
  }
}

@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 36px;
  }

  .tab-nav {
    flex-wrap: wrap;
  }

  .tab-btn {
    flex: 1;
    min-width: 120px;
    text-align: center;
  }


}

@media (max-width: 576px) {
  .section {
    padding: 40px 0;
  }

  .hero-banner {
    padding: 80px 0;
  }

  .hero-content h1 {
    font-size: 28px;
  }

  .service-list li {
    padding-left: 20px;
  }
}
</style>
