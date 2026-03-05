<template>
  <div class="app-container">
    <!-- Header with breadcrumb -->
    <div class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item><a href="#">首页</a></el-breadcrumb-item>
        <el-breadcrumb-item>录单</el-breadcrumb-item>
      </el-breadcrumb>
      <div class="header-actions">
        <el-button size="small">历史订单</el-button>
        <el-button size="small">草稿箱</el-button>
        <el-button size="small">批量导入</el-button>
        <el-button type="primary" size="small">保存草稿</el-button>
        <el-button type="primary" size="small">提交订单</el-button>
      </div>
    </div>

    <!-- Main Form Content -->
    <el-card shadow="never" class="form-card">
      <!-- Sender Information -->
      <div class="form-section">
        <h3 class="section-title">发件人信息</h3>
        <el-form :model="formData.sender" label-width="100px">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="发件人">
                <el-input v-model="formData.sender.name" placeholder="请输入发件人姓名" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="联系电话">
                <el-input v-model="formData.sender.phone" placeholder="请输入联系电话" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="公司名称">
                <el-input v-model="formData.sender.company" placeholder="请输入公司名称" />
              </el-form-item>
            </el-col>
            <el-col :span="16">
              <el-form-item label="详细地址">
                <el-input v-model="formData.sender.address" placeholder="请输入详细地址" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="网点名称">
                <el-select v-model="formData.sender.branch" placeholder="请选择网点">
                  <el-option label="北京朝阳区网点" value="beijing-chaoyang" />
                  <el-option label="上海浦东新区网点" value="shanghai-pudong" />
                  <el-option label="广州天河区网点" value="guangzhou-tianhe" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <!-- Receiver Information -->
      <div class="form-section">
        <h3 class="section-title">收件人信息</h3>
        <el-form :model="formData.receiver" label-width="100px">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="收件人">
                <el-input v-model="formData.receiver.name" placeholder="请输入收件人姓名" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="联系电话">
                <el-input v-model="formData.receiver.phone" placeholder="请输入联系电话" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="公司名称">
                <el-input v-model="formData.receiver.company" placeholder="请输入公司名称" />
              </el-form-item>
            </el-col>
            <el-col :span="16">
              <el-form-item label="详细地址">
                <el-input v-model="formData.receiver.address" placeholder="请输入详细地址" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="网点名称">
                <el-select v-model="formData.receiver.branch" placeholder="请选择网点">
                  <el-option label="北京朝阳区网点" value="beijing-chaoyang" />
                  <el-option label="上海浦东新区网点" value="shanghai-pudong" />
                  <el-option label="广州天河区网点" value="guangzhou-tianhe" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <!-- Cargo Information -->
      <div class="form-section">
        <h3 class="section-title">货物信息</h3>
        <el-form :model="formData.cargo" label-width="100px">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="货物名称">
                <el-input v-model="formData.cargo.name" placeholder="请输入货物名称" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="货物类型">
                <el-select v-model="formData.cargo.type" placeholder="请选择货物类型">
                  <el-option label="普通货物" value="normal" />
                  <el-option label="易碎品" value="fragile" />
                  <el-option label="危险品" value="dangerous" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="包装类型">
                <el-select v-model="formData.cargo.package" placeholder="请选择包装类型">
                  <el-option label="纸箱" value="carton" />
                  <el-option label="木箱" value="wooden" />
                  <el-option label="托盘" value="pallet" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="件数">
                <el-input v-model.number="formData.cargo.quantity" placeholder="请输入件数" type="number" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="重量(kg)">
                <el-input v-model.number="formData.cargo.weight" placeholder="请输入重量" type="number" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="体积(m³)">
                <el-input v-model.number="formData.cargo.volume" placeholder="请输入体积" type="number" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <!-- Fee Information -->
      <div class="form-section">
        <h3 class="section-title">费用信息</h3>
        <el-form :model="formData.fee" label-width="100px">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="运费">
                <el-input v-model.number="formData.fee.freight" placeholder="请输入运费" type="number" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="燃油费">
                <el-input v-model.number="formData.fee.fuel" placeholder="请输入燃油费" type="number" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="其他费用">
                <el-input v-model.number="formData.fee.other" placeholder="请输入其他费用" type="number" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="支付方式">
                <el-select v-model="formData.fee.payType" placeholder="请选择支付方式">
                  <el-option label="寄付" value="sender" />
                  <el-option label="到付" value="receiver" />
                  <el-option label="月结" value="monthly" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="总费用">
                <el-input v-model.number="formData.fee.total" placeholder="总费用" type="number" readonly />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <!-- Additional Information -->
      <div class="form-section">
        <h3 class="section-title">其他信息</h3>
        <el-form :model="formData.other" label-width="100px">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="产品类型">
                <el-select v-model="formData.other.productType" placeholder="请选择产品类型">
                  <el-option label="零担" value="less-than-truckload" />
                  <el-option label="冷链快递" value="cold-chain" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="服务方式">
                <el-select v-model="formData.other.serviceType" placeholder="请选择服务方式">
                  <el-option label="上门取件" value="pickup" />
                  <el-option label="网点自寄" value="self-service" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="预计时效">
                <el-select v-model="formData.other.estTime" placeholder="请选择预计时效">
                  <el-option label="48H" value="48h" />
                  <el-option label="72H" value="72h" />
                  <el-option label="96H" value="96h" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="备注">
                <el-input v-model="formData.other.remark" placeholder="请输入备注信息" type="textarea" rows="3" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

const formData = reactive({
  sender: {
    name: '',
    phone: '',
    company: '',
    address: '',
    branch: ''
  },
  receiver: {
    name: '',
    phone: '',
    company: '',
    address: '',
    branch: ''
  },
  cargo: {
    name: '',
    type: '',
    package: '',
    quantity: 0,
    weight: 0,
    volume: 0
  },
  fee: {
    freight: 0,
    fuel: 0,
    other: 0,
    payType: '',
    total: 0
  },
  other: {
    productType: '',
    serviceType: '',
    estTime: '',
    remark: ''
  }
})

// Calculate total fee
const calculateTotal = () => {
  formData.fee.total = formData.fee.freight + formData.fee.fuel + formData.fee.other
}

// Watch for fee changes
import { watch } from 'vue'
watch(
  () => [formData.fee.freight, formData.fee.fuel, formData.fee.other],
  () => {
    calculateTotal()
  },
  { deep: true }
)

// Submit order
const submitOrder = () => {
  console.log('Submit order:', formData)
  // Add submit logic here
}

// Save draft
const saveDraft = () => {
  console.log('Save draft:', formData)
  // Add save draft logic here
}
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

.form-card {
  margin-bottom: 16px;

  :deep(.el-card__body) {
    padding: 24px;
  }
}

.form-section {
  margin-bottom: 24px;

  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid #e4e7ed;
  }
}

.el-form {
  margin-bottom: 0;
}

.el-row {
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}
</style>