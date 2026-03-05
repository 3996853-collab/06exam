<template>
  <div class="app-container">
    <!-- Header with breadcrumb -->
    <div class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item><a href="#">首页</a></el-breadcrumb-item>
        <el-breadcrumb-item><a href="#">服务质量</a></el-breadcrumb-item>
        <el-breadcrumb-item>品控工作台</el-breadcrumb-item>
      </el-breadcrumb>
      <div class="header-actions">
        <el-button size="small">返回旧版</el-button>
        <el-button size="small">快捷操作</el-button>
        <el-button size="small">暂存</el-button>
        <el-button type="primary" size="small">导出</el-button>
        <el-button type="primary" size="small">工单</el-button>
        <el-button size="small">反馈</el-button>
        <el-button size="small">索赔</el-button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-container">
      <el-card shadow="never" class="stat-card">
        <div class="stat-item">
          <div class="stat-title">问题件</div>
          <div class="stat-value">5779</div>
          <div class="stat-subtitle">未了结</div>
        </div>
      </el-card>
      <el-card shadow="never" class="stat-card">
        <div class="stat-item">
          <div class="stat-title">工单中心</div>
          <div class="stat-value">16337</div>
          <div class="stat-subtitle">已完结</div>
        </div>
      </el-card>
      <el-card shadow="never" class="stat-card">
        <div class="stat-item">
          <div class="stat-title">未完结</div>
          <div class="stat-value">0</div>
        </div>
      </el-card>
      <el-card shadow="never" class="stat-card">
        <div class="stat-item">
          <div class="stat-title">重量方</div>
          <div class="stat-value">484</div>
          <div class="stat-subtitle">已完结</div>
        </div>
      </el-card>
      <el-card shadow="never" class="stat-card">
        <div class="stat-item">
          <div class="stat-value">20</div>
          <div class="stat-subtitle">未完结</div>
        </div>
      </el-card>
      <el-card shadow="never" class="stat-card">
        <div class="stat-item">
          <div class="stat-value">80</div>
          <div class="stat-subtitle">已完结</div>
        </div>
      </el-card>
      <el-card shadow="never" class="stat-card">
        <div class="stat-item">
          <div class="stat-value">58</div>
          <div class="stat-subtitle">已完结</div>
        </div>
      </el-card>
      <el-card shadow="never" class="stat-card">
        <div class="stat-item">
          <div class="stat-title">仲裁</div>
          <div class="stat-value">7184</div>
          <div class="stat-subtitle">已完结</div>
        </div>
      </el-card>
      <el-card shadow="never" class="stat-card">
        <div class="stat-item">
          <div class="stat-value">1913</div>
          <div class="stat-subtitle">未完结</div>
        </div>
      </el-card>
      <el-card shadow="never" class="stat-card">
        <div class="stat-item">
          <div class="stat-title">差错</div>
          <div class="stat-value">14882</div>
          <div class="stat-subtitle">已完结</div>
        </div>
      </el-card>
    </div>

    <!-- Tabs -->
    <div class="tabs-container">
      <el-tabs type="card">
        <el-tab-pane label="问题件查询(19600)">
          <div class="tab-content">
            <div class="tab-header">
              <div class="tab-subtitle">
                <el-button type="primary" size="small">未完结(6598)</el-button>
                <el-button size="small">已完结(14002)</el-button>
              </div>
              <div class="search-form">
                <el-form :model="searchForm" :inline="true" size="small">
                  <el-form-item label="回复状态">
                    <el-select v-model="searchForm.replyStatus" placeholder="请选择" clearable>
                      <el-option label="未回复" value="1" />
                      <el-option label="已回复" value="2" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="发布方">
                    <el-select v-model="searchForm.publisher" placeholder="请选择" clearable>
                      <el-option label="寄件方" value="1" />
                      <el-option label="收件方" value="2" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="问题类型">
                    <el-select v-model="searchForm.issueType" placeholder="请选择" clearable>
                      <el-option label="客户要求更改派送" value="1" />
                      <el-option label="延迟派送" value="2" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="发布网点">
                    <el-input v-model="searchForm.publisherBranch" placeholder="请输入" clearable />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" size="small">查询</el-button>
                    <el-button size="small">重置</el-button>
                    <el-button size="small">展开 <el-icon><ArrowDown /></el-icon></el-button>
                  </el-form-item>
                </el-form>
              </div>
            </div>

            <!-- Table -->
            <el-table 
              :data="tableData" 
              style="width: 100%"
              :header-cell-style="{ background: '#f5f7fa', color: '#606266', fontWeight: 'bold' }"
            >
              <el-table-column type="selection" width="40" />
              <el-table-column type="index" label="序列" width="60" />
              <el-table-column label="回复状态" width="100">
                <template #default="scope">
                  <span class="status-tag pending">{{ scope.row.replyStatus }}</span>
                </template>
              </el-table-column>
              <el-table-column label="超时未回复时间" width="120" prop="timeoutTime" />
              <el-table-column label="运单号" width="150" prop="waybillNo" />
              <el-table-column label="产品类型" width="100" prop="productType" />
              <el-table-column label="通知网点" width="150" prop="notifyBranch" />
              <el-table-column label="问题件类型" width="150" prop="issueType" />
              <el-table-column label="问题件编号" width="180" prop="issueNo" />
              <el-table-column label="发" width="60" prop="sender" />
              <el-table-column label="操作" width="120">
                <template #default="scope">
                  <el-button link type="primary" size="small">详情</el-button>
                </template>
              </el-table-column>
            </el-table>

            <!-- Pagination -->
            <div class="pagination-container">
              <span class="pagination-info">共 5598 条</span>
              <el-pagination
                layout="prev, pager, next, jumper"
                :total="5598"
                :page-size="10"
                :current-page="1"
                prev-text=""
                next-text=""
              />
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="举证申诉(9)"></el-tab-pane>
        <el-tab-pane label="超时未回复申诉(141)"></el-tab-pane>
        <el-tab-pane label="待发布问题件(2366)"></el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'

const searchForm = reactive({
  replyStatus: '',
  publisher: '',
  issueType: '',
  publisherBranch: ''
})

const tableData = ref([
  {
    replyStatus: '未回复',
    timeoutTime: '08:31:31',
    waybillNo: '8005039651...',
    productType: '零担',
    notifyBranch: '烟台芝罘网点',
    issueType: '客户要求更改派送',
    issueNo: 'WT202603051285649',
    sender: '揽投'
  },
  {
    replyStatus: '未回复',
    timeoutTime: '08:31:31',
    waybillNo: '8005039651...',
    productType: '零担',
    notifyBranch: '烟台芝罘网点',
    issueType: '客户要求更改派送',
    issueNo: 'WT202603051285649',
    sender: '发布'
  },
  {
    replyStatus: '未回复',
    timeoutTime: '08:31:31',
    waybillNo: '8005039638...',
    productType: '零担',
    notifyBranch: '固始胡族-固始三方代...',
    issueType: '客户要求更改派送',
    issueNo: 'WT202603051285648',
    sender: '揽投'
  },
  {
    replyStatus: '未回复',
    timeoutTime: '08:31:31',
    waybillNo: '8005039638...',
    productType: '零担',
    notifyBranch: '太康三方转运部',
    issueType: '客户要求更改派送',
    issueNo: 'WT202603051285648',
    sender: '揽投'
  },
  {
    replyStatus: '未回复',
    timeoutTime: '08:31:31',
    waybillNo: '8005039638...',
    productType: '零担',
    notifyBranch: '固始胡族一部',
    issueType: '客户要求更改派送',
    issueNo: 'WT202603051285647',
    sender: '揽投'
  }
])
</script>

<style scoped lang="scss">
.app-container {
  padding: 16px;
  min-height: calc(100vh - 84px);
  background-color: #f0f2f5;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e4e7ed;

  .header-actions {
    display: flex;
    gap: 8px;
  }
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 16px;

  .stat-card {
    :deep(.el-card__body) {
      padding: 12px;
    }

    .stat-item {
      text-align: center;

      .stat-title {
        font-size: 12px;
        color: #606266;
        margin-bottom: 4px;
      }

      .stat-value {
        font-size: 20px;
        font-weight: bold;
        color: #303133;
        margin-bottom: 4px;
      }

      .stat-subtitle {
        font-size: 11px;
        color: #909399;
      }
    }
  }
}

.tabs-container {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  :deep(.el-tabs__header) {
    margin-bottom: 0;
    border-bottom: 1px solid #e4e7ed;
  }

  :deep(.el-tabs__content) {
    padding: 16px;
  }
}

.tab-content {
  .tab-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .tab-subtitle {
      display: flex;
      gap: 8px;
    }

    .search-form {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }

  .status-tag {
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 12px;

    &.pending {
      background-color: #fdf6ec;
      color: #e6a23c;
    }
  }

  .pagination-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #e4e7ed;

    .pagination-info {
      font-size: 13px;
      color: #606266;
    }
  }
}
</style>