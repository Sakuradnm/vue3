<template>
  <div class="reserve-container">
    <h1 class="reserve-title">预约试驾体验</h1>

    <!-- 车型选择部分 -->
    <div class="car-selection">
      <h2>选择您的车型</h2>
      <div class="car-list">
        <div
          v-for="(car, index) in carModels"
          :key="car.id"
          class="car-item"
          :class="{ 'active': selectedCar === car.id }"
          @click="selectCar(car.id)"
        >
          <div class="car-image">
            <img :src="car.image" :alt="car.name">
          </div>
          <div class="car-info">
            <h3>{{ car.name }}</h3>
            <p class="car-price">{{ car.price }}</p>
            <p class="car-desc">{{ car.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 预约信息填写 -->
    <div class="reservation-form">
      <h2>填写预约信息</h2>
      <form @submit.prevent="submitReservation">
        <div class="form-group">
          <label for="name">您的姓名</label>
          <input
            type="text"
            id="name"
            v-model="formData.name"
            placeholder="请输入您的姓名"
            required
          >
        </div>

        <div class="form-group">
          <label for="phone">联系电话</label>
          <input
            type="tel"
            id="phone"
            v-model="formData.phone"
            placeholder="请输入您的手机号码"
            required
          >
        </div>

        <div class="form-group">
          <label for="email">电子邮箱</label>
          <input
            type="email"
            id="email"
            v-model="formData.email"
            placeholder="请输入您的电子邮箱"
          >
        </div>

        <div class="form-row">
          <div class="form-group date-picker">
            <label for="date">预约日期</label>
            <input
              type="date"
              id="date"
              v-model="formData.date"
              :min="minDate"
              required
            >
          </div>

          <div class="form-group time-picker">
            <label for="time">预约时间</label>
            <select
              id="time"
              v-model="formData.time"
              required
            >
              <option value="" disabled>请选择时间</option>
              <option v-for="time in availableTimes" :key="time" :value="time">
                {{ time }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label for="location">试驾城市</label>
          <select
            id="location"
            v-model="formData.location"
            required
          >
            <option value="" disabled>请选择城市</option>
            <option v-for="city in cities" :key="city.value" :value="city.value">
              {{ city.label }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="dealer">经销商</label>
          <select
            id="dealer"
            v-model="formData.dealer"
            required
            :disabled="!formData.location"
          >
            <option value="" disabled>请选择经销商</option>
            <option v-for="dealer in filteredDealers" :key="dealer.id" :value="dealer.id">
              {{ dealer.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="remark">备注信息</label>
          <textarea
            id="remark"
            v-model="formData.remark"
            placeholder="如有特殊需求，请在此说明"
            rows="3"
          ></textarea>
        </div>

        <div class="agreement">
          <input
            type="checkbox"
            id="agreement"
            v-model="formData.agreement"
            required
          >
          <label for="agreement">
            我已阅读并同意<a @click.prevent="showPrivacyPolicy">《个人信息保护政策》</a>
          </label>
        </div>

        <div class="submit-section">
          <button
            type="submit"
            class="submit-btn"
            :disabled="isSubmitting || !formIsValid"
          >
            {{ isSubmitting ? '提交中...' : '立即预约' }}
          </button>
        </div>
      </form>
    </div>

    <!-- 试驾流程介绍 -->
    <div class="test-drive-process">
      <h2>试驾流程</h2>
      <div class="process-steps">
        <div class="step" v-for="(step, index) in testDriveSteps" :key="index">
          <div class="step-icon">
            <span class="step-number">{{ index + 1 }}</span>
          </div>
          <div class="step-content">
            <h3>{{ step.title }}</h3>
            <p>{{ step.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 私隐政策弹窗 -->
    <div class="modal" v-if="showPolicy">
      <div class="modal-content">
        <div class="modal-header">
          <h2>个人信息保护政策</h2>
          <span class="close" @click="showPolicy = false">&times;</span>
        </div>
        <div class="modal-body">
          <p>感谢您信任并使用我们的预约试驾服务。我们非常重视您的个人信息和隐私保护。</p>
          <p>1. 信息收集：我们收集您的姓名、联系方式等信息仅用于试驾预约服务。</p>
          <p>2. 信息使用：您提供的信息将用于安排试驾、确认预约及提供相关服务。</p>
          <p>3. 信息保护：我们采用严格的安全措施保护您的个人信息不被未授权访问。</p>
          <p>4. 信息共享：除非获得您的明确同意，我们不会与第三方共享您的个人信息。</p>
          <p>5. 您的权利：您有权查询、修改或要求删除您的个人信息。</p>
        </div>
        <div class="modal-footer">
          <button @click="showPolicy = false">我已了解</button>
        </div>
      </div>
    </div>

    <!-- 预约成功弹窗 -->
    <div class="modal success-modal" v-if="reservationSuccess">
      <div class="modal-content">
        <div class="modal-header">
          <h2>预约成功</h2>
        </div>
        <div class="modal-body">
          <div class="success-icon">✓</div>
          <p>您的试驾预约已成功提交！</p>
          <p>我们的客服人员将在24小时内与您联系确认详情。</p>
          <p>预约信息：</p>
          <ul>
            <li><strong>车型：</strong>{{ getSelectedCarName() }}</li>
            <li><strong>时间：</strong>{{ formData.date }} {{ formData.time }}</li>
            <li><strong>地点：</strong>{{ getLocationAndDealerName() }}</li>
          </ul>
        </div>
        <div class="modal-footer">
          <button @click="closeSuccessModal">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue';

// 定义数据模型
interface CarModel {
  id: number;
  name: string;
  price: string;
  description: string;
  image: string;
}

interface City {
  value: string;
  label: string;
}

interface Dealer {
  id: number;
  cityCode: string;
  name: string;
  address: string;
  phone: string;
}

interface TestDriveStep {
  title: string;
  description: string;
}

interface ReservationForm {
  name: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  location: string;
  dealer: number | null;
  remark: string;
  agreement: boolean;
}

// 车型数据
const carModels = ref<CarModel[]>([
  {
    id: 1,
    name: '豪华轿车 A8',
    price: '￥299,999 起',
    description: '豪华商务座驾，卓越驾驶体验',
    image: '/models/model-x.jpg'
  },
  {
    id: 2,
    name: '运动轿跑 RS7',
    price: '758,000元起',
    description: '激情与优雅的完美结合',
    image: '/images/cars/coupe-rs7.jpg'
  },
  {
    id: 3,
    name: '豪华SUV Q7',
    price: '558,000元起',
    description: '宽敞内部空间，全地形适应性强',
    image: '/images/cars/suv-q7.jpg'
  },
  {
    id: 4,
    name: '丰田 SUPRA',
    price: '498,000元起',
    description: '零排放环保科技，智能驾驶辅助',
    image: '/models/supra.jpg'
  },
  {
    id: 5,
    name: '丰田 SUPRA',
    price: '498,000元起',
    description: '零排放环保科技，智能驾驶辅助',
    image: '/models/supra.jpg'
  },
  {
    id: 6,
    name: '丰田 SUPRA',
    price: '498,000元起',
    description: '零排放环保科技，智能驾驶辅助',
    image: '/models/supra.jpg'
  }
]);

// 可用时间
const availableTimes = [
  '09:00-10:00', '10:00-11:00', '11:00-12:00',
  '14:00-15:00', '15:00-16:00', '16:00-17:00'
];

// 城市列表
const cities = ref<City[]>([
  { value: 'BJ', label: '北京' },
  { value: 'SH', label: '上海' },
  { value: 'GZ', label: '广州' },
  { value: 'SZ', label: '深圳' },
  { value: 'CD', label: '成都' },
  { value: 'HZ', label: '杭州' }
]);

// 经销商列表
const dealers = ref<Dealer[]>([
  { id: 1, cityCode: 'BJ', name: '北京海淀旗舰店', address: '北京市海淀区西三环北路25号', phone: '010-12345678' },
  { id: 2, cityCode: 'BJ', name: '北京朝阳4S店', address: '北京市朝阳区东四环南路168号', phone: '010-87654321' },
  { id: 3, cityCode: 'SH', name: '上海浦东展示中心', address: '上海市浦东新区张杨路580号', phone: '021-12345678' },
  { id: 4, cityCode: 'SH', name: '上海虹桥专卖店', address: '上海市闵行区虹桥路1118号', phone: '021-87654321' },
  { id: 5, cityCode: 'GZ', name: '广州天河体验店', address: '广州市天河区天河路385号', phone: '020-12345678' },
  { id: 6, cityCode: 'SZ', name: '深圳南山旗舰店', address: '深圳市南山区科技园路10号', phone: '0755-12345678' },
  { id: 7, cityCode: 'CD', name: '成都锦江展示中心', address: '成都市锦江区红星路三段99号', phone: '028-12345678' },
  { id: 8, cityCode: 'HZ', name: '杭州西湖专卖店', address: '杭州市西湖区文一西路522号', phone: '0571-12345678' }
]);

// 试驾流程
const testDriveSteps = ref<TestDriveStep[]>([
  {
    title: '在线预约',
    description: '填写并提交预约信息，选择您感兴趣的车型和合适的时间'
  },
  {
    title: '信息确认',
    description: '我们的客服人员将与您联系，确认试驾详情'
  },
  {
    title: '到店试驾',
    description: '前往指定经销商，携带有效驾驶证和身份证'
  },
  {
    title: '专业讲解',
    description: '销售顾问将为您详细介绍车辆特性及操作方式'
  },
  {
    title: '试驾体验',
    description: '在专业人员陪同下，亲身体验驾驶乐趣'
  }
]);

// 表单数据
const formData = ref<ReservationForm>({
  name: '',
  phone: '',
  email: '',
  date: '',
  time: '',
  location: '',
  dealer: null,
  remark: '',
  agreement: false
});

// 状态管理
const selectedCar = ref<number>(1);
const isSubmitting = ref<boolean>(false);
const showPolicy = ref<boolean>(false);
const reservationSuccess = ref<boolean>(false);

// 计算属性
const minDate = computed(() => {
  const today = new Date();
  return today.toISOString().split('T')[0];
});

const filteredDealers = computed(() => {
  if (!formData.value.location) return [];
  return dealers.value.filter(dealer => dealer.cityCode === formData.value.location);
});

const formIsValid = computed(() => {
  return (
    formData.value.name.trim() !== '' &&
    formData.value.phone.trim() !== '' &&
    formData.value.date !== '' &&
    formData.value.time !== '' &&
    formData.value.location !== '' &&
    formData.value.dealer !== null &&
    formData.value.agreement
  );
});

// 方法
const selectCar = (carId: number) => {
  selectedCar.value = carId;
};

const showPrivacyPolicy = () => {
  showPolicy.value = true;
};

const getSelectedCarName = (): string => {
  const car = carModels.value.find(c => c.id === selectedCar.value);
  return car ? car.name : '';
};

const getLocationAndDealerName = (): string => {
  const city = cities.value.find(c => c.value === formData.value.location);
  const dealer = dealers.value.find(d => d.id === formData.value.dealer);

  if (city && dealer) {
    return `${city.label} - ${dealer.name}`;
  }
  return '';
};

const submitReservation = async () => {
  isSubmitting.value = true;
  try {
    // 这里是模拟API调用，实际开发中应替换为真实的API请求
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 模拟成功响应
    reservationSuccess.value = true;

    // 重置表单
    // formData.value = {
    //   name: '',
    //   phone: '',
    //   email: '',
    //   date: '',
    //   time: '',
    //   location: '',
    //   dealer: null,
    //   remark: '',
    //   agreement: false
    // };
  } catch (error) {
    console.error('预约提交失败', error);
    // 在实际应用中，应添加错误处理逻辑
  } finally {
    isSubmitting.value = false;
  }
};

const closeSuccessModal = () => {
  reservationSuccess.value = false;

  // 重置表单
  formData.value = {
    name: '',
    phone: '',
    email: '',
    date: '',
    time: '',
    location: '',
    dealer: null,
    remark: '',
    agreement: false
  };
};

// 监听城市变化，重置经销商选择
watch(() => formData.value.location, () => {
  formData.value.dealer = null;
});

// 生命周期钩子
onMounted(() => {
  // 可以在这里添加初始化逻辑，比如从API获取数据等
});
</script>

<style scoped>
.reserve-container {
  margin-top: 72px;
  max-width: 1200px;
  padding: 2rem 1rem;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  color: #333;
}

.reserve-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: #1a1a1a;
  font-weight: 600;
}

/* 车型选择样式 */
.car-selection {
  margin-bottom: 3rem;
}

.car-selection h2 {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  position: relative;
  padding-bottom: 0.5rem;
}

.car-selection h2:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 3px;
  background-color: #0066cc;
}

.car-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
}

.car-item {
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  background-color: #fff;
}

.car-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
}

.car-item.active {
  border: 2px solid #0066cc;
}

.car-image {
  height: 180px;
  overflow: hidden;
}

.car-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.car-item:hover .car-image img {
  transform: scale(1.05);
}

.car-info {
  padding: 1.5rem;
}

.car-info h3 {
  margin: 0 0 0.5rem;
  font-size: 1.4rem;
  font-weight: 600;
}

.car-price {
  font-size: 1.2rem;
  color: #e63946;
  margin-bottom: 0.8rem;
  font-weight: 600;
}

.car-desc {
  font-size: 0.9rem;
  color: #666;
  line-height: 1.5;
}

/* 表单样式 */
.reservation-form {
  background-color: #f8f9fa;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 3rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.reservation-form h2 {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  position: relative;
  padding-bottom: 0.5rem;
}

.reservation-form h2:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 3px;
  background-color: #0066cc;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-row .form-group {
  flex: 1;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #1a1a1a;
}

input[type="text"],
input[type="tel"],
input[type="email"],
input[type="date"],
select,
textarea {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #0066cc;
  box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.2);
}

.agreement {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
}

.agreement input[type="checkbox"] {
  margin-right: 0.5rem;
}

.agreement a {
  color: #0066cc;
  text-decoration: none;
  cursor: pointer;
}

.agreement a:hover {
  text-decoration: underline;
}

.submit-btn {
  background-color: #0066cc;
  color: white;
  border: none;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
  width: 100%;
  font-weight: bold;
}

.submit-btn:hover {
  background-color: #004c99;
}

.submit-btn:disabled {
  background-color: #85b1e0;
  cursor: not-allowed;
}

/* 试驾流程样式 */
.test-drive-process {
  margin-bottom: 3rem;
}

.test-drive-process h2 {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  position: relative;
  padding-bottom: 0.5rem;
}

.test-drive-process h2:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 3px;
  background-color: #0066cc;
}

.process-steps {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: space-between;
}

.step {
  flex: 1;
  min-width: 200px;
  display: flex;
  gap: 1rem;
  background-color: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s;
}

.step:hover {
  transform: translateY(-5px);
}

.step-icon {
  width: 50px;
  height: 50px;
  background-color: #0066cc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
  flex-shrink: 0;
}

.step-content {
  flex-grow: 1;
}

.step-content h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
}

.step-content p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
}

/* 弹窗样式 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: #fff;
  border-radius: 10px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: auto;
  box-shadow: 0 5px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.close {
  font-size: 1.8rem;
  cursor: pointer;
  color: #777;
}

.modal-body {
  padding: 1.5rem;
  line-height: 1.6;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #eee;
  text-align: right;
}

.modal-footer button {
  background-color: #0066cc;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.modal-footer button:hover {
  background-color: #004c99;
}

/* 预约成功弹窗 */
.success-modal .modal-body {
  text-align: center;
}

.success-icon {
  font-size: 3rem;
  color: #4CAF50;
  margin-bottom: 1rem;
  height: 80px;
  width: 80px;
  background-color: rgba(76, 175, 80, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.success-modal ul {
  text-align: left;
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.success-modal li {
  margin-bottom: 0.5rem;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }

  .process-steps {
    flex-direction: column;
  }

  .car-list {
    grid-template-columns: 1fr;
  }
}
</style>
