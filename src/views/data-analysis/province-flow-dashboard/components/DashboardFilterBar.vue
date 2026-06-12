<template>
  <div class="dashboard-filter-bar">
    <el-card shadow="hover">
      <el-form :inline="true" class="filter-form">
        <el-form-item label="流向类型">
          <el-radio-group v-model="localFlowType" @change="handleFlowTypeChange">
            <el-radio-button label="全部">全部</el-radio-button>
            <el-radio-button label="同省">同省</el-radio-button>
            <el-radio-button label="不同省">不同省</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="指标">
          <el-radio-group v-model="localMetric" @change="handleMetricChange">
            <el-radio-button label="weight">结算重量(吨)</el-radio-button>
            <el-radio-button label="tickets">票数</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="$emit('reset')">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  flowType: '全部' | '同省' | '不同省'
  metric: 'weight' | 'tickets'
}>()

const emit = defineEmits<{
  'update:flowType': [value: '全部' | '同省' | '不同省']
  'update:metric': [value: 'weight' | 'tickets']
  'reset': []
}>()

const localFlowType = ref<'全部' | '同省' | '不同省'>(props.flowType)
const localMetric = ref<'weight' | 'tickets'>(props.metric)

watch(() => props.flowType, (newValue) => {
  localFlowType.value = newValue
})

watch(() => props.metric, (newValue) => {
  localMetric.value = newValue
})

const handleFlowTypeChange = (value: '全部' | '同省' | '不同省') => {
  emit('update:flowType', value)
}

const handleMetricChange = (value: 'weight' | 'tickets') => {
  emit('update:metric', value)
}
</script>

<style scoped>
.dashboard-filter-bar {
  margin-bottom: 20px;
}

.filter-form {
  display: flex;
  align-items: center;
  gap: 20px;
}

@media (max-width: 768px) {
  .filter-form {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>
