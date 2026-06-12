<template>
  <div class="abnormal-detail-page">
    <!-- 头部导航与面包屑 -->
    <el-card class="header-card" shadow="never">
      <el-page-header @back="goBack">
        <template #content>
          <span class="header-title">异常明细 - {{ activeMetricMeta?.name }}</span>
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
        <el-descriptions class="margin-top" :column="4" size="small" border>
          <el-descriptions-item label="监控指标">
            <el-tag type="primary" size="small">{{ activeMetricMeta?.name }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="时间范围">
            {{ dateRangeText }}
          </el-descriptions-item>
          <el-descriptions-item label="责任省区">
            {{ queryProvince || '总部 (全部省区)' }}
          </el-descriptions-item>
          <el-descriptions-item label="责任网点">
            {{ queryStation || '全部网点' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>

    <!-- 异常清单 -->
    <el-card class="table-card mt-4" shadow="never">
      <template #header>
        <div class="table-header">
          <div class="table-title">
            <el-icon class="mr-2 text-danger"><Warning /></el-icon>
            <span>异常单明细列表</span>
            <span class="ticket-count">共 {{ filteredTickets.length }} 笔异常</span>
          </div>
        </div>
      </template>

      <!-- 桌面端表格视角 (仅在 >768px 宽度下展示) -->
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
            <span class="text-danger-light">
              {{ getAnomalyReason(scope.row) }}
            </span>
          </template>
        </el-table-column>
      </el-table>

      <!-- 移动端卡片列表视角 (仅在 <=768px 宽度下展示) -->
      <div class="mobile-tickets-list" v-loading="loading">
        <div 
          v-for="(ticket, idx) in filteredTickets" 
          :key="ticket.orderId" 
          class="mobile-ticket-card"
        >
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
import { Download, Warning } from '@element-plus/icons-vue';
import dayjs from 'dayjs';

import { METRIC_CONFIGS, AnomalyTicket } from './types';
import { allAnomalyTickets } from './mockData';

const route = useRoute();
const router = useRouter();

const loading = ref(true);

// Extract query params
const queryMetric = computed(() => (route.query.metric as string) || 'orderAccept');
const queryTimeRange = computed(() => (route.query.timeRange as string) || '30d');
const queryProvince = computed(() => (route.query.province as string) || '');
const queryStation = computed(() => (route.query.station as string) || '');
const queryDate = computed(() => (route.query.date as string) || '');

// Metric Meta
const activeMetricMeta = computed(() => {
  return METRIC_CONFIGS.find(m => m.key === queryMetric.value) || METRIC_CONFIGS[0];
});

// Calculate date thresholds
const dateRangeText = computed(() => {
  if (queryDate.value) {
    return queryDate.value;
  }
  
  const lastRecordDate = allAnomalyTickets[allAnomalyTickets.length - 1]?.date || dayjs().format('YYYY-MM-DD');
  const maxDate = dayjs(lastRecordDate);
  const days = queryTimeRange.value === '7d' ? 7 : 30;
  const startDateStr = maxDate.subtract(days, 'day').format('YYYY-MM-DD');
  return `${startDateStr} 至 ${lastRecordDate}`;
});

const minDateLimit = computed(() => {
  const lastRecordDate = allAnomalyTickets[allAnomalyTickets.length - 1]?.date || dayjs().format('YYYY-MM-DD');
  const maxDate = dayjs(lastRecordDate);
  const days = queryTimeRange.value === '7d' ? 7 : 30;
  return maxDate.subtract(days, 'day').format('YYYY-MM-DD');
});

// Filter anomaly ticket records
const filteredTickets = computed(() => {
  return allAnomalyTickets.filter(t => {
    // 1. Metric filter
    if (t.metricKey !== queryMetric.value) return false;

    // 2. Date filter
    if (queryDate.value) {
      if (t.date !== queryDate.value) return false;
    } else {
      if (t.date < minDateLimit.value) return false;
    }

    // 3. Province filter
    if (queryProvince.value && t.province !== queryProvince.value) return false;

    // 4. Station filter
    if (queryStation.value && t.station !== queryStation.value) return false;

    return true;
  });
});

// Mock loading
onMounted(() => {
  setTimeout(() => {
    loading.value = false;
  }, 400);
});

// Action Handlers
const goBack = () => {
  router.push({
    path: '/service-quality/quality-control-dashboard',
    query: {
      timeRange: queryTimeRange.value,
      province: queryProvince.value,
      station: queryStation.value,
      metric: queryMetric.value
    }
  });
};

const handleExport = () => {
  ElMessage.success(`异常数据导出成功！共导出 ${filteredTickets.value.length} 条记录。`);
};

// Generate a descriptive anomaly reason
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

    .header-title {
      font-size: 18px;
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

        .ticket-count {
          font-size: 12px;
          color: rgb(144, 147, 153);
          background-color: rgba(240, 0, 0, 0.05);
          color: rgb(240, 0, 0);
          padding: 2px 8px;
          border-radius: 12px;
          margin-left: 10px;
          font-weight: 500;
        }
      }
    }
  }

  .order-id-link {
    color: rgb(0, 190, 190);
    font-weight: 500;
    cursor: pointer;
    
    &:hover {
      text-decoration: underline;
    }
  }

  .text-danger {
    color: rgb(240, 0, 0) !important;
  }
  .text-danger-light {
    color: rgba(240, 0, 0, 0.8);
    font-size: 12px;
  }

  .font-bold {
    font-weight: bold;
  }

  .mr-2 {
    margin-right: 8px;
  }
  .mt-4 {
    margin-top: 16px;
  }

  // Mobile list styling (hidden by default)
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
          
          .detail-label {
            color: rgb(144, 147, 153);
          }
          .detail-value {
            color: rgba(0, 0, 0, 0.8);
            font-weight: 500;
          }
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
        
        .footer-label {
          color: rgb(240, 0, 0);
          font-weight: 500;
        }
        .footer-value {
          color: rgb(240, 0, 0);
          font-weight: 600;
        }
      }
    }
  }

  /* Mobile Responsive overrides */
  @media (max-width: 768px) {
    padding: 12px;

    .header-card {
      margin-bottom: 12px;
      .header-title {
        font-size: 15px;
      }
      
      .filter-summary {
        margin-top: 10px;
        padding-top: 10px;
      }
    }

    .table-card {
      .table-header .table-title {
        font-size: 13px;
        .ticket-count {
          font-size: 11px;
          padding: 1px 6px;
        }
      }
    }

    .desktop-table {
      display: none !important; /* Hide wide table */
    }

    .mobile-tickets-list {
      display: flex; /* Show card list */
    }
  }
}
</style>
