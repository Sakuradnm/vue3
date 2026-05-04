<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
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
  password?: string  // 用于编辑时修改密码
  status?: number  // 0-正常, 1-停用
  createdAt: string
  updatedAt: string
}

const users = ref<UserData[]>([])
const loading = ref(false)
const error = ref('')
const searchKeyword = ref('')

// 筛选相关
const filterLevel = ref<string>('')  // 级别筛选
const filterStatus = ref<string>('')  // 状态筛选
const dateRange = ref<[string, string] | null>(null)  // 时间范围筛选

const filteredUsers = computed(() => {
  // 每次都从原始数据开始过滤
  let result = [...users.value]
  
  // 搜索过滤
  if (searchKeyword.value && searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.trim().toLowerCase()
    result = result.filter(user =>
        user.username.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        (user.nickname && user.nickname.toLowerCase().includes(keyword))
    )
  }
  
  // 级别筛选
  if (filterLevel.value && filterLevel.value !== '' && filterLevel.value !== null && filterLevel.value !== undefined) {
    result = result.filter(user => user.level === filterLevel.value)
  }
  
  // 状态筛选
  if (filterStatus.value !== '' && filterStatus.value !== null && filterStatus.value !== undefined) {
    result = result.filter(user => user.status?.toString() === filterStatus.value)
  }
  
  // 时间范围筛选
  if (dateRange.value && dateRange.value.length === 2 && dateRange.value[0] && dateRange.value[1]) {
    const startDate = new Date(dateRange.value[0])
    const endDate = new Date(dateRange.value[1])
    endDate.setHours(23, 59, 59, 999)  // 结束时间设置为当天23:59:59
    
    result = result.filter(user => {
      const createdAt = new Date(user.createdAt)
      return createdAt >= startDate && createdAt <= endDate
    })
  }
  
  return result
})

// 重置筛选
const resetFilters = () => {
  filterLevel.value = ''
  filterStatus.value = ''
  dateRange.value = null
  searchKeyword.value = ''
}

// 处理筛选清除
const handleFilterClear = () => {
  // 强制触发响应式更新
  nextTick(() => {
    filterLevel.value = ''
    filterStatus.value = ''
  })
}

// 处理搜索清除
const handleSearchClear = () => {
  // 强制触发响应式更新
  nextTick(() => {
    searchKeyword.value = ''
  })
}

// 处理日期范围清除
const handleDateClear = () => {
  // 强制触发响应式更新
  nextTick(() => {
    dateRange.value = null
  })
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
  // 管理员不能编辑其他管理员
  if (user.level === 'admin') {
    ElMessage.warning('无法编辑管理员账号')
    return
  }
  
  // 打开编辑对话框
  editingUser.value = { ...user }
  showEditDialog.value = true
}

const deleteUser = (user: UserData) => {
  // 管理员不能删除其他管理员
  if (user.level === 'admin') {
    ElMessage.warning('无法删除管理员账号')
    return
  }
  
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

// 停用/启用用户
const toggleUserStatus = async (user: UserData) => {
  // 管理员不能停用其他管理员
  if (user.level === 'admin') {
    ElMessage.warning('无法停用管理员账号')
    return
  }
  
  const newStatus = user.status === 1 ? 0 : 1
  const actionText = newStatus === 1 ? '停用' : '启用'
  
  try {
    await ElMessageBox.confirm(
        `确认${actionText}用户"${user.username}"吗？`,
        `${actionText}用户`,
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        }
    )
    
    await axios.put(`http://localhost:8080/api/users/${user.id}/status`, { status: newStatus })
    user.status = newStatus
    ElMessage.success(`用户已${actionText}`)
  } catch (err: any) {
    if (err !== 'cancel') {
      ElMessage.error(`${actionText}失败，请稍后重试`)
    }
  }
}

// 编辑对话框相关
const showEditDialog = ref(false)
const editingUser = ref<UserData | null>(null)
const savingEdit = ref(false)

// 保存编辑
const saveEdit = async () => {
  if (!editingUser.value) return
  
  savingEdit.value = true
  try {
    // 准备要发送的数据
    const updateData: any = {
      username: editingUser.value.username,
      phone: editingUser.value.phone,
      email: editingUser.value.email,
      level: editingUser.value.level
    }
    
    // 只有当密码不为空时才发送密码
    if (editingUser.value.password && editingUser.value.password.trim()) {
      updateData.password = editingUser.value.password
    }
    
    await axios.put(`http://localhost:8080/api/users/${editingUser.value.id}`, updateData)
    
    // 更新本地数据
    const index = users.value.findIndex(u => u.id === editingUser.value!.id)
    if (index > -1) {
      // 不更新密码字段到列表显示
      const { password, ...restData } = editingUser.value
      users.value[index] = { ...restData } as UserData
    }
    
    ElMessage.success('用户信息已更新')
    showEditDialog.value = false
    editingUser.value = null
  } catch (err) {
    ElMessage.error('保存失败，请稍后重试')
  } finally {
    savingEdit.value = false
  }
}

// 关闭编辑对话框
const closeEditDialog = () => {
  showEditDialog.value = false
  editingUser.value = null
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
      <div class="header-controls">
        <el-select
          v-model="filterLevel"
          placeholder="用户级别"
          clearable
          @clear="handleFilterClear"
          style="width: 120px"
        >
          <el-option label="学生" value="student" />
          <el-option label="教师" value="teacher" />
          <el-option label="管理员" value="admin" />
        </el-select>
        
        <el-select
          v-model="filterStatus"
          placeholder="状态"
          clearable
          @clear="handleFilterClear"
          style="width: 100px"
        >
          <el-option label="正常" value="0" />
          <el-option label="已停用" value="1" />
        </el-select>
        
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 240px"
          value-format="YYYY-MM-DD"
          @clear="handleDateClear"
        />
        
        <el-input
          v-model="searchKeyword"
          placeholder="搜索用户名或邮箱"
          :prefix-icon="Search"
          class="search-input"
          clearable
          @clear="handleSearchClear"
        />
        
        <el-button @click="resetFilters" size="default">重置</el-button>
      </div>
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
      <el-table 
        :data="filteredUsers" 
        class="users-table" 
        stripe
      >
        <el-table-column prop="id" label="ID" width="80" sortable />
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
        <el-table-column prop="nickname" label="昵称" width="100" />
        <el-table-column prop="level" label="用户级别" width="100">
          <template #default="{ row }">
            <el-tag :type="row.level === 'admin' ? 'danger' : row.level === 'teacher' ? 'success' : ''" size="small">
              {{ translateLevel(row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'danger' : 'success'" size="small">
              {{ row.status === 1 ? '已停用' : '正常' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="170">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="170">
          <template #default="{ row }">
            {{ formatDate(row.updatedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <!-- 非管理员用户才显示操作按钮 -->
              <template v-if="row.level !== 'admin'">
                <el-button
                  size="small"
                  :icon="Edit"
                  @click="editUser(row)"
                  type="primary"
                >
                  编辑
                </el-button>
                <el-button
                  size="small"
                  @click="toggleUserStatus(row)"
                  :type="row.status === 1 ? 'success' : 'warning'"
                >
                  {{ row.status === 1 ? '启用' : '停用' }}
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
              <!-- 管理员用户显示提示 -->
              <template v-else>
                <el-tag type="info" size="small">管理员账号</el-tag>
              </template>
            </div>
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

  <!-- 编辑用户对话框 -->
  <el-dialog
    v-model="showEditDialog"
    title="编辑用户信息"
    width="600px"
    :close-on-click-modal="false"
  >
    <el-form
      v-if="editingUser"
      :model="editingUser"
      label-width="100px"
      class="edit-form"
    >
      <el-form-item label="用户名">
        <el-input v-model="editingUser.username" disabled />
      </el-form-item>
      
      <el-form-item label="手机号">
        <el-input v-model="editingUser.phone" placeholder="请输入手机号" />
      </el-form-item>
      
      <el-form-item label="邮箱">
        <el-input v-model="editingUser.email" placeholder="请输入邮箱" />
      </el-form-item>
      
      <el-form-item label="密码">
        <el-input 
          v-model="editingUser.password" 
          type="password"
          placeholder="留空则不修改密码" 
          show-password
        />
        <div class="form-tip">提示：留空表示不修改密码</div>
      </el-form-item>
      
      <el-form-item label="权限">
        <el-select v-model="editingUser.level" placeholder="请选择权限">
          <el-option label="学生" value="student" />
          <el-option label="教师" value="teacher" />
          <el-option label="管理员" value="admin" />
        </el-select>
      </el-form-item>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeEditDialog">取消</el-button>
        <el-button type="primary" @click="saveEdit" :loading="savingEdit">
          保存
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>
.users-section {
  animation: fadeIn 0.4s ease;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.search-input {
  width: 200px;
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

.action-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: nowrap;
}

.action-buttons .el-button {
  border-width: 1px;
  border-style: solid;
  padding: 5px 12px;
  font-weight: 500;
}

.edit-form {
  padding: 1rem 0;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>
