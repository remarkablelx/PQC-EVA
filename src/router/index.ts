import { createRouter, createWebHistory } from 'vue-router'
import MainView from '../views/MainView.vue'
import WelcomeView from '../views/WelcomeView.vue'

const ComparisonView = () => import('../views/ComparisonView.vue')
const RealDataView = () => import('../views/RealDataView.vue')
const LiveDemoView = () => import('../views/LiveDemoView.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'welcome',
      component: WelcomeView,
      meta: {
        title: 'PQC-EVA',
      },
    },
    {
      path: '/main',
      name: 'main',
      component: MainView,
    },
    {
      path: '/comparison',
      name: 'comparison',
      component: ComparisonView,
      meta: {
        title: 'PQC-EVA | 算法对比分析',
      },
    },
    {
      path: '/real-data',
      name: 'real-data',
      component: RealDataView,
      meta: {
        title: 'PQC-EVA | 真实数据流',
      },
    },
    {
      path: '/livedemo',
      name: 'livedemo',
      component: LiveDemoView,
      meta: {
        title: 'PQC-EVA | 交互式演示',
      },
    },
  ],
})

router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title as string
  } else {
    document.title = 'PQC-EVA | 交互式后量子计算密码可视分析系统'
  }
  next()
})

export default router
