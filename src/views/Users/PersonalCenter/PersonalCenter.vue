<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AvatarUploader from '@/components/userUrl/index.vue'
import { updateUser, getUserById } from '@/api/user'
import request from '@/utils/request'
import { getUserInfo, setUserInfo } from '@/utils/session'

const router = useRouter()

type Section = 'profile' | 'account' | 'security'
const activeSection = ref<Section>('profile')

const userId = ref<number>(0)
const userInfo = reactive({
  id: '',
  username: '',
  nickname: '',
  gender: 'other',
  birthday: '',
  location: '',
  bio: '',
  avatar: '',
  level: 'student',
  joinDate: '',
  phone: '',
  email: ''
})

const isEditing = ref(false)
const formData = reactive({ ...userInfo })
const tempAvatarUrl = ref('') // 临时存储裁剪后的头像，未保存到数据库

const showPasswordModal = ref(false)
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const avatarInitial = computed(() => (userInfo.nickname || userInfo.username)?.charAt(0).toUpperCase() || 'U')

const levelText = computed(() => {
  const map: Record<string, string> = { student: '学生', teacher: '教师', admin: '管理员' }
  return map[userInfo.level] || '未知'
})

const toast = ref<{ msg: string; type: 'ok' | 'err' } | null>(null)
const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
  toast.value = { msg, type }
  setTimeout(() => (toast.value = null), 2800)
}

onMounted(() => {
  loadUserInfo()
})

const loadUserInfo = async () => {
  const storedUserInfo = getUserInfo()
  if (!storedUserInfo) {
    router.push('/Users')
    return
  }

  const user = storedUserInfo
  userId.value = user.id

  try {
    const res = await getUserById(user.id)
    const userData = res

    Object.assign(userInfo, {
      id: userData.id,
      username: userData.username,
      nickname: userData.nickname || userData.username,
      gender: userData.gender || 'other',
      birthday: userData.birthday || '',
      location: userData.location || '',
      bio: userData.bio || '',
      avatar: userData.avatarUrl || '',
      level: userData.level || 'student',
      joinDate: userData.createdAt ? userData.createdAt.split('T')[0] : '',
      phone: userData.phone || '',
      email: userData.email || ''
    })
    Object.assign(formData, userInfo)
  } catch (error) {
    // 静默处理错误
    showToast('加载用户信息失败', 'err')
  }
}

const saveProfile = async () => {
  try {
    const updateData: any = {
      nickname: formData.nickname,
      gender: formData.gender,
      birthday: formData.birthday || null,
      location: formData.location || null,
      bio: formData.bio || null
    }

    // 如果有临时头像，添加到更新数据中
    if (tempAvatarUrl.value) {
      updateData.avatarUrl = tempAvatarUrl.value
    }

    // 统一发送请求，更新用户信息（包括头像）
    await updateUser(userId.value, updateData)
    
    // 更新本地显示
    if (tempAvatarUrl.value) {
      userInfo.avatar = tempAvatarUrl.value
      tempAvatarUrl.value = '' // 清空临时头像
    }
    Object.assign(userInfo, formData)

    // 更新 localStorage 并触发 storage 事件，让顶部菜单实时更新
    const storedUser = getUserInfo() || {}
    const updatedUser = { ...storedUser, ...updateData }
    setUserInfo(updatedUser)
    
    // 手动触发 storage 事件，通知其他组件（如顶部菜单）更新
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'userInfo',
      newValue: JSON.stringify(updatedUser),
      oldValue: JSON.stringify(storedUser)
    }))

    isEditing.value = false
    showToast('个人资料已保存')
  } catch (error) {
    showToast('保存失败', 'err')
  }
}

const cancelEdit = () => {
  Object.assign(formData, userInfo)
  tempAvatarUrl.value = '' // 清空临时头像
  isEditing.value = false
}

const handleAvatarChange = (url: string) => {
  // 只更新本地数据，不立即上传到数据库
  tempAvatarUrl.value = url
  showToast('头像已选择，请点击“保存更改”完成上传')
}

const changePassword = async () => {
  if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
    showToast('请填写完整密码信息', 'err')
    return
  }

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    showToast('两次输入的新密码不一致', 'err')
    return
  }

  if (passwordForm.newPassword.length < 6) {
    showToast('新密码长度至少为6位', 'err')
    return
  }

  try {
    await request({
      url: `/api/users/${userId.value}/password`,
      method: 'put',
      data: {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      }
    })

    showPasswordModal.value = false
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    showToast('密码修改成功')
  } catch (error: any) {
    showToast(error.response?.data?.message || '密码修改失败', 'err')
  }
}

const cancelPasswordChange = () => {
  showPasswordModal.value = false
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
}

const genders = ['male', 'female', 'other']
const genderLabel: Record<string, string> = { male: '男', female: '女', other: '保密' }
const locationOptions = ['北京市', '上海市', '广州市', '深圳市', '杭州市', '成都市', '武汉市', '南京市']
</script>

<template>
  <div class="pc-root">
    <div class="pc-bg">
      <div class="bg-orb orb1" />
      <div class="bg-orb orb2" />
      <div class="bg-grid" />
    </div>

    <Transition name="toast">
      <div v-if="toast" class="toast" :class="toast.type">
        <span class="toast-icon">{{ toast.type === 'ok' ? '✓' : '✕' }}</span>
        {{ toast.msg }}
      </div>
    </Transition>

    <div class="pc-layout">
      <aside class="sidebar">
        <div class="avatar-block">
          <!-- Sidebar头像仅展示，不支持上传 -->
          <div class="avatar-display-only">
            <img v-if="userInfo.avatar" :src="userInfo.avatar" alt="avatar" class="sidebar-avatar-img" />
            <div v-else class="sidebar-avatar-placeholder">{{ avatarInitial }}</div>
          </div>
          <div class="badge" :class="userInfo.level">{{ levelText }}</div>
        </div>
        <p class="sidebar-name">{{ userInfo.nickname || userInfo.username }}</p>
        <p class="sidebar-id"><span style="color: #6c757d;">用户名:</span> {{ userInfo.username }}</p>
        <div class="sidebar-stats">
          <div class="stat"><span class="stat-val">{{ levelText }}</span><span class="stat-lbl">权限</span></div>
          <div class="stat-div" />
          <div class="stat"><span class="stat-val">{{ userInfo.joinDate?.slice(0,4) || '—' }}</span><span class="stat-lbl">加入年份</span></div>
        </div>

        <nav class="sidebar-nav">
          <button v-for="item in [
            { key:'profile',  icon:'◈', label:'个人资料' },
            { key:'account',  icon:'⬡', label:'账号绑定' },
            { key:'security', icon:'◉', label:'安全设置' },
          ]" :key="item.key"
                  class="nav-btn"
                  :class="{ active: activeSection === item.key }"
                  @click="activeSection = item.key as Section"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            {{ item.label }}
          </button>
        </nav>
      </aside>

      <main class="main-panel">
        <section v-if="activeSection === 'profile'" class="panel">
          <div class="panel-head">
            <div>
              <h2 class="panel-title">个人资料</h2>
              <p class="panel-sub">管理你的公开信息与个人偏好</p>
            </div>
            <div class="head-actions">
              <template v-if="!isEditing">
                <button class="btn-ghost" @click="isEditing = true">编辑资料</button>
              </template>
              <template v-else>
                <button class="btn-ghost" @click="cancelEdit">取消</button>
                <button class="btn-primary" @click="saveProfile">保存更改</button>
              </template>
            </div>
          </div>

          <div class="avatar-edit-row">
            <AvatarUploader
              v-model="formData.avatar"
              :user-id="userId"
              :placeholder="avatarInitial"
              :editable="isEditing"
              @change="handleAvatarChange"
            />
            <div class="avatar-edit-info">
              <p class="ae-title">头像</p>
              <p class="ae-desc" v-if="!isEditing">点击"编辑资料"后可更换头像</p>
              <p class="ae-desc" v-else>支持 JPG、PNG，尺寸不超过 1024×1024px，小于 5MB</p>
            </div>
          </div>

          <div class="fields-grid">
            <div class="field">
              <label>昵称</label>
              <input v-model="formData.nickname" :disabled="!isEditing" placeholder="你的昵称" />
            </div>
            <div class="field">
              <label>性别</label>
              <div v-if="isEditing" class="gender-group">
                <button v-for="g in genders" :key="g"
                        class="gender-btn" :class="{ sel: formData.gender === g }"
                        @click="formData.gender = g">{{ genderLabel[g] }}</button>
              </div>
              <input v-else :value="genderLabel[userInfo.gender]" disabled />
            </div>
            <div class="field">
              <label>生日</label>
              <input type="date" v-model="formData.birthday" :disabled="!isEditing" />
            </div>
            <div class="field">
              <label>所在地</label>
              <select v-if="isEditing" v-model="formData.location">
                <option value="">请选择</option>
                <option v-for="r in locationOptions" :key="r" :value="r">{{ r }}</option>
              </select>
              <input v-else :value="userInfo.location || '未设置'" disabled />
            </div>
            <div class="field full">
              <label>个人简介</label>
              <textarea v-model="formData.bio" :disabled="!isEditing" rows="3" placeholder="介绍一下自己…" maxlength="50" />
            </div>
          </div>
        </section>

        <section v-if="activeSection === 'account'" class="panel">
          <div class="panel-head">
            <div>
              <h2 class="panel-title">账号信息</h2>
              <p class="panel-sub">查看你的手机和邮箱</p>
            </div>
          </div>

          <div class="binding-list">
            <div class="binding-item">
              <div class="bi-left">
                <span class="bi-icon">📱</span>
                <div>
                  <p class="bi-label">手机号</p>
                  <p class="bi-desc">{{ userInfo.phone || '未绑定' }}</p>
                </div>
              </div>
            </div>

            <div class="binding-item">
              <div class="bi-left">
                <span class="bi-icon">✉️</span>
                <div>
                  <p class="bi-label">邮箱</p>
                  <p class="bi-desc">{{ userInfo.email || '未绑定' }}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section v-if="activeSection === 'security'" class="panel">
          <div class="panel-head">
            <div>
              <h2 class="panel-title">安全设置</h2>
              <p class="panel-sub">保护你的账号安全</p>
            </div>
          </div>

          <div class="security-list">
            <div class="security-item">
              <div class="si-icon pw">🔑</div>
              <div class="si-info">
                <p class="si-title">登录密码</p>
                <p class="si-desc">定期修改密码可提高账号安全性</p>
              </div>
              <button class="btn-ghost sm" @click="showPasswordModal = true">修改密码</button>
            </div>
          </div>
        </section>
      </main>
    </div>

    <Transition name="modal-fade">
      <div v-if="showPasswordModal" class="modal-overlay" @click.self="cancelPasswordChange">
        <div class="modal">
          <div class="modal-header">
            <h3>修改密码</h3>
            <button class="modal-close" @click="cancelPasswordChange">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>当前密码</label>
              <input type="password" v-model="passwordForm.oldPassword" placeholder="请输入当前密码" />
            </div>
            <div class="form-group">
              <label>新密码</label>
              <input type="password" v-model="passwordForm.newPassword" placeholder="请输入新密码（至少6位）" />
            </div>
            <div class="form-group">
              <label>确认新密码</label>
              <input type="password" v-model="passwordForm.confirmPassword" placeholder="请再次输入新密码" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-ghost" @click="cancelPasswordChange">取消</button>
            <button class="btn-primary" @click="changePassword">确认修改</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap');

.pc-root {
  min-height: 100vh;
  font-family: 'DM Sans', sans-serif;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 50%, #f0f7ff 100%);
  color: #1a1a1a;
  position: relative;
  overflow: hidden;
}

.pc-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; }

.bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.18;
}
.orb1 {
  width: 600px; height: 600px;
  background: radial-gradient(circle, rgba(0,102,255,0.08), transparent);
  top: -200px; left: -100px;
  animation: drift1 18s ease-in-out infinite alternate;
}
.orb2 {
  width: 500px; height: 500px;
  background: radial-gradient(circle, rgba(139,92,246,0.06), transparent);
  bottom: -150px; right: -100px;
  animation: drift2 22s ease-in-out infinite alternate;
}
@keyframes drift1 { to { transform: translate(60px, 80px); } }
@keyframes drift2 { to { transform: translate(-60px, -50px); } }

.bg-grid {
  position: absolute; inset: 0;
  background-image:
      linear-gradient(rgba(0,102,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,102,255,0.03) 1px, transparent 1px);
  background-size: 48px 48px;
}

.pc-layout {
  position: relative; z-index: 1;
  max-width: 1080px; margin: 0 auto;
  padding: 48px 24px;
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 28px;
  align-items: start;
}

.sidebar {
  background: rgba(255,255,255,0.8);
  border: 1px solid #e9ecef;
  border-radius: 20px;
  padding: 32px 20px;
  text-align: center;
  position: sticky; top: 32px;
  backdrop-filter: blur(20px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.04);
}

.avatar-block { position: relative; display: inline-block; margin-bottom: 16px; }

/* Sidebar头像展示（不可编辑） */
.avatar-display-only {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  border: 2px solid #e9ecef;
  background-color: #f8f9fa;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.sidebar-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.sidebar-avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 72px;
  font-weight: 600;
  background: linear-gradient(135deg, #0066FF, #8B5CF6);
}

.badge {
  position: absolute; bottom: 2px; right: 2px;
  padding: 2px 7px; border-radius: 20px; font-size: 10px;
  font-weight: 700; letter-spacing: .05em;
  font-family: 'Space Mono', monospace;
  background: linear-gradient(135deg, #0066FF, #8B5CF6);
  color: #fff;
}

.sidebar-name { font-size: 1.1rem; font-weight: 600; margin: 0 0 4px; color: #1a1a1a; }
.sidebar-id {
  font-family: 'Space Mono', monospace;
  font-size: 11px; 
  color: #495057;
  margin: 0 0 20px;
}

.sidebar-stats {
  display: flex; align-items: center; justify-content: center;
  gap: 16px; margin-bottom: 28px;
  padding: 14px 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}
.stat { text-align: center; }
.stat-val { display: block; font-family: 'Space Mono', monospace; font-size: 1.1rem; font-weight: 700; color: #0066FF; }
.stat-lbl { font-size: 11px; color: #495057; font-weight: 500; }
.stat-div { width: 1px; height: 28px; background: #dee2e6; }

.sidebar-nav { display: flex; flex-direction: column; gap: 6px; }
.nav-btn {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 16px;
  border-radius: 12px; border: none; cursor: pointer;
  background: transparent;
  color: #495057;
  font-family: 'DM Sans', sans-serif; font-size: .9rem;
  transition: all .25s;
  text-align: left;
}
.nav-btn:hover { background: #f8f9fa; color: #1a1a1a; }
.nav-btn.active { background: rgba(0,102,255,0.08); color: #0066FF; font-weight: 600; }
.nav-icon { font-size: 16px; opacity: .8; }

.main-panel { min-width: 0; }

.panel {
  background: rgba(255,255,255,0.85);
  border: 1px solid #e9ecef;
  border-radius: 20px; padding: 36px;
  backdrop-filter: blur(20px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.04);
}

.panel-head {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e9ecef;
}
.panel-title { font-size: 1.35rem; font-weight: 600; margin: 0 0 4px; color: #1a1a1a; }
.panel-sub   { font-size: .88rem; color: #495057; margin: 0; }
.head-actions { display: flex; gap: 10px; }

.btn-primary {
  padding: 10px 22px; border-radius: 10px; border: none; cursor: pointer;
  background: linear-gradient(135deg, #0066FF, #0080FF);
  color: #fff; font-family: 'DM Sans', sans-serif; font-size: .88rem; font-weight: 500;
  transition: all .25s;
  box-shadow: 0 4px 15px rgba(0,102,255,0.2);
}
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,102,255,0.3); }

.btn-ghost {
  padding: 10px 22px; border-radius: 10px; cursor: pointer;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  color: #495057; font-family: 'DM Sans', sans-serif;
  font-size: .88rem; transition: all .2s;
}
.btn-ghost:hover { background: #e9ecef; color: #1a1a1a; }
.btn-ghost.sm { padding: 7px 14px; font-size: .82rem; }

.avatar-edit-row {
  display: flex; align-items: center; gap: 24px;
  padding: 20px; border-radius: 14px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  margin-bottom: 28px;
}
.ae-title { font-weight: 600; margin: 0 0 4px; color: #1a1a1a; font-size: 0.95rem; }
.ae-desc  { font-size: .82rem; color: #495057; margin: 0; }

.fields-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 20px;
}
.field { display: flex; flex-direction: column; gap: 8px; }
.field.full { grid-column: 1 / -1; }
.field label { font-size: .82rem; color: #495057; letter-spacing: .02em; font-weight: 500; }

input, select, textarea {
  background: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 10px; padding: 11px 14px;
  color: #1a1a1a; font-family: 'DM Sans', sans-serif; font-size: .9rem;
  transition: all .2s; width: 100%; box-sizing: border-box;
}
input::placeholder, textarea::placeholder {
  color: #adb5bd;
}
input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #0066FF;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(0,102,255,0.1);
}
input:disabled, select:disabled, textarea:disabled { 
  opacity: .6; 
  cursor: not-allowed; 
  background: #f8f9fa;
  color: #6c757d;
}
textarea { resize: vertical; }
select option { background: #ffffff; color: #1a1a1a; }

.gender-group { display: flex; gap: 8px; }
.gender-btn {
  flex: 1; padding: 10px; border-radius: 10px;
  border: 1px solid #dee2e6;
  background: #ffffff;
  color: #495057; cursor: pointer;
  font-family: 'DM Sans', sans-serif; font-size: .88rem;
  transition: all .2s;
  font-weight: 500;
}
.gender-btn:hover {
  background: #f8f9fa;
  border-color: #ced4da;
}
.gender-btn.sel {
  border-color: #0066FF;
  background: rgba(0,102,255,0.08);
  color: #0066FF;
  font-weight: 600;
}

.binding-list { display: flex; flex-direction: column; gap: 12px; }

.binding-item {
  display: flex; align-items: center; gap: 16px;
  padding: 18px 16px; border-radius: 12px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
}

.bi-left  { display: flex; align-items: center; gap: 14px; flex: 1; }

.bi-icon {
  width: 42px; height: 42px; border-radius: 10px; flex-shrink: 0;
  background: #ffffff;
  border: 1px solid #e9ecef;
  display: flex; align-items: center; justify-content: center; font-size: 18px;
}
.bi-label { font-weight: 600; font-size: .9rem; margin: 0 0 2px; color: #1a1a1a; }
.bi-desc  { font-size: .8rem; color: #495057; margin: 0; }

.security-list { display: flex; flex-direction: column; gap: 16px; }

.security-item {
  display: flex; align-items: center; gap: 16px;
  padding: 20px; border-radius: 14px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
}
.si-icon {
  width: 44px; height: 44px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; font-size: 20px;
  flex-shrink: 0;
}
.si-icon.pw  { background: rgba(0,102,255,0.1); }

.si-info  { flex: 1; }
.si-title { font-weight: 600; margin: 0 0 4px; color: #1a1a1a; font-size: 0.95rem; }
.si-desc  { font-size: .82rem; color: #495057; margin: 0; }

.modal-overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
}

.modal {
  background: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 16px;
  padding: 0;
  width: 90%; max-width: 420px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
  animation: modalSlide 0.3s ease;
}

@keyframes modalSlide {
  from { opacity: 0; transform: translateY(-20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0; font-size: 1.1rem; font-weight: 600; color: #1a1a1a;
}

.modal-close {
  background: none; border: none; color: #6c757d;
  font-size: 1.2rem; cursor: pointer; padding: 4px;
  transition: all 0.2s;
}

.modal-close:hover { color: #1a1a1a; transform: rotate(90deg); }

.modal-body {
  padding: 24px;
  display: flex; flex-direction: column; gap: 18px;
}

.form-group {
  display: flex; flex-direction: column; gap: 8px;
}

.form-group label {
  font-size: .85rem; color: #495057;
  font-weight: 500;
}

.modal-footer {
  display: flex; justify-content: flex-end; gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e9ecef;
}

.modal-fade-enter-active, .modal-fade-leave-active { transition: all 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

.toast {
  position: fixed; top: 28px; right: 28px; z-index: 200;
  display: flex; align-items: center; gap: 10px;
  padding: 12px 20px; border-radius: 12px;
  font-size: .88rem; font-weight: 500;
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.1);
}
.toast.ok  { background: rgba(6,214,160,0.1); border: 1px solid rgba(6,214,160,0.3); color: #059669; }
.toast.err { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: #dc2626; }
.toast-icon { font-size: 16px; font-weight: 700; }

.toast-enter-active, .toast-leave-active { transition: all .3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(20px); }

@media (max-width: 720px) {
  .pc-layout { grid-template-columns: 1fr; padding: 20px 16px; }
  .sidebar { position: static; }
  .fields-grid { grid-template-columns: 1fr; }
}
</style>