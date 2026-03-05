<template>
  <div class="app-main" :class="{ 'show-tag': tagsView }">
    <router-view v-slot="{ Component, route }">
      <transition
        name="fade-transform"
        mode="out-in"
      >
        <keep-alive :include="cachedViews">
          <component
            :is="Component"
            :key="route.path"
            @close-tab="closeTab"
          />
        </keep-alive>
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useTagsViewStore } from '@/store/modules/tagsView'
import { useSettingsStore } from '@/store/modules/settings'

const route = useRoute()
const tagsViewStore = useTagsViewStore()
const settingsStore = useSettingsStore()

const cachedViews = computed(() => tagsViewStore.cachedViews)
const tagsView = computed(() => settingsStore.tagsView)

const closeTab = (path) => {
  tagsViewStore.delView(path)
}
</script>

<style lang="scss" scoped>
.app-main {
  flex: 1;
  padding: 20px;
  overflow: auto;
  background: #f0f2f5;

  &.show-tag {
    padding: 20px 20px 0;
  }
}

.el-scrollbar {
  height: calc(100vh - 150px);
}
</style>
