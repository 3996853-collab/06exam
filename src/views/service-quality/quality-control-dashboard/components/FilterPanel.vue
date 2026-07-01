<template>
  <div class="filter-panel">
    <div class="filter-left">
      <!-- 固定的总部标识 & 时间选择 -->
      <div class="filter-item hq-container">
        <span class="hq-label">
          <el-icon class="mr-1"><OfficeBuilding /></el-icon>
          {{ headquarters }}
        </span>
        <span class="divider">/</span>
      </div>

      <!-- 时间粒度切换 -->
      <div class="filter-item">
        <span class="filter-label">查询粒度</span>
        <el-radio-group v-model="localGranularity" size="default" @change="emitFilters">
          <el-radio-button value="day">按天</el-radio-button>
          <el-radio-button value="month">按月</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 时间范围选择器 -->
      <div class="filter-item flex-grow-mobile time-picker-container">
        <span class="filter-label">时间范围</span>

        <!-- 按天：近7天/近30天 + 自定义日期范围 -->
        <template v-if="localGranularity === 'day'">
          <el-radio-group v-model="localTimeRange" size="default" class="full-width-mobile" @change="handleTimeRangeChange">
            <el-radio-button value="7d">近 7 天</el-radio-button>
            <el-radio-button value="30d">近 30 天</el-radio-button>
          </el-radio-group>
          <el-date-picker
            v-model="localCustomDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            size="default"
            value-format="YYYY-MM-DD"
            class="custom-date-picker-input"
            @change="handleCustomDateChange"
          />
        </template>

        <!-- 按月：月份范围选择 -->
        <template v-else>
          <el-date-picker
            v-model="localMonthRange"
            type="monthrange"
            range-separator="至"
            start-placeholder="开始月份"
            end-placeholder="结束月份"
            size="default"
            value-format="YYYY-MM"
            class="custom-date-picker-input"
            @change="handleMonthRangeChange"
          />
        </template>
      </div>
    </div>

    <div class="filter-right">
      <!-- 省区筛选 -->
      <div class="filter-item">
        <span class="filter-label">省区</span>
        <el-select
          v-model="localProvince"
          placeholder="全国 (全部省区)"
          clearable
          size="default"
          style="width: 180px"
          class="select-mobile"
          @change="handleProvinceChange"
        >
          <el-option v-for="p in provinces" :key="p" :label="p" :value="p" />
        </el-select>
      </div>

      <!-- 网点筛选 (受省区级联过滤) -->
      <div class="filter-item">
        <span class="filter-label">网点</span>
        <el-select
          v-model="localStation"
          placeholder="全部网点"
          :disabled="!localProvince"
          clearable
          size="default"
          style="width: 200px"
          class="select-mobile"
          @change="emitFilters"
        >
          <el-option v-for="s in filteredStations" :key="s" :label="s" :value="s" />
        </el-select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { PROVINCES, PROVINCE_STATIONS_MAP, HEADQUARTERS } from '../types';
import { OfficeBuilding } from '@element-plus/icons-vue';

const props = defineProps<{
  timeRange: '7d' | '30d' | '';
  customDateRange: [string, string] | null;
  monthRange: [string, string] | null;
  granularity: 'day' | 'month';
  province: string;
  station: string;
}>();

const emit = defineEmits<{
  (e: 'update:timeRange', val: '7d' | '30d' | ''): void;
  (e: 'update:customDateRange', val: [string, string] | null): void;
  (e: 'update:monthRange', val: [string, string] | null): void;
  (e: 'update:granularity', val: 'day' | 'month'): void;
  (e: 'update:province', val: string): void;
  (e: 'update:station', val: string): void;
  (e: 'change'): void;
}>();

// Local model definitions
const localTimeRange = ref(props.timeRange);
const localCustomDateRange = ref<[string, string] | null>(props.customDateRange);
const localMonthRange = ref<[string, string] | null>(props.monthRange);
const localGranularity = ref<'day' | 'month'>(props.granularity);
const localProvince = ref(props.province);
const localStation = ref(props.station);

// Constant Options
const headquarters = HEADQUARTERS;
const provinces = PROVINCES;

// Cascade rule: filter stations based on selected province
const filteredStations = computed(() => {
  if (localProvince.value && PROVINCE_STATIONS_MAP[localProvince.value]) {
    return PROVINCE_STATIONS_MAP[localProvince.value];
  }
  return [];
});

// Watch for prop updates to sync local state
watch(() => props.timeRange, (v) => { localTimeRange.value = v; });
watch(() => props.customDateRange, (v) => { localCustomDateRange.value = v; });
watch(() => props.monthRange, (v) => { localMonthRange.value = v; });
watch(() => props.granularity, (v) => { localGranularity.value = v; });
watch(() => props.province, (v) => { localProvince.value = v; });
watch(() => props.station, (v) => { localStation.value = v; });

// Handle preset time range (day mode)
const handleTimeRangeChange = () => {
  localCustomDateRange.value = null;
  emitFilters();
};

// Handle custom date range picker (day mode)
const handleCustomDateChange = (val: any) => {
  if (val && val.length > 0) {
    localTimeRange.value = ''; // Deselect preset buttons
  }
  emitFilters();
};

// Handle month range picker change
const handleMonthRangeChange = () => {
  emitFilters();
};

// Handle province change (resets station selection)
const handleProvinceChange = () => {
  localStation.value = '';
  emitFilters();
};

// Emit all current values up
const emitFilters = () => {
  emit('update:granularity', localGranularity.value);
  emit('update:timeRange', localTimeRange.value);
  emit('update:customDateRange', localCustomDateRange.value);
  emit('update:monthRange', localMonthRange.value);
  emit('update:province', localProvince.value);
  emit('update:station', localStation.value);
  emit('change');
};
</script>

<style scoped lang="scss">
.filter-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  padding: 16px 20px;
  border-radius: 8px;
  box-shadow: rgba(0, 0, 0, 0.04) 0px 4px 12px 0px;
  border: 1px solid rgb(235, 238, 245);
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;

  .filter-left, .filter-right {
    display: flex;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
  }

  .time-picker-container {
    display: flex;
    align-items: center;
    gap: 12px;

    .custom-date-picker-input {
      width: 240px;
      :deep(.el-input__wrapper) {
        box-shadow: 0 0 0 1px rgb(220, 223, 230) inset;
        &:hover {
          box-shadow: 0 0 0 1px rgb(190, 190, 190) inset;
        }
      }
    }
  }

  .filter-item {
    display: flex;
    align-items: center;
    gap: 8px;

    .hq-label {
      font-size: 15px;
      font-weight: 600;
      color: rgb(0, 190, 190);
      display: flex;
      align-items: center;
    }

    .divider {
      color: rgb(220, 223, 230);
      font-size: 14px;
      margin-left: 8px;
    }

    .filter-label {
      font-size: 14px;
      color: rgb(96, 98, 102);
      font-weight: 500;
      white-space: nowrap;
    }
  }

  .mr-1 {
    margin-right: 4px;
    vertical-align: middle;
  }

  /* Radio group theme override */
  :deep(.el-radio-button__orig-radio:checked + .el-radio-button__inner) {
    background-color: rgb(0, 190, 190);
    border-color: rgb(0, 190, 190);
    box-shadow: -1px 0 0 0 rgb(0, 190, 190);
  }
  :deep(.el-radio-button__inner:hover) {
    color: rgb(0, 190, 190);
  }
  :deep(.el-select .el-input.is-focus .el-input__wrapper) {
    box-shadow: 0 0 0 1px rgb(0, 190, 190) inset !important;
  }

  /* Mobile Responsive rules */
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    padding: 12px 14px;
    gap: 12px;

    .filter-left, .filter-right {
      flex-direction: column;
      align-items: stretch;
      gap: 10px;
      width: 100%;
    }

    .time-picker-container {
      flex-direction: column;
      align-items: stretch;
      gap: 8px;
      width: 100%;

      .custom-date-picker-input {
        width: 100% !important;
      }
    }

    .filter-item {
      display: flex;
      justify-content: space-between;
      width: 100%;

      .filter-label {
        min-width: 52px;
      }

      .full-width-mobile {
        width: 100%;
        display: flex;
        :deep(.el-radio-button) {
          flex: 1;
          .el-radio-button__inner {
            width: 100%;
            text-align: center;
          }
        }
      }

      .select-mobile {
        width: 100% !important;
        flex-grow: 1;
      }
    }

    .hq-container {
      display: none;
    }
  }
}
</style>
