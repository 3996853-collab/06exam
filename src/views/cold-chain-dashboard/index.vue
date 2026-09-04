<template>
  <div class="delivery-dashboard">
    <!-- ═══════════ Filter Bar ═══════════ -->
    <div class="filter-bar">
      <div class="filter-left">
        <el-date-picker
          v-model="selectedDate"
          type="date"
          placeholder="选择日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          :clearable="false"
          prefix-icon="Calendar"
          style="width: 180px"
        />
        <el-select
          v-model="selectedWarehouse"
          placeholder="全部仓库"
          size="default"
          style="width: 160px"
          @change="onWarehouseChange"
        >
          <el-option
            v-for="w in warehouseOptions"
            :key="w.value"
            :label="w.label"
            :value="w.value"
          />
        </el-select>
        <el-select
          v-model="selectedShipper"
          placeholder="选择货主"
          size="default"
          style="width: 160px"
          @change="onWarehouseChange"
        >
          <el-option
            v-for="s in shipperOptions"
            :key="s.value"
            :label="s.label"
            :value="s.value"
          />
        </el-select>
      </div>
      <div class="filter-right">
        <span class="update-time">
          <el-icon><Refresh /></el-icon>
          数据更新时间: {{ updateTime }}
        </span>
      </div>
    </div>

    <!-- ═══════════ KPI Cards Grid ═══════════ -->
    <div class="kpi-grid">
      <div
        v-for="(kpi, idx) in kpiCards"
        :key="kpi.label"
        class="kpi-card"
        :style="{ '--delay': idx * 0.06 + 's' }"
      >
        <div class="kpi-icon-wrap" :style="{ backgroundColor: kpi.bgColor }">
          <el-icon :size="22" :style="{ color: kpi.color }">
            <component :is="kpi.icon" />
          </el-icon>
        </div>
        <div class="kpi-body">
          <span class="kpi-label">{{ kpi.label }}</span>
          <span class="kpi-value">{{ kpi.displayValue }}</span>
          <span
            class="kpi-trend"
            :class="kpi.trendClass"
          >
            <el-icon v-if="kpi.trend !== '持平'" :size="12">
              <CaretTop v-if="kpi.trendUp" />
              <CaretBottom v-else />
            </el-icon>
            {{ kpi.trend }} 较昨日
          </span>
        </div>
      </div>
    </div>

    <!-- ═══════════ Charts Row ═══════════ -->
    <div class="charts-row">
      <!-- Warehouse Operations Panel (Tabbed) - LEFT -->
      <div class="chart-card chart-operations">
        <div class="card-title">
          <div class="title-left">
            <div class="title-bar"></div>
            <h3>仓储运营概览</h3>
          </div>
        </div>
        <!-- Tab Switcher -->
        <div class="ops-tabs">
          <div
            class="ops-tab"
            :class="{ active: activeOpsTab === 'inbound' }"
            @click="activeOpsTab = 'inbound'"
          >
            <span class="ops-tab-label">入库</span>
            <span class="ops-tab-badge" :class="{ 'badge-blue': activeOpsTab === 'inbound' }">{{ formatNum(inboundData.actual) }}</span>
          </div>
          <div
            class="ops-tab"
            :class="{ active: activeOpsTab === 'outbound' }"
            @click="activeOpsTab = 'outbound'"
          >
            <span class="ops-tab-label">出库</span>
            <span class="ops-tab-badge" :class="{ 'badge-purple': activeOpsTab === 'outbound' }">{{ formatNum(outboundTotal) }}</span>
          </div>
          <div
            class="ops-tab"
            :class="{ active: activeOpsTab === 'inventory' }"
            @click="activeOpsTab = 'inventory'"
          >
            <span class="ops-tab-label">库存</span>
            <span class="ops-tab-badge" :class="{ 'badge-orange': activeOpsTab === 'inventory' }">{{ formatNum(inventoryData.nearExpiry + inventoryData.expired) }}</span>
          </div>
        </div>
        <!-- Tab Content -->
        <div class="ops-tab-content">
          <transition name="tab-fade" mode="out-in">
            <div v-if="activeOpsTab === 'inbound'" key="inbound" class="ops-section">
              <div class="ops-metrics-row">
                <div class="ops-metric">
                  <span class="ops-metric-label">计划入库</span>
                  <span class="ops-metric-value blue">{{ formatNum(inboundData.planned) }}</span>
                  <span class="ops-metric-unit">件</span>
                </div>
                <div class="ops-metric">
                  <span class="ops-metric-label">实际入库</span>
                  <span class="ops-metric-value" :class="inboundData.actual >= inboundData.planned ? 'green' : 'orange'">{{ formatNum(inboundData.actual) }}</span>
                  <span class="ops-metric-unit">件</span>
                </div>
                <div class="ops-metric">
                  <span class="ops-metric-label">入库达成率</span>
                  <span class="ops-metric-value" :class="inboundData.rate >= 95 ? 'green' : 'orange'">{{ inboundData.rate }}%</span>
                </div>
              </div>
              <el-progress
                :percentage="inboundData.rate"
                :stroke-width="8"
                :color="inboundData.rate >= 95 ? '#22c55e' : '#f59e0b'"
                :show-text="false"
                style="margin-top: 12px"
              />
            </div>
          </transition>
          <transition name="tab-fade" mode="out-in">
            <div v-if="activeOpsTab === 'outbound'" key="outbound" class="ops-section">
              <div class="funnel-container">
                <div
                  v-for="(item, idx) in outboundFunnel"
                  :key="item.label"
                  class="funnel-bar"
                  :style="{ '--bar-width': item.pct + '%', '--bar-color': item.color, '--delay': idx * 0.08 + 's' }"
                >
                  <div class="funnel-bar-fill"></div>
                  <div class="funnel-bar-info">
                    <span class="funnel-label">{{ item.label }}</span>
                    <span class="funnel-value">{{ formatNum(item.value) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </transition>
          <transition name="tab-fade" mode="out-in">
            <div v-if="activeOpsTab === 'inventory'" key="inventory" class="ops-section">
              <div class="ops-metrics-row inventory-row">
                <div class="inventory-card warn">
                  <div class="inventory-icon-wrap">
                    <el-icon :size="20"><Clock /></el-icon>
                  </div>
                  <div class="inventory-info">
                    <span class="inventory-label">临期商品</span>
                    <span class="inventory-value">{{ formatNum(inventoryData.nearExpiry) }}</span>
                    <span class="inventory-unit">件</span>
                  </div>
                </div>
                <div class="inventory-card danger">
                  <div class="inventory-icon-wrap">
                    <el-icon :size="20"><WarningFilled /></el-icon>
                  </div>
                  <div class="inventory-info">
                    <span class="inventory-label">过期商品</span>
                    <span class="inventory-value">{{ formatNum(inventoryData.expired) }}</span>
                    <span class="inventory-unit">件</span>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>
      <!-- Trend Chart (Bar + Line dual-axis) - RIGHT -->
      <div class="chart-card chart-trend">
        <div class="card-title">
          <div class="title-left">
            <div class="title-bar"></div>
            <h3>近7日配送趋势</h3>
          </div>
        </div>
        <div class="chart-body">
          <v-chart :option="trendChartOption" autoresize style="height: 320px" />
        </div>
      </div>
    </div>

    <!-- ═══════════ Warehouse Performance Table ═══════════ -->
    <div class="table-section">
      <div class="card-title">
        <div class="title-bar"></div>
        <h3>各仓绩效对比</h3>
      </div>
      <el-table
        :data="warehouseTableData"
        style="width: 100%"
        :header-cell-style="tableHeaderStyle"
        :row-class-name="tableRowClass"
        stripe
      >
        <el-table-column prop="name" label="仓库" min-width="140" fixed>
          <template #default="{ row }">
            <div class="warehouse-name">
              <el-icon :size="16" style="color: #3b83f6"><OfficeBuilding /></el-icon>
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="totalOrders" label="配送总单量" align="right" min-width="110">
          <template #default="{ row }">
            <span class="num-cell">{{ formatNum(row.totalOrders) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="totalItems" label="总件数" align="right" min-width="100">
          <template #default="{ row }">
            <span class="num-cell">{{ formatNum(row.totalItems) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="storeCount" label="覆盖门店" align="right" min-width="100">
          <template #default="{ row }">
            <span class="num-cell">{{ formatNum(row.storeCount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="onTimeOrders" label="及时送达" align="right" min-width="100">
          <template #default="{ row }">
            <span class="num-cell">{{ formatNum(row.onTimeOrders) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="onTimeRate" label="准时率" align="center" min-width="120">
          <template #default="{ row }">
            <el-tag
              :type="row.onTimeRate >= 95 ? 'success' : row.onTimeRate >= 80 ? 'warning' : 'danger'"
              size="small"
              effect="light"
              round
            >
              {{ row.onTimeRate.toFixed(2) }}%
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="undelivered" label="未派送" align="right" min-width="90">
          <template #default="{ row }">
            <span :class="row.undelivered > 0 ? 'num-cell danger-text' : 'num-cell'">
              {{ row.undelivered }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="complaints" label="客诉异常" align="right" min-width="100">
          <template #default="{ row }">
            <span :class="row.complaints > 5 ? 'num-cell danger-text' : 'num-cell'">
              {{ row.complaints }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="complaintRate" label="客诉率" align="center" min-width="100">
          <template #default="{ row }">
            <span :class="row.complaintRate > 2 ? 'danger-text' : ''">
              {{ row.complaintRate.toFixed(2) }}%
            </span>
          </template>
        </el-table-column>

      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import VChart from 'vue-echarts'

use([CanvasRenderer, BarChart, LineChart, GridComponent, TooltipComponent, LegendComponent])

// ──── State ────
const selectedDate = ref(dayjs().format('YYYY-MM-DD'))
const selectedWarehouse = ref('all')
const selectedShipper = ref('waima')
const updateTime = ref(dayjs().format('YYYY-MM-DD HH:mm:ss'))
const activeOpsTab = ref<'inbound' | 'outbound' | 'inventory'>('inbound')

// ──── Shipper Options ────
const shipperOptions = [
  { label: '歪马', value: 'waima' },
  { label: '鲜生活', value: 'xianshenghuo' },
  { label: '冷链直达', value: 'lenglianzd' }
]

// ──── Warehouse Options ────
const warehouseOptions = [
  { label: '全部仓库', value: 'all' },
  { label: '东莞沙田仓', value: 'dongguan' },
  { label: '北京顺义仓', value: 'beijing' },
  { label: '上海嘉定仓', value: 'shanghai' },
  { label: '西安灞桥仓', value: 'xian' }
]

// ──── Metrics Data per Warehouse ────
interface WarehouseMetrics {
  warehouseCount: number
  totalOrders: number
  totalItems: number
  storeCount: number
  onTimeOrders: number
  onTimeRate: number
  undelivered: number
  complaints: number
  complaintRate: number
}

const metricsMap: Record<string, WarehouseMetrics> = {
  all: {
    warehouseCount: 4, totalOrders: 1286, totalItems: 4523,
    storeCount: 892, onTimeOrders: 1038, onTimeRate: 80.72,
    undelivered: 248, complaints: 15, complaintRate: 1.17
  },
  dongguan: {
    warehouseCount: 1, totalOrders: 359, totalItems: 1265,
    storeCount: 228, onTimeOrders: 229, onTimeRate: 63.79,
    undelivered: 130, complaints: 8, complaintRate: 2.23
  },
  beijing: {
    warehouseCount: 1, totalOrders: 312, totalItems: 1087,
    storeCount: 245, onTimeOrders: 312, onTimeRate: 100,
    undelivered: 0, complaints: 2, complaintRate: 0.64
  },
  shanghai: {
    warehouseCount: 1, totalOrders: 298, totalItems: 1024,
    storeCount: 198, onTimeOrders: 298, onTimeRate: 100,
    undelivered: 0, complaints: 3, complaintRate: 1.01
  },
  xian: {
    warehouseCount: 1, totalOrders: 317, totalItems: 1147,
    storeCount: 221, onTimeOrders: 199, onTimeRate: 62.78,
    undelivered: 118, complaints: 2, complaintRate: 0.63
  }
}

const currentMetrics = computed(() => metricsMap[selectedWarehouse.value] || metricsMap.all)

// ──── KPI Cards ────
interface KpiCardDef {
  label: string
  displayValue: string
  icon: string
  color: string
  bgColor: string
  trend: string
  trendUp: boolean
  trendClass: string
}

const kpiCards = computed<KpiCardDef[]>(() => {
  const m = currentMetrics.value
  return [
    {
      label: '发货仓库数',
      displayValue: String(m.warehouseCount),
      icon: 'OfficeBuilding',
      color: '#3b83f6', bgColor: '#eff6ff',
      trend: '持平', trendUp: true, trendClass: 'trend-neutral'
    },
    {
      label: '配送总单量',
      displayValue: formatNum(m.totalOrders),
      icon: 'Tickets',
      color: '#3b83f6', bgColor: '#eff6ff',
      trend: '+12.3%', trendUp: true, trendClass: 'trend-good'
    },
    {
      label: '总件数',
      displayValue: formatNum(m.totalItems),
      icon: 'Box',
      color: '#8b5cf6', bgColor: '#f5f3ff',
      trend: '+8.7%', trendUp: true, trendClass: 'trend-good'
    },
    {
      label: '覆盖门店数',
      displayValue: formatNum(m.storeCount),
      icon: 'Shop',
      color: '#06b6d4', bgColor: '#ecfeff',
      trend: '+3.2%', trendUp: true, trendClass: 'trend-good'
    },
    {
      label: '及时送达单量',
      displayValue: formatNum(m.onTimeOrders),
      icon: 'CircleCheck',
      color: '#22c55e', bgColor: '#f0fdf4',
      trend: '-5.2%', trendUp: false, trendClass: 'trend-bad'
    },
    {
      label: '配送准时率',
      displayValue: m.onTimeRate.toFixed(2) + '%',
      icon: 'Odometer',
      color: m.onTimeRate >= 95 ? '#22c55e' : m.onTimeRate >= 80 ? '#f59e0b' : '#ef4444',
      bgColor: m.onTimeRate >= 95 ? '#f0fdf4' : m.onTimeRate >= 80 ? '#fffbeb' : '#fef2f2',
      trend: '-2.1%', trendUp: false, trendClass: 'trend-bad'
    },
    {
      label: '未派送量',
      displayValue: formatNum(m.undelivered),
      icon: 'Van',
      color: m.undelivered > 100 ? '#ef4444' : '#f59e0b',
      bgColor: m.undelivered > 100 ? '#fef2f2' : '#fffbeb',
      trend: '+15.8%', trendUp: true, trendClass: 'trend-bad'
    },
    {
      label: '客诉异常单量',
      displayValue: String(m.complaints),
      icon: 'Warning',
      color: m.complaints > 10 ? '#ef4444' : '#f59e0b',
      bgColor: m.complaints > 10 ? '#fef2f2' : '#fffbeb',
      trend: '+2', trendUp: true, trendClass: 'trend-bad'
    },
    {
      label: '客诉率',
      displayValue: m.complaintRate.toFixed(2) + '%',
      icon: 'ChatDotRound',
      color: m.complaintRate > 2 ? '#ef4444' : '#f59e0b',
      bgColor: m.complaintRate > 2 ? '#fef2f2' : '#fffbeb',
      trend: '+0.03%', trendUp: true, trendClass: 'trend-bad'
    }
  ]
})

// ──── Trend Chart Option (Bar + Line) ────
const trendChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    textStyle: { color: '#334155', fontSize: 13 },
    axisPointer: { type: 'shadow' }
  },
  legend: {
    top: 0,
    left: 0,
    textStyle: { color: '#64748b', fontSize: 12 },
    itemWidth: 14,
    itemHeight: 8,
    itemGap: 20
  },
  grid: { top: 40, right: 60, bottom: 24, left: 50, containLabel: true },
  xAxis: {
    type: 'category',
    data: getLast7Days(),
    axisLine: { lineStyle: { color: '#e2e8f0' } },
    axisTick: { show: false },
    axisLabel: { color: '#94a3b8', fontSize: 12 }
  },
  yAxis: [
    {
      type: 'value',
      name: '单量',
      nameTextStyle: { color: '#94a3b8', fontSize: 11, padding: [0, 40, 0, 0] },
      splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
      axisLabel: { color: '#94a3b8', fontSize: 12 },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    {
      type: 'value',
      name: '准时率(%)',
      min: 50,
      max: 100,
      nameTextStyle: { color: '#94a3b8', fontSize: 11, padding: [0, 0, 0, 40] },
      splitLine: { show: false },
      axisLabel: { color: '#94a3b8', fontSize: 12, formatter: '{value}%' },
      axisLine: { show: false },
      axisTick: { show: false }
    }
  ],
  series: [
    {
      name: '配送单量',
      type: 'bar',
      barWidth: '40%',
      itemStyle: {
        borderRadius: [4, 4, 0, 0],
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: '#60a5fa' },
            { offset: 1, color: '#3b83f6' }
          ]
        }
      },
      data: [1102, 1234, 1156, 1089, 1345, 1198, 1286]
    },
    {
      name: '准时率',
      type: 'line',
      yAxisIndex: 1,
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: { color: '#22c55e', width: 2.5 },
      itemStyle: { color: '#22c55e', borderColor: '#fff', borderWidth: 2 },
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(34,197,94,0.15)' },
            { offset: 1, color: 'rgba(34,197,94,0.01)' }
          ]
        }
      },
      data: [85.3, 82.1, 88.4, 79.6, 83.2, 81.5, 80.7]
    }
  ]
}))

// ──── Inbound Data (入库) ────
const inboundDataMap: Record<string, { planned: number; actual: number; rate: number }> = {
  all: { planned: 5200, actual: 4876, rate: 93.8 },
  dongguan: { planned: 1500, actual: 1423, rate: 94.9 },
  beijing: { planned: 1300, actual: 1289, rate: 99.2 },
  shanghai: { planned: 1200, actual: 1102, rate: 91.8 },
  xian: { planned: 1200, actual: 1062, rate: 88.5 }
}
const inboundData = computed(() => inboundDataMap[selectedWarehouse.value] || inboundDataMap.all)

// ──── Outbound Funnel (出库) ────
const outboundFunnelMap: Record<string, { label: string; value: number; color: string }[]> = {
  all: [
    { label: '待拣货', value: 186, color: '#94a3b8' },
    { label: '拣货中', value: 245, color: '#3b83f6' },
    { label: '待复核', value: 312, color: '#8b5cf6' },
    { label: '待发货', value: 158, color: '#f59e0b' },
    { label: '已出库', value: 1286, color: '#22c55e' }
  ],
  dongguan: [
    { label: '待拣货', value: 52, color: '#94a3b8' },
    { label: '拣货中', value: 68, color: '#3b83f6' },
    { label: '待复核', value: 87, color: '#8b5cf6' },
    { label: '待发货', value: 44, color: '#f59e0b' },
    { label: '已出库', value: 359, color: '#22c55e' }
  ],
  beijing: [
    { label: '待拣货', value: 38, color: '#94a3b8' },
    { label: '拣货中', value: 55, color: '#3b83f6' },
    { label: '待复核', value: 72, color: '#8b5cf6' },
    { label: '待发货', value: 35, color: '#f59e0b' },
    { label: '已出库', value: 312, color: '#22c55e' }
  ],
  shanghai: [
    { label: '待拣货', value: 45, color: '#94a3b8' },
    { label: '拣货中', value: 60, color: '#3b83f6' },
    { label: '待复核', value: 78, color: '#8b5cf6' },
    { label: '待发货', value: 40, color: '#f59e0b' },
    { label: '已出库', value: 298, color: '#22c55e' }
  ],
  xian: [
    { label: '待拣货', value: 51, color: '#94a3b8' },
    { label: '拣货中', value: 62, color: '#3b83f6' },
    { label: '待复核', value: 75, color: '#8b5cf6' },
    { label: '待发货', value: 39, color: '#f59e0b' },
    { label: '已出库', value: 317, color: '#22c55e' }
  ]
}
const outboundTotal = computed(() => {
  const raw = outboundFunnelMap[selectedWarehouse.value] || outboundFunnelMap.all
  return raw.reduce((sum, r) => sum + r.value, 0)
})
const outboundFunnel = computed(() => {
  const raw = outboundFunnelMap[selectedWarehouse.value] || outboundFunnelMap.all
  const maxVal = Math.max(...raw.map(r => r.value))
  return raw.map(r => ({ ...r, pct: Math.max((r.value / maxVal) * 100, 18) }))
})

// ──── Inventory Data (库存临期/过期) ────
const inventoryMap: Record<string, { nearExpiry: number; expired: number }> = {
  all: { nearExpiry: 324, expired: 47 },
  dongguan: { nearExpiry: 102, expired: 18 },
  beijing: { nearExpiry: 85, expired: 12 },
  shanghai: { nearExpiry: 76, expired: 9 },
  xian: { nearExpiry: 61, expired: 8 }
}
const inventoryData = computed(() => inventoryMap[selectedWarehouse.value] || inventoryMap.all)

// ──── Warehouse Table ────
const warehouseTableData = computed(() => [
  { name: '东莞沙田仓', totalOrders: 359, totalItems: 1265, storeCount: 228, onTimeOrders: 229, onTimeRate: 63.79, undelivered: 130, complaints: 8, complaintRate: 2.23 },
  { name: '北京顺义仓', totalOrders: 312, totalItems: 1087, storeCount: 245, onTimeOrders: 312, onTimeRate: 100, undelivered: 0, complaints: 2, complaintRate: 0.64 },
  { name: '上海嘉定仓', totalOrders: 298, totalItems: 1024, storeCount: 198, onTimeOrders: 298, onTimeRate: 100, undelivered: 0, complaints: 3, complaintRate: 1.01 },
  { name: '西安灞桥仓', totalOrders: 317, totalItems: 1147, storeCount: 221, onTimeOrders: 199, onTimeRate: 62.78, undelivered: 118, complaints: 2, complaintRate: 0.63 }
])

const tableHeaderStyle = () => ({
  background: '#f8fafc',
  color: '#475569',
  fontWeight: '600',
  fontSize: '13px',
  borderBottom: '2px solid #e2e8f0'
})

const tableRowClass = ({ row }: { row: any }) => {
  if (row.onTimeRate < 70) return 'row-danger'
  return ''
}

// ──── Helpers ────
function formatNum(n: number): string {
  return n.toLocaleString('zh-CN')
}

function getLast7Days(): string[] {
  const days: string[] = []
  for (let i = 6; i >= 0; i--) {
    days.push(dayjs(selectedDate.value).subtract(i, 'day').format('MM-DD'))
  }
  return days
}

function onWarehouseChange() {
  updateTime.value = dayjs().format('YYYY-MM-DD HH:mm:ss')
}
</script>

<style lang="scss" scoped>
// ──── Variables ────
$primary: #3b83f6;
$primary-light: #eff6ff;
$primary-50: #dbeafe;
$success: #22c55e;
$warning: #f59e0b;
$danger: #ef4444;
$bg: #f1f5f9;
$card: #ffffff;
$text-1: #1e293b;
$text-2: #475569;
$text-3: #94a3b8;
$border: #e2e8f0;
$shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
$shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
$shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
$radius: 12px;

// ──── Animations ────
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

// ──── Root ────
.delivery-dashboard {
  padding: 16px 20px 24px;
  background: $bg;
  min-height: calc(100vh - 84px);
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif;
}

// ──── Filter Bar ────
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: $card;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: $shadow-sm;
  margin-bottom: 16px;
  border: 1px solid $border;

  .filter-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .filter-right {
    .update-time {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: $text-3;

      .el-icon {
        color: $primary;
      }
    }
  }
}

// ──── KPI Grid ────
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.kpi-card {
  background: $card;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid $border;
  box-shadow: $shadow-sm;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: default;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeInUp 0.5s ease both;
  animation-delay: var(--delay, 0s);

  &:hover {
    box-shadow: $shadow-md;
    transform: translateY(-3px);
    border-color: rgba($primary, 0.25);
  }

  .kpi-icon-wrap {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .kpi-body {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 1;

    .kpi-label {
      font-size: 13px;
      color: $text-3;
      margin-bottom: 6px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .kpi-value {
      font-size: 26px;
      font-weight: 700;
      color: $text-1;
      line-height: 1.1;
      margin-bottom: 6px;
      letter-spacing: -0.5px;
    }

    .kpi-trend {
      display: flex;
      align-items: center;
      gap: 2px;
      font-size: 12px;
      font-weight: 500;

      &.trend-good {
        color: $success;
      }
      &.trend-bad {
        color: $danger;
      }
      &.trend-neutral {
        color: $text-3;
      }
    }
  }
}

// ──── Charts Row ────
.charts-row {
  display: grid;
  grid-template-columns: 2fr 3fr;
  gap: 16px;
  margin-bottom: 16px;
  align-items: start;
}

.chart-card {
  background: $card;
  border-radius: 8px;
  border: 1px solid $border;
  box-shadow: $shadow-sm;
  padding: 20px;
  animation: fadeInUp 0.5s ease 0.55s both;
}

.card-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 16px;

  .title-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .title-right {
    flex-shrink: 0;
  }

  .title-bar {
    width: 4px;
    height: 18px;
    background: $primary;
    border-radius: 2px;
  }

  h3 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: $text-1;
  }
}

// ──── Tab Switcher ────
.ops-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 20px;
  border-bottom: 2px solid #f1f5f9;
}

.ops-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: all 0.25s ease;
  user-select: none;

  .ops-tab-label {
    font-size: 14px;
    font-weight: 500;
    color: $text-3;
    transition: color 0.25s ease;
  }

  .ops-tab-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    height: 20px;
    padding: 0 7px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    background: #f1f5f9;
    color: $text-3;
    transition: all 0.25s ease;

    &.badge-blue {
      background: $primary;
      color: #fff;
    }
    &.badge-purple {
      background: #8b5cf6;
      color: #fff;
    }
    &.badge-orange {
      background: $warning;
      color: #fff;
    }
  }

  &.active {
    border-bottom-color: $primary;

    .ops-tab-label {
      color: $text-1;
      font-weight: 600;
    }
  }

  &:hover:not(.active) {
    .ops-tab-label {
      color: $text-2;
    }
  }
}

.ops-tab-content {
  min-height: 160px;
}

// Tab transition
.tab-fade-enter-active,
.tab-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.tab-fade-enter-from {
  opacity: 0;
  transform: translateX(12px);
}
.tab-fade-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}

// ──── Operations Panel ────
.ops-section {
  padding: 14px 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #f1f5f9;

  .ops-section-header {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
    color: $text-1;
    margin-bottom: 12px;
  }
}

.ops-metrics-row {
  display: flex;
  gap: 20px;

  .ops-metric {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;

    .ops-metric-label {
      font-size: 12px;
      color: $text-3;
    }
    .ops-metric-value {
      font-size: 22px;
      font-weight: 700;
      line-height: 1.2;
      &.blue { color: $primary; }
      &.green { color: $success; }
      &.orange { color: $warning; }
    }
    .ops-metric-unit {
      font-size: 11px;
      color: $text-3;
    }
  }
}

// ──── Funnel ────
.funnel-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.funnel-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  animation: fadeInUp 0.4s ease both;
  animation-delay: var(--delay, 0s);

  .funnel-bar-fill {
    width: var(--bar-width);
    height: 22px;
    background: var(--bar-color);
    border-radius: 4px;
    min-width: 18%;
    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    opacity: 0.85;
  }

  .funnel-bar-info {
    display: flex;
    align-items: center;
    gap: 8px;
    white-space: nowrap;

    .funnel-label {
      font-size: 12px;
      color: $text-2;
      min-width: 48px;
    }
    .funnel-value {
      font-size: 13px;
      font-weight: 600;
      color: $text-1;
      font-variant-numeric: tabular-nums;
    }
  }
}

// ──── Inventory Cards ────
.inventory-row {
  gap: 12px;
}

.inventory-card {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }

  &.warn {
    background: #fffbeb;
    border: 1px solid rgba($warning, 0.2);
    .inventory-icon-wrap { color: $warning; }
    .inventory-value { color: $warning; }
  }

  &.danger {
    background: #fef2f2;
    border: 1px solid rgba($danger, 0.2);
    .inventory-icon-wrap { color: $danger; }
    .inventory-value { color: $danger; }
  }

  .inventory-icon-wrap {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background: rgba(255,255,255,0.7);
    flex-shrink: 0;
  }

  .inventory-info {
    display: flex;
    flex-direction: column;

    .inventory-label {
      font-size: 12px;
      color: $text-3;
    }
    .inventory-value {
      font-size: 20px;
      font-weight: 700;
      line-height: 1.2;
    }
    .inventory-unit {
      font-size: 11px;
      color: $text-3;
    }
  }
}

// ──── Warehouse Table ────
.table-section {
  background: $card;
  border-radius: 8px;
  border: 1px solid $border;
  box-shadow: $shadow-sm;
  padding: 20px;
  animation: fadeInUp 0.5s ease 0.6s both;

  :deep(.el-table) {
    --el-table-border-color: #{$border};
    --el-table-row-hover-bg-color: #{$primary-light};

    .el-table__header-wrapper {
      th {
        font-size: 13px !important;
      }
    }

    .el-table__body-wrapper {
      td {
        font-size: 13px;
        color: $text-2;
      }
    }
  }

  :deep(.row-danger) {
    td {
      background-color: #fef2f2 !important;
    }
  }

  .warehouse-name {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
    color: $text-1;
  }

  .num-cell {
    font-variant-numeric: tabular-nums;
    font-weight: 500;
  }

  .danger-text {
    color: $danger;
    font-weight: 600;
  }
}



// ──── Responsive ────
@media (max-width: 1400px) {
  .kpi-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  .charts-row {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 1024px) {
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .charts-row {
    grid-template-columns: 1fr;
  }
}
</style>
