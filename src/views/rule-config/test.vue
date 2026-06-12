<template>
  <div class="test-container">
    <!-- 顶部导航 -->
    <div class="test-header">
      <div class="header-left">
        <el-button @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h2 class="page-title">模拟测试沙箱</h2>
      </div>
      <div class="header-right">
        <el-select v-model="testMode" placeholder="测试模式" class="mode-select">
          <el-option label="历史数据回放" value="history" />
          <el-option label="模拟数据输入" value="simulate" />
        </el-select>
      </div>
    </div>

    <div class="test-content">
      <!-- 左侧数据输入区 -->
      <div class="data-input-section">
        <div class="section-header">
          <h3 class="section-title">测试数据</h3>
          <el-button size="small" @click="importHistoryData">导入历史数据</el-button>
        </div>

        <div class="data-table">
          <el-table :data="testData" border>
            <el-table-column prop="field" label="数据项" />
            <el-table-column prop="value" label="测试值">
              <template #default="scope">
                <el-input 
                  v-model="scope.row.value" 
                  size="small"
                  @blur="updateRiskLevel"
                />
              </template>
            </el-table-column>
            <el-table-column prop="unit" label="单位" />
            <el-table-column prop="action">
              <template #default>
                <el-button size="mini" @click="addRow">+</el-button>
                <el-button size="mini" type="danger" @click="removeRow">-</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="time-range">
          <span class="range-label">测试时间范围</span>
          <el-date-picker 
            v-model="timeRange" 
            type="daterange" 
            range-separator="至" 
            start-placeholder="开始时间" 
            end-placeholder="结束时间"
            size="small"
          />
        </div>
      </div>

      <!-- 中间测试结果区 -->
      <div class="result-section">
        <div class="section-header">
          <h3 class="section-title">测试结果</h3>
          <div class="result-tabs">
            <el-tag 
              :class="{ 'is-active': resultTab === 'timeline' }"
              @click="resultTab = 'timeline'"
            >
              触发时间轴
            </el-tag>
            <el-tag 
              :class="{ 'is-active': resultTab === 'list' }"
              @click="resultTab = 'list'"
            >
              触发详情
            </el-tag>
          </div>
        </div>

        <div v-if="resultTab === 'timeline'" class="timeline-container">
          <el-timeline>
            <el-timeline-item 
              v-for="(event, index) in triggerEvents" 
              :key="index"
              :timestamp="event.time"
            >
              <el-card>
                <div class="event-header">
                  <span class="event-rule">{{ event.ruleName }}</span>
                  <el-tag :type="event.level === 'high' ? 'danger' : event.level === 'medium' ? 'warning' : 'success'">
                    {{ event.level === 'high' ? '高' : event.level === 'medium' ? '中' : '低' }}
                  </el-tag>
                </div>
                <p class="event-desc">{{ event.description }}</p>
                <div class="event-target">预计通知：{{ event.target }}</div>
              </el-card>
            </el-timeline-item>
          </el-timeline>

          <div v-if="triggerEvents.length === 0" class="empty-result">
            <el-empty description="暂无触发记录" image-size="80" />
          </div>
        </div>

        <div v-else class="list-container">
          <el-table :data="triggerEvents" border>
            <el-table-column prop="ruleName" label="规则名称" />
            <el-table-column prop="condition" label="触发条件" />
            <el-table-column prop="time" label="触发时间" />
            <el-table-column prop="target" label="通知对象" />
            <el-table-column prop="level" label="告警级别">
              <template #default="scope">
                <el-tag :type="scope.row.level === 'high' ? 'danger' : scope.row.level === 'medium' ? 'warning' : 'success'">
                  {{ scope.row.level === 'high' ? '高' : scope.row.level === 'medium' ? '中' : '低' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="frequency-chart">
          <h4>告警频率统计</h4>
          <div class="chart-bars">
            <div v-for="(item, index) in frequencyData" :key="index" class="bar-item">
              <div class="bar-label">{{ item.label }}</div>
              <div class="bar-container">
                <div 
                  class="bar-fill" 
                  :style="{ width: item.percentage + '%' }"
                  :class="getBarClass(item.percentage)"
                ></div>
              </div>
              <div class="bar-value">{{ item.count }}次</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧风险评估面板 -->
      <div class="risk-section">
        <div class="section-header">
          <h3 class="section-title">风险评估</h3>
        </div>

        <div class="risk-card" :class="riskLevelClass">
          <div class="risk-icon">
            <el-icon>{{ riskIcon }}</el-icon>
          </div>
          <div class="risk-info">
            <div class="risk-level">{{ riskLevelText }}</div>
            <div class="risk-desc">{{ riskDescription }}</div>
          </div>
        </div>

        <div class="analysis-section">
          <h4>漏报可能性分析</h4>
          <div class="analysis-item">
            <span class="analysis-label">阈值设置</span>
            <span class="analysis-value good">合理</span>
          </div>
          <div class="analysis-item">
            <span class="analysis-label">时间窗口</span>
            <span class="analysis-value good">合理</span>
          </div>
          <div class="analysis-item">
            <span class="analysis-label">条件组合</span>
            <span class="analysis-value warning">需关注</span>
          </div>
        </div>

        <div class="suggestions-section">
          <h4>优化建议</h4>
          <ul class="suggestions-list">
            <li v-for="(suggestion, index) in suggestions" :key="index">
              <el-icon class="suggestion-icon"><Setting /></el-icon>
              {{ suggestion }}
            </li>
          </ul>
        </div>

        <div class="test-actions">
          <el-button @click="runTest">运行测试</el-button>
          <el-button type="primary" @click="confirmAndPublish">确认并发布</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ArrowLeft, Bell, Close, Check,
  Setting
} from '@element-plus/icons-vue'

const router = useRouter()
const testMode = ref('simulate')
const resultTab = ref('timeline')
const timeRange = ref([])

const testData = ref([
  { field: '订单量', value: '1500', unit: '单', id: 1 },
  { field: '库存数量', value: '850', unit: '件', id: 2 },
  { field: '运输时长', value: '4.5', unit: '小时', id: 3 },
  { field: '温度值', value: '6', unit: '℃', id: 4 }
])

const triggerEvents = ref([
  {
    ruleName: '库存预警规则',
    condition: '库存数量 > 800',
    time: '10:30',
    target: '仓储经理',
    level: 'medium',
    description: '库存数量已超过预警阈值'
  },
  {
    ruleName: '运输超时预警',
    condition: '运输时长 > 4小时',
    time: '10:45',
    target: '调度主管',
    level: 'high',
    description: '运输时间超过预计时间的150%'
  }
])

const frequencyData = ref([
  { label: '0-1小时', count: 5, percentage: 25 },
  { label: '1-2小时', count: 8, percentage: 40 },
  { label: '2-4小时', count: 4, percentage: 20 },
  { label: '4小时以上', count: 3, percentage: 15 }
])

const riskLevel = ref('medium')

const riskLevelClass = computed(() => {
  const classes = {
    high: 'risk-high',
    medium: 'risk-medium',
    low: 'risk-low'
  }
  return classes[riskLevel.value]
})

const riskIcon = computed(() => {
  const icons = {
    high: Bell,
    medium: Close,
    low: Check
  }
  return icons[riskLevel.value]
})

const riskLevelText = computed(() => {
  const texts = {
    high: '高风险',
    medium: '中风险',
    low: '低风险'
  }
  return texts[riskLevel.value]
})

const riskDescription = computed(() => {
  const descriptions = {
    high: '当前规则配置可能产生告警风暴，请调整阈值',
    medium: '规则配置基本合理，建议进行微调',
    low: '规则配置安全，可以放心发布'
  }
  return descriptions[riskLevel.value]
})

const suggestions = ref([
  '建议将运输时长阈值调整为5小时，减少误报',
  '考虑添加静默期设置，避免重复告警',
  '建议设置多级通知策略，分级处理告警'
])

const getBarClass = (percentage) => {
  if (percentage >= 30) return 'bar-danger'
  if (percentage >= 20) return 'bar-warning'
  return 'bar-success'
}

const updateRiskLevel = () => {
  const highValues = testData.value.filter(d => {
    const num = parseFloat(d.value)
    if (d.field === '订单量') return num > 2000
    if (d.field === '库存数量') return num > 900
    if (d.field === '运输时长') return num > 6
    if (d.field === '温度值') return num > 10
    return false
  })
  
  if (highValues.length >= 2) {
    riskLevel.value = 'high'
  } else if (highValues.length === 1) {
    riskLevel.value = 'medium'
  } else {
    riskLevel.value = 'low'
  }
}

const addRow = () => {
  testData.value.push({
    field: '',
    value: '',
    unit: '',
    id: Date.now()
  })
}

const removeRow = () => {
  if (testData.value.length > 1) {
    testData.value.pop()
  }
}

const importHistoryData = () => {
  alert('正在导入历史数据...')
}

const runTest = () => {
  alert('测试运行中...')
  updateRiskLevel()
}

const confirmAndPublish = () => {
  alert('规则已确认并发布')
  router.push('/rule-config')
}

const goBack = () => {
  router.push('/rule-config/builder')
}
</script>

<style lang="scss" scoped>
.test-container {
  padding: 20px;
  background: #f0f2f5;
  min-height: calc(100vh - 84px);
}

.test-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;

    .page-title {
      font-size: 18px;
      font-weight: 500;
      color: #333;
    }
  }

  .mode-select {
    width: 160px;
  }
}

.test-content {
  display: flex;
  gap: 20px;

  .data-input-section {
    width: 300px;
    background: white;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      .section-title {
        font-size: 14px;
        font-weight: 500;
        color: #333;
      }
    }

    .data-table {
      margin-bottom: 16px;
    }

    .time-range {
      display: flex;
      align-items: center;
      gap: 12px;

      .range-label {
        font-size: 13px;
        color: #666;
      }
    }
  }

  .result-section {
    flex: 1;
    background: white;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    overflow-y: auto;

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      .section-title {
        font-size: 14px;
        font-weight: 500;
        color: #333;
      }

      .result-tabs {
        display: flex;
        gap: 8px;

        :deep(.el-tag) {
          cursor: pointer;
          padding: 4px 12px;
          font-size: 12px;

          &.is-active {
            background: #00b8c4;
            color: white;
          }
        }
      }
    }

    .timeline-container {
      .event-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;

        .event-rule {
          font-weight: 500;
          color: #333;
        }
      }

      .event-desc {
        font-size: 13px;
        color: #666;
        margin-bottom: 8px;
      }

      .event-target {
        font-size: 12px;
        color: #999;
      }
    }

    .empty-result {
      padding: 40px;
      text-align: center;
    }

    .frequency-chart {
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid #ebeef5;

      h4 {
        font-size: 13px;
        font-weight: 500;
        color: #666;
        margin-bottom: 12px;
      }

      .chart-bars {
        .bar-item {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;

          .bar-label {
            width: 80px;
            font-size: 12px;
            color: #666;
          }

          .bar-container {
            flex: 1;
            height: 12px;
            background: #f0f2f5;
            border-radius: 6px;
            overflow: hidden;

            .bar-fill {
              height: 100%;
              border-radius: 6px;
              transition: width 0.3s;

              &.bar-danger {
                background: #f56c6c;
              }

              &.bar-warning {
                background: #e6a23c;
              }

              &.bar-success {
                background: #67c23a;
              }
            }
          }

          .bar-value {
            width: 50px;
            font-size: 12px;
            color: #666;
            text-align: right;
          }
        }
      }
    }
  }

  .risk-section {
    width: 280px;
    background: white;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    .section-header {
      margin-bottom: 16px;

      .section-title {
        font-size: 14px;
        font-weight: 500;
        color: #333;
      }
    }

    .risk-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 16px;

      &.risk-high {
        background: #fef0f0;
        border: 1px solid #fbc4c4;

        .risk-icon {
          color: #f56c6c;
        }

        .risk-level {
          color: #f56c6c;
        }
      }

      &.risk-medium {
        background: #fdf6ec;
        border: 1px solid #fde6c4;

        .risk-icon {
          color: #e6a23c;
        }

        .risk-level {
          color: #e6a23c;
        }
      }

      &.risk-low {
        background: #f0f9eb;
        border: 1px solid #d9f7be;

        .risk-icon {
          color: #67c23a;
        }

        .risk-level {
          color: #67c23a;
        }
      }

      .risk-icon {
        font-size: 28px;
      }

      .risk-info {
        flex: 1;

        .risk-level {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .risk-desc {
          font-size: 12px;
          color: #666;
        }
      }
    }

    .analysis-section {
      margin-bottom: 16px;

      h4 {
        font-size: 13px;
        font-weight: 500;
        color: #666;
        margin-bottom: 12px;
      }

      .analysis-item {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px dashed #ebeef5;

        .analysis-label {
          font-size: 13px;
          color: #666;
        }

        .analysis-value {
          font-size: 13px;
          font-weight: 500;

          &.good {
            color: #67c23a;
          }

          &.warning {
            color: #e6a23c;
          }

          &.danger {
            color: #f56c6c;
          }
        }
      }
    }

    .suggestions-section {
      margin-bottom: 20px;

      h4 {
        font-size: 13px;
        font-weight: 500;
        color: #666;
        margin-bottom: 12px;
      }

      .suggestions-list {
        padding: 0;
        margin: 0;
        list-style: none;

        li {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 12px;
          color: #666;
          margin-bottom: 8px;
          line-height: 1.5;

          .suggestion-icon {
            color: #e6a23c;
            font-size: 12px;
            flex-shrink: 0;
            margin-top: 2px;
          }
        }
      }
    }

    .test-actions {
      display: flex;
      gap: 8px;

      button {
        flex: 1;
      }
    }
  }
}
</style>