//引入全局样式
import './styles/global.css'

//路由
import { createApp } from 'vue'
import App from './App.vue'
import router from "./router";
//svg图标
import SvgIcon from '@/components/SvgIcon/index.vue'
import 'virtual:svg-icons-register'

const app = createApp(App)

app.use(router)
app.component('SvgIcon', SvgIcon)
app.mount('#app')

