<template>
  <div class="app-container">
    <!-- Search Form -->
    <el-card shadow="never" class="search-wrapper">
      <div class="search-layout">
        <!-- left side big textarea -->
        <div class="search-left">
          <el-input
            v-model="queryParams.waybillNo"
            type="textarea"
            placeholder="请输入运单号"
          />
          <div class="search-left-btns">
            <div class="btn-query" @click="handleQuery">查<br/>询</div>
            <div class="btn-reset" @click="resetQuery">重<br/>置</div>
          </div>
        </div>
        
        <!-- right side form fields -->
        <div class="search-right">
          <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="80px" size="default">
            <el-row :gutter="10">
              <el-col :span="8">
                <el-form-item label="寄件时间" prop="sendTime">
                  <el-date-picker
                    v-model="queryParams.sendTime"
                    type="datetimerange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    format="YYYY-MM-DD HH:mm:ss"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="寄件网点" prop="senderBranch">
                  <el-input v-model="queryParams.senderBranch" placeholder="请输入" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="目的网点" prop="destBranch">
                  <el-input v-model="queryParams.destBranch" placeholder="请输入" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="寄件客户" prop="sender">
                  <el-input v-model="queryParams.sender" placeholder="请输入" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="收件客户" prop="receiver">
                  <el-input v-model="queryParams.receiver" placeholder="请输入" clearable />
                </el-form-item>
              </el-col>
              <!-- Row 2 -->
              <el-col :span="8">
                <el-row>
                  <el-col :span="12">
                    <el-form-item label="支付方式" prop="payType">
                      <el-select v-model="queryParams.payType" placeholder="请选择" clearable>
                        <el-option label="寄付" value="1" />
                        <el-option label="到付" value="2" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="收件员" prop="collector">
                      <el-input v-model="queryParams.collector" placeholder="请输入" clearable />
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-col>
              <el-col :span="4">
                <el-form-item label="产品类型" prop="productType">
                  <el-select v-model="queryParams.productType" placeholder="请选择" clearable>
                    <el-option label="零担" value="1" />
                    <el-option label="冷链快递" value="2" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="服务方式" prop="serviceType">
                  <el-select v-model="queryParams.serviceType" placeholder="请选择" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="渠道" prop="channel">
                  <el-select v-model="queryParams.channel" placeholder="请选择" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="路线类型" prop="routeType">
                  <el-select v-model="queryParams.routeType" placeholder="请选择" clearable />
                </el-form-item>
              </el-col>
              
              <!-- Row 3 -->
              <el-col :span="8">
                <el-row>
                  <el-col :span="12">
                     <el-form-item label="收件手机" prop="receiverPhone">
                      <el-input v-model="queryParams.receiverPhone" placeholder="输入收件手机" clearable />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                     <el-form-item label="增值服务" prop="vas">
                      <el-select v-model="queryParams.vas" placeholder="请选择" clearable />
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-col>
              <el-col :span="4">
                <el-form-item label="预计时效" prop="estTime">
                  <el-select v-model="queryParams.estTime" placeholder="请选择" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="故障类型" prop="faultType">
                  <el-select v-model="queryParams.faultType" placeholder="请选择" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="寄件省" prop="senderProv">
                  <el-select v-model="queryParams.senderProv" placeholder="请选择" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="4" class="search-btn-group">
                <el-button type="primary" @click="handleQuery">查询</el-button>
                <el-button @click="resetQuery">重置</el-button>
                <el-button type="primary" link>展开 <el-icon><ArrowDown /></el-icon></el-button>
              </el-col>
            </el-row>
          </el-form>
        </div>
      </div>
    </el-card>

    <div class="stats-and-actions">
      <div class="stats-text">
        <span class="stat-prefix">合计: </span>
        <span class="stat-item">票数:<span class="c-red">1778票</span></span>
        <span class="stat-item">件数:<span class="c-red">25384件</span></span>
        <span class="stat-item">结算重量:<span class="c-red">338256.16KG</span></span>
        <span class="stat-item">体积:<span class="c-red">930.0443m³</span></span>
        <span class="stat-item">到付款:<span class="c-red">85483.46元</span></span>
        <span class="stat-item">现金:<span class="c-red">109773.95元</span></span>
        <span class="stat-item">月结:<span class="c-red">40701.75元</span></span>
      </div>
      <div class="actions-group">
        <span class="help-link">垫车费用查询 &gt;</span>
        <el-button plain size="default">导出</el-button>
        <el-button type="primary" size="default">面单打印</el-button>
        <el-button type="primary" plain size="default">底单数据</el-button>
        <el-button plain size="default"><el-icon><Setting /></el-icon> 定制</el-button>
      </div>
    </div>

    <!-- Table -->
    <el-card shadow="never" class="table-wrapper">
      <el-table 
        v-loading="loading" 
        :data="tableList" 
        @selection-change="handleSelectionChange"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266', fontWeight: 'bold' }"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column type="index" label="序列" width="60" align="center" />
        <el-table-column label="运单号" align="center" prop="waybillNo" min-width="120">
          <template #default="scope">
            <el-link type="primary" :underline="false">{{ scope.row.waybillNo }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="增值服务" align="center" prop="vas" />
        <el-table-column label="交货中心" align="center" prop="deliveryCenter" />
        <el-table-column label="客户单号" align="center" prop="customerOrderNo" />
        <el-table-column label="订单号" align="center" prop="orderNo" min-width="120" />
        <el-table-column label="回单类型" align="center" prop="receiptType" />
        <el-table-column label="回单号" align="center" prop="receiptNo" min-width="150" />
        <el-table-column label="是否包仓" align="center" prop="isCharter" />
        <el-table-column label="故障类型" align="center" prop="faultType" />
        <el-table-column label="寄件日期" align="center" prop="sendTime" min-width="160" />
        <el-table-column label="产品类型" align="center" prop="productType" />
        <el-table-column label="预计时效" align="center" prop="estTime" />
        <el-table-column label="操作" align="center" min-width="200" fixed="right">
          <template #default="scope">
            <el-button link type="primary" size="small">编辑</el-button>
            <el-button link type="primary" size="small">详情</el-button>
            <el-button link type="danger" size="small">取消</el-button>
            <el-button link type="primary" size="small">复制</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <span class="pagination-total">共 {{ total }} 条</span>
        <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 30, 50]"
          layout="sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="getList"
          @current-change="getList"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ArrowDown, Setting } from '@element-plus/icons-vue'

const loading = ref(false)
const total = ref(1778)

// Mock Date Range for typical layout
const defaultTime: [Date, Date] = [
  new Date(2026, 2, 5, 0, 0, 0),
  new Date(2026, 2, 5, 23, 59, 59)
]

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  waybillNo: '',
  sendTime: ['2026-03-05 00:00:00', '2026-03-05 23:59:59'],
  senderBranch: '',
  destBranch: '',
  sender: '',
  receiver: '',
  payType: '',
  collector: '',
  productType: '',
  serviceType: '',
  channel: '',
  routeType: '',
  receiverPhone: '',
  vas: '',
  estTime: '',
  faultType: '',
  senderProv: ''
})

const tableList = ref([
  {
    waybillNo: '800503975654',
    vas: '',
    deliveryCenter: '',
    customerOrderNo: '',
    orderNo: '',
    receiptType: '',
    receiptNo: '',
    isCharter: '否',
    faultType: '不适用',
    sendTime: '2026-03-05 14:00:00',
    productType: '零担',
    estTime: '144H'
  },
  {
    waybillNo: '800503976544',
    vas: '',
    deliveryCenter: '',
    customerOrderNo: '',
    orderNo: '',
    receiptType: '',
    receiptNo: '',
    isCharter: '是',
    faultType: '不适用',
    sendTime: '2026-03-05 14:10:00',
    productType: '',
    estTime: '144H'
  },
  {
    waybillNo: '800503975653',
    vas: '',
    deliveryCenter: '',
    customerOrderNo: '',
    orderNo: '',
    receiptType: '',
    receiptNo: '',
    isCharter: '否',
    faultType: '不适用',
    sendTime: '2026-03-05 14:20:00',
    productType: '零担',
    estTime: '72H'
  },
  {
    waybillNo: '78985803279131',
    vas: '',
    deliveryCenter: '云冷中心',
    customerOrderNo: '',
    orderNo: 'ZTOCC_EXP...',
    receiptType: '',
    receiptNo: '',
    isCharter: '否',
    faultType: '存量',
    sendTime: '2026-03-05 14:30:00',
    productType: '冷链快递',
    estTime: '120H'
  },
  {
    waybillNo: '800533868606',
    vas: '',
    deliveryCenter: '',
    customerOrderNo: '',
    orderNo: '',
    receiptType: '',
    receiptNo: '',
    isCharter: '否',
    faultType: '不适用',
    sendTime: '2026-03-06 14:00:00',
    productType: '零担',
    estTime: '72H'
  },
  {
    waybillNo: '800503974660',
    vas: '',
    deliveryCenter: '',
    customerOrderNo: '',
    orderNo: '',
    receiptType: '',
    receiptNo: '',
    isCharter: '否',
    faultType: '不适用',
    sendTime: '2026-03-05 14:00:00',
    productType: '零担',
    estTime: '96H'
  },
  {
    waybillNo: '800503974659',
    vas: '',
    deliveryCenter: '',
    customerOrderNo: '',
    orderNo: '',
    receiptType: '',
    receiptNo: '',
    isCharter: '否',
    faultType: '不适用',
    sendTime: '2026-03-05 14:00:00',
    productType: '零担',
    estTime: '96H'
  },
  {
    waybillNo: '800503976543',
    vas: '',
    deliveryCenter: '',
    customerOrderNo: '',
    orderNo: '',
    receiptType: '',
    receiptNo: '',
    isCharter: '否',
    faultType: '不适用',
    sendTime: '2026-03-05 14:00:00',
    productType: '零担',
    estTime: '48H'
  },
  {
    waybillNo: '800503977477',
    vas: '',
    deliveryCenter: '',
    customerOrderNo: '',
    orderNo: '',
    receiptType: '',
    receiptNo: '',
    isCharter: '否',
    faultType: '不适用',
    sendTime: '2026-03-05 14:00:00',
    productType: '零担',
    estTime: '72H'
  },
  {
    waybillNo: '800533974016',
    vas: '',
    deliveryCenter: '',
    customerOrderNo: '',
    orderNo: '旺氏/电子',
    receiptType: 'HD800503974...',
    receiptNo: '',
    isCharter: '否',
    faultType: '不适用',
    sendTime: '2026-03-06 14:00:00',
    productType: '零担',
    estTime: '96H'
  }
])

const handleQuery = () => {
  console.log('Query:', queryParams)
}

const resetQuery = () => {
  console.log('Reset query')
}

const handleSelectionChange = () => {
  
}

const getList = () => {
  
}
</script>

<style scoped lang="scss">
.app-container {
  padding: 16px;
  min-height: calc(100vh - 84px);
  background-color: #f0f2f5;
}

.search-wrapper {
  margin-bottom: 12px;
  :deep(.el-card__body) {
    padding: 16px 16px 0 16px;
  }
}

.search-layout {
  display: flex;
  gap: 16px;
}

.search-left {
  display: flex;
  width: 240px;
  height: 140px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
  background: #fff;
  
  .el-input {
    flex: 1;
    :deep(textarea) {
      height: 100%;
      border: none;
      resize: none;
      box-shadow: none;
      padding: 8px;
      font-size: 13px;
    }
  }
  
  .search-left-btns {
    width: 32px;
    display: flex;
    flex-direction: column;
    border-left: 1px solid #dcdfe6;
    
    .btn-query, .btn-reset {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 13px;
      line-height: 1.2;
      box-sizing: border-box;
      padding: 0 4px;
      text-align: center;
      transition: opacity 0.2s;
      
      &:hover {
        opacity: 0.8;
      }
    }
    .btn-query {
      background-color: #00b4b3;
      color: #fff;
    }
    .btn-reset {
      background-color: #f5f7fa;
      color: #606266;
      border-top: 1px solid #dcdfe6;
    }
  }
}

.search-right {
  flex: 1;
  .el-form-item {
    margin-bottom: 16px;
    margin-right: 0;
    width: 100%;
  }
  :deep(.el-form-item__label) {
    font-weight: normal;
    color: #606266;
    padding-right: 8px;
  }
  
  :deep(.el-select) {
    width: 100%;
  }
}

.search-btn-group {
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 4px;
}

.stats-and-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 4px 0;
  
  .stats-text {
    font-size: 13px;
    color: #333;
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: center;
    
    .stat-prefix {
      color: #00b4b3;
      font-weight: 500;
      margin-right: -8px;
    }
    
    .stat-item {
      color: #606266;
    }
    
    .c-red {
      color: #f5222d;
      font-weight: bold;
      margin-left: 4px;
    }
  }
  
  .actions-group {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .help-link {
      color: #00b4b3;
      font-size: 13px;
      cursor: pointer;
      margin-right: 16px;
      text-decoration: none;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
}

.table-wrapper {
  :deep(.el-card__body) {
    padding: 0;
  }
}

.pagination-container {
  padding: 16px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  position: relative;
  
  .pagination-total {
    position: absolute;
    left: 16px;
    font-size: 13px;
    color: #606266;
  }
}
</style>
