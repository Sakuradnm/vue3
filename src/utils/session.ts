/**
 * 会话存储管理工具
 * 使用 localStorage + 时间戳实现智能会话管理
 * - 关闭页面标签后重新打开：保留登录状态（24小时内有效）
 * - 关闭浏览器后重新打开：如果超过24小时则需重新登录
 * - 主动退出登录：立即清除所有会话数据
 */

const USER_INFO_KEY = 'userInfo'
const SESSION_TIMESTAMP_KEY = 'sessionTimestamp'
const REMEMBERED_USERNAME_KEY = 'rememberedUsername'
const USER_NOTICES_KEY = 'userNotices'

// 会话有效期：24小时（单位：毫秒）
const SESSION_EXPIRY_TIME = 24 * 60 * 60 * 1000

/**
 * 获取用户信息
 * 会检查会话是否过期，如果过期则自动清除
 */
export function getUserInfo() {
  try {
    const stored = localStorage.getItem(USER_INFO_KEY)
    const timestamp = localStorage.getItem(SESSION_TIMESTAMP_KEY)
    
    if (!stored || !timestamp) {
      return null
    }
    
    // 检查会话是否过期
    const now = Date.now()
    const sessionTime = parseInt(timestamp, 10)
    
    if (now - sessionTime > SESSION_EXPIRY_TIME) {
      // 会话已过期，清除数据
      console.log('会话已过期，自动清除')
      clearUserInfo()
      return null
    }
    
    // 更新最后活动时间
    updateSessionTimestamp()
    
    return JSON.parse(stored)
  } catch (error) {
    console.error('获取用户信息失败:', error)
    clearUserInfo()
    return null
  }
}

/**
 * 设置用户信息
 * 同时记录会话时间戳
 */
export function setUserInfo(userInfo: any) {
  try {
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo))
    updateSessionTimestamp()
  } catch (error) {
    console.error('保存用户信息失败:', error)
  }
}

/**
 * 更新会话时间戳
 */
function updateSessionTimestamp() {
  localStorage.setItem(SESSION_TIMESTAMP_KEY, Date.now().toString())
}

/**
 * 清除用户信息
 */
export function clearUserInfo() {
  localStorage.removeItem(USER_INFO_KEY)
  localStorage.removeItem(SESSION_TIMESTAMP_KEY)
}

/**
 * 检查是否已登录
 */
export function isLoggedIn(): boolean {
  return getUserInfo() !== null
}

/**
 * 检查是否为管理员
 */
export function isAdmin(): boolean {
  const userInfo = getUserInfo()
  return userInfo?.level === 'admin'
}

/**
 * 检查是否为教师
 */
export function isTeacher(): boolean {
  const userInfo = getUserInfo()
  return userInfo?.level === 'teacher'
}

/**
 * 获取记住的用户名（这个可以持久化，方便下次输入）
 */
export function getRememberedUsername(): string | null {
  return localStorage.getItem(REMEMBERED_USERNAME_KEY)
}

/**
 * 设置记住的用户名
 */
export function setRememberedUsername(username: string) {
  localStorage.setItem(REMEMBERED_USERNAME_KEY, username)
}

/**
 * 清除记住的用户名
 */
export function clearRememberedUsername() {
  localStorage.removeItem(REMEMBERED_USERNAME_KEY)
}

/**
 * 获取用户通知
 */
export function getUserNotices(): any[] {
  try {
    const stored = localStorage.getItem(USER_NOTICES_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
    return []
  } catch (error) {
    console.error('获取用户通知失败:', error)
    return []
  }
}

/**
 * 设置用户通知
 */
export function setUserNotices(notices: any[]) {
  try {
    localStorage.setItem(USER_NOTICES_KEY, JSON.stringify(notices))
  } catch (error) {
    console.error('保存用户通知失败:', error)
  }
}

/**
 * 完全清除会话数据（退出登录时调用）
 */
export function clearSession() {
  clearUserInfo()
  localStorage.removeItem(USER_NOTICES_KEY)
  // 注意：不清除 rememberedUsername，因为它是持久化的
}
