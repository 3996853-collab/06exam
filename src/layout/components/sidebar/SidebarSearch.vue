<template>
  <div class="sidebar-search-wrapper">
    <el-input
      v-model="searchText"
      placeholder="输入菜单名称/拼音搜索..."
      prefix-icon="Search"
      clearable
      class="sidebar-search-input"
      size="default"
      @input="handleInput"
      @clear="handleClear"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useFavoriteMenuStore } from '@/store/modules/favoriteMenu'

const favoriteStore = useFavoriteMenuStore()
const searchText = ref(favoriteStore.searchKeyword)

watch(
  () => favoriteStore.searchKeyword,
  (val) => {
    searchText.value = val
  }
)

const handleInput = (val: string) => {
  favoriteStore.setSearchKeyword(val)
}

const handleClear = () => {
  favoriteStore.setSearchKeyword('')
}
</script>

<style lang="scss" scoped>
.sidebar-search-wrapper {
  padding: 10px 12px 8px;

  .sidebar-search-input {
    width: 100%;

    :deep(.el-input__wrapper) {
      background-color: rgba(255, 255, 255, 0.08);
      box-shadow: none;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 6px;
      padding: 3px 10px;
      transition: all 0.2s ease;

      &:hover {
        border-color: rgba(0, 190, 190, 0.5);
        background-color: rgba(255, 255, 255, 0.12);
      }

      &.is-focus {
        border-color: rgb(0, 190, 190);
        background-color: rgba(255, 255, 255, 0.15);
        box-shadow: 0 0 0 2px rgba(0, 190, 190, 0.2);
      }

      input {
        color: #ffffff;
        font-size: 13px;
        line-height: 22px;

        &::placeholder {
          color: rgba(255, 255, 255, 0.45);
        }
      }

      .el-input__prefix {
        color: rgba(255, 255, 255, 0.5);
        margin-right: 6px;
      }

      .el-input__clear {
        color: rgba(255, 255, 255, 0.5);
        &:hover {
          color: #ffffff;
        }
      }
    }
  }
}
</style>
