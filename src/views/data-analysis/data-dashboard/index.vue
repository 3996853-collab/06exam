<template>
  <div class="data-dashboard">
    <el-page-header content="数据看板" @back="goBack" />
    <div class="controls">
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        @change="fetchData"
        style="margin-right: 12px;"
      />
      <el-button type="primary" @click="fetchData">查询</el-button>
    </div>
    <el-row :gutter="20" class="metrics-grid">
      <el-col :span="6" v-for="metric in metrics" :key="metric.key">
        <el-card class="metric-card" shadow="hover">
          <div class="metric-header">
            <span class="metric-title">{{ metric.title }}</span>
            <el-tag :type="metric.value <= metric.target ? 'success' : 'danger'" class="metric-tag">
              目标 {{ metric.target }}{{ metric.unit }}
            </el-tag>
          </div>
          <div class="metric-value">
            <span class="value-number">{{ metric.value }}{{ metric.unit }}</span>
          </div>
          <el-progress
            :percentage="(metric.value / metric.target) * 100"
            :color="metric.value <= metric.target ? '#00b8c4' : '#f56c6c'"
            :stroke-width="8"
            style="margin-top: 8px;"
          />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

interface Metric {
  key: string;
  title: string;
  value: number;
  target: number;
  unit: string;
}

const router = useRouter();
const goBack = () => router.back();

const dateRange = ref<[Date, Date] | null>(null);

const metrics = ref<Metric[]>([]);

// Mock data generator based on selected date range
function generateMockMetrics(): Metric[] {
  return [
    { key: 'complaintRate', title: '工单投诉率', value: 0.8, target: 1, unit: '%' },
    { key: 'firstResponse', title: '工单时效内首响率', value: 96, target: 95, unit: '%' },
    { key: 'completionRate', title: '工单时效内完结率', value: 94, target: 95, unit: '%' },
    { key: 'repeatComplaint', title: '工单重复投诉率', value: 0.5, target: 1, unit: '%' },
    { key: 'orderAccept', title: '订单接单及时率', value: 99, target: 98, unit: '%' },
    { key: 'arbitration', title: '仲裁率', value: 0.08, target: 0.10, unit: '%' },
    { key: 'signOnTime', title: '签收及时率', value: 91, target: 90, unit: '%' },
    { key: 'pickupOnTime', title: '提货及时率', value: 86, target: 85, unit: '%' },
    { key: 'deliveryOnTime', title: '交件及时率', value: 98, target: 97, unit: '%' },
    { key: 'receiptReturn', title: '回单返回及时率', value: 100, target: 100, unit: '%' },
  ];
}

function fetchData() {
  // In a real app, you would request data from backend using dateRange.
  // Here we simply generate mock data.
  metrics.value = generateMockMetrics();
}

onMounted(() => {
  fetchData();
});
</script>

<style scoped lang="scss">
.data-dashboard {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: 100vh;

  .controls {
    display: flex;
    align-items: center;
    margin-bottom: 24px;
  }

  .metrics-grid {
    .metric-card {
      border-radius: 8px;
      background: #fff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      padding: 16px;

      .metric-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        .metric-title {
          font-size: 14px;
          font-weight: 500;
          color: #303133;
        }
        .metric-tag {
          font-size: 12px;
        }
      }

      .metric-value {
        .value-number {
          font-size: 20px;
          font-weight: 600;
          color: #00b8c4;
        }
      }
    }
  }
}
</style>
