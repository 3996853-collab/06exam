<template>
  <div 
    class="kpi-card" 
    :class="{ 
      'is-active': active,
      'is-breached': isBreached
    }"
    @click="$emit('select')"
  >
    <div class="card-header">
      <span class="metric-name" :title="meta.name">{{ meta.name }}</span>
      <el-tag 
        :type="isBreached ? 'danger' : 'success'" 
        size="small" 
        effect="light"
        class="status-tag"
      >
        {{ isBreached ? '异常' : '达标' }}
      </el-tag>
    </div>
    
    <div class="card-body">
      <div class="metric-rate" :class="{ 'text-danger': isBreached }">
        {{ (rate * 100).toFixed(1) }}%
      </div>
      <div class="metric-detail">
        <span class="label">异常数/总数:</span>
        <span class="numerator text-danger-val">{{ anomalyCount.toLocaleString() }}</span>
        <span class="divider">/</span>
        <span class="denominator">{{ denominator.toLocaleString() }}</span>
      </div>
    </div>
    
    <div class="card-footer">
      <div class="threshold-info">
        <span class="threshold-label">目标: </span>
        <span class="threshold-value">
          {{ meta.isPositive ? '≥' : '≤' }} {{ (meta.threshold * 100).toFixed(0) }}%
        </span>
      </div>
      <div class="view-detail" @click.stop="$emit('view-detail', meta.key)">
        查看明细
        <el-icon class="arrow-icon"><ArrowRight /></el-icon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { MetricMeta } from '../types';
import { ArrowRight } from '@element-plus/icons-vue';

const props = defineProps<{
  meta: MetricMeta;
  numerator: number;
  denominator: number;
  rate: number;
  active: boolean;
}>();

defineEmits<{
  (e: 'select'): void;
  (e: 'view-detail', key: string): void;
}>();

// Check if threshold is breached
const isBreached = computed(() => {
  if (props.meta.isPositive) {
    return props.rate < props.meta.threshold;
  } else {
    return props.rate > props.meta.threshold;
  }
});

// Calculate abnormal count
const anomalyCount = computed(() => {
  if (props.meta.isPositive) {
    return Math.max(0, props.denominator - props.numerator);
  } else {
    return props.numerator;
  }
});
</script>

<style scoped lang="scss">
.kpi-card {
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid rgb(235, 238, 245);
  padding: 16px;
  box-shadow: rgba(0, 0, 0, 0.04) 0px 4px 12px 0px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: rgba(0, 0, 0, 0.12) 0px 8px 24px 0px;
    border-color: rgba(0, 190, 190, 0.5);
    
    .card-footer .view-detail {
      color: rgb(0, 190, 190);
      .arrow-icon {
        transform: translateX(2px);
      }
    }
  }

  &.is-active {
    border-color: rgb(0, 190, 190);
    box-shadow: rgba(0, 190, 190, 0.15) 0px 0px 0px 4px, rgba(0, 0, 0, 0.08) 0px 4px 12px 0px;
    background: linear-gradient(180deg, #fff 0%, rgba(0, 190, 190, 0.02) 100%);

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background-color: rgb(0, 190, 190);
    }
  }

  &.is-breached {
    background: linear-gradient(180deg, #fff 0%, rgba(240, 0, 0, 0.01) 100%);
    
    &:hover {
      border-color: rgba(240, 0, 0, 0.5);
      
      .card-footer .view-detail {
        color: rgb(240, 0, 0);
      }
    }

    &.is-active {
      border-color: rgb(240, 0, 0);
      box-shadow: rgba(240, 0, 0, 0.1) 0px 0px 0px 4px, rgba(0, 0, 0, 0.08) 0px 4px 12px 0px;
      
      &::before {
        background-color: rgb(240, 0, 0);
      }
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    gap: 6px;

    .metric-name {
      font-size: 14px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.8);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .status-tag {
      font-size: 11px;
      border-radius: 4px;
      padding: 0 6px;
      flex-shrink: 0;
    }
  }

  .card-body {
    margin-bottom: 12px;

    .metric-rate {
      font-size: 28px;
      font-weight: 700;
      color: rgba(0, 0, 0, 0.9);
      line-height: 1.2;
      margin-bottom: 4px;

      &.text-danger {
        color: rgb(240, 0, 0);
      }
    }

    .metric-detail {
      font-size: 12px;
      color: rgb(144, 147, 153);
      display: flex;
      align-items: center;
      gap: 3px;
      flex-wrap: wrap;

      .label {
        margin-right: 2px;
      }
      .text-danger-val {
        color: rgb(240, 0, 0);
        font-weight: 600;
      }
      .divider {
        color: rgb(220, 223, 230);
      }
    }
  }

  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11px;
    color: rgb(144, 147, 153);
    border-top: 1px solid rgb(245, 247, 250);
    padding-top: 8px;
    margin-top: auto;

    .threshold-info {
      display: flex;
      align-items: center;
    }

    .threshold-value {
      font-weight: 500;
      margin-left: 2px;
    }

    .view-detail {
      color: rgb(144, 147, 153);
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 2px;
      transition: color 0.2s;
      cursor: pointer;

      .arrow-icon {
        font-size: 10px;
        transition: transform 0.2s;
      }
    }
  }

  /* Mobile style overrides */
  @media (max-width: 768px) {
    padding: 12px;

    .card-header {
      margin-bottom: 6px;
      
      .metric-name {
        font-size: 13px;
      }
    }

    .card-body {
      margin-bottom: 8px;

      .metric-rate {
        font-size: 22px;
      }

      .metric-detail {
        font-size: 11px;
        gap: 2px;
      }
    }

    .card-footer {
      padding-top: 6px;
    }
  }
}
</style>
