<script>
import { ref, reactive } from 'vue'

export default {
  name: 'Users',
  setup () {
    // true为登录页面，false为注册页面
    const isLogin = ref(true)
    // 记住密码
    const rememberMe = ref(false)
    // 添加用户协议同意状态
    const agreeToTerms = ref(false)
    // 登录方式切换
    const transitionName = ref('slide-left');
    //验证码倒计时
    const loginCountdown = ref(0)
    const registerCountdown = ref(0)
    // 二维码登录
    const showQrLogin = ref(false)
    // 手机登录/扫码切换
    const showMobileLogin = ref(false)


    const loginForm = reactive({
      username: '',
      password: ''
    })
    const registerForm = reactive({
      username: '',
      password: '',
      confirmPassword: '',
      phone: '',
      verificationCode: ''
    })
    const errors = reactive({
      username: '',
      password: '',
      confirmPassword: '',
      phone: '',
      verificationCode: ''
    })
    //证码相关状态
    const codeSent = reactive({
      login: false,
      register: false
    })



    const switchMode = () => {
      transitionName.value = isLogin.value ? 'slide-right' : 'slide-left';
      isLogin.value = !isLogin.value;
      errors.username = ''
      errors.password = ''
      errors.confirmPassword = ''
      errors.phone = ''
      errors.verificationCode = ''
    }
    const validateField = (field, message) => {
      if (!field) return message
      return ''
    }
    const handleInvalid = (e) => {
      e.target.setCustomValidity('')
      if (!e.target.validity.valid) {
        if (e.target.validity.valueMissing) {
          e.target.setCustomValidity('此项为必填项')
        } else if (e.target.validity.patternMismatch) {
          e.target.setCustomValidity(e.target.title)
        }
      }
    }

    // 切换二维码登录方式
    const toggleLoginMethod = () => {
      showMobileLogin.value = false
      showQrLogin.value = !showQrLogin.value
    }

    // 通用倒计时方法
    const startCountdown = (type) => {
      const target = type === 'login' ? loginCountdown : registerCountdown
      if (target.value > 0) return

      target.value = 60
      const timerKey = `${type}Timer`
      const timer = setInterval(() => {
        target.value--
        if (target.value <= 0) {
          clearInterval(timer)
          codeSent[type] = false
        }
      }, 1000)
    }

    // 账号登录逻辑
    const handleLogin = () => {
      const form = document.querySelector('.login-box form')
      if (!form.checkValidity()) {
        form.reportValidity()
        return
      }
    }

    // 手机登录逻辑
    const handleMobileLogin = () => {
      errors.phone = validateField(loginForm.phone, '请输入手机号')
      errors.verificationCode = validateField(loginForm.verificationCode, '请输入验证码')

      if (!/^1[3-9]\d{9}$/.test(loginForm.phone)) {
        errors.phone = '手机号格式不正确'
        return
      }

      if (!loginForm.verificationCode) {
        errors.verificationCode = '请输入验证码'
        return
      }

      // TODO: 实现手机登录逻辑
      console.log('手机登录信息：', {
        phone: loginForm.phone,
        code: loginForm.verificationCode
      })
    }



    // 注册逻辑
    const handleRegister = () => {
      if (!registerForm.username) {
        errors.username = '请输入用户名'
        return
      }
      if (registerForm.password.length < 8) {
        errors.password = '密码至少需要8位';
        return;
      }
      if (!registerForm.password) {
        errors.password = '请输入密码'
        return
      }
      if (registerForm.password !== registerForm.confirmPassword) {
        errors.confirmPassword = '两次输入的密码不一致'
        return
      }
      if (!registerForm.phone) {
        errors.phone = '请输入手机号'
        return
      }
      if (!registerForm.verificationCode) {
        errors.verificationCode = '请输入验证码'
        return
      }
      // TODO: 实现注册逻辑
      console.log('注册信息：', registerForm)
    }

    // 登录验证码逻辑
    const sendLoginVerificationCode = async () => {
      try {
        if (!/^1[3-9]\d{9}$/.test(loginForm.phone)) {
          errors.phone = '手机号格式不正确'
          return
        }

        // 调用后端API
        const response = await axios.post('#', {
          phone: loginForm.phone
        })

        if (response.data.success) {
          startCountdown('login')
          codeSent.login = true
          ElMessage.success('验证码已发送')
        } else {
          ElMessage.error(response.data.message || '发送失败')
        }
      } catch (error) {
        ElMessage.error('网络错误，请稍后重试')
        console.error('发送验证码失败:', error)
      }
    }
    // 注册验证码逻辑
    const sendVerificationCode = async () => {
      try {
        if (!registerForm.phone) {
          errors.phone = '请输入手机号'
          return
        }

        if (!/^1[3-9]\d{9}$/.test(registerForm.phone)) {
          errors.phone = '手机号格式不正确'
          return
        }

        // 调用后端API
        const response = await axios.post('#', {
          phone: registerForm.phone
        })

        if (response.data.success) {
          startCountdown('register')
          codeSent.register = true
          ElMessage.success('验证码已发送')
        } else {
          ElMessage.error(response.data.message || '发送失败')
        }
      } catch (error) {
        ElMessage.error('网络错误，请稍后重试')
        console.error('发送验证码失败:', error)
      }
    }


    // 提交表单
    return {
      isLogin,
      rememberMe,
      agreeToTerms,
      loginForm,
      registerForm,
      errors,
      switchMode,
      handleLogin,
      handleRegister,
      sendVerificationCode,
      showMobileLogin,
      toggleLoginMethod,
      handleMobileLogin,
      sendLoginVerificationCode
    }
  }
}
</script>

<template>
  <!-- 背景视频 -->
  <video class="bg-video" autoplay loop muted playsinline>
    <source src="/videos/home1.mp4" type="video/mp4">
  </video>
  <!-- 登录页面容器 -->
  <div class="user-container">
    <div class="content-wrapper">
      <!--
      -- 左 侧 区 域 ---------------------------------------------------------
      -->
      <div class="help-section">
        <div class="help-links">
          <router-link to="/Agreement" class="help-item">用 户 协 议</router-link>
          <router-link to="/Policy" class="help-item">隐 私 政 策</router-link>
          <router-link to="/Help" class="help-item">帮 助 中 心</router-link>
          <router-link to="/Customer" class="help-item">客 服 中 心</router-link>
        </div>
      </div>

      <!--
      -- 中 间 区 域 ---------------------------------------------------------
      -->
      <div class="box">
        <!-- 账号登录表单 -->
        <transition :name="transitionName" mode="out-in">
          <div class="login-box" v-show="isLogin" key="login">
            <!-- 二维码登录切换标签 -->
            <a class="qr-login-icon" @click="toggleLoginMethod">
              <router-link to="/Code">
                <svg-icon name="qr-code" :width="70" height="70"/>
              </router-link>
            </a>
            <!-- 登录类型切换标签 -->
            <div class="login-header">
              <div class="login-tabs">
                <h2 :class="{active: !showMobileLogin}" @click="showMobileLogin = false">账号登录</h2>
                <h2 :class="{active: showMobileLogin}" @click="showMobileLogin = true">手机登录</h2>
              </div>
            </div>

            <!-- 登录表单容器 -->
            <div class="form-container">
              <form v-show="!showMobileLogin" key="account" @submit.prevent="handleLogin">
              <div class="form-group">
                <input
                    type="text"
                    v-model="loginForm.username"
                    placeholder="手机号/邮箱/用户名"
                    required
                    pattern=".{3,}"
                    title="用户名至少3个字符"
                    @invalid="handleInvalid">
                <span class="error-message">{{ errors.username }}</span>
              </div>
              <div class="form-group">
                <input
                    type="password"
                    v-model="loginForm.password"
                    placeholder="密码"
                    required
                    pattern=".{6,}"
                    title="密码至少6位"
                    @invalid="handleInvalid">
                <span class="error-message">{{ errors.password }}</span>
              </div>

              <!-- 忘记密码 --->
              <div class="form-options"><a href="#" class="forgot-password">忘记密码？</a></div>

              <!-- 勾选菜单 -->
              <label class="checkbox-group">
                <input type="checkbox" v-model="agreeToTerms">
                <span class="custom-checkbox"></span>
                <span class="checkbox-label">已阅读并同意<a href="#">用户协议</a>和<a href="#">隐私政策</a>
                </span>
              </label>
              <!-- 登录按钮 -->
              <button type="submit" class="submit-btn">LOGIN IN</button>
              <div class="other-login">
                <p style="color: #ffffff;">其他登录方式</p>
                <div class="login-methods">
                  <a href="#" class="method-item">
                    <img src="/logo/wechat.png" style="width: 45px" alt="微信登录"></a>
                  <a href="#" class="method-item">
                    <img src="/logo/qq.png" style="width: 45px" alt="QQ登录">
                  </a>
                </div>
              </div>
            </form>

            <!-- 手机登录表单 -->
            <form v-show="showMobileLogin" key="mobile"
                  @submit.prevent="handleMobileLogin"
                  class="mobile-login-form">
              <div class="form-group">
                <input
                    type="tel"
                    v-model="loginForm.phone"
                    placeholder="手机号"
                    required
                    pattern=".{11}"
                    title="手机号输入错误"
                    @invalid="handleInvalid">
                <span class="error-message">{{ errors.phone }}</span>
              </div>
              <div class="code-container"> <!-- 新增验证码容器 -->
                <input
                    type="text"
                    v-model="registerForm.verificationCode"
                    placeholder="验证码"
                    required
                    pattern=".{6,}"
                    title="验证码错误"
                    @invalid="handleInvalid">
                <button
                    type="button"
                    class="send-code-btn"
                    @click="sendVerificationCode"
                    :disabled="registerCountdown > 0">
                  {{ registerCountdown > 0 ? `${registerCountdown}s` : '获取验证码' }}
                </button>
              </div>
              <!-- 勾选菜单 -->
              <label class="checkbox-group">
                <input type="checkbox" v-model="agreeToTerms">
                <span class="custom-checkbox"></span>
                <span class="checkbox-label">已阅读并同意<a href="#">用户协议</a>和<a href="#">隐私政策</a>
                    </span>
              </label>

              <button type="submit" class="submit-btn">LOGIN IN</button>

              <div class="other-login">
                <p style="color: #ffffff;">其他登录方式</p>
                <div class="login-methods">
                  <a href="#" class="method-item">
                    <img src="/logo/wechat.png" style="width: 45px" alt="微信登录"></a>
                  <a href="#" class="method-item">
                    <img src="/logo/qq.png" style="width: 45px" alt="QQ登录">
                  </a>
                </div>
              </div>
            </form>
            </div>
          </div>
        </transition>



        <!-- 注册表单 -->
        <transition :name="transitionName" mode="out-in">
          <div class="register-box" v-show="!isLogin" key="register">
            <h2 style="color: rgb(255, 255, 255);">用户注册</h2>
            <form @submit.prevent="handleRegister">
              <div class="form-group">
                <input
                    type="text"
                    v-model="registerForm.username"
                    placeholder="用户名"
                    :class="{ 'error': errors.username }" required>
                <span class="error-message">{{ errors.username }}</span>
              </div>
              <div class="form-group">
                <input
                    type="password"
                    v-model="registerForm.password"
                    placeholder="密码"
                    :class="{ 'error': errors.password }" required>
                <span class="error-message">{{ errors.password }}</span>
              </div>
              <div class="form-group">
                <input
                    type="tel"
                    v-model="registerForm.phone"
                    placeholder="手机号"
                    :class="{ 'error': errors.phone }" required>
                <span class="error-message">{{ errors.phone }}</span>
              </div>
              <div class="code-container">
                <input
                    type="text"
                    v-model="registerForm.verificationCode"
                    placeholder="验证码"
                    :class="{ 'error': errors.verificationCode }" required>
                <button
                    type="button"
                    class="send-code-btn"
                    @click="sendVerificationCode"
                    :disabled="registerCountdown > 0">
                  {{ registerCountdown > 0 ? `${registerCountdown}s` : '获取验证码' }}
                </button>
              </div>
              <!-- 隐私策略部分 -->
              <label class="checkbox-group">
                <input type="checkbox" v-model="agreeToTerms">
                <span class="custom-checkbox"></span>
                <span class="checkbox-label">已阅读并同意<a href="#">用户协议</a>和<a href="#">隐私政策</a></span>
              </label>
              <button type="submit" class="submit-btn">SIGN UP</button>
            </form>
          </div>
        </transition>
      </div>

      <!--
      -- 右 侧 区 域 ---------------------------------------------------------
      -->
      <div class="right-section">
        <video class="right-bg-video" autoplay loop muted playsinline>
          <source src="/videos/home2.mp4" type="video/mp4">
        </video>
        <div class="right-content">
          <h2>即刻加入我们</h2>
          <p>开启您的数字创意之旅</p>
          <button class="switch-mode-btn" @click="switchMode">
            {{ isLogin ? 'SIGN UP' : 'SIGN IN' }}
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
/* 容器基础样式 */
.user-container {
  min-height: 100vh;
  padding: 1% 10% 1% 10%;
  display: flex;
  justify-content: center;
  align-items: center;
}
/* 背景视频样式 */
.bg-video {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: -1;
}
/* 主要内容框架样式 */
.content-wrapper {
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  min-height: 40vh;
  display: flex;
  justify-content: center;
  gap: 5%;
  background: rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(15px);
  border-radius: 20px;
  padding: 3rem;
  position: relative;
  box-shadow: 0 15px 30px 0 rgba(51, 88, 104, 0.27) !important;
}

/************************************************************
 * 中间登录区域样式
 ************************************************************/
.box {
  width: 45%;
  min-width: 400px;
  overflow: hidden;
  position: relative;
}
.login-box,.register-box {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  text-align: center;
  z-index: 4;
  position: relative;
}
.login-tabs {
  display: flex;
  gap: 2rem;
  margin-bottom: 1.5rem;
}
.login-tabs h2 {
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}
.login-tabs h2.active {
  color: white;
}
.login-tabs h2.active::after {
  content: "";
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 100%;
  height: 2px;
  background: #ffffff;
}
/* 其他登录 */
.login-methods {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
}
.method-item {
  width: 40px;
}

/* 验证码输入组容器 */
.verification-code {
  position: relative;
  display: flex;
  gap: 10px;
  align-items: center;
}
/* 验证码输入框 */
.verification-code input {
  flex: 1;
}
/* 发送验证码按钮 */
.send-code-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  height: 100%;
  transform: translateY(-50%);
  padding: 8px 15px;
  background: rgba(100, 104, 111, 0.7);
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.85rem;
}
.send-code-btn:hover:not(:disabled) {
  background: rgb(100, 104, 111);
  box-shadow: 0 2px 8px rgba(35, 112, 213, 0.3);
}
.send-code-btn:disabled {
  background: rgba(100, 100, 100, 0.5);
  cursor: not-allowed;
  opacity: 0.7;
}
/* 验证码容器 */
.code-container {
  display: flex;
  gap: 10px;
  width: 90%;
  margin: 0 auto 1.5rem;
}
.code-container input {
  flex: 7;
}
.code-container .send-code-btn {
  flex: 3;
  position: relative;
  height: auto;
  transform: none;
  right: auto;
  top: auto;
  padding: 15px 10px;
  white-space: nowrap;
}


/************************************************************
 * 左侧区域样式
 ************************************************************/
.help-section {
  margin-top: 3rem;
  width: 15%;
  padding-right: 1rem;
  border-right: 1px solid rgba(255,255,255,0.1);
}
.help-links {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}
.help-item {
  color: white;
  width: 5rem;
  text-decoration: none;
  font-size: 1rem;
  transition: all 0.3s ease;
  padding: 1rem 0.4rem;
  border-radius: 8px;
}
.help-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(8px);
  box-shadow: 2px 0 10px 10px rgba(255, 255, 255, 0.1);
}

/************************************************************
 * 右侧区域样式
 ************************************************************/
.right-section {
  position: relative;
  overflow: hidden;
  width: 40%;
  padding-left: 1rem;
  border-left: 1px solid rgba(255,255,255,0.1);
  border-radius: 15px;
}
.right-bg-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}
.right-content {
  position: absolute;
  z-index: 2;
  text-align: center;
  color: #ffffff;
  text-shadow:  0 0 2px hsl(198, 87%, 3%),0 0 2px hsl(0, 0%, 100%), 0 0 2px hsl(198, 87%, 3%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  padding: 2rem;
  h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
  p {
    font-size: 1.2rem;
    opacity: 0.9;
    margin-bottom: 2rem;
  }
}
/* 切换登录注册按钮 */
.switch-mode-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 8px rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.8rem 2rem;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
}
.switch-mode-btn:hover {
  background: rgba(255, 255, 255, 0.34);
}

/************************************************************
 * 输入表单样式
 ************************************************************/
.form-group {
  margin: 1rem;
  position: relative;
}
input {
  width: 90%;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  font-size: 0.9rem;
  transition: all 0.5s ease;
}
input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.09);
  box-shadow: 0 3px 10px 1px rgba(255, 255, 255, 0.32);
}
.submit-btn {
  letter-spacing: 5px;
  text-align: center;
  width: 100%;
  padding: 1rem;
  background: rgba(84, 89, 96, 0.34);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1.5rem;
}
.submit-btn:hover {
  background: rgba(100, 104, 111, 0.66);
  transform: translateY(-1px);
}

/************************************************************
 * 复选框√样式
 ************************************************************/
.checkbox-group {
  display: flex;
  align-items: center;
  margin-bottom: 0.8rem;
  cursor: pointer;
  padding-left: 13px;
}
.checkbox-group input[type="checkbox"] {
  display: none;
}
.checkbox-group input[type="checkbox"]:checked + .custom-checkbox {
  background: rgb(100, 104, 111);
  border-color: transparent;
}
.checkbox-group input[type="checkbox"]:checked + .custom-checkbox::after {
  display: block;
}
.custom-checkbox {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 4px;
  margin-right: 8px;
  transition: all 0.3s ease;
}
.custom-checkbox::after {
  content: "✓";
  color: white;
  font-size: 14px;
  display: none;
}
.checkbox-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  user-select: none;
}
.checkbox-label a {
  color: #2370d5;
  text-decoration: none;
  margin: 0 3px;
}
.checkbox-label a:hover {
  text-decoration: underline;
}

/************************************************************
 * 忘记密码样式
 ************************************************************/
.form-options {
  display: flex;
  justify-content: space-between;
  margin: 1rem 0;
  padding-left: 13px;
}
.forgot-password {
  color: #2370d5;
  text-decoration: none;
  font-size: 0.9rem;
}
.forgot-password:hover {
  text-decoration: underline;
}

/************************************************************
 * 二维码登录图标
 ************************************************************/
.qr-login-icon {
  position: absolute;
  top: 0;
  right: 34px;
  width: 36px;
  height: 36px;
  cursor: pointer;
  transition: transform 0.3s ease;
  z-index: 5;
}
.qr-login-icon:hover {
  transform: scale(1.1);
}

/************************************************************
 * 左侧响应式布局
 ************************************************************/
@media (max-width: 768px) {
  .help-section {
    order: 1;
    width: 100%;
    border-right: none;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    padding-bottom: 2rem;
  }
  .help-links {
    flex-direction: row;
    gap: 1rem;
  }
  .help-item {
    width: 100%;
  }
}

/************************************************************
 * 中间响应式布局
 ************************************************************/
@media (max-width: 768px) {
  .user-container {
    padding: 5vh 5%;
  }
  .content-wrapper {
    flex-direction: column;
    gap: 2rem;
    padding: 2rem;
  }
  .box {
    order: 2; /* 将登录框移到中间位置 */
    width: 100% !important;
    min-width: auto;
    padding: 0;
    position: relative;
    min-height: 500px; /* 确保有足够高度 */
  }
  .login-header h2 {
    font-size: 1.5rem;
  }
  .content-wrapper {
    flex-direction: column;
    gap: 2rem;
    padding: 2rem;
  }
  .qr-login-icon {
    display: none;
  }
  input {
    width: 80% !important;
    padding: 1rem;
    font-size: 16px;
  }
  .verification-code input {
    padding-right: 5px;
  }
  .send-code-btn {
    padding: 6px 12px;
    font-size: 0.75rem;
    right: 5px;
  }
  .login-tabs {
    flex-direction: row;
    gap: 1rem;
    padding-left: 15px;
    h2 {
      font-size: 1.3rem;
    }
  }
  .code-container {
    margin: 0 auto 1.5rem;
    width: 82%;
    transition: all 0.5s ease;
  }
}

/************************************************************
 * 右侧响应式布局
 ************************************************************/
@media (max-width: 768px) {
  .right-section {
    order: 3;
    width: 100%;
    min-height: 300px;
  }
  .right-content {
    width: 80%;
    margin: 0 auto;
  }
}
</style>
