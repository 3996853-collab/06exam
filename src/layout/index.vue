<template>
  <div class="layout-container">
    <Navbar />
    <div class="main-container">
      <Sidebar v-if="!isMobile || sidebar.opened" />
      <div class="content-container">
        <TagsView v-if="tagsView" />
        <MainContent />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/store/modules/app'
import { useSettingsStore } from '@/store/modules/settings'
import Sidebar from './components/Sidebar.vue'
import Navbar from './components/Navbar.vue'
import TagsView from './components/TagsView.vue'
import MainContent from './components/Main.vue'

const appStore = useAppStore()
const settingsStore = useSettingsStore()

const sidebar = computed(() => appStore.sidebar)
const tagsView = computed(() => settingsStore.tagsView)
const isMobile = computed(() => appStore.isMobile)
</script>

<style lang="scss" scoped>
.layout-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;

  .main-container {
    flex: 1;
    display: flex;
    overflow: hidden;

    .content-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      /* Remove left margin since sidebar is now part of flex layout */
      margin-left: 0; 
      background: #f0f2f5;
    }
  }
}

@media (max-width: 992px) {
  /* .content-container handles its own width in flex */
}
</style>
