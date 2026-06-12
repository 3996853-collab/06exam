import type { RawRecord, MetricType, FlowType } from '../../../../data/province-flow-dashboard/types'

export interface DashboardState {
  dateRange: [string, string] | []
  shipProvince: string[]
  receiveProvince: string[]
  flowType: '全部' | '同省' | '不同省'
  metric: 'weight' | 'tickets'
  activeFlowKey: string | null
}

export interface ProviderTotal {
  provider: '甲' | '乙'
  total: number
}

export interface FlowTypeTotal {
  flowType: FlowType
  providerA: number
  providerB: number
  difference: number
  differenceRate: number | null
}

export interface InterProvinceDiff {
  flowKey: string
  shipProvince: string
  receiveProvince: string
  providerA: number
  providerB: number
  difference: number
  differenceRate: number | null
}

export interface WeightBandData {
  band: string
  label: string
  providerA: number
  providerB: number
  difference: number
  differenceRate: number | null
}

export function filterRecords(records: RawRecord[], state: DashboardState): RawRecord[] {
  return records.filter(record => {
    if (state.flowType !== '全部' && record.flowType !== state.flowType) {
      return false
    }
    if (state.shipProvince.length > 0 && !state.shipProvince.includes(record.shipProvince)) {
      return false
    }
    if (state.receiveProvince.length > 0 && !state.receiveProvince.includes(record.receiveProvince)) {
      return false
    }
    if (state.activeFlowKey && record.flowKey !== state.activeFlowKey) {
      return false
    }
    return true
  })
}

export function getProviderTotals(records: RawRecord[], metric: MetricType): ProviderTotal[] {
  const totals = {
    甲: 0,
    乙: 0
  }

  records.forEach(record => {
    const value = metric === 'weight' ? record.totalWeight : record.ticketCount
    totals[record.provider] += value
  })

  return [
    { provider: '甲', total: totals.甲 },
    { provider: '乙', total: totals.乙 }
  ]
}

export function getFlowTypeTotals(records: RawRecord[], metric: MetricType): FlowTypeTotal[] {
  const flowTypeMap = new Map<FlowType, { providerA: number; providerB: number }>()

  records.forEach(record => {
    if (!flowTypeMap.has(record.flowType)) {
      flowTypeMap.set(record.flowType, { providerA: 0, providerB: 0 })
    }
    const entry = flowTypeMap.get(record.flowType)!
    const value = metric === 'weight' ? record.totalWeight : record.ticketCount
    if (record.provider === '甲') {
      entry.providerA += value
    } else {
      entry.providerB += value
    }
  })

  return Array.from(flowTypeMap.entries()).map(([flowType, data]) => {
    const difference = data.providerA - data.providerB
    const differenceRate = data.providerB > 0 ? difference / data.providerB : null
    return {
      flowType,
      providerA: data.providerA,
      providerB: data.providerB,
      difference,
      differenceRate
    }
  })
}

export function getInterProvinceDiffs(records: RawRecord[], metric: MetricType): InterProvinceDiff[] {
  const flowKeyMap = new Map<string, { shipProvince: string; receiveProvince: string; providerA: number; providerB: number }>()

  records.forEach(record => {
    if (record.flowType === '不同省') {
      if (!flowKeyMap.has(record.flowKey)) {
        flowKeyMap.set(record.flowKey, {
          shipProvince: record.shipProvince,
          receiveProvince: record.receiveProvince,
          providerA: 0,
          providerB: 0
        })
      }
      const entry = flowKeyMap.get(record.flowKey)!
      const value = metric === 'weight' ? record.totalWeight : record.ticketCount
      if (record.provider === '甲') {
        entry.providerA += value
      } else {
        entry.providerB += value
      }
    }
  })

  return Array.from(flowKeyMap.entries())
    .map(([flowKey, data]) => {
      const difference = data.providerA - data.providerB
      const differenceRate = data.providerB > 0 ? difference / data.providerB : null
      return {
        flowKey,
        shipProvince: data.shipProvince,
        receiveProvince: data.receiveProvince,
        providerA: data.providerA,
        providerB: data.providerB,
        difference,
        differenceRate
      }
    })
    .sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference))
}

export function getWeightBandData(records: RawRecord[], metric: MetricType, flowType: FlowType): WeightBandData[] {
  const bandMap = new Map<string, { label: string; providerA: number; providerB: number }>()

  const bandLabels = {
    band0300: '0-300kg',
    band300600: '300-600kg',
    band6001200: '600-1200kg',
    band1200Plus: '1200+kg'
  }

  records.forEach(record => {
    if (record.flowType === flowType) {
      Object.entries(record.weightBands).forEach(([band, value]) => {
        if (!bandMap.has(band)) {
          bandMap.set(band, {
            label: bandLabels[band as keyof typeof bandLabels],
            providerA: 0,
            providerB: 0
          })
        }
        const entry = bandMap.get(band)!
        if (record.provider === '甲') {
          entry.providerA += value
        } else {
          entry.providerB += value
        }
      })
    }
  })

  return Array.from(bandMap.entries())
    .map(([band, data]) => {
      const difference = data.providerA - data.providerB
      const differenceRate = data.providerB > 0 ? difference / data.providerB : null
      return {
        band,
        label: data.label,
        providerA: data.providerA,
        providerB: data.providerB,
        difference,
        differenceRate
      }
    })
    .sort((a, b) => {
      const bandOrder = ['band0300', 'band300600', 'band6001200', 'band1200Plus']
      return bandOrder.indexOf(a.band) - bandOrder.indexOf(b.band)
    })
}

export function getTotalDifference(records: RawRecord[], metric: MetricType): number {
  const totals = getProviderTotals(records, metric)
  const providerA = totals.find(t => t.provider === '甲')?.total || 0
  const providerB = totals.find(t => t.provider === '乙')?.total || 0
  return providerA - providerB
}

export function getTotalDifferenceRate(records: RawRecord[], metric: MetricType): number | null {
  const totals = getProviderTotals(records, metric)
  const providerA = totals.find(t => t.provider === '甲')?.total || 0
  const providerB = totals.find(t => t.provider === '乙')?.total || 0
  return providerB > 0 ? (providerA - providerB) / providerB : null
}

export function getCrossProvinceRatio(records: RawRecord[], metric: MetricType): number {
  const flowTypeTotals = getFlowTypeTotals(records, metric)
  const total = flowTypeTotals.reduce((sum, item) => sum + item.providerA + item.providerB, 0)
  const crossProvince = flowTypeTotals.find(item => item.flowType === '不同省')
  if (!crossProvince || total === 0) return 0
  return (crossProvince.providerA + crossProvince.providerB) / total
}
