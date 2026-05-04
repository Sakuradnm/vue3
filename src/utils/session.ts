/**
 * 会话存储管理工具
 * 使用 localStorage + 会话标识实现智能会话管理
 * - 关闭页面标签后重新打开：保留登录状态（同一浏览器会话内）
 * - 关闭浏览器后重新打开：自动清除所有会话数据，需要重新登录
 * - 主动退出登录：立即清除所有会话数据
 */

const USER_INFO_KEY = 'userInfo'
const SESSION_ID_KEY = 'sessionId'
const REMEMBERED_USERNAME_KEY = 'rememberedUsername'
const USER_NOTICES_KEY = 'userNotices'

// 生成唯一会话ID
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// 获取或创建会话ID
function getOrCreateSessionId(): string {
  let sessionId = sessionStorage.getItem(SESSION_ID_KEY)
  if (!sessionId) {
    // 如果是新标签页，检查是否有活跃的浏览器会话
    const activeSessionId = localStorage.getItem('activeSessionId')
    const sessionTimestamp = localStorage.getItem('sessionTimestamp')
    
    // 如果存在活跃会话且时间在5分钟内，认为是同一浏览器会话
    if (activeSessionId && sessionTimestamp) {
      const now = Date.now()
      const timestamp = parseInt(sessionTimestamp, 10)
      if (now - timestamp < 5 * 60 * 1000) { // 5分钟窗口期
        sessionId = activeSessionId
      }
    }
    
    // 如果没有有效会话，创建新的
    if (!sessionId) {
      sessionId = generateSessionId()
    }
    
    // 保存到 sessionStorage（当前标签页）和 localStorage（浏览器会话）
    sessionStorage.setItem(SESSION_ID_KEY, sessionId)
    localStorage.setItem('activeSessionId', sessionId)
    localStorage.setItem('sessionTimestamp', Date.now().toString())
  }
  return sessionId
}

/**
 * 获取用户信息
 * 从 localStorage 中读取用户信息，并验证会话有效性
 */
export function getUserInfo() {
  try {
    const stored = localStorage.getItem(USER_INFO_KEY)
    const sessionId = localStorage.getItem('activeSessionId')
    const sessionTimestamp = localStorage.getItem('sessionTimestamp')
    
    if (!stored || !sessionId || !sessionTimestamp) {
      return null
    }
    
    // 检查会话是否过期（超过2小时无活动视为浏览器已关闭）
    const now = Date.now()
    const timestamp = parseInt(sessionTimestamp, 10)
    const SESSION_TIMEOUT = 2 * 60 * 60 * 1000 // 2小时
    
    if (now - timestamp > SESSION_TIMEOUT) {
      // 会话已过期，清除数据
      console.log('浏览器会话已过期，自动清除')
      clearUserInfo()
      return null
    }
    
    // 更新会话时间戳
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
 * 保存到 localStorage，并初始化会话
 */
export function setUserInfo(userInfo: any) {
  try {
    // 初始化或获取会话ID
    getOrCreateSessionId()
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
  localStorage.setItem('sessionTimestamp', Date.now().toString())
}

/**
 * 清除用户信息
 */
export function clearUserInfo() {
  localStorage.removeItem(USER_INFO_KEY)
  localStorage.removeItem('activeSessionId')
  localStorage.removeItem('sessionTimestamp')
  sessionStorage.removeItem(SESSION_ID_KEY)
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
