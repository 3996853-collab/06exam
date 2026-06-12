# Province Flow Dashboard Dataset

## Source Information
- **Source File**: C:\Users\ZTOCC\Downloads\query_result_2026-03-09T11_19_30.144777113+08_00.xlsx
- **Conversion Date**: 2026-03-09
- **Dataset Type**: Static local module

## Field Mapping

| Excel Field | TypeScript Field | Description |
|-------------|------------------|-------------|
| 发货省份 | shipProvince | Province where the shipment originates |
| 收货省份 | receiveProvince | Province where the shipment is delivered |
| 订单日期 | orderDate | Date of the order |
| 服务商 | provider | Service provider (甲 or 乙) |
| 结算重量(吨) | totalWeight | Total weight in tons |
| 票数 | ticketCount | Number of tickets/shipments |
| 件数 | pieceCount | Number of pieces |
| 平均重量 | avgWeight | Average weight per shipment |
| 区县覆盖数 | countyCoverage | Number of counties covered |
| 流向类型 | flowType | Flow type (同省 or 不同省) |
| 流向键 | flowKey | Unique key for ship-receive province pair |
| 0-300kg | weightBands.band0300 | Weight in 0-300kg band |
| 300-600kg | weightBands.band300600 | Weight in 300-600kg band |
| 600-1200kg | weightBands.band6001200 | Weight in 600-1200kg band |
| 1200+kg | weightBands.band1200Plus | Weight in 1200+kg band |

## Flow Type Rule
- **同省**: shipProvince === receiveProvince
- **不同省**: shipProvince !== receiveProvince

## Usage
```typescript
import { rawData } from './rawData'
import type { RawRecord } from './types'

// Example usage
const totalWeight = rawData.reduce((sum, record) => sum + record.totalWeight, 0)
```
