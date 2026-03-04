import { createRouter, createWebHistory } from 'vue-router'
import OrderEntry from '../pages/order-entry/index.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../App.vue')
    },
    {
      path: '/order-entry',
      name: 'orderEntry',
      component: OrderEntry
    }
  ]
})

export default router
