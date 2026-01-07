import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录 - PLM全息系统' }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { title: '全息仪表盘 - PLM系统', requiresAuth: true }
  },
  {
    path: '/product',
    name: 'Product',
    component: () => import('@/components/Layout/index.vue'),
    meta: { requiresAuth: true },
    redirect: '/product/management',
    children: [
      {
        path: 'management',
        name: 'ProductManagement',
        component: () => import('@/views/Product/Management.vue'),
        meta: { title: '产品管理中心 - PLM系统' }
      },
      {
        path: 'design',
        name: 'ProductDesign',
        component: () => import('@/views/Product/Design.vue'),
        meta: { title: '产品设计 - PLM系统' }
      },
      {
        path: 'lifecycle',
        name: 'ProductLifecycle',
        component: () => import('@/views/Product/Lifecycle.vue'),
        meta: { title: '生命周期管理 - PLM系统' }
      },
      {
        path: 'bom',
        name: 'ProductBOM',
        component: () => import('@/views/Product/BOM.vue'),
        meta: { title: 'BOM管理 - PLM系统' }
      },
      {
        path: 'version',
        name: 'ProductVersion',
        component: () => import('@/views/Product/Version.vue'),
        meta: { title: '版本控制 - PLM系统' }
      }
    ]
  },
  {
    path: '/engineering',
    name: 'Engineering',
    component: () => import('@/components/Layout/index.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'change',
        name: 'EngineeringChange',
        component: () => import('@/views/Engineering/Change.vue'),
        meta: { title: '工程变更 - PLM系统' }
      },
      {
        path: 'workflow',
        name: 'EngineeringWorkflow',
        component: () => import('@/views/Engineering/Workflow.vue'),
        meta: { title: '工作流程 - PLM系统' }
      },
      {
        path: 'collaboration',
        name: 'EngineeringCollaboration',
        component: () => import('@/views/Engineering/Collaboration.vue'),
        meta: { title: '协同设计 - PLM系统' }
      }
    ]
  },
  {
    path: '/manufacturing',
    name: 'Manufacturing',
    component: () => import('@/components/Layout/index.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'process',
        name: 'ManufacturingProcess',
        component: () => import('@/views/Manufacturing/Process.vue'),
        meta: { title: '制造工艺 - PLM系统' }
      },
      {
        path: 'resource',
        name: 'ManufacturingResource',
        component: () => import('@/views/Manufacturing/Resource.vue'),
        meta: { title: '制造资源 - PLM系统' }
      },
      {
        path: 'planning',
        name: 'ManufacturingPlanning',
        component: () => import('@/views/Manufacturing/Planning.vue'),
        meta: { title: '生产计划 - PLM系统' }
      }
    ]
  },
  {
    path: '/quality',
    name: 'Quality',
    component: () => import('@/components/Layout/index.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'control',
        name: 'QualityControl',
        component: () => import('@/views/Quality/Control.vue'),
        meta: { title: '质量控制 - PLM系统' }
      },
      {
        path: 'inspection',
        name: 'QualityInspection',
        component: () => import('@/views/Quality/Inspection.vue'),
        meta: { title: '质量检验 - PLM系统' }
      },
      {
        path: 'analysis',
        name: 'QualityAnalysis',
        component: () => import('@/views/Quality/Analysis.vue'),
        meta: { title: '质量分析 - PLM系统' }
      }
    ]
  },
  {
    path: '/document',
    name: 'Document',
    component: () => import('@/components/Layout/index.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'management',
        name: 'DocumentManagement',
        component: () => import('@/views/Document/Management.vue'),
        meta: { title: '文档管理 - PLM系统' }
      },
      {
        path: 'template',
        name: 'DocumentTemplate',
        component: () => import('@/views/Document/Template.vue'),
        meta: { title: '文档模板 - PLM系统' }
      },
      {
        path: 'approval',
        name: 'DocumentApproval',
        component: () => import('@/views/Document/Approval.vue'),
        meta: { title: '文档审批 - PLM系统' }
      }
    ]
  },
  {
    path: '/analytics',
    name: 'Analytics',
    component: () => import('@/components/Layout/index.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'performance',
        name: 'AnalyticsPerformance',
        component: () => import('@/views/Analytics/Performance.vue'),
        meta: { title: '性能分析 - PLM系统' }
      },
      {
        path: 'cost',
        name: 'AnalyticsCost',
        component: () => import('@/views/Analytics/Cost.vue'),
        meta: { title: '成本分析 - PLM系统' }
      },
      {
        path: 'trend',
        name: 'AnalyticsTrend',
        component: () => import('@/views/Analytics/Trend.vue'),
        meta: { title: '趋势分析 - PLM系统' }
      }
    ]
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/components/Layout/index.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'system',
        name: 'SystemSettings',
        component: () => import('@/views/Settings/System.vue'),
        meta: { title: '系统设置 - PLM系统' }
      },
      {
        path: 'user',
        name: 'UserSettings',
        component: () => import('@/views/Settings/User.vue'),
        meta: { title: '用户管理 - PLM系统' }
      },
      {
        path: 'security',
        name: 'SecuritySettings',
        component: () => import('@/views/Settings/Security.vue'),
        meta: { title: '安全设置 - PLM系统' }
      }
    ]
  },
  {
    path: '/404',
    name: '404',
    component: () => import('@/views/404.vue'),
    meta: { title: '页面未找到 - PLM系统' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title
  }
  
  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('plm_token')
    if (!token) {
      next('/login')
      return
    }
  }
  
  // 触发全息扫描效果
  setTimeout(() => {
    window.holographicDataLoad()
  }, 100)
  
  next()
})

router.afterEach((to, from) => {
  // 路由切换后的处理
  console.log(`🌟 全息导航: ${from.path} -> ${to.path}`)
})

export default router
