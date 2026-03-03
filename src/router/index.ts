import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home/index.vue'
import Users from '@/views/Users/index.vue'

import Brand from "@/views/brand/index.vue";
import Reserve from "@/views/Reserve/index.vue"
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
        path: '/Reserve',
        name: 'Reserve',
        component: Reserve
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

]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior() {
        return { top: 0 }
    }
})

export default router

