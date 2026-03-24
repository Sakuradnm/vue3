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
