<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const isEditing = ref(false)
const userInfo = ref<any>(null)

// 表单数据
const formData = reactive({
  username: '',
  email: '',
  phone: '',
  avatar: '',
  bio: '',
  level: ''
})

// 密码修改相关
const showPasswordModal = ref(false)
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

onMounted(() => {
  loadUserInfo()
})

const loadUserInfo = () => {
  const storedUserInfo = localStorage.getItem('userInfo')
  if (storedUserInfo) {
    userInfo.value = JSON.parse(storedUserInfo)
    Object.assign(formData, {
      username: userInfo.value.username || '',
      email: userInfo.value.email || '',
      phone: userInfo.value.phone || '',
      avatar: userInfo.value.avatar || '',
      bio: userInfo.value.bio || '',
      level: userInfo.value.level || ''
    })
  } else {
    ElMessage.error('请先登录')
    router.push('/Users')
  }
}

const handleEdit = () => {
  isEditing.value = true
}

const handleCancel = () => {
  isEditing.value = false
  loadUserInfo()
}

const handleAvatarError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.style.display = 'none'
}

const validateForm = () => {
  if (!formData.username || formData.username.length < 3) {
    ElMessage.warning('用户名至少 3 个字符')
    return false
  }

  if (formData.phone && !/^1[3-9]\d{9}$/.test(formData.phone)) {
    ElMessage.warning('手机号格式不正确')
    return false
  }

  if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    ElMessage.warning('邮箱格式不正确')
    return false
  }

  return true
}

const handleSave = () => {
  if (!validateForm()) return

  // 更新用户信息
  const updatedUserInfo = {
    ...userInfo.value,
    username: formData.username,
    email: formData.email,
    phone: formData.phone,
    avatar: formData.avatar,
    bio: formData.bio
  }

  localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo))
  userInfo.value = updatedUserInfo

  ElMessage.success('保存成功')
  isEditing.value = false

  // 触发存储事件，通知其他组件
  window.dispatchEvent(new Event('storage'))
}

const handleChangePassword = () => {
  showPasswordModal.value = true
}

const handlePasswordSubmit = () => {
  if (!passwordForm.oldPassword) {
    ElMessage.warning('请输入原密码')
    return
  }

  if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
    ElMessage.warning('新密码至少 6 位')
    return
  }

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    ElMessage.warning('两次输入的密码不一致')
    return
  }

  // TODO: 调用后端修改密码接口
  ElMessage.success('密码修改成功')
  showPasswordModal.value = false
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
}

const goBack = () => {
  router.back()
}

const getLevelText = (level: string) => {
  return level === 'student' ? '学生' : '教师'
}

const getAvatarInitial = (username: string) => {
  return username?.charAt(0).toUpperCase()
}
</script>

<template>
  <div class="personal-center-container">
    <!-- 返回按钮 -->
    <button class="back-btn" @click="goBack">
      <svg-icon name="menu" :width="24" :height="24" style="transform: rotate(90deg);"/>
    </button>

    <div class="profile-header">
      <div class="avatar-section">
        <div class="avatar-wrapper">
          <img
              v-if="formData.avatar"
              :src="formData.avatar"
              :alt="formData.username"
              class="avatar-img"
              @error="handleAvatarError"
          />
          <div v-else class="avatar-placeholder">
            {{ getAvatarInitial(formData.username) }}
          </div>
        </div>
        <div class="avatar-overlay" v-if="isEditing">
          <span class="change-avatar-text">更换头像</span>
        </div>
      </div>

      <div class="user-basic-info">
        <h1 class="username">{{ formData.username }}</h1>
        <div class="user-meta">
          <span class="level-badge">{{ getLevelText(formData.level) }}</span>
          <span class="user-id">ID: {{ userInfo?.id || '10001' }}</span>
        </div>
      </div>
    </div>

    <div class="profile-content">
      <!-- 左侧导航 -->
      <div class="sidebar">
        <div class="menu-items">
          <div class="menu-item active">
            <svg-icon name="user" :width="20" :height="20"/>
            <span>个人资料</span>
          </div>
          <div class="menu-item" @click="handleChangePassword">
            <svg-icon name="home" :width="20" :height="20"/>
            <span>账户安全</span>
          </div>
          <div class="menu-item">
            <svg-icon name="menu" :width="20" :height="20"/>
            <span>学习记录</span>
          </div>
        </div>
      </div>

      <!-- 右侧内容区 -->
      <div class="content-area">
        <div class="section-header">
          <h2>基本信息</h2>
          <div class="action-buttons" v-if="!isEditing">
            <button class="edit-btn" @click="handleEdit">
              <svg-icon name="menu" :width="18" :height="18"/>
              <span>编辑资料</span>
            </button>
          </div>
          <div class="action-buttons" v-else>
            <button class="cancel-btn" @click="handleCancel">取消</button>
            <button class="save-btn" @click="handleSave">保存</button>
          </div>
        </div>

        <div class="form-container">
          <div class="form-group">
            <label class="form-label">用户名</label>
            <input
                type="text"
                v-model="formData.username"
                :disabled="!isEditing"
                class="form-input"
                placeholder="请输入用户名"
            />
          </div>

          <div class="form-group">
            <label class="form-label">邮箱</label>
            <input
                type="email"
                v-model="formData.email"
                :disabled="!isEditing"
                class="form-input"
                placeholder="请输入邮箱"
            />
          </div>

          <div class="form-group">
            <label class="form-label">手机号</label>
            <input
                type="tel"
                v-model="formData.phone"
                :disabled="!isEditing"
                class="form-input"
                placeholder="请输入手机号"
            />
          </div>

          <div class="form-group">
            <label class="form-label">个人简介</label>
            <textarea
                v-model="formData.bio"
                :disabled="!isEditing"
                class="form-textarea"
                rows="4"
                placeholder="介绍一下自己吧..."
            ></textarea>
          </div>
        </div>
      </div>
    </div>

    <!-- 修改密码弹窗 -->
    <div v-if="showPasswordModal" class="modal">
      <div class="modal-overlay" @click="showPasswordModal = false"></div>
      <div class="modal-container">
        <div class="modal-header">
          <h3>修改密码</h3>
          <button class="modal-close" @click="showPasswordModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="password-form">
            <div class="form-group">
              <label class="form-label">原密码</label>
              <input
                  type="password"
                  v-model="passwordForm.oldPassword"
                  class="form-input"
                  placeholder="请输入原密码"
              />
            </div>
            <div class="form-group">
              <label class="form-label">新密码</label>
              <input
                  type="password"
                  v-model="passwordForm.newPassword"
                  class="form-input"
                  placeholder="请输入新密码"
              />
            </div>
            <div class="form-group">
              <label class="form-label">确认新密码</label>
              <input
                  type="password"
                  v-model="passwordForm.confirmPassword"
                  class="form-input"
                  placeholder="请再次输入新密码"
              />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showPasswordModal = false">取消</button>
          <button class="save-btn" @click="handlePasswordSubmit">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.personal-center-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0c1f2e 0%, #061016 100%);
  padding: 40px 20px;
  position: relative;
}

.back-btn {
  position: absolute;
  top: 30px;
  left: 30px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 10;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(-5px);
}

.profile-header {
  max-width: 900px;
  margin: 0 auto 40px;
  display: flex;
  align-items: center;
  gap: 30px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.avatar-section {
  position: relative;
  width: 120px;
  height: 120px;
  flex-shrink: 0;
}

.avatar-wrapper {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.1);
  border: 3px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 48px;
  font-weight: 600;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  cursor: pointer;
}

.avatar-section:hover .avatar-overlay {
  opacity: 1;
}

.change-avatar-text {
  color: #fff;
  font-size: 14px;
}

.user-basic-info {
  flex: 1;
}

.username {
  color: #fff;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 15px 0;
}

.user-meta {
  display: flex;
  gap: 15px;
  align-items: center;
}

.level-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.user-id {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
}

.profile-content {
  max-width: 900px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 30px;
}

.sidebar {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  height: fit-content;
}

.menu-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.menu-item.active {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

.content-area {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 30px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.section-header h2 {
  color: #fff;
  font-size: 1.5rem;
  margin: 0;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.edit-btn,
.cancel-btn,
.save-btn {
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

.edit-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.edit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.save-btn {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a085 100%);
  color: #fff;
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(78, 205, 196, 0.4);
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-input,
.form-textarea {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 12px 16px;
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.3);
}

.form-input:disabled,
.form-textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-textarea {
  resize: vertical;
  font-family: inherit;
}

/* 弹窗样式 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
}

.modal-container {
  position: relative;
  background: #1a2634;
  border-radius: 12px;
  width: 90%;
  max-width: 450px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  color: #fff;
  font-size: 1.3rem;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 28px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.modal-close:hover {
  color: #fff;
}

.modal-body {
  padding: 24px;
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
  }

  .user-meta {
    justify-content: center;
  }

  .profile-content {
    grid-template-columns: 1fr;
  }

  .sidebar {
    order: 2;
  }

  .content-area {
    order: 1;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .action-buttons {
    width: 100%;
  }

  .edit-btn,
  .cancel-btn,
  .save-btn {
    flex: 1;
    justify-content: center;
  }
}
</style>
