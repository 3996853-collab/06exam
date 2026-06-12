import type { RawRecord, ProviderCode, FlowType } from './types'

export const rawData: RawRecord[] = [
  {
    shipProvince: '北京市',
    receiveProvince: '北京市',
    orderDate: '2026-03-01',
    provider: '甲',
    totalWeight: 125.5,
    ticketCount: 150,
    pieceCount: 320,
    avgWeight: 0.837,
    countyCoverage: 16,
    flowType: '同省',
    flowKey: '北京市-北京市',
    weightBands: {
      band0300: 80.2,
      band300600: 30.1,
      band6001200: 10.5,
      band1200Plus: 4.7
    }
  },
  {
    shipProvince: '北京市',
    receiveProvince: '北京市',
    orderDate: '2026-03-01',
    provider: '乙',
    totalWeight: 110.8,
    ticketCount: 135,
    pieceCount: 280,
    avgWeight: 0.821,
    countyCoverage: 14,
    flowType: '同省',
    flowKey: '北京市-北京市',
    weightBands: {
      band0300: 75.3,
      band300600: 25.2,
      band6001200: 8.1,
      band1200Plus: 2.2
    }
  },
  {
    shipProvince: '北京市',
    receiveProvince: '上海市',
    orderDate: '2026-03-01',
    provider: '甲',
    totalWeight: 95.2,
    ticketCount: 120,
    pieceCount: 250,
    avgWeight: 0.793,
    countyCoverage: 20,
    flowType: '不同省',
    flowKey: '北京市-上海市',
    weightBands: {
      band0300: 60.5,
      band300600: 20.3,
      band6001200: 10.2,
      band1200Plus: 4.2
    }
  },
  {
    shipProvince: '北京市',
    receiveProvince: '上海市',
    orderDate: '2026-03-01',
    provider: '乙',
    totalWeight: 88.5,
    ticketCount: 110,
    pieceCount: 230,
    avgWeight: 0.805,
    countyCoverage: 18,
    flowType: '不同省',
    flowKey: '北京市-上海市',
    weightBands: {
      band0300: 55.2,
      band300600: 22.1,
      band6001200: 8.8,
      band1200Plus: 2.4
    }
  },
  {
    shipProvince: '上海市',
    receiveProvince: '北京市',
    orderDate: '2026-03-01',
    provider: '甲',
    totalWeight: 90.5,
    ticketCount: 115,
    pieceCount: 240,
    avgWeight: 0.787,
    countyCoverage: 19,
    flowType: '不同省',
    flowKey: '上海市-北京市',
    weightBands: {
      band0300: 58.2,
      band300600: 19.8,
      band6001200: 9.5,
      band1200Plus: 3.0
    }
  },
  {
    shipProvince: '上海市',
    receiveProvince: '北京市',
    orderDate: '2026-03-01',
    provider: '乙',
    totalWeight: 82.3,
    ticketCount: 105,
    pieceCount: 210,
    avgWeight: 0.784,
    countyCoverage: 17,
    flowType: '不同省',
    flowKey: '上海市-北京市',
    weightBands: {
      band0300: 52.5,
      band300600: 18.7,
      band6001200: 8.2,
      band1200Plus: 2.9
    }
  },
  {
    shipProvince: '上海市',
    receiveProvince: '上海市',
    orderDate: '2026-03-01',
    provider: '甲',
    totalWeight: 130.8,
    ticketCount: 160,
    pieceCount: 340,
    avgWeight: 0.818,
    countyCoverage: 17,
    flowType: '同省',
    flowKey: '上海市-上海市',
    weightBands: {
      band0300: 85.3,
      band300600: 32.5,
      band6001200: 10.2,
      band1200Plus: 2.8
    }
  },
  {
    shipProvince: '上海市',
    receiveProvince: '上海市',
    orderDate: '2026-03-01',
    provider: '乙',
    totalWeight: 115.2,
    ticketCount: 140,
    pieceCount: 290,
    avgWeight: 0.823,
    countyCoverage: 15,
    flowType: '同省',
    flowKey: '上海市-上海市',
    weightBands: {
      band0300: 78.5,
      band300600: 26.8,
      band6001200: 7.9,
      band1200Plus: 2.0
    }
  },
  {
    shipProvince: '广东省',
    receiveProvince: '广东省',
    orderDate: '2026-03-01',
    provider: '甲',
    totalWeight: 150.2,
    ticketCount: 180,
    pieceCount: 380,
    avgWeight: 0.834,
    countyCoverage: 21,
    flowType: '同省',
    flowKey: '广东省-广东省',
    weightBands: {
      band0300: 95.8,
      band300600: 35.2,
      band6001200: 15.3,
      band1200Plus: 3.9
    }
  },
  {
    shipProvince: '广东省',
    receiveProvince: '广东省',
    orderDate: '2026-03-01',
    provider: '乙',
    totalWeight: 135.5,
    ticketCount: 160,
    pieceCount: 330,
    avgWeight: 0.847,
    countyCoverage: 19,
    flowType: '同省',
    flowKey: '广东省-广东省',
    weightBands: {
      band0300: 88.2,
      band300600: 30.5,
      band6001200: 13.8,
      band1200Plus: 3.0
    }
  },
  {
    shipProvince: '广东省',
    receiveProvince: '北京市',
    orderDate: '2026-03-01',
    provider: '甲',
    totalWeight: 85.3,
    ticketCount: 105,
    pieceCount: 220,
    avgWeight: 0.812,
    countyCoverage: 18,
    flowType: '不同省',
    flowKey: '广东省-北京市',
    weightBands: {
      band0300: 55.2,
      band300600: 18.5,
      band6001200: 8.8,
      band1200Plus: 2.8
    }
  },
  {
    shipProvince: '广东省',
    receiveProvince: '北京市',
    orderDate: '2026-03-01',
    provider: '乙',
    totalWeight: 78.5,
    ticketCount: 95,
    pieceCount: 200,
    avgWeight: 0.826,
    countyCoverage: 16,
    flowType: '不同省',
    flowKey: '广东省-北京市',
    weightBands: {
      band0300: 50.3,
      band300600: 17.2,
      band6001200: 8.5,
      band1200Plus: 2.5
    }
  }
]
