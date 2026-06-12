<template>
  <div class="template-container">
    <div class="template-header">
      <div class="header-left">
        <el-button @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h2 class="page-title">模板中心</h2>
      </div>
      <div class="header-right">
        <el-input 
          v-model="searchQuery" 
          placeholder="搜索模板" 
          prefix-icon="Search" 
          class="search-input"
        />
      </div>
    </div>

    <div class="category-tabs">
      <el-tag 
        v-for="category in categories" 
        :key="category.id"
        :class="{ 'is-active': activeCategory === category.id }"
        @click="activeCategory = category.id"
      >
        {{ category.name }}
      </el-tag>
    </div>

    <div class="template-grid">
      <div 
        v-for="template in filteredTemplates" 
        :key="template.id"
        class="template-card"
        @click="selectTemplate(template)"
      >
        <div class="template-icon" :style="{ background: template.color }">
          <el-icon>{{ getTemplateIcon(template.icon) }}</el-icon>
        </div>
        <div class="template-info">
          <div class="template-name">{{ template.name }}</div>
          <div class="template-desc">{{ template.description }}</div>
          <div class="template-meta">
            <span class="meta-tag">{{ template.industry }}</span>
            <span class="meta-count">使用{{ template.usageCount }}次</span>
          </div>
        </div>
        <div class="template-action">
          <el-button size="small" type="primary">立即使用</el-button>
        </div>
      </div>
    </div>

    <div v-if="filteredTemplates.length === 0" class="empty-state">
      <el-empty description="暂无匹配的模板" image-size="120" />
    </div>

    <el-drawer 
      title="模板详情" 
      v-model="showDetail" 
      direction="rtl"
      size="500px"
    >
      <div v-if="selectedTemplate" class="template-detail">
        <div class="detail-header">
          <div class="detail-icon" :style="{ background: selectedTemplate.color }">
            <el-icon>{{ getTemplateIcon(selectedTemplate.icon) }}</el-icon>
          </div>
          <div class="detail-info">
            <h3 class="detail-name">{{ selectedTemplate.name }}</h3>
            <p class="detail-desc">{{ selectedTemplate.description }}</p>
          </div>
        </div>

        <div class="detail-section">
          <h4 class="section-title">适用场景</h4>
          <p class="section-content">{{ selectedTemplate.scenario }}</p>
        </div>

        <div class="detail-section">
          <h4 class="section-title">规则逻辑</h4>
          <div class="rule-steps">
            <div 
              v-for="(step, index) in selectedTemplate.steps" 
              :key="index"
              class="rule-step"
            >
              <span class="step-number">{{ index + 1 }}</span>
              <span class="step-text">{{ step }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4 class="section-title">可配置参数</h4>
          <div class="params-list">
            <div 
              v-for="(param, index) in selectedTemplate.params" 
              :key="index"
              class="param-row"
            >
              <label>{{ param.label }}</label>
              <el-input 
                v-model="param.value" 
                :placeholder="param.placeholder" 
                size="small"
                class="param-input"
              />
            </div>
          </div>
        </div>

        <div class="detail-actions">
          <el-button @click="showDetail = false">取消</el-button>
          <el-button type="primary" @click="applyTemplate">应用模板</el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ArrowLeft, Search, Box, Clock, Bell,
  ArrowUp, Document
} from '@element-plus/icons-vue'

const router = useRouter()
const searchQuery = ref('')
const activeCategory = ref('all')
const showDetail = ref(false)
const selectedTemplate = ref(null)

const categories = ref([
  { id: 'all', name: '全部' },
  { id: 'logistics', name: '物流运输' },
  { id: 'warehouse', name: '仓储管理' },
  { id: 'finance', name: '金融风控' },
  { id: 'it', name: 'IT运维' }
])

const templates = ref([
  {
    id: 1,
    name: '爆仓预警模板',
    description: '当仓库库存超过容量阈值时触发预警',
    industry: '仓储管理',
    icon: 'Package',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    usageCount: 156,
    category: 'warehouse',
    scenario: '适用于仓库库存管理场景，当库存接近或超过仓库容量上限时及时预警',
    steps: ['监控仓库库存数量', '当库存超过设定容量的90%时', '触发预警通知'],
    params: [
      { label: '仓库名称', value: '', placeholder: '选择监控的仓库' },
      { label: '容量阈值', value: '90', placeholder: '输入百分比阈值' },
      { label: '通知对象', value: '', placeholder: '选择接收预警的人员' }
    ]
  },
  {
    id: 2,
    name: '生鲜车GPS超时预警',
    description: '当运输车辆长时间没有GPS更新时触发预警',
    industry: '物流运输',
    icon: 'Box',
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    usageCount: 89,
    category: 'logistics',
    scenario: '适用于生鲜冷链运输场景，实时监控车辆位置',
    steps: ['监控车辆GPS信号', '当连续超过设定时间无更新时', '发送预警通知'],
    params: [
      { label: '运输路线', value: '', placeholder: '如：上海到杭州' },
      { label: '超时时间', value: '2', placeholder: '输入小时数' },
      { label: '通知对象', value: '', placeholder: '选择调度主管' }
    ]
  },
  {
    id: 3,
    name: '大促缺货预警',
    description: '大促期间库存低于安全库存时触发预警',
    industry: '电商业务',
    icon: 'Box',
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    usageCount: 234,
    category: 'warehouse',
    scenario: '适用于电商大促活动期间，及时发现库存不足问题',
    steps: ['监控商品库存', '当库存低于安全库存的30%时', '触发补货预警'],
    params: [
      { label: '商品品类', value: '', placeholder: '选择监控的商品' },
      { label: '安全库存比例', value: '30', placeholder: '输入百分比' },
      { label: '通知对象', value: '', placeholder: '选择采购负责人' }
    ]
  },
  {
    id: 4,
    name: '温度异常预警',
    description: '当冷藏车厢温度超过设定阈值时触发预警',
    industry: '冷链物流',
    icon: 'Clock',
    color: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    usageCount: 67,
    category: 'logistics',
    scenario: '适用于冷链运输场景，确保冷藏货物保持适宜温度',
    steps: ['监控车厢温度', '当温度超过设定范围时', '立即通知相关人员'],
    params: [
      { label: '温度上限', value: '8', placeholder: '输入最高温度(℃)' },
      { label: '温度下限', value: '2', placeholder: '输入最低温度(℃)' },
      { label: '通知对象', value: '', placeholder: '选择冷链负责人' }
    ]
  },
  {
    id: 5,
    name: '订单延误预警',
    description: '当订单运输时间超过预计时间时触发预警',
    industry: '物流运输',
    icon: 'Clock',
    color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    usageCount: 145,
    category: 'logistics',
    scenario: '适用于订单配送监控，及时发现延误订单',
    steps: ['监控订单配送进度', '当运输时间超过预计时间的150%时', '触发延误预警'],
    params: [
      { label: '超时比例', value: '150', placeholder: '输入百分比' },
      { label: '通知对象', value: '', placeholder: '选择配送负责人' }
    ]
  },
  {
    id: 6,
    name: '系统宕机预警',
    description: '当IT系统服务不可用时触发预警',
    industry: 'IT运维',
    icon: 'Bell',
    color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    usageCount: 34,
    category: 'it',
    scenario: '适用于IT系统监控，确保核心业务系统稳定运行',
    steps: ['监控系统健康状态', '当服务响应超时或不可用时', '立即通知运维人员'],
    params: [
      { label: '监控服务', value: '', placeholder: '选择监控的服务' },
      { label: '超时时间', value: '30', placeholder: '输入秒数' },
      { label: '通知对象', value: '', placeholder: '选择运维工程师' }
    ]
  },
  {
    id: 7,
    name: '资金异常预警',
    description: '当账户资金出现异常变动时触发预警',
    industry: '金融风控',
    icon: 'Document',
    color: 'linear-gradient(135deg, #434343 0%, #000000 100%)',
    usageCount: 78,
    category: 'finance',
    scenario: '适用于财务资金监控，及时发现异常交易',
    steps: ['监控账户资金变动', '当单笔交易超过设定阈值时', '触发风控预警'],
    params: [
      { label: '预警阈值', value: '10000', placeholder: '输入金额(元)' },
      { label: '通知对象', value: '', placeholder: '选择财务负责人' }
    ]
  },
  {
    id: 8,
    name: '业务量骤降预警',
    description: '当业务量环比下降超过设定比例时触发预警',
    industry: '综合',
    icon: 'TrendingUp',
    color: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    usageCount: 56,
    category: 'logistics',
    scenario: '适用于业务运营监控，及时发现业务异常波动',
    steps: ['统计业务数据', '当环比下降超过设定比例时', '触发预警通知'],
    params: [
      { label: '下降比例', value: '30', placeholder: '输入百分比' },
      { label: '时间周期', value: '24', placeholder: '输入小时数' },
      { label: '通知对象', value: '', placeholder: '选择运营负责人' }
    ]
  }
])

const filteredTemplates = computed(() => {
  let result = templates.value
  if (activeCategory.value !== 'all') {
    result = result.filter(t => t.category === activeCategory.value)
  }
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(t => 
      t.name.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query)
    )
  }
  return result
})

const getTemplateIcon = (iconName) => {
  const icons = { Box, Clock, Bell, ArrowUp, Document }
  return icons[iconName] || Box
}

const selectTemplate = (template) => {
  selectedTemplate.value = JSON.parse(JSON.stringify(template))
  showDetail.value = true
}

const applyTemplate = () => {
  showDetail.value = false
  router.push('/rule-config/builder')
}

const goBack = () => {
  router.push('/rule-config')
}
</script>

<style lang="scss" scoped>
.template-container {
  padding: 20px;
  background: #f0f2f5;
  min-height: calc(100vh - 84px);
}

.template-header {
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

  .search-input {
    width: 280px;
  }
}

.category-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;

  :deep(.el-tag) {
    padding: 8px 20px;
    font-size: 14px;
    cursor: pointer;
    background: white;
    border: 1px solid #ebeef5;

    &.is-active {
      background: #00b8c4;
      color: white;
      border-color: #00b8c4;
    }
  }
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.template-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .template-icon {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;
  }

  .template-info {
    flex: 1;

    .template-name {
      font-size: 15px;
      font-weight: 500;
      color: #333;
      margin-bottom: 4px;
    }

    .template-desc {
      font-size: 13px;
      color: #666;
      margin-bottom: 8px;
    }

    .template-meta {
      display: flex;
      gap: 12px;

      .meta-tag {
        font-size: 12px;
        color: #00b8c4;
        background: #f0f9fa;
        padding: 2px 8px;
        border-radius: 4px;
      }

      .meta-count {
        font-size: 12px;
        color: #999;
      }
    }
  }
}

.empty-state {
  padding: 60px;
  text-align: center;
}

.template-detail {
  padding: 8px;

  .detail-header {
    display: flex;
    gap: 16px;
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid #ebeef5;

    .detail-icon {
      width: 64px;
      height: 64px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 28px;
    }

    .detail-info {
      .detail-name {
        font-size: 18px;
        font-weight: 500;
        color: #333;
        margin-bottom: 8px;
      }
    }
  }

  .detail-section {
    margin-bottom: 20px;

    .section-title {
      font-size: 14px;
      font-weight: 500;
      color: #333;
      margin-bottom: 12px;
    }
  }

  .rule-steps {
    .rule-step {
      display: flex;
      gap: 12px;
      padding: 10px 0;
      border-bottom: 1px dashed #ebeef5;

      .step-number {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: #00b8c4;
        color: white;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }

  .params-list {
    .param-row {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 12px;

      label {
        width: 100px;
        font-size: 13px;
        color: #666;
      }

      .param-input {
        flex: 1;
      }
    }
  }

  .detail-actions {
    display: flex;
    gap: 12px;
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid #ebeef5;
  }
}
</style>