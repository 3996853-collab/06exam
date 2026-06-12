export type FlowTypeFilter = '全部' | '同省' | '不同省'
export type MetricType = 'weight' | 'tickets'

export interface DashboardState {
  dateRange: [string, string] | []
  shipProvince: string[]
  receiveProvince: string[]
  flowType: FlowTypeFilter
  metric: MetricType
  activeFlowKey: string | null
}

export interface DashboardFilters {
  dateRange: [string, string] | []
  shipProvince: string[]
  receiveProvince: string[]
  flowType: FlowTypeFilter
}
