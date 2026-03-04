<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeCategory = ref('all')
const searchQuery = ref('')
const showPostModal = ref(false)
const newPostTitle = ref('')
const newPostContent = ref('')
const newPostCategory = ref('general')

interface Post {
  id: number
  title: string
  content: string
  author: string
  avatar: string
  category: string
  likes: number
  comments: number
  views: number
  createdAt: string
  isLiked: boolean
}

const categories = [
  { id: 'all', name: '全部', icon: 'grid' },
  { id: 'general', name: '综合讨论', icon: 'chat' },
  { id: 'models', name: '车型讨论', icon: 'car' },
  { id: 'tech', name: '技术交流', icon: 'code' },
  { id: 'racing', name: '赛事竞技', icon: 'trophy' },
  { id: 'modify', name: '改装分享', icon: 'tools' },
]

const posts = ref<Post[]>([
  {
    id: 1,
    title: '小米 SU7 Ultra 赛道体验分享',
    content: '昨天去赛道试驾了小米 SU7 Ultra，加速性能真的很震撼，2.78 秒破百不是盖的！操控也很精准，过弯支撑性很好...',
    author: '速度狂魔',
    avatar: '/avatar1.jpg',
    category: 'models',
    likes: 156,
    comments: 42,
    views: 1280,
    createdAt: '2 小时前',
    isLiked: false
  },
  {
    id: 2,
    title: 'GT-R R35 改装案例分享 - 阶段一',
    content: '历经三个月，我的 GT-R 终于完成了阶段一改装。换了 HKS 进气系统、Akrapovic 排气，ECU 也刷了...',
    author: '改装达人',
    avatar: '/avatar2.jpg',
    category: 'modify',
    likes: 203,
    comments: 67,
    views: 2150,
    createdAt: '5 小时前',
    isLiked: true
  },
  {
    id: 3,
    title: '新手入坑，第一辆车选 BRZ 还是 86？',
    content: '最近想入手第一辆后驱车，在 BRZ 和 86 之间纠结。这两款车三大件一样，外观见仁见智...',
    author: '漂移梦想',
    avatar: '/avatar3.jpg',
    category: 'general',
    likes: 89,
    comments: 125,
    views: 3420,
    createdAt: '1 天前',
    isLiked: false
  },
  {
    id: 4,
    title: 'Supra A90 赛道日记录',
    content: '参加了本地车友会的赛道日活动，开着我的 Supra A90 跑了 5 节。B58 发动机潜力巨大...',
    author: '牛魔王车主',
    avatar: '/avatar4.jpg',
    category: 'racing',
    likes: 178,
    comments: 38,
    views: 1560,
    createdAt: '1 天前',
    isLiked: false
  },
  {
    id: 5,
    title: 'Dodge Challenger Hellcat 地狱猫提车作业',
    content: '等了半年，我的地狱猫终于到了！717 马力，6.2L V8 机械增压，这声浪真的太炸了...',
    author: '美式肌肉',
    avatar: '/avatar5.jpg',
    category: 'models',
    likes: 312,
    comments: 95,
    views: 4280,
    createdAt: '2 天前',
    isLiked: false
  },
  {
    id: 6,
    title: '分享一些赛道驾驶技巧',
    content: '玩了 5 年赛道，总结了一些经验和大家分享。入弯前的刹车点选择、弯中的油门控制、出弯时机...',
    author: '赛道教练',
    avatar: '/avatar6.jpg',
    category: 'tech',
    likes: 445,
    comments: 78,
    views: 5620,
    createdAt: '3 天前',
    isLiked: true
  }
])

const filteredPosts = computed(() => {
  let result = posts.value

  if (activeCategory.value !== 'all') {
    result = result.filter(post => post.category === activeCategory.value)
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    result = result.filter(post =>
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        post.author.toLowerCase().includes(query)
    )
  }

  return result
})

const toggleLike = (post: Post) => {
  post.isLiked = !post.isLiked
  post.likes += post.isLiked ? 1 : -1
}

const openPostDetail = (postId: number) => {
  router.push(`/Forum/${postId}`)
}

const createPost = () => {
  if (!newPostTitle.value.trim() || !newPostContent.value.trim()) return

  const newPost: Post = {
    id: posts.value.length + 1,
    title: newPostTitle.value,
    content: newPostContent.value,
    author: '当前用户',
    avatar: '/avatar-default.jpg',
    category: newPostCategory.value,
    likes: 0,
    comments: 0,
    views: 0,
    createdAt: '刚刚',
    isLiked: false
  }

  posts.value.unshift(newPost)
  showPostModal.value = false
  newPostTitle.value = ''
  newPostContent.value = ''
  newPostCategory.value = 'general'
}

const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}
</script>

<template>
  <div class="forum-container">
    <div class="forum-header">
      <h1 class="forum-title">车友社区</h1>
      <p class="forum-subtitle">分享你的驾驶故事，交流用车心得</p>
      <button class="create-post-btn" @click="showPostModal = true">
        <svg-icon name="edit" :width="20" :height="20" />
        发布帖子
      </button>
    </div>

    <div class="forum-search">
      <div class="search-box">
        <svg-icon name="search" :width="20" :height="20" />
        <input
            type="text"
            v-model="searchQuery"
            placeholder="搜索帖子、作者..."
        />
      </div>
    </div>

    <div class="category-tabs">
      <div
          v-for="category in categories"
          :key="category.id"
          class="tab-item"
          :class="{ active: activeCategory === category.id }"
          @click="activeCategory = category.id"
      >
        <svg-icon :name="category.icon" :width="20" :height="20" />
        <span>{{ category.name }}</span>
      </div>
    </div>

    <div class="posts-list">
      <div
          v-for="post in filteredPosts"
          :key="post.id"
          class="post-card"
          @click="openPostDetail(post.id)"
      >
        <div class="post-header">
          <div class="author-info">
            <div class="author-avatar">
              <img :src="post.avatar" :alt="post.author" @error="$event.target.src='/placeholder.jpg'" />
            </div>
            <div class="author-details">
              <span class="author-name">{{ post.author }}</span>
              <span class="post-time">{{ post.createdAt }}</span>
            </div>
          </div>
          <div class="post-category">
            <span class="category-tag">{{ categories.find(c => c.id === post.category)?.name }}</span>
          </div>
        </div>

        <div class="post-content">
          <h3 class="post-title">{{ post.title }}</h3>
          <p class="post-excerpt">{{ post.content }}</p>
        </div>

        <div class="post-stats">
          <div class="stat-item" @click.stop="toggleLike(post)">
            <svg-icon :name="post.isLiked ? 'heart-filled' : 'heart'" :width="18" :height="18" />
            <span :class="{ liked: post.isLiked }">{{ formatNumber(post.likes) }}</span>
          </div>
          <div class="stat-item">
            <svg-icon name="comment" :width="18" :height="18" />
            <span>{{ formatNumber(post.comments) }}</span>
          </div>
          <div class="stat-item">
            <svg-icon name="eye" :width="18" :height="18" />
            <span>{{ formatNumber(post.views) }}</span>
          </div>
        </div>
      </div>

      <div v-if="filteredPosts.length === 0" class="no-posts">
        <svg-icon name="inbox" :width="60" :height="60" />
        <p>暂无相关帖子</p>
      </div>
    </div>

    <div class="modal-overlay" v-if="showPostModal" @click="showPostModal = false">
      <div class="post-modal" @click.stop>
        <div class="modal-header">
          <h2>发布新帖子</h2>
          <button class="close-btn" @click="showPostModal = false">
            <svg-icon name="close" :width="24" :height="24" />
          </button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label>标题</label>
            <input
                type="text"
                v-model="newPostTitle"
                placeholder="请输入帖子标题（最多 50 字）"
                maxlength="50"
            />
          </div>

          <div class="form-group">
            <label>分类</label>
            <select v-model="newPostCategory">
              <option value="general">综合讨论</option>
              <option value="models">车型讨论</option>
              <option value="tech">技术交流</option>
              <option value="racing">赛事竞技</option>
              <option value="modify">改装分享</option>
            </select>
          </div>

          <div class="form-group">
            <label>内容</label>
            <textarea
                v-model="newPostContent"
                placeholder="分享你的想法和经验..."
                rows="8"
            ></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button class="cancel-btn" @click="showPostModal = false">取消</button>
          <button class="submit-btn" @click="createPost" :disabled="!newPostTitle.trim() || !newPostContent.trim()">
            发布
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.forum-container {
  min-height: calc(100vh - 80px);
  margin-top: 80px;
  padding: 40px 5%;
  background: linear-gradient(135deg, rgba(1, 10, 14, 0.95) 0%, rgba(1, 20, 30, 0.98) 100%);
}

.forum-header {
  text-align: center;
  margin-bottom: 40px;
}

.forum-title {
  font-size: 2.5rem;
  color: #fff;
  margin-bottom: 10px;
  font-weight: 700;
  letter-spacing: 2px;
}

.forum-subtitle {
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.1rem;
  margin-bottom: 30px;
}

.create-post-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 30px;
  background: linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%);
  border: none;
  border-radius: 25px;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 5px 20px rgba(0, 210, 255, 0.3);
}

.create-post-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 210, 255, 0.5);
}

.forum-search {
  max-width: 600px;
  margin: 0 auto 30px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 25px;
}

.search-box svg {
  color: rgba(255, 255, 255, 0.4);
}

.search-box input {
  flex: 1;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 1rem;
  outline: none;
}

.search-box input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.category-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 30px;
  overflow-x: auto;
  padding-bottom: 10px;
}

.category-tabs::-webkit-scrollbar {
  height: 6px;
}

.category-tabs::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.tab-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.tab-item.active {
  background: linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%);
  border-color: transparent;
  color: #fff;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.post-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.post-card:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateX(5px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
}

.author-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.author-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.author-name {
  color: #fff;
  font-weight: 600;
  font-size: 0.95rem;
}

.post-time {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.85rem;
}

.category-tag {
  padding: 4px 12px;
  background: rgba(0, 210, 255, 0.15);
  color: #00d2ff;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
}

.post-content {
  margin-bottom: 20px;
}

.post-title {
  color: #fff;
  font-size: 1.2rem;
  margin-bottom: 10px;
  font-weight: 600;
}

.post-excerpt {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.95rem;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-stats {
  display: flex;
  gap: 24px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.2s ease;
}

.stat-item:hover {
  color: rgba(255, 255, 255, 0.8);
}

.stat-item .liked {
  color: #ff4757;
}

.no-posts {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.4);
}

.no-posts svg {
  margin-bottom: 20px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(5px);
}

.post-modal {
  background: rgba(1, 10, 14, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h2 {
  color: #fff;
  font-size: 1.5rem;
  margin: 0;
}

.close-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  color: #fff;
  transform: rotate(90deg);
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  color: #fff;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 0.95rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #fff;
  font-size: 1rem;
  outline: none;
  transition: all 0.2s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #00d2ff;
  background: rgba(255, 255, 255, 0.08);
}

.form-group textarea {
  resize: vertical;
  font-family: inherit;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.cancel-btn,
.submit-btn {
  padding: 10px 24px;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.submit-btn {
  background: linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%);
  border: none;
  color: #fff;
  box-shadow: 0 5px 15px rgba(0, 210, 255, 0.3);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 210, 255, 0.5);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .forum-container {
    padding: 20px;
  }

  .forum-title {
    font-size: 1.8rem;
  }

  .category-tabs {
    gap: 8px;
  }

  .tab-item {
    padding: 8px 16px;
    font-size: 0.9rem;
  }

  .post-card {
    padding: 16px;
  }

  .post-title {
    font-size: 1rem;
  }
}
</style>
