import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    sidebar: {
      opened: true,
      withoutAnimation: false
    },
    device: 'desktop',
    size: 'default',
    lang: 'zh-CN',
    isMobile: false
  }),

  actions: {
    toggleSidebar() {
      this.sidebar.opened = !this.sidebar.opened
    },
    setSidebar(opened) {
      this.sidebar.opened = opened
    },
    setDevice(device) {
      this.device = device
    },
    setSize(size) {
      this.size = size
    },
    setLang(lang) {
      this.lang = lang
    },
    setIsMobile(isMobile) {
      this.isMobile = isMobile
    }
  }
})
