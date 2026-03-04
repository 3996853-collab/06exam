<template>
  <div class="fee-form">
    <div class="section-title">
      <el-icon><Money /></el-icon>
      <span>费用信息</span>
    </div>

    <el-form :model="form" ref="formRef" label-width="100px">
      <el-row :gutter="16">
        <el-col :span="8">
          <el-form-item label="运费">
            <el-input-number v-model="form.shippingFee" :precision="2" :step="0.1" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="保价费">
            <el-input-number v-model="form.insuranceFee" :precision="2" :step="0.1" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="其他费用">
            <el-input-number v-model="form.otherFee" :precision="2" :step="0.1" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="8">
          <el-form-item label="保价金额">
            <el-input-number v-model="form.insuranceValue" :precision="2" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="付款方式">
            <el-radio-group v-model="form.paymentType">
              <el-radio label="present">现付</el-radio>
              <el-radio label="collect">到付</el-radio>
              <el-radio label="month">月结</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="总费用">
            <div class="total-fee">¥ {{ totalFee.toFixed(2) }}</div>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Money } from '@element-plus/icons-vue'

const formRef = ref(null)

const form = reactive({
  shippingFee: 0,
  insuranceFee: 0,
  otherFee: 0,
  insuranceValue: 0,
  paymentType: 'present'
})

const totalFee = computed(() => {
  return form.shippingFee + form.insuranceFee + form.otherFee
})

defineExpose({
  form,
  formRef
})
</script>

<style scoped>
.fee-form {
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #303133;
}

.total-fee {
  font-size: 20px;
  font-weight: bold;
  color: #f56c6c;
}
</style>
