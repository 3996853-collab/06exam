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
          type="success"
          size="small"
          :loading="isSubmittingDb"
          :disabled="results.length === 0"
          @click="handleSubmitToDatabase"
        >
          <el-icon v-if="!isSubmittingDb"><CircleCheckFilled /></el-icon>
          提交入库
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

    <!-- Side-by-Side Upload & Preview Area -->
    <el-card shadow="never" class="upload-split-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">
            <el-icon><Picture /></el-icon>
            回单照片上传与预览
          </span>
          <span class="card-tip">支持 JPG、PNG 格式，左侧点击或拖拽上传，右侧即时查看所选回单与识别详情</span>
        </div>
      </template>

      <div class="split-container">
        <!-- Left: Compact Upload & Thumbnail List -->
        <div class="split-left">
          <el-upload
            ref="uploadRef"
            class="compact-uploader"
            drag
            multiple
            :auto-upload="false"
            :show-file-list="false"
            accept=".jpg,.jpeg,.png"
            :on-change="handleFileChange"
          >
            <div class="compact-upload-content">
              <el-icon class="compact-upload-icon"><UploadFilled /></el-icon>
              <div class="compact-upload-text">点击或拖拽回单到此处上传</div>
              <div class="compact-upload-hint">支持 JPG / PNG，单张不超过 10MB</div>
            </div>
          </el-upload>

          <!-- Uploaded file queue/thumbnail list -->
          <div class="file-list-header" v-if="uploadedFiles.length > 0">
            <span class="list-title">已选回单列表 ({{ uploadedFiles.length }})</span>
            <span class="list-hint">点击可切换右侧预览</span>
          </div>
          <div v-if="uploadedFiles.length > 0" class="compact-thumbnail-grid">
            <div
              v-for="(file, index) in uploadedFiles"
              :key="file.uid"
              class="compact-thumbnail-item"
              :class="{
                'is-active': activePreviewFile?.uid === file.uid,
                'is-processing': file.status === 'processing'
              }"
              @click="handleSelectPreviewFile(file)"
            >
              <el-image
                :src="file.url"
                fit="cover"
                class="thumb-img"
              />
              <div v-if="file.status === 'processing'" class="thumb-overlay">
                <el-icon class="spin-icon"><Loading /></el-icon>
              </div>
              <div v-if="file.status === 'success'" class="thumb-badge success" title="识别成功">
                <el-icon><Select /></el-icon>
              </div>
              <div v-else-if="file.status === 'manual'" class="thumb-badge manual" title="已人工补录">
                <el-icon><EditPen /></el-icon>
              </div>
              <div v-else-if="file.status === 'error'" class="thumb-badge error" title="识别失败/待补录">
                <el-icon><CloseBold /></el-icon>
              </div>
              <div class="thumb-title">{{ file.name }}</div>
              <el-icon class="thumb-delete" title="删除" @click.stop="handleRemoveFile(index)"><Close /></el-icon>
            </div>
          </div>
          <div v-else class="empty-upload-tip">
            暂无上传回单照片，请点击或拖入照片开始
          </div>
        </div>

        <!-- Right: Real-time Photo & OCR Detail Preview -->
        <div class="split-right">
          <div class="preview-header">
            <span class="preview-title">
              <el-icon><View /></el-icon>
              照片预览与核对
            </span>
            <div class="preview-quick-actions" v-if="activePreviewResult">
              <el-button
                link
                type="warning"
                size="small"
                @click="handleOpenManualEdit(activePreviewResult, getResultIndex(activePreviewResult))"
              >
                <el-icon><EditPen /></el-icon> 快捷补录
              </el-button>
            </div>
          </div>

          <div v-if="activePreviewFile" class="preview-body">
            <div class="preview-image-wrapper">
              <el-image
                :src="activePreviewFile.url"
                fit="contain"
                class="main-preview-img"
                :preview-src-list="[activePreviewFile.url]"
                preview-teleported
              />
            </div>
            <div class="preview-meta-card">
              <div class="meta-row">
                <span class="meta-label">文件名：</span>
                <span class="meta-value">{{ activePreviewFile.name }}</span>
              </div>
              <div class="meta-row" v-if="activePreviewResult">
                <span class="meta-label">单号(右下二维码)：</span>
                <span class="meta-value delivery-tag" v-if="activePreviewResult.deliveryNo">
                  {{ activePreviewResult.deliveryNo }}
                </span>
                <el-tag v-else type="danger" size="small">未识别出单号</el-tag>
              </div>
              <div class="meta-row" v-if="activePreviewResult">
                <span class="meta-label">签收日期：</span>
                <span class="meta-value" v-if="activePreviewResult.signDate">
                  {{ activePreviewResult.signDate }}
                </span>
                <el-tag v-else type="danger" size="small">缺失日期</el-tag>
              </div>
              <div class="meta-row" v-if="activePreviewResult">
                <span class="meta-label">签收打卡时间：</span>
                <span class="meta-value" v-if="activePreviewResult.signTime">
                  {{ activePreviewResult.signTime }}
                </span>
                <el-tag v-else type="danger" size="small">缺失时间</el-tag>
              </div>
              <div class="meta-row" v-if="activePreviewResult?.errorMessage">
                <span class="meta-label">状态提示：</span>
                <span class="error-inline">{{ activePreviewResult.errorMessage }}</span>
              </div>
            </div>
          </div>

          <div v-else class="preview-placeholder">
            <el-icon :size="56" class="placeholder-icon"><Picture /></el-icon>
            <div class="placeholder-text">暂无选中预览</div>
            <div class="placeholder-subtext">在左侧上传照片后，即可在此处实时查看大图及识别字段</div>
          </div>
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
          <div class="card-header-right">
            <span class="result-summary" v-if="results.length > 0">
              共 {{ results.length }} 条结果
            </span>
            <el-button
              type="success"
              size="small"
              :loading="isSubmittingDb"
              :disabled="results.length === 0"
              @click="handleSubmitToDatabase"
            >
              <el-icon v-if="!isSubmittingDb"><CircleCheckFilled /></el-icon>
              提交校验入库
            </el-button>
          </div>
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
        <el-table-column prop="deliveryNo" label="单号(右下二维码/出库单号)" min-width="190">
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
        <el-form-item label="单号(右下二维码)" required>
          <el-input
            v-model="manualForm.deliveryNo"
            placeholder="请输入右下二维码或出库单号 (如 CK202609040001)"
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
            <el-descriptions-item label="单号(右下二维码)">
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
const isSubmittingDb = ref(false)
const activePreviewFile = ref<UploadedFile | null>(null)
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

// 当前选中预览文件对应的 OCR 识别结果
const activePreviewResult = computed(() => {
  if (!activePreviewFile.value) return null
  return results.value.find(r => r.fileUid === activePreviewFile.value?.uid) || null
})

function getResultIndex(res: OcrResult | null): number {
  if (!res) return -1
  return results.value.findIndex(r => r.fileUid === res.fileUid)
}

function handleSelectPreviewFile(file: UploadedFile) {
  activePreviewFile.value = file
}

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
  const newUploaded: UploadedFile = {
    uid: file.uid as number,
    name: file.name,
    url,
    raw: file.raw,
    status: 'pending'
  }
  uploadedFiles.value.push(newUploaded)

  // 默认选中第一张或最新上传的照片作为右侧预览
  if (!activePreviewFile.value) {
    activePreviewFile.value = newUploaded
  }
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

  // 若删除的是当前预览，切换到新的第一个文件或置空
  if (activePreviewFile.value?.uid === file.uid) {
    activePreviewFile.value = uploadedFiles.value.length > 0 ? uploadedFiles.value[0] : null
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
  activePreviewFile.value = null
  ElMessage.success('已清空')
}

// ---------- 提交校验与入库存储 ----------
async function handleSubmitToDatabase() {
  if (results.value.length === 0) {
    ElMessage.warning('当前暂无任何识别或补录结果')
    return
  }

  // 1. 严格校验送货单号、签收日期与签收时间是否完整
  const incompleteItems: Array<{ index: number; name: string; missing: string[] }> = []

  results.value.forEach((r, idx) => {
    const missing: string[] = []
    if (!r.deliveryNo || !r.deliveryNo.trim()) {
      missing.push('送货单号')
    }
    if (!r.signDate) {
      missing.push('签收日期')
    }
    if (!r.signTime) {
      missing.push('签收时间')
    }

    if (missing.length > 0) {
      incompleteItems.push({
        index: idx + 1,
        name: r.fileName,
        missing
      })
    }
  })

  // 若存在不完整信息，阻断提交并弹出明确补录提醒
  if (incompleteItems.length > 0) {
    const detailListHtml = incompleteItems
      .slice(0, 5)
      .map(
        item =>
          `<li style="margin-bottom: 4px;"><strong>第 ${item.index} 条 (${item.name})</strong>：缺少 <span style="color: #f56c6c; font-weight: bold;">${item.missing.join('、')}</span></li>`
      )
      .join('')

    const moreText = incompleteItems.length > 5 ? `<div style="margin-top: 4px; color: #909399;">...等共 ${incompleteItems.length} 条数据不完整</div>` : ''

    ElMessageBox.alert(
      `<div style="line-height: 1.6;">
        <p style="margin-bottom: 8px; color: #e6a23c; font-weight: bold;">发现 ${incompleteItems.length} 条回单信息不完整，无法直接入库：</p>
        <ul style="padding-left: 20px; font-size: 13px; color: #606266;">
          ${detailListHtml}
        </ul>
        ${moreText}
        <p style="margin-top: 10px; color: #00b8c4;">请点击表格对应行右侧的「补录」按钮补充完整（送货单号、签收日期、签收时间）后再行提交！</p>
      </div>`,
      '信息不完整提醒',
      {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '我知道了',
        type: 'warning'
      }
    )
    return
  }

  // 2. 确认全部完整，提交存储到数据库
  try {
    await ElMessageBox.confirm(
      `共检测到 ${results.value.length} 条完整回单数据（单号、日期、时间均已齐全），确定校验无误并立即存储到数据库中吗？`,
      '确认提交入库',
      {
        confirmButtonText: '确认存储',
        cancelButtonText: '取消',
        type: 'success'
      }
    )
  } catch {
    return
  }

  isSubmittingDb.value = true
  try {
    const payload = {
      items: results.value.map(r => ({
        record_id: r.recordId || null,
        delivery_no: r.deliveryNo!.trim(),
        sign_date: r.signDate,
        sign_time: r.signTime,
        raw_file_name: r.fileName,
        image_url: r.thumbnailUrl || '',
        confidence: r.confidence || 1.0
      })),
      operator: 'operator_ui'
    }

    const response = await fetch('/api/v1/pod/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.detail || '提交入库接口异常')
    }

    const resData = await response.json()

    // 更新各条记录的状态与回填 record_id
    if (resData.record_ids && Array.isArray(resData.record_ids)) {
      resData.record_ids.forEach((id: number, idx: number) => {
        if (results.value[idx]) {
          results.value[idx].recordId = id
          results.value[idx].status = 'success'
        }
      })
    }

    ElMessage.success(resData.message || `成功存储 ${results.value.length} 条回单信息到数据库！`)
  } catch (error: any) {
    ElMessage.error(`入库存储失败: ${error.message || '网络异常'}`)
  } finally {
    isSubmittingDb.value = false
  }
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

// Side-by-Side Upload & Preview Card
.upload-split-card {
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

  .split-container {
    display: flex;
    gap: 20px;
    align-items: stretch;
    min-height: 290px;

    @media (max-width: 992px) {
      flex-direction: column;
    }
  }

  // Left column: compact upload + thumbnails
  .split-left {
    flex: 0 0 380px;
    width: 380px;
    display: flex;
    flex-direction: column;
    border-right: 1px solid #ebeef5;
    padding-right: 20px;

    @media (max-width: 992px) {
      flex: 1 1 auto;
      width: 100%;
      border-right: none;
      border-bottom: 1px solid #ebeef5;
      padding-right: 0;
      padding-bottom: 16px;
    }

    .compact-uploader {
      :deep(.el-upload) {
        width: 100%;
      }

      :deep(.el-upload-dragger) {
        width: 100%;
        height: 100px;
        padding: 8px 12px;
        border: 2px dashed #dcdfe6;
        border-radius: 8px;
        background: #fafbfc;
        transition: all 0.3s;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
          border-color: #00b8c4;
          background: #f0fafa;
        }
      }

      .compact-upload-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        .compact-upload-icon {
          font-size: 28px;
          color: #00b8c4;
          margin-bottom: 4px;
        }

        .compact-upload-text {
          font-size: 13px;
          font-weight: 500;
          color: #404245;
        }

        .compact-upload-hint {
          font-size: 11px;
          color: #909399;
          margin-top: 2px;
        }
      }
    }

    .file-list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 12px;
      margin-bottom: 8px;

      .list-title {
        font-size: 13px;
        font-weight: 600;
        color: #303133;
      }

      .list-hint {
        font-size: 11px;
        color: #909399;
      }
    }

    .compact-thumbnail-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      max-height: 180px;
      overflow-y: auto;
      padding-right: 4px;

      .compact-thumbnail-item {
        position: relative;
        border-radius: 6px;
        overflow: hidden;
        border: 2px solid #ebeef5;
        background: #fff;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          border-color: #00b8c4;
          box-shadow: 0 2px 8px rgba(0, 190, 190, 0.2);

          .thumb-delete {
            opacity: 1;
          }
        }

        &.is-active {
          border-color: #00b8c4;
          box-shadow: 0 0 0 1px #00b8c4, 0 2px 8px rgba(0, 190, 190, 0.25);
        }

        &.is-processing {
          border-color: #e6a23c;
        }

        .thumb-img {
          width: 100%;
          height: 60px;
          display: block;
        }

        .thumb-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 60px;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 18px;
        }

        .thumb-badge {
          position: absolute;
          top: 3px;
          right: 3px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          color: #fff;

          &.success { background: #67c23a; }
          &.manual { background: #00b8c4; }
          &.error { background: #f56c6c; }
        }

        .thumb-title {
          font-size: 10px;
          color: #606266;
          padding: 2px 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          background: #fafafa;
          line-height: 1.3;
        }

        .thumb-delete {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.5);
          color: #fff;
          font-size: 9px;
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

    .empty-upload-tip {
      margin-top: 14px;
      padding: 16px;
      text-align: center;
      font-size: 12px;
      color: #909399;
      background: #f8fafc;
      border-radius: 6px;
      border: 1px dashed #e4e7ed;
    }
  }

  // Right column: Large preview + details
  .split-right {
    flex: 1 1 auto;
    min-width: 0;
    display: flex;
    flex-direction: column;

    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;

      .preview-title {
        font-size: 13px;
        font-weight: 600;
        color: #303133;
        display: flex;
        align-items: center;
        gap: 6px;
      }
    }

    .preview-body {
      display: flex;
      gap: 16px;
      align-items: flex-start;
      background: #f8fafc;
      border: 1px solid #ebeef5;
      border-radius: 8px;
      padding: 12px;
      flex: 1;

      @media (max-width: 768px) {
        flex-direction: column;
      }

      .preview-image-wrapper {
        flex: 0 0 240px;
        width: 240px;
        height: 220px;
        background: #fff;
        border-radius: 6px;
        border: 1px solid #e4e7ed;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;

        .main-preview-img {
          max-width: 100%;
          max-height: 100%;
          cursor: pointer;
        }
      }

      .preview-meta-card {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 10px;
        background: #fff;
        border-radius: 6px;
        padding: 12px 14px;
        border: 1px solid #e4e7ed;

        .meta-row {
          display: flex;
          align-items: center;
          font-size: 13px;
          line-height: 1.5;

          .meta-label {
            width: 130px;
            color: #606266;
            font-weight: 500;
            flex-shrink: 0;
          }

          .meta-value {
            color: #303133;
            font-weight: 600;
            word-break: break-all;

            &.delivery-tag {
              font-family: 'Courier New', Courier, monospace;
              color: #00b8c4;
              font-size: 14px;
              background: #e6f7ff;
              padding: 2px 6px;
              border-radius: 4px;
              border: 1px solid #b5f5ec;
            }
          }

          .error-inline {
            color: #f56c6c;
            font-size: 12px;
          }
        }
      }
    }

    .preview-placeholder {
      flex: 1;
      min-height: 220px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #fcfcfc;
      border: 1px dashed #dcdfe6;
      border-radius: 8px;
      padding: 24px;

      .placeholder-icon {
        color: #dcdfe6;
        margin-bottom: 10px;
      }

      .placeholder-text {
        font-size: 14px;
        font-weight: 600;
        color: #909399;
        margin-bottom: 4px;
      }

      .placeholder-subtext {
        font-size: 12px;
        color: #c0c4cc;
        text-align: center;
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

    .card-header-right {
      display: flex;
      align-items: center;
      gap: 12px;
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
