<template>
  <div class="order-entry-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>物流运单录入</h2>
      <div class="header-actions">
        <el-button @click="saveDraft">保存草稿</el-button>
        <el-button @click="loadDraft">加载草稿</el-button>
        <el-button type="primary" @click="submitOrder">提交运单</el-button>
      </div>
    </div>

    <!-- 表单内容 -->
    <div class="form-content">
      <SenderForm ref="senderRef" />
      <ReceiverForm ref="receiverRef" />
      <CargoForm ref="cargoRef" />
    </div>

    <!-- 底部操作栏 -->
    <div class="footer-actions">
      <el-button @click="reset">重置</el-button>
      <el-button @click="printOrder">打印</el-button>
      <el-button type="primary" @click="submitOrder">提交</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SenderForm from './components/SenderForm.vue'
import ReceiverForm from './components/ReceiverForm.vue'
import CargoForm from './components/CargoForm.vue'

const formData = ref({})
const senderRef = ref(null)
const receiverRef = ref(null)
const cargoRef = ref(null)

const saveDraft = () => {
  console.log('保存草稿', formData.value)
}

const loadDraft = () => {
  console.log('加载草稿')
}

const submitOrder = () => {
  console.log('提交运单', formData.value)
}

const reset = () => {
  senderRef.value?.formRef?.resetFields()
  receiverRef.value?.formRef?.resetFields()
  cargoRef.value?.formRef?.resetFields()
}

const printOrder = () => {
  console.log('打印运单')
}
</script>

<style scoped>
.order-entry-page {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background: #fff;
  padding: 16px 24px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.form-content {
  background: #fff;
  padding: 24px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-height: 400px;
}

.footer-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
