import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../AppNew.vue'),
      meta: { title: '首页' }
    },
    {
      path: '/order-entry',
      name: 'orderEntry',
      component: () => import('../pages/order-entry/index.vue'),
      meta: { title: '录单' }
    }
  ]
})

export default router
