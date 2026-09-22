<template>
  <div class="dashboard-config-container">
    <div class="page-header">
      <div class="header-left">
        <h2 class="title">总部看板配置工具</h2>
        <p class="subtitle">
          配置全网看板指标项目、分类归属、展示顺序、目标值、温控评级标准及达标/环比动态字体颜色，修改后秒级同步至各端。
        </p>
      </div>
      <div class="header-right">
        <el-button @click="handleReset" :icon="Refresh">恢复默认配置</el-button>
        <el-button type="primary" :icon="Cellphone" @click="goToMobileDashboard">查看移动看板</el-button>
      </div>
    </div>

    <!-- 顶部主标签页：看板项目配置 vs 温控评级标准配置 -->
    <el-tabs v-model="activeToolTab" class="tool-main-tabs" type="border-card">
      <!-- Tab 1: 看板展示数据项目配置 (包含目标值、分类归属、字体颜色) -->
      <el-tab-pane label="📊 看板展示数据项目配置" name="metric_items">
        <div class="filter-bar">
          <div class="filter-left">
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

          <div class="stats-pills">
            <div class="stat-pill active">
              <span class="label">当前过滤项目：</span>
              <span class="num">{{ filteredConfigs.length }} 项</span>
            </div>
            <div class="stat-pill">
              <span class="label">移动端可见：</span>
              <span class="num">{{ visibleCount }} 项</span>
            </div>
          </div>
        </div>

        <!-- 数据表格 -->
        <el-table
          :data="filteredConfigs"
          row-key="id"
          stripe
          style="width: 100%"
          :header-cell-style="{ background: '#fafafa', color: 'rgba(0, 0, 0, 0.85)', fontWeight: '600' }"
        >
          <!-- 排序 -->
          <el-table-column label="展示顺序" width="90" align="center">
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

          <!-- 所属类别与归属分组 (需求②) -->
          <el-table-column label="展示类别 / 归属类别" width="170">
            <template #default="{ row }">
              <div class="group-cell">
                <el-tag size="small" :type="row.category === 'business' ? 'success' : 'primary'" effect="light">
                  {{ row.category === 'business' ? '业务数据' : '基础数据' }}
                </el-tag>
                <span class="sub-label">{{ getSubCategoryName(row.subCategory) }}</span>
              </div>
            </template>
          </el-table-column>

          <!-- 项目名称 (需求②) -->
          <el-table-column label="项目 (display_name)" min-width="160">
            <template #default="{ row }">
              <el-input
                v-model="row.displayName"
                size="small"
                placeholder="项目名称"
                @change="handleFieldChange(row, 'displayName')"
              />
            </template>
          </el-table-column>

          <!-- 字段Key -->
          <el-table-column label="指标键 (metric_key)" min-width="170">
            <template #default="{ row }">
              <el-tag type="info" class="key-tag" effect="plain">
                {{ row.metricKey }}
              </el-tag>
            </template>
          </el-table-column>

          <!-- 单位 -->
          <el-table-column label="单位" width="90">
            <template #default="{ row }">
              <el-input
                v-model="row.unit"
                size="small"
                placeholder="单位"
                @change="handleFieldChange(row, 'unit')"
              />
            </template>
          </el-table-column>

          <!-- 目标值配置 (需求③) -->
          <el-table-column label="目标值配置" width="130">
            <template #default="{ row }">
              <el-input-number
                v-model="row.targetValue"
                size="small"
                :controls="false"
                placeholder="未设定"
                style="width: 100%"
                @change="handleFieldChange(row, 'targetValue')"
              />
            </template>
          </el-table-column>

          <!-- 完成值字体颜色 (根据达标配置，需求④) -->
          <el-table-column label="完成值字体颜色 (达标/未达标)" width="160">
            <template #default="{ row }">
              <div class="color-config-cell">
                <div class="color-item" title="达成目标时的字体颜色">
                  <span class="c-tag green">达标:</span>
                  <el-color-picker
                    v-model="row.achievedColor"
                    size="small"
                    @change="handleFieldChange(row, 'achievedColor')"
                  />
                </div>
                <div class="color-item" title="未达成目标时的字体颜色">
                  <span class="c-tag red">未达:</span>
                  <el-color-picker
                    v-model="row.unachievedColor"
                    size="small"
                    @change="handleFieldChange(row, 'unachievedColor')"
                  />
                </div>
              </div>
            </template>
          </el-table-column>

          <!-- 环比字体颜色 (需求④) -->
          <el-table-column label="环比字体颜色 (上升/下降)" width="150">
            <template #default="{ row }">
              <div class="color-config-cell">
                <div class="color-item" title="环比上升字体颜色">
                  <span class="c-tag rise">↑升:</span>
                  <el-color-picker
                    v-model="row.dodRiseColor"
                    size="small"
                    @change="handleFieldChange(row, 'dodRiseColor')"
                  />
                </div>
                <div class="color-item" title="环比下降字体颜色">
                  <span class="c-tag fall">↓降:</span>
                  <el-color-picker
                    v-model="row.dodFallColor"
                    size="small"
                    @change="handleFieldChange(row, 'dodFallColor')"
                  />
                </div>
              </div>
            </template>
          </el-table-column>

          <!-- 是否可见 (需求②) -->
          <el-table-column label="端上可见" width="100" align="center">
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

          <!-- 更多编辑 -->
          <el-table-column label="操作" width="80" align="center">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="openEditDialog(row)">编辑</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- Tab 2: 温控评级标准配置 (需求①: 温度标准、评级标准、字体颜色、环比字体颜色) -->
      <el-tab-pane label="❄️ 温控评级标准配置" name="temp_rules">
        <div class="temp-rules-tip">
          <el-icon><InfoFilled /></el-icon>
          <span>配置不同温区（月台、冷藏库、冷冻库）的温控合规范围、评级条件、实时均温字体颜色以及环比温差字体颜色。配置后移动端场地信息将实时联动渲染。</span>
        </div>

        <div class="rules-cards-grid">
          <el-card
            v-for="rule in metricStore.tempRatingRules"
            :key="rule.id"
            class="temp-rule-card"
            shadow="hover"
          >
            <template #header>
              <div class="tr-card-header">
                <div class="tr-title">
                  <span class="name">{{ rule.zoneName }}</span>
                  <el-tag size="small" type="primary">{{ rule.code }}</el-tag>
                </div>
                <el-tag size="small" effect="dark" :style="{ backgroundColor: rule.normalTextColor }">
                  当前评级: {{ rule.currentRating }}
                </el-tag>
              </div>
            </template>

            <el-form label-position="top" size="small">
              <el-row :gutter="16">
                <!-- 温度标准范围 -->
                <el-col :span="12">
                  <el-form-item label="温度合规标准文本">
                    <el-input v-model="rule.standardRange" placeholder="如: 0℃ ~ 4℃" />
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="标准最低温 (℃)">
                    <el-input-number v-model="rule.minTemp" :precision="1" style="width: 100%" />
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="标准最高温 (℃)">
                    <el-input-number v-model="rule.maxTemp" :precision="1" style="width: 100%" />
                  </el-form-item>
                </el-col>
              </el-row>

              <!-- 评级标准 -->
              <el-form-item label="评级等级判定说明 (评级标准)">
                <el-input
                  v-model="rule.ratingCriteria"
                  type="textarea"
                  :rows="2"
                  placeholder="评级判定标准规则"
                />
              </el-form-item>

              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item label="当前设定评级">
                    <el-select v-model="rule.currentRating" style="width: 100%">
                      <el-option label="五星 A+ 级" value="五星 A+" />
                      <el-option label="卓越 A级" value="卓越 A级" />
                      <el-option label="良好 B级" value="良好 B级" />
                      <el-option label="预警 C级" value="预警 C级" />
                    </el-select>
                  </el-form-item>
                </el-col>

                <!-- 字体颜色 -->
                <el-col :span="6">
                  <el-form-item label="正常达标字体颜色">
                    <div class="color-picker-row">
                      <el-color-picker v-model="rule.normalTextColor" />
                      <span class="color-code">{{ rule.normalTextColor }}</span>
                    </div>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="超标告警字体颜色">
                    <div class="color-picker-row">
                      <el-color-picker v-model="rule.warningTextColor" />
                      <span class="color-code">{{ rule.warningTextColor }}</span>
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>

              <!-- 环比字体颜色 -->
              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item label="温升(恶化)环比字体颜色">
                    <div class="color-picker-row">
                      <el-color-picker v-model="rule.riseRateColor" />
                      <span class="color-code">{{ rule.riseRateColor }}</span>
                    </div>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="降温(良好)环比字体颜色">
                    <div class="color-picker-row">
                      <el-color-picker v-model="rule.fallRateColor" />
                      <span class="color-code">{{ rule.fallRateColor }}</span>
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>

              <div class="rule-card-footer">
                <el-button type="primary" size="small" @click="saveTempRule(rule)">保存此温区规则</el-button>
              </div>
            </el-form>
          </el-card>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 项目编辑对话框 (修改归属类别、展示类别、项目名称等) -->
    <el-dialog
      v-model="editDialogVisible"
      title="配置指标项目详情"
      width="560px"
      destroy-on-close
    >
      <el-form v-if="editingRow" :model="editingRow" label-width="120px" size="small">
        <el-form-item label="指标标识键:">
          <el-tag type="info">{{ editingRow.metricKey }}</el-tag>
        </el-form-item>
        <el-form-item label="项目显示名称:">
          <el-input v-model="editingRow.displayName" />
        </el-form-item>
        <el-form-item label="单位:">
          <el-input v-model="editingRow.unit" placeholder="如: 万件 / % / ℃" />
        </el-form-item>
        <el-form-item label="展示主类别:">
          <el-radio-group v-model="editingRow.category">
            <el-radio label="business">业务数据</el-radio>
            <el-radio label="basic">基础数据</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="归属子类别:">
          <el-select v-model="editingRow.subCategory" style="width: 100%">
            <el-option label="操作量" value="operation_volume" />
            <el-option label="操作质量" value="operation_quality" />
            <el-option label="运输质量" value="transport_quality" />
            <el-option label="场地信息" value="site_info" />
            <el-option label="物资信息" value="material_info" />
            <el-option label="服务网点" value="service_outlet" />
          </el-select>
        </el-form-item>
        <el-form-item label="目标值:">
          <el-input-number v-model="editingRow.targetValue" :precision="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="走向偏好:">
          <el-radio-group v-model="editingRow.trendType">
            <el-radio label="positive">正向 (增加为好)</el-radio>
            <el-radio label="negative">逆向 (减少为好)</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="端上可见性:">
          <el-switch v-model="editingRow.isVisible" active-text="可见" inactive-text="隐藏" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEditDialog">保存修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Top,
  Bottom,
  Refresh,
  Cellphone,
  InfoFilled
} from '@element-plus/icons-vue'
import {
  useMetricConfigStore,
  MetricConfigItem,
  TempRatingRule
} from '@/store/modules/metricConfig'

const router = useRouter()
const metricStore = useMetricConfigStore()

const activeToolTab = ref<'metric_items' | 'temp_rules'>('metric_items')
const filterMainCategory = ref<string>('all')
const filterSubCategory = ref<string>('')
const searchKeyword = ref<string>('')

// 对话框编辑状态
const editDialogVisible = ref(false)
const editingRow = ref<MetricConfigItem | null>(null)

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
      if (filterMainCategory.value !== 'all' && c.category !== filterMainCategory.value) {
        return false
      }
      if (filterSubCategory.value && c.subCategory !== filterSubCategory.value) {
        return false
      }
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
  metricStore.updateConfig(row.id, { [field]: row[field] })
  ElMessage.success({
    message: `已更新指标「${row.displayName}」配置`,
    duration: 1500
  })
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
  ElMessage.success('展示顺序已更新')
}

const openEditDialog = (row: MetricConfigItem) => {
  editingRow.value = JSON.parse(JSON.stringify(row))
  editDialogVisible.value = true
}

const saveEditDialog = () => {
  if (editingRow.value) {
    metricStore.updateConfig(editingRow.value.id, editingRow.value)
    editDialogVisible.value = false
    ElMessage.success('指标详细配置已保存并同步')
  }
}

const saveTempRule = (rule: TempRatingRule) => {
  metricStore.updateTempRatingRule(rule.id, rule)
  ElMessage.success(`「${rule.zoneName}」温控评级标准已保存生效`)
}

const handleReset = () => {
  ElMessageBox.confirm('确定要将所有看板指标与温控评级标准恢复为系统出厂默认值吗？', '系统提示', {
    confirmButtonText: '确定重置',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    metricStore.resetToDefault()
    ElMessage.success('已恢复为默认配置')
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

  .tool-main-tabs {
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
    border: none;
    background: #fff;

    :deep(.el-tabs__header) {
      background: #fafafa;
      border-bottom: 1px solid #e4e7ed;
      border-radius: 8px 8px 0 0;
    }

    :deep(.el-tabs__content) {
      padding: 18px 20px;
    }
  }

  // 筛选器样式
  .filter-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    flex-wrap: wrap;
    gap: 12px;

    .filter-left {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;

      .sub-category-select {
        width: 170px;
      }
      .search-input {
        width: 250px;
      }
    }

    .stats-pills {
      display: flex;
      gap: 10px;

      .stat-pill {
        background: #f8fafc;
        padding: 4px 12px;
        border-radius: 16px;
        font-size: 12px;
        border: 1px solid #e2e8f0;

        .label { color: #64748b; }
        .num { font-weight: 600; color: #0f172a; margin-left: 4px; }

        &.active {
          border-color: #00bebe;
          background: rgba(0, 190, 190, 0.08);
          .num { color: #00bebe; }
        }
      }
    }
  }

  .group-cell {
    display: flex;
    flex-direction: column;
    gap: 3px;

    .sub-label {
      font-size: 11px;
      color: #64748b;
      font-weight: 500;
    }
  }

  .key-tag {
    font-family: 'Consolas', monospace;
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

  .color-config-cell {
    display: flex;
    align-items: center;
    gap: 8px;

    .color-item {
      display: flex;
      align-items: center;
      gap: 4px;

      .c-tag {
        font-size: 11px;
        font-weight: 500;

        &.green { color: #16a34a; }
        &.red { color: #dc2626; }
        &.rise { color: #ef4444; }
        &.fall { color: #22c55e; }
      }
    }
  }

  // 温控评级标准 Tab 样式
  .temp-rules-tip {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 12px;
    color: #166534;
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 16px;
  }

  .rules-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
    gap: 16px;

    .temp-rule-card {
      border-radius: 10px;
      border: 1px solid #e2e8f0;

      .tr-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .tr-title {
          display: flex;
          align-items: center;
          gap: 8px;

          .name {
            font-size: 14px;
            font-weight: 700;
            color: #1e293b;
          }
        }
      }

      .color-picker-row {
        display: flex;
        align-items: center;
        gap: 8px;

        .color-code {
          font-family: 'Consolas', monospace;
          font-size: 11px;
          color: #64748b;
        }
      }

      .rule-card-footer {
        display: flex;
        justify-content: flex-end;
        padding-top: 10px;
        border-top: 1px solid #f1f5f9;
        margin-top: 8px;
      }
    }
  }
}
</style>
