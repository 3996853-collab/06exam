<template>
  <div :class="{ 'sidebar-container': true, 'hideSidebar': !sidebar.opened }">
    <div class="sidebar-header">
      <div class="org-switcher">
        <el-icon><CopyDocument /></el-icon>
        <span>总部</span>
        <el-icon class="arrow"><ArrowDown /></el-icon>
      </div>
      <div class="search-container">
        <el-input v-model="searchText" placeholder="输入菜单名称" prefix-icon="Search" size="small" />
      </div>
    </div>
    <div class="sidebar-scroll-container">
      <ul class="sidebar-menu">
        <li
          v-for="route in permission_routes"
          v-show="!route.hidden"
          :key="route.path"
          :class="{ 'menu-item': true, 'active': isActive(route) }"
          @mouseenter="handleMouseEnter(route)"
          @mouseleave="handleMouseLeave"
        >
          <div class="menu-link" @click="handleMenuClick(route)">
            <el-icon v-if="route.meta?.icon || (route.children && route.children[0]?.meta?.icon)" class="menu-icon">
              <component :is="getIconComponent(route.meta?.icon || (route.children && route.children[0]?.meta?.icon))" />
            </el-icon>
            <span class="menu-text">{{ route.meta?.title || (route.children && route.children[0]?.meta?.title) || route.name || (route.children && route.children[0]?.name) }}</span>
          </div>
        </li>
      </ul>
    </div>

    <!-- Mega Menu Panel -->
    <div 
      v-if="activeMegaMenu" 
      class="mega-menu-panel"
      @mouseenter="handlePanelEnter"
      @mouseleave="handlePanelLeave"
    >
      <div class="mega-menu-header">
        <el-input v-model="megaSearchText" placeholder="输入菜单名称" prefix-icon="Search" class="mega-search" />
        <el-icon class="close-btn" @click="closeMegaMenu"><Close /></el-icon>
      </div>
      <div class="mega-menu-content">
        <div class="mega-column" v-for="(col, colIndex) in megaMenuData" :key="colIndex">
          <div class="mega-group" v-for="group in col" :key="group.title">
            <div class="group-title">
              <el-icon class="group-icon"><CaretBottom /></el-icon>
              {{ group.title }}
            </div>
            <ul class="group-list">
              <li v-for="item in group.items" :key="item">{{ item }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div class="sidebar-footer">
      <div class="env-switch">
        <span>预发环境</span>
        <el-switch v-model="isPreEnv" active-color="#00b8c4" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/store/modules/app'
import { usePermissionStore } from '@/store/modules/permission'

import { constantRoutes } from '@/router/routes'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const permissionStore = usePermissionStore()

const sidebar = computed(() => appStore.sidebar)
const permission_routes = computed(() => {
  return permissionStore.routes && permissionStore.routes.length > 0 
    ? permissionStore.routes 
    : constantRoutes
})

const searchText = ref('')
const isPreEnv = ref(false)
const megaSearchText = ref('')

const activeMegaMenu = ref(false)
let hideTimeout = null

const handleMouseEnter = (route) => {
  if (hideTimeout) clearTimeout(hideTimeout)
  // Show for all menu items for testing purposes
  activeMegaMenu.value = true
}

const handleMouseLeave = () => {
  hideTimeout = setTimeout(() => {
    activeMegaMenu.value = false
  }, 200) // Delay to allow moving mouse to the panel
}

const handlePanelEnter = () => {
  if (hideTimeout) clearTimeout(hideTimeout)
}

const handlePanelLeave = () => {
  activeMegaMenu.value = false
}

const closeMegaMenu = () => {
  activeMegaMenu.value = false
}

const isActive = (itemRoute) => {
  // Check if current route path starts with this menu item's path
  if (!route) return false
  if (itemRoute.path === '/') {
    return route.path === '/dashboard' || route.path === '/'
  }
  return route.path.startsWith(itemRoute.path)
}

const handleMenuClick = (route) => {
  if (route.children && route.children.length > 0) {
    router.push(route.children[0].path)
  } else {
    router.push(route.path)
  }
  closeMegaMenu()
}

// Hardcoded Mega Menu Data to match the screenshot
const megaMenuData = [
  // Column 1
  [
    {
      title: '基础资料',
      items: ['距离时效', '运输公司', '车队维护', '违章行为代码', '线路班次', '车队分拨里程', '车队观测信息', '服务站管理', '线路通卡维护', '服务商管理']
    },
    {
      title: '车辆管理',
      items: ['车辆维保']
    },
    {
      title: '车型管理',
      items: ['车辆信息', '车辆交接', '出险信息', '行车统计', '时间油耗']
    }
  ],
  // Column 2
  [
    {
      title: '司机管理',
      items: ['司机信息', '考勤监控', 'T页信息', '连续补贴', '奖点信息', '违法信息', '事务管理', 'IC卡记录']
    },
    {
      title: '运输计划',
      items: ['调度计划', '整车订单', '无班线调度单', '运输费用审批', '讲站明细查询', '出站明细查询']
    }
  ],
  // Column 3
  [
    {
      title: '运输监控',
      items: ['运输质量报告', '运输任务管理', '车辆装载率', '班车超时监控', '无任务审批', '晚点延误申诉', '车辆预警监控', '预警事件配置', '车辆预警事件', '车辆停车记录', '异常上报审批', '物损操作报表']
    },
    {
      title: '成本管理',
      items: ['注费成本', '过路费成本', '尿素成本', '固定成本', '成本分析', '成本分摊', '司机日常加注', '垫付费用明细', '推迟记录', '运输成本汇总']
    }
  ],
  // Column 4
  [
    {
      title: '网点打卡',
      items: ['个人任务']
    }
  ]
]

const getIconComponent = (iconName) => {
  return iconName
}

const logo = ref({
  src: '/image.png',
  alt: 'ZTO',
  text: 'ZTO',
  to: '/'
})
</script>

<style lang="scss" scoped>
.sidebar-container {
  transition: width 0.28s;
  width: 200px !important;
  background-color: #002140; /* Updated to dark blue */
  height: 100%;
  position: relative;
  z-index: 2000;
  display: flex;
  flex-direction: column;

  .sidebar-header {
    padding: 15px;
    background: #002140;
    
    .org-switcher {
      display: flex;
      align-items: center;
      color: white;
      font-size: 14px;
      padding: 10px 0 15px;
      cursor: pointer;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      margin-bottom: 15px;

      span {
        margin: 0 8px;
        flex: 1;
      }
    }

    .search-container {
      :deep(.el-input__wrapper) {
        background-color: rgba(255, 255, 255, 0.1);
        box-shadow: none;
        
        input {
          color: white;
          &::placeholder {
            color: rgba(255, 255, 255, 0.5);
          }
        }
        
        .el-icon {
          color: rgba(255, 255, 255, 0.5);
        }
      }
    }
  }

  .sidebar-scroll-container {
    flex: 1;
    overflow-y: auto;
    overflow-x: visible; /* Changed from hidden to visible */

    .sidebar-menu {
      list-style: none;
      margin: 0;
      padding: 0;

      .menu-item {
        margin-bottom: 8px; /* Increased spacing */

        &.active {
          background: rgba(0, 184, 196, 0.1); /* Subtle cyber blue background */
          color: #ffffff !important;

          .menu-link {
            color: #ffffff !important;
            border-left: 4px solid #00b8c4;
          }
        }

        .menu-link {
          display: flex;
          align-items: center;
          height: 48px;
          padding: 0 20px 0 24px;
          color: rgba(255, 255, 255, 0.7) !important; /* Pale white default */
          text-decoration: none;
          transition: all 0.3s;
          position: relative;
          z-index: 2;
          border-left: 4px solid transparent;

          .active & {
            color: #ffffff !important;
          }

          &:hover {
            color: #ffffff !important;
          }

          .menu-icon {
            margin-right: 10px;
            font-size: 16px;
            color: inherit !important;
          }

          .menu-text {
            font-size: 14px;
            color: inherit !important;
          }
        }
      }
    }
  }

  .sidebar-footer {
    padding: 15px;
    background: #002140;
    border-top: 1px solid rgba(255,255,255,0.1);

    .env-switch {
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: white;
      font-size: 14px;
      background: rgba(255,255,255,0.1);
      padding: 8px 12px;
      border-radius: 4px;
    }
  }
}

@media (max-width: 992px) {
  .sidebar-container {
    width: 200px !important;

    &.hideSidebar {
      width: 0 !important;
    }
  }
}

.hideSidebar {
  .sidebar-container {
    width: 0 !important;
    overflow: hidden;
  }
}

// Mega Menu Styles
.mega-menu-panel {
  position: absolute; /* Changed from fixed to absolute to position relative to sidebar */
  left: 200px; /* Width of the sidebar */
  top: 0;
  bottom: 0;
  width: 900px;
  background-color: #ffffff;
  z-index: 3000;
  box-shadow: 4px 0 10px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  animation: slideIn 0.2s ease-out;

  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-10px); }
    to { opacity: 1; transform: translateX(0); }
  }

  .mega-menu-header {
    display: flex;
    align-items: center;
    padding: 16px 24px;
    border-bottom: 1px solid #f0f0f0;

    .mega-search {
      flex: 1;
      max-width: 400px;
      
      :deep(.el-input__wrapper) {
        border-radius: 4px;
        box-shadow: 0 0 0 1px #dcdfe6 inset;
        background-color: #f5f7fa;
      }
    }

    .close-btn {
      margin-left: auto;
      font-size: 20px;
      color: #999;
      cursor: pointer;
      padding: 4px;

      &:hover {
        color: #333;
      }
    }
  }

  .mega-menu-content {
    flex: 1;
    display: flex;
    padding: 24px;
    gap: 32px;
    overflow-y: auto;

    .mega-column {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 24px;

      .mega-group {
        .group-title {
          display: flex;
          align-items: center;
          font-size: 14px;
          font-weight: 600;
          color: #333;
          margin-bottom: 12px;

          .group-icon {
            color: #00b8c4;
            margin-right: 4px;
            font-size: 12px;
            transform: rotate(-45deg);
          }
        }

        .group-list {
          list-style: none;
          padding: 0;
          margin: 0 0 0 16px;

          li {
            font-size: 13px;
            color: #666;
            margin-bottom: 10px;
            cursor: pointer;
            transition: color 0.2s;

            &:hover {
              color: #00b8c4;
            }

            &:last-child {
              margin-bottom: 0;
            }
          }
        }
      }
    }
  }
}
</style>
