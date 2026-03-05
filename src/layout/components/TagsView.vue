<template>
  <div class="tags-view-container">
    <div class="tags-view-sidebar-toggle">
      <el-icon><DArrowLeft /></el-icon>
    </div>
    <div class="tags-divider"></div>
    <div class="tags-view-wrapper" ref="scrollContainer" @scroll="handleScroll">
      <router-link
        v-for="tag in visitedViews"
        :key="tag.path"
        :to="{ path: tag.path, query: tag.query, fullPath: tag.fullPath }"
        custom
        v-slot="{ navigate }"
      >
        <div
          :class="{
            'tags-view-item': true,
            'active': isActive(tag),
            'no-cache': !tag.cached
          }"
          @click="handleTagClick(tag, navigate)"
          @contextmenu.prevent="handleContextmenu($event, tag)"
        >
          <span>{{ tag.meta?.title || tag.name }}</span>
          <span
            v-if="!isAffix(tag)"
            class="el-icon-close"
            @click.prevent.stop="closeSelectedTag(tag, navigate)"
          >
            ✕
          </span>
        </div>
      </router-link>
    </div>
    <div
      ref="dropdownRef"
      class="tags-view-dropdown"
      @click="handleDropdownClick"
    >
      <span>▼</span>
      <div v-if="showDropdown" class="dropdown-menu">
        <div @click="handleCommand('refresh')">🔄 刷新</div>
        <div @click="handleCommand('close')">❌ 关闭当前</div>
        <div @click="handleCommand('closeOther')">🗑️ 关闭其他</div>
        <div @click="handleCommand('closeAll')">🗑️ 关闭所有</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTagsViewStore } from '@/store/modules/tagsView'
import { useAppStore } from '@/store/modules/app'

const route = useRoute()
const router = useRouter()
const tagsViewStore = useTagsViewStore()
const appStore = useAppStore()

const visitedViews = computed(() => tagsViewStore.visitedViews)
const dropdownRef = ref()
const scrollContainer = ref()
const showDropdown = ref(false)

const isActive = (tag) => {
  return tag.path === route.path
}

const isAffix = (tag) => {
  return tag.meta && tag.meta.affix
}

const handleTagClick = (tag, navigate) => {
  navigate()
}

const closeSelectedTag = (tag, navigate) => {
  tagsViewStore.delView(tag)
  if (isActive(tag)) {
    toLastView(tagsViewStore.visitedViews, navigate)
  }
}

const handleDropdownClick = (event) => {
  showDropdown.value = !showDropdown.value
}

const handleCommand = (command) => {
  switch (command) {
    case 'refresh':
      router.go(0)
      break
    case 'close':
      closeSelectedTag(route, () => {})
      break
    case 'closeOther':
      tagsViewStore.closeOtherViews(route)
      break
    case 'closeAll':
      tagsViewStore.closeAllViews()
      break
  }
  showDropdown.value = false
}

const toLastView = (visitedViews, navigate) => {
  const latestView = visitedViews.slice(-1)[0]
  if (latestView) {
    navigate()
  } else {
    router.push('/')
  }
}

const handleScroll = () => {
  // Handle scroll if needed
}

onMounted(() => {
  tagsViewStore.addView(route)
})
</script>

<style lang="scss" scoped>
.tags-view-container {
  height: 40px;
  width: 100%;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  position: relative;
  align-items: center;

  .tags-view-sidebar-toggle {
    width: 48px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 16px;
    color: #333;
    
    &:hover {
      background: #f9f9f9;
    }
  }

  .tags-divider {
    width: 1px;
    height: 20px;
    background: #f0f0f0;
  }

  .tags-view-wrapper {
    flex: 1;
    display: flex;
    overflow-x: auto;
    overflow-y: hidden;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  .tags-view-item {
    display: inline-block;
    position: relative;
    cursor: pointer;
    height: 40px;
    line-height: 40px;
    border: none;
    color: #333;
    background: transparent;
    margin: 0;
    font-size: 14px;
    transition: all 0.3s;
    padding: 0 20px;
    border-right: 1px solid #f0f0f0;

    &:hover {
      background: #f9f9f9;
    }

    &.active {
      background: #fff;
      color: #00b8c4;
      font-weight: 500;
      z-index: 2;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background: #00b8c4;
      }
    }

    .el-icon-close {
      font-size: 12px;
      margin-left: 5px;
      margin-right: -5px;
      cursor: pointer;

      &:hover {
        color: #f56c6c;
      }
    }
  }

  .no-cache {
    border-radius: 4px;
    margin-right: 2px;
  }

  .tags-view-dropdown {
    position: relative;
    cursor: pointer;
    padding: 0 10px;
    line-height: 40px;
    color: #666;

    &:hover {
      background: #f0f0f0;
    }

    .dropdown-menu {
      position: absolute;
      top: 100%;
      right: 0;
      background: #fff;
      border: 1px solid #dcdcdc;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
      z-index: 100;
      min-width: 120px;

      div {
        padding: 8px 12px;
        cursor: pointer;
        font-size: 13px;

        &:hover {
          background: #f0f0f0;
        }
      }
    }
  }
}
</style>
