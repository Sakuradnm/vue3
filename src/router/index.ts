import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/home/index.vue'
import Users from '@/views/users/index.vue'
import Models from '@/views/Models/models.vue'

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
import Repair from "@/views/Service/repair/index.vue";

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
        path: '/Models',
        name: 'Models',
        component: Models
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
    {
        path: '/Repair',
        name: 'Repair',
        component: Repair
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior() {
        return { top: 0 }
    }
})

export default router

