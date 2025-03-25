<template>
  <div class="models-page">
    <!-- 车型分类筛选 -->
    <section class="filters">
      <div class="filter-container">
        <div class="filter-tags">
          <button
              v-for="category in categories"
              :key="category.value"
              :class="['filter-tag', { active: selectedCategory === category.value }]"
              @click="selectedCategory = category.value"
          >
            {{ category.label }}
          </button>
        </div>
      </div>
    </section>

    <!-- 车型列表 -->
    <section class="models-grid">
      <div class="model-card" v-for="model in filteredModels" :key="model.id">
        <div class="model-image">
          <img :src="model.image" :alt="model.name">
        </div>
        <div class="model-info">
          <h3>{{ model.name }}</h3>
          <p class="model-price">{{ model.price }}</p>
          <div class="model-specs">
            <div class="spec">
              <i class="fas fa-road"></i>
              <span>{{ model.range }}km</span>
            </div>
            <div class="spec">
              <i class="fas fa-tachometer-alt"></i>
              <span>{{ model.acceleration }}s</span>
            </div>
            <div class="spec">
              <i class="fas fa-horse"></i>
              <span>{{ model.power }}hp</span>
            </div>
          </div>
          <div class="model-actions">
            <button class="btn-details" @click="viewDetails(model)">查看详情</button>
            <button class="btn-compare" @click="addToCompare(model)">
              <i class="fas fa-plus"></i>
              对比
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 对比工具 -->
    <div class="compare-tool" v-if="compareList.length > 0">
      <div class="compare-container">
        <div class="compare-items">
          <div class="compare-item" v-for="(model, index) in compareList" :key="model.id">
            <img :src="model.image" :alt="model.name">
            <span class="model-name">{{ model.name }}</span>
            <button class="remove-compare" @click="removeFromCompare(index)">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        <button
            class="btn-start-compare"
            :disabled="compareList.length < 2"
            @click="startCompare"
        >
          开始对比
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Models',
  data () {
    return {
      selectedCategory: 'all',
      categories: [
        { label: '全部', value: 'all' },
        { label: '轿车', value: 'sedan' },
        { label: 'SUV', value: 'suv' },
        { label: '新能源', value: 'new-energy' },
        { label: '性能车', value: 'performance' }
      ],
      models: [
        {
          id: 1,
          name: 'Model X',
          price: '￥299,999 起',
          range: 600,
          acceleration: 3.9,
          power: 670,
          image: '/models/model-x.jpg',
          category: ['suv', 'new-energy']
        },
        {
          id: 2,
          name: 'SU7',
          price: '￥249,900 起',
          range: 700,
          acceleration: 5.7,
          power: 299,
          image: '/models/su7.jpg',
          category: ['sedan', 'new-energy']
        },
        {
          id: 3,
          name: 'SU7 Ultra',
          price: '￥329,900 起',
          range: 800,
          acceleration: 2.8,
          power: 578,
          image: '/models/su7-ultra.jpg',
          category: ['sedan', 'new-energy', 'performance']
        },
        {
          id: 4,
          name: '斯巴鲁 BRZ',
          price: '￥289,800 起',
          range: 0,
          acceleration: 6.3,
          power: 235,
          image: '/models/brz.jpg',
          category: ['performance']
        },
        {
          id: 5,
          name: '丰田 SUPRA',
          price: '￥498,800 起',
          range: 0,
          acceleration: 4.3,
          power: 387,
          image: '/models/supra.jpg',
          category: ['performance']
        },
        {
          id: 6,
          name: '日产 GTR',
          price: '￥698,000 起',
          range: 0,
          acceleration: 3.0,
          power: 550,
          image: '/models/gtr.jpg',
          category: ['performance']
        }
      ],
      compareList: []
    }
  },
  computed: {
    filteredModels () {
      if (this.selectedCategory === 'all') {
        return this.models
      }
      return this.models.filter(model =>
          model.category.includes(this.selectedCategory)
      )
    }
  },
  methods: {
    viewDetails (model) {
      this.$router.push(`/models/${model.id}`)
    },
    addToCompare (model) {
      if (this.compareList.length < 3 && !this.compareList.includes(model)) {
        this.compareList.push(model)
      }
    },
    removeFromCompare (index) {
      this.compareList.splice(index, 1)
    },
    startCompare () {
      const ids = this.compareList.map(model => model.id).join(',')
      this.$router.push(`/compare?models=${ids}`)
    }
  }
}
</script>
<style scoped>
.models-page {
  padding-top: 2rem;
}

.filters {
  background: white;
  padding: 1rem 0;
  position: sticky;
  top: 72px;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.filter-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.filter-tags {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.filter-tag {
  padding: 0.5rem 1.5rem;
  border: 2px solid #007bff;
  border-radius: 20px;
  background: none;
  color: #007bff;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.filter-tag.active {
  background: #007bff;
  color: white;
}

.models-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.model-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.model-card:hover {
  transform: translateY(-5px);
}

.model-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.model-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.model-info {
  padding: 1.5rem;
}

.model-price {
  color: #007bff;
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0.5rem 0;
}

.model-specs {
  display: flex;
  justify-content: space-between;
  margin: 1rem 0;
}

.spec {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.spec i {
  color: #666;
}

.model-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-details,
.btn-compare {
  flex: 1;
  padding: 0.8rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-details {
  background: #007bff;
  color: white;
}

.btn-compare {
  background: #f8f9fa;
  color: #333;
}

.compare-tool {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  padding: 1rem;
}

.compare-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 2rem;
}

.compare-items {
  display: flex;
  gap: 1rem;
  flex: 1;
}

.compare-item {
  position: relative;
  width: 100px;
  text-align: center;
}

.compare-item img {
  width: 100%;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.model-name {
  display: block;
  font-size: 0.8rem;
  margin-top: 0.5rem;
}

.remove-compare {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #dc3545;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
}

.btn-start-compare {
  padding: 0.8rem 2rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-start-compare:disabled {
  background: #ccc;
  cursor: not-allowed;
}

</style>
