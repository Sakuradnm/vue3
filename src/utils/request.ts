import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'

// 创建 axios 实例
const service: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
    timeout: 15000
})

// 请求拦截器
service.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        console.error('请求错误:', error)
        return Promise.reject(error)
    }
)

// 响应拦截器
service.interceptors.response.use(
    (response: AxiosResponse) => {
        const res = response.data

        // 如果是数组，直接返回（后端直接返回数据）
        if (Array.isArray(res)) {
            return res
        }

        // 如果是对象且包含 code 字段（统一格式）
        if (res && typeof res === 'object' && res.code !== undefined) {
            if (res.code !== 200 && res.code !== 201) {
                ElMessage.error(res.message || '请求失败')
                return Promise.reject(new Error(res.message || '请求失败'))
            }
            return res.data !== undefined ? res.data : res
        }
        
        // 其他情况直接返回
        return res
    },
    (error) => {
        console.error('响应错误:', error)

        if (error.response) {
            const status = error.response.status
            const message = error.response.data?.message || error.response.data?.msg || '请求失败'
            
            switch (status) {
                case 401:
                    ElMessage.error('未授权，请重新登录')
                    break
                case 403:
                    ElMessage.error('拒绝访问')
                    break
                case 404:
                    ElMessage.error('请求的资源不存在')
                    break
                case 500:
                    ElMessage.error('服务器内部错误')
                    break
                default:
                    ElMessage.error(message)
            }
        } else if (error.message) {
            console.error('网络错误:', error.message)
            ElMessage.error('网络错误，请稍后重试')
        }

        return Promise.reject(error)
    }
)

export default service
