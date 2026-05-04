<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Delete, VideoCamera } from '@element-plus/icons-vue'

// 课程管理数据
interface CourseData {
  id: number
  name: string
  description?: string
  subCategoryId?: number
  sortOrder?: number
  status?: number  // 0-上架, 1-下架
  courseCount?: number  // 章节数量
}

const courses = ref<CourseData[]>([])
const loading = ref(false)
const error = ref('')
const searchKeyword = ref('')

// 筛选相关
const filterStatus = ref<string>('')

const filteredCourses = computed(() => {
  // 每次都从原始数据开始过滤
  let result = [...courses.value]
  
  // 搜索过滤
  if (searchKeyword.value && searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.trim().toLowerCase()
    result = result.filter(course =>
        course.name.toLowerCase().includes(keyword) ||
        (course.description && course.description.toLowerCase().includes(keyword))
    )
  }
  
  // 状态筛选
  if (filterStatus.value !== '' && filterStatus.value !== null && filterStatus.value !== undefined) {
    result = result.filter(course => course.status?.toString() === filterStatus.value)
  }
  
  return result
})

// 重置筛选
const resetFilters = () => {
  filterStatus.value = ''
  searchKeyword.value = ''
}

// 处理筛选清除
const handleFilterClear = () => {
  // 强制触发响应式更新
  nextTick(() => {
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

// 获取课程列表
const fetchCourseList = async () => {
  if (loading.value) return

  loading.value = true
  error.value = ''

  try {
    const response = await axios.get('http://localhost:8080/api/admin/courses')

    if (response.data.code === 200) {
      courses.value = response.data.data || []
    } else {
      error.value = response.data.message || '获取课程列表失败'
      ElMessage.error(error.value)
    }
  } catch (err) {
    error.value = '网络错误，请稍后重试'
    ElMessage.error('网络错误，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 切换课程状态（上架/下架）
const toggleCourseStatus = async (course: CourseData) => {
  const newStatus = course.status === 1 ? 0 : 1
  const actionText = newStatus === 1 ? '下架' : '上架'
  
  try {
    await ElMessageBox.confirm(
        `确认${actionText}课程"${course.courseName}"吗？`,
        `${actionText}课程`,
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        }
    )
    
    await axios.put(`http://localhost:8080/api/admin/courses/${course.id}/status`, { status: newStatus })
    course.status = newStatus
    ElMessage.success(`课程已${actionText}`)
  } catch (err: any) {
    if (err !== 'cancel') {
      ElMessage.error(`${actionText}失败，请稍后重试`)
    }
  }
}

// 删除课程
const deleteCourse = (course: CourseData) => {
  ElMessageBox.confirm(
      `确认删除课程“${course.name}”吗？此操作将同时删除所有关联的章节、小节和课程详情，且不可恢复。`,
      '删除课程',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'error'
      }
  ).then(async () => {
    try {
      await axios.delete(`http://localhost:8080/api/admin/courses/${course.id}`)
      const index = courses.value.findIndex(c => c.id === course.id)
      if (index > -1) {
        courses.value.splice(index, 1)
      }
      ElMessage.success('课程及所有关联数据已彻底删除')
    } catch (err) {
      ElMessage.error('删除失败，请稍后重试')
    }
  }).catch(() => {})
}

onMounted(() => {
  fetchCourseList()
})
</script>

<template>
  <div class="courses-section">
    <div class="section-header">
      <h2 class="section-title">课程资源管理</h2>
      <div class="header-controls">
        <el-select
          v-model="filterStatus"
          placeholder="课程状态"
          clearable
          @clear="handleFilterClear"
          style="width: 120px"
        >
          <el-option label="已上架" value="0" />
          <el-option label="已下架" value="1" />
        </el-select>
        
        <el-input
          v-model="searchKeyword"
          placeholder="搜索课程名称或讲师"
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
      <VideoCamera class="error-icon" />
      <p>{{ error }}</p>
      <el-button type="primary" @click="fetchCourseList" plain>
        <Refresh /> 重试
      </el-button>
    </div>

    <!-- 课程表格 -->
    <div v-else-if="courses.length > 0" class="table-container">
      <el-table 
        :data="filteredCourses" 
        class="courses-table" 
        stripe
      >
        <el-table-column prop="id" label="ID" width="80" sortable />
        <el-table-column prop="name" label="课程名称" min-width="250" show-overflow-tooltip />
        <el-table-column prop="description" label="简介" min-width="300" show-overflow-tooltip />
        <el-table-column label="章节数" width="100">
          <template #default="{ row }">
            <el-tag type="info" size="small">{{ row.courseCount || 0 }} 章</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'danger' : 'success'" size="small">
              {{ row.status === 1 ? '已下架' : '已上架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button
                size="small"
                :type="row.status === 1 ? 'success' : 'warning'"
                @click="toggleCourseStatus(row)"
              >
                {{ row.status === 1 ? '上架' : '下架' }}
              </el-button>
              <el-button
                size="small"
                :icon="Delete"
                @click="deleteCourse(row)"
                type="danger"
              >
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 空数据提示 -->
    <div v-else class="empty-state">
      <VideoCamera class="empty-icon" />
      <p>暂无课程数据</p>
    </div>
  </div>
</template>

<style scoped>
.courses-section {
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
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.search-input {
  width: 250px;
}

.table-container {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.courses-table {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
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
