import request from '@/utils/request'

export interface StatisticsOverview {
    id: number
    totalCourses: number
    totalUsers: number
    totalPosts: number
    totalSubCategories: number
    totalCategories: number
    updatedAt: string
    createdAt: string
}

/**
 * 获取统计数据
 */
export const getStatistics = () => {
    return request<StatisticsOverview>({
        url: '/api/statistics',
        method: 'get'
    })
}

/**
 * 更新所有统计数据
 */
export const updateAllStatistics = () => {
    return request<StatisticsOverview>({
        url: '/api/statistics/update-all',
        method: 'post'
    })
}

/**
 * 更新课程总数
 */
export const updateCourseCount = () => {
    return request({
        url: '/api/statistics/update/courses',
        method: 'post'
    })
}

/**
 * 更新用户总数
 */
export const updateUserCount = () => {
    return request({
        url: '/api/statistics/update/users',
        method: 'post'
    })
}

/**
 * 更新发帖总数
 */
export const updatePostCount = () => {
    return request({
        url: '/api/statistics/update/posts',
        method: 'post'
    })
}

/**
 * 更新专题总数
 */
export const updateSubCategoryCount = () => {
    return request({
        url: '/api/statistics/update/sub-categories',
        method: 'post'
    })
}

/**
 * 更新一级分类总数
 */
export const updateCategoryCount = () => {
    return request({
        url: '/api/statistics/update/categories',
        method: 'post'
    })
}
