<template>
  <el-card shadow="hover" class="table-card">
    <template #header>
      <div class="card-header">
        <span>流向详情</span>
      </div>
    </template>
    <el-table
      :data="tableData"
      style="width: 100%"
      border
      stripe
    >
      <el-table-column prop="flowKey" label="流向" width="200">
        <template #default="scope">
          {{ formatFlowKey(scope.row.flowKey) }}
        </template>
      </el-table-column>
      <el-table-column prop="flowType" label="流向类型" width="100" />
      <el-table-column prop="providerAWeight" label="甲重量(吨)" width="120">
        <template #default="scope">
          {{ formatTons(scope.row.providerAWeight) }}
        </template>
      </el-table-column>
      <el-table-column prop="providerBWeight" label="乙重量(吨)" width="120">
        <template #default="scope">
          {{ formatTons(scope.row.providerBWeight) }}
        </template>
      </el-table-column>
      <el-table-column prop="weightDifference" label="重量差值" width="120">
        <template #default="scope">
          <span :class="getDifferenceClass(scope.row.weightDifference)">
            {{ formatSignedDifference(scope.row.weightDifference) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="weightDifferenceRate" label="重量差异率" width="120">
        <template #default="scope">
          {{ formatPercent(scope.row.weightDifferenceRate) }}
        </template>
      </el-table-column>
      <el-table-column prop="providerATickets" label="甲票数" width="100" />
      <el-table-column prop="providerBTickets" label="乙票数" width="100" />
      <el-table-column prop="ticketDifference" label="票数差值" width="120">
        <template #default="scope">
          <span :class="getDifferenceClass(scope.row.ticketDifference)">
            {{ formatSignedDifference(scope.row.ticketDifference) }}
          </span>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RawRecord } from '../../../data/province-flow-dashboard/types'
import { formatTons, formatFlowKey, formatSignedDifference, formatPercent } from '../utils/format'

const props = defineProps<{
  records: RawRecord[]
  metric: 'weight' | 'tickets'
}>()

const flowKeyMap = computed(() => {
  const map = new Map<string, any>()
  
  props.records.forEach(record => {
    if (!map.has(record.flowKey)) {
      map.set(record.flowKey, {
        flowKey: record.flowKey,
        flowType: record.flowType,
        providerAWeight: 0,
        providerBWeight: 0,
        providerATickets: 0,
        providerBTickets: 0
      })
    }
    
    const entry = map.get(record.flowKey)
    if (record.provider === '甲') {
      entry.providerAWeight += record.totalWeight
      entry.providerATickets += record.ticketCount
    } else {
      entry.providerBWeight += record.totalWeight
      entry.providerBTickets += record.ticketCount
    }
  })
  
  return map
})

const tableData = computed(() => {
  return Array.from(flowKeyMap.value.values())
    .map(item => {
      const weightDifference = item.providerAWeight - item.providerBWeight
      const weightDifferenceRate = item.providerBWeight > 0 ? weightDifference / item.providerBWeight : null
      const ticketDifference = item.providerATickets - item.providerBTickets
      
      return {
        ...item,
        weightDifference,
        weightDifferenceRate,
        ticketDifference
      }
    })
    .sort((a, b) => {
      if (props.metric === 'weight') {
        return Math.abs(b.weightDifference) - Math.abs(a.weightDifference)
      } else {
        return Math.abs(b.ticketDifference) - Math.abs(a.ticketDifference)
      }
    })
})

const getDifferenceClass = (value: number) => {
  if (value > 0) return 'positive'
  if (value < 0) return 'negative'
  return ''
}
</script>

<style scoped>
.table-card {
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

.positive {
  color: #67c23a;
}

.negative {
  color: #f56c6c;
}
</style>
