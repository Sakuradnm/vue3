import request from '@/utils/request'

export interface CategoryItem {
    id: number
    name: string
    description: string
    sortOrder: number
}

export interface SubCategoryItem {
    id: number
    name: string
    description: string
    sortOrder: number
    categoryId: number
}

export interface CourseItem {
    id: number
    name: string
    description: string
    sortOrder: number
    subCategoryId: number
}

export interface SubCategoryWithCourses {
    id: number
    name: string
    description: string
    sortOrder: number
    categoryId: number
    courses: CourseItem[]
}

export interface CourseTreeItem {
    id: number
    name: string
    description: string
    sortOrder: number
    subCategories: SubCategoryWithCourses[]
}

export interface CourseDetailItem {
    id: number
    courseId: number
    courseName: string
    overview: string
    comment: string
    rating: number
    syllabus: string
    courseware: string
    teacher: string
    learnedDuration: number
    totalDuration: number
    courseDescription: string
    detailIntro: string
    subCategoryId: number
    categoryId: number
}

export const getAllCategories = () => {
    return request<CategoryItem[]>({
        url: '/api/categories',
        method: 'get'
    })
}

/**
 * 获取完整的课程树结构（一次性返回所有分类、子分类和课程）
 */
export const getFullCourseTree = () => {
    return request<CourseTreeItem[]>({
        url: '/api/categories/tree',
        method: 'get'
    })
}

export const getSubCategoriesByCategoryId = (categoryId: number) => {
    return request<SubCategoryItem[]>({
        url: `/api/sub-categories/category/${categoryId}`,
        method: 'get'
    })
}

export const getCoursesBySubCategoryId = (subCategoryId: number) => {
    return request<CourseItem[]>({
        url: `/api/courses/sub-category/${subCategoryId}`,
        method: 'get'
    })
}

export const getCourseDetail = (courseId: number) => {
    return request<CourseDetailItem>({
        url: `/api/courses/${courseId}`,
        method: 'get'
    })
}

export const getCourseRatings = (courseId: number, userId?: number) => {
    return request({
        url: `/api/courses/${courseId}/ratings`,
        method: 'get',
        params: userId ? { userId } : {}
    })
}

/**
 * 发布课程评分/评论
 */
export interface AddRatingRequest {
    userId: number
    rating: number
    comment: string
}

export const addCourseRating = (courseId: number, data: AddRatingRequest) => {
    return request({
        url: `/api/courses/${courseId}/ratings`,
        method: 'post',
        data
    })
}

/**
 * 点赞评论
 */
export interface LikeRatingRequest {
    userId: number
}

export const likeRating = (ratingId: number, data: LikeRatingRequest) => {
    return request({
        url: `/api/courses/ratings/${ratingId}/like`,
        method: 'post',
        data
    })
}

/**
 * 删除评论
 */
export const deleteCourseRating = (ratingId: number, currentUserId: number) => {
    return request({
        url: `/api/courses/ratings/${ratingId}`,
        method: 'delete',
        params: { currentUserId }
    })
}

export interface OutlineItem {
    id: number
    courseId: number
    parentId: number
    title: string
    sortOrder: number
    sections: SectionItem[]
}

export interface SectionItem {
    id: number
    chapterId: number
    title: string
    sortOrder: number
    resources: ResourceItem[]
}

export interface ResourceItem {
    id: number
    resourceType: string
    title: string
    // fileName字段已从数据库中删除
    resourceUrl: string
    duration: number
    // fileSize字段已从数据库中删除
    sortOrder: number
}

export const getCourseOutline = (courseId: number) => {
    return request<OutlineItem[]>({
        url: `/api/courses/${courseId}/outline`,
        method: 'get'
    })
}

// 课程上传相关接口

export interface VideoUploadItem {
    title: string
    duration: string
    resourceUrl: string
    // fileName字段已从数据库中删除
}

export interface FileUploadItem {
    title: string
    // fileName字段已从数据库中删除
    resourceUrl: string
    // fileSize字段已从数据库中删除
}

export interface ChapterUploadItem {
    title: string
    videos: VideoUploadItem[]
    files: FileUploadItem[]
}

export interface CourseUploadData {
    title: string
    level: string
    description: string
    subCategoryId: number
    categoryId: number
    detailIntro?: string
    introduction?: string
    learningObjectives?: string
    mainContent?: string
    targetAudience?: string
    teachingFeatures?: string
    teacher?: string
    chapters: ChapterUploadItem[]
}

/**
 * 上传课程（提交审核，等待管理员审批）
 */
export const uploadCourse = (data: CourseUploadData) => {
    return request<{ code: number; message: string; data: number }>({
        url: '/api/courses/upload',
        method: 'post',
        data
    })
}

/**
 * 获取所有子分类（用于上传页面选择分类）
 */
export const getAllSubCategories = () => {
    return request<SubCategoryItem[]>({
        url: '/api/sub-categories',
        method: 'get'
    })
}

/**
 * 上传文件（视频或文档）
 */
export interface UploadFileResponse {
    url: string
    fileName: string
    fileSize: number
    contentType: string
}

export const uploadFile = (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    
    return request<UploadFileResponse>({
        url: '/api/upload/file',
        method: 'post',
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

/**
 * 用户报名学习课程（立即学习）
 */
export interface EnrollCourseRequest {
    userId: number
}

export interface EnrollCourseResponse {
    alreadyEnrolled: boolean
    message: string
}

export const enrollCourse = (courseId: number, data: EnrollCourseRequest) => {
    return request<EnrollCourseResponse>({
        url: `/api/courses/${courseId}/enroll`,
        method: 'post',
        data
    })
}

/**
 * 检查用户是否已学习某门课程
 */
export interface CheckEnrollmentResponse {
    isEnrolled: boolean
}

export const checkEnrollment = (courseId: number, userId: number) => {
    return request<CheckEnrollmentResponse>({
        url: `/api/courses/${courseId}/check-enrollment`,
        method: 'get',
        params: { userId }
    })
}

/**
 * 获取课程的学习人数
 */
export interface StudentsCountResponse {
    studentsCount: number
}

export const getStudentsCount = (courseId: number) => {
    return request<StudentsCountResponse>({
        url: `/api/courses/${courseId}/students-count`,
        method: 'get'
    })
}

/**
 * 批量获取多个课程的学习人数
 */
export const getBatchStudentsCount = (courseIds: number[]) => {
    return request<Record<number, number>>({
        url: '/api/courses/batch-students-count',
        method: 'post',
        data: courseIds
    })
}

/**
 * 获取用户的学习记录列表
 */
export interface UserStudyRecord {
    id: number
    courseId: number
    courseName: string
    enrolledAt: string
    lastLearnedAt: string
    progressPercent: number
}

export const getUserStudyRecords = (userId: number) => {
    return request<UserStudyRecord[]>({
        url: '/api/courses/user-study-records',
        method: 'get',
        params: { userId }
    })
}
