import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTabsStore = defineStore('tabs', () => {
  const tabs = ref([])
  const activeTab = ref('')
  const tabMap = ref({})

  const currentTabs = computed(() => tabs.value)

  const addTab = (route) => {
    const { path, name, meta } = route
    if (path === '/') return

    const tab = {
      path,
      name: name || path,
      title: meta.title || name,
      route
    }

    if (!tabMap.value[path]) {
      tabs.value.push(tab)
      tabMap.value[path] = tab
    }

    activeTab.value = path
  }

  const removeTab = (path) => {
    if (tabMap.value[path]) {
      delete tabMap.value[path]
      tabs.value = tabs.value.filter(tab => tab.path !== path)
    }

    if (activeTab.value === path) {
      const remainingTabs = tabs.value
      if (remainingTabs.length > 0) {
        activeTab.value = remainingTabs[remainingTabs.length - 1].path
      } else {
        activeTab.value = ''
      }
    }
  }

  const closeOtherTabs = (path) => {
    tabs.value = tabs.value.filter(tab => tab.path === path || tab.path === '/')
    tabMap.value = {}
    tabs.value.forEach(tab => {
      tabMap.value[tab.path] = tab
    })
    activeTab.value = path
  }

  const closeAllTabs = () => {
    tabs.value = []
    tabMap.value = {}
    activeTab.value = ''
  }

  const getTabByPath = (path) => {
    return tabMap.value[path]
  }

  return {
    tabs: currentTabs,
    activeTab,
    addTab,
    removeTab,
    closeOtherTabs,
    closeAllTabs,
    getTabByPath
  }
})
