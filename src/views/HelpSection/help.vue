<script setup lang="ts">
import { ref, computed } from 'vue';

// 定义帮助主题和FAQ的类型
interface HelpTopic {
  id: number;
  icon: string;
  title: string;
  description: string;
  path: string;
}

interface FaqItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

// 帮助主题数据
const helpTopics = ref<HelpTopic[]>([
  {
    id: 1,
    icon: 'account_circle',
    title: '账户管理',
    description: '注册、登录、修改个人信息等相关问题',
    path: '/help/account'
  },
  {
    id: 2,
    icon: 'security',
    title: '账户安全',
    description: '密码重置、账户保护、隐私设置等',
    path: '/help/security'
  },
  {
    id: 3,
    icon: 'payment',
    title: '支付问题',
    description: '支付方式、订单问题、退款政策等',
    path: '/help/payment'
  },
  {
    id: 4,
    icon: 'support',
    title: '技术支持',
    description: '系统使用问题、故障报告等技术相关问题',
    path: '/help/technical'
  },
  {
    id: 5,
    icon: 'policy',
    title: '政策与条款',
    description: '用户协议、隐私政策等法律文件',
    path: '/help/policy'
  },
  {
    id: 6,
    icon: 'contact_support',
    title: '联系我们',
    description: '联系客服、提交反馈与建议',
    path: '/help/contact'
  }
]);

// 常见问题数据
const faqItems = ref<FaqItem[]>([
  {
    id: 1,
    question: '如何修改我的账户信息？',
    answer: '登录后，点击右上角的个人头像，选择"账户设置"，您可以在个人信息页面修改您的账户信息。',
    category: '账户管理'
  },
  {
    id: 2,
    question: '我忘记了密码怎么办？',
    answer: '在登录页面点击"忘记密码"链接，输入您的注册邮箱，我们将发送密码重置链接到您的邮箱。',
    category: '账户安全'
  },
  {
    id: 3,
    question: '如何更改我的支付方式？',
    answer: '进入"账户设置"->"支付管理"，您可以添加、删除或设置默认的支付方式。',
    category: '支付问题'
  },
  {
    id: 4,
    question: '如何查看我的订单历史？',
    answer: '登录后，点击"个人中心"->"我的订单"，您可以查看所有历史订单信息。',
    category: '支付问题'
  },
  {
    id: 5,
    question: '如何与客服人员联系？',
    answer: '您可以通过网站底部的"联系我们"，或直接发送邮件至support@example.com与我们联系。',
    category: '联系我们'
  },
  {
    id: 6,
    question: '系统支持哪些浏览器？',
    answer: '我们的系统支持Chrome、Firefox、Safari、Edge等现代浏览器的最新版本。',
    category: '技术支持'
  }
]);

// 搜索功能
const searchQuery = ref('');
const filteredFaqs = computed(() => {
  if (!searchQuery.value) return faqItems.value;
  const query = searchQuery.value.toLowerCase();
  return faqItems.value.filter(
    item => item.question.toLowerCase().includes(query) || item.answer.toLowerCase().includes(query)
  );
});

// 常见问题展开/收起状态
const expandedFaqs = ref<number[]>([]);
const toggleFaq = (id: number) => {
  const index = expandedFaqs.value.indexOf(id);
  if (index > -1) {
    expandedFaqs.value.splice(index, 1);
  } else {
    expandedFaqs.value.push(id);
  }
};
const isFaqExpanded = (id: number) => expandedFaqs.value.includes(id);
</script>

<template>
  <div class="help-center">
    <!-- 顶部搜索区域 -->
    <div class="help-header">
      <h1>帮助中心</h1>
      <p>寻找问题的答案或浏览下面的帮助主题</p>
      <div class="search-container">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="搜索帮助主题..."
          class="search-input"
        />
        <button class="search-button">搜索</button>
      </div>
    </div>

    <!-- 帮助主题分类 -->
    <div class="help-topics">
      <div class="topic-grid">
        <div
          v-for="topic in helpTopics"
          :key="topic.id"
          class="topic-card"
        >
          <div class="topic-icon">
            <svg-icon
                :name="topic.icon"
                class-name="topic-svg"
                :width="30"
                :height="30"
                color="#3498db"
            />
          </div>
          <h3>{{ topic.title }}</h3>
          <p>{{ topic.description }}</p>
          <router-link :to="topic.path" class="topic-link">查看详情 ></router-link>
        </div>
      </div>
    </div>

    <!-- 常见问题区域 -->
    <div class="faq-section">
      <h2 style="margin-top: 5rem">常见问题</h2>
      <div class="faq-container">
        <div
          v-for="faq in filteredFaqs"
          :key="faq.id"
          class="faq-item"
        >
          <div
            class="faq-question"
            @click="toggleFaq(faq.id)"
            :class="{ 'expanded': isFaqExpanded(faq.id) }"
          >
            <span>{{ faq.question }}</span>
            <svg class="toggle-icon" :class="{ 'expanded': isFaqExpanded(faq.id) }" viewBox="0 0 24 24">
              <path v-if="!isFaqExpanded(faq.id)" fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              <path v-else fill="currentColor" d="M19 13H5v-2h14v2z"/>
            </svg>
          </div>
          <div
            class="faq-answer"
            v-show="isFaqExpanded(faq.id)"
          >
            <p>{{ faq.answer }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 联系支持 -->
    <div class="contact-support">
      <h2>没有找到您需要的解答？</h2>
      <p>我们的客服团队随时准备帮助您解决问题</p>
      <router-link to="/customer">
          <button class="contact-button primary">联系客服</button>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.help-center {
  background-color: #f7f9fc;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
  color: #333;
}
.help-header {
  text-align: center;
  padding: 40px 20px;
  background-color: #f7f9fc;
  border-radius: 10px;
  margin-bottom: 40px;
}
.help-header h1 {
  font-size: 32px;
  margin-bottom: 10px;
  color: #2c3e50;
}
.help-header p {
  font-size: 16px;
  color: #666;
  margin-bottom: 30px;
}


/* 搜索 */
.search-container {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 50px;
  overflow: hidden;
}
.search-input {
  flex: 1;
  padding: 15px 25px;
  border: none;
  font-size: 16px;
  outline: none;
}
.search-button {
  padding: 15px 30px;
  background-color: #3498db;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}
.search-button:hover {
  background-color: #2980b9;
}


/* 分类 */
.topic-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
}
.topic-card {
  background-color: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
  height: 80%;
  display: flex;
  flex-direction: column;
}
.topic-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}
.topic-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background-color: #e3f2fd;
  border-radius: 50%;
}
.topic-icon i {
  font-size: 30px;
  color: #3498db;
}
.topic-card h3 {
  font-size: 18px;
  margin-bottom: 10px;
  color: #2c3e50;
}
.topic-card p {
  color: #666;
  margin-bottom: 15px;
  flex-grow: 1;
}
.topic-link {
  color: #3498db;
  text-decoration: none;
  font-weight: bold;
  align-self: flex-start;
}
.topic-link:hover {
  text-decoration: underline;
}


/* 常见问题 */
.faq-container {
  max-width: 800px;
  margin: 0 auto;
}
.faq-item {
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 15px;
  overflow: hidden;
}
.faq-question {
  padding: 18px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fafafa;
  transition: background-color 0.3s;
}
.faq-question:hover {
  background-color: #f5f5f5;
}
.faq-question.expanded {
  background-color: #e3f2fd;
}
.faq-question span {
  font-weight: 600;
  flex: 1;
}
.faq-question i {
  color: #3498db;
}
.faq-answer {
  padding: 15px 20px;
  background-color: white;
  border-top: 1px solid #eee;
}
.faq-answer p {
  line-height: 1.6;
  color: #555;
}


/* 联系支持 */
.contact-support {
  text-align: center;
  background-color: #f7f9fc;
  padding: 40px;
  border-radius: 10px;
}
.contact-support p {
  color: #666;
  margin-bottom: 25px;
}
.contact-button {
  padding: 12px 30px;
  border-radius: 50px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}
.contact-button.primary {
  background-color: #3498db;
  color: white;
}
.contact-button.primary:hover {
  background-color: #2980b9;
}


/* 箭头图标 */
.toggle-icon {
  width: 24px;
  height: 24px;
  color: #3498db;
  transition: transform 0.3s ease;
  flex-shrink: 0;
  margin-left: 12px;
}
.toggle-icon.expanded {
  transform: rotate(180deg);
}
/* 响应式设计 */
@media (max-width: 768px) {
  .topic-grid {
    grid-template-columns: 1fr;
  }

  .help-header {
    padding: 30px 15px;
  }

  .help-header h1 {
    font-size: 26px;
  }

  .search-container {
    flex-direction: column;
    border-radius: 8px;
  }

  .search-input {
    width: 100%;
    border-radius: 8px 8px 0 0;
  }

  .search-button {
    width: 100%;
    border-radius: 0 0 8px 8px;
  }
}
</style>
