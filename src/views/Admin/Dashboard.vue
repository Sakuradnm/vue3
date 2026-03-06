<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import {
  ElMessage,
  ElMessageBox,
  type FormInstance,
  type FormRules
} from 'element-plus'
import {
  HomeFilled,
  DataAnalysis,
  Document,
  User,
  Bell,
  Setting,
  VideoCamera,
  ArrowLeft,
  Check,
  Close,
  Delete,
  Edit,
  Refresh,
  Search,
  Plus,
  SwitchButton
} from '@element-plus/icons-vue'

const router = useRouter()

// 当前激活的菜单
const activeMenu = ref('dashboard')

// 动画控制
const cardAnimationsLoaded = ref(false)

// 登录状态
const isLoggedIn = ref(false)
const userInfo = ref<any>(null)
const unreadNoticeCount = ref(0)

// 管理员信息
const adminInfo = reactive({
  name: '系统管理员',
  avatar: ''
})

// 数据概览统计
const stats = reactive({
  totalCourses: 1247,
  totalUsers: 8563,
  pendingReviews: 23,
  todayNotifications: 15
})

// 统计卡片配置
const statCards = computed(() => [
  {
    id: 'courses',
    label: '课程总数',
    value: stats.totalCourses,
    trend: '+12% 本月',
    gradient: 'gradient-purple',
    icon: VideoCamera
  },
  {
    id: 'users',
    label: '用户总数',
    value: stats.totalUsers,
    trend: '+8% 本月',
    gradient: 'gradient-pink',
    icon: User
  },
  {
    id: 'reviews',
    label: '待审核',
    value: stats.pendingReviews,
    trend: '需要处理',
    gradient: 'gradient-blue',
    icon: Document
  },
  {
    id: 'notifications',
    label: '今日通知',
    value: stats.todayNotifications,
    trend: `${unreadCount.value} 未读`,
    gradient: 'gradient-green',
    icon: Bell
  }
])

// 待审核课程数据
interface Course {
  id: number
  title: string
  instructor: string
  category: string
  submitTime: string
  status: string
  thumbnail: string
}

const pendingCourses = ref<Course[]>([
  {
    id: 1,
    title: 'Vue 3 高级实战课程',
    instructor: '张老师',
    category: '前端开发',
    submitTime: '2024-03-09 10:30',
    status: 'pending',
    thumbnail: 'https://picsum.photos/seed/course1/400/225'
  },
  {
    id: 2,
    title: 'Python 数据分析从入门到精通',
    instructor: '李老师',
    category: '数据科学',
    submitTime: '2024-03-09 09:15',
    status: 'pending',
    thumbnail: 'https://picsum.photos/seed/course2/400/225'
  },
  {
    id: 3,
    title: 'UI/UX 设计实战训练营',
    instructor: '王老师',
    category: '设计',
    submitTime: '2024-03-08 16:45',
    status: 'pending',
    thumbnail: 'https://picsum.photos/seed/course3/400/225'
  }
])

// 用户管理数据
interface UserData {
  id: number
  username: string
  phone?: string
  email: string
  level: 'student' | 'teacher' | 'admin'
  status: string
  createdAt: string
  updatedAt: string
}

const users = ref<UserData[]>([])
const loading = ref(false)
const error = ref('')

const searchKeyword = ref('')

const filteredUsers = computed(() => {
  if (!searchKeyword.value) return users.value
  return users.value.filter(user =>
      user.username.includes(searchKeyword.value) ||
      user.email.includes(searchKeyword.value)
  )
})

// 通知数据
interface Notification {
  id: number
  type: string
  title: string
  content: string
  time: string
  read: boolean
}

const notifications = ref<Notification[]>([
  {
    id: 1,
    type: 'course',
    title: '新课程待审核',
    content: '张老师提交了新课程"Vue 3 高级实战课程"',
    time: '5分钟前',
    read: false
  },
  {
    id: 2,
    type: 'user',
    title: '新用户注册',
    content: '用户"李明"刚刚完成注册',
    time: '15分钟前',
    read: false
  },
  {
    id: 3,
    type: 'system',
    title: '系统更新',
    content: '系统将于今晚22:00进行维护更新',
    time: '1小时前',
    read: true
  },
  {
    id: 4,
    type: 'course',
    title: '课程评价提醒',
    content: '"Python 基础教程"收到新的用户评价',
    time: '2小时前',
    read: true
  }
])

const unreadCount = computed(() =>
    notifications.value.filter(n => !n.read).length
)

// 编辑用户对话框
const editDialogVisible = ref(false)
const editForm = reactive({
  id: 0,
  username: '',
  email: '',
  role: '',
  status: ''
})

const editFormRef = ref<FormInstance>()
const editRules = reactive<FormRules>({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
})

// 方法
const goBack = () => {
  router.push('/Home')
}

const handleLogout = () => {
  localStorage.removeItem('userInfo')
  localStorage.removeItem('rememberedUsername')
  isLoggedIn.value = false
  userInfo.value = null
  unreadNoticeCount.value = 0

  ElMessage.success('已退出登录')

  setTimeout(() => {
    router.push('/Home')
  }, 500)
}

const handleMenuClick = (menu: string) => {
  activeMenu.value = menu
  // 切换到用户管理时加载数据
  if (menu === 'users' && users.value.length === 0) {
    fetchUserList()
  }
  // 切换到数据概览时重新触发动画
  if (menu === 'dashboard') {
    nextTick(() => {
      cardAnimationsLoaded.value = false
      setTimeout(() => {
        cardAnimationsLoaded.value = true
      }, 50)
    })
  }
}

const approveCourse = (course: Course) => {
  ElMessageBox.confirm(
      `确认通过课程"${course.title}"的审核吗?`,
      '确认操作',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'success'
      }
  ).then(() => {
    const index = pendingCourses.value.findIndex(c => c.id === course.id)
    if (index > -1) {
      pendingCourses.value.splice(index, 1)
      stats.pendingReviews--
    }
    ElMessage.success('课程审核通过')
  }).catch(() => {})
}

const rejectCourse = (course: Course) => {
  ElMessageBox.prompt('请输入拒绝原因', '拒绝审核', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    inputPattern: /.+/,
    inputErrorMessage: '请输入拒绝原因'
  }).then(({ value }) => {
    const index = pendingCourses.value.findIndex(c => c.id === course.id)
    if (index > -1) {
      pendingCourses.value.splice(index, 1)
      stats.pendingReviews--
    }
    ElMessage.warning(`已拒绝课程: ${value}`)
  }).catch(() => {})
}

// 翻译用户级别
const translateLevel = (level: string) => {
  const levelMap: Record<string, string> = {
    student: '学生',
    teacher: '教师',
    admin: '管理员'
  }
  return levelMap[level] || level
}

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 获取用户列表
const fetchUserList = async () => {
  // 防止重复请求
  if (loading.value) return

  loading.value = true
  error.value = ''

  try {
    const response = await axios.get('http://localhost:8080/api/users')

    if (response.data.code === 200) {
      users.value = response.data.data || []
      // 更新统计信息
      stats.totalUsers = users.value.length
    } else {
      error.value = response.data.message || '获取用户列表失败'
      ElMessage.error(error.value)
    }
  } catch (err) {
    console.error('获取用户列表失败:', err)
    error.value = '网络错误，请稍后重试'
    ElMessage.error('网络错误，请稍后重试')
  } finally {
    loading.value = false
  }
}

const editUser = (user: UserData) => {
  Object.assign(editForm, {
    id: user.id,
    username: user.username,
    email: user.email,
    role: translateLevel(user.level),
    status: user.status
  })
  editDialogVisible.value = true
}

const saveUser = async () => {
  if (!editFormRef.value) return
  await editFormRef.value.validate((valid) => {
    if (valid) {
      const index = users.value.findIndex(u => u.id === editForm.id)
      if (index > -1) {
        users.value[index] = { ...editForm }
      }
      editDialogVisible.value = false
      ElMessage.success('用户信息已更新')
    }
  })
}

const resetPassword = (user: UserData) => {
  ElMessageBox.confirm(
      `确认重置用户"${user.username}"的密码吗?`,
      '重置密码',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    ElMessage.success('密码已重置为默认密码')
  }).catch(() => {})
}

const deleteUser = (user: UserData) => {
  ElMessageBox.confirm(
      `确认删除用户"${user.username}"吗？此操作不可恢复。`,
      '删除用户',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'error'
      }
  ).then(async () => {
    try {
      await axios.delete(`http://localhost:8080/api/users/${user.id}`)
      const index = users.value.findIndex(u => u.id === user.id)
      if (index > -1) {
        users.value.splice(index, 1)
        stats.totalUsers = users.value.length
      }
      ElMessage.success('用户已删除')
      // 重新加载用户列表
      await fetchUserList()
    } catch (err) {
      console.error('删除用户失败:', err)
      ElMessage.error('删除失败，请稍后重试')
    }
  }).catch(() => {})
}

const markAsRead = (notification: Notification) => {
  notification.read = true
}

const markAllAsRead = () => {
  notifications.value.forEach(n => n.read = true)
  ElMessage.success('所有通知已标记为已读')
}

// 动画效果
onMounted(() => {
  // 初始加载时触发动画
  nextTick(() => {
    setTimeout(() => {
      cardAnimationsLoaded.value = true
    }, 50)
  })

  // 加载用户信息
  checkLoginStatus()

  // 如果默认激活的是用户管理菜单，则加载用户列表
  if (activeMenu.value === 'users') {
    fetchUserList()
  }
})

const checkLoginStatus = () => {
  const storedUserInfo = localStorage.getItem('userInfo')
  if (storedUserInfo) {
    userInfo.value = JSON.parse(storedUserInfo)
    isLoggedIn.value = true
  } else {
    isLoggedIn.value = false
    userInfo.value = null
  }
}
</script>

<template>
  <div class="admin-dashboard">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <!-- 用户信息区域 -->
      <div class="user-section">
        <div class="user-info-left">
          <div class="user-avatar">
            <span>{{ adminInfo.name.charAt(0) }}</span>
          </div>
          <div class="user-details">
            <span class="user-name">{{ adminInfo.name }}</span>
            <span class="user-role">超级管理员</span>
          </div>
        </div>
        <div class="user-info-right">
          <el-button
            class="logout-btn"
            :icon="SwitchButton"
            circle
            @click="handleLogout"
            title="退出登录"
          />
        </div>
      </div>

      <nav class="sidebar-nav">
        <div
            class="nav-item"
            :class="{ active: activeMenu === 'dashboard' }"
            @click="handleMenuClick('dashboard')"
        >
          <HomeFilled class="nav-icon" />
          <span>数据概览</span>
        </div>

        <div
            class="nav-item"
            :class="{ active: activeMenu === 'courses' }"
            @click="handleMenuClick('courses')"
        >
          <VideoCamera class="nav-icon" />
          <span>课程审核</span>
          <el-badge v-if="stats.pendingReviews > 0" :value="stats.pendingReviews" class="nav-badge" />
        </div>

        <div
            class="nav-item"
            :class="{ active: activeMenu === 'users' }"
            @click="handleMenuClick('users')"
        >
          <User class="nav-icon" />
          <span>用户管理</span>
        </div>

        <div
            class="nav-item"
            :class="{ active: activeMenu === 'notifications' }"
            @click="handleMenuClick('notifications')"
        >
          <Bell class="nav-icon" />
          <span>通知中心</span>
          <el-badge v-if="unreadCount > 0" :value="unreadCount" class="nav-badge" />
        </div>

        <div
            class="nav-item"
            :class="{ active: activeMenu === 'settings' }"
            @click="handleMenuClick('settings')"
        >
          <Setting class="nav-icon" />
          <span>系统设置</span>
        </div>
      </nav>
    </aside>

    <!-- 主内容区 -->
    <main class="main-content">
      <header class="page-header">
        <h1 class="page-title">
          {{ activeMenu === 'dashboard' ? '数据概览' :
            activeMenu === 'courses' ? '课程审核' :
                activeMenu === 'users' ? '用户管理' :
                    activeMenu === 'notifications' ? '通知中心' : '系统设置' }}
        </h1>
        <div class="header-actions">
          <span class="welcome-text">欢迎回来，管理员</span>
        </div>
      </header>

      <!-- 数据概览 -->
      <section v-if="activeMenu === 'dashboard'" class="dashboard-section">
        <div class="stats-grid">
          <div
            v-for="(stat, index) in statCards"
            :key="stat.id"
            class="stat-card"
            :class="[stat.gradient, { 'fade-in': cardAnimationsLoaded }]"
            :style="{ animationDelay: `${index * 100}ms` }"
          >
            <div class="stat-icon">
              <component :is="stat.icon" />
            </div>
            <div class="stat-content">
              <div class="stat-label">{{ stat.label }}</div>
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-trend">{{ stat.trend }}</div>
            </div>
          </div>
        </div>

        <!-- 快速操作 -->
        <div class="quick-actions">
          <h2 class="section-title">快速操作</h2>
          <div class="action-cards">
            <div class="action-card" @click="handleMenuClick('courses')">
              <VideoCamera class="action-icon" />
              <div class="action-title">审核课程</div>
              <div class="action-desc">{{ stats.pendingReviews }} 个待审核</div>
            </div>
            <div class="action-card" @click="handleMenuClick('users')">
              <User class="action-icon" />
              <div class="action-title">管理用户</div>
              <div class="action-desc">{{ stats.totalUsers }} 个用户</div>
            </div>
            <div class="action-card" @click="handleMenuClick('notifications')">
              <Bell class="action-icon" />
              <div class="action-title">查看通知</div>
              <div class="action-desc">{{ unreadCount }} 条未读</div>
            </div>
          </div>
        </div>
      </section>

      <!-- 课程审核 -->
      <section v-if="activeMenu === 'courses'" class="courses-section">
        <div class="section-header">
          <h2 class="section-title">待审核课程列表</h2>
        </div>

        <div v-if="pendingCourses.length === 0" class="empty-state">
          <Document class="empty-icon" />
          <p>暂无待审核课程</p>
        </div>

        <div v-else class="courses-grid">
          <div v-for="course in pendingCourses" :key="course.id" class="course-card">
            <div class="course-thumbnail">
              <img :src="course.thumbnail" :alt="course.title" />
              <div class="course-category">{{ course.category }}</div>
            </div>
            <div class="course-info">
              <h3 class="course-title">{{ course.title }}</h3>
              <div class="course-meta">
                <span class="instructor">讲师: {{ course.instructor }}</span>
                <span class="submit-time">提交: {{ course.submitTime }}</span>
              </div>
            </div>
            <div class="course-actions">
              <el-button
                  type="success"
                  :icon="Check"
                  @click="approveCourse(course)"
                  plain
              >
                通过
              </el-button>
              <el-button
                  type="danger"
                  :icon="Close"
                  @click="rejectCourse(course)"
                  plain
              >
                拒绝
              </el-button>
            </div>
          </div>
        </div>
      </section>

      <!-- 用户管理 -->
      <section v-if="activeMenu === 'users'" class="users-section">
        <div class="section-header">
          <h2 class="section-title">用户列表</h2>
          <el-input
              v-model="searchKeyword"
              placeholder="搜索用户名或邮箱"
              :prefix-icon="Search"
              class="search-input"
              clearable
          />
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
          <Refresh class="loading-icon spinning" />
          <span>加载中...</span>
        </div>

        <!-- 错误提示 -->
        <div v-else-if="error" class="error-state">
          <Document class="error-icon" />
          <p>{{ error }}</p>
          <el-button type="primary" @click="fetchUserList" plain>
            <Refresh /> 重试
          </el-button>
        </div>

        <!-- 用户表格 -->
        <div v-else-if="users.length > 0" class="table-container">
          <el-table :data="filteredUsers" class="users-table" stripe>
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="username" label="用户名" />
            <el-table-column prop="phone" label="手机号" width="140" />
            <el-table-column prop="email" label="邮箱" />
            <el-table-column prop="level" label="用户级别" width="100">
              <template #default="{ row }">
                <el-tag :type="row.level === 'admin' ? 'danger' : row.level === 'teacher' ? 'success' : ''">
                  {{ translateLevel(row.level) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 'active' ? 'success' : 'info'">
                  {{ row.status === 'active' ? '活跃' : '未激活' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="创建时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column prop="updatedAt" label="更新时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.updatedAt) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button
                    size="small"
                    :icon="Edit"
                    @click="editUser(row)"
                >
                  编辑
                </el-button>
                <el-button
                    size="small"
                    :icon="Delete"
                    @click="deleteUser(row)"
                    type="danger"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 空数据提示 -->
        <div v-else class="empty-state">
          <User class="empty-icon" />
          <p>暂无用户数据</p>
        </div>
      </section>

      <!-- 通知中心 -->
      <section v-if="activeMenu === 'notifications'" class="notifications-section">
        <div class="section-header">
          <h2 class="section-title">系统通知</h2>
          <el-button
              v-if="unreadCount > 0"
              type="primary"
              @click="markAllAsRead"
              plain
          >
            全部标记为已读
          </el-button>
        </div>

        <div class="notifications-list">
          <div
              v-for="notification in notifications"
              :key="notification.id"
              class="notification-item"
              :class="{ unread: !notification.read }"
              @click="markAsRead(notification)"
          >
            <div class="notification-icon" :class="`type-${notification.type}`">
              <VideoCamera v-if="notification.type === 'course'" />
              <User v-else-if="notification.type === 'user'" />
              <Bell v-else />
            </div>
            <div class="notification-content">
              <h3 class="notification-title">{{ notification.title }}</h3>
              <p class="notification-text">{{ notification.content }}</p>
              <span class="notification-time">{{ notification.time }}</span>
            </div>
            <div v-if="!notification.read" class="unread-indicator"></div>
          </div>
        </div>
      </section>

      <!-- 系统设置 -->
      <section v-if="activeMenu === 'settings'" class="settings-section">
        <div class="settings-placeholder">
          <Setting class="settings-icon" />
          <h2>系统设置</h2>
          <p>系统设置功能开发中...</p>
        </div>
      </section>
    </main>

    <!-- 编辑用户对话框 -->
    <el-dialog
        v-model="editDialogVisible"
        title="编辑用户信息"
        width="500px"
    >
      <el-form
          ref="editFormRef"
          :model="editForm"
          :rules="editRules"
          label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="editForm.role" style="width: 100%">
            <el-option label="学生" value="学生" />
            <el-option label="教师" value="教师" />
            <el-option label="管理员" value="管理员" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="editForm.status" style="width: 100%">
            <el-option label="活跃" value="active" />
            <el-option label="未激活" value="inactive" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveUser">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.admin-dashboard {
  display: flex;
  min-height: 100vh;
  background: #f8f9fb;
  font-family: 'Lexend', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* 侧边栏 */
.sidebar {
  width: 280px;
  background: white;
  border-right: 1px solid #e8ecf1;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 100;
}

/* 用户信息区域 */
.user-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e8ecf1;
  background: linear-gradient(135deg, #f8f9fb 0%, #ffffff 100%);
}

.user-info-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 700;
  flex-shrink: 0;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  overflow: hidden;
}

.user-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
}

.user-role {
  font-size: 0.75rem;
  color: #64748b;
}

.user-info-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.logout-btn {
  width: 40px;
  height: 40px;
  border: 1px solid #e2e8f0;
  color: #64748b;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
  color: white;
  transform: rotate(15deg);
}

.sidebar-header {
  padding: 1.5rem 1.5rem;
  border-bottom: 1px solid #e8ecf1;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  padding: 8px;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.sidebar-nav {
  flex: 1;
  padding: 1.5rem 1rem;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  margin-bottom: 0.5rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  color: #64748b;
  font-weight: 500;
}

.nav-item:hover {
  background: #f1f5f9;
  color: #334155;
  transform: translateX(4px);
}

.nav-item.active {
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  color: #667eea;
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 24px;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  border-radius: 0 4px 4px 0;
}

.nav-icon {
  width: 20px;
  height: 20px;
}

.nav-badge {
  margin-left: auto;
}

.sidebar-footer {
  padding: 1.5rem 1rem;
  border-top: 1px solid #e8ecf1;
}

.back-btn {
  width: 100%;
}

/* 主内容区 */
.main-content {
  flex: 1;
  margin-left: 280px;
  padding: 2rem;
  overflow-y: auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-text {
  color: #64748b;
  font-weight: 500;
}

/* 数据统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.stat-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  display: flex;
  gap: 1.5rem;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  transform: translateY(20px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
}

.stat-card.fade-in {
  animation: slideInUp 0.6s ease forwards;
}

@keyframes slideInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-card.gradient-purple::before {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.stat-card.gradient-pink::before {
  background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%);
}

.stat-card.gradient-blue::before {
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
}

.stat-card.gradient-green::before {
  background: linear-gradient(90deg, #43e97b 0%, #38f9d7 100%);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.gradient-purple .stat-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.gradient-pink .stat-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.gradient-blue .stat-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.gradient-green .stat-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
}

.stat-card:hover .stat-icon {
  transform: scale(1.1) rotate(5deg);
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.stat-trend {
  font-size: 0.75rem;
  color: #10b981;
  font-weight: 600;
}

/* 快速操作 */
.quick-actions {
  margin-top: 2.5rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1.5rem;
}

.action-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.action-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -4px rgba(0, 0, 0, 0.08);
  border-color: #667eea;
}

.action-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 1rem;
  color: #667eea;
}

.action-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.action-desc {
  font-size: 0.875rem;
  color: #64748b;
}

/* 课程审核 */
.courses-section {
  animation: fadeIn 0.4s ease;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.courses-grid {
  display: grid;
  gap: 1.5rem;
}

.course-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  gap: 1.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.course-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -4px rgba(0, 0, 0, 0.08);
}

.course-thumbnail {
  width: 280px;
  height: 160px;
  position: relative;
  flex-shrink: 0;
}

.course-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.course-category {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255, 255, 255, 0.95);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #667eea;
}

.course-info {
  flex: 1;
  padding: 1.5rem 0;
}

.course-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1rem;
}

.course-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #64748b;
}

.course-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem 1.5rem 1.5rem 0;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 16px;
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: #cbd5e1;
  margin: 0 auto 1rem;
}

/* 用户管理 */
.users-section {
  animation: fadeIn 0.4s ease;
}

.search-input {
  width: 300px;
}

.table-container {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.users-table {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 16px;
  color: #64748b;
  gap: 1rem;
}

.loading-icon {
  width: 48px;
  height: 48px;
  color: #667eea;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 错误状态 */
.error-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 16px;
  color: #ef4444;
}

.error-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1rem;
  color: #f87171;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 16px;
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: #cbd5e1;
  margin: 0 auto 1rem;
}

/* 通知中心 */
.notifications-section {
  animation: fadeIn 0.4s ease;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.notification-item {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  border: 2px solid transparent;
}

.notification-item:hover {
  transform: translateX(4px);
  box-shadow: 0 8px 16px -4px rgba(0, 0, 0, 0.08);
  border-color: #e8ecf1;
}

.notification-item.unread {
  background: linear-gradient(135deg, #667eea05 0%, #764ba205 100%);
}

.notification-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: white;
}

.notification-icon.type-course {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.notification-icon.type-user {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.notification-icon.type-system {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.notification-text {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.5rem;
}

.notification-time {
  font-size: 0.75rem;
  color: #94a3b8;
}

.unread-indicator {
  width: 10px;
  height: 10px;
  background: #667eea;
  border-radius: 50%;
  flex-shrink: 0;
  align-self: center;
}

/* 系统设置 */
.settings-section {
  animation: fadeIn 0.4s ease;
}

.settings-placeholder {
  background: white;
  border-radius: 16px;
  padding: 4rem 2rem;
  text-align: center;
}

.settings-icon {
  width: 64px;
  height: 64px;
  color: #cbd5e1;
  margin: 0 auto 1rem;
}

/* 动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式 */
@media (max-width: 1024px) {
  .sidebar {
    width: 240px;
  }

  .main-content {
    margin-left: 240px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .sidebar {
    width: 80px;
  }

  .user-section {
    padding: 1rem;
  }

  .user-info-left {
    flex-direction: column;
    gap: 0.5rem;
  }

  .user-details {
    display: none;
  }

  .user-info-right {
    display: none;
  }

  .main-content {
    margin-left: 80px;
    padding: 1rem;
  }

  .logo-text,
  .nav-item span {
    display: none;
  }

  .nav-item {
    justify-content: center;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .course-card {
    flex-direction: column;
  }

  .course-thumbnail {
    width: 100%;
    height: 200px;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .search-input {
    width: 100%;
  }
}
</style>