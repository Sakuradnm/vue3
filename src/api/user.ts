import request from '@/utils/request'

// 获取所有用户
export const getAllUsers = () => {
    return request({
        url: '/api/users',
        method: 'get'
    })
}

// 根据 ID 获取用户
export const getUserById = (id: number) => {
    return request({
        url: `/api/users/${id}`,
        method: 'get'
    })
}

// 创建用户（注册）
export const createUser = (userData: any) => {
    return request({
        url: '/api/users',
        method: 'post',
        data: userData
    })
}

// 用户注册（专用，与 createUser 区分）
export const registerUser = (userData) => {
    return request({
        url: '/api/users/register',
        method: 'post',
        data: userData
    })
}

// 更新用户
export const updateUser = (id: number, userData: any) => {
    return request({
        url: `/api/users/${id}`,
        method: 'put',
        data: userData
    })
}

// 删除用户
export const deleteUser = (id: number) => {
    return request({
        url: `/api/users/${id}`,
        method: 'delete'
    })
}

// 用户登录
export const login = (username: string, password: string) => {
    return request({
        url: '/api/users/login',
        method: 'post',
        data: { username, password }
    })
}

// 根据级别查询用户
export const getUsersByLevel = (level: string) => {
    return request({
        url: `/api/users/level/${level}`,
        method: 'get'
    })
}

// 上传头像
export const uploadAvatar = (userId: number, avatarUrl: string) => {
    return request({
        url: `/api/users/${userId}/avatar`,
        method: 'post',
        data: { avatarUrl }
    })
}

// 获取当前用户详细信息
export const getCurrentUser = (userId: number) => {
    return request({
        url: `/api/users/${userId}`,
        method: 'get'
    })
}
