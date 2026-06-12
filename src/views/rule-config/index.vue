<template>
  <div class="rule-config-container">
    <!-- 顶部导航栏 -->
    <div class="page-header">
      <div class="header-left">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item>首页</el-breadcrumb-item>
          <el-breadcrumb-item>规则配置中心</el-breadcrumb-item>
        </el-breadcrumb>
        <h1 class="page-title">规则配置中心</h1>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="showHelp = true">
          <el-icon><Help /></el-icon>
          帮助中心
        </el-button>
      </div>
    </div>

    <!-- 快捷入口区 -->
    <div class="quick-actions">
      <div class="action-card" @click="navigateTo('template')">
        <div class="action-icon yellow">
          <el-icon><Grid /></el-icon>
        </div>
        <div class="action-content">
          <div class="action-title">从模板新建</div>
          <div class="action-desc">使用行业标准模板快速配置</div>
        </div>
      </div>
      <div class="action-card" @click="navigateTo('ai')">
        <div class="action-icon blue">
          <el-icon><Message /></el-icon>
        </div>
        <div class="action-content">
          <div class="action-title">智能问答创建</div>
          <div class="action-desc">用日常语言描述需求</div>
        </div>
      </div>
      <div class="action-card" @click="navigateTo('builder')">
        <div class="action-icon gray">
          <el-icon><Box /></el-icon>
        </div>
        <div class="action-content">
          <div class="action-title">空白规则搭建</div>
          <div class="action-desc">从零开始配置规则</div>
        </div>
      </div>
    </div>

    <!-- 数据概览区 -->
    <div class="stats-row">
      <el-card class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          <el-icon><Document /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.totalRules }}</div>
          <div class="stat-label">规则总数</div>
        </div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);">
          <el-icon><CircleCheck /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.runningRules }}</div>
          <div class="stat-label">运行中</div>
        </div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
          <el-icon><VideoPause /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.pausedRules }}</div>
          <div class="stat-label">已暂停</div>
        </div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
          <el-icon><Bell /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.todayAlerts }}</div>
          <div class="stat-label">今日预警</div>
        </div>
      </el-card>
    </div>

    <!-- 规则列表区 -->
    <div class="rules-section">
      <div class="section-header">
        <h2 class="section-title">我的规则</h2>
        <div class="section-actions">
          <el-input 
            v-model="searchQuery" 
            placeholder="搜索规则名称" 
            prefix-icon="Search" 
            size="small"
            class="search-input"
          />
          <el-select v-model="statusFilter" placeholder="全部状态" size="small" class="status-filter">
            <el-option label="全部" value="" />
            <el-option label="运行中" value="running" />
            <el-option label="已暂停" value="paused" />
            <el-option label="待审核" value="pending" />
          </el-select>
        </div>
      </div>
      
      <div class="rules-list">
        <div 
          v-for="rule in filteredRules" 
          :key="rule.id" 
          class="rule-card"
          @click="viewRule(rule)"
        >
          <div class="rule-header">
            <div class="rule-name">{{ rule.name }}</div>
            <el-tag :type="getStatusTagType(rule.status)" size="small">
              {{ getStatusText(rule.status) }}
            </el-tag>
          </div>
          <div class="rule-meta">
            <span class="meta-item">
              <el-icon class="meta-icon"><Briefcase /></el-icon>
              {{ rule.businessLine }}
            </span>
            <span class="meta-item">
              <el-icon class="meta-icon"><Clock /></el-icon>
              {{ rule.lastTrigger }}
            </span>
          </div>
          <div class="rule-desc">{{ rule.description }}</div>
          <div class="rule-actions">
            <el-button size="small" @click.stop="editRule(rule)">编辑</el-button>
            <el-button 
              size="small" 
              :type="rule.status === 'running' ? 'warning' : 'success'"
              @click.stop="toggleRule(rule)"
            >
              {{ rule.status === 'running' ? '暂停' : '启动' }}
            </el-button>
            <el-button size="small" type="danger" @click.stop="deleteRule(rule)">删除</el-button>
          </div>
        </div>
      </div>

      <div v-if="filteredRules.length === 0" class="empty-state">
        <el-empty description="暂无规则，点击上方按钮创建" image-size="120" />
      </div>
    </div>

    <!-- 帮助弹窗 -->
    <el-dialog title="帮助中心" v-model="showHelp" width="600px">
      <div class="help-content">
        <h3>规则配置中心使用指南</h3>
        <p>欢迎使用通用预警中台的规则配置中心。您可以通过以下三种方式创建预警规则：</p>
        <ul>
          <li><strong>从模板新建</strong>：选择行业标准模板，只需修改几个参数即可快速上线</li>
          <li><strong>智能问答创建</strong>：用日常语言描述您的预警需求，AI会帮您生成规则</li>
          <li><strong>空白规则搭建</strong>：使用积木化拖拽界面，自由组合条件和动作</li>
        </ul>
        <p>创建完成后，建议先在沙箱环境测试，确认无误后再发布上线。</p>
      </div>
    </el-dialog>

    <!-- 子页面路由视图 -->
    <router-view v-if="currentSubPage" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Help, Document, Bell, Briefcase, Clock, Grid, Message, Box, CircleCheck, VideoPause } from '@element-plus/icons-vue'

const router = useRouter()
const searchQuery = ref('')
const statusFilter = ref('')
const showHelp = ref(false)
const currentSubPage = ref(false)

const stats = ref({
  totalRules: 24,
  runningRules: 18,
  pausedRules: 4,
  todayAlerts: 156
})

const rules = ref([
  {
    id: 1,
    name: '上海到杭州生鲜车GPS超时预警',
    businessLine: '华东物流',
    status: 'running',
    lastTrigger: '10分钟前',
    description: '当上海到杭州的生鲜运输车辆连续两小时没有GPS更新时触发预警'
  },
  {
    id: 2,
    name: '仓库爆仓预警',
    businessLine: '华南仓储',
    status: 'running',
    lastTrigger: '30分钟前',
    description: '当仓库库存超过容量的90%时触发预警'
  },
  {
    id: 3,
    name: '订单延误预警',
    businessLine: '华东物流',
    status: 'paused',
    lastTrigger: '2小时前',
    description: '当订单运输时间超过预计时间的150%时触发预警'
  },
  {
    id: 4,
    name: '大促缺货预警',
    businessLine: '电商业务',
    status: 'running',
    lastTrigger: '1小时前',
    description: '大促期间库存低于安全库存的30%时触发预警'
  },
  {
    id: 5,
    name: '温度异常预警',
    businessLine: '冷链物流',
    status: 'pending',
    lastTrigger: '从未',
    description: '当冷藏车厢温度超过设定阈值时触发预警'
  }
])

const filteredRules = computed(() => {
  return rules.value.filter(rule => {
    const matchSearch = !searchQuery.value || 
      rule.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      rule.businessLine.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchStatus = !statusFilter.value || rule.status === statusFilter.value
    return matchSearch && matchStatus
  })
})

const getStatusTagType = (status) => {
  const types = {
    running: 'success',
    paused: 'warning',
    pending: 'info'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    running: '运行中',
    paused: '已暂停',
    pending: '待审核'
  }
  return texts[status] || status
}

const navigateTo = (page) => {
  router.push(`/rule-config/${page}`)
}

const viewRule = (rule) => {
  router.push(`/rule-config/builder?id=${rule.id}`)
}

const editRule = (rule) => {
  router.push(`/rule-config/builder?id=${rule.id}`)
}

const toggleRule = (rule) => {
  rule.status = rule.status === 'running' ? 'paused' : 'running'
  stats.value.runningRules += rule.status === 'running' ? 1 : -1
  stats.value.pausedRules += rule.status === 'paused' ? 1 : -1
}

const deleteRule = (rule) => {
  const index = rules.value.findIndex(r => r.id === rule.id)
  if (index > -1) {
    rules.value.splice(index, 1)
    stats.value.totalRules--
    if (rule.status === 'running') stats.value.runningRules--
    else stats.value.pausedRules--
  }
}
</script>

<style lang="scss" scoped>
.rule-config-container {
  padding: 20px;
  background: #f0f2f5;
  min-height: calc(100vh - 84px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;

  .header-left {
    .page-title {
      font-size: 20px;
      font-weight: 600;
      color: #333;
      margin-top: 8px;
    }
  }
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;

  .action-card {
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

    .action-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: white;

      &.yellow {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }

      &.blue {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      }

      &.gray {
        background: linear-gradient(135deg, #434343 0%, #000000 100%);
      }
    }

    .action-content {
      .action-title {
        font-size: 16px;
        font-weight: 500;
        color: #333;
        margin-bottom: 4px;
      }

      .action-desc {
        font-size: 13px;
        color: #666;
      }
    }
  }
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;

  .stat-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 20px;
    }

    .stat-info {
      .stat-value {
        font-size: 28px;
        font-weight: 600;
        color: #333;
      }

      .stat-label {
        font-size: 13px;
        color: #666;
      }
    }
  }
}

.rules-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .section-title {
      font-size: 16px;
      font-weight: 500;
      color: #333;
    }

    .section-actions {
      display: flex;
      gap: 12px;

      .search-input {
        width: 200px;
      }

      .status-filter {
        width: 120px;
      }
    }
  }

  .rules-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .rule-card {
    border: 1px solid #ebeef5;
    border-radius: 8px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      border-color: #00b8c4;
      box-shadow: 0 2px 8px rgba(0, 184, 196, 0.15);
    }

    .rule-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;

      .rule-name {
        font-size: 15px;
        font-weight: 500;
        color: #333;
      }
    }

    .rule-meta {
      display: flex;
      gap: 16px;
      margin-bottom: 8px;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: #999;

        .meta-icon {
          font-size: 12px;
        }
      }
    }

    .rule-desc {
      font-size: 13px;
      color: #666;
      margin-bottom: 12px;
      line-height: 1.5;
    }

    .rule-actions {
      display: flex;
      gap: 8px;
    }
  }

  .empty-state {
    padding: 40px;
    text-align: center;
  }
}

.help-content {
  h3 {
    font-size: 16px;
    font-weight: 500;
    color: #333;
    margin-bottom: 12px;
  }

  p {
    font-size: 14px;
    color: #666;
    line-height: 1.6;
    margin-bottom: 12px;
  }

  ul {
    padding-left: 20px;
    margin-bottom: 12px;

    li {
      font-size: 14px;
      color: #666;
      line-height: 1.8;
    }
  }
}
</style>