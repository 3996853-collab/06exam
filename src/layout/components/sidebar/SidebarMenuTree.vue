<template>
  <div class="sidebar-menu-tree">
    <div
      v-for="group in fullMenuTree"
      :key="group.id"
      class="menu-group"
    >
      <!-- 分组标题（点击可折叠/展开） -->
      <div
        class="group-header"
        @click="toggleGroup(group.id)"
      >
        <el-icon class="group-icon">
          <component :is="group.icon || 'Folder'" />
        </el-icon>
        <span class="group-title">{{ group.name }}</span>
        <el-icon
          class="arrow-icon"
          :class="{ 'is-collapsed': isCollapsed(group.id) }"
        >
          <ArrowDown />
        </el-icon>
      </div>

      <!-- 子菜单列表 -->
      <el-collapse-transition>
        <div v-show="!isCollapsed(group.id)" class="group-children">
          <div
            v-for="subItem in group.children"
            :key="subItem.id"
            class="tree-leaf-item"
            :class="{ 'is-active': isActive(subItem.path) }"
            @click="handleNavigate(subItem.path)"
          >
            <!-- 菜单图标 -->
            <el-icon class="leaf-icon">
              <component :is="subItem.icon || 'Document'" />
            </el-icon>

            <!-- 菜单名称 -->
            <span class="leaf-title" :title="subItem.name">{{ subItem.name }}</span>

            <!-- 右侧星标按钮 (未收藏hover显示空心灰星☆，已收藏常驻显示金黄实心星★) -->
            <div
              class="star-btn-wrapper"
              :class="{
                'is-favorited': favoriteStore.isFavorite(subItem.id),
                'not-favorited': !favoriteStore.isFavorite(subItem.id)
              }"
              @click.stop="handleToggleFavorite(subItem)"
            >
              <el-tooltip
                :content="favoriteStore.isFavorite(subItem.id) ? '取消收藏' : '添加至常用'"
                placement="right"
                :show-after="300"
              >
                <div class="star-btn">
                  <span v-if="favoriteStore.isFavorite(subItem.id)" class="star-solid">★</span>
                  <span v-else class="star-hollow">☆</span>
                </div>
              </el-tooltip>
            </div>
          </div>
        </div>
      </el-collapse-transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fullMenuTree } from './menuData'
import { useFavoriteMenuStore, type MenuItem } from '@/store/modules/favoriteMenu'

const router = useRouter()
const route = useRoute()
const favoriteStore = useFavoriteMenuStore()

// 折叠状态（默认全部展开）
const collapsedGroups = ref<Record<string, boolean>>({})

const isCollapsed = (groupId: string) => {
  return !!collapsedGroups.value[groupId]
}

const toggleGroup = (groupId: string) => {
  collapsedGroups.value[groupId] = !collapsedGroups.value[groupId]
}

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

const handleToggleFavorite = (subItem: MenuItem) => {
  favoriteStore.toggleFavorite({
    id: subItem.id,
    name: subItem.name,
    path: subItem.path,
    icon: subItem.icon
  })
}
</script>

<style lang="scss" scoped>
.sidebar-menu-tree {
  padding: 4px 10px 20px;

  .menu-group {
    margin-bottom: 8px;

    .group-header {
      display: flex;
      align-items: center;
      height: 34px;
      padding: 0 10px;
      border-radius: 6px;
      cursor: pointer;
      color: rgba(255, 255, 255, 0.6);
      font-size: 12px;
      font-weight: 500;
      user-select: none;
      transition: all 0.2s;

      &:hover {
        color: rgba(255, 255, 255, 0.95);
        background: rgba(255, 255, 255, 0.05);
      }

      .group-icon {
        font-size: 14px;
        margin-right: 8px;
        color: rgba(255, 255, 255, 0.5);
      }

      .group-title {
        flex: 1;
        letter-spacing: 0.2px;
      }

      .arrow-icon {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.4);
        transition: transform 0.2s ease;

        &.is-collapsed {
          transform: rotate(-90deg);
        }
      }
    }

    .group-children {
      padding-left: 6px;
      display: flex;
      flex-direction: column;
      gap: 3px;
      margin-top: 2px;

      .tree-leaf-item {
        position: relative;
        display: flex;
        align-items: center;
        height: 38px;
        padding: 0 8px 0 12px;
        border-radius: 6px;
        cursor: pointer;
        color: rgba(255, 255, 255, 0.78);
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        border: 1px solid transparent;

        &:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.08);

          // 未收藏项在 hover 时显现空心星标
          .star-btn-wrapper.not-favorited {
            opacity: 1;
            pointer-events: auto;
          }
        }

        &.is-active {
          background: linear-gradient(90deg, rgba(0, 190, 190, 0.25) 0%, rgba(0, 190, 190, 0.08) 100%);
          color: #ffffff;
          font-weight: 500;
          border-color: rgba(0, 190, 190, 0.6);

          .leaf-icon {
            color: rgb(0, 190, 190);
          }
        }

        .leaf-icon {
          font-size: 15px;
          margin-right: 9px;
          color: rgba(255, 255, 255, 0.6);
          flex-shrink: 0;
        }

        .leaf-title {
          flex: 1;
          font-size: 13px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        // 星标按钮容器
        .star-btn-wrapper {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          flex-shrink: 0;
          transition: all 0.2s ease;

          // 未收藏：默认隐藏，只有在父节点 hover 时显示
          &.not-favorited {
            opacity: 0;
            pointer-events: none;

            .star-hollow {
              color: rgba(255, 255, 255, 0.45);
              font-size: 16px;
              transition: all 0.2s;
            }

            &:hover {
              background: rgba(255, 255, 255, 0.12);

              .star-hollow {
                color: #ffe58f;
                transform: scale(1.15);
              }
            }
          }

          // 已收藏：常驻高亮显示实心金黄色星标 ★
          &.is-favorited {
            opacity: 1;
            pointer-events: auto;

            .star-solid {
              color: #fadb14;
              font-size: 16px;
              filter: drop-shadow(0 0 4px rgba(250, 219, 20, 0.5));
              transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
            }

            &:hover {
              background: rgba(250, 219, 20, 0.15);

              .star-solid {
                transform: scale(1.25);
              }
            }
          }
        }
      }
    }
  }
}
</style>
