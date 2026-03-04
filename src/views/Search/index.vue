NEW_FILE_CODE
<template>
  <div class="search-page">
    <div class="search-header">
      <h1>搜索结果</h1>
      <p v-if="searchQuery" class="search-query-text">"{{ searchQuery }}" 的搜索结果</p>
    </div>

    <div class="search-results" v-if="filteredResults.length > 0">
      <div
          v-for="(result, index) in filteredResults"
          :key="index"
          class="result-item"
          @click="navigateTo(result.path)"
      >
        <div class="result-icon">
          <svg-icon :name="result.icon || 'home'" :width="24" :height="24" />
        </div>
        <div class="result-content">
          <h3>{{ result.title }}</h3>
          <p>{{ result.description }}</p>
          <span class="result-path">{{ result.path }}</span>
        </div>
      </div>
    </div>

    <div class="no-results" v-else>
      <svg-icon name="home" :width="80" :height="80" />
      <h2>未找到相关结果</h2>
      <p>请尝试其他关键词</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const searchQuery = ref('')
const allPages = ref([
  {
    path: '/Home',
    title: '首页',
    description: '返回网站主页',
    icon: 'home'
  },
  {
    path: '/Brand',
    title: '关于我们',
    description: '了解品牌故事和理念',
    icon: 'home'
  },
  {
    path: '/Users',
    title: '用户中心',
    description: '管理个人账户信息',
    icon: 'user'
  },
  {
    path: '/Reserve',
    title: '论坛',
    description: '参与车友讨论和交流',
    icon: 'home'
  },
  {
    path: '/Ultra',
    title: '小米 SU7 Ultra',
    description: '查看小米 SU7 Ultra 车型详情',
    icon: 'home'
  },
  {
    path: '/Supra',
    title: 'TOYOTA GR SUPRA',
    description: '查看丰田 GR SUPRA 车型详情',
    icon: 'home'
  },
  {
    path: '/Brz',
    title: 'SUBARU BRZ',
    description: '查看斯巴鲁 BRZ 车型详情',
    icon: 'home'
  },
  {
    path: '/Gtr',
    title: 'NISSAN GT-R',
    description: '查看日产 GT-R 车型详情',
    icon: 'home'
  },
  {
    path: '/Hellcat',
    title: 'DODGE CHALLENGER SRT® HELLCAT',
    description: '查看道奇挑战者地狱猫车型详情',
    icon: 'home'
  },
  {
    path: '/AfterSales',
    title: '售后服务',
    description: '获取售后支持和服务信息',
    icon: 'home'
  },
  {
    path: '/Finance',
    title: '金融服务',
    description: '了解金融方案和贷款服务',
    icon: 'home'
  },
  {
    path: '/Maintenance',
    title: '保养维修',
    description: '预约保养和维修服务',
    icon: 'home'
  },
  {
    path: '/Agreement',
    title: '用户协议',
    description: '查看服务条款和使用协议',
    icon: 'home'
  },
  {
    path: '/Policy',
    title: '隐私政策',
    description: '了解隐私权保护政策',
    icon: 'home'
  },
  {
    path: '/Help',
    title: '帮助中心',
    description: '获取使用帮助和常见问题解答',
    icon: 'home'
  },
  {
    path: '/Customer',
    title: '客户服务',
    description: '联系客户支持团队',
    icon: 'home'
  },
])

const filteredResults = computed(() => {
  if (!searchQuery.value) return []

  const query = searchQuery.value.toLowerCase().trim()
  return allPages.value.filter(page =>
      page.title.toLowerCase().includes(query) ||
      page.description.toLowerCase().includes(query) ||
      page.path.toLowerCase().includes(query)
  )
})

const navigateTo = (path: string) => {
  router.push(path)
}

onMounted(() => {
  const query = route.query.q as string
  if (query) {
    searchQuery.value = decodeURIComponent(query)
  }
})
</script>

<style scoped>
.search-page {
  min-height: 100vh;
  padding: 120px 5% 60px;
  background-color: var(--color-neutral-900);
}

.search-header {
  margin-bottom: 40px;
}

.search-header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  color: var(--color-light);
}

.search-query-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.2rem;
}

.search-results {
  max-width: 800px;
}

.result-item {
  display: flex;
  align-items: center;
  padding: 20px;
  margin-bottom: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.result-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateX(10px);
}

.result-icon {
  margin-right: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.result-content h3 {
  color: var(--color-light);
  font-size: 1.2rem;
  margin-bottom: 5px;
}

.result-content p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  margin-bottom: 8px;
}

.result-path {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.8rem;
  font-family: monospace;
}

.no-results {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.6);
}

.no-results h2 {
  font-size: 1.8rem;
  margin-top: 20px;
  margin-bottom: 10px;
}

.no-results p {
  font-size: 1rem;
}
</style>
