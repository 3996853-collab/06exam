<template>
  <el-card shadow="hover" class="chart-card">
    <template #header>
      <div class="card-header">
        <span>流向类型比较</span>
      </div>
    </template>
    <BaseChart :options="chartOptions" :height="300" />
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RawRecord } from '../../../data/province-flow-dashboard/types'
import { getFlowTypeTotals } from '../utils/aggregation'
import { formatTons, formatTickets } from '../utils/format'
import BaseChart from './BaseChart.vue'

const props = defineProps<{
  records: RawRecord[]
  metric: 'weight' | 'tickets'
}>()

const flowTypeTotals = computed(() => {
  return getFlowTypeTotals(props.records, props.metric)
})

const chartOptions = computed(() => {
  const data = flowTypeTotals.value
  const xAxisData = data.map(item => item.flowType)
  const providerAData = data.map(item => item.providerA)
  const providerBData = data.map(item => item.providerB)

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params: any) => {
          let result = params[0].name + '<br/>'
          params.forEach((item: any) => {
            const value = props.metric === 'weight' ? formatTons(item.value) : formatTickets(item.value)
            result += `${item.marker}${item.seriesName}: ${value}<br/>`
          })
          return result
        }
    },
    legend: {
      data: ['甲', '乙'],
      top: 30
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisTick: {
        alignWithLabel: true
      }
    },
    yAxis: {
      type: 'value',
      name: props.metric === 'weight' ? '吨' : '票'
    },
    series: [
      {
        name: '甲',
        type: 'bar',
        barWidth: '30%',
        data: providerAData,
        itemStyle: {
          color: '#00bebe'
        }
      },
      {
        name: '乙',
        type: 'bar',
        barWidth: '30%',
        data: providerBData,
        itemStyle: {
          color: '#409eff'
        }
      }
    ]
  }
})
</script>

<style scoped>
.chart-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  font-size: 16px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.8);
}
</style>
