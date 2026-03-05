import { defineStore } from 'pinia'
import { constantRoutes } from '@/router/routes'

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    routes: constantRoutes,
    addRoutes: []
  }),

  actions: {
    setRoutes(routes) {
      this.addRoutes = routes
      this.routes = constantRoutes.concat(routes)
    },
    setAddRoutes(routes) {
      this.addRoutes = routes
    }
  }
})
