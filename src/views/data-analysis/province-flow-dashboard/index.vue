<template>
  <div class="province-flow-dashboard">
    <div class="dashboard-header">
      <h1>省份流向仪表盘</h1>
      <p>比较甲、乙服务商在同省和跨省流向上的货量差异</p>
    </div>

    <DashboardFilterBar
      :flow-type="state.flowType"
      :metric="state.metric"
      @update:flow-type="setFlowType"
      @update:metric="setMetric"
      @reset="resetFilters"
    />

    <div class="dashboard-content">
      <OverviewMetricCards
        :records="filteredRecords"
        :metric="state.metric"
        @update:flow-type="setFlowType"
      />

      <div class="charts-section">
        <FlowTypeCompareChart
          :records="filteredRecords"
          :metric="state.metric"
        />

        <InterProvinceDiffChart
          :records="filteredRecords"
          :metric="state.metric"
          @select-flow="setActiveFlowKey"
        />

        <WeightBandCompareChart
          :records="filteredRecords"
          :metric="state.metric"
        />
      </div>

      <FlowDetailTable
        :records="filteredRecords"
        :metric="state.metric"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { rawData } from '../../../data/province-flow-dashboard/rawData'
import { filterRecords } from './utils/aggregation'
import { useDashboardState } from './composables/useDashboardState'
import DashboardFilterBar from './components/DashboardFilterBar.vue'
import OverviewMetricCards from './components/OverviewMetricCards.vue'
import FlowTypeCompareChart from './components/FlowTypeCompareChart.vue'
import InterProvinceDiffChart from './components/InterProvinceDiffChart.vue'
import WeightBandCompareChart from './components/WeightBandCompareChart.vue'
import FlowDetailTable from './components/FlowDetailTable.vue'

const { state, setFlowType, setMetric, setActiveFlowKey, resetFilters } = useDashboardState()

const filteredRecords = computed(() => {
  return filterRecords(rawData, state)
})
</script>

<style scoped>
.province-flow-dashboard {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: 100vh;
}

.dashboard-header {
  margin-bottom: 24px;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.12);
}

.dashboard-header h1 {
  font-size: 24px;
  font-weight: 500;
  margin: 0 0 8px 0;
  color: rgba(0, 0, 0, 0.8);
}

.dashboard-header p {
  font-size: 14px;
  color: #606266;
  margin: 0;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.charts-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

@media (min-width: 1200px) {
  .charts-section {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .charts-section > * {
    flex: 1;
    min-width: 48%;
  }
}
</style>
