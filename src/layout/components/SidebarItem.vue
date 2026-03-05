<template>
  <el-menu-item
    :index="resolvePath(item.path)"
    :route="item"
    :disabled="item.meta.disabled"
    v-bind="$attrs"
  >
    <template #title>
      <el-icon v-if="item.meta.icon">
        <component :is="item.meta.icon" />
      </el-icon>
      <span v-if="item.meta.title">{{ item.meta.title }}</span>
    </template>
  </el-menu-item>
</template>

<script setup>
import { computed } from 'vue'
import { isExternal } from '@/utils/validate'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  basePath: {
    type: String,
    default: ''
  }
})

const resolvePath = (routePath) => {
  if (isExternal(routePath)) {
    return routePath
  }
  if (isExternal(props.basePath)) {
    return props.basePath
  }
  return props.basePath + '/' + routePath
}
</script>
