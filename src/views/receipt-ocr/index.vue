<template>
  <div class="app-container">
    <!-- Header with breadcrumb -->
    <div class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item><a href="#">首页</a></el-breadcrumb-item>
        <el-breadcrumb-item>业务功能</el-breadcrumb-item>
        <el-breadcrumb-item>回单识别</el-breadcrumb-item>
      </el-breadcrumb>
      <div class="header-actions">
        <el-button
          type="primary"
          size="small"
          :loading="isBatchProcessing"
          :disabled="uploadedFiles.length === 0"
          @click="handleBatchRecognize"
        >
          <el-icon v-if="!isBatchProcessing"><Camera /></el-icon>
          一键识别
        </el-button>
        <el-button
          size="small"
          :disabled="results.length === 0"
          @click="handleExport"
        >
          <el-icon><Download /></el-icon>
          导出结果
        </el-button>
        <el-button
          size="small"
          :disabled="uploadedFiles.length === 0"
          @click="handleClearAll"
        >
          <el-icon><Delete /></el-icon>
          清空
        </el-button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-container">
      <el-card shadow="never" class="stat-card">
        <div class="stat-item">
          <div class="stat-icon upload-icon">
            <el-icon :size="22"><UploadFilled /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ uploadedFiles.length }}</div>
            <div class="stat-title">已上传</div>
          </div>
        </div>
      </el-card>
      <el-card shadow="never" class="stat-card">
        <div class="stat-item">
          <div class="stat-icon recognized-icon">
            <el-icon :size="22"><Select /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ recognizedCount }}</div>
            <div class="stat-title">已识别</div>
          </div>
        </div>
      </el-card>
      <el-card shadow="never" class="stat-card">
        <div class="stat-item">
          <div class="stat-icon success-icon">
            <el-icon :size="22"><CircleCheckFilled /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ successCount }}</div>
            <div class="stat-title">识别成功</div>
          </div>
        </div>
      </el-card>
      <el-card shadow="never" class="stat-card">
        <div class="stat-item">
          <div class="stat-icon confidence-icon">
            <el-icon :size="22"><TrendCharts /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ avgConfidence }}</div>
            <div class="stat-title">平均置信度</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- Upload Area -->
    <el-card shadow="never" class="upload-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">
            <el-icon><Picture /></el-icon>
            上传回单照片
          </span>
          <span class="card-tip">支持 JPG、PNG 格式，可批量上传多张水印相机拍摄的送货单回单照片</span>
        </div>
      </template>
      <el-upload
        ref="uploadRef"
        class="receipt-uploader"
        drag
        multiple
        :auto-upload="false"
        :show-file-list="false"
        accept=".jpg,.jpeg,.png"
        :on-change="handleFileChange"
      >
        <div class="upload-content">
          <el-icon class="upload-icon-main"><UploadFilled /></el-icon>
          <div class="upload-text">将文件拖到此处，或 <em>点击上传</em></div>
          <div class="upload-hint">支持 jpg / jpeg / png 格式的回单照片</div>
        </div>
      </el-upload>

      <!-- Thumbnail Grid -->
      <div v-if="uploadedFiles.length > 0" class="thumbnail-grid">
        <div
          v-for="(file, index) in uploadedFiles"
          :key="file.uid"
          class="thumbnail-item"
          :class="{ 'is-processing': file.status === 'processing' }"
        >
          <el-image
            :src="file.url"
            fit="cover"
            class="thumbnail-img"
            @click="handlePreview(file)"
          />
          <div v-if="file.status === 'processing'" class="thumbnail-overlay">
            <el-icon class="spin-icon"><Loading /></el-icon>
          </div>
          <div v-if="file.status === 'success'" class="thumbnail-badge success">
            <el-icon><Select /></el-icon>
          </div>
          <div v-if="file.status === 'error'" class="thumbnail-badge error">
            <el-icon><CloseBold /></el-icon>
          </div>
          <div class="thumbnail-name">{{ file.name }}</div>
          <el-icon class="thumbnail-delete" @click.stop="handleRemoveFile(index)"><Close /></el-icon>
        </div>
      </div>
    </el-card>

    <!-- Results Table -->
    <el-card shadow="never" class="result-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">
            <el-icon><Document /></el-icon>
            识别结果
          </span>
          <span class="result-summary" v-if="results.length > 0">
            共 {{ results.length }} 条结果
          </span>
        </div>
      </template>

      <el-table
        :data="results"
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266', fontWeight: 'bold' }"
        empty-text="暂无识别结果，请先上传照片并点击「一键识别」"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column label="图片" width="80" align="center">
          <template #default="scope">
            <el-image
              :src="scope.row.thumbnailUrl"
              fit="cover"
              class="table-thumbnail"
              :preview-src-list="[scope.row.thumbnailUrl]"
              preview-teleported
            />
          </template>
        </el-table-column>
        <el-table-column prop="fileName" label="文件名" min-width="160" show-overflow-tooltip />
        <el-table-column prop="deliveryNo" label="出库单号/送货单号" min-width="180">
          <template #default="scope">
            <span v-if="scope.row.deliveryNo" class="delivery-no">{{ scope.row.deliveryNo }}</span>
            <span v-else class="text-muted">未识别</span>
          </template>
        </el-table-column>
        <el-table-column prop="signDate" label="签收日期" width="130" align="center">
          <template #default="scope">
            <span v-if="scope.row.signDate">{{ scope.row.signDate }}</span>
            <span v-else class="text-muted">—</span>
          </template>
        </el-table-column>
        <el-table-column prop="signTime" label="签收时间" width="180" align="center">
          <template #default="scope">
            <span v-if="scope.row.signTime">{{ scope.row.signTime }}</span>
            <span v-else class="text-muted">—</span>
          </template>
        </el-table-column>
        <el-table-column label="置信度" width="160" align="center">
          <template #default="scope">
            <div v-if="scope.row.confidence !== null" class="confidence-cell">
              <el-progress
                :percentage="Math.round(scope.row.confidence * 100)"
                :stroke-width="6"
                :color="getConfidenceColor(scope.row.confidence)"
                :show-text="false"
              />
              <span class="confidence-text" :style="{ color: getConfidenceColor(scope.row.confidence) }">
                {{ (scope.row.confidence * 100).toFixed(0) }}%
              </span>
            </div>
            <span v-else class="text-muted">—</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="110" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.status === 'success'" type="success" size="small" effect="light">成功</el-tag>
            <el-tag v-else-if="scope.row.status === 'manual'" color="#e6f7ff" style="color: #00b8c4; border-color: #00b8c4;" size="small" effect="light">已补录</el-tag>
            <el-tag v-else-if="scope.row.status === 'error'" type="danger" size="small" effect="light">失败</el-tag>
            <el-tag v-else-if="scope.row.status === 'processing'" type="warning" size="small" effect="light">识别中</el-tag>
            <el-tag v-else type="info" size="small" effect="light">待识别</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="errorMessage" label="错误信息" min-width="150" show-overflow-tooltip>
          <template #default="scope">
            <span v-if="scope.row.errorMessage" class="error-text">{{ scope.row.errorMessage }}</span>
            <span v-else class="text-muted">—</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="handlePreviewResult(scope.row)">
              <el-icon><View /></el-icon> 预览
            </el-button>
            <el-button link type="warning" size="small" @click="handleOpenManualEdit(scope.row, scope.$index)">
              <el-icon><EditPen /></el-icon> 补录
            </el-button>
            <el-button link type="primary" size="small" @click="handleRetry(scope.row, scope.$index)">
              <el-icon><RefreshRight /></el-icon> 重试
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Manual Edit Dialog -->
    <el-dialog
      v-model="manualDialogVisible"
      title="人工补录回单信息"
      width="540px"
      destroy-on-close
      align-center
    >
      <el-form :model="manualForm" label-width="140px" size="default">
        <el-form-item label="文件名">
          <span style="color: #606266; word-break: break-all;">{{ manualForm.fileName }}</span>
        </el-form-item>
        <el-form-item label="出库单号/单号" required>
          <el-input
            v-model="manualForm.deliveryNo"
            placeholder="请输入出库单号 (如 CK202609040001)"
            clearable
          />
        </el-form-item>
        <el-form-item label="签收日期" required>
          <el-date-picker
            v-model="manualForm.signDate"
            type="date"
            placeholder="请选择水印签收日期"
            value-format="YYYY-MM-DD"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="签收时间(打卡时间)">
          <el-date-picker
            v-model="manualForm.signTime"
            type="datetime"
            placeholder="请选择水印打卡时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%;"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="manualDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="isSavingManual" @click="handleSaveManual">保存并确认</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Image Preview Dialog -->
    <el-dialog
      v-model="previewVisible"
      title="回单照片预览"
      width="720px"
      destroy-on-close
      align-center
    >
      <div class="preview-content">
        <el-image
          :src="previewUrl"
          fit="contain"
          class="preview-image"
        />
        <div v-if="previewResult" class="preview-info">
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="文件名">{{ previewResult.fileName }}</el-descriptions-item>
            <el-descriptions-item label="出库单号/送货单号">
              <span v-if="previewResult.deliveryNo" class="delivery-no">{{ previewResult.deliveryNo }}</span>
              <span v-else class="text-muted">未识别</span>
            </el-descriptions-item>
            <el-descriptions-item label="签收日期">{{ previewResult.signDate || '—' }}</el-descriptions-item>
            <el-descriptions-item label="签收时间">{{ previewResult.signTime || '—' }}</el-descriptions-item>
            <el-descriptions-item label="置信度">
              <span v-if="previewResult.confidence !== null">{{ (previewResult.confidence * 100).toFixed(1) }}%</span>
              <span v-else>—</span>
            </el-descriptions-item>
            <el-descriptions-item v-if="previewResult.errorMessage" label="错误信息">
              <span class="error-text">{{ previewResult.errorMessage }}</span>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { UploadFile } from 'element-plus'
import {
  Camera,
  Download,
  Delete,
  UploadFilled,
  Select,
  CircleCheckFilled,
  TrendCharts,
  Picture,
  Document,
  Close,
  CloseBold,
  Loading,
  View,
  RefreshRight,
  EditPen
} from '@element-plus/icons-vue'

// ---------- Types ----------
interface UploadedFile {
  uid: number
  name: string
  url: string
  raw: File
  status: 'pending' | 'processing' | 'success' | 'error' | 'manual'
}

interface OcrResult {
  fileName: string
  thumbnailUrl: string
  deliveryNo: string | null
  signDate: string | null
  signTime: string | null
  confidence: number | null
  status: 'pending' | 'processing' | 'success' | 'error' | 'manual'
  errorMessage: string | null
  fileUid: number
  recordId?: number | null
}

// ---------- State ----------
const uploadRef = ref()
const uploadedFiles = ref<UploadedFile[]>([])
const results = ref<OcrResult[]>([])
const isBatchProcessing = ref(false)
const previewVisible = ref(false)
const previewUrl = ref('')
const previewResult = ref<OcrResult | null>(null)

// 人工补录弹窗与表单状态
const manualDialogVisible = ref(false)
const isSavingManual = ref(false)
const editingIndex = ref<number>(-1)
const manualForm = ref({
  fileName: '',
  deliveryNo: '',
  signDate: '',
  signTime: '',
  recordId: null as number | null
})

// ---------- Computed ----------
const recognizedCount = computed(() =>
  results.value.filter(r => r.status === 'success' || r.status === 'error' || r.status === 'manual').length
)

const successCount = computed(() =>
  results.value.filter(r => r.status === 'success' || r.status === 'manual').length
)

const avgConfidence = computed(() => {
  const successResults = results.value.filter(r => r.status === 'success' && r.confidence !== null)
  if (successResults.length === 0) return '—'
  const avg = successResults.reduce((sum, r) => sum + (r.confidence || 0), 0) / successResults.length
  return (avg * 100).toFixed(1) + '%'
})

// ---------- Mock OCR Logic ----------
function generateDeliveryNo(): string {
  const prefix = 'ZTO'
  const date = '20260903'
  const seq = String(Math.floor(Math.random() * 99999)).padStart(5, '0')
  return `${prefix}${date}${seq}`
}

function generateSignDateTime(): { date: string; time: string } {
  const now = new Date()
  // Randomly offset by 0-48 hours
  const offset = Math.floor(Math.random() * 48) * 60 * 60 * 1000
  const signDate = new Date(now.getTime() - offset)

  const pad = (n: number) => String(n).padStart(2, '0')
  const dateStr = `${signDate.getFullYear()}-${pad(signDate.getMonth() + 1)}-${pad(signDate.getDate())}`
  const timeStr = `${dateStr} ${pad(signDate.getHours())}:${pad(signDate.getMinutes())}:${pad(signDate.getSeconds())}`

  return { date: dateStr, time: timeStr }
}

async function callRealOcrApi(file: UploadedFile): Promise<OcrResult> {
  const formData = new FormData()
  formData.append('file', file.raw)

  try {
    const response = await fetch('/api/v1/pod/upload/single?operator=operator_ui', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`后端识别接口报错 (${response.status}): ${errText}`)
    }

    const data = await response.json()
    const isSuccess = data.recognition_status === 1
    return {
      fileName: data.raw_file_name || file.name,
      thumbnailUrl: data.image_url ? (data.image_url.startsWith('http') ? data.image_url : file.url) : file.url,
      deliveryNo: data.delivery_no || null,
      signDate: data.sign_date || null,
      signTime: data.sign_time || null,
      confidence: data.confidence !== undefined ? data.confidence : (isSuccess ? 0.95 : 0.4),
      status: isSuccess ? 'success' : 'error',
      errorMessage: isSuccess ? null : (data.error_message || '送货单号或水印日期未识别完整'),
      fileUid: file.uid,
      recordId: data.record_id || null
    }
  } catch (err: any) {
    console.error('OCR 真实接口调用失败，尝试提示或使用降级:', err)
    return {
      fileName: file.name,
      thumbnailUrl: file.url,
      deliveryNo: null,
      signDate: null,
      signTime: null,
      confidence: 0,
      status: 'error',
      errorMessage: err.message || '网络异常或服务未响应',
      fileUid: file.uid,
      recordId: null
    }
  }
}

async function performOcrExtract(file: UploadedFile): Promise<OcrResult> {
  return await callRealOcrApi(file)
}

function handleOpenManualEdit(row: OcrResult, index: number) {
  editingIndex.value = index
  manualForm.value = {
    fileName: row.fileName,
    deliveryNo: row.deliveryNo || '',
    signDate: row.signDate || '',
    signTime: row.signTime || '',
    recordId: row.recordId || null
  }
  manualDialogVisible.value = true
}

async function handleSaveManual() {
  if (!manualForm.value.deliveryNo.trim()) {
    ElMessage.warning('请输入出库单号/单号')
    return
  }
  if (!manualForm.value.signDate) {
    ElMessage.warning('请选择签收日期')
    return
  }

  isSavingManual.value = true
  try {
    // 若有后端记录 ID，联动后端人工补录接口持久化
    if (manualForm.value.recordId) {
      const response = await fetch(`/api/v1/pod/records/${manualForm.value.recordId}/manual-record`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          delivery_no: manualForm.value.deliveryNo.trim(),
          sign_date: manualForm.value.signDate,
          sign_time: manualForm.value.signTime || null,
          operator: 'operator_ui'
        })
      })
      if (!response.ok) {
        const err = await response.text()
        console.warn('后端补录接口返回提示:', err)
      }
    }

    // 更新前端表格数据
    if (editingIndex.value >= 0 && editingIndex.value < results.value.length) {
      const target = results.value[editingIndex.value]
      target.deliveryNo = manualForm.value.deliveryNo.trim()
      target.signDate = manualForm.value.signDate
      target.signTime = manualForm.value.signTime || null
      target.status = 'manual'
      target.errorMessage = null
      target.confidence = 1.0

      // 更新对应文件的状态徽章
      const file = uploadedFiles.value.find(f => f.uid === target.fileUid)
      if (file) {
        file.status = 'success'
      }
    }

    ElMessage.success('人工补录成功！')
    manualDialogVisible.value = false
  } catch (error: any) {
    ElMessage.error(`补录失败: ${error.message || '网络异常'}`)
  } finally {
    isSavingManual.value = false
  }
}

// ---------- Handlers ----------
function handleFileChange(file: UploadFile) {
  if (!file.raw) return

  // Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png']
  if (!validTypes.includes(file.raw.type)) {
    ElMessage.warning('仅支持 JPG / PNG 格式的图片')
    return
  }

  // Validate file size (max 10MB)
  if (file.raw.size > 10 * 1024 * 1024) {
    ElMessage.warning('图片大小不能超过 10MB')
    return
  }

  const url = URL.createObjectURL(file.raw)
  uploadedFiles.value.push({
    uid: file.uid as number,
    name: file.name,
    url,
    raw: file.raw,
    status: 'pending'
  })
}

function handleRemoveFile(index: number) {
  const file = uploadedFiles.value[index]
  URL.revokeObjectURL(file.url)
  uploadedFiles.value.splice(index, 1)
  // Also remove from results
  const resultIndex = results.value.findIndex(r => r.fileUid === file.uid)
  if (resultIndex !== -1) {
    results.value.splice(resultIndex, 1)
  }
}

async function handleBatchRecognize() {
  const pendingFiles = uploadedFiles.value.filter(f => f.status === 'pending' || f.status === 'error')
  if (pendingFiles.length === 0) {
    ElMessage.info('所有照片已识别完成')
    return
  }

  isBatchProcessing.value = true

  for (const file of pendingFiles) {
    file.status = 'processing'

    // Check if result already exists (retry scenario)
    const existingIndex = results.value.findIndex(r => r.fileUid === file.uid)
    if (existingIndex !== -1) {
      results.value[existingIndex].status = 'processing'
    } else {
      results.value.push({
        fileName: file.name,
        thumbnailUrl: file.url,
        deliveryNo: null,
        signDate: null,
        signTime: null,
        confidence: null,
        status: 'processing',
        errorMessage: null,
        fileUid: file.uid
      })
    }

    try {
      const result = await performOcrExtract(file)
      const resultIndex = results.value.findIndex(r => r.fileUid === file.uid)
      if (resultIndex !== -1) {
        results.value[resultIndex] = result
      }
      file.status = result.status
    } catch {
      file.status = 'error'
      const resultIndex = results.value.findIndex(r => r.fileUid === file.uid)
      if (resultIndex !== -1) {
        results.value[resultIndex].status = 'error'
        results.value[resultIndex].errorMessage = '识别过程发生未知错误'
      }
    }
  }

  isBatchProcessing.value = false
  ElMessage.success(`识别完成，共处理 ${pendingFiles.length} 张照片`)
}

async function handleRetry(row: OcrResult, index: number) {
  const file = uploadedFiles.value.find(f => f.uid === row.fileUid)
  if (!file) return

  file.status = 'processing'
  results.value[index].status = 'processing'

  try {
    const result = await performOcrExtract(file)
    results.value[index] = result
    file.status = result.status
  } catch {
    file.status = 'error'
    results.value[index].status = 'error'
    results.value[index].errorMessage = '重试失败'
  }
}

function handlePreview(file: UploadedFile) {
  previewUrl.value = file.url
  previewResult.value = results.value.find(r => r.fileUid === file.uid) || null
  previewVisible.value = true
}

function handlePreviewResult(row: OcrResult) {
  previewUrl.value = row.thumbnailUrl
  previewResult.value = row
  previewVisible.value = true
}

function handleExport() {
  if (results.value.length === 0) {
    ElMessage.warning('暂无识别结果可导出')
    return
  }

  const exportData = results.value
    .filter(r => r.status === 'success' || r.status === 'manual')
    .map(r => ({
      delivery_no: r.deliveryNo,
      sign_date: r.signDate,
      sign_time: r.signTime,
      confidence: r.confidence,
      error_message: r.errorMessage
    }))

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `回单识别结果_${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('导出成功')
}

async function handleClearAll() {
  try {
    await ElMessageBox.confirm('确定要清空所有已上传的照片和识别结果吗？', '确认清空', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch {
    return
  }

  uploadedFiles.value.forEach(f => URL.revokeObjectURL(f.url))
  uploadedFiles.value = []
  results.value = []
  ElMessage.success('已清空')
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.95) return '#67c23a'
  if (confidence >= 0.85) return '#00b8c4'
  if (confidence >= 0.70) return '#e6a23c'
  return '#f56c6c'
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

// Stats Cards
.stats-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 16px;

  .stat-card {
    :deep(.el-card__body) {
      padding: 16px;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 12px;

      .stat-icon {
        width: 44px;
        height: 44px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        flex-shrink: 0;

        &.upload-icon { background: linear-gradient(135deg, #00b8c4, #00d4e0); }
        &.recognized-icon { background: linear-gradient(135deg, #409eff, #66b1ff); }
        &.success-icon { background: linear-gradient(135deg, #67c23a, #85ce61); }
        &.confidence-icon { background: linear-gradient(135deg, #e6a23c, #f0c060); }
      }

      .stat-info {
        .stat-value {
          font-size: 22px;
          font-weight: 600;
          color: #303133;
          line-height: 1.2;
        }

        .stat-title {
          font-size: 12px;
          color: #909399;
          margin-top: 2px;
        }
      }
    }
  }
}

// Upload Card
.upload-card {
  margin-bottom: 16px;

  .card-header {
    display: flex;
    align-items: center;
    gap: 12px;

    .card-title {
      font-size: 15px;
      font-weight: 600;
      color: #303133;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .card-tip {
      font-size: 12px;
      color: #909399;
    }
  }

  .receipt-uploader {
    :deep(.el-upload) {
      width: 100%;
    }

    :deep(.el-upload-dragger) {
      width: 100%;
      height: 160px;
      border: 2px dashed #dcdfe6;
      border-radius: 8px;
      background: #fafbfc;
      transition: all 0.3s;

      &:hover {
        border-color: #00b8c4;
        background: #f0fafa;
      }
    }

    .upload-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;

      .upload-icon-main {
        font-size: 48px;
        color: #c0c4cc;
        margin-bottom: 8px;
      }

      .upload-text {
        font-size: 14px;
        color: #606266;

        em {
          color: #00b8c4;
          font-style: normal;
        }
      }

      .upload-hint {
        font-size: 12px;
        color: #909399;
        margin-top: 4px;
      }
    }
  }
}

// Thumbnail Grid
.thumbnail-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f2f5;

  .thumbnail-item {
    position: relative;
    width: 100px;
    border-radius: 6px;
    overflow: hidden;
    border: 2px solid #ebeef5;
    transition: all 0.3s;
    cursor: pointer;

    &:hover {
      border-color: #00b8c4;
      box-shadow: 0 2px 8px rgba(0, 190, 190, 0.15);

      .thumbnail-delete {
        opacity: 1;
      }
    }

    &.is-processing {
      border-color: #e6a23c;
    }

    .thumbnail-img {
      width: 100px;
      height: 80px;
      display: block;
    }

    .thumbnail-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100px;
      height: 80px;
      background: rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 24px;
    }

    .thumbnail-badge {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      color: #fff;

      &.success { background: #67c23a; }
      &.error { background: #f56c6c; }
    }

    .thumbnail-name {
      font-size: 11px;
      color: #606266;
      padding: 4px 6px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      background: #fff;
    }

    .thumbnail-delete {
      position: absolute;
      top: 4px;
      left: 4px;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.5);
      color: #fff;
      font-size: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s;
      cursor: pointer;

      &:hover {
        background: #f56c6c;
      }
    }
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spin-icon {
  animation: spin 1s linear infinite;
}

// Result Card
.result-card {
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .card-title {
      font-size: 15px;
      font-weight: 600;
      color: #303133;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .result-summary {
      font-size: 13px;
      color: #909399;
    }
  }

  .table-thumbnail {
    width: 48px;
    height: 36px;
    border-radius: 4px;
    cursor: pointer;
    border: 1px solid #ebeef5;
  }

  .delivery-no {
    font-family: 'Courier New', Courier, monospace;
    font-weight: 600;
    color: #303133;
    letter-spacing: 0.5px;
  }

  .text-muted {
    color: #c0c4cc;
    font-size: 13px;
  }

  .confidence-cell {
    display: flex;
    align-items: center;
    gap: 8px;

    .el-progress {
      flex: 1;
    }

    .confidence-text {
      font-size: 12px;
      font-weight: 600;
      min-width: 36px;
      text-align: right;
    }
  }

  .error-text {
    color: #f56c6c;
    font-size: 12px;
  }
}

// Preview Dialog
.preview-content {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .preview-image {
    width: 100%;
    max-height: 400px;
    border-radius: 8px;
    border: 1px solid #ebeef5;
  }

  .preview-info {
    .delivery-no {
      font-family: 'Courier New', Courier, monospace;
      font-weight: 600;
      color: #303133;
    }

    .text-muted {
      color: #c0c4cc;
    }

    .error-text {
      color: #f56c6c;
    }
  }
}
</style>
