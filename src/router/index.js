import { createRouter, createWebHistory } from 'vue-router'

const base = window.__POWERED_BY_QIANKUN__ ? '/screen' : '/'

const router = createRouter({
  history: createWebHistory(base),
  routes: [
   {
      path: '/',
      name: 'screen',
      component: () => import('@/views/Index.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

export default router