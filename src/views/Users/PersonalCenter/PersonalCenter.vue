<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'

// ─── Active Section ───────────────────────────────────────────────
type Section = 'profile' | 'account' | 'security' | 'sessions'
const activeSection = ref<Section>('profile')

// ─── User Data ────────────────────────────────────────────────────
const userInfo = reactive({
  id: 'USR-20480912',
  nickname: '星尘漫游者',
  gender: 'male',
  birthday: '1998-06-15',
  region: '上海市',
  bio: '热爱技术与设计，探索世界的边界。',
  avatar: '',
  level: 'pro',
  joinDate: '2022-03-15',
  points: 4820
})

const isEditing = ref(false)
const formData = reactive({ ...userInfo })

const avatarInitial = computed(() => userInfo.nickname.charAt(0))

// ─── Account Bindings ─────────────────────────────────────────────
const bindings = reactive({
  phone: { value: '138****9201', bound: true },
  email: { value: 'star***@gmail.com', bound: true },
  wechat: { value: '微信已绑定', bound: true },
  qq: { value: '', bound: false },
  github: { value: 'stardust-dev', bound: true }
})

// ─── Security ─────────────────────────────────────────────────────
const twoFactorEnabled = ref(false)
const showPasswordModal = ref(false)
const show2FAModal = ref(false)
const passwordForm = reactive({ old: '', next: '', confirm: '' })

const loginSessions = [
  { device: 'MacBook Pro', os: 'macOS 14', location: '上海', ip: '101.86.xxx.xxx', time: '刚刚', current: true, icon: '💻' },
  { device: 'iPhone 15 Pro', os: 'iOS 17', location: '上海', ip: '101.86.xxx.xxx', time: '2小时前', current: false, icon: '📱' },
  { device: 'Chrome / Windows', os: 'Windows 11', location: '北京', ip: '116.23.xxx.xxx', time: '昨天 14:32', current: false, icon: '🖥️' },
  { device: 'Firefox / Ubuntu', os: 'Ubuntu 22', location: '深圳', ip: '183.14.xxx.xxx', time: '3天前', current: false, icon: '🖥️' }
]

// ─── Notifications ────────────────────────────────────────────────
const toast = ref<{ msg: string; type: 'ok' | 'err' } | null>(null)
const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
  toast.value = { msg, type }
  setTimeout(() => (toast.value = null), 2800)
}

// ─── Handlers ─────────────────────────────────────────────────────
const saveProfile = () => {
  Object.assign(userInfo, formData)
  isEditing.value = false
  showToast('个人资料已保存')
}

const cancelEdit = () => {
  Object.assign(formData, userInfo)
  isEditing.value = false
}

const submitPassword = () => {
  if (!passwordForm.old) return showToast('请输入原密码', 'err')
  if (passwordForm.next.length < 8) return showToast('新密码至少8位', 'err')
  if (passwordForm.next !== passwordForm.confirm) return showToast('两次密码不一致', 'err')
  showPasswordModal.value = false
  Object.assign(passwordForm, { old: '', next: '', confirm: '' })
  showToast('密码已修改成功')
}

const toggleBinding = (key: keyof typeof bindings) => {
  bindings[key].bound = !bindings[key].bound
  showToast(bindings[key].bound ? `${key} 绑定成功` : `${key} 已解绑`)
}

const toggle2FA = () => {
  if (!twoFactorEnabled.value) {
    show2FAModal.value = true
  } else {
    twoFactorEnabled.value = false
    showToast('两步验证已关闭')
  }
}

const confirm2FA = () => {
  twoFactorEnabled.value = true
  show2FAModal.value = false
  showToast('两步验证已开启')
}

const revokeSession = (idx: number) => {
  showToast(`已撤销该设备登录权限`)
}

const genders = ['male', 'female', 'other']
const genderLabel: Record<string, string> = { male: '男', female: '女', other: '保密' }
const regionOptions = ['北京市', '上海市', '广州市', '深圳市', '杭州市', '成都市', '武汉市', '南京市']
</script>

<template>
  <div class="pc-root">
    <!-- ░░ Background ░░ -->
    <div class="pc-bg">
      <div class="bg-orb orb1" />
      <div class="bg-orb orb2" />
      <div class="bg-grid" />
    </div>

    <!-- ░░ Toast ░░ -->
    <Transition name="toast">
      <div v-if="toast" class="toast" :class="toast.type">
        <span class="toast-icon">{{ toast.type === 'ok' ? '✓' : '✕' }}</span>
        {{ toast.msg }}
      </div>
    </Transition>

    <!-- ░░ Layout ░░ -->
    <div class="pc-layout">

      <!-- ── Sidebar ── -->
      <aside class="sidebar">
        <div class="avatar-block">
          <div class="avatar-ring">
            <div class="avatar">{{ avatarInitial }}</div>
          </div>
          <div class="badge" :class="userInfo.level">{{ userInfo.level === 'pro' ? 'PRO' : 'FREE' }}</div>
        </div>
        <p class="sidebar-name">{{ userInfo.nickname }}</p>
        <p class="sidebar-id">{{ userInfo.id }}</p>
        <div class="sidebar-stats">
          <div class="stat"><span class="stat-val">{{ userInfo.points }}</span><span class="stat-lbl">积分</span></div>
          <div class="stat-div" />
          <div class="stat"><span class="stat-val">{{ userInfo.joinDate.slice(0,4) }}</span><span class="stat-lbl">加入年份</span></div>
        </div>

        <nav class="sidebar-nav">
          <button v-for="item in [
            { key:'profile',  icon:'◈', label:'个人资料' },
            { key:'account',  icon:'⬡', label:'账号绑定' },
            { key:'security', icon:'◉', label:'安全设置' },
            { key:'sessions', icon:'◌', label:'登录记录' },
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

      <!-- ── Main ── -->
      <main class="main-panel">

        <!-- ═══ PROFILE ═══ -->
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

          <!-- Avatar editor -->
          <div class="avatar-edit-row">
            <div class="avatar-large">{{ avatarInitial }}</div>
            <div class="avatar-edit-info">
              <p class="ae-title">头像</p>
              <p class="ae-desc">支持 JPG、PNG，建议尺寸 400×400px，小于 2MB</p>
              <button class="btn-ghost sm" v-if="isEditing">上传图片</button>
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
              <label>所在地区</label>
              <select v-if="isEditing" v-model="formData.region">
                <option v-for="r in regionOptions" :key="r" :value="r">{{ r }}</option>
              </select>
              <input v-else :value="userInfo.region" disabled />
            </div>
            <div class="field full">
              <label>个人简介</label>
              <textarea v-model="formData.bio" :disabled="!isEditing" rows="3" placeholder="介绍一下自己…" />
            </div>
          </div>
        </section>

        <!-- ═══ ACCOUNT BINDINGS ═══ -->
        <section v-if="activeSection === 'account'" class="panel">
          <div class="panel-head">
            <div>
              <h2 class="panel-title">账号绑定</h2>
              <p class="panel-sub">管理你的手机、邮箱及第三方账号</p>
            </div>
          </div>

          <div class="binding-list">
            <div class="binding-item" v-for="(cfg, key) in [
              { key:'phone',  icon:'📱', label:'手机号', desc:'用于登录与安全验证', data: bindings.phone },
              { key:'email',  icon:'✉️',  label:'邮箱',   desc:'接收通知与找回密码', data: bindings.email },
            ]" :key="cfg.key">
              <div class="bi-left">
                <span class="bi-icon">{{ cfg.icon }}</span>
                <div>
                  <p class="bi-label">{{ cfg.label }}</p>
                  <p class="bi-desc">{{ cfg.data.bound ? cfg.data.value : cfg.desc }}</p>
                </div>
              </div>
              <div class="bi-right">
                <span class="bind-tag" :class="cfg.data.bound ? 'bound' : 'unbound'">
                  {{ cfg.data.bound ? '已绑定' : '未绑定' }}
                </span>
                <button class="btn-ghost sm" @click="toggleBinding(cfg.key as keyof typeof bindings)">
                  {{ cfg.data.bound ? '更换' : '立即绑定' }}
                </button>
              </div>
            </div>

            <div class="divider-label">第三方账号</div>

            <div class="binding-item" v-for="cfg in [
              { key:'wechat', icon:'💬', label:'微信',   color:'#07C160' },
              { key:'qq',     icon:'🐧', label:'QQ',     color:'#1296db' },
              { key:'github', icon:'⌥',  label:'GitHub', color:'#e6edf3' },
            ]" :key="cfg.key">
              <div class="bi-left">
                <span class="bi-icon" :style="{ background: cfg.color + '22', color: cfg.color }">{{ cfg.icon }}</span>
                <div>
                  <p class="bi-label">{{ cfg.label }}</p>
                  <p class="bi-desc">
                    {{ bindings[cfg.key as keyof typeof bindings].bound
                      ? bindings[cfg.key as keyof typeof bindings].value || `${cfg.label}已绑定`
                      : `使用 ${cfg.label} 快速登录` }}
                  </p>
                </div>
              </div>
              <div class="bi-right">
                <span class="bind-tag" :class="bindings[cfg.key as keyof typeof bindings].bound ? 'bound' : 'unbound'">
                  {{ bindings[cfg.key as keyof typeof bindings].bound ? '已绑定' : '未绑定' }}
                </span>
                <button class="btn-ghost sm"
                        :class="{ danger: bindings[cfg.key as keyof typeof bindings].bound }"
                        @click="toggleBinding(cfg.key as keyof typeof bindings)">
                  {{ bindings[cfg.key as keyof typeof bindings].bound ? '解绑' : '去绑定' }}
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- ═══ SECURITY ═══ -->
        <section v-if="activeSection === 'security'" class="panel">
          <div class="panel-head">
            <div>
              <h2 class="panel-title">安全设置</h2>
              <p class="panel-sub">保护你的账号安全</p>
            </div>
          </div>

          <div class="security-list">
            <!-- Password -->
            <div class="security-item">
              <div class="si-icon pw">🔑</div>
              <div class="si-info">
                <p class="si-title">登录密码</p>
                <p class="si-desc">上次修改：30天前 &nbsp;·&nbsp; 强度：<span class="strength medium">中等</span></p>
              </div>
              <button class="btn-ghost" @click="showPasswordModal = true">修改密码</button>
            </div>

            <!-- 2FA -->
            <div class="security-item">
              <div class="si-icon tfa" :class="{ on: twoFactorEnabled }">🛡️</div>
              <div class="si-info">
                <p class="si-title">两步验证（2FA）</p>
                <p class="si-desc">{{ twoFactorEnabled ? '已启用 · 使用身份验证器 App' : '未启用 · 建议开启以增强安全性' }}</p>
              </div>
              <div class="toggle-wrap">
                <div class="toggle" :class="{ on: twoFactorEnabled }" @click="toggle2FA">
                  <div class="toggle-thumb" />
                </div>
              </div>
            </div>

            <!-- Security level -->
            <div class="security-score">
              <div class="score-head">
                <span>账号安全评分</span>
                <span class="score-val">{{ twoFactorEnabled ? 92 : 68 }}<span class="score-max">/100</span></span>
              </div>
              <div class="score-bar">
                <div class="score-fill" :style="{ width: (twoFactorEnabled ? 92 : 68) + '%' }" />
              </div>
              <div class="score-items">
                <div class="score-item ok">✓ 已绑定手机号</div>
                <div class="score-item ok">✓ 已绑定邮箱</div>
                <div class="score-item" :class="twoFactorEnabled ? 'ok' : 'warn'">
                  {{ twoFactorEnabled ? '✓ 两步验证已开启' : '⚠ 建议开启两步验证' }}
                </div>
                <div class="score-item ok">✓ 密码强度良好</div>
              </div>
            </div>
          </div>
        </section>

        <!-- ═══ SESSIONS ═══ -->
        <section v-if="activeSection === 'sessions'" class="panel">
          <div class="panel-head">
            <div>
              <h2 class="panel-title">登录记录</h2>
              <p class="panel-sub">查看近期设备登录情况，发现异常请立即撤销</p>
            </div>
            <button class="btn-ghost danger">撤销全部（当前除外）</button>
          </div>

          <div class="session-list">
            <div class="session-item" v-for="(s, i) in loginSessions" :key="i" :class="{ current: s.current }">
              <div class="s-icon">{{ s.icon }}</div>
              <div class="s-info">
                <div class="s-head">
                  <span class="s-device">{{ s.device }}</span>
                  <span class="s-cur" v-if="s.current">当前设备</span>
                </div>
                <div class="s-meta">
                  <span>{{ s.os }}</span>
                  <span class="dot">·</span>
                  <span>{{ s.location }}</span>
                  <span class="dot">·</span>
                  <span>{{ s.ip }}</span>
                  <span class="dot">·</span>
                  <span>{{ s.time }}</span>
                </div>
              </div>
              <button v-if="!s.current" class="btn-ghost sm danger" @click="revokeSession(i)">撤销</button>
            </div>
          </div>
        </section>
      </main>
    </div>

    <!-- ░░ Password Modal ░░ -->
    <Transition name="modal">
      <div v-if="showPasswordModal" class="modal-wrap" @click.self="showPasswordModal = false">
        <div class="modal-box">
          <div class="modal-head">
            <span>修改登录密码</span>
            <button class="modal-close" @click="showPasswordModal = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="field">
              <label>原密码</label>
              <input type="password" v-model="passwordForm.old" placeholder="请输入原密码" />
            </div>
            <div class="field">
              <label>新密码</label>
              <input type="password" v-model="passwordForm.next" placeholder="至少8位，含字母与数字" />
              <div class="pw-strength-bar" v-if="passwordForm.next">
                <div :style="{
                  width: passwordForm.next.length < 6 ? '25%' : passwordForm.next.length < 10 ? '60%' : '100%',
                  background: passwordForm.next.length < 6 ? '#ff4d6d' : passwordForm.next.length < 10 ? '#ffd166' : '#06d6a0'
                }" />
              </div>
            </div>
            <div class="field">
              <label>确认新密码</label>
              <input type="password" v-model="passwordForm.confirm" placeholder="再次输入新密码" />
            </div>
          </div>
          <div class="modal-foot">
            <button class="btn-ghost" @click="showPasswordModal = false">取消</button>
            <button class="btn-primary" @click="submitPassword">确认修改</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ░░ 2FA Modal ░░ -->
    <Transition name="modal">
      <div v-if="show2FAModal" class="modal-wrap" @click.self="show2FAModal = false">
        <div class="modal-box">
          <div class="modal-head">
            <span>开启两步验证</span>
            <button class="modal-close" @click="show2FAModal = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="tfa-steps">
              <div class="tfa-step">
                <div class="tfa-num">1</div>
                <div>
                  <p class="tfa-s-title">下载身份验证器</p>
                  <p class="tfa-s-desc">Google Authenticator 或 Microsoft Authenticator</p>
                </div>
              </div>
              <div class="tfa-step">
                <div class="tfa-num">2</div>
                <div>
                  <p class="tfa-s-title">扫描二维码</p>
                  <div class="qr-placeholder">
                    <div class="qr-inner">QR CODE</div>
                  </div>
                </div>
              </div>
              <div class="tfa-step">
                <div class="tfa-num">3</div>
                <div style="flex:1">
                  <p class="tfa-s-title">输入验证码</p>
                  <input class="tfa-code-input" placeholder="6位数字验证码" maxlength="6" />
                </div>
              </div>
            </div>
          </div>
          <div class="modal-foot">
            <button class="btn-ghost" @click="show2FAModal = false">取消</button>
            <button class="btn-primary" @click="confirm2FA">验证并开启</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap');

/* ─── Root & Background ─── */
.pc-root {
  min-height: 100vh;
  font-family: 'DM Sans', sans-serif;
  background: #070b10;
  color: #e8eaf0;
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
  background: radial-gradient(circle, #4f6ef7, transparent);
  top: -200px; left: -100px;
  animation: drift1 18s ease-in-out infinite alternate;
}
.orb2 {
  width: 500px; height: 500px;
  background: radial-gradient(circle, #a855f7, transparent);
  bottom: -150px; right: -100px;
  animation: drift2 22s ease-in-out infinite alternate;
}
@keyframes drift1 { to { transform: translate(60px, 80px); } }
@keyframes drift2 { to { transform: translate(-60px, -50px); } }

.bg-grid {
  position: absolute; inset: 0;
  background-image:
      linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px);
  background-size: 48px 48px;
}

/* ─── Layout ─── */
.pc-layout {
  position: relative; z-index: 1;
  max-width: 1080px; margin: 0 auto;
  padding: 48px 24px;
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 28px;
  align-items: start;
}

/* ─── Sidebar ─── */
.sidebar {
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 20px;
  padding: 32px 20px;
  text-align: center;
  position: sticky; top: 32px;
  backdrop-filter: blur(16px);
}

.avatar-block { position: relative; display: inline-block; margin-bottom: 16px; }
.avatar-ring {
  width: 88px; height: 88px; border-radius: 50%;
  padding: 3px;
  background: linear-gradient(135deg, #4f6ef7, #a855f7);
}
.avatar {
  width: 100%; height: 100%; border-radius: 50%;
  background: #141b2d;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Space Mono', monospace;
  font-size: 32px; font-weight: 700;
  color: #7c9ff5;
}
.badge {
  position: absolute; bottom: 2px; right: 2px;
  padding: 2px 7px; border-radius: 20px; font-size: 10px;
  font-weight: 700; letter-spacing: .05em;
  font-family: 'Space Mono', monospace;
}
.badge.pro  { background: linear-gradient(135deg, #4f6ef7, #a855f7); color: #fff; }
.badge.free { background: rgba(255,255,255,.1); color: rgba(255,255,255,.5); }

.sidebar-name { font-size: 1.1rem; font-weight: 600; margin: 0 0 4px; }
.sidebar-id {
  font-family: 'Space Mono', monospace;
  font-size: 11px; color: rgba(255,255,255,.3);
  margin: 0 0 20px;
}

.sidebar-stats {
  display: flex; align-items: center; justify-content: center;
  gap: 16px; margin-bottom: 28px;
  padding: 14px 20px;
  background: rgba(255,255,255,.05);
  border-radius: 12px;
}
.stat { text-align: center; }
.stat-val { display: block; font-family: 'Space Mono', monospace; font-size: 1.1rem; font-weight: 700; color: #7c9ff5; }
.stat-lbl { font-size: 11px; color: rgba(255,255,255,.4); }
.stat-div { width: 1px; height: 28px; background: rgba(255,255,255,.1); }

.sidebar-nav { display: flex; flex-direction: column; gap: 6px; }
.nav-btn {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 16px;
  border-radius: 12px; border: none; cursor: pointer;
  background: transparent;
  color: rgba(255,255,255,.5);
  font-family: 'DM Sans', sans-serif; font-size: .9rem;
  transition: all .25s;
  text-align: left;
}
.nav-btn:hover { background: rgba(255,255,255,.07); color: rgba(255,255,255,.85); }
.nav-btn.active { background: rgba(79,110,247,.15); color: #7c9ff5; }
.nav-icon { font-size: 16px; opacity: .8; }

/* ─── Main Panel ─── */
.main-panel { min-width: 0; }

.panel {
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 20px; padding: 36px;
  backdrop-filter: blur(16px);
}

.panel-head {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(255,255,255,.07);
}
.panel-title { font-size: 1.35rem; font-weight: 600; margin: 0 0 4px; }
.panel-sub   { font-size: .88rem; color: rgba(255,255,255,.4); margin: 0; }
.head-actions { display: flex; gap: 10px; }

/* ─── Buttons ─── */
.btn-primary {
  padding: 10px 22px; border-radius: 10px; border: none; cursor: pointer;
  background: linear-gradient(135deg, #4f6ef7, #7b5ea7);
  color: #fff; font-family: 'DM Sans', sans-serif; font-size: .88rem; font-weight: 500;
  transition: all .25s;
}
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(79,110,247,.4); }

.btn-ghost {
  padding: 10px 22px; border-radius: 10px; cursor: pointer;
  background: rgba(255,255,255,.07);
  border: 1px solid rgba(255,255,255,.1);
  color: rgba(255,255,255,.75); font-family: 'DM Sans', sans-serif;
  font-size: .88rem; transition: all .2s;
}
.btn-ghost:hover { background: rgba(255,255,255,.12); color: #fff; }
.btn-ghost.sm { padding: 7px 14px; font-size: .82rem; }
.btn-ghost.danger { border-color: rgba(255,77,109,.3); color: #ff4d6d; background: rgba(255,77,109,.08); }
.btn-ghost.danger:hover { background: rgba(255,77,109,.15); }

/* ─── Profile ─── */
.avatar-edit-row {
  display: flex; align-items: center; gap: 24px;
  padding: 20px; border-radius: 14px;
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.07);
  margin-bottom: 28px;
}
.avatar-large {
  width: 72px; height: 72px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, #4f6ef7, #a855f7);
  display: flex; align-items: center; justify-content: center;
  font-size: 28px; font-weight: 700; font-family: 'Space Mono', monospace;
}
.ae-title { font-weight: 500; margin: 0 0 4px; }
.ae-desc  { font-size: .82rem; color: rgba(255,255,255,.4); margin: 0 0 10px; }

.fields-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 20px;
}
.field { display: flex; flex-direction: column; gap: 8px; }
.field.full { grid-column: 1 / -1; }
.field label { font-size: .82rem; color: rgba(255,255,255,.5); letter-spacing: .02em; }

input, select, textarea {
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 10px; padding: 11px 14px;
  color: #e8eaf0; font-family: 'DM Sans', sans-serif; font-size: .9rem;
  transition: all .2s; width: 100%; box-sizing: border-box;
}
input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: rgba(79,110,247,.5);
  background: rgba(255,255,255,.09);
  box-shadow: 0 0 0 3px rgba(79,110,247,.12);
}
input:disabled, select:disabled, textarea:disabled { opacity: .45; cursor: not-allowed; }
textarea { resize: vertical; }
select option { background: #141b2d; }

.gender-group { display: flex; gap: 8px; }
.gender-btn {
  flex: 1; padding: 10px; border-radius: 10px;
  border: 1px solid rgba(255,255,255,.1);
  background: rgba(255,255,255,.05);
  color: rgba(255,255,255,.5); cursor: pointer;
  font-family: 'DM Sans', sans-serif; font-size: .88rem;
  transition: all .2s;
}
.gender-btn.sel {
  border-color: #4f6ef7;
  background: rgba(79,110,247,.15);
  color: #7c9ff5;
}

/* ─── Account Bindings ─── */
.binding-list { display: flex; flex-direction: column; gap: 2px; }

.binding-item {
  display: flex; align-items: center; gap: 16px;
  padding: 18px 16px; border-radius: 12px;
  transition: background .2s;
}
.binding-item:hover { background: rgba(255,255,255,.04); }

.bi-left  { display: flex; align-items: center; gap: 14px; flex: 1; min-width: 0; }
.bi-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

.bi-icon {
  width: 42px; height: 42px; border-radius: 10px; flex-shrink: 0;
  background: rgba(255,255,255,.08);
  display: flex; align-items: center; justify-content: center; font-size: 18px;
}
.bi-label { font-weight: 500; font-size: .9rem; margin: 0 0 2px; }
.bi-desc  { font-size: .8rem; color: rgba(255,255,255,.4); margin: 0; }

.bind-tag {
  font-size: .75rem; font-weight: 500; padding: 3px 9px; border-radius: 20px;
  font-family: 'Space Mono', monospace;
}
.bind-tag.bound   { background: rgba(6,214,160,.15); color: #06d6a0; }
.bind-tag.unbound { background: rgba(255,255,255,.07); color: rgba(255,255,255,.35); }

.divider-label {
  padding: 20px 0 10px;
  font-size: .78rem; color: rgba(255,255,255,.3);
  letter-spacing: .08em; text-transform: uppercase;
  border-top: 1px solid rgba(255,255,255,.06);
  margin-top: 10px;
}

/* ─── Security ─── */
.security-list { display: flex; flex-direction: column; gap: 16px; }

.security-item {
  display: flex; align-items: center; gap: 16px;
  padding: 20px; border-radius: 14px;
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.07);
}
.si-icon {
  width: 44px; height: 44px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; font-size: 20px;
  flex-shrink: 0;
}
.si-icon.pw  { background: rgba(79,110,247,.15); }
.si-icon.tfa { background: rgba(255,255,255,.07); transition: background .3s; }
.si-icon.tfa.on { background: rgba(6,214,160,.15); }

.si-info  { flex: 1; }
.si-title { font-weight: 500; margin: 0 0 4px; }
.si-desc  { font-size: .82rem; color: rgba(255,255,255,.4); margin: 0; }

.strength.medium { color: #ffd166; }
.strength.high   { color: #06d6a0; }
.strength.low    { color: #ff4d6d; }

.toggle-wrap { flex-shrink: 0; }
.toggle {
  width: 48px; height: 26px; border-radius: 13px;
  background: rgba(255,255,255,.12);
  cursor: pointer; position: relative;
  transition: background .3s;
}
.toggle.on { background: #4f6ef7; }
.toggle-thumb {
  position: absolute; top: 3px; left: 3px;
  width: 20px; height: 20px; border-radius: 50%;
  background: #fff; transition: left .25s; box-shadow: 0 1px 4px rgba(0,0,0,.3);
}
.toggle.on .toggle-thumb { left: 25px; }

.security-score {
  padding: 22px; border-radius: 14px;
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.07);
}
.score-head {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 12px; font-size: .88rem; color: rgba(255,255,255,.6);
}
.score-val {
  font-family: 'Space Mono', monospace; font-size: 1.3rem; font-weight: 700; color: #fff;
}
.score-max { font-size: .75rem; color: rgba(255,255,255,.35); }

.score-bar {
  height: 6px; border-radius: 3px; background: rgba(255,255,255,.1);
  overflow: hidden; margin-bottom: 16px;
}
.score-fill {
  height: 100%; border-radius: 3px;
  background: linear-gradient(90deg, #4f6ef7, #a855f7);
  transition: width .6s ease;
}
.score-items { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.score-item { font-size: .82rem; color: rgba(255,255,255,.4); }
.score-item.ok   { color: #06d6a0; }
.score-item.warn { color: #ffd166; }

/* ─── Sessions ─── */
.session-list { display: flex; flex-direction: column; gap: 10px; }
.session-item {
  display: flex; align-items: center; gap: 16px;
  padding: 18px; border-radius: 14px;
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.07);
  transition: border-color .2s;
}
.session-item.current { border-color: rgba(79,110,247,.3); }
.s-icon {
  width: 44px; height: 44px; border-radius: 12px;
  background: rgba(255,255,255,.08);
  display: flex; align-items: center; justify-content: center; font-size: 20px;
  flex-shrink: 0;
}
.s-info { flex: 1; }
.s-head { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
.s-device { font-weight: 500; font-size: .9rem; }
.s-cur {
  font-size: .72rem; padding: 2px 8px; border-radius: 20px;
  background: rgba(79,110,247,.2); color: #7c9ff5;
  font-family: 'Space Mono', monospace;
}
.s-meta { font-size: .8rem; color: rgba(255,255,255,.35); display: flex; flex-wrap: wrap; gap: 4px; }
.dot { color: rgba(255,255,255,.2); }

/* ─── Modals ─── */
.modal-wrap {
  position: fixed; inset: 0; z-index: 100;
  background: rgba(0,0,0,.75); backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}
.modal-box {
  background: #0e1520;
  border: 1px solid rgba(255,255,255,.12);
  border-radius: 18px; width: 100%; max-width: 440px;
  overflow: hidden;
}
.modal-head {
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255,255,255,.08);
  display: flex; justify-content: space-between; align-items: center;
  font-size: 1rem; font-weight: 600;
}
.modal-close {
  background: rgba(255,255,255,.08); border: none; color: rgba(255,255,255,.5);
  width: 28px; height: 28px; border-radius: 50%; cursor: pointer; font-size: 13px;
  transition: all .2s;
}
.modal-close:hover { background: rgba(255,255,255,.15); color: #fff; }
.modal-body { padding: 24px; display: flex; flex-direction: column; gap: 18px; }
.modal-foot {
  padding: 18px 24px;
  border-top: 1px solid rgba(255,255,255,.08);
  display: flex; justify-content: flex-end; gap: 10px;
}

.pw-strength-bar {
  height: 4px; border-radius: 2px; background: rgba(255,255,255,.1);
  margin-top: 6px; overflow: hidden;
}
.pw-strength-bar div { height: 100%; border-radius: 2px; transition: all .3s; }

/* 2FA */
.tfa-steps { display: flex; flex-direction: column; gap: 20px; }
.tfa-step { display: flex; gap: 14px; align-items: flex-start; }
.tfa-num {
  width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0;
  background: rgba(79,110,247,.2); color: #7c9ff5;
  display: flex; align-items: center; justify-content: center;
  font-size: .8rem; font-weight: 700; font-family: 'Space Mono', monospace;
}
.tfa-s-title { font-weight: 500; margin: 0 0 4px; font-size: .9rem; }
.tfa-s-desc  { font-size: .8rem; color: rgba(255,255,255,.4); margin: 0; }
.qr-placeholder {
  width: 120px; height: 120px; border-radius: 10px; margin-top: 10px;
  background: rgba(255,255,255,.06);
  border: 2px dashed rgba(255,255,255,.15);
  display: flex; align-items: center; justify-content: center;
}
.qr-inner { font-family: 'Space Mono', monospace; font-size: .75rem; color: rgba(255,255,255,.25); }
.tfa-code-input { margin-top: 8px; letter-spacing: .2em; font-family: 'Space Mono', monospace; }

/* ─── Toast ─── */
.toast {
  position: fixed; top: 28px; right: 28px; z-index: 200;
  display: flex; align-items: center; gap: 10px;
  padding: 12px 20px; border-radius: 12px;
  font-size: .88rem; font-weight: 500;
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 30px rgba(0,0,0,.4);
}
.toast.ok  { background: rgba(6,214,160,.15); border: 1px solid rgba(6,214,160,.3); color: #06d6a0; }
.toast.err { background: rgba(255,77,109,.15); border: 1px solid rgba(255,77,109,.3); color: #ff4d6d; }
.toast-icon { font-size: 16px; font-weight: 700; }

/* ─── Transitions ─── */
.toast-enter-active, .toast-leave-active { transition: all .3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(20px); }

.modal-enter-active, .modal-leave-active { transition: all .25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active .modal-box, .modal-leave-active .modal-box { transition: transform .25s ease; }
.modal-enter-from .modal-box, .modal-leave-to .modal-box { transform: scale(.95) translateY(10px); }

/* ─── Responsive ─── */
@media (max-width: 720px) {
  .pc-layout { grid-template-columns: 1fr; padding: 20px 16px; }
  .sidebar { position: static; }
  .fields-grid { grid-template-columns: 1fr; }
  .score-items { grid-template-columns: 1fr; }
}
</style>