<template>
  <div class="overview-metric-cards">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card shadow="hover" class="metric-card">
          <div class="card-header">
            <span class="card-title">甲总货量</span>
          </div>
          <div class="card-value">
            {{ formatValue(providerATotal) }}
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card shadow="hover" class="metric-card">
          <div class="card-header">
            <span class="card-title">乙总货量</span>
          </div>
          <div class="card-value">
            {{ formatValue(providerBTotal) }}
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card shadow="hover" class="metric-card">
          <div class="card-header">
            <span class="card-title">总差值</span>
          </div>
          <div class="card-value" :class="getDifferenceClass(totalDifference)">
            {{ formatDifference(totalDifference) }}
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card shadow="hover" class="metric-card clickable" @click="$emit('update:flow-type', '同省')">
          <div class="card-header">
            <span class="card-title">同省差值</span>
          </div>
          <div class="card-value" :class="getDifferenceClass(sameProvinceDifference)">
            {{ formatDifference(sameProvinceDifference) }}
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card shadow="hover" class="metric-card clickable" @click="$emit('update:flow-type', '不同省')">
          <div class="card-header">
            <span class="card-title">不同省差值</span>
          </div>
          <div class="card-value" :class="getDifferenceClass(crossProvinceDifference)">
            {{ formatDifference(crossProvinceDifference) }}
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card shadow="hover" class="metric-card">
          <div class="card-header">
            <span class="card-title">不同省占比</span>
          </div>
          <div class="card-value">
            {{ formatPercent(crossProvinceRatio) }}
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RawRecord } from '../../../data/province-flow-dashboard/types'
import { getProviderTotals, getFlowTypeTotals, getCrossProvinceRatio } from '../utils/aggregation'
import { formatTons, formatTickets, formatSignedDifference, formatPercent } from '../utils/format'

const props = defineProps<{
  records: RawRecord[]
  metric: 'weight' | 'tickets'
}>()

const emit = defineEmits<{
  'update:flow-type': [value: '同省' | '不同省']
}>()

const providerTotals = computed(() => {
  return getProviderTotals(props.records, props.metric)
})

const providerATotal = computed(() => {
  return providerTotals.value.find(t => t.provider === '甲')?.total || 0
})

const providerBTotal = computed(() => {
  return providerTotals.value.find(t => t.provider === '乙')?.total || 0
})

const totalDifference = computed(() => {
  return providerATotal.value - providerBTotal.value
})

const flowTypeTotals = computed(() => {
  return getFlowTypeTotals(props.records, props.metric)
})

const sameProvinceDifference = computed(() => {
  const sameProvince = flowTypeTotals.value.find(t => t.flowType === '同省')
  return sameProvince ? sameProvince.difference : 0
})

const crossProvinceDifference = computed(() => {
  const crossProvince = flowTypeTotals.value.find(t => t.flowType === '不同省')
  return crossProvince ? crossProvince.difference : 0
})

const crossProvinceRatio = computed(() => {
  return getCrossProvinceRatio(props.records, props.metric)
})

const formatValue = (value: number) => {
  return props.metric === 'weight' ? formatTons(value) : formatTickets(value)
}

const formatDifference = (value: number) => {
  return props.metric === 'weight' ? formatSignedDifference(value) + ' 吨' : formatSignedDifference(value) + ' 票'
}

const getDifferenceClass = (value: number) => {
  if (value > 0) return 'positive'
  if (value < 0) return 'negative'
  return ''
}
</script>

<style scoped>
.overview-metric-cards {
  margin-bottom: 20px;
}

.metric-card {
  transition: all 0.3s ease;
}

.clickable {
  cursor: pointer;
}

.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-header {
  margin-bottom: 12px;
}

.card-title {
  font-size: 14px;
  color: #606266;
}

.card-value {
  font-size: 24px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.8);
}

.card-value.positive {
  color: #67c23a;
}

.card-value.negative {
  color: #f56c6c;
}
</style>
