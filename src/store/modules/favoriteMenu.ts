import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'

export interface MenuItem {
  id: string
  name: string
  path: string
  icon?: string
  children?: MenuItem[]
  permission?: string
  groupTitle?: string
}

export interface FavoriteItem {
  id: string
  menuId: string
  title: string
  path: string
  icon?: string
  sortOrder: number
}

const STORAGE_PREFIX = 'zto_sidebar_favorites_v1_'
const CURRENT_ORG_KEY = 'zto_sidebar_current_org'
const MAX_FAVORITES = 15

// 预设不同组织的默认收藏数据，展示组织强隔离与初始状态
const DEFAULT_ORG_FAVORITES: Record<string, FavoriteItem[]> = {
  '总部': [
    { id: 'fav_1', menuId: 'order-entry', title: '录单', path: '/order-entry', icon: 'EditPen', sortOrder: 0 },
    { id: 'fav_2', menuId: 'quality-workbench', title: '品控工作台', path: '/service-quality/quality-control-workbench', icon: 'Headset', sortOrder: 1 },
    { id: 'fav_3', menuId: 'flow-dashboard', title: '省份流向仪表盘', path: '/data-analysis/province-flow-dashboard', icon: 'TrendCharts', sortOrder: 2 },
    { id: 'fav_4', menuId: 'rule-config', title: '规则配置中心', path: '/rule-config', icon: 'Setting', sortOrder: 3 },
    { id: 'fav_5', menuId: 'smart-chat', title: '智能对话', path: '/smart-chat', icon: 'ChatDotRound', sortOrder: 4 }
  ],
  '广西平南网点': [
    { id: 'fav_pn_1', menuId: 'order-entry', title: '录单', path: '/order-entry', icon: 'EditPen', sortOrder: 0 },
    { id: 'fav_pn_2', menuId: 'batch-order', title: '批量录单', path: '/management-center/batch-order-entry', icon: 'Tickets', sortOrder: 1 },
    { id: 'fav_pn_3', menuId: 'receipt-ocr', title: '回单识别', path: '/receipt-ocr', icon: 'DocumentChecked', sortOrder: 2 },
    { id: 'fav_pn_4', menuId: 'mobile-dashboard', title: '移动看板', path: '/mobile-dashboard', icon: 'Cellphone', sortOrder: 3 }
  ],
  '长春分拨中心': [
    { id: 'fav_cc_1', menuId: 'flow-dashboard', title: '省份流向仪表盘', path: '/data-analysis/province-flow-dashboard', icon: 'TrendCharts', sortOrder: 0 },
    { id: 'fav_cc_2', menuId: 'cold-chain', title: '配送运营看板', path: '/cold-chain-dashboard', icon: 'Van', sortOrder: 1 },
    { id: 'fav_cc_3', menuId: 'warning-dashboard', title: '物流策略预警平台', path: '/logistics-warning/dashboard', icon: 'Warning', sortOrder: 2 }
  ]
}

export const useFavoriteMenuStore = defineStore('favoriteMenu', {
  state: () => {
    const savedOrg = localStorage.getItem(CURRENT_ORG_KEY) || '总部'
    return {
      currentOrg: savedOrg,
      // 默认状态：页面初始加载、刷新或组织切换后，默认高亮并展示【我的收藏】
      activeTab: 'favorites' as 'favorites' | 'all',
      // 上次所处的分栏（搜索清空时恢复上下文）
      previousTab: 'favorites' as 'favorites' | 'all',
      searchKeyword: '',
      // 内存缓存各组织的收藏列表
      orgFavoritesMap: {} as Record<string, FavoriteItem[]>
    }
  },

  getters: {
    // 当前组织的收藏列表（按 sortOrder 升序）
    currentFavorites(state): FavoriteItem[] {
      const list = state.orgFavoritesMap[state.currentOrg] || []
      return [...list].sort((a, b) => a.sortOrder - b.sortOrder)
    },

    // 当前组织收藏数量
    favoritesCount(): number {
      return this.currentFavorites.length
    },

    // 判断某菜单是否在当前组织已收藏
    isFavorite(state) {
      return (menuId: string): boolean => {
        const list = state.orgFavoritesMap[state.currentOrg] || []
        return list.some(item => item.menuId === menuId || item.id === menuId)
      }
    }
  },

  actions: {
    // 从 localStorage 或初始配置加载指定组织的收藏数据
    loadOrgFavorites(orgName: string) {
      if (this.orgFavoritesMap[orgName]) {
        return
      }
      try {
        const raw = localStorage.getItem(`${STORAGE_PREFIX}${orgName}`)
        if (raw) {
          this.orgFavoritesMap[orgName] = JSON.parse(raw)
        } else if (DEFAULT_ORG_FAVORITES[orgName]) {
          this.orgFavoritesMap[orgName] = [...DEFAULT_ORG_FAVORITES[orgName]]
          this.persistOrgFavorites(orgName)
        } else {
          // 其它新机构默认空列表
          this.orgFavoritesMap[orgName] = []
        }
      } catch (e) {
        console.error('加载组织收藏失败:', e)
        this.orgFavoritesMap[orgName] = []
      }
    },

    // 持久化当前组织的数据
    persistOrgFavorites(orgName: string) {
      try {
        const list = this.orgFavoritesMap[orgName] || []
        localStorage.setItem(`${STORAGE_PREFIX}${orgName}`, JSON.stringify(list))
      } catch (e) {
        console.error('持久化组织收藏失败:', e)
      }
    },

    // 切换组织：强隔离切换，重置默认高亮展示【我的收藏】
    switchOrg(orgName: string) {
      if (this.currentOrg === orgName) return
      this.currentOrg = orgName
      localStorage.setItem(CURRENT_ORG_KEY, orgName)
      this.loadOrgFavorites(orgName)
      // 组织切换后，默认高亮并展示【我的收藏】
      this.activeTab = 'favorites'
      this.previousTab = 'favorites'
      this.searchKeyword = ''
      ElMessage.success(`已切换组织至：${orgName}`)
    },

    // 切换 Tab（全部菜单 vs 我的收藏）
    setActiveTab(tab: 'favorites' | 'all') {
      this.activeTab = tab
      this.previousTab = tab
    },

    // 更新搜索关键词，非空时记录进入搜索前的 Tab
    setSearchKeyword(keyword: string) {
      if (keyword && !this.searchKeyword) {
        this.previousTab = this.activeTab
      }
      this.searchKeyword = keyword
      // 当搜索框清空时，自动回退到搜索前所处的分栏（保持上下文）
      if (!keyword) {
        this.activeTab = this.previousTab
      }
    },

    // 添加收藏
    addFavorite(menu: { id: string; name: string; path: string; icon?: string }) {
      this.loadOrgFavorites(this.currentOrg)
      const currentList = this.orgFavoritesMap[this.currentOrg] || []

      // 1. 重复检查
      if (currentList.some(item => item.menuId === menu.id)) {
        return
      }

      // 2. 限制单组织最多收藏 15 个，超限阻断并弹出 Toast 警告
      if (currentList.length >= MAX_FAVORITES) {
        ElMessage.warning(`单组织最多收藏 ${MAX_FAVORITES} 个常用菜单`)
        return false
      }

      const newItem: FavoriteItem = {
        id: `fav_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        menuId: menu.id,
        title: menu.name,
        path: menu.path,
        icon: menu.icon || 'Document',
        sortOrder: currentList.length
      }

      currentList.push(newItem)
      this.orgFavoritesMap[this.currentOrg] = currentList
      this.persistOrgFavorites(this.currentOrg)
      ElMessage.success(`已将「${menu.name}」添加至当前组织常用菜单`)
      return true
    },

    // 移除收藏
    removeFavorite(menuId: string) {
      this.loadOrgFavorites(this.currentOrg)
      const currentList = this.orgFavoritesMap[this.currentOrg] || []
      const index = currentList.findIndex(item => item.menuId === menuId || item.id === menuId)

      if (index === -1) return

      const removed = currentList.splice(index, 1)[0]
      // 重新整理 sortOrder
      currentList.forEach((item, idx) => {
        item.sortOrder = idx
      })
      this.orgFavoritesMap[this.currentOrg] = currentList
      this.persistOrgFavorites(this.currentOrg)
      ElMessage.info(`已移除「${removed.title}」`)
    },

    // 切换收藏状态（未收藏则添加，已收藏则移除）
    toggleFavorite(menu: { id: string; name: string; path: string; icon?: string }) {
      if (this.isFavorite(menu.id)) {
        this.removeFavorite(menu.id)
      } else {
        this.addFavorite(menu)
      }
    },

    // 拖拽排序后持久化
    reorderFavorites(newList: FavoriteItem[]) {
      const updatedList = newList.map((item, index) => ({
        ...item,
        sortOrder: index
      }))
      this.orgFavoritesMap[this.currentOrg] = updatedList
      this.persistOrgFavorites(this.currentOrg)
    },

    // 初始化加载
    init() {
      this.loadOrgFavorites(this.currentOrg)
    }
  }
})
