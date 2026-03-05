import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    sidebar: {
      opened: true,
      withoutAnimation: false
    },
    device: 'desktop',
    tagsView: true,
    fixedHeader: false,
    layout: 'left',
    theme: '#409EFF',
    lang: 'zh-CN',
    watermark: false
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
    setTagsView(tagsView) {
      this.tagsView = tagsView
    },
    setFixedHeader(fixedHeader) {
      this.fixedHeader = fixedHeader
    },
    setLayout(layout) {
      this.layout = layout
    },
    setTheme(theme) {
      this.theme = theme
    },
    setLang(lang) {
      this.lang = lang
    },
    setWatermark(watermark) {
      this.watermark = watermark
    }
  }
})
