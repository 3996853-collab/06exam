import { defineStore } from 'pinia'
import { constantRoutes } from '@/router/routes'

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    routes: [],
    addRoutes: []
  }),

  actions: {
    setRoutes(routes) {
      this.addRoutes = routes
      // If the incoming routes are already constantRoutes (for demo), don't duplicate them
      const isAlreadyConstant = routes === constantRoutes || (routes.length === constantRoutes.length && routes[0]?.path === constantRoutes[0]?.path)
      this.routes = isAlreadyConstant ? constantRoutes : constantRoutes.concat(routes)
    },
    setAddRoutes(routes) {
      this.addRoutes = routes
    }
  }
})
