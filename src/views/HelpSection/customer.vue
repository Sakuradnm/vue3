<script lang="ts">
import { ref, reactive, onMounted } from 'vue'

// 接口定义
interface FaqItem {
  id: number
  question: string
  answer: string
  expanded: boolean
}

interface ChatMessage {
  id: number
  content: string
  isUser: boolean
  timestamp: string
}

interface ContactOption {
  name: string
  icon: string
  description: string
  link: string
}
interface FeedbackForm {
  name: string
  email: string
  topic: string
  message: string
  attachment: File | null
}


export default {
  name: 'CustomerService',
  setup() {
    // 不同内容部分之间切换
    const activeSection = ref('faq')
    // 搜索功能
    const searchQuery = ref('')
    // 扩展的常见问题解答
    const expandedFaqId = ref<number | null>(null)
    // 聊天框可见性
    const showChatbox = ref(false)
    // 聊天输入
    const chatInput = ref('')
    // 浮动按钮可见性
    const showFloatingButton = ref(true)
    // 消息已查看状态
    const messagesSeen = ref(true)
    // AI 响应的加载状态
    const isLoading = ref(false)
    
    // FAQ items
    const faqItems = reactive<FaqItem[]>([
      {
        id: 1,
        question: '如何修改我的账户信息？',
        answer: '您可以在"个人中心"页面，点击"编辑资料"按钮进行个人信息的修改。我们支持修改用户名、头像、密码等基本信息。',
        expanded: false
      },
      {
        id: 2,
        question: '忘记密码怎么办？',
        answer: '请点击登录页面的"忘记密码"选项，通过绑定的手机号或邮箱进行身份验证，然后重置您的密码。',
        expanded: false
      },
      {
        id: 3,
        question: '如何联系在线客服？',
        answer: '您可以通过本页面右下角的"在线咨询"按钮，或者点击"联系我们"标签页，选择合适的联系方式与我们取得联系。',
        expanded: false
      },
      {
        id: 4,
        question: '账号被盗怎么办？',
        answer: '请立即联系我们的客服团队，提供您的用户名和相关证明资料，我们会尽快核实并帮助您找回账号。同时建议您及时修改密码，开启两步验证等安全措施。',
        expanded: false
      },
      {
        id: 5,
        question: '如何提交功能建议或问题反馈？',
        answer: '您可以通过"意见反馈"页面提交您的建议或反馈。我们的产品团队会认真阅读每一条意见，并根据实际情况进行优化和改进。',
        expanded: false
      }
    ])
    
    // Contact options
    const contactOptions = reactive<ContactOption[]>([
      {
        name: '在线客服',
        icon: 'customer-service',
        description: '7x24小时人工客服',
        link: '#'
      },
      {
        name: '电话咨询',
        icon: 'phone',
        description: '400-888-8888',
        link: 'tel:4008888888'
      },
      {
        name: '邮件支持',
        icon: 'mail',
        description: 'support@example.com',
        link: 'mailto:support@example.com'
      },
      {
        name: '社区论坛',
        icon: 'community',
        description: '与其他用户交流',
        link: '/community'
      }
    ])
    
    // Chat messages
    const chatMessages = reactive<ChatMessage[]>([
      {
        id: 1,
        content: '您好，欢迎使用在线客服，请问有什么可以帮助您的？',
        isUser: false,
        timestamp: formatTime(new Date())
      }
    ])
    
    // Filtered FAQ items based on search
    const filteredFaqItems = () => {
      if (!searchQuery.value) return faqItems
      return faqItems.filter(item => 
        item.question.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
        item.answer.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    }
    
    // Format time for chat messages
    function formatTime(date: Date): string {
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `${hours}:${minutes}`
    }
    
    // Toggle FAQ item expansion
    const toggleFaq = (id: number) => {
      expandedFaqId.value = expandedFaqId.value === id ? null : id
    }
    
    // Switch between sections
    const switchSection = (section: string) => {
      activeSection.value = section
    }
    
    // Toggle chatbox visibility
    const toggleChatbox = () => {
      showChatbox.value = !showChatbox.value
      if (showChatbox.value) {
        showFloatingButton.value = false
        messagesSeen.value = true
      } else {
        setTimeout(() => {
          showFloatingButton.value = true
        }, 300)
      }
    }
    
    // Send a chat message
    const sendMessage = () => {
      if (!chatInput.value.trim()) return
      
      // Add user message
      chatMessages.push({
        id: chatMessages.length + 1,
        content: chatInput.value,
        isUser: true,
        timestamp: formatTime(new Date())
      })
      
      const userQuery = chatInput.value
      chatInput.value = ''
      
      // Simulate AI thinking
      isLoading.value = true
      
      // Simulate response delay
      setTimeout(() => {
        isLoading.value = false
        
        // Add AI response
        const responses = [
          '感谢您的提问，我正在查询相关信息...',
          '您好，针对您的问题，建议您尝试以下解决方案...',
          '已收到您的反馈，我们会尽快处理。',
          '您可以在"个人中心"找到相关设置。',
          '需要更多帮助吗？您可以拨打我们的客服热线400-888-8888。'
        ]
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)]
        
        chatMessages.push({
          id: chatMessages.length + 1,
          content: randomResponse,
          isUser: false,
          timestamp: formatTime(new Date())
        })
        
        // Auto scroll to bottom
        setTimeout(() => {
          const chatContainer = document.querySelector('.chat-messages')
          if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight
          }
        }, 100)
      }, 1500)
    }
    
    // Submit feedback form
    const feedbackForm = reactive<FeedbackForm>({
      name: '',
      email: '',
      topic: '功能建议',
      message: '',
      attachment: null
    })
    // 文件上传处理
    const handleFileChange = (event: Event) => {
      const input = event.target as HTMLInputElement
      feedbackForm.attachment = input.files?.[0] ?? null
    }
    
    const submitFeedback = () => {
      //文件类型验证
      if (feedbackForm.attachment) {
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
        if (!allowedTypes.includes(feedbackForm.attachment.type)) {
          alert('仅支持 JPG、PNG 和 PDF 格式')
          return
        }
        // 文件大小验证 (5MB)
        const maxSize = 5 * 1024 * 1024
        if (feedbackForm.attachment.size > maxSize) {
          alert('文件大小不能超过5MB')
          feedbackForm.attachment = null
          return
        }
      }
      // 其他验证逻辑
      console.log('提交反馈:', feedbackForm)
      // 重置表单
      feedbackForm.name = ''
      feedbackForm.email = ''
      feedbackForm.topic = '功能建议'
      feedbackForm.message = ''
      feedbackForm.attachment = null
      
      // Show success message
      alert('感谢您的反馈，我们会尽快处理！')
    }
    
    // Auto scroll chat to bottom on mount
    onMounted(() => {
      const chatContainer = document.querySelector('.chat-messages')
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight
      }
    })
    
    return {
      activeSection,
      searchQuery,
      expandedFaqId,
      showChatbox,
      chatInput,
      showFloatingButton,
      messagesSeen,
      isLoading,
      faqItems,
      contactOptions,
      chatMessages,
      filteredFaqItems,
      toggleFaq,
      switchSection,
      toggleChatbox,
      sendMessage,
      feedbackForm,
      submitFeedback,
      handleFileChange
    }
  }
}
</script>

<template>
  <!-- 背景视频 -->
  <video class="bg-video" autoplay loop muted playsinline>
    <source src="/videos/home1.mp4" type="video/mp4">
  </video>
  
  <!-- 客服中心容器 -->
  <div class="customer-service-container">
    <div class="content-wrapper">
      <!-- 
      -- 左 侧 导 航 ---------------------------------------------------------
      -->
      <div class="sidebar">
        <h2 class="sidebar-title">客服中心</h2>
        <div class="nav-links">
          <a 
            :class="['nav-item', activeSection === 'faq' ? 'active' : '']" 
            @click="switchSection('faq')"
          >
            常见问题
          </a>
          <a 
            :class="['nav-item', activeSection === 'contact' ? 'active' : '']" 
            @click="switchSection('contact')"
          >
            联系我们
          </a>
          <a 
            :class="['nav-item', activeSection === 'feedback' ? 'active' : '']" 
            @click="switchSection('feedback')"
          >
            意见反馈
          </a>
          <a 
            :class="['nav-item', activeSection === 'support' ? 'active' : '']" 
            @click="switchSection('support')"
          >
            技术支持
          </a>
          <router-link to="/" class="nav-item">
            返回首页
          </router-link>
        </div>
      </div>

      <!-- 
      -- 主 要 内 容 区 ---------------------------------------------------------
      -->
      <div class="main-content">
        <!-- FAQ 部分 -->
        <div v-if="activeSection === 'faq'" class="faq-section">
          <h2>常见问题</h2>
          
          <!-- 搜索框 -->
          <div class="search-container">
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="搜索问题..." 
              class="search-input"
            >
            <button class="search-button">
              <span>搜索</span>
            </button>
          </div>
          
          <!-- FAQ 列表 -->
          <div class="faq-list">
            <div 
              v-for="item in filteredFaqItems()" 
              :key="item.id" 
              class="faq-item"
              :class="{ 'expanded': expandedFaqId === item.id }"
            >
              <div class="faq-question" @click="toggleFaq(item.id)">
                <h3>{{ item.question }}</h3>
                <span class="toggle-icon">{{ expandedFaqId === item.id ? '−' : '+' }}</span>
              </div>
              <div 
                class="faq-answer" 
                :class="{ 'show': expandedFaqId === item.id }"
              >
                <p>{{ item.answer }}</p>
              </div>
            </div>
            
            <div v-if="filteredFaqItems().length === 0" class="no-results">
              <p>没有找到匹配的问题，请尝试其他关键词。</p>
            </div>
          </div>
          
          <div class="help-cta">
            <p>没有找到您需要的答案？</p>
            <button class="contact-button" @click="switchSection('contact')">联系客服</button>
          </div>
        </div>
        
        <!-- 联系我们部分 -->
        <div v-if="activeSection === 'contact'" class="contact-section">
          <h2>联系我们</h2>
          
          <div class="contact-options">
            <div 
              v-for="option in contactOptions" 
              :key="option.name" 
              class="contact-card"
            >
              <div class="contact-icon">
                <svg-icon :name="option.icon" :width="40" height="40"/>
              </div>
              <h3>{{ option.name }}</h3>
              <p>{{ option.description }}</p>
              <a :href="option.link" class="contact-link">立即联系</a>
            </div>
          </div>
          
          <div class="company-info">
            <h3>公司地址</h3>
            <p>中国上海市浦东新区张江高科技园区博云路2号601室</p>
            
            <h3>工作时间</h3>
            <p>周一至周五: 9:00 - 18:00</p>
            <p>周末及节假日: 10:00 - 16:00 (仅提供在线客服)</p>
          </div>
        </div>
        
        <!-- 意见反馈部分 -->
        <div v-if="activeSection === 'feedback'" class="feedback-section">
          <h2>意见反馈</h2>
          
          <form @submit.prevent="submitFeedback" class="feedback-form">
            <div class="form-group">
              <label for="name">您的姓名</label>
              <input 
                type="text" 
                id="name" 
                v-model="feedbackForm.name" 
                placeholder="请输入您的姓名"
                required
              >
            </div>
            
            <div class="form-group">
              <label for="email">联系邮箱</label>
              <input 
                type="email" 
                id="email" 
                v-model="feedbackForm.email" 
                placeholder="请输入您的邮箱"
                required
              >
            </div>
            
            <div class="form-group">
              <label for="topic">反馈主题</label>
              <select id="topic" v-model="feedbackForm.topic">
                <option>功能建议</option>
                <option>问题报告</option>
                <option>体验反馈</option>
                <option>其他</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="message">详细描述</label>
              <textarea 
                id="message" 
                v-model="feedbackForm.message" 
                placeholder="请详细描述您的意见或遇到的问题..."
                rows="5"
                required
              ></textarea>
            </div>
            
            <div class="form-group">
              <label for="attachment">附件（可选）</label>
              <input 
                type="file" 
                id="attachment" 
                accept=".jpg,.jpeg,.png,.pdf"
                @change="handleFileChange"
                >
              <small>支持图片、PDF等格式文件，大小不超过5MB</small>
            </div>
            
            <button type="submit" class="submit-btn">提交反馈</button>
          </form>
        </div>
        
        <!-- 技术支持部分 -->
        <div v-if="activeSection === 'support'" class="support-section">
          <h2>技术支持</h2>
          
          <div class="support-options">
            <div class="support-card">
              <h3>自助文档</h3>
              <p>浏览我们的技术文档，获取产品使用指南与教程</p>
              <a href="#" class="support-link">查看文档</a>
            </div>
            
            <div class="support-card">
              <h3>常见故障</h3>
              <p>查看常见技术问题的解决方案</p>
              <a href="#" class="support-link">故障排查</a>
            </div>
            
            <div class="support-card">
              <h3>视频教程</h3>
              <p>观看产品功能使用的详细教学视频</p>
              <a href="#" class="support-link">查看视频</a>
            </div>
            
            <div class="support-card">
              <h3>技术工单</h3>
              <p>提交技术支持工单，获取专业解答</p>
              <a href="#" class="support-link">提交工单</a>
            </div>
          </div>
          
          <div class="system-status">
            <h3>系统状态</h3>
            <div class="status-list">
              <div class="status-item">
                <span class="status-name">网站服务</span>
                <span class="status-indicator online">正常</span>
              </div>
              <div class="status-item">
                <span class="status-name">API服务</span>
                <span class="status-indicator online">正常</span>
              </div>
              <div class="status-item">
                <span class="status-name">数据处理</span>
                <span class="status-indicator online">正常</span>
              </div>
              <div class="status-item">
                <span class="status-name">消息推送</span>
                <span class="status-indicator partial">部分延迟</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 
    -- 浮 动 客 服 按 钮 ---------------------------------------------------------
    -->
    <div 
      v-if="showFloatingButton" 
      class="floating-chat-button" 
      @click="toggleChatbox"
    >
      <svg-icon name="chat" :width="24" height="24"/>
      <span v-if="!messagesSeen" class="notification-badge"></span>
    </div>
    
    <!-- 
    -- 聊 天 窗 口 ---------------------------------------------------------
    -->
    <div class="chatbox" :class="{ 'open': showChatbox }">
      <div class="chatbox-header">
        <h3>在线客服</h3>
        <button class="close-button" @click="toggleChatbox">×</button>
      </div>
      
      <div class="chat-messages">
        <div 
          v-for="message in chatMessages" 
          :key="message.id" 
          :class="['message', message.isUser ? 'user-message' : 'bot-message']"
        >
          <div class="message-content">{{ message.content }}</div>
          <div class="message-time">{{ message.timestamp }}</div>
        </div>
        
        <div v-if="isLoading" class="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      
      <div class="chatbox-input">
        <input 
          type="text" 
          v-model="chatInput" 
          placeholder="请输入您的问题..." 
          @keyup.enter="sendMessage"
        >
        <button @click="sendMessage">发送</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 容器基础样式 */
.customer-service-container {
  min-height: 100vh;
  padding: 1% 5%;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 背景视频样式 */
.bg-video {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: -1;
}

/* 主要内容框架样式 */
.content-wrapper {
  width: 100%;
  min-height: 80vh;
  display: flex;
  gap: 2%;
  background: rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(15px);
  border-radius: 20px;
  padding: 2rem;
  position: relative;
  box-shadow: 0 15px 30px 0 rgba(51, 88, 104, 0.27);
}

/************************************************************
 * 左侧导航栏样式
 ************************************************************/
.sidebar {
  width: 20%;
  min-width: 200px;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  padding-right: 1.5rem;
}

.sidebar-title {
  color: white;
  font-size: 1.8rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-links {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.nav-item {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 1.1rem;
  padding: 0.8rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.nav-item:hover, .nav-item.active {
  color: white;
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(5px);
}

/************************************************************
 * 主要内容区样式
 ************************************************************/
.main-content {
  flex: 1;
  padding: 0 1rem;
  overflow-y: auto;
  max-height: 80vh;
}

.main-content h2 {
  color: white;
  font-size: 1.8rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

/* 搜索框样式 */
.search-container {
  display: flex;
  margin-bottom: 2rem;
}

.search-input {
  flex: 1;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px 0 0 8px;
  color: white;
  font-size: 1rem;
}

.search-button {
  padding: 0 1.5rem;
  background: rgba(100, 104, 111, 0.7);
  color: white;
  border: none;
  border-radius: 0 8px 8px 0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.search-button:hover {
  background: rgba(100, 104, 111, 0.9);
}

/* FAQ 列表样式 */
.faq-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.faq-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.faq-item.expanded {
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.faq-question {
  padding: 1.2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.faq-question h3 {
  color: white;
  font-size: 1.1rem;
  margin: 0;
}

.toggle-icon {
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
}

.faq-answer {
  height: 0;
  overflow: hidden;
  transition: all 0.3s ease;
}

.faq-answer.show {
  height: auto;
  padding: 0 1.2rem 1.2rem;
}

.faq-answer p {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin: 0;
}

.no-results {
  padding: 2rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
}

/* 帮助提示区域 */
.help-cta {
  margin-top: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  text-align: center;
}

.help-cta p {
  color: white;
  margin-bottom: 1rem;
}

.contact-button {
  padding: 0.8rem 2rem;
  background: rgba(100, 104, 111, 0.7);
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.contact-button:hover {
  background: rgba(100, 104, 111, 0.9);
  transform: translateY(-2px);
}

/* 联系我们部分样式 */
.contact-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.contact-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
}

.contact-card:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-5px);
}

.contact-icon {
  margin-bottom: 1rem;
}

.contact-card h3 {
  color: white;
  font-size: 1.2rem;
  margin-bottom: 0.7rem;
}

.contact-card p {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 1.5rem;
}

.contact-link {
  display: inline-block;
  padding: 0.6rem 1.2rem;
  background: rgba(100, 104, 111, 0.5);
  color: white;
  text-decoration: none;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.contact-link:hover {
  background: rgba(100, 104, 111, 0.8);
}

.company-info {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
}

.company-info h3 {
  color: white;
  font-size: 1.2rem;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.company-info h3:first-child {
  margin-top: 0;
}

.company-info p {
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
}

/* 意见反馈表单样式 */
.feedback-form {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  color: white;
  margin-bottom: 0.5rem;
}

.form-group input, 
.form-group select, 
.form-group textarea {
  width: 100%;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  font-size: 1rem;
}

.form-group select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='white'%3E%3Cpath d='M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 01.753 1.659l-4.796 5.48a1 1 0 01-1.506 0z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
}

.form-group small {
  display: block;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 0.5rem;
  font-size: 0.85rem;
}

.submit-btn {
  width: 100%;
  padding: 1rem;
  background: rgba(100, 104, 111, 0.7);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.submit-btn:hover {
  background: rgba(100, 104, 111, 0.9);
}

/* 技术支持部分样式 */
.support-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.support-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
}

.support-card:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-5px);
}

.support-card h3 {
  color: white;
  font-size: 1.2rem;
  margin-bottom: 0.7rem;
}

.support-card p {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 1.5rem;
}

.support-link {
  display: inline-block;
  padding: 0.6rem 1.2rem;
  background: rgba(100, 104, 111, 0.5);
  color: white;
  text-decoration: none;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.support-link:hover {
  background: rgba(100, 104, 111, 0.8);
}

/* 系统状态样式 */
.system-status {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 2rem;
}

.status-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.07);
  border-radius: 8px;
}

.status-name {
  color: rgba(255, 255, 255, 0.8);
}

.status-indicator {
  font-size: 0.9rem;
  padding: 0.3rem 0.7rem;
  border-radius: 15px;
}

.status-indicator.online {
  background: rgba(76, 175, 80, 0.2);
  color: #4CAF50;
}

.status-indicator.partial {
  background: rgba(255, 193, 7, 0.2);
  color: #FFC107;
}

/************************************************************
 * 浮动按钮和聊天窗口样式
 ************************************************************/
.floating-chat-button {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 60px;
  height: 60px;
  background: rgba(100, 104, 111, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  z-index: 1000;
}

.floating-chat-button:hover {
  transform: scale(1.1);
  background: rgba(100, 104, 111, 1);
}

.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 15px;
  height: 15px;
  background: #ff4757;
  border-radius: 50%;
  border: 2px solid #2f3542;
}

/* 聊天窗口样式 */
.chatbox {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 350px;
  max-height: 70vh;
  background: rgba(22, 28, 36, 0.95);
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  transform: translateY(150%);
  opacity: 0;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  z-index: 1000;
}

.chatbox.open {
  transform: translateY(0);
  opacity: 1;
}

.chatbox-header {
  padding: 1.2rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 15px 15px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chatbox-header h3 {
  color: white;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
}

.chat-messages {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message {
  max-width: 80%;
  padding: 0.8rem 1.2rem;
  border-radius: 15px;
  animation: messageAppear 0.3s ease;
}

.user-message {
  background: rgba(100, 104, 111, 0.9);
  align-self: flex-end;
  border-radius: 15px 15px 0 15px;
}

.bot-message {
  background: rgba(255, 255, 255, 0.1);
  align-self: flex-start;
  border-radius: 15px 15px 15px 0;
}

.message-content {
  color: white;
  font-size: 0.95rem;
  line-height: 1.4;
}

.message-time {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.75rem;
  margin-top: 0.5rem;
  text-align: right;
}

.typing-indicator {
  display: flex;
  gap: 0.3rem;
  padding: 1rem;
}

.typing-indicator span {
  width: 6px;
  height: 6px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

.chatbox-input {
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  gap: 0.5rem;
}

.chatbox-input input {
  flex: 1;
  padding: 0.8rem;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
}

.chatbox-input button {
  padding: 0.8rem 1.5rem;
  background: rgba(100, 104, 111, 0.7);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.chatbox-input button:hover {
  background: rgba(100, 104, 111, 0.9);
}

@keyframes typing {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

@keyframes messageAppear {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/************************************************************
 * 响应式设计
 ************************************************************/
@media (max-width: 768px) {
  .content-wrapper {
    flex-direction: column;
    padding: 1.5rem;
  }

  .sidebar {
    width: 100%;
    border-right: none;
    padding-right: 0;
    margin-bottom: 2rem;
  }

  .nav-links {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .nav-item {
    width: 100%;
    text-align: center;
  }

  .main-content {
    max-height: none;
    padding: 0;
  }

  .chatbox {
    width: 90%;
    right: 5%;
    bottom: 1rem;
  }

  .floating-chat-button {
    bottom: 1rem;
    right: 1rem;
    width: 50px;
    height: 50px;
  }
}

@media (max-width: 480px) {
  .contact-options,
  .support-options {
    grid-template-columns: 1fr;
  }

  .search-container {
    flex-direction: column;
  }

  .search-input {
    border-radius: 8px;
    margin-bottom: 0.5rem;
  }

  .search-button {
    border-radius: 8px;
  }
}
</style>