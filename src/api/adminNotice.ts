import request from '@/utils/request'

export interface AdminNoticeItem {
    id: number
    noticeType: string  // course_review/user_register/teacher_apply
    title: string
    content: string
    relatedId: number
    isRead: number  // 0-未读, 1-已读
    priority: number  // 0-普通, 1-重要, 2-紧急
    createdAt: string
    readAt?: string
}

export interface NoticeStats {
    totalUnread: number
    courseReviewUnread: number
    userRegisterUnread: number
    teacherApplyUnread: number
}

// 获取未读通知列表
export const getUnreadNotices = () => {
    return request({
        url: '/api/admin-notice/unread',
        method: 'get'
    })
}

// 获取所有通知列表
export const getAllNotices = () => {
    return request({
        url: '/api/admin-notice/all',
        method: 'get'
    })
}

// 获取通知统计
export const getNoticeStats = () => {
    return request({
        url: '/api/admin-notice/stats',
        method: 'get'
    })
}

// 标记通知为已读
export const markNoticeAsRead = (id: number) => {
    return request({
        url: `/api/admin-notice/${id}/read`,
        method: 'post'
    })
}

// 批量标记所有通知为已读
export const markAllNoticesAsRead = () => {
    return request({
        url: '/api/admin-notice/read-all',
        method: 'post'
    })
}

// 删除通知
export const deleteNotice = (id: number) => {
    return request({
        url: `/api/admin-notice/${id}`,
        method: 'delete'
    })
}

// 清除所有已读通知
export const clearReadNotices = () => {
    return request({
        url: '/api/admin-notice/clear-read',
        method: 'delete'
    })
}

// 拒绝通知并发送消息给用户
export const rejectNotice = (id: number, data: { comment: string; adminId: number }) => {
    return request({
        url: `/api/admin-notice/${id}/reject`,
        method: 'post',
        data
    })
}
