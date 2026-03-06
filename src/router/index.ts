import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
//菜单选项
import Home from '@/views/Home/index.vue'
//菜单 - 课程
import Course from "@/views/Course/index.vue"
import CourseContent from "@/views/Course/Content/Content.vue"

import Upload from "@/views/Upload/index.vue"
import Forum from "@/views/Forum/index.vue"
import Brand from "@/views/Brand/index.vue";
import Search from "@/views/Search/index.vue";
import Users from '@/views/Users/index.vue'

// 帮助
import Agreement from "@/views/HelpSection/agreement.vue";
import Policy from "@/views/HelpSection/policy.vue";
import Help from "@/views//HelpSection/help.vue";
import Customer from "@/views/HelpSection/customer.vue";

// 服务
import AfterSales from "@/views/Service/aftersales/index.vue";
import Finance from "@/views/Service/finance/index.vue";
import Maintenance from "@/views/Service/maintenance/index.vue";

//车型
import Ultra from "@/views/Models/Ultra/index.vue";
import Supra from "@/views/Models/Supra/index.vue";
import Brz  from "@/views/Models/Brz/index.vue";
import Gtr from "@/views/Models/Gtr/index.vue";
import Hellcat from "@/views/Models/Dodge/index.vue";

// 用户相关
import PersonalCenter from '@/views/Users/PersonalCenter/PersonalCenter.vue'
import PersonalCourse from '@/views/Users/PersonalCourse/PersonalCourse.vue'
import Notice from '@/views/Users/Notice/Notice.vue'

// 管理员后台（待设计）
import AdminDashboard from '@/views/Admin/Dashboard.vue'

const routes = [
    {
        path: '/',
        redirect: '/Home'
    },
    {
        path: '/Home',
        name: 'Home',
        component: Home
    },
    {
        path: '/Brand',
        name: 'Brand',
        component: Brand
    },
    {
        path: '/Users',
        name: 'Users',
        component: Users
    },
    {
        path: '/Forum',
        name: 'Forum',
        component: Forum
    },
    {
        path: '/Agreement',
        name: 'Agreement',
        component: Agreement
    },
    {
        path: '/Policy',
        name: 'Policy',
        component: Policy
    },
    {
        path: '/Help',
        name: 'Help',
        component: Help
    },
    {
        path: '/Customer',
        name: 'Customer',
        component: Customer
    },


    //  服务
    {
        path: '/AfterSales',
        name: 'AfterSales',
        component: AfterSales
    },
    {
        path: '/Finance',
        name: 'Finance',
        component: Finance
    },

    {
        path: '/Maintenance',
        name: 'Maintenance',
        component: Maintenance
    },

    //车型
    {
        path: '/Ultra',
        name: 'Ultra',
        component: Ultra
    },
    {
        path: '/Supra',
        name: 'Supra',
        component: Supra
    },
    {
        path: '/Brz',
        name: 'Brz',
        component: Brz
    },
    {
        path: '/Gtr',
        name: 'Gtr',
        component: Gtr
    },
    {
        path: '/Hellcat',
        name: 'Hellcat',
        component: Hellcat
    },
    {
        path: '/Search',
        name: 'Search',
        component: Search
    },
    {
        path: '/Course',
        name: 'Course',
        component: Course
    },
    {
        path: '/course/:id',
        name: 'CourseDetail',
        component: CourseContent
    },
    {
        path: '/course/:id/learn',
        name: 'CourseLearn',
        component: CourseContent
    },
    {
        path: '/Upload',
        name: 'Upload',
        component: Upload
    },
    {
        path: '/PersonalCenter',
        name: 'PersonalCenter',
        component: PersonalCenter,
        meta: { requiresAuth: true }
    },
    {
        path: '/PersonalCourse',
        name: 'PersonalCourse',
        component: PersonalCourse,
        meta: { requiresAuth: true }
    },
    {
        path: '/Notice',
        name: 'Notice',
        component: Notice,
        meta: { requiresAuth: true }
    },
    {
        path: '/Admin',
        name: 'AdminDashboard',
        component: AdminDashboard,
        meta: { requiresAuth: true, requiresAdmin: true }
    },
    // 捕获第三方脚本的路由请求
    {
        path: '/hybridaction/:actionName',
        name: 'HybridAction',
        component: { template: '' },
        beforeEnter: (to, from, next) => {
            // 直接拒绝第三方脚本的路由请求
            next(false)
        }
    },

]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior() {
        return { top: 0 }
    }
})

// 路由守卫
router.beforeEach((to, from, next) => {
    const userInfoStr = localStorage.getItem('userInfo')
    
    if (to.meta.requiresAuth && !userInfoStr) {
        next('/Users')
        return
    }
    
    // 检查是否需要管理员权限
    if (to.meta.requiresAdmin) {
        const userInfo = JSON.parse(userInfoStr || '{}')
        if (userInfo.level !== 'admin') {
            ElMessage.error('无权访问，需要管理员权限')
            next('/Home')
            return
        }
    }
    
    next()
})

export default router

