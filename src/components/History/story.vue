// NissanBrand.vue
<template>
  <div class="nissan-brand">
    <!-- 一、品牌核心理念 -->
    <section class="core-concept">
      <h2>{{ concepts.title }}</h2>
      <div class="concept-grid">
        <div v-for="(item, index) in concepts.items" :key="index">
          <h3>{{ item.title }}</h3>
          <p>{{ item.content }}</p>
        </div>
      </div>
    </section>

    <!-- 二、交互式时间轴 -->
    <section class="history-timeline">
      <h2>品牌发展历程</h2>
      <div class="timeline-container">
        <div
            v-for="event in historyEvents"
            :key="event.year"
            class="timeline-node"
            @click="selectEvent(event)"
            :class="{ active: selectedEvent?.year === event.year }"
        >
          <div class="year">{{ event.year }}</div>
          <transition name="fade">
            <div v-if="selectedEvent?.year === event.year" class="event-detail">
              <h3>{{ event.title }}</h3>
              <p>{{ event.description }}</p>
              <img v-if="event.image" :src="event.image" alt="历史图片">
            </div>
          </transition>
        </div>
      </div>
    </section>

    <!-- 三、核心技术展示 -->
    <section class="core-tech">
      <h2>核心技术</h2>
      <div class="tech-grid">
        <div v-for="tech in technologies" :key="tech.name" class="tech-card">
          <img :src="tech.icon" alt="技术图标">
          <h3>{{ tech.name }}</h3>
          <p>{{ tech.description }}</p>
        </div>
      </div>
    </section>

    <!-- 四、产品矩阵 -->
    <section class="product-matrix">
      <h2>产品系列</h2>
      <div class="category-filter">
        <button
            v-for="category in vehicleCategories"
            :key="category"
            @click="selectedCategory = category"
            :class="{ active: selectedCategory === category }"
        >
          {{ category }}
        </button>
      </div>
      <div class="vehicle-grid">
        <div
            v-for="vehicle in filteredVehicles"
            :key="vehicle.name"
            class="vehicle-card"
        >
          <img :src="vehicle.image" alt="车型图片">
          <h3>{{ vehicle.name }}</h3>
        </div>
      </div>
    </section>

    <!-- 六、新闻中心 -->
    <section class="news-center">
      <h2>最新动态</h2>
      <div class="news-grid">
        <article v-for="news in newsList" :key="news.id" class="news-card">
          <time>{{ formatDate(news.date) }}</time>
          <h3>{{ news.title }}</h3>
          <p>{{ news.excerpt }}</p>
        </article>
      </div>
    </section>

    <!-- 七、本地化服务 -->
    <section class="local-services">
      <h2>本地服务</h2>
      <div class="service-buttons">
        <button v-for="service in localServices" :key="service.name">
          {{ service.name }}
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// 类型定义
interface HistoryEvent {
  year: number
  title: string
  description: string
  image?: string
}

interface CoreTechnology {
  name: string
  description: string
  icon: string
}

interface Vehicle {
  name: string
  category: string
  image: string
}

// 响应式数据
const concepts = ref({
  title: '核心理念',
  items: [
    { title: '愿景', content: 'Innovation that excites' },
    { title: '电动化', content: '2030年全面电动化战略' }
  ]
})

const historyEvents = ref<HistoryEvent[]>([
  {
    year: 1933,
    title: '日产成立',
    description: '前身「汽车制造股份有限公司」成立',
    image: '/brand/ultra.png'
  },
  // 其他历史事件...
])

const selectedEvent = ref<HistoryEvent | null>(null)

const technologies = ref<CoreTechnology[]>([
  {
    name: 'e-POWER',
    description: '创新混合动力技术',
    icon: '/icons/Hellcat.svg'
  },
  // 其他技术...
])

const vehicleCategories = ref(['电动车', 'SUV', '轿车', '经典车型'])
const selectedCategory = ref('电动车')

const vehicles = ref<Vehicle[]>([
  { name: 'Ariya', category: '电动车', image: '/brand/ultra.png' },
  // 其他车型...
])

const newsList = ref([
  {
    id: 1,
    date: '2023-03-15',
    title: '新一代电动平台发布',
    excerpt: '日产宣布推出全新模块化电动平台...'
  },
  // 其他新闻...
])

const localServices = ref([
  { name: '经销商查询', action: 'searchDealer' },
  { name: '预约试驾', action: 'bookTestDrive' }
])

// 计算属性
const filteredVehicles = computed(() =>
    vehicles.value.filter(v => v.category === selectedCategory.value)
)

// 方法
const selectEvent = (event: HistoryEvent) => {
  selectedEvent.value = event
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}
</script>

<style scoped lang="scss">
.nissan-brand {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;

  section {
    margin: 4rem 0;
  }
}

.concept-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.timeline-container {
  display: flex;
  overflow-x: auto;
  padding: 2rem 0;

  .timeline-node {
    flex-shrink: 0;
    width: 200px;
    position: relative;
    cursor: pointer;

    &.active .year {
      color: #c00; /* 日产红 */
    }
  }
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.vehicle-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.news-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.service-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tech-grid {
    grid-template-columns: 1fr;
  }

  .timeline-container {
    flex-direction: column;
  }
}
</style>
