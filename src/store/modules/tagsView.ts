import { defineStore } from 'pinia'

export const useTagsViewStore = defineStore('tagsView', {
  state: () => ({
    visitedViews: [],
    cachedViews: []
  }),

  actions: {
    addView(view) {
      this.addVisitedView(view)
      if (view.meta.keepAlive) {
        this.addCachedView(view)
      }
    },

    addVisitedView(view) {
      if (this.visitedViews.some(v => v.path === view.path)) return
      this.visitedViews.push({
        name: view.name,
        path: view.path,
        query: view.query,
        fullPath: view.fullPath,
        meta: { ...view.meta }
      })
    },

    addCachedView(view) {
      if (this.cachedViews.includes(view.name)) return
      if (view.meta.keepAlive) {
        this.cachedViews.push(view.name)
      }
    },

    delView(view) {
      this.delVisitedView(view)
      this.delCachedView(view)
    },

    delVisitedView(view) {
      return new Promise(resolve => {
        for (const [index, visitedView] of this.visitedViews.entries()) {
          if (visitedView.path === view.path) {
            this.visitedViews.splice(index, 1)
            break
          }
        }
        resolve([...this.visitedViews])
      })
    },

    delCachedView(view) {
      return new Promise(resolve => {
        const index = this.cachedViews.indexOf(view.name)
        if (index > -1) {
          this.cachedViews.splice(index, 1)
        }
        resolve([...this.cachedViews])
      })
    },

    closeOtherViews(view) {
      return new Promise(resolve => {
        this.visitedViews = this.visitedViews.filter(v => {
          return v.path === view.path || v.meta.affix
        })
        this.cachedViews = this.cachedViews.filter(v => {
          return v === view.name || !view.meta.keepAlive
        })
        resolve([...this.visitedViews])
      })
    },

    closeAllViews() {
      return new Promise(resolve => {
        this.visitedViews = this.visitedViews.filter(v => v.meta.affix)
        this.cachedViews = []
        resolve([...this.visitedViews])
      })
    }
  }
})
