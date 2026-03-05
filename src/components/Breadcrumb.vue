<template>
  <el-breadcrumb class="app-breadcrumb" separator="/">
    <transition-group name="breadcrumb">
      <el-breadcrumb-item v-for="(item, index) in levelList" :key="item.path">
        <span
          v-if="item.redirect === 'noredirect' || index === levelList.length - 1"
          class="no-redirect"
        >{{ item.meta.title }}</span>
        <router-link
          v-else
          :to="item.redirect || item.path"
          class="redirect"
        >{{ item.meta.title }}</router-link>
      </el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const levelList = ref([])

const getBreadcrumb = () => {
  let matched = route.matched.filter(item => item.meta && item.meta.title)
  const first = matched[0]

  if (!isDashboard(first)) {
    matched = [{ path: '/dashboard', meta: { title: '首页' } }].concat(matched)
  }

  levelList.value = matched.filter(item => item.meta && item.meta.title && item.meta.breadcrumb !== false)
}

const isDashboard = (route) => {
  const name = route && route.name
  if (!name) {
    return false
  }
  return name.trim().toLocaleLowerCase() === 'dashboard'.toLocaleLowerCase()
}

const pathCompile = (path) => {
  const { params } = route
  const toPath = pathToString(path, params)
  return toPath
}

const pathToString = (path, params) => {
  let pathStr = path
  if (!params) return pathStr
  Object.keys(params).forEach(key => {
    const value = params[key]
    const reg = new RegExp(`:${key}(\\(|\\/)`)
    pathStr = pathStr.replace(reg, `${value}/`)
  })
  return pathStr
}

onMounted(() => {
  getBreadcrumb()
})

watch(
  () => route.path,
  () => {
    getBreadcrumb()
  }
)
</script>

<style lang="scss" scoped>
.app-breadcrumb {
  display: inline-block;
  font-size: 14px;
  line-height: 50px;
  margin-left: 10px;

  .no-redirect {
    color: #fff;
    cursor: text;
  }

  .redirect {
    color: #fff;
    text-decoration: none;

    &:hover {
      color: #fff;
    }
  }
}
</style>
