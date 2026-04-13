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
    author: string
    avatar: string | null
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

export interface ForumCommentItem {
    id: number
    postId: number
    userId: number
    username: string
    avatar: string | null
    parentId: number
    content: string
    likes: number
    createdAt: string
    children: ForumCommentItem[]
}

export const getComments = (postId: number) => {
    return request<ForumCommentItem[]>({
        url: `/api/forum/posts/${postId}/comments`,
        method: 'get'
    })
}

export interface CreateCommentData {
    postId: number
    userId: number
    parentId?: number
    content: string
}

export const createComment = (commentData: CreateCommentData) => {
    return request<ForumCommentItem>({
        url: '/api/forum/comments',
        method: 'post',
        data: commentData
    })
}

export const likeComment = (id: number) => {
    return request({
        url: `/api/forum/comments/${id}/like`,
        method: 'post'
    })
}
