import Layout from '@/layout/index.vue'

export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index.vue'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '首页', icon: 'House', affix: true }
      }
    ]
  },
  {
    path: '/order-entry',
    component: Layout,
    children: [
      {
        path: '',
        name: 'OrderEntry',
        component: () => import('@/views/order-entry/index.vue'),
        meta: { title: '录单', icon: 'EditPen' }
      },
      {
        path: 'antigravity',
        name: 'OrderEntryAntigravity',
        component: () => import('@/views/order-entry/antigravity/index.vue'),
        meta: { title: '录单antigravity', icon: 'EditPen' }
      }
    ]
  },

  {
    path: '/operation-transport',
    component: Layout,
    children: [
      {
        path: '',
        name: 'OperationTransport',
        component: () => import('@/views/dashboard/index.vue'), // Mock component
        meta: { title: '运营运输管理', icon: 'Van' }
      }
    ]
  },
  {
    path: '/management-center',
    component: Layout,
    redirect: '/management-center/batch-order-entry',
    children: [
      {
        path: '',
        name: 'ManagementCenter',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '经营管理中心', icon: 'DataBoard' }
      },
      {
        path: 'batch-order-entry',
        name: 'BatchOrderEntry',
        component: () => import('@/views/batch-order-entry/index.vue'),
        meta: { title: '批量录单', icon: 'Tickets' }
      }
    ]
  },
  {
    path: '/operation-management',
    component: Layout,
    children: [
      {
        path: '',
        name: 'OperationManagement',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '运营操作管理', icon: 'Operation' }
      }
    ]
  },
  {
    path: '/finance-management',
    component: Layout,
    children: [
      {
        path: '',
        name: 'FinanceManagement',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '财务管理', icon: 'Wallet' }
      }
    ]
  },
  {
    path: '/tianshu-monitor',
    component: Layout,
    children: [
      {
        path: '',
        name: 'TianshuMonitor',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '天枢设备监控', icon: 'VideoCamera' }
      }
    ]
  },
  {
    path: '/basic-management',
    component: Layout,
    children: [
      {
        path: '',
        name: 'BasicManagement',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '基础管理', icon: 'Setting' }
      }
    ]
  },
  {
    path: '/tianyi-bigdata',
    component: Layout,
    children: [
      {
        path: '',
        name: 'TianyiBigdata',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '天易大数据平台', icon: 'DataAnalysis' }
      }
    ]
  },
  {
    path: '/service-quality',
    component: Layout,
    redirect: '/service-quality/quality-control-workbench',
    meta: { title: '服务质量', icon: 'Headset' },
    children: [
      {
        path: 'quality-control-workbench',
        name: 'QualityControlWorkbench',
        component: () => import('@/views/service-quality/quality-control-workbench/index.vue'),
        meta: { title: '品控工作台', icon: 'Headset' }
      },
      {
        path: 'quality-control-dashboard',
        name: 'QualityControlDashboard',
        component: () => import('@/views/service-quality/quality-control-dashboard/index.vue'),
        meta: { title: '品控数据看板', icon: 'DataBoard' }
      },
      {
        path: 'quality-control-dashboard/detail',
        name: 'QualityControlDashboardDetail',
        component: () => import('@/views/service-quality/quality-control-dashboard/detail.vue'),
        meta: { title: '品控异常明细', icon: 'Document' },
        hidden: true
      }
    ]
  },
  {
    path: '/data-analysis',
    component: Layout,
    redirect: '/data-analysis/province-flow-dashboard',
    meta: { title: '数据分析', icon: 'DataAnalysis' },
    children: [
      {
        path: 'province-flow-dashboard',
        name: 'ProvinceFlowDashboard',
        component: () => import('@/views/data-analysis/province-flow-dashboard/index.vue'),
        meta: { title: '省份流向仪表盘', icon: 'TrendCharts' }
      },
      {
        path: 'data-dashboard',
        name: 'DataDashboard',
        component: () => import('@/views/data-analysis/data-dashboard/index.vue'),
        meta: { title: '数据看板', icon: 'DataBoard' }
      },
      {
        path: 'smart-subscription',
        name: 'SmartSubscription',
        component: () => import('@/views/data-analysis/smart-subscription/index.vue'),
        meta: { title: '问数订阅', icon: 'Notification' }
      }
    ]
  },

  {
    path: '/smart-chat',
    component: Layout,
    redirect: '/smart-chat',
    meta: { title: '智能对话', icon: 'ChatDotRound' },
    children: [
      {
        path: '',
        name: 'SmartChat',
        component: () => import('@/views/smart-chat/index.vue'),
        meta: { title: '智能对话', icon: 'ChatDotRound' }
      }
    ]
  },
  {
    path: '/system-management',
    component: Layout,
    redirect: '/system-management/skill-permission-management',
    meta: { title: '系统管理', icon: 'Setting' },
    children: [
      {
        path: 'skill-permission-management',
        name: 'SkillPermissionManagement',
        component: () => import('@/views/skill-permission-management/index.vue'),
        meta: { title: 'SKILL权限管理', icon: 'Lock' }
      }
    ]
  },
  {
    path: '/chat',
    component: Layout,
    redirect: '/chat',
    meta: { title: '问数对话', icon: 'ChatLineSquare' },
    children: [
      {
        path: '',
        name: 'Chat',
        component: () => import('@/views/chat/index.vue'),
        meta: { title: '问数对话', icon: 'ChatLineSquare' }
      }
    ]
  },
  {
    path: '/rule-config',
    component: Layout,
    redirect: '/rule-config',
    meta: { title: '规则配置中心', icon: 'Settings' },
    children: [
      {
        path: '',
        name: 'RuleConfig',
        component: () => import('@/views/rule-config/index.vue'),
        meta: { title: '规则配置中心', icon: 'Settings' }
      },
      {
        path: 'builder',
        name: 'RuleBuilder',
        component: () => import('@/views/rule-config/builder.vue'),
        meta: { title: '规则构建器', icon: 'Puzzle' }
      },
      {
        path: 'ai',
        name: 'RuleAI',
        component: () => import('@/views/rule-config/ai.vue'),
        meta: { title: '智能配置助手', icon: 'MessageRobot' }
      },
      {
        path: 'template',
        name: 'RuleTemplate',
        component: () => import('@/views/rule-config/template.vue'),
        meta: { title: '模板中心', icon: 'Layout' }
      },
      {
        path: 'test',
        name: 'RuleTest',
        component: () => import('@/views/rule-config/test.vue'),
        meta: { title: '模拟测试', icon: 'Play' }
      }
    ]
  },
  {
    path: '/logistics-warning',
    component: Layout,
    redirect: '/logistics-warning/dashboard',
    meta: { title: '物流策略预警平台', icon: 'Warning' },
    children: [
      {
        path: 'dashboard',
        name: 'LogisticsWarningDashboard',
        component: () => import('@/views/logistics-warning/index.vue'),
        meta: { title: '时效与流转监控', icon: 'Odometer' }
      }
    ]
  }
]
