<template>
  <div class="mobile-dashboard-page">
    <!-- PC Top Navigation / Control Bar -->
    <div class="control-bar">
      <div class="bar-left">
        <el-icon class="icon"><Cellphone /></el-icon>
        <span class="title">移动端动态指标控制台</span>
        <el-tag size="small" type="success" effect="light" class="tag">T+1 跑批数据</el-tag>
      </div>

      <div class="bar-right">
        <!-- 维度切换 -->
        <el-select v-model="selectedDimension" size="small" class="dimension-select">
          <el-option label="全国总部大盘" value="nationwide" />
          <el-option label="华东大区" value="east_china" />
          <el-option label="华北大区" value="north_china" />
          <el-option label="上海分拨中心" value="shanghai_hub" />
        </el-select>

        <!-- 归档日期 -->
        <el-date-picker
          v-model="selectedDate"
          type="date"
          size="small"
          placeholder="数据归档日"
          value-format="YYYY-MM-DD"
          :clearable="false"
          class="date-picker"
        />

        <!-- 视图模式切换 -->
        <el-radio-group v-model="viewMode" size="small">
          <el-radio-button label="mobile">真机模拟 (390px)</el-radio-button>
          <el-radio-button label="responsive">响应式平铺</el-radio-button>
        </el-radio-group>

        <!-- 进入配置管理 -->
        <el-button size="small" type="primary" plain :icon="Setting" @click="goToConfig">
          看板配置管理
        </el-button>
      </div>
    </div>

    <!-- Main Container -->
    <div class="content-wrapper" :class="{ 'is-mobile-frame': viewMode === 'mobile' }">
      <!-- Simulated Phone Shell if in mobile view -->
      <div class="phone-shell">
        <!-- Mobile Status Bar -->
        <div class="phone-status-bar">
          <span class="time">{{ currentClock }}</span>
          <div class="notch-camera"></div>
          <div class="status-icons">
            <span class="signal">5G</span>
            <span class="battery">100%</span>
          </div>
        </div>

        <!-- Mobile App Header -->
        <div class="mobile-app-header">
          <div class="app-title-box">
            <h1 class="app-title">运营指标看板</h1>
            <p class="app-subtitle">
              <span>{{ selectedDimensionLabel }}</span> · <span>{{ selectedDate }} 归档</span>
            </p>
          </div>
          <div class="config-entry-btn" @click="goToConfig" title="配置展示指标">
            <el-icon><Setting /></el-icon>
          </div>
        </div>

        <!-- Metric Cards Container -->
        <div class="cards-scroll-body">
          <div v-if="visibleMetrics.length === 0" class="empty-tip">
            <el-empty description="暂无可展示指标，请在看板配置管理中开启" />
          </div>

          <div
            v-for="item in visibleMetrics"
            :key="item.id"
            class="metric-card"
            :class="{ 'expanded': expandedMap[item.metricKey] }"
            @click="toggleExpand(item.metricKey)"
          >
            <!-- Card Header -->
            <div class="card-header">
              <span class="metric-name">{{ item.displayName }}</span>
              <div class="expand-icon" :class="{ 'rotated': expandedMap[item.metricKey] }">
                <el-icon><ArrowDown /></el-icon>
              </div>
            </div>

            <!-- Card Value -->
            <div class="card-value-row">
              <span class="main-val">{{ formatNumber(getMetricData(item.metricKey).current) }}</span>
              <span v-if="item.unit" class="unit">{{ item.unit }}</span>
            </div>

            <!-- Card Bottom DoD / WoW -->
            <div class="card-rates-row">
              <!-- 日环比 -->
              <div
                class="rate-badge"
                :class="getRateColorClass(getMetricData(item.metricKey).dod, item.trendType)"
              >
                <span class="rate-label">日环比</span>
                <el-icon v-if="getMetricData(item.metricKey).dod > 0"><Top /></el-icon>
                <el-icon v-else-if="getMetricData(item.metricKey).dod < 0"><Bottom /></el-icon>
                <span class="rate-val">{{ Math.abs(getMetricData(item.metricKey).dod) }}%</span>
              </div>

              <!-- 周同比 -->
              <div
                class="rate-badge"
                :class="getRateColorClass(getMetricData(item.metricKey).wow, item.trendType)"
              >
                <span class="rate-label">周同比</span>
                <el-icon v-if="getMetricData(item.metricKey).wow > 0"><Top /></el-icon>
                <el-icon v-else-if="getMetricData(item.metricKey).wow < 0"><Bottom /></el-icon>
                <span class="rate-val">{{ Math.abs(getMetricData(item.metricKey).wow) }}%</span>
              </div>
            </div>

            <!-- Drill-down 30-Day Trend Chart -->
            <transition name="drilldown">
              <div
                v-if="expandedMap[item.metricKey]"
                class="chart-drawer"
                @click.stop
              >
                <div class="chart-title">
                  <span>近 30 天走势分析</span>
                  <span class="hint">滑动可查看详细数值</span>
                </div>
                <div class="echart-box" :ref="el => setChartRef(el, item.metricKey)"></div>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import {
  Cellphone,
  Setting,
  ArrowDown,
  Top,
  Bottom
} from '@element-plus/icons-vue'
import { useMetricConfigStore } from '@/store/modules/metricConfig'

const router = useRouter()
const metricStore = useMetricConfigStore()

const viewMode = ref<'mobile' | 'responsive'>('mobile')
const selectedDimension = ref('nationwide')
const selectedDate = ref('2026-09-20')
const currentClock = ref('09:41')

const dimensionNames: Record<string, string> = {
  nationwide: '全国总部大盘',
  east_china: '华东大区',
  north_china: '华北大区',
  shanghai_hub: '上海分拨中心'
}

const selectedDimensionLabel = computed(() => dimensionNames[selectedDimension.value] || '全国总部大盘')

// 排序并过滤出可见指标
const visibleMetrics = computed(() => {
  return [...metricStore.configs]
    .filter(c => c.isVisible)
    .sort((a, b) => a.sortOrder - b.sortOrder)
})

// 控制展开折叠
const expandedMap = ref<Record<string, boolean>>({})
const chartInstances: Record<string, echarts.ECharts> = {}
const chartDomRefs: Record<string, HTMLElement> = {}

const setChartRef = (el: any, key: string) => {
  if (el) {
    chartDomRefs[key] = el as HTMLElement
  }
}

// 模拟每个指标的当期与同环比数据
const mockMetricValues: Record<string, { current: number; dod: number; wow: number; base: number }> = {
  order_count: { current: 5824.6, dod: 12.4, wow: 8.6, base: 5000 },
  delivery_amount: { current: 12890.2, dod: 4.8, wow: 15.2, base: 11000 },
  timeliness_rate: { current: 98.6, dod: 0.8, wow: 1.2, base: 97 },
  avg_transit_hours: { current: 18.2, dod: -2.5, wow: -4.1, base: 20 },
  complaint_rate: { current: 14.8, dod: -15.4, wow: -22.1, base: 22 },
  damage_loss_cost: { current: 3200, dod: -8.1, wow: -12.0, base: 4000 }
}

const getMetricData = (key: string) => {
  return mockMetricValues[key] || { current: 100, dod: 2.5, wow: 5.0, base: 100 }
}

const formatNumber = (val: number) => {
  return val.toLocaleString('zh-CN')
}

// 红涨绿跌色彩映射 (中国习惯：涨红跌绿)
const getRateColorClass = (rate: number, trendType: 'positive' | 'negative') => {
  if (rate === 0) return 'neutral'
  const isUp = rate > 0
  if (trendType === 'positive') {
    return isUp ? 'is-rise' : 'is-fall'
  } else {
    // 负向指标（如耗时、客诉率），上涨为警示红，下跌为良好绿
    return isUp ? 'is-rise' : 'is-fall'
  }
}

// 切换展开折叠
const toggleExpand = async (metricKey: string) => {
  expandedMap.value[metricKey] = !expandedMap.value[metricKey]

  if (expandedMap.value[metricKey]) {
    await nextTick()
    setTimeout(() => {
      renderChart(metricKey)
    }, 100)
  } else {
    if (chartInstances[metricKey]) {
      chartInstances[metricKey].dispose()
      delete chartInstances[metricKey]
    }
  }
}

// 渲染近 30 天 ECharts 走势
const renderChart = (metricKey: string) => {
  const dom = chartDomRefs[metricKey]
  if (!dom) return

  if (chartInstances[metricKey]) {
    chartInstances[metricKey].dispose()
  }

  const chart = echarts.init(dom)
  chartInstances[metricKey] = chart

  const config = metricStore.configs.find(c => c.metricKey === metricKey)
  const meta = getMetricData(metricKey)

  // 模拟近 30 天走势点
  const dates: string[] = []
  const values: number[] = []
  const now = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 3600 * 1000)
    dates.push(`${d.getMonth() + 1}/${d.getDate()}`)
    const fluctuation = (Math.sin(i / 3) * 0.15 + (Math.random() - 0.5) * 0.08)
    const val = Number((meta.base * (1 + fluctuation)).toFixed(1))
    values.push(val)
  }

  const isPositive = config?.trendType === 'positive'
  const themeColor = isPositive ? '#f56c6c' : '#00bebe'
  const areaColor = isPositive ? 'rgba(245, 108, 108, 0.2)' : 'rgba(0, 190, 190, 0.2)'

  const option: echarts.EChartsOption = {
    grid: {
      left: 36,
      right: 12,
      top: 20,
      bottom: 24
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 33, 64, 0.85)',
      borderColor: 'transparent',
      textStyle: { color: '#fff', fontSize: 11 },
      formatter: (params: any) => {
        const p = Array.isArray(params) ? params[0] : params
        return `${p.name}<br/><b>${p.value}</b> ${config?.unit || ''}`
      }
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { lineStyle: { color: '#e4e7ed' } },
      axisTick: { show: false },
      axisLabel: { color: '#909399', fontSize: 9, interval: 6 }
    },
    yAxis: {
      type: 'value',
      scale: true,
      splitLine: { show: false }, // 隐藏网格线
      axisLabel: { color: '#909399', fontSize: 9 }
    },
    series: [
      {
        name: config?.displayName || '数值',
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: values,
        lineStyle: { width: 2.5, color: themeColor },
        itemStyle: { color: themeColor },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: areaColor },
            { offset: 1, color: 'rgba(255, 255, 255, 0)' }
          ])
        }
      }
    ]
  }

  chart.setOption(option)
}

const goToConfig = () => {
  router.push('/dashboard-config')
}

onMounted(() => {
  // 默认展开第一个指标卡片演示 ECharts 走势
  if (visibleMetrics.value.length > 0) {
    const firstKey = visibleMetrics.value[0].metricKey
    toggleExpand(firstKey)
  }
})
</script>

<style scoped lang="scss">
.mobile-dashboard-page {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 84px);
  background-color: #eef2f7;

  .control-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
    padding: 12px 24px;
    border-bottom: 1px solid #e4e7ed;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
    z-index: 10;

    .bar-left {
      display: flex;
      align-items: center;
      gap: 8px;

      .icon {
        font-size: 20px;
        color: #00bebe;
      }

      .title {
        font-size: 16px;
        font-weight: 600;
        color: #1f2d3d;
      }

      .tag {
        margin-left: 4px;
      }
    }

    .bar-right {
      display: flex;
      align-items: center;
      gap: 12px;

      .dimension-select {
        width: 140px;
      }
      .date-picker {
        width: 140px;
      }
    }
  }

  .content-wrapper {
    flex: 1;
    display: flex;
    justify-content: center;
    padding: 24px 16px;

    &.is-mobile-frame {
      .phone-shell {
        width: 390px;
        max-width: 100%;
        height: 780px;
        border-radius: 40px;
        border: 10px solid #1f2937;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        overflow: hidden;
      }
    }

    &:not(.is-mobile-frame) {
      .phone-shell {
        width: 100%;
        max-width: 900px;
        border-radius: 12px;
        border: 1px solid #e5e7eb;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
      }
      .phone-status-bar {
        display: none;
      }
    }
  }

  .phone-shell {
    background: #f8fafc;
    display: flex;
    flex-direction: column;
    position: relative;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    .phone-status-bar {
      height: 38px;
      background: #fff;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 24px;
      font-size: 12px;
      font-weight: 600;
      color: #1e293b;

      .notch-camera {
        width: 80px;
        height: 18px;
        background: #0f172a;
        border-radius: 12px;
      }

      .status-icons {
        display: flex;
        gap: 6px;
        font-size: 10px;
      }
    }

    .mobile-app-header {
      background: #fff;
      padding: 14px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #f1f5f9;

      .app-title {
        font-size: 17px;
        font-weight: 700;
        color: #0f172a;
        margin: 0;
      }

      .app-subtitle {
        font-size: 11px;
        color: #64748b;
        margin: 2px 0 0 0;
      }

      .config-entry-btn {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: #f1f5f9;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #475569;
        cursor: pointer;
        transition: background 0.2s;

        &:hover {
          background: #e2e8f0;
          color: #00bebe;
        }
      }
    }

    .cards-scroll-body {
      flex: 1;
      overflow-y: auto;
      padding: 14px 16px 28px;
      display: flex;
      flex-direction: column;
      gap: 12px;

      .metric-card {
        background: #fff;
        border-radius: 14px;
        padding: 16px;
        border: 1px solid #f1f5f9;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
        cursor: pointer;
        transition: all 0.25s ease;

        &:hover {
          border-color: #cbd5e1;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
        }

        &.expanded {
          border-color: #00bebe;
          box-shadow: 0 4px 16px rgba(0, 190, 190, 0.12);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .metric-name {
            font-size: 13px;
            font-weight: 500;
            color: #64748b;
          }

          .expand-icon {
            color: #94a3b8;
            transition: transform 0.25s;

            &.rotated {
              transform: rotate(180deg);
              color: #00bebe;
            }
          }
        }

        .card-value-row {
          margin-top: 8px;
          display: flex;
          align-items: baseline;
          gap: 6px;

          .main-val {
            font-size: 26px;
            font-weight: 800;
            color: #0f172a;
            font-family: 'Helvetica Neue', Arial, sans-serif;
            letter-spacing: -0.5px;
          }

          .unit {
            font-size: 12px;
            color: #64748b;
          }
        }

        .card-rates-row {
          margin-top: 10px;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;

          .rate-badge {
            display: inline-flex;
            align-items: center;
            gap: 2px;
            font-size: 11px;
            padding: 2px 8px;
            border-radius: 6px;
            font-weight: 600;

            .rate-label {
              font-weight: normal;
              opacity: 0.85;
              margin-right: 2px;
            }

            &.is-rise {
              background: #fef2f2;
              color: #ef4444; // 红涨
            }

            &.is-fall {
              background: #f0fdf4;
              color: #22c55e; // 绿跌
            }

            &.neutral {
              background: #f1f5f9;
              color: #94a3b8;
            }
          }
        }

        .chart-drawer {
          margin-top: 14px;
          padding-top: 12px;
          border-top: 1px dashed #e2e8f0;

          .chart-title {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 11px;
            color: #64748b;
            font-weight: 600;
            margin-bottom: 6px;

            .hint {
              font-size: 10px;
              color: #94a3b8;
              font-weight: normal;
            }
          }

          .echart-box {
            width: 100%;
            height: 160px;
          }
        }
      }
    }
  }
}

.drilldown-enter-active,
.drilldown-leave-active {
  transition: all 0.25s ease-out;
}
.drilldown-enter-from,
.drilldown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
