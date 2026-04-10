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
    subCategoryId: number
    categoryId: number
}

export const getAllCategories = () => {
    return request<CategoryItem[]>({
        url: '/api/categories',
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

export const getCourseRatings = (courseId: number) => {
    return request({
        url: `/api/courses/${courseId}/ratings`,
        method: 'get'
    })
}
