<template>
  <el-card shadow="hover" class="chart-card">
    <template #header>
      <div class="card-header">
        <span>跨省差异排名</span>
      </div>
    </template>
    <BaseChart :options="chartOptions" :height="300" />
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RawRecord } from '../../../data/province-flow-dashboard/types'
import { getInterProvinceDiffs } from '../utils/aggregation'
import { formatTons, formatTickets, formatFlowKey } from '../utils/format'
import BaseChart from './BaseChart.vue'

const props = defineProps<{
  records: RawRecord[]
  metric: 'weight' | 'tickets'
}>()

const emit = defineEmits<{
  'select-flow': [flowKey: string]
}>()

const interProvinceDiffs = computed(() => {
  return getInterProvinceDiffs(props.records, props.metric)
})

const chartOptions = computed(() => {
  const data = interProvinceDiffs.value
  const yAxisData = data.map(item => formatFlowKey(item.flowKey))
  const differenceData = data.map(item => item.difference)

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params: any) => {
        const item = data[params[0].dataIndex]
        const value = props.metric === 'weight' ? formatTons(params[0].value) : formatTickets(params[0].value)
        return `${params[0].name}<br/>
               ${params[0].marker}差异: ${value}<br/>
               甲: ${props.metric === 'weight' ? formatTons(item.providerA) : formatTickets(item.providerA)}<br/>
               乙: ${props.metric === 'weight' ? formatTons(item.providerB) : formatTickets(item.providerB)}`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: props.metric === 'weight' ? '吨' : '票'
    },
    yAxis: {
      type: 'category',
      data: yAxisData,
      axisLabel: {
        interval: 0,
        rotate: 0
      }
    },
    series: [
      {
        name: '差异',
        type: 'bar',
        data: differenceData,
        itemStyle: {
          color: (params: any) => {
            return params.value >= 0 ? '#67c23a' : '#f56c6c'
          }
        },
        label: {
          show: true,
          position: 'right',
          formatter: (params: any) => {
            return params.value.toFixed(2)
          }
        }
      }
    ],
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100
      },
      {
        start: 0,
        end: 100
      }
    ],
    click: (params: any) => {
      const item = data[params.dataIndex]
      emit('select-flow', item.flowKey)
    }
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
