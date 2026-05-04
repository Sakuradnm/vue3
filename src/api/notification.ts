import request from '@/utils/request'

export interface UserNotification {
    id: number
    userId: number
    senderId?: number
    senderName?: string
    notificationType: string  // comment_reply, like_comment, admin_reply, lecturer_application
    title: string
    content: string
    relatedType?: string  // forum_post, forum_comment, lecturer_application
    relatedId?: number
    isRead: boolean
    status?: number  // 0-待处理, 1-已通过, 2-已拒绝
    adminComment?: string
    createdAt: string
    readAt?: string
}

// 获取用户的通知列表
export const getUserNotifications = (userId: number) => {
    return request<UserNotification[]>({
        url: `/api/notifications/user/${userId}`,
        method: 'get'
    })
}

// 获取未读通知数量
export const getUnreadCount = (userId: number) => {
    return request<number>({
        url: `/api/notifications/user/${userId}/unread-count`,
        method: 'get'
    })
}

// 标记通知为已读
export const markAsRead = (notificationId: number, userId: number) => {
    return request({
        url: `/api/notifications/${notificationId}/read`,
        method: 'post',
        params: { userId }
    })
}

// 标记所有通知为已读
export const markAllAsRead = (userId: number) => {
    return request({
        url: `/api/notifications/user/${userId}/read-all`,
        method: 'post'
    })
}

// 删除通知
export const deleteNotification = (notificationId: number, userId: number) => {
    return request({
        url: `/api/notifications/${notificationId}`,
        method: 'delete',
        params: { userId }
    })
}

// 申请成为讲师
export const applyLecturer = (userId: number, reason: string) => {
    return request({
        url: '/api/notifications/apply-lecturer',
        method: 'post',
        data: { userId, reason }
    })
}

// 获取待处理的讲师申请（管理员用）
export const getPendingLecturerApplications = () => {
    return request<any[]>({
        url: '/api/notifications/admin/lecturer-applications/pending',
        method: 'get'
    })
}

// 通过讲师申请
export const approveLecturerApplication = (applicationId: number, adminId: number) => {
    return request({
        url: `/api/notifications/admin/lecturer-applications/${applicationId}/approve`,
        method: 'post',
        params: { adminId }
    })
}

// 拒绝讲师申请
export const rejectLecturerApplication = (applicationId: number, adminId: number, comment: string) => {
    return request({
        url: `/api/notifications/admin/lecturer-applications/${applicationId}/reject`,
        method: 'post',
        data: { adminId, comment }
    })
}
