<template>
  <div :class="{ 'sidebar-container': true, 'is-collapse': !isOpened }">
    <!-- 1. 展开模式 (宽度约 230px) -->
    <template v-if="isOpened">
      <!-- 顶部区域：机构选择器 -->
      <div class="sidebar-top-org">
        <el-popover
          placement="bottom-start"
          :width="210"
          trigger="click"
          popper-class="org-selector-popover"
        >
          <template #reference>
            <div class="org-switcher" :title="favoriteStore.currentOrg">
              <el-icon class="org-icon"><OfficeBuilding /></el-icon>
              <span class="org-name">{{ favoriteStore.currentOrg }}</span>
              <el-icon class="arrow"><ArrowDown /></el-icon>
            </div>
          </template>
          
          <div class="org-selector-content">
            <div class="org-search">
              <el-input
                v-model="orgSearchQuery"
                placeholder="搜索机构..."
                prefix-icon="Search"
                size="small"
                clearable
              />
            </div>
            <div class="org-list-wrapper">
              <div 
                v-for="org in filteredOrgs" 
                :key="org.name" 
                class="org-item"
                :class="{ 'is-selected': org.name === favoriteStore.currentOrg }"
                @click="handleOrgSelect(org.name)"
              >
                <div class="org-item-left">
                  <el-icon v-if="org.name === favoriteStore.currentOrg" class="check-icon"><Check /></el-icon>
                  <el-icon class="type-icon">
                    <component :is="org.type === 'hub' ? 'OfficeBuilding' : 'House'" />
                  </el-icon>
                  <span>{{ org.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-popover>
      </div>

      <!-- 区域 1：顶部搜索区 -->
      <SidebarSearch />

      <!-- 区域 2：分栏控制器（仅在非搜索态显示或常驻显示） -->
      <SidebarSegmented v-show="!favoriteStore.searchKeyword" />

      <!-- 区域 3：内容视图区（动态渲染） -->
      <div class="sidebar-content-view">
        <!-- 搜索激活态 -->
        <SidebarSearchResults v-if="favoriteStore.searchKeyword" />

        <!-- 默认状态：【我的收藏】视图 (扁平列表 + 拖拽) -->
        <SidebarFavorites v-else-if="favoriteStore.activeTab === 'favorites'" />

        <!-- 【全部菜单】视图 (树状折叠 + 星标) -->
        <SidebarMenuTree v-else />
      </div>
    </template>

    <!-- 2. 收缩模式 (Mini Icon 模式 64px 宽度) -->
    <template v-else>
      <SidebarMiniPopover />
    </template>

    <!-- 底部功能栏：预发环境开关 & 收起/展开折叠按钮 -->
    <div class="sidebar-footer">
      <div v-if="isOpened" class="footer-expanded">
        <div class="env-switch">
          <span>预发环境</span>
          <el-switch v-model="isPreEnv" active-color="#00bebe" />
        </div>
        <div class="collapse-toggle-btn" title="收起导航栏" @click="toggleCollapse">
          <el-icon><Fold /></el-icon>
        </div>
      </div>
      <div v-else class="footer-collapsed">
        <div class="collapse-toggle-btn" title="展开导航栏" @click="toggleCollapse">
          <el-icon><Expand /></el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '@/store/modules/app'
import { useFavoriteMenuStore } from '@/store/modules/favoriteMenu'

import SidebarSearch from './sidebar/SidebarSearch.vue'
import SidebarSegmented from './sidebar/SidebarSegmented.vue'
import SidebarFavorites from './sidebar/SidebarFavorites.vue'
import SidebarMenuTree from './sidebar/SidebarMenuTree.vue'
import SidebarSearchResults from './sidebar/SidebarSearchResults.vue'
import SidebarMiniPopover from './sidebar/SidebarMiniPopover.vue'

const appStore = useAppStore()
const favoriteStore = useFavoriteMenuStore()

const isOpened = computed(() => appStore.sidebar.opened)
const isPreEnv = ref(false)

// 机构列表配置（组织强隔离）
const orgSearchQuery = ref('')
const orgList = [
  { name: '总部', type: 'hub' },
  { name: '广西平南网点', type: 'branch' },
  { name: '广西柳州集配站', type: 'branch' },
  { name: '长春分拨中心', type: 'hub' },
  { name: '广东深圳网点(待清算)', type: 'branch' },
  { name: '济南历城网点', type: 'branch' },
  { name: '济南分拨中心', type: 'hub' },
  { name: '内蒙古呼伦贝尔网点', type: 'branch' },
  { name: '郑州中牟网点', type: 'branch' },
  { name: '西安未央网点', type: 'branch' }
]

const filteredOrgs = computed(() => {
  if (!orgSearchQuery.value) return orgList
  return orgList.filter(org => org.name.includes(orgSearchQuery.value))
})

const handleOrgSelect = (orgName: string) => {
  favoriteStore.switchOrg(orgName)
}

const toggleCollapse = () => {
  appStore.toggleSidebar()
}

onMounted(() => {
  favoriteStore.init()
})
</script>

<style lang="scss" scoped>
.sidebar-container {
  width: 230px !important;
  background-color: #002140;
  height: 100%;
  position: relative;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  transition: width 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.25);
  user-select: none;

  &.is-collapse {
    width: 64px !important;
  }

  // 顶部机构切换栏
  .sidebar-top-org {
    padding: 10px 12px 2px;

    .org-switcher {
      display: flex;
      align-items: center;
      height: 36px;
      padding: 0 10px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      cursor: pointer;
      color: #ffffff;
      font-size: 13px;
      transition: all 0.2s;

      &:hover {
        background: rgba(255, 255, 255, 0.12);
        border-color: rgba(0, 190, 190, 0.4);
      }

      .org-icon {
        font-size: 15px;
        color: rgb(0, 190, 190);
        margin-right: 6px;
        flex-shrink: 0;
      }

      .org-name {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-weight: 500;
      }

      .arrow {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.5);
        margin-left: 4px;
        flex-shrink: 0;
      }
    }
  }

  // 内容滚动区域
  .sidebar-content-view {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 4px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }
  }

  // 底部控制栏
  .sidebar-footer {
    padding: 10px 12px;
    background: #001b34;
    border-top: 1px solid rgba(255, 255, 255, 0.08);

    .footer-expanded {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;

      .env-switch {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: rgba(255, 255, 255, 0.85);
        font-size: 12px;
        background: rgba(255, 255, 255, 0.06);
        padding: 6px 10px;
        border-radius: 6px;
      }

      .collapse-toggle-btn {
        width: 32px;
        height: 32px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.06);
        color: rgba(255, 255, 255, 0.7);
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          color: #ffffff;
          background: rgba(0, 190, 190, 0.25);
        }

        .el-icon {
          font-size: 16px;
        }
      }
    }

    .footer-collapsed {
      display: flex;
      justify-content: center;

      .collapse-toggle-btn {
        width: 36px;
        height: 36px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.06);
        color: rgba(255, 255, 255, 0.8);
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          color: #ffffff;
          background: rgba(0, 190, 190, 0.3);
        }

        .el-icon {
          font-size: 18px;
        }
      }
    }
  }
}
</style>

<style lang="scss">
.org-selector-popover {
  background: #002140 !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  border-radius: 8px !important;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4) !important;
  padding: 8px !important;

  .org-selector-content {
    .org-search {
      margin-bottom: 8px;

      .el-input__wrapper {
        background: rgba(255, 255, 255, 0.08);
        box-shadow: none;
        border: 1px solid rgba(255, 255, 255, 0.1);

        input {
          color: #fff;
          font-size: 12px;
          &::placeholder {
            color: rgba(255, 255, 255, 0.45);
          }
        }
      }
    }

    .org-list-wrapper {
      max-height: 220px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 3px;

      .org-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 6px 8px;
        border-radius: 4px;
        cursor: pointer;
        color: rgba(255, 255, 255, 0.8);
        font-size: 12px;
        transition: all 0.2s;

        &:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        &.is-selected {
          background: rgba(0, 190, 190, 0.2);
          color: rgb(0, 190, 190);
          font-weight: 500;
        }

        .org-item-left {
          display: flex;
          align-items: center;
          gap: 6px;
          overflow: hidden;

          .type-icon {
            font-size: 13px;
          }

          .check-icon {
            color: rgb(0, 190, 190);
            font-size: 13px;
          }

          span {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      }
    }
  }
}
</style>
