<template>
  <div class="sidebar-search-results">
    <div class="search-summary">
      <span>找到 {{ searchResults.length }} 个相关菜单</span>
    </div>

    <!-- 结果列表 -->
    <div v-if="searchResults.length > 0" class="search-list">
      <div
        v-for="item in searchResults"
        :key="item.id"
        class="search-item"
        :class="{ 'is-active': isActive(item.path) }"
        @click="handleNavigate(item.path)"
      >
        <el-icon class="item-icon">
          <component :is="item.icon || 'Document'" />
        </el-icon>

        <div class="item-info">
          <!-- 菜单名（带高亮高亮） -->
          <div class="item-name">
            <template v-for="(char, idx) in item.name" :key="idx">
              <span
                :class="{ 'highlight-char': item.matchedIndices.includes(idx) }"
              >{{ char }}</span>
            </template>
          </div>
          <!-- 所属分组徽标 -->
          <span class="category-badge">{{ item.category }}</span>
        </div>

        <!-- 右侧星标收藏按钮 -->
        <div
          class="star-btn-wrapper"
          :class="{
            'is-favorited': favoriteStore.isFavorite(item.id),
            'not-favorited': !favoriteStore.isFavorite(item.id)
          }"
          @click.stop="handleToggleFavorite(item)"
        >
          <el-tooltip
            :content="favoriteStore.isFavorite(item.id) ? '取消收藏' : '添加至常用'"
            placement="right"
            :show-after="300"
          >
            <div class="star-btn">
              <span v-if="favoriteStore.isFavorite(item.id)" class="star-solid">★</span>
              <span v-else class="star-hollow">☆</span>
            </div>
          </el-tooltip>
        </div>
      </div>
    </div>

    <!-- 空搜索结果 -->
    <div v-else class="search-empty">
      <el-icon class="empty-icon"><Search /></el-icon>
      <div class="empty-text">未找到与“{{ favoriteStore.searchKeyword }}”匹配的菜单</div>
      <div class="empty-hint">支持汉字、全拼、拼音首字母检索</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { searchMenuItems } from './menuData'
import { useFavoriteMenuStore, type MenuItem } from '@/store/modules/favoriteMenu'

const router = useRouter()
const route = useRoute()
const favoriteStore = useFavoriteMenuStore()

const searchResults = computed(() => {
  return searchMenuItems(favoriteStore.searchKeyword)
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

const handleToggleFavorite = (item: MenuItem) => {
  favoriteStore.toggleFavorite({
    id: item.id,
    name: item.name,
    path: item.path,
    icon: item.icon
  })
}
</script>

<style lang="scss" scoped>
.sidebar-search-results {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 4px 10px 20px;

  .search-summary {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.45);
    margin-bottom: 8px;
    padding: 0 4px;
  }

  .search-list {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .search-item {
      display: flex;
      align-items: center;
      height: 44px;
      padding: 0 10px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.06);
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      user-select: none;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(0, 190, 190, 0.35);

        .star-btn-wrapper.not-favorited {
          opacity: 1;
          pointer-events: auto;
        }
      }

      &.is-active {
        background: linear-gradient(90deg, rgba(0, 190, 190, 0.25) 0%, rgba(0, 190, 190, 0.08) 100%);
        border-color: rgb(0, 190, 190);

        .item-icon {
          color: rgb(0, 190, 190);
        }
      }

      .item-icon {
        font-size: 16px;
        margin-right: 10px;
        color: rgba(255, 255, 255, 0.65);
        flex-shrink: 0;
      }

      .item-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        overflow: hidden;

        .item-name {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.9);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;

          .highlight-char {
            color: #ffe58f;
            background: rgba(255, 215, 0, 0.22);
            font-weight: 600;
            border-radius: 2px;
            padding: 0 1px;
          }
        }

        .category-badge {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.4);
          margin-top: 1px;
        }
      }

      // 星标按钮
      .star-btn-wrapper {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        flex-shrink: 0;
        transition: all 0.2s ease;

        &.not-favorited {
          opacity: 0;
          pointer-events: none;

          .star-hollow {
            color: rgba(255, 255, 255, 0.45);
            font-size: 16px;
          }

          &:hover {
            background: rgba(255, 255, 255, 0.12);
            .star-hollow {
              color: #ffe58f;
              transform: scale(1.15);
            }
          }
        }

        &.is-favorited {
          opacity: 1;
          pointer-events: auto;

          .star-solid {
            color: #fadb14;
            font-size: 16px;
            filter: drop-shadow(0 0 4px rgba(250, 219, 20, 0.5));
          }

          &:hover {
            background: rgba(250, 219, 20, 0.15);
            .star-solid {
              transform: scale(1.2);
            }
          }
        }
      }
    }
  }

  .search-empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 10px;
    text-align: center;

    .empty-icon {
      font-size: 32px;
      color: rgba(255, 255, 255, 0.25);
      margin-bottom: 12px;
    }

    .empty-text {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.6);
      margin-bottom: 6px;
    }

    .empty-hint {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.35);
    }
  }
}
</style>
