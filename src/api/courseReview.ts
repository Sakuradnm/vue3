import request from '@/utils/request'

export interface CourseReviewItem {
    id: number
    title: string
    level: string
    description: string
    instructor: string
    subCategoryId: number
    categoryId: number
    introduction?: string
    learningObjectives?: string
    mainContent?: string
    targetAudience?: string
    teachingFeatures?: string
    chaptersData: string
    status: number  // 0-待审核，1-已通过，2-已拒绝
    reviewComment?: string
    reviewerId?: number
    reviewedAt?: string
    submittedAt: string
}

// 提交课程审核
export const submitCourseReview = (data: any) => {
    return request({
        url: '/api/course-review/submit',
        method: 'post',
        data
    })
}

// 获取待审核列表
export const getPendingReviews = () => {
    return request({
        url: '/api/course-review/pending',
        method: 'get'
    })
}

// 获取所有审核记录
export const getAllReviews = () => {
    return request({
        url: '/api/course-review/all',
        method: 'get'
    })
}

// 审核通过
export const approveReview = (id: number, reviewerId: number) => {
    return request({
        url: `/api/course-review/${id}/approve`,
        method: 'post',
        data: { reviewerId }
    })
}

// 审核拒绝
export const rejectReview = (id: number, reviewerId: number, comment: string) => {
    return request({
        url: `/api/course-review/${id}/reject`,
        method: 'post',
        data: { reviewerId, comment }
    })
}

// 检查课程名称是否重复
export const checkDuplicateCourse = (title: string, subCategoryId: number, instructor: string) => {
    return request({
        url: '/api/course-review/check-duplicate',
        method: 'post',
        data: { title, subCategoryId, instructor }
    })
}
