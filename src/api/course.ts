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
    resourceUrl: string
    duration: number
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
    fileName?: string
}

export interface FileUploadItem {
    title: string
    fileName: string
    resourceUrl: string
    fileSize?: number
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
    teacher?: string
    chapters: ChapterUploadItem[]
}

/**
 * 上传课程
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
