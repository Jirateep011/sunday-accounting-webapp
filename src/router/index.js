import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../components/Dashboard.vue'
import Income from '../components/Income.vue'
import Expenses from '../components/Expenses.vue'
import CloudPocket from '../components/CloudPocket.vue'
import Analyze from '../components/Analyze.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/income',
    name: 'Income',
    component: Income
  },
  {
    path: '/expenses',
    name: 'Expenses',
    component: Expenses
  },
  {
    path: '/cloudpocket',
    name: 'CloudPocket',
    component: CloudPocket
  },
  {
    path: '/analyze',
    name: 'Analyze',
    component: Analyze
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router