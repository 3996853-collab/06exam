<template>
  <div class="sidebar-favorites-view">
    <!-- 有收藏数据：拖拽排序列表 -->
    <div v-if="favoriteList.length > 0" class="favorites-list-wrapper">
      <draggable
        v-model="favoriteList"
        item-key="id"
        handle=".drag-handle"
        ghost-class="favorite-ghost"
        chosen-class="favorite-chosen"
        drag-class="favorite-dragging"
        animation="220"
        @end="handleDragEnd"
      >
        <template #item="{ element }">
          <div
            class="favorite-card-item"
            :class="{ 'is-active': isActive(element.path) }"
            @click="handleNavigate(element.path)"
          >
            <!-- 1. 图标 -->
            <el-icon class="item-icon">
              <component :is="element.icon || 'Document'" />
            </el-icon>

            <!-- 2. 菜单名称 -->
            <span class="item-title" :title="element.title">{{ element.title }}</span>

            <!-- 3. 拖动手柄 ⋮⋮ -->
            <el-tooltip content="拖动排序" placement="top" :show-after="400">
              <div class="drag-handle" @click.stop>
                <el-icon><Rank /></el-icon>
              </div>
            </el-tooltip>

            <!-- 4. 删除按钮 ✕ (Hover 显现) -->
            <el-tooltip content="移出常用" placement="top" :show-after="300">
              <div
                class="remove-btn"
                @click.stop="handleRemove(element.menuId || element.id)"
              >
                <el-icon><Close /></el-icon>
              </div>
            </el-tooltip>
          </div>
        </template>
      </draggable>

      <div class="drag-tip">
        <span>按住手柄可上下拖动排序 (上限15个)</span>
      </div>
    </div>

    <!-- 无收藏数据：空状态 -->
    <div v-else class="favorites-empty-state">
      <div class="empty-icon-box">
        <span class="star-outline">☆</span>
      </div>
      <div class="empty-text">当前组织暂无收藏</div>
      <div class="empty-action" @click="goAllMenu">
        去全部菜单添加 &gt;
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import draggable from 'vuedraggable'
import { useFavoriteMenuStore, type FavoriteItem } from '@/store/modules/favoriteMenu'

const router = useRouter()
const route = useRoute()
const favoriteStore = useFavoriteMenuStore()

// 双向绑定的收藏列表
const favoriteList = computed({
  get: () => favoriteStore.currentFavorites,
  set: (val: FavoriteItem[]) => {
    favoriteStore.reorderFavorites(val)
  }
})

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

const handleRemove = (menuId: string) => {
  favoriteStore.removeFavorite(menuId)
}

const handleDragEnd = () => {
  favoriteStore.reorderFavorites(favoriteList.value)
}

const goAllMenu = () => {
  favoriteStore.setActiveTab('all')
}
</script>

<style lang="scss" scoped>
.sidebar-favorites-view {
  height: 100%;
  display: flex;
  flex-direction: column;

  .favorites-list-wrapper {
    padding: 4px 10px 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;

    .favorite-card-item {
      position: relative;
      display: flex;
      align-items: center;
      height: 40px;
      padding: 0 10px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 6px;
      cursor: pointer;
      color: rgba(255, 255, 255, 0.85);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      user-select: none;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(0, 190, 190, 0.35);
        color: #ffffff;

        .remove-btn {
          opacity: 1;
          pointer-events: auto;
          transform: scale(1);
        }
      }

      &.is-active {
        background: linear-gradient(90deg, rgba(0, 190, 190, 0.22) 0%, rgba(0, 190, 190, 0.08) 100%);
        border-color: rgb(0, 190, 190);
        color: #ffffff;
        font-weight: 500;

        .item-icon {
          color: rgb(0, 190, 190);
        }
      }

      .item-icon {
        font-size: 16px;
        margin-right: 10px;
        color: rgba(255, 255, 255, 0.7);
        flex-shrink: 0;
      }

      .item-title {
        flex: 1;
        font-size: 13px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      // 拖动手柄
      .drag-handle {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 22px;
        height: 22px;
        color: rgba(255, 255, 255, 0.35);
        cursor: grab;
        border-radius: 4px;
        transition: all 0.2s;
        margin-right: 2px;
        flex-shrink: 0;

        &:hover {
          color: rgba(255, 255, 255, 0.9);
          background: rgba(255, 255, 255, 0.1);
        }

        &:active {
          cursor: grabbing;
        }

        .el-icon {
          font-size: 13px;
        }
      }

      // 删除按钮 ✕，悬浮时显现
      .remove-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        border-radius: 4px;
        color: rgba(255, 255, 255, 0.45);
        opacity: 0;
        pointer-events: none;
        transform: scale(0.85);
        transition: all 0.2s ease;
        flex-shrink: 0;

        &:hover {
          color: #ff7875;
          background: rgba(255, 77, 79, 0.18);
        }

        .el-icon {
          font-size: 12px;
        }
      }
    }

    // 拖动时的样式
    .favorite-ghost {
      opacity: 0.35;
      background: rgba(0, 190, 190, 0.15) !important;
      border: 1px dashed rgb(0, 190, 190) !important;
    }

    .favorite-chosen {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }

    .favorite-dragging {
      background: rgba(0, 33, 64, 0.95) !important;
      border-color: rgb(0, 190, 190) !important;
    }

    .drag-tip {
      text-align: center;
      margin-top: 8px;
      font-size: 11px;
      color: rgba(255, 255, 255, 0.3);
      letter-spacing: 0.2px;
    }
  }

  // 空状态
  .favorites-empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 16px;
    text-align: center;

    .empty-icon-box {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.05);
      border: 1px dashed rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 14px;

      .star-outline {
        font-size: 24px;
        color: rgba(255, 255, 255, 0.35);
      }
    }

    .empty-text {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.5);
      margin-bottom: 10px;
    }

    .empty-action {
      display: inline-block;
      font-size: 13px;
      color: rgb(0, 190, 190);
      cursor: pointer;
      padding: 4px 10px;
      border-radius: 4px;
      background: rgba(0, 190, 190, 0.1);
      transition: all 0.2s;

      &:hover {
        background: rgba(0, 190, 190, 0.2);
        color: #33ffff;
        text-decoration: underline;
      }
    }
  }
}
</style>
