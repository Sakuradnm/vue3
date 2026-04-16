<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Edit, Delete, Document, User } from '@element-plus/icons-vue'

// 用户管理数据
interface UserData {
  id: number
  username: string
  phone?: string
  email: string
  level: 'student' | 'teacher' | 'admin'
  nickname?: string
  avatarUrl?: string
  gender?: 'male' | 'female' | 'other'
  birthday?: string
  bio?: string
  location?: string
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
    } else {
      error.value = response.data.message || '获取用户列表失败'
      ElMessage.error(error.value)
    }
  } catch (err) {
    // 静默处理错误
    error.value = '网络错误，请稍后重试'
    ElMessage.error('网络错误，请稍后重试')
  } finally {
    loading.value = false
  }
}

const editUser = (user: UserData) => {
  // 这里可以打开编辑对话框
  ElMessage.info(`编辑用户: ${user.username}`)
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
      }
      ElMessage.success('用户已删除')
      // 重新加载用户列表
      await fetchUserList()
    } catch (err) {
      ElMessage.error('删除失败，请稍后重试')
    }
  }).catch(() => {})
}

// 组件挂载时加载数据
onMounted(() => {
  fetchUserList()
})
</script>

<template>
  <div class="users-section">
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
        <el-table-column prop="nickname" label="昵称" width="120" />
        <el-table-column prop="level" label="用户级别" width="100">
          <template #default="{ row }">
            <el-tag :type="row.level === 'admin' ? 'danger' : row.level === 'teacher' ? 'success' : ''">
              {{ translateLevel(row.level) }}
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
  </div>
</template>

<style scoped>
.users-section {
  animation: fadeIn 0.4s ease;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1.5rem;
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
</style>
