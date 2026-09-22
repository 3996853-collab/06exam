<template>
  <div class="mobile-dashboard-page">
    <!-- PC Top Navigation / Control Bar -->
    <div class="control-bar">
      <div class="bar-left">
        <el-icon class="icon"><Cellphone /></el-icon>
        <span class="title">小程序移动端指标看板</span>
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
      <div class="phone-shell">
        <!-- 1. 小程序顶部状态栏 (Status Bar) -->
        <div class="phone-status-bar">
          <span class="time">{{ currentClock }}</span>
          <div class="notch-camera"></div>
          <div class="status-icons">
            <span class="signal">5G</span>
            <span class="battery">100%</span>
          </div>
        </div>

        <!-- 2. 小程序原生导航栏带微信胶囊 (Mini-Program Navbar & Capsule) -->
        <div class="mini-app-navbar">
          <div class="nav-title-area">
            <span class="nav-title">移动端数据看板</span>
            <span class="nav-subtitle">{{ selectedDimensionLabel }} · {{ selectedDate }}</span>
          </div>
          <!-- 微信小程序经典胶囊按钮 -->
          <div class="wechat-capsule">
            <span class="capsule-dots">•••</span>
            <span class="capsule-divider"></span>
            <span class="capsule-circle">○</span>
          </div>
        </div>

        <!-- 3. 顶部 2 栏切换：业务数据 vs 基础数据 -->
        <div class="top-segmented-bar">
          <div
            class="segment-item"
            :class="{ 'active': activeMainTab === 'business' }"
            @click="switchMainTab('business')"
          >
            <el-icon class="seg-icon"><DataAnalysis /></el-icon>
            <span>业务数据</span>
            <div v-if="activeMainTab === 'business'" class="active-indicator"></div>
          </div>
          <div
            class="segment-item"
            :class="{ 'active': activeMainTab === 'basic' }"
            @click="switchMainTab('basic')"
          >
            <el-icon class="seg-icon"><Files /></el-icon>
            <span>基础数据</span>
            <div v-if="activeMainTab === 'basic'" class="active-indicator"></div>
          </div>
        </div>

        <!-- 4. 当前分类快速二级 Pill 导航 -->
        <div class="sub-nav-pill-bar">
          <div
            v-for="sub in currentSubCategoryTabs"
            :key="sub.key"
            class="pill-tab"
            :class="{ 'active': activeSubTab === sub.key }"
            @click="activeSubTab = sub.key"
          >
            <span>{{ sub.name }}</span>
            <span class="count-badge">{{ getMetricsBySub(sub.key).length }}</span>
          </div>
        </div>

        <!-- 5. 可滚动卡片内容区 (Cards Scroll Body) -->
        <div class="cards-scroll-body" ref="scrollContainer">
          <!-- 业务数据分类 -->
          <template v-if="activeMainTab === 'business'">
            <div class="category-header-banner">
              <div class="banner-title">
                <span class="dot"></span>
                <span>{{ currentSubCategoryTitle }}</span>
              </div>
              <span class="banner-sub">共 {{ currentMetricList.length }} 项监控指标 (T+1 跑批)</span>
            </div>

            <div v-if="currentMetricList.length === 0" class="empty-tip">
              <el-empty description="暂无该分类的指标数据" />
            </div>

            <!-- 标准指标卡片瀑布流 -->
            <div
              v-for="item in currentMetricList"
              :key="item.id"
              class="metric-card"
              :class="{ 'expanded': expandedMap[item.metricKey] }"
              @click="toggleExpand(item.metricKey)"
            >
              <!-- Card Header -->
              <div class="card-header">
                <div class="metric-name-group">
                  <span class="metric-name">{{ item.displayName }}</span>
                  <el-tag
                    size="small"
                    :type="item.trendType === 'positive' ? 'success' : 'warning'"
                    effect="plain"
                    class="trend-tag"
                  >
                    {{ item.trendType === 'positive' ? '正向指标' : '逆向指标' }}
                  </el-tag>
                </div>
                <div class="expand-icon" :class="{ 'rotated': expandedMap[item.metricKey] }">
                  <el-icon><ArrowDown /></el-icon>
                </div>
              </div>

              <!-- Card Value Row -->
              <div class="card-value-row">
                <span class="main-val">{{ formatNumber(item.value ?? 0) }}</span>
                <span v-if="item.unit" class="unit">{{ item.unit }}</span>
              </div>

              <!-- Card Bottom: 日环比 / 周同比 -->
              <div class="card-rates-row">
                <!-- 日环比 -->
                <div
                  class="rate-badge"
                  :class="getRateColorClass(item.dod ?? 0, item.trendType)"
                >
                  <span class="rate-label">日环比</span>
                  <el-icon v-if="(item.dod ?? 0) > 0"><Top /></el-icon>
                  <el-icon v-else-if="(item.dod ?? 0) < 0"><Bottom /></el-icon>
                  <span class="rate-val">{{ Math.abs(item.dod ?? 0) }}%</span>
                </div>

                <!-- 周同比 -->
                <div
                  class="rate-badge"
                  :class="getRateColorClass(item.wow ?? 0, item.trendType)"
                >
                  <span class="rate-label">周同比</span>
                  <el-icon v-if="(item.wow ?? 0) > 0"><Top /></el-icon>
                  <el-icon v-else-if="(item.wow ?? 0) < 0"><Bottom /></el-icon>
                  <span class="rate-val">{{ Math.abs(item.wow ?? 0) }}%</span>
                </div>
              </div>

              <!-- ECharts 趋势图平滑展开区 -->
              <transition name="drilldown">
                <div
                  v-if="expandedMap[item.metricKey]"
                  class="chart-drawer"
                  @click.stop
                >
                  <div class="chart-title">
                    <span class="title-text">
                      <el-icon><TrendCharts /></el-icon> 近 30 天走势波动
                    </span>
                    <span class="hint">滑动悬停可查数值</span>
                  </div>
                  <div class="echart-box" :ref="el => setChartRef(el, item.metricKey)"></div>
                </div>
              </transition>
            </div>
          </template>

          <!-- 基础数据分类 -->
          <template v-else>
            <!-- 场地信息 -->
            <div v-if="activeSubTab === 'site_info'" class="basic-section">
              <!-- 中心地址卡片 -->
              <div class="site-hero-card">
                <div class="site-badge">
                  <el-icon><Location /></el-icon> 中心枢纽总览
                </div>
                <div class="site-name">华东智能枢纽转运中心</div>
                <div class="site-addr">
                  <el-icon><OfficeBuilding /></el-icon>
                  <span>上海市青浦区华新镇华隆路1688号中通冷链华东枢纽园区</span>
                </div>
                <div class="site-tags">
                  <span class="tag-item">一级枢纽分拨</span>
                  <span class="tag-item">多温区全自动立体库</span>
                  <span class="tag-item">绿通直发专区</span>
                </div>
              </div>

              <!-- 月台与温控库房明细卡片 -->
              <div class="site-grid">
                <!-- 月台信息 -->
                <div class="facility-card">
                  <div class="fac-header">
                    <div class="fac-title">
                      <el-icon class="fac-icon dock"><Van /></el-icon>
                      <span>全封闭温控月台</span>
                    </div>
                    <el-tag type="success" size="small">五星评级 A+</el-tag>
                  </div>
                  <div class="fac-stats">
                    <div class="stat-col">
                      <div class="stat-num">36 <span class="u">个</span></div>
                      <div class="stat-lbl">月台泊位数量</div>
                    </div>
                    <div class="stat-col">
                      <div class="stat-num">2,450 <span class="u">㎡</span></div>
                      <div class="stat-lbl">月台总面积</div>
                    </div>
                    <div class="stat-col">
                      <div class="stat-num highlight">8.5 <span class="u">℃</span></div>
                      <div class="stat-lbl">月台平均控温</div>
                    </div>
                  </div>
                </div>

                <!-- 冷藏库信息 (0~4℃) -->
                <div class="facility-card">
                  <div class="fac-header">
                    <div class="fac-title">
                      <el-icon class="fac-icon chill"><MostlyCloudy /></el-icon>
                      <span>恒温冷藏库 (0~4℃)</span>
                    </div>
                    <el-tag type="primary" size="small">卓越 A级评级</el-tag>
                  </div>
                  <div class="fac-stats">
                    <div class="stat-col">
                      <div class="stat-num">6,800 <span class="u">㎡</span></div>
                      <div class="stat-lbl">冷藏库总面积</div>
                    </div>
                    <div class="stat-col">
                      <div class="stat-num chill-temp">2.3 <span class="u">℃</span></div>
                      <div class="stat-lbl">实时平均温度</div>
                    </div>
                    <div class="stat-col">
                      <div class="stat-num">±0.3 <span class="u">℃</span></div>
                      <div class="stat-lbl">波动温差幅度</div>
                    </div>
                  </div>
                </div>

                <!-- 冷冻库信息 (-18~-25℃) -->
                <div class="facility-card">
                  <div class="fac-header">
                    <div class="fac-title">
                      <el-icon class="fac-icon frozen"><Compass /></el-icon>
                      <span>深冷速冻库 (-18~-25℃)</span>
                    </div>
                    <el-tag type="primary" size="small">卓越 A级评级</el-tag>
                  </div>
                  <div class="fac-stats">
                    <div class="stat-col">
                      <div class="stat-num">5,200 <span class="u">㎡</span></div>
                      <div class="stat-lbl">冷冻库总面积</div>
                    </div>
                    <div class="stat-col">
                      <div class="stat-num frozen-temp">-19.6 <span class="u">℃</span></div>
                      <div class="stat-lbl">实时平均温度</div>
                    </div>
                    <div class="stat-col">
                      <div class="stat-num">24h</div>
                      <div class="stat-lbl">智能巡检守护</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 物资信息 -->
            <div v-else-if="activeSubTab === 'material_info'" class="basic-section">
              <div class="material-banner">
                <div class="banner-title">
                  <el-icon><Box /></el-icon> 冷链核心物资与周转器具统计
                </div>
                <div class="banner-desc">实时监控在库、在途、完好率与借调流转状态</div>
              </div>

              <div class="materials-list">
                <div
                  v-for="mat in getMetricsBySub('material_info')"
                  :key="mat.id"
                  class="material-item-card"
                >
                  <div class="mat-left">
                    <div class="mat-name">{{ mat.displayName }}</div>
                    <div class="mat-extra">{{ mat.extra }}</div>
                  </div>
                  <div class="mat-right">
                    <div class="mat-val">
                      {{ formatNumber(Number(mat.value)) }}
                      <span class="unit">{{ mat.unit }}</span>
                    </div>
                    <div class="mat-trend">
                      周环比: <span class="text-success">+{{ mat.wow }}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 服务网点 -->
            <div v-else-if="activeSubTab === 'service_outlet'" class="basic-section">
              <!-- 网点总量概览 -->
              <div class="outlet-hero-card">
                <div class="title-row">
                  <span class="title"><el-icon><Connection /></el-icon> 冷链服务网络总览</span>
                  <el-tag size="small" type="success">100% 数字化直连</el-tag>
                </div>
                <div class="outlet-main-stat">
                  <div class="huge-number">1,680 <span class="unit">家</span></div>
                  <div class="sub-lbl">服务网点总数 (覆盖全国重点核心城市群)</div>
                </div>

                <!-- 进度条占比 -->
                <div class="progress-section">
                  <div class="prog-labels">
                    <span class="delivery-lbl">交货网点 1,120 家 (66.7%)</span>
                    <span class="pickup-lbl">提货网点 560 家 (33.3%)</span>
                  </div>
                  <div class="dual-progress-bar">
                    <div class="bar-delivery" style="width: 66.7%"></div>
                    <div class="bar-pickup" style="width: 33.3%"></div>
                  </div>
                </div>
              </div>

              <!-- 分类卡片 -->
              <div class="outlet-cards-grid">
                <div class="outlet-detail-card">
                  <div class="card-icon delivery"><Van /></div>
                  <div class="card-info">
                    <div class="name">交货网点数</div>
                    <div class="val">1,120 <span class="u">家</span></div>
                    <div class="desc">具备冷链末端自提与定时派送能力</div>
                  </div>
                </div>

                <div class="outlet-detail-card">
                  <div class="card-icon pickup"><Box /></div>
                  <div class="card-info">
                    <div class="name">提货网点数</div>
                    <div class="val">560 <span class="u">家</span></div>
                    <div class="desc">覆盖冷链特色产地仓、生鲜前置集配站</div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- 6. 小程序原生底部 TabBar (Dock) -->
        <div class="phone-bottom-tabbar">
          <div
            v-for="tab in currentSubCategoryTabs"
            :key="tab.key"
            class="tab-bar-item"
            :class="{ 'active': activeSubTab === tab.key }"
            @click="activeSubTab = tab.key"
          >
            <el-icon class="tab-icon">
              <component :is="tab.icon" />
            </el-icon>
            <span class="tab-label">{{ tab.name }}</span>
            <span v-if="activeSubTab === tab.key" class="tab-dot"></span>
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
  Bottom,
  TrendCharts,
  DataAnalysis,
  Files,
  Box,
  Van,
  Odometer,
  OfficeBuilding,
  Location,
  Connection,
  MostlyCloudy,
  Compass
} from '@element-plus/icons-vue'
import {
  useMetricConfigStore,
  MainCategory,
  BusinessSubCategory,
  BasicSubCategory
} from '@/store/modules/metricConfig'

const router = useRouter()
const metricStore = useMetricConfigStore()

const viewMode = ref<'mobile' | 'responsive'>('mobile')
const selectedDimension = ref('nationwide')
const selectedDate = ref('2026-09-21')
const currentClock = ref('09:41')
const scrollContainer = ref<HTMLElement | null>(null)

const dimensionNames: Record<string, string> = {
  nationwide: '全国总部大盘',
  east_china: '华东大区',
  north_china: '华北大区',
  shanghai_hub: '上海分拨中心'
}

const selectedDimensionLabel = computed(() => dimensionNames[selectedDimension.value] || '全国总部大盘')

// 1. 顶部主分类切换：业务数据 vs 基础数据
const activeMainTab = ref<MainCategory>('business')

// 2. 业务数据下的底部三项分类
const businessSubTabs = [
  { key: 'operation_volume', name: '操作量', icon: Box },
  { key: 'operation_quality', name: '操作质量', icon: Odometer },
  { key: 'transport_quality', name: '运输质量', icon: Van }
]

// 3. 基础数据下的底部三项分类
const basicSubTabs = [
  { key: 'site_info', name: '场地信息', icon: OfficeBuilding },
  { key: 'material_info', name: '物资信息', icon: Box },
  { key: 'service_outlet', name: '服务网点', icon: Connection }
]

// 当前子分类 Tab
const activeSubTab = ref<string>('operation_volume')

// 根据主分类切换时的可用子分类
const currentSubCategoryTabs = computed(() => {
  return activeMainTab.value === 'business' ? businessSubTabs : basicSubTabs
})

// 主分类切换函数
const switchMainTab = (tab: MainCategory) => {
  activeMainTab.value = tab
  if (tab === 'business') {
    activeSubTab.value = 'operation_volume'
  } else {
    activeSubTab.value = 'site_info'
  }
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = 0
  }
}

// 切换子分类时平滑滚顶
watch(activeSubTab, () => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = 0
  }
})

// 获取当前子分类名称
const currentSubCategoryTitle = computed(() => {
  const allTabs = [...businessSubTabs, ...basicSubTabs]
  return allTabs.find(t => t.key === activeSubTab.value)?.name || '指标明细'
})

// 过滤指定子分类下的指标列表
const getMetricsBySub = (subKey: string) => {
  return metricStore.configs
    .filter(c => c.subCategory === subKey && c.isVisible)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

// 当前子分类展示中的指标列表
const currentMetricList = computed(() => {
  return getMetricsBySub(activeSubTab.value)
})

// 控制展开折叠与 ECharts 实例管理
const expandedMap = ref<Record<string, boolean>>({})
const chartInstances: Record<string, echarts.ECharts> = {}
const chartDomRefs: Record<string, HTMLElement> = {}

const setChartRef = (el: any, key: string) => {
  if (el) {
    chartDomRefs[key] = el as HTMLElement
  }
}

const formatNumber = (val: number | string) => {
  if (typeof val === 'number') {
    return val.toLocaleString('zh-CN')
  }
  return val
}

// 红涨绿跌色彩映射 (中国商务习惯：涨红跌绿)
const getRateColorClass = (rate: number, trendType: 'positive' | 'negative') => {
  if (rate === 0) return 'neutral'
  const isUp = rate > 0
  if (trendType === 'positive') {
    return isUp ? 'is-rise' : 'is-fall'
  } else {
    // 逆向指标（如超时、客诉率、临时托盘数），上涨为警示红，下跌为良好绿
    return isUp ? 'is-rise' : 'is-fall'
  }
}

// 展开/收起卡片并按需初始化折线图
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
  const baseNum = typeof config?.value === 'number' ? config.value : 100

  // 模拟近 30 天走势数据
  const dates: string[] = []
  const values: number[] = []
  const now = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 3600 * 1000)
    dates.push(`${d.getMonth() + 1}/${d.getDate()}`)
    const fluctuation = (Math.sin(i / 2.5) * 0.12 + (Math.random() - 0.5) * 0.06)
    const val = Number((baseNum * (1 + fluctuation)).toFixed(1))
    values.push(val)
  }

  const isPositive = config?.trendType === 'positive'
  const themeColor = isPositive ? '#f56c6c' : '#00bebe'
  const areaColor = isPositive ? 'rgba(245, 108, 108, 0.18)' : 'rgba(0, 190, 190, 0.18)'

  const option: echarts.EChartsOption = {
    grid: {
      left: 38,
      right: 12,
      top: 18,
      bottom: 24
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 33, 64, 0.88)',
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
      axisLabel: { color: '#909399', fontSize: 9, interval: 5 }
    },
    yAxis: {
      type: 'value',
      scale: true,
      splitLine: { show: false },
      axisLabel: { color: '#909399', fontSize: 9 }
    },
    series: [
      {
        name: config?.displayName || '数值',
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: values,
        lineStyle: { width: 2.2, color: themeColor },
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
  // 默认展开第一个指标卡片演示走势
  if (currentMetricList.value.length > 0) {
    const firstKey = currentMetricList.value[0].metricKey
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

  // 顶部 PC 控制栏
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

      .dimension-select,
      .date-picker {
        width: 140px;
      }
    }
  }

  // 核心展示区域
  .content-wrapper {
    flex: 1;
    display: flex;
    justify-content: center;
    padding: 20px 16px 28px;

    &.is-mobile-frame {
      .phone-shell {
        width: 395px;
        max-width: 100%;
        height: 820px;
        border-radius: 42px;
        border: 11px solid #1f2937;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
        overflow: hidden;
      }
    }

    &:not(.is-mobile-frame) {
      .phone-shell {
        width: 100%;
        max-width: 960px;
        height: auto;
        min-height: 800px;
        border-radius: 14px;
        border: 1px solid #e5e7eb;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
      }
      .phone-status-bar {
        display: none;
      }
      .wechat-capsule {
        display: none;
      }
    }
  }

  // 模拟手机壳
  .phone-shell {
    background: #f8fafc;
    display: flex;
    flex-direction: column;
    position: relative;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    // 1. 状态栏
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
      flex-shrink: 0;

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

    // 2. 小程序导航条与微信胶囊
    .mini-app-navbar {
      background: #fff;
      padding: 10px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #f1f5f9;
      flex-shrink: 0;

      .nav-title-area {
        display: flex;
        flex-direction: column;

        .nav-title {
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.2px;
        }
        .nav-subtitle {
          font-size: 11px;
          color: #64748b;
          margin-top: 1px;
        }
      }

      .wechat-capsule {
        display: flex;
        align-items: center;
        border: 1px solid #e2e8f0;
        background: #f8fafc;
        border-radius: 16px;
        padding: 4px 10px;
        gap: 8px;
        font-size: 12px;
        color: #334155;

        .capsule-dots {
          font-weight: bold;
          font-size: 11px;
        }
        .capsule-divider {
          width: 1px;
          height: 12px;
          background: #cbd5e1;
        }
        .capsule-circle {
          font-size: 12px;
          font-weight: bold;
        }
      }
    }

    // 3. 顶部 2 栏切换：业务数据 vs 基础数据
    .top-segmented-bar {
      display: flex;
      background: #fff;
      border-bottom: 1px solid #e2e8f0;
      flex-shrink: 0;

      .segment-item {
        flex: 1;
        text-align: center;
        padding: 12px 0;
        font-size: 14px;
        font-weight: 600;
        color: #64748b;
        cursor: pointer;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        transition: all 0.2s;

        .seg-icon {
          font-size: 16px;
        }

        &.active {
          color: #00bebe;
          background: rgba(0, 190, 190, 0.03);

          .active-indicator {
            position: absolute;
            bottom: 0;
            left: 20%;
            right: 20%;
            height: 3px;
            background: #00bebe;
            border-radius: 3px 3px 0 0;
          }
        }
      }
    }

    // 4. 快速 Pill 二级导航
    .sub-nav-pill-bar {
      display: flex;
      padding: 10px 14px;
      gap: 8px;
      background: #f1f5f9;
      border-bottom: 1px solid #e2e8f0;
      overflow-x: auto;
      flex-shrink: 0;

      &::-webkit-scrollbar {
        display: none;
      }

      .pill-tab {
        padding: 5px 12px;
        border-radius: 16px;
        font-size: 12px;
        font-weight: 500;
        background: #fff;
        color: #475569;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 5px;
        white-space: nowrap;
        border: 1px solid #e2e8f0;
        transition: all 0.2s;

        .count-badge {
          font-size: 10px;
          background: #f1f5f9;
          color: #64748b;
          padding: 1px 5px;
          border-radius: 8px;
        }

        &.active {
          background: #00bebe;
          color: #fff;
          border-color: #00bebe;

          .count-badge {
            background: rgba(255, 255, 255, 0.25);
            color: #fff;
          }
        }
      }
    }

    // 5. 滚动内容区
    .cards-scroll-body {
      flex: 1;
      overflow-y: auto;
      padding: 12px 14px 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;

      .category-header-banner {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 4px 2px;

        .banner-title {
          font-size: 13px;
          font-weight: 700;
          color: #1e293b;
          display: flex;
          align-items: center;
          gap: 6px;

          .dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #00bebe;
          }
        }
        .banner-sub {
          font-size: 11px;
          color: #94a3b8;
        }
      }

      // 指标卡片
      .metric-card {
        background: #fff;
        border-radius: 14px;
        padding: 14px 16px;
        border: 1px solid #f1f5f9;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
        cursor: pointer;
        transition: all 0.22s ease;

        &:hover {
          border-color: #cbd5e1;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        &.expanded {
          border-color: #00bebe;
          box-shadow: 0 4px 16px rgba(0, 190, 190, 0.12);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .metric-name-group {
            display: flex;
            align-items: center;
            gap: 8px;

            .metric-name {
              font-size: 13px;
              font-weight: 600;
              color: #475569;
            }
            .trend-tag {
              font-size: 10px;
              height: 20px;
              line-height: 18px;
              padding: 0 4px;
            }
          }

          .expand-icon {
            color: #94a3b8;
            transition: transform 0.22s;
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
          gap: 5px;

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
            font-weight: 500;
          }
        }

        .card-rates-row {
          margin-top: 8px;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;

          .rate-badge {
            display: inline-flex;
            align-items: center;
            gap: 2px;
            font-size: 11px;
            padding: 2px 7px;
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
          margin-top: 12px;
          padding-top: 10px;
          border-top: 1px dashed #e2e8f0;

          .chart-title {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 11px;
            color: #64748b;
            font-weight: 600;
            margin-bottom: 4px;

            .title-text {
              display: flex;
              align-items: center;
              gap: 4px;
            }
            .hint {
              font-size: 10px;
              color: #94a3b8;
              font-weight: normal;
            }
          }

          .echart-box {
            width: 100%;
            height: 155px;
          }
        }
      }

      // ================= 基础数据专有卡片 =================
      .basic-section {
        display: flex;
        flex-direction: column;
        gap: 12px;

        // 场地信息
        .site-hero-card {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: #fff;
          border-radius: 16px;
          padding: 16px 18px;
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.15);

          .site-badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            font-size: 11px;
            background: rgba(0, 190, 190, 0.2);
            color: #00e5e5;
            padding: 2px 8px;
            border-radius: 12px;
            font-weight: 600;
            margin-bottom: 8px;
          }
          .site-name {
            font-size: 18px;
            font-weight: 800;
            letter-spacing: -0.3px;
          }
          .site-addr {
            display: flex;
            align-items: flex-start;
            gap: 6px;
            font-size: 12px;
            color: #94a3b8;
            margin-top: 6px;
            line-height: 1.4;
          }
          .site-tags {
            display: flex;
            gap: 6px;
            margin-top: 12px;
            flex-wrap: wrap;

            .tag-item {
              font-size: 10px;
              background: rgba(255, 255, 255, 0.1);
              padding: 2px 7px;
              border-radius: 4px;
              color: #cbd5e1;
            }
          }
        }

        .site-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;

          .facility-card {
            background: #fff;
            border-radius: 14px;
            padding: 14px 16px;
            border: 1px solid #f1f5f9;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);

            .fac-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 12px;

              .fac-title {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 14px;
                font-weight: 700;
                color: #1e293b;

                .fac-icon {
                  font-size: 18px;
                  &.dock { color: #f59e0b; }
                  &.chill { color: #0284c7; }
                  &.frozen { color: #6366f1; }
                }
              }
            }

            .fac-stats {
              display: flex;
              justify-content: space-between;
              background: #f8fafc;
              padding: 10px 14px;
              border-radius: 10px;

              .stat-col {
                display: flex;
                flex-direction: column;
                align-items: center;

                .stat-num {
                  font-size: 16px;
                  font-weight: 800;
                  color: #0f172a;

                  .u {
                    font-size: 11px;
                    font-weight: normal;
                    color: #64748b;
                  }
                  &.highlight { color: #f59e0b; }
                  &.chill-temp { color: #0284c7; }
                  &.frozen-temp { color: #6366f1; }
                }
                .stat-lbl {
                  font-size: 10px;
                  color: #64748b;
                  margin-top: 2px;
                }
              }
            }
          }
        }

        // 物资信息
        .material-banner {
          background: linear-gradient(135deg, #e0f2fe 0%, #f0fdf4 100%);
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid #bae6fd;

          .banner-title {
            font-size: 13px;
            font-weight: 700;
            color: #0369a1;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .banner-desc {
            font-size: 11px;
            color: #0284c7;
            margin-top: 2px;
          }
        }

        .materials-list {
          display: flex;
          flex-direction: column;
          gap: 10px;

          .material-item-card {
            background: #fff;
            border-radius: 12px;
            padding: 12px 14px;
            border: 1px solid #f1f5f9;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);

            .mat-left {
              .mat-name {
                font-size: 13px;
                font-weight: 700;
                color: #1e293b;
              }
              .mat-extra {
                font-size: 11px;
                color: #64748b;
                margin-top: 3px;
              }
            }

            .mat-right {
              text-align: right;

              .mat-val {
                font-size: 18px;
                font-weight: 800;
                color: #0f172a;

                .unit {
                  font-size: 11px;
                  color: #64748b;
                  font-weight: normal;
                }
              }
              .mat-trend {
                font-size: 10px;
                color: #64748b;
                margin-top: 2px;

                .text-success {
                  color: #22c55e;
                  font-weight: 600;
                }
              }
            }
          }
        }

        // 服务网点
        .outlet-hero-card {
          background: #fff;
          border-radius: 16px;
          padding: 16px 18px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

          .title-row {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .title {
              font-size: 14px;
              font-weight: 700;
              color: #0f172a;
              display: flex;
              align-items: center;
              gap: 6px;
            }
          }

          .outlet-main-stat {
            margin: 12px 0;

            .huge-number {
              font-size: 32px;
              font-weight: 900;
              color: #00bebe;
              font-family: 'Helvetica Neue', Arial, sans-serif;
              line-height: 1;

              .unit {
                font-size: 14px;
                font-weight: 600;
                color: #475569;
              }
            }
            .sub-lbl {
              font-size: 11px;
              color: #64748b;
              margin-top: 4px;
            }
          }

          .progress-section {
            margin-top: 14px;

            .prog-labels {
              display: flex;
              justify-content: space-between;
              font-size: 11px;
              margin-bottom: 6px;

              .delivery-lbl {
                color: #0284c7;
                font-weight: 600;
              }
              .pickup-lbl {
                color: #f59e0b;
                font-weight: 600;
              }
            }

            .dual-progress-bar {
              height: 8px;
              background: #f1f5f9;
              border-radius: 4px;
              overflow: hidden;
              display: flex;

              .bar-delivery {
                background: #0284c7;
                height: 100%;
              }
              .bar-pickup {
                background: #f59e0b;
                height: 100%;
              }
            }
          }
        }

        .outlet-cards-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;

          .outlet-detail-card {
            background: #fff;
            border-radius: 14px;
            padding: 14px;
            border: 1px solid #f1f5f9;
            display: flex;
            flex-direction: column;
            gap: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);

            .card-icon {
              width: 32px;
              height: 32px;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 16px;

              &.delivery {
                background: #e0f2fe;
                color: #0284c7;
              }
              &.pickup {
                background: #fef3c7;
                color: #d97706;
              }
            }

            .card-info {
              .name {
                font-size: 12px;
                color: #64748b;
              }
              .val {
                font-size: 20px;
                font-weight: 800;
                color: #0f172a;
                margin: 2px 0;

                .u {
                  font-size: 11px;
                  color: #94a3b8;
                  font-weight: normal;
                }
              }
              .desc {
                font-size: 10px;
                color: #94a3b8;
                line-height: 1.3;
              }
            }
          }
        }
      }
    }

    // 6. 底部原生 TabBar
    .phone-bottom-tabbar {
      background: #ffffff;
      border-top: 1px solid #e2e8f0;
      padding: 6px 12px 10px;
      display: flex;
      justify-content: space-around;
      align-items: center;
      flex-shrink: 0;
      box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.03);

      .tab-bar-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        cursor: pointer;
        padding: 4px 16px;
        position: relative;
        color: #64748b;
        transition: all 0.2s;

        .tab-icon {
          font-size: 18px;
          transition: transform 0.2s;
        }

        .tab-label {
          font-size: 11px;
          font-weight: 500;
        }

        .tab-dot {
          position: absolute;
          bottom: -2px;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #00bebe;
        }

        &.active {
          color: #00bebe;

          .tab-icon {
            transform: scale(1.1);
          }
          .tab-label {
            font-weight: 700;
          }
        }
      }
    }
  }
}

// 展开过渡动效
.drilldown-enter-active,
.drilldown-leave-active {
  transition: all 0.24s ease-out;
}
.drilldown-enter-from,
.drilldown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
