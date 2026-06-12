export type ProviderCode = '甲' | '乙'
export type FlowType = '同省' | '不同省'
export type MetricType = 'weight' | 'tickets'

export interface WeightBands {
  band0300: number
  band300600: number
  band6001200: number
  band1200Plus: number
}

export interface RawRecord {
  shipProvince: string
  receiveProvince: string
  orderDate: string
  provider: ProviderCode
  totalWeight: number
  ticketCount: number
  pieceCount: number
  avgWeight: number
  countyCoverage: number
  flowType: FlowType
  flowKey: string
  weightBands: WeightBands
}
