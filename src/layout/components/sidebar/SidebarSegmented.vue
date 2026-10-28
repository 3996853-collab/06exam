<template>
  <div class="sidebar-segmented-container">
    <div class="segmented-track">
      <!-- 滑块指示器背景 -->
      <div
        class="segmented-glider"
        :class="{ 'is-right': activeTab === 'favorites' }"
      ></div>

      <!-- 左侧：全部菜单 -->
      <button
        type="button"
        class="segmented-item"
        :class="{ active: activeTab === 'all' }"
        @click="handleSelect('all')"
      >
        <el-icon class="tab-icon"><Menu /></el-icon>
        <span class="tab-label">全部菜单</span>
      </button>

      <!-- 右侧：我的收藏 -->
      <button
        type="button"
        class="segmented-item"
        :class="{ active: activeTab === 'favorites' }"
        @click="handleSelect('favorites')"
      >
        <span class="star-icon">⭐</span>
        <span class="tab-label">我的收藏</span>
        <span class="tab-count" :class="{ 'has-items': count > 0 }">({{ count }})</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFavoriteMenuStore } from '@/store/modules/favoriteMenu'

const favoriteStore = useFavoriteMenuStore()

const activeTab = computed(() => favoriteStore.activeTab)
const count = computed(() => favoriteStore.favoritesCount)

const handleSelect = (tab: 'all' | 'favorites') => {
  favoriteStore.setActiveTab(tab)
  // 如果当前在搜索状态，切换 tab 可以顺带清空搜索，提升用户操作预期
  if (favoriteStore.searchKeyword) {
    favoriteStore.setSearchKeyword('')
  }
}
</script>

<style lang="scss" scoped>
.sidebar-segmented-container {
  padding: 4px 12px 10px;

  .segmented-track {
    position: relative;
    display: flex;
    background: rgba(0, 0, 0, 0.28);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    padding: 3px;
    user-select: none;

    .segmented-glider {
      position: absolute;
      top: 3px;
      left: 3px;
      width: calc(50% - 3px);
      height: calc(100% - 6px);
      background: linear-gradient(135deg, rgba(0, 190, 190, 0.85) 0%, rgba(0, 150, 160, 0.85) 100%);
      border-radius: 6px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
      transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 1;

      &.is-right {
        transform: translateX(100%);
      }
    }

    .segmented-item {
      position: relative;
      z-index: 2;
      flex: 1;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      outline: none;
      cursor: pointer;
      font-size: 13px;
      color: rgba(255, 255, 255, 0.65);
      transition: color 0.2s ease;
      padding: 0 4px;
      white-space: nowrap;

      &:hover {
        color: #ffffff;
      }

      &.active {
        color: #ffffff;
        font-weight: 500;
      }

      .tab-icon {
        margin-right: 5px;
        font-size: 14px;
      }

      .star-icon {
        font-size: 12px;
        margin-right: 4px;
        filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
      }

      .tab-label {
        font-size: 12px;
        letter-spacing: 0.3px;
      }

      .tab-count {
        font-size: 11px;
        margin-left: 2px;
        opacity: 0.85;

        &.has-items {
          color: #ffe58f;
          font-weight: 600;
        }
      }
    }
  }
}
</style>
