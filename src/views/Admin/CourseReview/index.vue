<template>
  <div class="course-review-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>课程审核管理</span>
          <el-radio-group v-model="filterType" @change="loadReviews">
            <el-radio-button label="pending">待审核</el-radio-button>
            <el-radio-button label="all">全部记录</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <el-table :data="reviewList" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="课程标题" min-width="200" />
        <el-table-column prop="instructor" label="讲师" width="120" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="submittedAt" label="提交时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.submittedAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="reviewedAt" label="审核时间" width="180">
          <template #default="{ row }">
            {{ row.reviewedAt ? formatDate(row.reviewedAt) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="viewDetail(row)">
              查看详情
            </el-button>
            <el-button 
              v-if="row.status === 0" 
              size="small" 
              type="success" 
              @click="handleApprove(row)"
            >
              通过
            </el-button>
            <el-button 
              v-if="row.status === 0" 
              size="small" 
              type="danger" 
              @click="handleReject(row)"
            >
              拒绝
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && reviewList.length === 0" description="暂无数据" />
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="课程详情"
      width="70%"
      :close-on-click-modal="false"
    >
      <div v-if="currentReview" class="review-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="课程标题">
            {{ currentReview.title }}
          </el-descriptions-item>
          <el-descriptions-item label="讲师">
            {{ currentReview.instructor }}
          </el-descriptions-item>
          <el-descriptions-item label="分类ID">
            {{ currentReview.categoryId }} / {{ currentReview.subCategoryId }}
          </el-descriptions-item>
        </el-descriptions>

        <el-divider content-position="left">课程描述</el-divider>
        <div class="content-section">{{ currentReview.description }}</div>

        <el-divider content-position="left" v-if="currentReview.introduction">课程简介</el-divider>
        <div class="content-section" v-if="currentReview.introduction">
          {{ currentReview.introduction }}
        </div>

        <el-divider content-position="left" v-if="currentReview.learningObjectives">学习目标</el-divider>
        <div class="content-section" v-if="currentReview.learningObjectives">
          {{ currentReview.learningObjectives }}
        </div>

        <el-divider content-position="left" v-if="currentReview.mainContent">主要内容</el-divider>
        <div class="content-section" v-if="currentReview.mainContent">
          {{ currentReview.mainContent }}
        </div>

        <el-divider content-position="left" v-if="currentReview.targetAudience">适用人群</el-divider>
        <div class="content-section" v-if="currentReview.targetAudience">
          {{ currentReview.targetAudience }}
        </div>

        <el-divider content-position="left" v-if="currentReview.teachingFeatures">教学特色</el-divider>
        <div class="content-section" v-if="currentReview.teachingFeatures">
          {{ currentReview.teachingFeatures }}
        </div>

        <el-divider content-position="left">章节内容</el-divider>
        <div class="chapters-section">
          <pre>{{ formatChapters(currentReview.chaptersData) }}</pre>
        </div>

        <el-divider content-position="left" v-if="currentReview.reviewComment">审核意见</el-divider>
        <div class="content-section" v-if="currentReview.reviewComment">
          {{ currentReview.reviewComment }}
        </div>
      </div>
    </el-dialog>

    <!-- 拒绝原因对话框 -->
    <el-dialog
      v-model="rejectVisible"
      title="拒绝原因"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-input
        v-model="rejectReason"
        type="textarea"
        :rows="4"
        placeholder="请输入拒绝原因"
      />
      <template #footer>
        <el-button @click="rejectVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmReject">确认拒绝</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getPendingReviews, getAllReviews, approveReview, rejectReview } from '@/api/courseReview'
import type { CourseReviewItem } from '@/api/courseReview'

const filterType = ref('pending')
const loading = ref(false)
const reviewList = ref<CourseReviewItem[]>([])
const detailVisible = ref(false)
const rejectVisible = ref(false)
const currentReview = ref<CourseReviewItem | null>(null)
const rejectReason = ref('')
const currentRejectId = ref<number | null>(null)

// 加载审核列表
const loadReviews = async () => {
  loading.value = true
  try {
    const res = filterType.value === 'pending' 
      ? await getPendingReviews() 
      : await getAllReviews()
    
    // res直接是数组数据，拦截器已经处理了code检查
    if (Array.isArray(res)) {
      reviewList.value = res
    } else {
      reviewList.value = []
    }
  } catch (error) {
    console.error('加载审核列表失败:', error)
    // 拦截器已经显示了错误信息
    reviewList.value = []
  } finally {
    loading.value = false
  }
}

// 查看详情
const viewDetail = (row: CourseReviewItem) => {
  currentReview.value = row
  detailVisible.value = true
}

// 格式化章节数据
const formatChapters = (chaptersData: string) => {
  try {
    const chapters = JSON.parse(chaptersData)
    return JSON.stringify(chapters, null, 2)
  } catch {
    return chaptersData
  }
}

// 审核通过
const handleApprove = async (row: CourseReviewItem) => {
  try {
    await ElMessageBox.confirm(
      `确定要通过课程“${row.title}”的审核吗？通过后将自动发布到课程列表。`,
      '确认通过',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 拦截器已经处理了code检查，成功会返回数据，失败会抛出异常
    await approveReview(row.id, 1) // 默认管理员ID为1
    ElMessage.success('审核通过，课程已发布')
    loadReviews()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('审核失败:', error)
      // 拦截器已经显示了错误信息
    }
  }
}

// 打开拒绝对话框
const handleReject = (row: CourseReviewItem) => {
  currentRejectId.value = row.id
  rejectReason.value = ''
  rejectVisible.value = true
}

// 确认拒绝
const confirmReject = async () => {
  if (!rejectReason.value.trim()) {
    ElMessage.warning('请输入拒绝原因')
    return
  }

  try {
    // 拦截器已经处理了code检查
    await rejectReview(currentRejectId.value!, 1, rejectReason.value)
    ElMessage.success('已拒绝')
    rejectVisible.value = false
    loadReviews()
  } catch (error) {
    console.error('拒绝失败:', error)
    // 拦截器已经显示了错误信息
  }
}

// 获取状态类型
const getStatusType = (status: number) => {
  const types: Record<number, string> = {
    0: 'warning',
    1: 'success',
    2: 'danger'
  }
  return types[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: number) => {
  const texts: Record<number, string> = {
    0: '待审核',
    1: '已通过',
    2: '已拒绝'
  }
  return texts[status] || '未知'
}

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

onMounted(() => {
  loadReviews()
  
  // 检查是否从通知中心跳转过来
  const jumpToReviewId = sessionStorage.getItem('jumpToReviewId')
  if (jumpToReviewId) {
    // 清除sessionStorage中的标记
    sessionStorage.removeItem('jumpToReviewId')
    // 可以在这里添加高亮显示或自动展开详情的逻辑
    console.log('从通知中心跳转到审核ID:', jumpToReviewId)
    // TODO: 可以在列表加载完成后，滚动到对应的审核记录并高亮显示
  }
})
</script>

<style scoped>
.course-review-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.review-detail {
  max-height: 60vh;
  overflow-y: auto;
}

.content-section {
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  white-space: pre-wrap;
  line-height: 1.6;
}

.chapters-section {
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  max-height: 300px;
  overflow-y: auto;
}

.chapters-section pre {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.4;
}
</style>
