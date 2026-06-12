<template>
  <el-card shadow="hover" class="chart-card">
    <template #header>
      <div class="card-header">
        <span>重量区间比较</span>
      </div>
    </template>
    <div class="chart-container">
      <div class="chart-item">
        <h3 class="chart-title">同省</h3>
        <BaseChart :options="sameProvinceOptions" :height="250" />
      </div>
      <div class="chart-item">
        <h3 class="chart-title">不同省</h3>
        <BaseChart :options="crossProvinceOptions" :height="250" />
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RawRecord } from '../../../data/province-flow-dashboard/types'
import { getWeightBandData } from '../utils/aggregation'
import { formatTons, formatTickets } from '../utils/format'
import BaseChart from './BaseChart.vue'

const props = defineProps<{
  records: RawRecord[]
  metric: 'weight' | 'tickets'
}>()

const sameProvinceData = computed(() => {
  return getWeightBandData(props.records, props.metric, '同省')
})

const crossProvinceData = computed(() => {
  return getWeightBandData(props.records, props.metric, '不同省')
})

const createChartOptions = (data: any[], title: string) => {
  const xAxisData = data.map(item => item.label)
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
}

const sameProvinceOptions = computed(() => {
  return createChartOptions(sameProvinceData.value, '同省')
})

const crossProvinceOptions = computed(() => {
  return createChartOptions(crossProvinceData.value, '不同省')
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

.chart-container {
  display: flex;
  gap: 20px;
}

.chart-item {
  flex: 1;
}

.chart-title {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  margin-bottom: 10px;
  text-align: center;
}

@media (max-width: 768px) {
  .chart-container {
    flex-direction: column;
  }
}
</style>
