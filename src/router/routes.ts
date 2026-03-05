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
    children: [
      {
        path: '',
        name: 'ServiceQuality',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '服务质量', icon: 'Headset' }
      }
    ]
  },
  {
    path: '/order-management',
    component: Layout,
    redirect: '/order-management/outbound-waybill',
    meta: { title: '订单管理', icon: 'Document' },
    children: [
      {
        path: 'outbound-waybill',
        name: 'OutboundWaybill',
        component: () => import('@/views/order-management/outbound-waybill/index.vue'),
        meta: { title: '寄件运单管理', icon: 'Document' }
      }
    ]
  }
]
