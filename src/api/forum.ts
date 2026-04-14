import request from '@/utils/request'

export interface ForumCategory {
    id: number
    categoryId: string
    label: string
    color: string
    sortOrder: number
}

export const getForumCategories = () => {
    return request<ForumCategory[]>({
        url: '/api/forum-categories',
        method: 'get'
    })
}

export const createForumCategory = (categoryData: Omit<ForumCategory, 'id' | 'sortOrder'>) => {
    return request<ForumCategory>({
        url: '/api/forum-categories',
        method: 'post',
        data: categoryData
    })
}

export const deleteForumCategory = (id: number) => {
    return request({
        url: `/api/forum-categories/${id}`,
        method: 'delete'
    })
}

export interface ForumPostItem {
    id: number
    category: string
    categoryLabel: string
    title: string
    subtitle?: string
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
    userId: number  // 帖子所有者ID
    category: string
    categoryLabel: string
    title: string
    subtitle?: string
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
        url: '/api/posts',
        method: 'get',
        params
    })
}

export const getForumPostDetail = (id: number) => {
    return request<ForumPostDetailItem>({
        url: `/api/posts/${id}`,
        method: 'get'
    })
}

export const likePost = (id: number, userId: number, action?: string) => {
    return request<{ liked: boolean }>({
        url: `/api/posts/${id}/like`,
        method: 'post',
        data: { userId, action }
    })
}

export const getPostLikeStatus = (postId: number, userId: number) => {
    return request<{ liked: boolean }>({
        url: `/api/posts/${postId}/like-status`,
        method: 'get',
        params: { userId }
    })
}

export const commentPost = (id: number) => {
    return request({
        url: `/api/posts/${id}/comment`,
        method: 'post'
    })
}

export interface CreatePostData {
    userId: number
    category: string
    categoryLabel: string
    title: string
    subtitle?: string
    preview: string
    content: string
    tags?: string[]
}

export const createPost = (postData: CreatePostData) => {
    return request<ForumPostItem>({
        url: '/api/posts',
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
        url: `/api/posts/${postId}/comments`,
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
        url: '/api/comments',
        method: 'post',
        data: commentData
    })
}

export const likeComment = (id: number, userId: number, action?: string) => {
    return request<{ liked: boolean }>({
        url: `/api/comments/${id}/like`,
        method: 'post',
        data: { userId, action }
    })
}

export const getCommentLikeStatus = (commentId: number, userId: number) => {
    return request<{ liked: boolean }>({
        url: `/api/comments/${commentId}/like-status`,
        method: 'get',
        params: { userId }
    })
}

export const deleteComment = (id: number, currentUserId: number, postOwnerId: number) => {
    return request({
        url: `/api/comments/${id}`,
        method: 'delete',
        data: { currentUserId, postOwnerId }
    })
}
