import router from '@/router'
import { useTagsViewStore } from '@/store/modules/tagsView'
import { usePermissionStore } from '@/store/modules/permission'
import { useAppStore } from '@/store/modules/app'
import { ElMessage } from 'element-plus'
import { constantRoutes } from '@/router/routes'

const whiteList = ['/login']

const hasPermission = (roles, route) => {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

const filterAsyncRoutes = (routes, roles) => {
  const res = []
  routes.forEach(route => {
    const r = { ...route }
    if (hasPermission(roles, r)) {
      if (r.children) {
        r.children = filterAsyncRoutes(r.children, roles)
      }
      res.push(r)
    }
  })
  return res
}

router.beforeEach(async (to, from, next) => {
  const tagsViewStore = useTagsViewStore()
  const permissionStore = usePermissionStore()
  const appStore = useAppStore()

  if (whiteList.indexOf(to.path) !== -1) {
    next()
    return
  }

  const hasToken = true

  if (hasToken) {
    if (to.path === '/login') {
      next({ path: '/' })
      tagsViewStore.delAllViews()
    } else {
      const hasRoles = true
      // Make sure routes are set so the Sidebar knows what to render
      if (permissionStore.routes.length === 0) {
        permissionStore.setRoutes(constantRoutes || [])
        next({ ...to, replace: true })
      } else {
        if (hasRoles) {
          next()
        } else {
          try {
            const roles = ['admin']
            permissionStore.setRoutes([])
            next({ ...to, replace: true })
          } catch (error) {
            next(`/login?redirect=${to.path}`)
            tagsViewStore.delAllViews()
          }
        }
      }
    }
  } else {
    next(`/login?redirect=${to.path}`)
  }
})
