//引入全局样式
import './styles/global.css'

//路由
import { createApp } from 'vue'
import App from './App.vue'
import router from "./router"
//svg图标
import SvgIcon from '@/components/SvgIcon/index.vue'
import 'virtual:svg-icons-register'
// 导入 Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

const app = createApp(App)

app.use(router)
app.use(ElementPlus, { locale: zhCn })
app.component('SvgIcon', SvgIcon)

// 全局错误处理 - 捕获 Vue 组件错误
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue error:', err, info)
}

// 忽略第三方脚本错误
window.addEventListener('error', (event) => {
  if (event.target?.src?.includes('cdnjtzy') || 
      event.target?.src?.includes('aegis') ||
      event.target?.src?.includes('rumt')) {
    event.preventDefault()
    console.warn('Ignored third-party script error:', event.filename)
  } else {
    console.error('Global error:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack
    })
  }
})

// 捕获 Promise 拒绝错误
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
})

app.mount('#app')

