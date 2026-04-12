import request from '@/utils/request'

export interface ForumPostItem {
    id: number
    category: string
    categoryLabel: string
    title: string
    preview: string
    author: string // 用户昵称
    avatar: string // 用户头像URL
    createdAt: string
    views: number
    likes: number
    comments: number
    tags: string[]
    pinned: boolean
    solved: boolean
    hot: boolean
    score: number
    timeAgo: string
}

export interface ForumPostDetailItem {
    id: number
    category: string
    categoryLabel: string
    title: string
    preview: string
    content: string
    author: string // 用户昵称
    avatar: string // 用户头像URL
    createdAt: string
    views: number
    likes: number
    comments: number
    tags: string[]
    pinned: boolean
    solved: boolean
    hot: boolean
    score: number
}

export const getForumPosts = (params?: {
    category?: string
    keyword?: string
    sortBy?: string
}) => {
    return request<ForumPostItem[]>({
        url: '/api/forum/posts',
        method: 'get',
        params
    })
}

export const getForumPostDetail = (id: number) => {
    return request<ForumPostDetailItem>({
        url: `/api/forum/posts/${id}`,
        method: 'get'
    })
}

export const likePost = (id: number) => {
    return request({
        url: `/api/forum/posts/${id}/like`,
        method: 'post'
    })
}

export const commentPost = (id: number) => {
    return request({
        url: `/api/forum/posts/${id}/comment`,
        method: 'post'
    })
}

export interface CreatePostData {
    userId: number
    category: string
    categoryLabel: string
    title: string
    preview: string
    content: string
    tags?: string[]
}

export const createPost = (postData: CreatePostData) => {
    return request<ForumPostItem>({
        url: '/api/forum/posts',
        method: 'post',
        data: postData
    })
}
