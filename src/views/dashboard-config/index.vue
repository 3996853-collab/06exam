<template>
  <div class="dashboard-config-container">
    <div class="page-header">
      <div class="header-left">
        <h2 class="title">看板配置管理</h2>
        <p class="subtitle">
          支持对移动端「业务数据（操作量、操作质量、运输质量）」与「基础数据（场地信息、物资信息、服务网点）」各分类指标进行排序、走向偏好及可见性配置。
        </p>
      </div>
      <div class="header-right">
        <el-button @click="handleReset" :icon="Refresh">恢复默认</el-button>
        <el-button type="primary" :icon="Cellphone" @click="goToMobileDashboard">查看移动看板</el-button>
      </div>
    </div>

    <!-- Category Filter Tabs -->
    <div class="filter-card">
      <div class="tab-group-main">
        <el-radio-group v-model="filterMainCategory" size="default" @change="onMainCategoryChange">
          <el-radio-button label="all">全部分类 ({{ metricStore.configs.length }})</el-radio-button>
          <el-radio-button label="business">业务数据 ({{ businessCount }})</el-radio-button>
          <el-radio-button label="basic">基础数据 ({{ basicCount }})</el-radio-button>
        </el-radio-group>

        <!-- 二级分类筛选 -->
        <el-select
          v-model="filterSubCategory"
          placeholder="按二级分组筛选"
          clearable
          size="default"
          class="sub-category-select"
        >
          <el-option-group label="业务数据" v-if="filterMainCategory !== 'basic'">
            <el-option label="操作量" value="operation_volume" />
            <el-option label="操作质量" value="operation_quality" />
            <el-option label="运输质量" value="transport_quality" />
          </el-option-group>
          <el-option-group label="基础数据" v-if="filterMainCategory !== 'business'">
            <el-option label="场地信息" value="site_info" />
            <el-option label="物资信息" value="material_info" />
            <el-option label="服务网点" value="service_outlet" />
          </el-option-group>
        </el-select>

        <!-- 搜索框 -->
        <el-input
          v-model="searchKeyword"
          placeholder="搜索指标键名或显示名称..."
          prefix-icon="Search"
          clearable
          class="search-input"
        />
      </div>

      <!-- Quick Stats -->
      <div class="stats-row">
        <div class="stat-pill active">
          <span class="label">当前列表展示：</span>
          <span class="num">{{ filteredConfigs.length }} 项</span>
        </div>
        <div class="stat-pill">
          <span class="label">移动端可见：</span>
          <span class="num">{{ visibleCount }} 项</span>
        </div>
        <div class="stat-pill muted">
          <span class="label">已隐藏：</span>
          <span class="num">{{ metricStore.configs.length - visibleCount }} 项</span>
        </div>
      </div>
    </div>

    <!-- Metric List Card -->
    <el-card class="config-card" shadow="never">
      <div class="table-container">
        <el-table
          :data="filteredConfigs"
          row-key="id"
          stripe
          style="width: 100%"
          :header-cell-style="{ background: '#fafafa', color: 'rgba(0, 0, 0, 0.85)', fontWeight: '600' }"
        >
          <!-- 排序 -->
          <el-table-column label="排序" width="90" align="center">
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
                  :disabled="$index === filteredConfigs.length - 1"
                  @click="moveItem($index, 1)"
                  :icon="Bottom"
                  title="下移"
                />
              </div>
            </template>
          </el-table-column>

          <!-- 所属分组 -->
          <el-table-column label="所属分组" width="160">
            <template #default="{ row }">
              <div class="group-cell">
                <el-tag size="small" :type="row.category === 'business' ? 'success' : 'primary'" effect="light">
                  {{ row.category === 'business' ? '业务数据' : '基础数据' }}
                </el-tag>
                <span class="sub-label">{{ getSubCategoryName(row.subCategory) }}</span>
              </div>
            </template>
          </el-table-column>

          <!-- 指标唯一键 -->
          <el-table-column label="指标键 (metric_key)" min-width="180">
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
                placeholder="请输入显示名称"
                @change="handleFieldChange(row, 'displayName')"
              />
            </template>
          </el-table-column>

          <!-- 单位 -->
          <el-table-column label="单位 (unit)" width="110">
            <template #default="{ row }">
              <el-input
                v-model="row.unit"
                size="small"
                placeholder="如: %"
                @change="handleFieldChange(row, 'unit')"
              />
            </template>
          </el-table-column>

          <!-- 走向偏好 -->
          <el-table-column label="指标走向偏好" width="160">
            <template #default="{ row }">
              <el-select
                v-model="row.trendType"
                size="small"
                @change="handleFieldChange(row, 'trendType')"
              >
                <el-option value="positive" label="正向 (增加为好)">
                  <span class="trend-option positive">
                    <el-icon><Top /></el-icon> 正向 (良好)
                  </span>
                </el-option>
                <el-option value="negative" label="逆向 (减少为好)">
                  <span class="trend-option negative">
                    <el-icon><Bottom /></el-icon> 逆向 (警示)
                  </span>
                </el-option>
              </el-select>
            </template>
          </el-table-column>

          <!-- 移动端是否展示 -->
          <el-table-column label="端上展示" width="110" align="center">
            <template #default="{ row }">
              <el-switch
                v-model="row.isVisible"
                active-text="开"
                inactive-text="关"
                inline-prompt
                active-color="#00bebe"
                @change="handleFieldChange(row, 'isVisible')"
              />
            </template>
          </el-table-column>

          <!-- 同步状态 -->
          <el-table-column label="同步状态" width="100" align="center">
            <template #default="{ row }">
              <span v-if="savingMap[row.id]" class="status-saving">
                <el-icon class="is-loading"><Loading /></el-icon> 同步中
              </span>
              <span v-else class="status-saved">
                <el-icon><Check /></el-icon> 已就绪
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
  Cellphone
} from '@element-plus/icons-vue'
import { useMetricConfigStore, MetricConfigItem, SubCategory } from '@/store/modules/metricConfig'

const router = useRouter()
const metricStore = useMetricConfigStore()

const filterMainCategory = ref<string>('all')
const filterSubCategory = ref<string>('')
const searchKeyword = ref<string>('')
const savingMap = ref<Record<string, boolean>>({})

const subCategoryMap: Record<string, string> = {
  operation_volume: '操作量',
  operation_quality: '操作质量',
  transport_quality: '运输质量',
  site_info: '场地信息',
  material_info: '物资信息',
  service_outlet: '服务网点'
}

const getSubCategoryName = (subKey: string) => {
  return subCategoryMap[subKey] || subKey
}

const businessCount = computed(() => {
  return metricStore.configs.filter(c => c.category === 'business').length
})

const basicCount = computed(() => {
  return metricStore.configs.filter(c => c.category === 'basic').length
})

const visibleCount = computed(() => {
  return metricStore.configs.filter(c => c.isVisible).length
})

const onMainCategoryChange = () => {
  filterSubCategory.value = ''
}

const filteredConfigs = computed(() => {
  return metricStore.configs
    .filter(c => {
      // 1. 主分类过滤
      if (filterMainCategory.value !== 'all' && c.category !== filterMainCategory.value) {
        return false
      }
      // 2. 子分类过滤
      if (filterSubCategory.value && c.subCategory !== filterSubCategory.value) {
        return false
      }
      // 3. 关键词搜索
      if (searchKeyword.value.trim()) {
        const kw = searchKeyword.value.trim().toLowerCase()
        return (
          c.metricKey.toLowerCase().includes(kw) ||
          c.displayName.toLowerCase().includes(kw)
        )
      }
      return true
    })
    .sort((a, b) => a.sortOrder - b.sortOrder)
})

const handleFieldChange = (row: MetricConfigItem, field: keyof MetricConfigItem) => {
  savingMap.value[row.id] = true
  metricStore.updateConfig(row.id, { [field]: row[field] })
  setTimeout(() => {
    savingMap.value[row.id] = false
    ElMessage.success(`指标「${row.displayName}」配置已同步至移动端`)
  }, 250)
}

const moveItem = (index: number, direction: -1 | 1) => {
  const currentList = [...filteredConfigs.value]
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
  ElMessageBox.confirm('确定要将所有指标配置重置为系统默认清单吗？', '提示', {
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

  .filter-card {
    background: #fff;
    padding: 14px 18px;
    border-radius: 8px;
    margin-bottom: 16px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
    display: flex;
    flex-direction: column;
    gap: 12px;

    .tab-group-main {
      display: flex;
      align-items: center;
      gap: 14px;
      flex-wrap: wrap;

      .sub-category-select {
        width: 170px;
      }
      .search-input {
        width: 260px;
        margin-left: auto;
      }
    }

    .stats-row {
      display: flex;
      gap: 12px;
      padding-top: 10px;
      border-top: 1px solid #f2f4f7;

      .stat-pill {
        background: #f8fafc;
        padding: 4px 12px;
        border-radius: 16px;
        font-size: 12px;
        border: 1px solid #e2e8f0;

        .label {
          color: #64748b;
        }
        .num {
          font-weight: 600;
          color: #0f172a;
          margin-left: 4px;
        }

        &.active {
          border-color: #00bebe;
          background: rgba(0, 190, 190, 0.08);
          .num {
            color: #00bebe;
          }
        }
      }
    }
  }

  .config-card {
    border-radius: 8px;
    border: none;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);

    .group-cell {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .sub-label {
        font-size: 11px;
        color: #64748b;
        font-weight: 500;
      }
    }

    .key-tag {
      font-family: 'Consolas', monospace;
      font-weight: 500;
      font-size: 12px;
    }

    .sort-controls {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2px;

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
