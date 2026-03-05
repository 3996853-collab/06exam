<template>
  <router-view />
</template>

<script setup>
import { useRoute } from 'vue-router'
import { watch } from 'vue'

const route = useRoute()

watch(
  () => route.path,
  () => {
    document.title = route.meta.title || 'vue3-element-admin'
  },
  { immediate: true }
)
</script>

<style>
/* Remove margin from the specific demoway injected element */
[data-demoway-document-id="mi9m0sq21xr7m7e2s8ro6hee"] {
  margin: 0 !important;
}
</style>
