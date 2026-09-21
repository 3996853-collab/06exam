<template>
  <div class="dashboard-config-container">
    <div class="page-header">
      <div class="header-left">
        <h2 class="title">看板配置管理</h2>
        <p class="subtitle">
          配置移动端动态指标控制台的指标展示项、呈现顺序、正负向趋势与展示单位。配置修改后实时同步至移动看板。
        </p>
      </div>
      <div class="header-right">
        <el-button @click="handleReset" :icon="Refresh">恢复默认</el-button>
        <el-button type="primary" :icon="Cellphone" @click="goToMobileDashboard">查看移动看板</el-button>
      </div>
    </div>

    <!-- Overview Bar -->
    <div class="stats-bar">
      <div class="stat-pill">
        <span class="label">已配置指标总数：</span>
        <span class="num">{{ metricStore.configs.length }}</span>
      </div>
      <div class="stat-pill active">
        <span class="label">移动端可见指标：</span>
        <span class="num">{{ visibleCount }}</span>
      </div>
      <div class="stat-pill muted">
        <span class="label">已隐藏指标：</span>
        <span class="num">{{ metricStore.configs.length - visibleCount }}</span>
      </div>
      <div class="tip-text">
        <el-icon><InfoFilled /></el-icon>
        <span>支持点击上下按钮调整在移动端的显示顺序；输入框失焦后自动保存。</span>
      </div>
    </div>

    <!-- Metric List Card -->
    <el-card class="config-card" shadow="never">
      <div class="table-container">
        <el-table
          :data="sortedConfigs"
          row-key="id"
          stripe
          style="width: 100%"
          :header-cell-style="{ background: '#fafafa', color: 'rgba(0, 0, 0, 0.85)', fontWeight: '600' }"
        >
          <!-- 排序与调整 -->
          <el-table-column label="排序" width="100" align="center">
            <template #default="{ row, $index }">
              <div class="sort-controls">
                <el-button
                  link
                  size="small"
                  :disabled="$index === 0"
                  @click="moveItem($index, -1)"
                  :icon="Top"
                  title="上移"
                />
                <span class="order-badge">{{ row.sortOrder }}</span>
                <el-button
                  link
                  size="small"
                  :disabled="$index === sortedConfigs.length - 1"
                  @click="moveItem($index, 1)"
                  :icon="Bottom"
                  title="下移"
                />
              </div>
            </template>
          </el-table-column>

          <!-- 指标唯一键 -->
          <el-table-column label="指标键 (metric_key)" min-width="160">
            <template #default="{ row }">
              <el-tag type="info" class="key-tag" effect="plain">
                {{ row.metricKey }}
              </el-tag>
            </template>
          </el-table-column>

          <!-- 显示名称 -->
          <el-table-column label="显示名称 (display_name)" min-width="180">
            <template #default="{ row }">
              <el-input
                v-model="row.displayName"
                size="small"
                placeholder="请输入指标显示名称"
                @change="handleFieldChange(row, 'displayName')"
              />
            </template>
          </el-table-column>

          <!-- 单位 -->
          <el-table-column label="单位 (unit)" width="120">
            <template #default="{ row }">
              <el-input
                v-model="row.unit"
                size="small"
                placeholder="如: 万元"
                @change="handleFieldChange(row, 'unit')"
              />
            </template>
          </el-table-column>

          <!-- 走向偏好 -->
          <el-table-column label="指标走向偏好" width="180">
            <template #default="{ row }">
              <el-select
                v-model="row.trendType"
                size="small"
                @change="handleFieldChange(row, 'trendType')"
              >
                <el-option value="positive" label="正向 (增加为好)">
                  <span class="trend-option positive">
                    <el-icon><Top /></el-icon> 正向 (增加为好)
                  </span>
                </el-option>
                <el-option value="negative" label="负向 (减少为好)">
                  <span class="trend-option negative">
                    <el-icon><Bottom /></el-icon> 负向 (减少为好)
                  </span>
                </el-option>
              </el-select>
            </template>
          </el-table-column>

          <!-- 移动端是否展示 -->
          <el-table-column label="移动端展示" width="130" align="center">
            <template #default="{ row }">
              <el-switch
                v-model="row.isVisible"
                active-text="展示"
                inactive-text="隐藏"
                inline-prompt
                active-color="#00bebe"
                @change="handleFieldChange(row, 'isVisible')"
              />
            </template>
          </el-table-column>

          <!-- 状态 -->
          <el-table-column label="状态" width="100" align="center">
            <template #default="{ row }">
              <span v-if="savingMap[row.id]" class="status-saving">
                <el-icon class="is-loading"><Loading /></el-icon> 保存中
              </span>
              <span v-else class="status-saved">
                <el-icon><Check /></el-icon> 已同步
              </span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Top,
  Bottom,
  Check,
  Loading,
  Refresh,
  Cellphone,
  InfoFilled
} from '@element-plus/icons-vue'
import { useMetricConfigStore, MetricConfigItem } from '@/store/modules/metricConfig'

const router = useRouter()
const metricStore = useMetricConfigStore()

const savingMap = ref<Record<string, boolean>>({})

const sortedConfigs = computed(() => {
  return [...metricStore.configs].sort((a, b) => a.sortOrder - b.sortOrder)
})

const visibleCount = computed(() => {
  return metricStore.configs.filter(c => c.isVisible).length
})

const handleFieldChange = (row: MetricConfigItem, field: keyof MetricConfigItem) => {
  savingMap.value[row.id] = true
  metricStore.updateConfig(row.id, { [field]: row[field] })
  setTimeout(() => {
    savingMap.value[row.id] = false
    ElMessage.success(`指标「${row.displayName}」配置已更新并实时同步`)
  }, 300)
}

const moveItem = (index: number, direction: -1 | 1) => {
  const currentList = [...sortedConfigs.value]
  const targetIndex = index + direction
  if (targetIndex < 0 || targetIndex >= currentList.length) return

  const temp = currentList[index]
  currentList[index] = currentList[targetIndex]
  currentList[targetIndex] = temp

  const newOrder = currentList.map((item, idx) => ({
    id: item.id,
    sortOrder: idx + 1
  }))

  metricStore.updateSortOrder(newOrder)
  ElMessage.success('排序已更新')
}

const handleReset = () => {
  ElMessageBox.confirm('确定要将所有指标配置重置为默认值吗？', '提示', {
    confirmButtonText: '确定重置',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    metricStore.resetToDefault()
    ElMessage.success('已恢复为默认指标配置')
  })
}

const goToMobileDashboard = () => {
  router.push('/mobile-dashboard')
}
</script>

<style scoped lang="scss">
.dashboard-config-container {
  padding: 20px 24px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 84px);

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
    padding: 16px 20px;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
    margin-bottom: 16px;

    .header-left {
      .title {
        font-size: 18px;
        font-weight: 600;
        color: rgba(0, 0, 0, 0.85);
        margin: 0 0 6px 0;
      }
      .subtitle {
        font-size: 13px;
        color: #909399;
        margin: 0;
      }
    }

    .header-right {
      display: flex;
      gap: 12px;
    }
  }

  .stats-bar {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;
    padding: 0 4px;
    flex-wrap: wrap;

    .stat-pill {
      background: #fff;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 13px;
      border: 1px solid #e4e7ed;

      .label {
        color: #606266;
      }
      .num {
        font-weight: 600;
        color: #303133;
        margin-left: 4px;
      }

      &.active {
        border-color: #00bebe;
        background: rgba(0, 190, 190, 0.06);
        .num {
          color: #00bebe;
        }
      }
    }

    .tip-text {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #909399;
      margin-left: auto;
    }
  }

  .config-card {
    border-radius: 8px;
    border: none;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);

    .key-tag {
      font-family: 'Consolas', monospace;
      font-weight: 500;
      font-size: 12px;
    }

    .sort-controls {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;

      .order-badge {
        display: inline-block;
        width: 22px;
        height: 22px;
        line-height: 22px;
        background: #f4f4f5;
        border-radius: 50%;
        font-size: 12px;
        font-weight: 600;
        color: #606266;
      }
    }

    .trend-option {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;

      &.positive {
        color: #f56c6c;
      }
      &.negative {
        color: #67c23a;
      }
    }

    .status-saving {
      color: #e6a23c;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }

    .status-saved {
      color: #67c23a;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }
  }
}
</style>
