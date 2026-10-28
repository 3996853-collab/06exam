import { match, pinyin } from 'pinyin-pro'
import type { MenuItem } from '@/store/modules/favoriteMenu'

// 系统完整菜单树结构（包含分组与子路由项）
export const fullMenuTree: MenuItem[] = [
  {
    id: 'group_biz',
    name: '业务功能',
    path: '/biz',
    icon: 'Briefcase',
    children: [
      { id: 'order-entry', name: '录单', path: '/order-entry', icon: 'EditPen' },
      { id: 'batch-order', name: '批量录单', path: '/management-center/batch-order-entry', icon: 'Tickets' },
      { id: 'order-antigravity', name: '录单antigravity', path: '/order-entry/antigravity', icon: 'EditPen' },
      { id: 'receipt-ocr', name: '回单识别', path: '/receipt-ocr', icon: 'DocumentChecked' }
    ]
  },
  {
    id: 'group_quality',
    name: '服务质量',
    path: '/service-quality',
    icon: 'Headset',
    children: [
      { id: 'quality-workbench', name: '品控工作台', path: '/service-quality/quality-control-workbench', icon: 'Headset' },
      { id: 'quality-dashboard', name: '品控数据看板', path: '/service-quality/quality-control-dashboard', icon: 'DataBoard' }
    ]
  },
  {
    id: 'group_data',
    name: '数据分析',
    path: '/data-analysis',
    icon: 'DataAnalysis',
    children: [
      { id: 'flow-dashboard', name: '省份流向仪表盘', path: '/data-analysis/province-flow-dashboard', icon: 'TrendCharts' },
      { id: 'smart-chat', name: '智能对话', path: '/smart-chat', icon: 'ChatDotRound' },
      { id: 'mobile-dashboard', name: '移动看板', path: '/mobile-dashboard', icon: 'Cellphone' },
      { id: 'chat-query', name: '问数对话', path: '/chat', icon: 'ChatLineSquare' },
      { id: 'smart-subscription', name: '问数订阅', path: '/data-analysis/smart-subscription', icon: 'Notification' }
    ]
  },
  {
    id: 'group_warning',
    name: '预警配置',
    path: '/warning-rules',
    icon: 'Warning',
    children: [
      { id: 'rule-config', name: '规则配置中心', path: '/rule-config', icon: 'Setting' },
      { id: 'rule-builder', name: '规则构建器', path: '/rule-config/builder', icon: 'SetUp' },
      { id: 'rule-ai', name: '智能配置助手', path: '/rule-config/ai', icon: 'MagicStick' },
      { id: 'rule-template', name: '模板中心', path: '/rule-config/template', icon: 'CollectionTag' },
      { id: 'warning-dashboard', name: '物流策略预警平台', path: '/logistics-warning/dashboard', icon: 'Warning' },
      { id: 'cold-chain', name: '配送运营看板', path: '/cold-chain-dashboard', icon: 'Van' }
    ]
  },
  {
    id: 'group_system',
    name: '系统管理',
    path: '/system-management',
    icon: 'Setting',
    children: [
      { id: 'skill-permission', name: 'SKILL权限管理', path: '/system-management/skill-permission-management', icon: 'Lock' },
      { id: 'dashboard-config', name: '看板配置管理', path: '/dashboard-config', icon: 'PieChart' }
    ]
  },
  {
    id: 'group_operations',
    name: '运营运输',
    path: '/operation-transport',
    icon: 'Van',
    children: [
      { id: 'op-transport', name: '运营运输管理', path: '/operation-transport', icon: 'Van' },
      { id: 'op-management', name: '运营操作管理', path: '/operation-management', icon: 'Operation' },
      { id: 'finance-mgmt', name: '财务管理', path: '/finance-management', icon: 'Wallet' },
      { id: 'tianshu-monitor', name: '天枢设备监控', path: '/tianshu-monitor', icon: 'VideoCamera' },
      { id: 'tianyi-bigdata', name: '天易大数据平台', path: '/tianyi-bigdata', icon: 'DataAnalysis' },
      { id: 'basic-mgmt', name: '基础管理', path: '/basic-management', icon: 'FolderOpened' }
    ]
  }
]

// 扁平化的叶子节点（带分类名称与拼音预生成）
export interface FlatMenuItem extends MenuItem {
  category: string
  pinyinText: string
  firstLetter: string
}

export const flatLeafMenuItems: FlatMenuItem[] = (() => {
  const list: FlatMenuItem[] = []
  
  function traverse(items: MenuItem[], parentName = '') {
    for (const item of items) {
      if (item.children && item.children.length > 0) {
        traverse(item.children, item.name)
      } else {
        const fullPy = pinyin(item.name, { toneType: 'none', type: 'array' }).join('')
        const firstLetters = pinyin(item.name, { pattern: 'first', toneType: 'none', type: 'array' }).join('')
        list.push({
          ...item,
          category: parentName || '其它',
          pinyinText: fullPy.toLowerCase(),
          firstLetter: firstLetters.toLowerCase()
        })
      }
    }
  }

  traverse(fullMenuTree)
  return list
})()

// 搜索匹配结果类型
export interface SearchResultItem extends FlatMenuItem {
  matchedIndices: number[] // 匹配的字符索引（用于高亮）
}

// 模糊匹配 & 拼音匹配搜索
export function searchMenuItems(keyword: string): SearchResultItem[] {
  if (!keyword || !keyword.trim()) return []

  const query = keyword.trim().toLowerCase()
  const results: SearchResultItem[] = []

  for (const item of flatLeafMenuItems) {
    const nameLower = item.name.toLowerCase()
    
    // 1. 直接中文/字符包含匹配
    if (nameLower.includes(query)) {
      const start = nameLower.indexOf(query)
      const indices: number[] = []
      for (let i = 0; i < query.length; i++) {
        indices.push(start + i)
      }
      results.push({ ...item, matchedIndices: indices })
      continue
    }

    // 2. pinyin-pro 智能匹配（首字母与全拼）
    try {
      const matchIndices = match(item.name, query)
      if (matchIndices && matchIndices.length > 0) {
        results.push({ ...item, matchedIndices: matchIndices })
        continue
      }
    } catch {
      // 容错处理
    }

    // 3. 拼音首字母匹配 (如 pkgz -> 品控工作台)
    if (item.firstLetter.includes(query)) {
      const start = item.firstLetter.indexOf(query)
      const indices: number[] = []
      for (let i = 0; i < query.length; i++) {
        indices.push(start + i)
      }
      results.push({ ...item, matchedIndices: indices })
      continue
    }

    // 4. 全拼连续匹配
    if (item.pinyinText.includes(query)) {
      results.push({ ...item, matchedIndices: [0] })
    }
  }

  return results
}
