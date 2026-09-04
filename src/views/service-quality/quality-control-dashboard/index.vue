<template>
  <div class="qc-dashboard-page">
    <!-- 顶部标题栏 -->
    <div class="dashboard-header">
      <div class="header-title">
        <el-icon class="mr-2 header-icon"><DataLine /></el-icon>
        <span>品控数据看板</span>
        <span class="badge">Demo</span>
      </div>
      <div class="header-meta">
        <el-tag type="info" size="small">数据刷新时间: 刚刚</el-tag>
      </div>
    </div>

    <!-- 过滤器面板 -->
    <FilterPanel
      v-model:timeRange="timeRange"
      v-model:customDateRange="customDateRange"
      v-model:monthRange="monthRange"
      v-model:granularity="granularity"
      v-model:province="province"
      v-model:station="station"
      v-model:productType="productType"
      @change="handleFilterChange"
    />

    <!-- KPI 卡片展示区 -->
    <div class="kpi-section-title">
      <el-icon class="section-icon"><Van /></el-icon>
      履约域指标 (正向时效)
    </div>
    <div class="kpi-grid delivery-grid">
      <KpiCard
        v-for="meta in deliveryMetrics"
        :key="meta.key"
        :meta="meta"
        :numerator="kpiAggregates[meta.key]?.numerator || 0"
        :denominator="kpiAggregates[meta.key]?.denominator || 0"
        :rate="kpiAggregates[meta.key]?.rate || 0"
        :active="activeKpi === meta.key"
        @select="selectKpi(meta.key)"
        @view-detail="navigateToDetail"
      />
    </div>

    <div class="kpi-section-title mt-6">
      <el-icon class="section-icon"><ChatDotSquare /></el-icon>
      客诉域指标 (质量异常)
    </div>
    <div class="kpi-grid complaint-grid">
      <KpiCard
        v-for="meta in complaintMetrics"
        :key="meta.key"
        :meta="meta"
        :numerator="kpiAggregates[meta.key]?.numerator || 0"
        :denominator="kpiAggregates[meta.key]?.denominator || 0"
        :rate="kpiAggregates[meta.key]?.rate || 0"
        :active="activeKpi === meta.key"
        @select="selectKpi(meta.key)"
        @view-detail="navigateToDetail"
      />
    </div>

    <!-- 趋势分析与异常排行图表区 -->
    <TrendChart
      v-model:activeViewTab="activeViewTab"
      v-model:rankingDim="rankingDim"
      :metricMeta="activeMetricMeta"
      :dates="datesList"
      :rates="singleChartData.rates"
      :volumes="singleChartData.volumes"
      :rankingData="rankingDataList"
      @chart-click="handleChartClick"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import dayjs from 'dayjs';
import { DataLine, Van, ChatDotSquare } from '@element-plus/icons-vue';

// Types and data imports
import { METRIC_CONFIGS, DailyMetricRecord, MetricValue } from './types';
import { mockMetricRecords } from './mockData';

// Component imports
import FilterPanel from './components/FilterPanel.vue';
import KpiCard from './components/KpiCard.vue';
import TrendChart from './components/TrendChart.vue';

const route = useRoute();
const router = useRouter();

// Global state variables
const timeRange = ref<'7d' | '30d' | ''>('30d');
const customDateRange = ref<[string, string] | null>(null);
const monthRange = ref<[string, string] | null>(null);
const granularity = ref<'day' | 'month'>('day');
const province = ref<string>('');
const station = ref<string>('');
const productType = ref<string>('');
const activeKpi = ref<string>('orderAccept');

// Chart view controls
const activeViewTab = ref<'trend' | 'ranking'>('trend');
const rankingDim = ref<'province' | 'station'>('province');

// Metric split configs
const deliveryMetrics = computed(() => METRIC_CONFIGS.filter(m => m.domain === 'delivery'));
const complaintMetrics = computed(() => METRIC_CONFIGS.filter(m => m.domain === 'complaint'));

// Retrieve active KPI metadata
const activeMetricMeta = computed(() => {
  return METRIC_CONFIGS.find(m => m.key === activeKpi.value) || METRIC_CONFIGS[0];
});

// Sync queries on mounted to restore selection from details page
onMounted(() => {
  if (route.query.metric) activeKpi.value = route.query.metric as string;
  if (route.query.timeRange) timeRange.value = route.query.timeRange as '7d' | '30d' | '';
  if (route.query.startDate && route.query.endDate) {
    customDateRange.value = [route.query.startDate as string, route.query.endDate as string];
  }
  if (route.query.province) province.value = route.query.province as string;
  if (route.query.station) station.value = route.query.station as string;
  if (route.query.productType) productType.value = route.query.productType as string;
});

// Calculate the start date limit
const minDateLimit = computed(() => {
  if (granularity.value === 'month' && monthRange.value && monthRange.value[0]) {
    return dayjs(monthRange.value[0]).startOf('month').format('YYYY-MM-DD');
  }
  if (customDateRange.value && customDateRange.value[0]) {
    return customDateRange.value[0];
  }
  const maxDateStr = mockMetricRecords[mockMetricRecords.length - 1].date;
  const maxDate = dayjs(maxDateStr);
  const days = timeRange.value === '7d' ? 7 : 30;
  return maxDate.subtract(days, 'day').format('YYYY-MM-DD');
});

// Calculate the end date limit
const maxDateLimit = computed(() => {
  if (granularity.value === 'month' && monthRange.value && monthRange.value[1]) {
    return dayjs(monthRange.value[1]).endOf('month').format('YYYY-MM-DD');
  }
  if (customDateRange.value && customDateRange.value[1]) {
    return customDateRange.value[1];
  }
  return mockMetricRecords[mockMetricRecords.length - 1].date;
});

// List of X-axis labels: days or months depending on granularity
const datesList = computed(() => {
  const list: string[] = [];
  const start = dayjs(minDateLimit.value);
  const end = dayjs(maxDateLimit.value);

  if (granularity.value === 'month') {
    // Generate month labels YYYY-MM
    const startMonth = start.startOf('month');
    const endMonth = end.startOf('month');
    const diffMonths = endMonth.diff(startMonth, 'month');
    for (let i = 0; i <= diffMonths; i++) {
      list.push(startMonth.add(i, 'month').format('YYYY-MM'));
    }
  } else {
    const diffDays = end.diff(start, 'day');
    for (let i = 0; i <= diffDays; i++) {
      list.push(start.add(i, 'day').format('YYYY-MM-DD'));
    }
  }
  return list;
});

// Core data filtering logic (Date, Province, Station)
const filteredRecords = computed(() => {
  return mockMetricRecords.filter(r => {
    // Date filter
    const isWithinDate = r.date >= minDateLimit.value && r.date <= maxDateLimit.value;
    if (!isWithinDate) return false;
    
    // Province filter
    if (province.value && r.province !== province.value) return false;
    
    // Station filter
    if (station.value && r.station !== station.value) return false;

    // Product Type filter
    if (productType.value && r.productType !== productType.value) return false;

    return true;
  });
});

// Compute sum numerator/denominator for a given metric key
const aggregateMetric = (records: DailyMetricRecord[], key: string): MetricValue => {
  let numSum = 0;
  let denSum = 0;
  
  records.forEach(r => {
    const val = (r as any)[key] as MetricValue;
    if (val) {
      numSum += val.numerator;
      denSum += val.denominator;
    }
  });

  return {
    numerator: numSum,
    denominator: denSum,
    rate: denSum > 0 ? numSum / denSum : 0
  };
};

// Computed property that holds aggregations for all cards
const kpiAggregates = computed(() => {
  const result: Record<string, { numerator: number; denominator: number; rate: number }> = {};
  METRIC_CONFIGS.forEach(meta => {
    result[meta.key] = aggregateMetric(filteredRecords.value, meta.key);
  });
  return result;
});

// Prepare data for Time Series Trend Chart (rates + volumes)
const singleChartData = computed(() => {
  const rates: number[] = [];
  const volumes: number[] = [];

  datesList.value.forEach(label => {
    let dateRecords: DailyMetricRecord[];
    if (granularity.value === 'month') {
      // Filter all daily records whose YYYY-MM matches the month label
      dateRecords = filteredRecords.value.filter(r => r.date.startsWith(label));
    } else {
      dateRecords = filteredRecords.value.filter(r => r.date === label);
    }
    const agg = aggregateMetric(dateRecords, activeKpi.value);
    rates.push(agg.rate);
    volumes.push(agg.denominator);
  });

  return { rates, volumes };
});

// Compute Bottom 10 Worst Performing list dynamically (for Ranking view)
const rankingDataList = computed(() => {
  const isPositive = activeMetricMeta.value.isPositive;
  const dimension = rankingDim.value; // 'province' | 'station'
  
  // Filter records by date range AND product type
  const dateRangeRecords = mockMetricRecords.filter(r => {
    const isWithinDate = r.date >= minDateLimit.value && r.date <= maxDateLimit.value;
    if (!isWithinDate) return false;
    if (productType.value && r.productType !== productType.value) return false;
    return true;
  });
  
  // Group metrics by name of province/station
  const entityMap: Record<string, { numerator: number; denominator: number }> = {};
  
  dateRangeRecords.forEach(r => {
    const entityName = dimension === 'province' ? r.province : r.station;
    if (!entityMap[entityName]) {
      entityMap[entityName] = { numerator: 0, denominator: 0 };
    }
    const val = (r as any)[activeKpi.value] as MetricValue;
    if (val) {
      entityMap[entityName].numerator += val.numerator;
      entityMap[entityName].denominator += val.denominator;
    }
  });

  // Convert map to list and aggregate rates
  const list = Object.entries(entityMap).map(([name, data]) => {
    const rate = data.denominator > 0 ? data.numerator / data.denominator : 0;
    return {
      name,
      rate,
      denominator: data.denominator
    };
  }).filter(item => item.denominator > 0);

  // Sort list to pull worst performing 10 items
  list.sort((a, b) => {
    if (isPositive) {
      return a.rate - b.rate; // Ascending: lowest rate is worst (positive metrics)
    } else {
      return b.rate - a.rate; // Descending: highest rate is worst (negative metrics)
    }
  });

  return list.slice(0, 10);
});

// Change active KPI metric
const selectKpi = (key: string) => {
  activeKpi.value = key;
};

// Handle generic filter change events
const handleFilterChange = () => {
  // Can add audit log or track analytics
};

// Navigate to detail page
const navigateToDetail = (metricKey: string) => {
  router.push({
    path: '/service-quality/quality-control-dashboard/detail',
    query: {
      metric: metricKey,
      timeRange: timeRange.value,
      startDate: customDateRange.value ? customDateRange.value[0] : '',
      endDate: customDateRange.value ? customDateRange.value[1] : '',
      province: province.value,
      station: station.value,
      productType: productType.value
    }
  });
};

// Handle trend chart clicking
const handleChartClick = (data: { date: string; seriesName: string; value: any }) => {
  // Navigate to detail sub-page with the clicked date parameter
  router.push({
    path: '/service-quality/quality-control-dashboard/detail',
    query: {
      metric: activeKpi.value,
      timeRange: timeRange.value,
      startDate: customDateRange.value ? customDateRange.value[0] : '',
      endDate: customDateRange.value ? customDateRange.value[1] : '',
      province: province.value,
      station: station.value,
      productType: productType.value,
      date: data.date
    }
  });
};
</script>

<style scoped lang="scss">
.qc-dashboard-page {
  padding: 24px;
  background-color: rgb(240, 242, 245);
  min-height: calc(100vh - 84px);
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif;

  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    .header-title {
      font-size: 20px;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.85);
      display: flex;
      align-items: center;

      .header-icon {
        color: rgb(0, 190, 190);
        font-size: 24px;
      }

      .badge {
        font-size: 11px;
        background-color: rgba(0, 190, 190, 0.15);
        color: rgb(0, 190, 190);
        padding: 2px 6px;
        border-radius: 4px;
        margin-left: 8px;
        font-weight: 500;
      }
    }
  }

  .kpi-section-title {
    font-size: 15px;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.85);
    margin: 16px 0 12px 0;
    display: flex;
    align-items: center;
    gap: 6px;

    .section-icon {
      color: rgb(0, 190, 190);
      font-size: 16px;
    }
  }

  .kpi-grid {
    display: grid;
    gap: 16px;
    margin-bottom: 20px;

    &.delivery-grid {
      grid-template-columns: repeat(5, 1fr);
    }

    &.complaint-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  .mt-6 {
    margin-top: 24px;
  }
  
  .mr-2 {
    margin-right: 8px;
  }

  /* Responsive styling rules */
  @media (max-width: 1200px) {
    .kpi-grid {
      &.delivery-grid {
        grid-template-columns: repeat(3, 1fr);
      }
      &.complaint-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  }

  @media (max-width: 768px) {
    padding: 12px;
    
    .dashboard-header {
      margin-bottom: 16px;
      .header-title {
        font-size: 17px;
      }
      .header-meta {
        display: none; // Hide extra header text on small screens
      }
    }

    .kpi-section-title {
      font-size: 13px;
      margin: 12px 0 8px 0;
    }

    .kpi-grid {
      gap: 10px;
      margin-bottom: 12px;

      &.delivery-grid, &.complaint-grid {
        grid-template-columns: repeat(2, 1fr); /* 2 columns for phones */
      }
    }
  }

  @media (max-width: 400px) {
    .kpi-grid {
      &.delivery-grid, &.complaint-grid {
        grid-template-columns: 1fr; /* 1 column on very narrow screens */
      }
    }
  }
}
</style>
