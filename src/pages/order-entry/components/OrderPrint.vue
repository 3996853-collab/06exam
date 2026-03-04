<template>
  <div class="order-print" ref="printContent">
    <div class="print-header">
      <h1>中通冷链 - 物流运单</h1>
      <div class="order-no">运单号：{{ orderNo || '待生成' }}</div>
    </div>

    <div class="print-content">
      <div class="print-section">
        <h3>寄件人信息</h3>
        <div class="info-row">
          <span class="label">姓名：</span>
          <span class="value">{{ data.sender?.name || '-' }}</span>
        </div>
        <div class="info-row">
          <span class="label">电话：</span>
          <span class="value">{{ data.sender?.phone || '-' }}</span>
        </div>
        <div class="info-row">
          <span class="label">地址：</span>
          <span class="value">{{ data.sender?.province }}{{ data.sender?.city }}{{ data.sender?.address || '' }}</span>
        </div>
      </div>

      <div class="print-section">
        <h3>收件人信息</h3>
        <div class="info-row">
          <span class="label">姓名：</span>
          <span class="value">{{ data.receiver?.name || '-' }}</span>
        </div>
        <div class="info-row">
          <span class="label">电话：</span>
          <span class="value">{{ data.receiver?.phone || '-' }}</span>
        </div>
        <div class="info-row">
          <span class="label">地址：</span>
          <span class="value">{{ data.receiver?.province }}{{ data.receiver?.city }}{{ data.receiver?.address || '' }}</span>
        </div>
      </div>

      <div class="print-section">
        <h3>货物信息</h3>
        <div class="info-row">
          <span class="label">名称：</span>
          <span class="value">{{ data.cargo?.name || '-' }}</span>
        </div>
        <div class="info-row">
          <span class="label">类型：</span>
          <span class="value">{{ formatCargoType(data.cargo?.type) }}</span>
        </div>
        <div class="info-row">
          <span class="label">包装：</span>
          <span class="value">{{ formatCargoPackage(data.cargo?.package) }}</span>
        </div>
        <div class="info-row">
          <span class="label">重量：</span>
          <span class="value">{{ data.cargo?.weight || 0 }} kg</span>
        </div>
        <div class="info-row">
          <span class="label">件数：</span>
          <span class="value">{{ data.cargo?.pieces || 0 }}</span>
        </div>
      </div>

      <div class="print-section">
        <h3>费用信息</h3>
        <div class="info-row">
          <span class="label">运费：</span>
          <span class="value">¥{{ data.fee?.shippingFee?.toFixed(2) || '0.00' }}</span>
        </div>
        <div class="info-row">
          <span class="label">保价费：</span>
          <span class="value">¥{{ data.fee?.insuranceFee?.toFixed(2) || '0.00' }}</span>
        </div>
        <div class="info-row">
          <span class="label">其他费用：</span>
          <span class="value">¥{{ data.fee?.otherFee?.toFixed(2) || '0.00' }}</span>
        </div>
        <div class="info-row total">
          <span class="label">总费用：</span>
          <span class="value">¥{{ calculateTotal().toFixed(2) }}</span>
        </div>
        <div class="info-row">
          <span class="label">付款方式：</span>
          <span class="value">{{ formatPaymentType(data.fee?.paymentType) }}</span>
        </div>
      </div>
    </div>

    <div class="print-footer">
      <div class="footer-row">
        <span>打印时间：{{ printTime }}</span>
      </div>
      <div class="footer-row">
        <span>备注：本单据由系统自动生成，请核对信息后签字确认</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import printJS from 'print-js'

const props = defineProps({
  orderData: {
    type: Object,
    default: () => ({})
  },
  orderNo: {
    type: String,
    default: ''
  }
})

const printContent = ref(null)

const data = computed(() => props.orderData)

const printTime = computed(() => {
  const now = new Date()
  return now.toLocaleString('zh-CN')
})

const formatCargoType = (type) => {
  const typeMap = {
    normal: '普通货物',
    cold: '冷链货物',
    fresh: '生鲜食品',
    medicine: '医药用品'
  }
  return typeMap[type] || type || '-'
}

const formatCargoPackage = (pkg) => {
  const packageMap = {
    carton: '纸箱',
    wooden: '木箱',
    foam: '泡沫箱',
    other: '其他'
  }
  return packageMap[pkg] || pkg || '-'
}

const formatPaymentType = (type) => {
  const typeMap = {
    present: '现付',
    collect: '到付',
    month: '月结'
  }
  return typeMap[type] || type || '-'
}

const calculateTotal = () => {
  const fee = data.value.fee || {}
  return (fee.shippingFee || 0) + (fee.insuranceFee || 0) + (fee.otherFee || 0)
}

// 打印方法
const print = () => {
  printJS({
    printable: printContent.value,
    type: 'html',
    targetStyles: ['*'],
    style: `
      .order-print {
        padding: 20px;
        font-family: 'SimSun', serif;
        color: #000;
      }
      .print-header {
        text-align: center;
        border-bottom: 3px solid #002140;
        padding-bottom: 16px;
        margin-bottom: 24px;
      }
      .print-header h1 {
        font-size: 24px;
        margin: 0 0 8px 0;
        color: #002140;
      }
      .order-no {
        font-size: 16px;
        color: #666;
      }
      .print-section {
        margin-bottom: 20px;
        padding: 12px;
        border: 1px solid #000;
        border-radius: 4px;
      }
      .print-section h3 {
        margin: 0 0 12px 0;
        color: #002140;
        font-size: 16px;
        border-bottom: 1px solid #ddd;
        padding-bottom: 8px;
      }
      .info-row {
        margin: 8px 0;
        font-size: 14px;
      }
      .info-row .label {
        font-weight: bold;
        width: 80px;
        display: inline-block;
      }
      .info-row.total {
        margin-top: 12px;
        padding-top: 8px;
        border-top: 1px dashed #ddd;
        font-weight: bold;
      }
      .info-row.total .value {
        color: #f56c6c;
        font-size: 16px;
      }
      .print-footer {
        margin-top: 32px;
        padding-top: 16px;
        border-top: 2px solid #002140;
        text-align: center;
        font-size: 12px;
        color: #666;
      }
      .footer-row {
        margin: 4px 0;
      }
      @media print {
        body { margin: 0; padding: 0; }
        .order-print { page-break-after: always; }
      }
    `
  })
}

defineExpose({
  print
})
</script>

<style scoped>
.order-print {
  padding: 20px;
  background: #fff;
  color: #000;
}

.print-header {
  text-align: center;
  border-bottom: 3px solid #002140;
  padding-bottom: 16px;
  margin-bottom: 24px;
}

.print-header h1 {
  font-size: 24px;
  margin: 0 0 8px 0;
  color: #002140;
}

.order-no {
  font-size: 16px;
  color: #666;
}

.print-content {
  margin-bottom: 24px;
}

.print-section {
  margin-bottom: 20px;
  padding: 12px;
  border: 1px solid #000;
  border-radius: 4px;
}

.print-section h3 {
  margin: 0 0 12px 0;
  color: #002140;
  font-size: 16px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 8px;
}

.info-row {
  margin: 8px 0;
  font-size: 14px;
}

.info-row .label {
  font-weight: bold;
  width: 80px;
  display: inline-block;
}

.info-row.total {
  margin-top: 12px;
  padding-top: 8px;
  border-top: 1px dashed #ddd;
  font-weight: bold;
}

.info-row.total .value {
  color: #f56c6c;
  font-size: 16px;
}

.print-footer {
  margin-top: 32px;
  padding-top: 16px;
  border-top: 2px solid #002140;
  text-align: center;
  font-size: 12px;
  color: #666;
}

.footer-row {
  margin: 4px 0;
}
</style>
