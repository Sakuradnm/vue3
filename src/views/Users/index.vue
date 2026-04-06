<script>
import { ref, reactive } from 'vue'
import { createUser as apiCreateUser, registerUser  } from '@/api/user'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

export default {
  name: 'Users',
  setup () {
    const router = useRouter()
    // true 为登录页面，false 为注册页面
    const isLogin = ref(true)
    // 记住密码
    const rememberMe = ref(false)
    // 添加用户协议同意状态
    const agreeToTerms = ref(false)
    // 登录方式切换
    const transitionName = ref('slide-left')
    // 学生/教师切换
    const loginTypeTransition = ref('fade-left')
    // 登录类型：true 为学生，false 为教师
    const isStudent = ref(true)
    // 倒计时相关
    const registerCountdown = ref(0)
    // 密码显示/隐藏
    const showPassword = ref(false)

    // 切换密码显示/隐藏
    const toggleShowPassword = () => {
      showPassword.value = !showPassword.value
    }

    const loginForm = reactive({
      username: '',
      password: ''
    })

    // 添加用户输入类型标识
    const inputType = ref('username')

    // 验证输入类型的正则表达式
    const phoneRegex = /^1[3-9]\d{9}$/
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    // 监听用户名输入，自动判断类型
    const handleUsernameInput = () => {
      const value = loginForm.username.trim()
      if (phoneRegex.test(value)) {
        inputType.value = 'phone'
      } else if (emailRegex.test(value)) {
        inputType.value = 'email'
      } else {
        inputType.value = 'username'
      }
    }

    // 清空输入框同时清除账号和密码，方便更换账号
    const clearInput = () => {
      loginForm.username = ''
      loginForm.password = ''
      inputType.value = 'username'
    }

    const registerForm = reactive({
      username: '',
      password: '',
      confirmPassword: '',
      phone: '',
      email: '',
      verificationCode: ''
    })
    const errors = reactive({
      username: '',
      password: '',
      confirmPassword: '',
      phone: '',
      verificationCode: '',
      email: ''
    })

    const switchMode = () => {
      transitionName.value = isLogin.value ? 'slide-right' : 'slide-left'
      isLogin.value = !isLogin.value
      Object.keys(errors).forEach(key => { errors[key] = '' })
    }

    // 切换登录类型（学生/教师）
    const switchLoginType = (type) => {
      if (isStudent.value === type) return
      loginTypeTransition.value = type ? 'fade-left' : 'fade-right'
      isStudent.value = type
      // 切换时清空表单，避免残留数据
      loginForm.username = ''
      loginForm.password = ''
      inputType.value = 'username'
    }

    // 统一登录逻辑，level 由 isStudent 决定（student / teacher）
    const handleLogin = async () => {
      const form = document.querySelector('.login-box form')
      if (!form.checkValidity()) {
        form.reportValidity()
        return
      }

      if (!agreeToTerms.value) {
        ElMessage.warning('请先同意用户协议和隐私政策')
        return
      }

      if (!loginForm.username.trim()) {
        ElMessage.warning('请输入用户名/手机号/邮箱')
        return
      }

      try {
        const inputValue = loginForm.username.trim()

        // 自动识别输入类型
        let loginData
        if (phoneRegex.test(inputValue)) {
          inputType.value = 'phone'
          loginData = { phone: inputValue, password: loginForm.password }
        } else if (emailRegex.test(inputValue)) {
          inputType.value = 'email'
          loginData = { email: inputValue, password: loginForm.password }
        } else {
          inputType.value = 'username'
          loginData = { username: inputValue, password: loginForm.password }
        }

        // 附加 level 字段，由学生/教师登录框决定（admin 除外）
        const inputValueLower = inputValue.toLowerCase()
        if (inputValueLower === 'admin' || inputValueLower.startsWith('admin')) {
          loginData.level = 'admin'
        } else {
          loginData.level = isStudent.value ? 'student' : 'teacher'
        }

        const response = await request({
          url: '/api/users/login',
          method: 'post',
          data: loginData
        })

        // response 已经是用户数据对象（由 request 拦截器处理过）
        if (response && typeof response === 'object' && response.id) {
          const user = response
          const userLevel = user.level
          const inputLabel = inputType.value === 'phone' ? '手机号' : inputType.value === 'email' ? '邮箱' : '用户名'

          // 管理员：任意窗口均可登录，直接跳转后台
          if (userLevel === 'admin') {
            localStorage.setItem('userInfo', JSON.stringify(user))
            if (rememberMe.value) {
              localStorage.setItem('rememberedUsername', loginForm.username)
            }
            localStorage.setItem('userInfo', JSON.stringify(user))
            window.dispatchEvent(new Event('userLogin'))
            ElMessage.success('管理员登录成功！即将进入后台管理系统')
            await router.push('/Admin')
            return
          }

          // 学生登录验证
          if (isStudent.value) {
            if (userLevel === 'student') {
              localStorage.setItem('userInfo', JSON.stringify(user))
              if (rememberMe.value) {
                localStorage.setItem('rememberedUsername', loginForm.username)
              }
              ElMessage.success(`${inputLabel}登录成功！`)
              setTimeout(() => { router.push('/Home') }, 1000)
            } else {
              ElMessage.error('账号、密码或级别不匹配')
            }
            return
          }

          // 教师登录验证
          if (!isStudent.value) {
            if (userLevel === 'teacher') {
              localStorage.setItem('userInfo', JSON.stringify(user))
              if (rememberMe.value) {
                localStorage.setItem('rememberedUsername', loginForm.username)
              }
              ElMessage.success(`${inputLabel}登录成功！`)
              setTimeout(() => { router.push('/Home') }, 1000)
            } else {
              ElMessage.error('账号、密码或级别不匹配')
            }
          }
        } else {
          ElMessage.error('账号、密码或级别不匹配')
        }
      } catch (error) {
        console.error('登录失败:', error)
        ElMessage.error(error.response?.data?.message || error.message || '登录失败，请检查网络连接')
      }
    }

    // 注册逻辑
    const handleRegister = async () => {
      // 清空所有错误提示
      Object.keys(errors).forEach(key => { errors[key] = '' })

      if (!registerForm.username) {
        errors.username = '请输入用户名'
        return
      }
      if (!/^[a-zA-Z0-9]{6,9}$/.test(registerForm.username)) {
        errors.username = '用户名应为 6-9 位字母数字组合'
        return
      }
      if (!registerForm.password) {
        errors.password = '请输入密码'
        return
      }
      if (!/^[a-zA-Z0-9]{6,12}$/.test(registerForm.password)) {
        errors.password = '密码应为 6-12 位字母数字组合'
        return
      }
      if (!registerForm.phone) {
        errors.phone = '请输入手机号'
        return
      }
      if (!/^1[3-9]\d{9}$/.test(registerForm.phone)) {
        errors.phone = '手机号格式不正确'
        return
      }
      if (!agreeToTerms.value) {
        ElMessage.warning('请先阅读并同意用户协议和隐私政策')
        return
      }

      try {
        const userData = {
          username: registerForm.username,
          password: registerForm.password,
          phone: registerForm.phone,
          level: 'student'  // 注册权限固定为学生，教师账号由管理员创建
        }

        const response = await registerUser(userData)

        if (response && response.code === 201) {
          ElMessage.success('注册成功！请登录')
          Object.keys(registerForm).forEach(key => { registerForm[key] = '' })
          isLogin.value = true
          transitionName.value = 'slide-left'
        } else if (response && response.code === 400) {
          // 区分用户名还是手机号冲突
          const msg = response.message || '注册失败'
          if (msg.includes('用户名')) {
            errors.username = msg
          } else if (msg.includes('手机号')) {
            errors.phone = msg
          }
          ElMessage.error(msg)
        } else {
          ElMessage.error(response?.message || '注册失败')
        }
      } catch (error) {
        if (error.response?.data?.code === 400) {
          const msg = error.response.data.message || '注册失败'
          if (msg.includes('用户名')) errors.username = msg
          else if (msg.includes('手机号')) errors.phone = msg
          ElMessage.error(msg)
        } else {
          ElMessage.error(error.message || '注册失败')
        }
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

        // TODO: 调用后端发送验证码接口
        ElMessage.success('验证码已发送（模拟）')
        startCountdown('register')
      } catch (error) {
        ElMessage.error('网络错误，请稍后重试')
        console.error('发送验证码失败:', error)
      }
    }

    return {
      isLogin,
      rememberMe,
      agreeToTerms,
      isStudent,
      inputType,
      loginForm,
      registerForm,
      errors,
      switchMode,
      switchLoginType,
      handleUsernameInput,
      clearInput,
      handleLogin,
      handleRegister,
      sendVerificationCode,
      loginTypeTransition,
      transitionName,
      registerCountdown,
      showPassword
    }
  }
}
</script>

<template>
  <!-- 背景视频 -->
  <video
    class="bg-video"
    autoplay
    loop
    muted
    playsinline
    preload="auto"
  >
    <source src="/videos/home1.mp4" type="video/mp4">
    您的浏览器不支持视频播放
  </video>

  <!-- 登录页面容器 -->
  <div class="user-container">
    <div class="content-wrapper">
      <!-- 左侧区域 -->
      <div class="help-section">
        <div class="help-links">
          <router-link to="/Agreement" class="help-item">
            <svg-icon name="policy" :width="20" height="20"/>
            <span>用户协议</span>
          </router-link>
          <router-link to="/Policy" class="help-item">
            <svg-icon name="security" :width="20" height="20"/>
            <span>隐私政策</span>
          </router-link>
          <router-link to="/Help" class="help-item">
            <svg-icon name="service" :width="20" height="20"/>
            <span>帮助中心</span>
          </router-link>
          <router-link to="/Customer" class="help-item">
            <svg-icon name="contact_support" :width="20" height="20"/>
            <span>客服中心</span>
          </router-link>
          <router-link to="/Customer" class="help-item">
            <svg-icon name="forget" :width="20" height="20"/>
            <span>忘记密码</span>
          </router-link>
        </div>
      </div>

      <!-- 中间区域 -->
      <div class="box">
        <transition :name="transitionName" mode="out-in">

          <!-- 登录表单 -->
          <div class="login-box" v-if="isLogin" key="login">
            <!-- 二维码登录切换标签 -->
            <a class="qr-login-icon" @click="toggleLoginMethod">
              <svg-icon name="qr-code" :width="70" height="70"/>
            </a>

            <!-- 登录类型切换标签 -->
            <div class="login-header">
              <div class="login-tabs">
                <h2 :class="{ active: isStudent }" @click="switchLoginType(true)">学生登录</h2>
                <h2 :class="{ active: !isStudent }" @click="switchLoginType(false)">教师登录</h2>
              </div>
            </div>

            <!-- 登录表单容器 -->
            <div class="form-container">
              <transition :name="loginTypeTransition" mode="out-in">

                <!-- 学生登录表单 -->
                <form v-if="isStudent" key="student" @submit.prevent="handleLogin">
                  <div class="form-group">
                    <div class="input-wrapper">
                      <input
                          type="text"
                          v-model="loginForm.username"
                          @input="handleUsernameInput"
                          placeholder="手机号/邮箱/用户名"
                          required
                          pattern=".{3,}"
                          title="请输入用户名/手机号/邮箱">
                      <span class="clear-icon" @click="clearInput" v-if="loginForm.username || loginForm.password" title="清空账号和密码">✕</span>
                    </div>
                  </div>
                  <div class="form-group">
                    <div class="input-wrapper">
                      <input
                          :type="showPassword ? 'text' : 'password'"
                          v-model="loginForm.password"
                          placeholder="密码"
                          required
                          pattern=".{6,}"
                          title="密码至少 6 位">
                      <span class="toggle-password-icon" @click.stop="toggleShowPassword" :title="showPassword ? '隐藏密码' : '显示密码'">
                        <svg-icon v-if="showPassword" name="eye-open" :width="20" height="20"/>
                        <svg-icon v-else name="eye-close" :width="20" height="20"/>
                      </span>
                    </div>
                  </div>

                  <label class="checkbox-group">
                    <input type="checkbox" v-model="agreeToTerms">
                    <span class="custom-checkbox"></span>
                    <span class="checkbox-label">已阅读并同意<router-link to="/Agreement">用户协议</router-link>和<router-link to="/Policy">隐私政策</router-link></span>
                  </label>

                  <button type="submit" class="submit-btn">LOGIN IN</button>

                  <div class="other-login">
                    <p style="color: #ffffff;">其他登录方式</p>
                    <div class="login-methods">
                      <a href="#" class="method-item">
                        <img src="/logo/wechat.png" style="width: 45px" alt="微信登录">
                      </a>
                      <a href="#" class="method-item">
                        <img src="/logo/qq.png" style="width: 45px" alt="QQ登录">
                      </a>
                    </div>
                  </div>
                </form>

                <!-- 教师登录表单 -->
                <form v-else key="teacher" @submit.prevent="handleLogin">
                  <div class="form-group">
                    <div class="input-wrapper">
                      <input
                          type="text"
                          v-model="loginForm.username"
                          @input="handleUsernameInput"
                          placeholder="手机号/邮箱/用户名"
                          required
                          pattern=".{3,}"
                          title="请输入用户名/手机号/邮箱">
                      <span class="clear-icon" @click="clearInput" v-if="loginForm.username || loginForm.password" title="清空账号和密码">✕</span>
                    </div>
                  </div>
                  <div class="form-group">
                    <div class="input-wrapper">
                      <input
                          :type="showPassword ? 'text' : 'password'"
                          v-model="loginForm.password"
                          placeholder="密码"
                          required
                          pattern=".{6,}"
                          title="密码至少 6 位">
                      <span class="toggle-password-icon" @click.stop="toggleShowPassword" :title="showPassword ? '隐藏密码' : '显示密码'">
                        <svg-icon v-if="showPassword" name="eye-open" :width="20" height="20"/>
                        <svg-icon v-else name="eye-close" :width="20" height="20"/>
                      </span>
                    </div>
                  </div>

                  <label class="checkbox-group">
                    <input type="checkbox" v-model="agreeToTerms">
                    <span class="custom-checkbox"></span>
                    <span class="checkbox-label">已阅读并同意<router-link to="/Agreement">用户协议</router-link>和<router-link to="/Policy">隐私政策</router-link></span>
                  </label>

                  <button type="submit" class="submit-btn">LOGIN IN</button>

                  <div class="other-login">
                    <p style="color: #ffffff;">其他登录方式</p>
                    <div class="login-methods">
                      <a href="#" class="method-item">
                        <img src="/logo/wechat.png" style="width: 45px" alt="微信登录">
                      </a>
                      <a href="#" class="method-item">
                        <img src="/logo/qq.png" style="width: 45px" alt="QQ登录">
                      </a>
                    </div>
                  </div>
                </form>

              </transition>
            </div>
          </div>

          <!-- 注册表单 -->
          <div class="register-box" v-else key="register">
            <h2 style="color: rgb(255, 255, 255);">用户注册</h2>
            <form @submit.prevent="handleRegister">
              <div class="form-group">
                <input
                    type="text"
                    v-model="registerForm.username"
                    placeholder="用户名 (6-9 位字母数字)"
                    :class="{ 'error': errors.username }" required>
              </div>
              <div class="form-group">
                <input
                    type="password"
                    v-model="registerForm.password"
                    placeholder="密码 (6-12 位字母数字)"
                    :class="{ 'error': errors.password }" required>
              </div>
              <div class="form-group">
                <input
                    type="tel"
                    v-model="registerForm.phone"
                    placeholder="手机号"
                    :class="{ 'error': errors.phone }" required>
              </div>
              <label class="checkbox-group">
                <input type="checkbox" v-model="agreeToTerms">
                <span class="custom-checkbox"></span>
                <span class="checkbox-label">已阅读并同意<router-link to="/Agreement">用户协议</router-link>和<router-link to="/Policy">隐私政策</router-link></span>
              </label>
              <button type="submit" class="submit-btn">SIGN UP</button>
            </form>
          </div>

        </transition>
      </div>

      <!-- 右侧区域 -->
      <div class="right-section">
        <video
          class="right-bg-video"
          autoplay
          loop
          muted
          playsinline
          preload="auto"
        >
          <source src="/videos/home2.mp4" type="video/mp4">
          您的浏览器不支持视频播放
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
  position: relative;
  min-height: 560px;
}

.login-box, .register-box {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  box-sizing: border-box;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  text-align: center;
  z-index: 4;
}

.login-header {
  margin: 2rem 0;
}

.login-tabs {
  display: flex;
  justify-content: center;
  gap: 3rem;
}

.login-tabs h2 {
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  padding-bottom: 0.5rem;
}

.login-tabs h2.active {
  color: white;
}

.login-tabs h2.active::after {
  content: "";
  position: absolute;
  bottom: 0;
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
  margin-top: 1rem;
}

.method-item {
  width: 40px;
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
  gap: 1.5rem;
}

.help-item {
  color: white;
  text-decoration: none;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  padding: 0.8rem 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.help-item svg {
  flex-shrink: 0;
}

.help-item span {
  white-space: nowrap;
}

.help-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(8px);
  box-shadow: 2px 0 10px rgba(255, 255, 255, 0.1);
}

.checkbox-label a {
  color: #2370d5;
  text-decoration: none;
  margin: 0 3px;
  transition: all 0.3s ease;
}

.checkbox-label a:hover {
  text-decoration: underline;
  color: #4a90e2;
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
  min-height: 560px;
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
  z-index: 10; /* 提高层级，确保在视频上方 */
  text-align: center;
  color: #ffffff;
  text-shadow: 0 0 2px hsl(198, 87%, 3%), 0 0 2px hsl(0, 0%, 100%), 0 0 2px hsl(198, 87%, 3%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  padding: 2rem;
  pointer-events: none; /* 让点击事件穿透到下层，但按钮需要单独设置 */

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
  pointer-events: auto; /* 恢复按钮的点击事件 */
}

.switch-mode-btn:hover {
  background: rgba(255, 255, 255, 0.34);
}

/************************************************************
 * 输入表单样式
 ************************************************************/
.form-group {
  margin: 0 3rem;
  position: relative;
  min-height: 80px;
}

/* 输入框包装器 */
.input-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
}

/* 清空图标样式 */
.clear-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.5);
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
}

.clear-icon:hover {
  color: rgba(255, 255, 255, 0.9);
  transform: translateY(-50%) scale(1.1);
}

/* 密码切换图标样式 */
.toggle-password-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.toggle-password-icon:hover {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-50%) scale(1.05);
}

.toggle-password-icon svg {
  display: block;
  margin: 0 auto;
}

input {
  width: 100%;
  padding: 1rem;
  padding-right: 3rem;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  font-size: 0.9rem;
  transition: all 0.5s ease;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.09);
  box-shadow: 0 3px 10px 1px rgba(255, 255, 255, 0.32);
}

/* input 在 error 状态下高亮边框 */
input.error {
  border-color: rgba(255, 107, 107, 0.6) !important;
  box-shadow: 0 0 0 2px rgba(255, 107, 107, 0.15);
}

/* input 在 error 状态下高亮边框 */
input.error {
  border-color: rgba(255, 107, 107, 0.6) !important;
  box-shadow: 0 0 0 2px rgba(255, 107, 107, 0.15);
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
 * 复选框样式
 ************************************************************/
.checkbox-group {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding-left: 13px;
  margin: 0 1rem;       /* 覆盖原来的 margin: 1rem，稍微收紧给错误留空间 */
  position: relative;
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
 * 过渡动画效果
 ************************************************************/
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(40px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-40px);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-40px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(40px);
}

.fade-left-enter-active,
.fade-left-leave-active,
.fade-right-enter-active,
.fade-right-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-left-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-left-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.fade-right-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.fade-right-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

/************************************************************
 * 响应式布局
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
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
  }

  .help-item {
    width: auto;
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }

  .user-container {
    padding: 5vh 5%;
  }

  .content-wrapper {
    flex-direction: column;
    gap: 2rem;
    padding: 2rem;
  }

  .box {
    order: 2;
    width: 100% !important;
    min-width: auto;
    padding: 0;
    position: relative;
    min-height: 500px;
  }

  .login-header h2 {
    font-size: 1.5rem;
  }

  .qr-login-icon {
    display: none;
  }

  input {
    width: 100% !important;
    padding: 1rem;
    padding-right: 2.5rem;
    font-size: 16px;
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