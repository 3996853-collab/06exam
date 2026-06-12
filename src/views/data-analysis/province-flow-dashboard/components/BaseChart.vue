<template>
  <div ref="chartRef" class="base-chart" :style="{ height: height + 'px' }"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'

const props = defineProps<{
  options: echarts.EChartsOption
  height?: number
}>()

const chartRef = ref<HTMLElement>()
let chart: echarts.ECharts | null = null

const initChart = () => {
  if (!chartRef.value) return
  
  chart = echarts.init(chartRef.value)
  chart.setOption(props.options)
  
  window.addEventListener('resize', handleResize)
}

const updateChart = () => {
  if (chart) {
    chart.setOption(props.options, true)
  }
}

const handleResize = () => {
  chart?.resize()
}

onMounted(() => {
  nextTick(() => {
    initChart()
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chart?.dispose()
  chart = null
})

watch(() => props.options, () => {
  updateChart()
}, { deep: true })

watch(() => props.height, () => {
  nextTick(() => {
    handleResize()
  })
})
</script>

<style scoped>
.base-chart {
  width: 100%;
  min-height: 300px;
}
</style>
