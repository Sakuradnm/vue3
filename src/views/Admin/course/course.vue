<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Edit, Delete, VideoCamera } from '@element-plus/icons-vue'

// 课程管理数据
interface CourseData {
  id: number
  name: string
  description: string
  sortOrder: number
  subCategoryId: number
}

const courses = ref<CourseData[]>([])
const loading = ref(false)
const error = ref('')
const searchKeyword = ref('')

const filteredCourses = computed(() => {
  if (!searchKeyword.value) return courses.value
  return courses.value.filter(course =>
      course.name.includes(searchKeyword.value) ||
      course.description.includes(searchKeyword.value)
  )
})

// 获取课程列表
const fetchCourseList = async () => {
  // 防止重复请求
  if (loading.value) return

  loading.value = true
  error.value = ''

  try {
    const response = await axios.get('http://localhost:8080/api/courses')

    if (response.data && Array.isArray(response.data)) {
      courses.value = response.data
    } else {
      error.value = '获取课程列表失败'
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

const editCourse = (course: CourseData) => {
  // 这里可以打开编辑对话框
  ElMessage.info(`编辑课程: ${course.name}`)
}

const deleteCourse = (course: CourseData) => {
  ElMessageBox.confirm(
      `确认删除课程"${course.name}"吗？此操作不可恢复。`,
      '删除课程',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'error'
      }
  ).then(async () => {
    try {
      // 注意：目前后端可能没有提供删除课程的API，这里只是前端模拟
      // 实际项目中需要调用后端删除接口
      await axios.delete(`http://localhost:8080/api/courses/${course.id}`)
      const index = courses.value.findIndex(c => c.id === course.id)
      if (index > -1) {
        courses.value.splice(index, 1)
      }
      ElMessage.success('课程已删除')
      // 重新加载课程列表
      await fetchCourseList()
    } catch (err) {
      ElMessage.error('删除失败，请稍后重试')
    }
  }).catch(() => {})
}

// 组件挂载时加载数据
onMounted(() => {
  fetchCourseList()
})
</script>

<template>
  <div class="courses-section">
    <div class="section-header">
      <h2 class="section-title">课程资源管理</h2>
      <el-input
          v-model="searchKeyword"
          placeholder="搜索课程名称或描述"
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
      <VideoCamera class="error-icon" />
      <p>{{ error }}</p>
      <el-button type="primary" @click="fetchCourseList" plain>
        <Refresh /> 重试
      </el-button>
    </div>

    <!-- 课程表格 -->
    <div v-else-if="courses.length > 0" class="table-container">
      <el-table :data="filteredCourses" class="courses-table" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="课程名称" />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="sortOrder" label="排序" width="100" />
        <el-table-column prop="subCategoryId" label="子分类ID" width="120" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
                size="small"
                :icon="Edit"
                @click="editCourse(row)"
            >
              编辑
            </el-button>
            <el-button
                size="small"
                :icon="Delete"
                @click="deleteCourse(row)"
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

.courses-table {
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
