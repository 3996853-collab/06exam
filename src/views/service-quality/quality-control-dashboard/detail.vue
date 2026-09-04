<template>
  <div class="abnormal-detail-page">
    <!-- 头部导航 -->
    <el-card class="header-card" shadow="never">
      <el-page-header @back="goBack">
        <template #content>
          <div class="header-title-area">
            <!-- 面包屑路径 -->
            <el-breadcrumb separator="/">
              <el-breadcrumb-item>品控看板</el-breadcrumb-item>
              <el-breadcrumb-item>{{ activeMetricMeta?.name }}</el-breadcrumb-item>
              <el-breadcrumb-item v-if="viewMode === 'station'">{{ queryProvince }}</el-breadcrumb-item>
              <el-breadcrumb-item v-if="viewMode === 'order'">{{ queryProvince }}</el-breadcrumb-item>
              <el-breadcrumb-item v-if="viewMode === 'order'">{{ queryStation }}</el-breadcrumb-item>
            </el-breadcrumb>
            <span class="header-title">
              <template v-if="viewMode === 'province'">省区汇总 - {{ activeMetricMeta?.name }}</template>
              <template v-else-if="viewMode === 'station'">网点汇总 - {{ queryProvince }}</template>
              <template v-else>异常明细 - {{ queryStation }}</template>
            </span>
          </div>
        </template>
        <template #extra>
          <div class="header-actions">
            <el-button type="primary" :icon="Download" @click="handleExport" size="default" class="full-width-mobile">
              导出 Excel
            </el-button>
          </div>
        </template>
      </el-page-header>

      <!-- 过滤条件摘要 -->
      <div class="filter-summary">
        <el-descriptions :column="4" size="small" border>
          <el-descriptions-item label="监控指标">
            <el-tag type="primary" size="small">{{ activeMetricMeta?.name }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="时间范围">{{ dateRangeText }}</el-descriptions-item>
          <el-descriptions-item label="产品类型">
            <el-tag v-if="queryProductType" type="success" size="small">{{ queryProductType }}</el-tag>
            <span v-else>全部产品</span>
          </el-descriptions-item>
          <el-descriptions-item label="视图层级">
            <el-tag
              :type="viewMode === 'province' ? 'info' : viewMode === 'station' ? 'warning' : 'danger'"
              size="small"
            >
              {{ viewMode === 'province' ? '全国 / 省区' : viewMode === 'station' ? queryProvince + ' / 网点' : queryStation + ' / 订单' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="目标阈值">
            {{ activeMetricMeta?.isPositive ? '≥' : '≤' }}
            {{ ((activeMetricMeta?.threshold || 0) * 100).toFixed(0) }}%
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>

    <!-- ========== 模式 1 & 2：省区 / 网点 汇总表 ========== -->
    <el-card v-if="viewMode !== 'order'" class="table-card mt-4" shadow="never">
      <template #header>
        <div class="table-header">
          <div class="table-title">
            <el-icon class="mr-2"><DataAnalysis /></el-icon>
            <span>{{ viewMode === 'province' ? '省区' : '网点' }}汇总数据</span>
            <span class="row-count">共 {{ aggregatedList.length }} 条</span>
          </div>
          <div class="table-tip">
            <el-icon class="tip-icon"><InfoFilled /></el-icon>
            点击行可下钻查看下一层明细
          </div>
        </div>
      </template>

      <el-table
        :data="aggregatedList"
        style="width: 100%"
        border
        stripe
        size="default"
        v-loading="loading"
        row-class-name="clickable-row"
        @row-click="handleAggRowClick"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column
          :prop="viewMode === 'province' ? 'province' : 'station'"
          :label="viewMode === 'province' ? '省区' : '网点'"
          min-width="140"
          align="left"
          header-align="center"
        >
          <template #default="scope">
            <span class="drill-link">
              <el-icon class="drill-icon"><Location v-if="viewMode === 'province'" /><OfficeBuilding v-else /></el-icon>
              {{ viewMode === 'province' ? scope.row.province : scope.row.station }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="分子" prop="numerator" width="110" align="center">
          <template #default="scope">
            <span class="num-val primary-num">{{ scope.row.numerator.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column label="分母" prop="denominator" width="110" align="center">
          <template #default="scope">
            <span class="num-val">{{ scope.row.denominator.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column label="比率" width="130" align="center">
          <template #default="scope">
            <span
              class="rate-badge"
              :class="isBreached(scope.row.rate) ? 'rate-badge--danger' : 'rate-badge--success'"
            >
              {{ (scope.row.rate * 100).toFixed(1) }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column label="达标状态" width="100" align="center">
          <template #default="scope">
            <el-tag
              :type="isBreached(scope.row.rate) ? 'danger' : 'success'"
              size="small"
              effect="light"
            >
              {{ isBreached(scope.row.rate) ? '异常' : '达标' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="明细" width="100" align="center">
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              link
              @click.stop="handleAggRowClick(scope.row)"
            >
              查看 <el-icon><ArrowRight /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 移动端卡片 -->
      <div class="mobile-agg-list" v-loading="loading">
        <div
          v-for="row in aggregatedList"
          :key="viewMode === 'province' ? row.province : row.station"
          class="mobile-agg-card"
          @click="handleAggRowClick(row)"
        >
          <div class="agg-card-header">
            <span class="agg-name">{{ viewMode === 'province' ? row.province : row.station }}</span>
            <el-tag :type="isBreached(row.rate) ? 'danger' : 'success'" size="small" effect="light">
              {{ (row.rate * 100).toFixed(1) }}%
            </el-tag>
          </div>
          <div class="agg-card-body">
            <div class="agg-stat">
              <span class="agg-stat-label">分子</span>
              <span class="agg-stat-val primary-num">{{ row.numerator.toLocaleString() }}</span>
            </div>
            <div class="agg-stat">
              <span class="agg-stat-label">分母</span>
              <span class="agg-stat-val">{{ row.denominator.toLocaleString() }}</span>
            </div>
            <div class="agg-stat">
              <span class="agg-stat-label">状态</span>
              <el-tag :type="isBreached(row.rate) ? 'danger' : 'success'" size="small" effect="light">
                {{ isBreached(row.rate) ? '异常' : '达标' }}
              </el-tag>
            </div>
          </div>
        </div>
        <el-empty v-if="aggregatedList.length === 0" description="暂无数据" />
      </div>
    </el-card>

    <!-- ========== 模式 3：订单明细 ========== -->
    <el-card v-else class="table-card mt-4" shadow="never">
      <template #header>
        <div class="table-header">
          <div class="table-title">
            <el-icon class="mr-2 text-danger"><Warning /></el-icon>
            <span>异常单明细列表</span>
            <span class="ticket-count">共 {{ filteredTickets.length }} 笔异常</span>
          </div>
        </div>
      </template>

      <!-- 桌面端表格 -->
      <el-table
        :data="filteredTickets"
        style="width: 100%"
        border
        stripe
        size="default"
        class="desktop-table"
        v-loading="loading"
      >
        <el-table-column type="index" label="序号" width="65" align="center" />
        <el-table-column prop="orderId" label="订单号 / 工单号" min-width="150" align="center">
          <template #default="scope">
            <span class="order-id-link">{{ scope.row.orderId }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="province" label="省区" width="130" align="center" />
        <el-table-column prop="station" label="责任网点" min-width="180" align="left" header-align="center" />
        <el-table-column
          prop="expectedTime"
          :label="activeMetricMeta?.expectTitle || '应处理时间'"
          min-width="180"
          align="center"
        />
        <el-table-column
          prop="actualTime"
          :label="activeMetricMeta?.actualTitle || '实际处理时间'"
          min-width="180"
          align="center"
        >
          <template #default="scope">
            <span :class="{ 'text-danger font-bold': scope.row.actualTime.includes('超时') || scope.row.actualTime.includes('未') }">
              {{ scope.row.actualTime }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="异常分析" min-width="150" align="left">
          <template #default="scope">
            <span class="text-danger-light">{{ getAnomalyReason(scope.row) }}</span>
          </template>
        </el-table-column>
      </el-table>

      <!-- 移动端卡片 -->
      <div class="mobile-tickets-list" v-loading="loading">
        <div v-for="(ticket, idx) in filteredTickets" :key="ticket.orderId" class="mobile-ticket-card">
          <div class="card-row card-header-row">
            <div class="order-info">
              <span class="index-tag">#{{ idx + 1 }}</span>
              <span class="order-id">{{ ticket.orderId }}</span>
            </div>
            <el-tag type="danger" size="small" effect="light">异常</el-tag>
          </div>
          <div class="card-detail-body">
            <div class="detail-row">
              <span class="detail-label">责任区域</span>
              <span class="detail-value">{{ ticket.province }} / {{ ticket.station }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">{{ activeMetricMeta?.expectTitle }}</span>
              <span class="detail-value">{{ ticket.expectedTime }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">{{ activeMetricMeta?.actualTitle }}</span>
              <span class="detail-value" :class="{ 'text-danger font-bold': ticket.actualTime.includes('超时') || ticket.actualTime.includes('未') }">
                {{ ticket.actualTime }}
              </span>
            </div>
          </div>
          <div class="card-analysis-footer">
            <span class="footer-label">异常分析</span>
            <span class="footer-value">{{ getAnomalyReason(ticket) }}</span>
          </div>
        </div>
        <el-empty v-if="filteredTickets.length === 0" description="暂无异常订单" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Download, Warning, DataAnalysis, InfoFilled, Location, OfficeBuilding, ArrowRight } from '@element-plus/icons-vue';
import dayjs from 'dayjs';

import { METRIC_CONFIGS, AnomalyTicket, DailyMetricRecord, MetricValue } from './types';
import { allAnomalyTickets, mockMetricRecords } from './mockData';

const route = useRoute();
const router = useRouter();

const loading = ref(true);

// Extract query params
const queryMetric = computed(() => (route.query.metric as string) || 'orderAccept');
const queryTimeRange = computed(() => (route.query.timeRange as string) || '30d');
const queryStartDate = computed(() => (route.query.startDate as string) || '');
const queryEndDate = computed(() => (route.query.endDate as string) || '');
const queryProvince = computed(() => (route.query.province as string) || '');
const queryStation = computed(() => (route.query.station as string) || '');
const queryProductType = computed(() => (route.query.productType as string) || '');
const queryDate = computed(() => (route.query.date as string) || '');

// Determine the current view mode:
// 'province' = no province/station selected → show province aggregation
// 'station'  = province selected, no station → show station aggregation within that province
// 'order'    = station selected → show individual order anomaly list
const viewMode = computed<'province' | 'station' | 'order'>(() => {
  if (queryStation.value) return 'order';
  if (queryProvince.value) return 'station';
  return 'province';
});

// Metric Meta
const activeMetricMeta = computed(() => {
  return METRIC_CONFIGS.find(m => m.key === queryMetric.value) || METRIC_CONFIGS[0];
});

// --- Date range calculation ---
const lastRecordDate = mockMetricRecords[mockMetricRecords.length - 1]?.date || dayjs().format('YYYY-MM-DD');

const dateRangeText = computed(() => {
  if (queryDate.value) return queryDate.value;
  if (queryStartDate.value && queryEndDate.value) return `${queryStartDate.value} 至 ${queryEndDate.value}`;
  const days = queryTimeRange.value === '7d' ? 7 : 30;
  const startStr = dayjs(lastRecordDate).subtract(days, 'day').format('YYYY-MM-DD');
  return `${startStr} 至 ${lastRecordDate}`;
});

const minDateLimit = computed(() => {
  if (queryStartDate.value) return queryStartDate.value;
  const days = queryTimeRange.value === '7d' ? 7 : 30;
  return dayjs(lastRecordDate).subtract(days, 'day').format('YYYY-MM-DD');
});

const maxDateLimit = computed(() => {
  if (queryEndDate.value) return queryEndDate.value;
  return lastRecordDate;
});

// --- Aggregated data (Province / Station modes) ---
// Filter metric records by date and optional province
const filteredMetricRecords = computed(() => {
  return mockMetricRecords.filter(r => {
    if (r.date < minDateLimit.value || r.date > maxDateLimit.value) return false;
    if (queryProvince.value && r.province !== queryProvince.value) return false;
    if (queryProductType.value && r.productType !== queryProductType.value) return false;
    return true;
  });
});

// Helper to aggregate numerator/denominator for a group of records
const aggregateRecords = (records: DailyMetricRecord[]) => {
  let numSum = 0;
  let denSum = 0;
  records.forEach(r => {
    const val = (r as any)[queryMetric.value] as MetricValue;
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

// Province aggregation list
const aggregatedList = computed(() => {
  if (viewMode.value === 'province') {
    // Group by province
    const map: Record<string, DailyMetricRecord[]> = {};
    filteredMetricRecords.value.forEach(r => {
      if (!map[r.province]) map[r.province] = [];
      map[r.province].push(r);
    });
    return Object.entries(map).map(([province, records]) => {
      const agg = aggregateRecords(records);
      return { province, station: '', ...agg };
    }).sort((a, b) => {
      // Sort breached items first
      const aBreached = isBreached(a.rate);
      const bBreached = isBreached(b.rate);
      if (aBreached && !bBreached) return -1;
      if (!aBreached && bBreached) return 1;
      return activeMetricMeta.value.isPositive ? a.rate - b.rate : b.rate - a.rate;
    });
  } else if (viewMode.value === 'station') {
    // Group by station (within selected province)
    const map: Record<string, DailyMetricRecord[]> = {};
    filteredMetricRecords.value.forEach(r => {
      if (!map[r.station]) map[r.station] = [];
      map[r.station].push(r);
    });
    return Object.entries(map).map(([station, records]) => {
      const agg = aggregateRecords(records);
      return { province: queryProvince.value, station, ...agg };
    }).sort((a, b) => {
      const aBreached = isBreached(a.rate);
      const bBreached = isBreached(b.rate);
      if (aBreached && !bBreached) return -1;
      if (!aBreached && bBreached) return 1;
      return activeMetricMeta.value.isPositive ? a.rate - b.rate : b.rate - a.rate;
    });
  }
  return [];
});

// Check if a rate breaches the threshold
const isBreached = (rate: number): boolean => {
  if (activeMetricMeta.value.isPositive) {
    return rate < activeMetricMeta.value.threshold;
  }
  return rate > activeMetricMeta.value.threshold;
};

// --- Order detail mode ---
const filteredTickets = computed(() => {
  return allAnomalyTickets.filter(t => {
    if (t.metricKey !== queryMetric.value) return false;
    if (queryDate.value) {
      if (t.date !== queryDate.value) return false;
    } else {
      if (t.date < minDateLimit.value || t.date > maxDateLimit.value) return false;
    }
    if (queryProvince.value && t.province !== queryProvince.value) return false;
    if (queryStation.value && t.station !== queryStation.value) return false;
    if (queryProductType.value && t.productType !== queryProductType.value) return false;
    return true;
  });
});

// Mock loading
onMounted(() => {
  setTimeout(() => { loading.value = false; }, 400);
});

// --- Navigation ---
const goBack = () => {
  if (viewMode.value === 'order' && !queryStation.value) {
    // Should not happen, but fallback
    router.back();
    return;
  }
  if (viewMode.value === 'order') {
    // Go back to station list (remove station from query)
    router.push({
      path: '/service-quality/quality-control-dashboard/detail',
      query: {
        metric: queryMetric.value,
        timeRange: queryTimeRange.value,
        startDate: queryStartDate.value,
        endDate: queryEndDate.value,
        province: queryProvince.value,
        station: '',
        productType: queryProductType.value,
        date: queryDate.value
      }
    });
  } else if (viewMode.value === 'station') {
    // Go back to province list (remove province from query)
    router.push({
      path: '/service-quality/quality-control-dashboard/detail',
      query: {
        metric: queryMetric.value,
        timeRange: queryTimeRange.value,
        startDate: queryStartDate.value,
        endDate: queryEndDate.value,
        province: '',
        station: '',
        productType: queryProductType.value
      }
    });
  } else {
    // Go back to dashboard
    router.push({
      path: '/service-quality/quality-control-dashboard',
      query: {
        timeRange: queryTimeRange.value,
        startDate: queryStartDate.value,
        endDate: queryEndDate.value,
        province: queryProvince.value,
        station: queryStation.value,
        metric: queryMetric.value,
        productType: queryProductType.value
      }
    });
  }
};

// Row click drill-down handler
const handleAggRowClick = (row: any) => {
  if (viewMode.value === 'province') {
    // Drill into station level for the clicked province
    router.push({
      path: '/service-quality/quality-control-dashboard/detail',
      query: {
        metric: queryMetric.value,
        timeRange: queryTimeRange.value,
        startDate: queryStartDate.value,
        endDate: queryEndDate.value,
        province: row.province,
        station: '',
        productType: queryProductType.value
      }
    });
  } else if (viewMode.value === 'station') {
    // Drill into order detail level for the clicked station
    router.push({
      path: '/service-quality/quality-control-dashboard/detail',
      query: {
        metric: queryMetric.value,
        timeRange: queryTimeRange.value,
        startDate: queryStartDate.value,
        endDate: queryEndDate.value,
        province: queryProvince.value,
        station: row.station,
        productType: queryProductType.value,
        date: queryDate.value
      }
    });
  }
};

const handleExport = () => {
  const count = viewMode.value === 'order' ? filteredTickets.value.length : aggregatedList.value.length;
  ElMessage.success(`数据导出成功！共导出 ${count} 条记录。`);
};

// Generate anomaly reason text
const getAnomalyReason = (row: AnomalyTicket): string => {
  if (row.actualTime === '超时未接单') {
    return '接单节点严重延迟，系统自动预警';
  }
  const expected = dayjs(row.expectedTime);
  const actual = dayjs(row.actualTime);
  const diffMinutes = actual.diff(expected, 'minute');
  const hours = (diffMinutes / 60).toFixed(1);
  return `超时 ${hours} 小时，请关注时效履约`;
};
</script>

<style scoped lang="scss">
.abnormal-detail-page {
  padding: 24px;
  background-color: rgb(240, 242, 245);
  min-height: calc(100vh - 84px);
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif;

  .header-card {
    border: none;
    border-radius: 8px;
    box-shadow: rgba(0, 0, 0, 0.04) 0px 4px 12px 0px;
    margin-bottom: 20px;

    .header-title-area {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .header-title {
      font-size: 16px;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.85);
    }

    .filter-summary {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid rgb(235, 238, 245);
    }
  }

  .table-card {
    border: none;
    border-radius: 8px;
    box-shadow: rgba(0, 0, 0, 0.04) 0px 4px 12px 0px;

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .table-title {
        display: flex;
        align-items: center;
        font-size: 15px;
        font-weight: 600;
        color: rgba(0, 0, 0, 0.8);

        .row-count, .ticket-count {
          font-size: 12px;
          background-color: rgba(0, 190, 190, 0.06);
          color: rgb(0, 190, 190);
          padding: 2px 8px;
          border-radius: 12px;
          margin-left: 10px;
          font-weight: 500;
        }

        .ticket-count {
          background-color: rgba(240, 0, 0, 0.05);
          color: rgb(240, 0, 0);
        }
      }

      .table-tip {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: rgb(144, 147, 153);

        .tip-icon {
          font-size: 13px;
          color: rgb(0, 190, 190);
        }
      }
    }
  }

  // Aggregation table styles
  :deep(.clickable-row) {
    cursor: pointer;
    transition: background-color 0.15s;
    &:hover td {
      background-color: rgba(0, 190, 190, 0.04) !important;
    }
  }

  .drill-link {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 500;
    color: rgb(0, 190, 190);
    cursor: pointer;

    .drill-icon {
      font-size: 14px;
    }
  }

  .num-val {
    font-weight: 600;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.85);
    font-variant-numeric: tabular-nums;

    &.primary-num {
      color: rgb(0, 190, 190);
    }
  }

  .rate-badge {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 12px;
    font-weight: 700;
    font-size: 13px;

    &--success {
      background-color: rgba(103, 194, 58, 0.1);
      color: rgb(103, 194, 58);
    }

    &--danger {
      background-color: rgba(240, 0, 0, 0.08);
      color: rgb(240, 0, 0);
    }
  }

  // Mobile aggregation cards (hidden by default)
  .mobile-agg-list {
    display: none;
    flex-direction: column;
    gap: 10px;

    .mobile-agg-card {
      background: #fff;
      border: 1px solid rgb(235, 238, 245);
      border-radius: 8px;
      padding: 12px 14px;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        border-color: rgba(0, 190, 190, 0.4);
        box-shadow: rgba(0, 190, 190, 0.08) 0px 4px 12px;
      }

      .agg-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        padding-bottom: 8px;
        border-bottom: 1px dashed rgb(240, 242, 245);

        .agg-name {
          font-size: 15px;
          font-weight: 600;
          color: rgba(0, 0, 0, 0.85);
        }
      }

      .agg-card-body {
        display: flex;
        justify-content: space-around;

        .agg-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;

          .agg-stat-label {
            font-size: 11px;
            color: rgb(144, 147, 153);
          }

          .agg-stat-val {
            font-size: 16px;
            font-weight: 700;
            color: rgba(0, 0, 0, 0.85);

            &.primary-num {
              color: rgb(0, 190, 190);
            }
          }
        }
      }
    }
  }

  // Order detail styles
  .order-id-link {
    color: rgb(0, 190, 190);
    font-weight: 500;
    cursor: pointer;
    &:hover { text-decoration: underline; }
  }

  .text-danger { color: rgb(240, 0, 0) !important; }
  .text-danger-light { color: rgba(240, 0, 0, 0.8); font-size: 12px; }
  .font-bold { font-weight: bold; }
  .mr-2 { margin-right: 8px; }
  .mt-4 { margin-top: 16px; }

  // Mobile order tickets list (hidden by default)
  .mobile-tickets-list {
    display: none;
    flex-direction: column;
    gap: 12px;

    .mobile-ticket-card {
      background: #fff;
      border: 1px solid rgb(235, 238, 245);
      border-radius: 8px;
      padding: 12px 14px;
      box-shadow: rgba(0, 0, 0, 0.02) 0px 4px 8px 0px;
      display: flex;
      flex-direction: column;
      gap: 10px;

      .card-header-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px dashed rgb(240, 242, 245);
        padding-bottom: 8px;

        .order-info {
          display: flex;
          align-items: center;
          gap: 6px;

          .index-tag {
            font-size: 11px;
            background: #f4f4f5;
            color: #909399;
            padding: 1px 5px;
            border-radius: 3px;
            font-weight: 600;
          }

          .order-id {
            font-size: 14px;
            font-weight: 600;
            color: rgba(0,0,0,0.85);
          }
        }
      }

      .card-detail-body {
        display: flex;
        flex-direction: column;
        gap: 6px;

        .detail-row {
          display: flex;
          justify-content: space-between;
          font-size: 12px;

          .detail-label { color: rgb(144, 147, 153); }
          .detail-value { color: rgba(0, 0, 0, 0.8); font-weight: 500; }
        }
      }

      .card-analysis-footer {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        background-color: rgba(240, 0, 0, 0.02);
        padding: 6px 10px;
        border-radius: 4px;
        border: 1px solid rgba(240, 0, 0, 0.05);

        .footer-label { color: rgb(240, 0, 0); font-weight: 500; }
        .footer-value { color: rgb(240, 0, 0); font-weight: 600; }
      }
    }
  }

  /* Mobile Responsive */
  @media (max-width: 768px) {
    padding: 12px;

    .header-card {
      margin-bottom: 12px;
      .header-title { font-size: 14px; }
      .filter-summary { margin-top: 10px; padding-top: 10px; }
    }

    .table-card {
      .table-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 6px;
      }
      .desktop-table { display: none !important; }
    }

    .mobile-agg-list { display: flex; }
    .mobile-tickets-list { display: flex; }
  }
}
</style>
