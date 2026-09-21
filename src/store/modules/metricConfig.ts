import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface MetricConfigItem {
  id: string
  metricKey: string
  displayName: string
  unit: string
  isVisible: boolean
  sortOrder: number
  trendType: 'positive' | 'negative'
}

export interface MetricDataPoint {
  date: string
  value: number
}

const DEFAULT_CONFIGS: MetricConfigItem[] = [
  {
    id: 'cfg-1',
    metricKey: 'order_count',
    displayName: '日揽收单量',
    unit: '万单',
    isVisible: true,
    sortOrder: 1,
    trendType: 'positive'
  },
  {
    id: 'cfg-2',
    metricKey: 'delivery_amount',
    displayName: '派送完成金额',
    unit: '万元',
    isVisible: true,
    sortOrder: 2,
    trendType: 'positive'
  },
  {
    id: 'cfg-3',
    metricKey: 'timeliness_rate',
    displayName: '全程时效达成率',
    unit: '%',
    isVisible: true,
    sortOrder: 3,
    trendType: 'positive'
  },
  {
    id: 'cfg-4',
    metricKey: 'avg_transit_hours',
    displayName: '平均转运时长',
    unit: '小时',
    isVisible: true,
    sortOrder: 4,
    trendType: 'negative'
  },
  {
    id: 'cfg-5',
    metricKey: 'complaint_rate',
    displayName: '百万件客诉率',
    unit: 'PPM',
    isVisible: true,
    sortOrder: 5,
    trendType: 'negative'
  },
  {
    id: 'cfg-6',
    metricKey: 'damage_loss_cost',
    displayName: '破损理赔成本',
    unit: '元',
    isVisible: false,
    sortOrder: 6,
    trendType: 'negative'
  }
]

export const useMetricConfigStore = defineStore('metricConfig', () => {
  const configs = ref<MetricConfigItem[]>(
    (() => {
      try {
        const saved = localStorage.getItem('zto_metric_configs')
        return saved ? JSON.parse(saved) : DEFAULT_CONFIGS
      } catch {
        return DEFAULT_CONFIGS
      }
    })()
  )

  const saveToLocal = () => {
    try {
      localStorage.setItem('zto_metric_configs', JSON.stringify(configs.value))
    } catch (e) {
      console.error('Failed to save to localStorage', e)
    }
  }

  const updateConfig = (id: string, partial: Partial<MetricConfigItem>) => {
    const target = configs.value.find(c => c.id === id)
    if (target) {
      Object.assign(target, partial)
      saveToLocal()
    }
  }

  const updateSortOrder = (newOrderItems: { id: string; sortOrder: number }[]) => {
    newOrderItems.forEach(item => {
      const target = configs.value.find(c => c.id === item.id)
      if (target) {
        target.sortOrder = item.sortOrder
      }
    })
    configs.value.sort((a, b) => a.sortOrder - b.sortOrder)
    saveToLocal()
  }

  const resetToDefault = () => {
    configs.value = JSON.parse(JSON.stringify(DEFAULT_CONFIGS))
    saveToLocal()
  }

  return {
    configs,
    updateConfig,
    updateSortOrder,
    resetToDefault
  }
})
