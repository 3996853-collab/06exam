import { ref, reactive } from 'vue'
import type { DashboardState } from '../types'

export function useDashboardState() {
  const state = reactive<DashboardState>({
    dateRange: [],
    shipProvince: [],
    receiveProvince: [],
    flowType: '全部',
    metric: 'weight',
    activeFlowKey: null
  })

  const setDateRange = (range: [string, string] | []) => {
    state.dateRange = range
  }

  const setShipProvince = (provinces: string[]) => {
    state.shipProvince = provinces
  }

  const setReceiveProvince = (provinces: string[]) => {
    state.receiveProvince = provinces
  }

  const setFlowType = (type: '全部' | '同省' | '不同省') => {
    state.flowType = type
  }

  const setMetric = (metric: 'weight' | 'tickets') => {
    state.metric = metric
  }

  const setActiveFlowKey = (flowKey: string | null) => {
    state.activeFlowKey = flowKey
  }

  const resetDrilldown = () => {
    state.activeFlowKey = null
  }

  const resetFilters = () => {
    state.dateRange = []
    state.shipProvince = []
    state.receiveProvince = []
    state.flowType = '全部'
    state.activeFlowKey = null
  }

  return {
    state,
    setDateRange,
    setShipProvince,
    setReceiveProvince,
    setFlowType,
    setMetric,
    setActiveFlowKey,
    resetDrilldown,
    resetFilters
  }
}
