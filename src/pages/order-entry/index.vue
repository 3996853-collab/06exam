<template>
  <div class="order-entry-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>物流运单录入</h2>
      <div class="header-actions">
        <el-button @click="handleSaveDraft">保存草稿</el-button>
        <el-button @click="handleLoadDraft">加载草稿</el-button>
        <el-button type="primary" @click="submitOrder">提交运单</el-button>
      </div>
    </div>

    <!-- 表单内容 -->
    <div class="form-content">
      <SenderForm ref="senderRef" />
      <ReceiverForm ref="receiverRef" />
      <CargoForm ref="cargoRef" />
      <FeeForm ref="feeRef" />
    </div>

    <!-- 底部操作栏 -->
    <div class="footer-actions">
      <el-button @click="reset">重置</el-button>
      <el-button @click="printOrder">打印</el-button>
      <el-button type="primary" @click="submitOrder">提交</el-button>
    </div>

    <!-- 草稿列表对话框 -->
    <el-dialog v-model="draftDialogVisible" title="选择草稿" width="800px">
      <el-table :data="drafts" style="width: 100%">
        <el-table-column prop="id" label="ID" width="180" />
        <el-table-column label="保存时间" width="180">
          <template #default="{ row }">
            {{ new Date(row.createdAt).toLocaleString('zh-CN') }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button size="small" @click="handleSelectDraft(row)">加载</el-button>
            <el-button size="small" type="danger" @click="handleDeleteDraft(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="draftDialogVisible = false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import SenderForm from './components/SenderForm.vue'
import ReceiverForm from './components/ReceiverForm.vue'
import CargoForm from './components/CargoForm.vue'
import FeeForm from './components/FeeForm.vue'
import { saveDraft, loadDrafts, getDraft, deleteDraft } from './utils/draftManager'

const formData = ref({})
const senderRef = ref(null)
const receiverRef = ref(null)
const cargoRef = ref(null)
const feeRef = ref(null)
const draftDialogVisible = ref(false)
const drafts = ref([])

// 收集表单数据
const collectFormData = () => {
  return {
    sender: { ...senderRef.value?.form },
    receiver: { ...receiverRef.value?.form },
    cargo: { ...cargoRef.value?.form },
    fee: { ...feeRef.value?.form }
  }
}

// 加载表单数据
const loadFormData = (data) => {
  if (data.sender) Object.assign(senderRef.value?.form, data.sender)
  if (data.receiver) Object.assign(receiverRef.value?.form, data.receiver)
  if (data.cargo) Object.assign(cargoRef.value?.form, data.cargo)
  if (data.fee) Object.assign(feeRef.value?.form, data.fee)
}

const handleSaveDraft = () => {
  const data = collectFormData()
  const draft = saveDraft(data)
  ElMessage.success('草稿已保存')
  console.log('保存草稿:', draft)
}

const handleLoadDraft = () => {
  drafts.value = loadDrafts()
  draftDialogVisible.value = true
}

const handleSelectDraft = (draft) => {
  loadFormData(draft.data)
  draftDialogVisible.value = false
  ElMessage.success('草稿已加载')
}

const handleDeleteDraft = (id) => {
  ElMessageBox.confirm('确定要删除这条草稿吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleteDraft(id)
    drafts.value = loadDrafts()
    ElMessage.success('草稿已删除')
  }).catch(() => {})
}

const submitOrder = () => {
  console.log('提交运单', formData.value)
}

const reset = () => {
  senderRef.value?.formRef?.resetFields()
  receiverRef.value?.formRef?.resetFields()
  cargoRef.value?.formRef?.resetFields()
  feeRef.value?.formRef?.resetFields()
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
