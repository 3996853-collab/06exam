<template>
  <div class="sidebar-mini-mode">
    <!-- 顶部常驻 ⭐ 图标，Hover 触发 Popover 常用菜单浮层 -->
    <div class="mini-favorite-trigger">
      <el-popover
        placement="right-start"
        :width="220"
        trigger="hover"
        popper-class="sidebar-mini-favorite-popover"
        :show-after="150"
      >
        <template #reference>
          <div class="mini-star-button">
            <span class="star-badge-icon">⭐</span>
            <span v-if="favoriteStore.favoritesCount > 0" class="mini-count-dot">
              {{ favoriteStore.favoritesCount }}
            </span>
          </div>
        </template>

        <!-- Popover 浮层内容：展示当前组织的常用菜单 -->
        <div class="mini-popover-content">
          <div class="popover-header">
            <div class="header-left">
              <span class="header-star">⭐</span>
              <span class="header-title">常用菜单</span>
              <span class="header-org">({{ favoriteStore.currentOrg }})</span>
            </div>
            <span class="header-count">{{ favoriteStore.favoritesCount }}/15</span>
          </div>

          <div v-if="favoriteList.length > 0" class="popover-list">
            <div
              v-for="item in favoriteList"
              :key="item.id"
              class="popover-item"
              :class="{ 'is-active': isActive(item.path) }"
              @click="handleNavigate(item.path)"
            >
              <el-icon class="item-icon">
                <component :is="item.icon || 'Document'" />
              </el-icon>
              <span class="item-title" :title="item.title">{{ item.title }}</span>
            </div>
          </div>

          <div v-else class="popover-empty">
            <span>当前组织暂无收藏</span>
          </div>
        </div>
      </el-popover>
    </div>

    <!-- 快捷折叠/展开恢复按钮 -->
    <div class="mini-menu-icons">
      <el-tooltip
        v-for="item in favoriteList.slice(0, 8)"
        :key="item.id"
        :content="item.title"
        placement="right"
      >
        <div
          class="mini-icon-item"
          :class="{ 'is-active': isActive(item.path) }"
          @click="handleNavigate(item.path)"
        >
          <el-icon><component :is="item.icon || 'Document'" /></el-icon>
        </div>
      </el-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFavoriteMenuStore } from '@/store/modules/favoriteMenu'

const router = useRouter()
const route = useRoute()
const favoriteStore = useFavoriteMenuStore()

const favoriteList = computed(() => favoriteStore.currentFavorites)

const isActive = (path: string) => {
  if (!route || !path) return false
  if (path === '/' || path === '/dashboard') {
    return route.path === '/dashboard' || route.path === '/'
  }
  return route.path.startsWith(path)
}

const handleNavigate = (path: string) => {
  if (route.path !== path) {
    router.push(path)
  }
}
</script>

<style lang="scss" scoped>
.sidebar-mini-mode {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;
  width: 100%;

  .mini-favorite-trigger {
    margin-bottom: 16px;

    .mini-star-button {
      position: relative;
      width: 42px;
      height: 42px;
      border-radius: 8px;
      background: rgba(0, 190, 190, 0.18);
      border: 1px solid rgba(0, 190, 190, 0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        background: rgba(0, 190, 190, 0.35);
        transform: scale(1.06);
        box-shadow: 0 0 10px rgba(0, 190, 190, 0.4);
      }

      .star-badge-icon {
        font-size: 20px;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));
      }

      .mini-count-dot {
        position: absolute;
        top: -4px;
        right: -4px;
        min-width: 16px;
        height: 16px;
        padding: 0 4px;
        font-size: 10px;
        font-weight: bold;
        line-height: 16px;
        text-align: center;
        background: #f5222d;
        color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 0 0 1.5px #002140;
      }
    }
  }

  .mini-menu-icons {
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: center;
    width: 100%;

    .mini-icon-item {
      width: 40px;
      height: 40px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255, 255, 255, 0.7);
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        color: #ffffff;
        background: rgba(255, 255, 255, 0.1);
      }

      &.is-active {
        color: rgb(0, 190, 190);
        background: rgba(0, 190, 190, 0.15);
      }

      .el-icon {
        font-size: 18px;
      }
    }
  }
}
</style>

<style lang="scss">
.sidebar-mini-favorite-popover {
  background: #002140 !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.45) !important;
  padding: 10px !important;
  border-radius: 8px !important;

  .popover-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 8px;
    margin-bottom: 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    .header-left {
      display: flex;
      align-items: center;
      gap: 4px;

      .header-star {
        font-size: 14px;
      }

      .header-title {
        color: #ffffff;
        font-size: 13px;
        font-weight: 500;
      }

      .header-org {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.5);
      }
    }

    .header-count {
      font-size: 11px;
      color: #ffe58f;
    }
  }

  .popover-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-height: 280px;
    overflow-y: auto;

    .popover-item {
      display: flex;
      align-items: center;
      height: 34px;
      padding: 0 10px;
      border-radius: 5px;
      color: rgba(255, 255, 255, 0.85);
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #ffffff;
      }

      &.is-active {
        background: rgba(0, 190, 190, 0.2);
        color: rgb(0, 190, 190);
        font-weight: 500;
      }

      .item-icon {
        font-size: 15px;
        margin-right: 8px;
      }

      .item-title {
        font-size: 12px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }

  .popover-empty {
    padding: 20px 0;
    text-align: center;
    color: rgba(255, 255, 255, 0.4);
    font-size: 12px;
  }
}
</style>
