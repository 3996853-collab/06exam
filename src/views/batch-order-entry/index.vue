<template>
  <div class="batch-order-entry-page">
    <div class="tabs-row">
      <span v-for="tab in tabs" :key="tab.label" :class="['tab-item', { active: activeTab === tab.key }]" @click="activeTab = tab.key">
        {{ tab.label }}
      </span>
      <span class="product-doc">产品说明</span>
    </div>

    <div class="action-row">
      <div class="action-left">
        <span class="selected-count">已选0条</span>
        <el-button type="primary" size="small">重试</el-button>
        <el-button type="success" size="small">批量下单</el-button>
        <el-button type="danger" size="small">删除</el-button>
        <el-button color="#00b8c4" size="small">面单打印</el-button>
        <el-dropdown>
          <el-button color="#00b8c4" size="small">
            导出
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>导出全部</el-dropdown-item>
              <el-dropdown-item>导出已选</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <div class="action-right">
        <el-button color="#00b8c4" size="small">模板下载</el-button>
        <el-button color="#00b8c4" size="small">导入</el-button>
        <el-button color="#00b8c4" size="small">清空</el-button>
        <el-button type="primary" plain size="small">回到旧版</el-button>
      </div>
    </div>

    <el-table :data="tableData" border style="width: 100%" height="calc(100vh - 280px)">
      <el-table-column type="selection" width="44" />
      <el-table-column prop="index" label="序号" width="70" />
      <el-table-column prop="status" label="状态" width="100" />
      <el-table-column prop="errorMsg" label="错误信息" width="200" />
      <el-table-column prop="waybillNo" label="运单号" width="140" />
      <el-table-column prop="productType" label="产品类型" width="120" />
      <el-table-column prop="valueAdded" label="增值服务" width="120" />
      <el-table-column prop="tempArea" label="温区" width="90" />
      <el-table-column prop="serviceMode" label="服务方式" width="110" />
      <el-table-column prop="deliveryMode" label="送货方式" width="110" />
      <el-table-column prop="handoverCenter" label="交货中心" width="120" />
      <el-table-column prop="returnType" label="回单类型" width="110" />
      <el-table-column prop="customerNo" label="客户单号" width="130" />
      <el-table-column prop="receiver" label="收件人" width="110" />
      <el-table-column prop="receiverMobile" label="收件人手机号" width="140" />
      <el-table-column prop="operation" label="操作" width="100" fixed="right" />

      <template #empty>
        <el-empty description="暂无数据" :image-size="110" />
      </template>
    </el-table>

    <div class="pagination-row">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next"
        :total="0"
        :page-sizes="[20, 50, 100]"
        :page-size="20"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const activeTab = ref('all')
const tabs = [
  { key: 'all', label: '全部(0)' },
  { key: 'failed', label: '失败列表(0)' },
  { key: 'pending', label: '待下单(0)' },
  { key: 'success', label: '下单成功(0)' }
]

const tableData = ref([])
</script>

<style scoped>
.batch-order-entry-page {
  padding: 14px 16px;
  background: #f5f7fa;
  min-height: calc(100vh - 90px);
}

.tabs-row {
  display: flex;
  align-items: center;
  gap: 18px;
  height: 34px;
}

.tab-item {
  position: relative;
  color: #606266;
  font-size: 14px;
  cursor: pointer;
}

.tab-item.active {
  color: #00b8c4;
  font-weight: 600;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -7px;
  width: 100%;
  height: 2px;
  background: #00b8c4;
}

.product-doc {
  color: #00b8c4;
  font-size: 14px;
  cursor: pointer;
}

.action-row {
  margin-top: 12px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.action-left,
.action-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.selected-count {
  color: #606266;
  font-size: 14px;
  margin-right: 4px;
}

.pagination-row {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
}
</style>
