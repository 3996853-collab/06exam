# 物流运单录单界面实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 创建一个功能完整的物流运单录入界面，支持日常快速录单、语音录入、智能表单、草稿管理和打印导出功能。

**Architecture:** 基于 Vue 3 + Element Plus 构建单页面应用，采用组件化设计，将表单拆分为寄件人、收件人、货物信息、费用信息等模块，支持表单验证、自动填充、暂存草稿等功能。

**Tech Stack:** Vue 3、Element Plus、@element-plus/icons-vue、打印库 print-js、语音识别 Web Speech API

---

## 前置准备

### Task 0: 创建项目结构

**Files:**
- Create: `src/pages/order-entry/`
- Create: `src/pages/order-entry/spec.md`
- Create: `src/pages/order-entry/index.vue`
- Create: `src/pages/order-entry/components/`

**Step 1: 创建目录结构**

```bash
mkdir -p src/pages/order-entry/components
```

**Step 2: 创建需求规格文档**

创建 `src/pages/order-entry/spec.md`，参考 `/Users/houpe/Documents/trae_projects/pro_tool/rules/development-standards.md`

**Step 3: 创建入口文件**

创建 `src/pages/order-entry/index.vue`

**Step 4: 验证结构**

```bash
ls -R src/pages/order-entry/
```

Expected: 显示完整的目录结构

---

## 第一部分：基础布局

### Task 1: 创建录单页面主框架

**Files:**
- Create: `src/pages/order-entry/index.vue`

**Step 1: 编写页面框架**

```vue
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
      <!-- 各表单模块将在这里 -->
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

const formData = ref({})

const saveDraft = () => {
  console.log('保存草稿')
}

const loadDraft = () => {
  console.log('加载草稿')
}

const submitOrder = () => {
  console.log('提交运单')
}

const reset = () => {
  console.log('重置表单')
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
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header-actions {
  display: flex;
  gap: 12px;
}

.form-content {
  background: #fff;
  padding: 24px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.footer-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
```

**Step 2: 测试页面加载**

启动开发服务器，访问录单页面

Expected: 显示空白表单框架

**Step 3: 提交**

```bash
git add src/pages/order-entry/index.vue
git commit -m "feat: 创建录单页面基础框架"
```

---

## 第二部分：寄件人信息模块

### Task 2: 创建寄件人信息表单组件

**Files:**
- Create: `src/pages/order-entry/components/SenderForm.vue`
- Modify: `src/pages/order-entry/index.vue`

**Step 1: 编写组件代码**

```vue
<template>
  <div class="sender-form">
    <div class="section-title">
      <el-icon><User /></el-icon>
      <span>寄件人信息</span>
      <el-button type="primary" size="small" @click="startVoiceInput" class="voice-btn">
        <el-icon><Microphone /></el-icon>
        语音输入
      </el-button>
    </div>

    <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="寄件人" prop="name">
            <el-input v-model="form.name" placeholder="请输入姓名" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="form.phone" placeholder="请输入手机号" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="省份" prop="province">
            <el-select v-model="form.province" placeholder="请选择省份" style="width: 100%">
              <el-option label="北京市" value="北京市" />
              <el-option label="上海市" value="上海市" />
              <el-option label="广东省" value="广东省" />
              <!-- 更多省份 -->
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="城市" prop="city">
            <el-select v-model="form.city" placeholder="请选择城市" style="width: 100%">
              <el-option label="北京市" value="北京市" />
              <el-option label="上海市" value="上海市" />
              <!-- 更多城市 -->
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="24">
          <el-form-item label="详细地址" prop="address">
            <el-input v-model="form.address" type="textarea" :rows="2" placeholder="请输入详细地址" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { User, Microphone } from '@element-plus/icons-vue'

const formRef = ref(null)

const form = reactive({
  name: '',
  phone: '',
  province: '',
  city: '',
  address: ''
})

const rules = {
  name: [{ required: true, message: '请输入寄件人姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  province: [{ required: true, message: '请选择省份', trigger: 'change' }],
  city: [{ required: true, message: '请选择城市', trigger: 'change' }],
  address: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
}

const startVoiceInput = () => {
  // 语音输入逻辑将在 Task 7 实现
  console.log('开始语音输入')
}

defineExpose({
  form,
  validate: () => formRef.value?.validate()
})
</script>

<style scoped>
.sender-form {
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

.voice-btn {
  margin-left: auto;
}
</style>
```

**Step 2: 集成到主页面**

修改 `src/pages/order-entry/index.vue`，导入并使用组件

**Step 3: 测试表单验证**

```bash
# 启动开发服务器
npm run dev
```

Expected: 表单验证正常工作

**Step 4: 提交**

```bash
git add src/pages/order-entry/components/SenderForm.vue src/pages/order-entry/index.vue
git commit -m "feat: 添加寄件人信息表单组件"
```

---

## 第三部分：收件人信息模块

### Task 3: 创建收件人信息表单组件

**Files:**
- Create: `src/pages/order-entry/components/ReceiverForm.vue`
- Modify: `src/pages/order-entry/index.vue`

**Step 1: 编写组件代码**

```vue
<template>
  <div class="receiver-form">
    <div class="section-title">
      <el-icon><UserFilled /></el-icon>
      <span>收件人信息</span>
      <el-button type="primary" size="small" @click="startVoiceInput" class="voice-btn">
        <el-icon><Microphone /></el-icon>
        语音输入
      </el-button>
    </div>

    <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="收件人" prop="name">
            <el-input v-model="form.name" placeholder="请输入姓名" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="form.phone" placeholder="请输入手机号" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="省份" prop="province">
            <el-select v-model="form.province" placeholder="请选择省份" style="width: 100%">
              <el-option label="北京市" value="北京市" />
              <el-option label="上海市" value="上海市" />
              <el-option label="广东省" value="广东省" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="城市" prop="city">
            <el-select v-model="form.city" placeholder="请选择城市" style="width: 100%">
              <el-option label="北京市" value="北京市" />
              <el-option label="上海市" value="上海市" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="24">
          <el-form-item label="详细地址" prop="address">
            <el-input v-model="form.address" type="textarea" :rows="2" placeholder="请输入详细地址" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { UserFilled, Microphone } from '@element-plus/icons-vue'

const formRef = ref(null)

const form = reactive({
  name: '',
  phone: '',
  province: '',
  city: '',
  address: ''
})

const rules = {
  name: [{ required: true, message: '请输入收件人姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  province: [{ required: true, message: '请选择省份', trigger: 'change' }],
  city: [{ required: true, message: '请选择城市', trigger: 'change' }],
  address: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
}

const startVoiceInput = () => {
  console.log('开始语音输入')
}

defineExpose({
  form,
  validate: () => formRef.value?.validate()
})
</script>

<style scoped>
.receiver-form {
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

.voice-btn {
  margin-left: auto;
}
</style>
```

**Step 2: 集成到主页面**

**Step 3: 测试**

Expected: 收件人表单显示正常

**Step 4: 提交**

```bash
git add src/pages/order-entry/components/ReceiverForm.vue
git commit -m "feat: 添加收件人信息表单组件"
```

---

## 第四部分：货物信息模块

### Task 4: 创建货物信息表单组件

**Files:**
- Create: `src/pages/order-entry/components/CargoForm.vue`

**Step 1: 编写组件代码**

```vue
<template>
  <div class="cargo-form">
    <div class="section-title">
      <el-icon><Box /></el-icon>
      <span>货物信息</span>
    </div>

    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <el-row :gutter="16">
        <el-col :span="8">
          <el-form-item label="货物名称" prop="name">
            <el-input v-model="form.name" placeholder="请输入货物名称" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="货物类型" prop="type">
            <el-select v-model="form.type" placeholder="请选择类型" style="width: 100%">
              <el-option label="普通货物" value="normal" />
              <el-option label="冷链货物" value="cold" />
              <el-option label="生鲜食品" value="fresh" />
              <el-option label="医药用品" value="medicine" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="包装方式" prop="package">
            <el-select v-model="form.package" placeholder="请选择包装" style="width: 100%">
              <el-option label="纸箱" value="carton" />
              <el-option label="木箱" value="wooden" />
              <el-option label="泡沫箱" value="foam" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="8">
          <el-form-item label="重量 (kg)" prop="weight">
            <el-input-number v-model="form.weight" :min="0" :precision="2" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="体积 (m³)" prop="volume">
            <el-input-number v-model="form.volume" :min="0" :precision="3" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="件数" prop="pieces">
            <el-input-number v-model="form.pieces" :min="1" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="24">
          <el-form-item label="货物说明" prop="description">
            <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入货物详细说明" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Box } from '@element-plus/icons-vue'

const formRef = ref(null)

const form = reactive({
  name: '',
  type: '',
  package: '',
  weight: 0,
  volume: 0,
  pieces: 1,
  description: ''
})

const rules = {
  name: [{ required: true, message: '请输入货物名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择货物类型', trigger: 'change' }],
  weight: [{ required: true, message: '请输入重量', trigger: 'blur' }],
  pieces: [{ required: true, message: '请输入件数', trigger: 'blur' }]
}

defineExpose({
  form,
  validate: () => formRef.value?.validate()
})
</script>

<style scoped>
.cargo-form {
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
</style>
```

**Step 2: 集成到主页面**

**Step 3: 测试**

Expected: 货物信息表单显示正常

**Step 4: 提交**

```bash
git add src/pages/order-entry/components/CargoForm.vue
git commit -m "feat: 添加货物信息表单组件"
```

---

## 第五部分：费用信息模块

### Task 5: 创建费用信息表单组件

**Files:**
- Create: `src/pages/order-entry/components/FeeForm.vue`

**Step 1: 编写组件代码**

```vue
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
  form
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
```

**Step 2: 集成到主页面**

**Step 3: 测试费用计算**

Expected: 总费用自动计算

**Step 4: 提交**

```bash
git add src/pages/order-entry/components/FeeForm.vue
git commit -m "feat: 添加费用信息表单组件"
```

---

## 第六部分：智能表单功能

### Task 6: 实现智能表单功能

**Files:**
- Modify: `src/pages/order-entry/components/SenderForm.vue`
- Modify: `src/pages/order-entry/components/ReceiverForm.vue`

**Step 1: 添加自动填充功能**

在组件中添加历史记录下拉选择

```vue
<el-form-item label="寄件人" prop="name">
  <el-autocomplete
    v-model="form.name"
    :fetch-suggestions="querySenderHistory"
    placeholder="请输入姓名或选择历史记录"
    @select="handleSenderSelect"
  />
</el-form-item>
```

**Step 2: 实现历史记录查询**

```javascript
const senderHistory = ref([
  { value: '张三' },
  { value: '李四' },
  { value: '王五' }
])

const querySenderHistory = (queryString, cb) => {
  const results = queryString
    ? senderHistory.value.filter(createFilter(queryString))
    : senderHistory.value
  cb(results)
}

const createFilter = (queryString) => {
  return (restaurant) => {
    return restaurant.value.toLowerCase().includes(queryString.toLowerCase())
  }
}

const handleSenderSelect = (item) => {
  // 自动填充其他字段
  form.phone = '138****1234'
  form.province = '北京市'
  form.city = '北京市'
  form.address = '***'
}
```

**Step 3: 测试智能提示**

Expected: 输入时显示历史记录

**Step 4: 提交**

```bash
git add src/pages/order-entry/components/SenderForm.vue
git commit -m "feat: 添加智能表单自动填充功能"
```

---

## 第七部分：语音录入功能

### Task 7: 实现语音录入功能

**Files:**
- Modify: `src/pages/order-entry/components/SenderForm.vue`
- Modify: `src/pages/order-entry/components/ReceiverForm.vue`

**Step 1: 实现语音识别**

```javascript
const startVoiceInput = () => {
  if (!('webkitSpeechRecognition' in window)) {
    ElMessage.error('您的浏览器不支持语音识别')
    return
  }

  const recognition = new webkitSpeechRecognition()
  recognition.lang = 'zh-CN'
  recognition.continuous = false
  recognition.interimResults = false

  recognition.onstart = () => {
    ElMessage.info('请开始说话...')
  }

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript
    parseVoiceResult(transcript)
  }

  recognition.onerror = (event) => {
    ElMessage.error('语音识别失败：' + event.error)
  }

  recognition.start()
}

const parseVoiceResult = (text) => {
  // 解析语音结果，例如："寄件人张三，电话 13812341234，地址北京市朝阳区"
  const nameMatch = text.match(/寄件人 ([^，,]+)/)
  const phoneMatch = text.match(/电话 ([^，,]+)/)
  const addressMatch = text.match(/地址 ([^，,]+)/)

  if (nameMatch) form.name = nameMatch[1]
  if (phoneMatch) form.phone = phoneMatch[1]
  if (addressMatch) form.address = addressMatch[1]

  ElMessage.success('语音识别成功')
}
```

**Step 2: 添加语音输入提示**

```vue
<el-tooltip content="说出"寄件人姓名，电话号码，地址"即可自动填充">
  <el-button type="primary" size="small" @click="startVoiceInput" class="voice-btn">
    <el-icon><Microphone /></el-icon>
    语音输入
  </el-button>
</el-tooltip>
```

**Step 3: 测试语音识别**

Expected: 语音输入能正确解析并填充表单

**Step 4: 提交**

```bash
git add src/pages/order-entry/components/SenderForm.vue
git commit -m "feat: 添加语音录入功能"
```

---

## 第八部分：草稿管理功能

### Task 8: 实现草稿管理功能

**Files:**
- Modify: `src/pages/order-entry/index.vue`
- Create: `src/pages/order-entry/utils/draftManager.js`

**Step 1: 创建草稿管理工具**

```javascript
// src/pages/order-entry/utils/draftManager.js

const DRAFT_KEY = 'order_entry_draft'

export function saveDraft(data) {
  const drafts = JSON.parse(localStorage.getItem(DRAFT_KEY) || '[]')
  const draft = {
    id: Date.now(),
    data,
    createdAt: new Date().toISOString()
  }
  drafts.unshift(draft)
  localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts.slice(0, 10))) // 只保留最近 10 条
  return draft
}

export function loadDrafts() {
  return JSON.parse(localStorage.getItem(DRAFT_KEY) || '[]')
}

export function deleteDraft(id) {
  const drafts = JSON.parse(localStorage.getItem(DRAFT_KEY) || '[]')
  const filtered = drafts.filter(d => d.id !== id)
  localStorage.setItem(DRAFT_KEY, JSON.stringify(filtered))
}
```

**Step 2: 集成到主页面**

```javascript
import { saveDraft, loadDrafts, deleteDraft } from './utils/draftManager'

const saveDraftHandler = () => {
  const formData = collectFormData()
  const draft = saveDraft(formData)
  ElMessage.success('草稿已保存')
}

const loadDraftHandler = () => {
  const drafts = loadDrafts()
  // 显示草稿列表对话框
  showDraftDialog(drafts)
}
```

**Step 3: 创建草稿列表对话框**

```vue
<el-dialog v-model="draftDialogVisible" title="选择草稿">
  <el-table :data="drafts">
    <el-table-column prop="createdAt" label="保存时间" />
    <el-table-column label="操作">
      <template #default="{ row }">
        <el-button size="small" @click="loadDraft(row)">加载</el-button>
        <el-button size="small" type="danger" @click="deleteDraft(row.id)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>
</el-dialog>
```

**Step 4: 测试草稿功能**

Expected: 保存和加载草稿正常工作

**Step 5: 提交**

```bash
git add src/pages/order-entry/utils/draftManager.js src/pages/order-entry/index.vue
git commit -m "feat: 添加草稿管理功能"
```

---

## 第九部分：打印导出功能

### Task 9: 实现打印功能

**Files:**
- Modify: `src/pages/order-entry/index.vue`
- Create: `src/pages/order-entry/components/OrderPrint.vue`

**Step 1: 安装打印库**

```bash
npm install print-js
```

**Step 2: 创建打印组件**

```vue
<template>
  <div class="order-print" id="orderPrint">
    <div class="print-header">
      <h1>中通冷链 - 物流运单</h1>
      <div class="order-no">运单号：{{ orderNo }}</div>
    </div>

    <div class="print-content">
      <div class="print-section">
        <h3>寄件人信息</h3>
        <p>姓名：{{ sender.name }}</p>
        <p>电话：{{ sender.phone }}</p>
        <p>地址：{{ sender.province }}{{ sender.city }}{{ sender.address }}</p>
      </div>

      <div class="print-section">
        <h3>收件人信息</h3>
        <p>姓名：{{ receiver.name }}</p>
        <p>电话：{{ receiver.phone }}</p>
        <p>地址：{{ receiver.province }}{{ receiver.city }}{{ receiver.address }}</p>
      </div>

      <div class="print-section">
        <h3>货物信息</h3>
        <p>名称：{{ cargo.name }}</p>
        <p>类型：{{ cargo.type }}</p>
        <p>重量：{{ cargo.weight }}kg</p>
        <p>件数：{{ cargo.pieces }}</p>
      </div>

      <div class="print-section">
        <h3>费用信息</h3>
        <p>运费：¥{{ fee.shippingFee }}</p>
        <p>总费用：¥{{ fee.total }}</p>
        <p>付款方式：{{ fee.paymentType }}</p>
      </div>
    </div>

    <div class="print-footer">
      <p>打印时间：{{ printTime }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  orderData: Object
})

const orderNo = computed(() => props.orderData?.orderNo || '待生成')
const sender = computed(() => props.orderData?.sender || {})
const receiver = computed(() => props.orderData?.receiver || {})
const cargo = computed(() => props.orderData?.cargo || {})
const fee = computed(() => props.orderData?.fee || {})
const printTime = computed(() => new Date().toLocaleString())
</script>

<style scoped>
.order-print {
  padding: 20px;
  background: #fff;
}

.print-header {
  text-align: center;
  border-bottom: 2px solid #002140;
  padding-bottom: 16px;
  margin-bottom: 24px;
}

.print-section {
  margin-bottom: 20px;
  padding: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.print-section h3 {
  margin: 0 0 12px 0;
  color: #002140;
}
</style>
```

**Step 3: 实现打印功能**

```javascript
import printJS from 'print-js'

const printOrder = () => {
  const orderData = collectFormData()
  // 生成运单号
  orderData.orderNo = generateOrderNo()

  // 使用 print-js 打印
  printJS({
    printable: 'orderPrint',
    type: 'html',
    targetStyles: ['*'],
    css: ['path/to/print-styles.css']
  })
}
```

**Step 4: 测试打印**

Expected: 点击打印按钮能正确显示打印预览

**Step 5: 提交**

```bash
git add src/pages/order-entry/components/OrderPrint.vue src/pages/order-entry/index.vue
git commit -m "feat: 添加打印功能"
```

---

## 第十部分：集成与测试

### Task 10: 完整集成测试

**Files:**
- Modify: `src/pages/order-entry/index.vue`

**Step 1: 集成所有组件**

```vue
<template>
  <div class="order-entry-page">
    <div class="page-header">
      <h2>物流运单录入</h2>
      <div class="header-actions">
        <el-button @click="saveDraft">保存草稿</el-button>
        <el-button @click="loadDraft">加载草稿</el-button>
        <el-button type="primary" @click="submitOrder">提交运单</el-button>
      </div>
    </div>

    <div class="form-content">
      <SenderForm ref="senderRef" />
      <ReceiverForm ref="receiverRef" />
      <CargoForm ref="cargoRef" />
      <FeeForm ref="feeRef" />
    </div>

    <div class="footer-actions">
      <el-button @click="reset">重置</el-button>
      <el-button @click="printOrder">打印</el-button>
      <el-button type="primary" @click="submitOrder">提交</el-button>
    </div>

    <!-- 打印组件 -->
    <OrderPrint ref="printRef" :order-data="orderData" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SenderForm from './components/SenderForm.vue'
import ReceiverForm from './components/ReceiverForm.vue'
import CargoForm from './components/CargoForm.vue'
import FeeForm from './components/FeeForm.vue'
import OrderPrint from './components/OrderPrint.vue'

const senderRef = ref(null)
const receiverRef = ref(null)
const cargoRef = ref(null)
const feeRef = ref(null)
const printRef = ref(null)
const orderData = ref({})

const collectFormData = () => {
  return {
    sender: senderRef.value?.form,
    receiver: receiverRef.value?.form,
    cargo: cargoRef.value?.form,
    fee: feeRef.value?.form
  }
}

const submitOrder = async () => {
  // 验证所有表单
  await senderRef.value?.validate()
  await receiverRef.value?.validate()
  await cargoRef.value?.validate()

  orderData.value = collectFormData()
  console.log('提交运单:', orderData.value)
}

const reset = () => {
  senderRef.value?.formRef?.resetFields()
  receiverRef.value?.formRef?.resetFields()
  cargoRef.value?.formRef?.resetFields()
  feeRef.value?.formRef?.resetFields()
}

const printOrder = () => {
  orderData.value = collectFormData()
  printRef.value?.print()
}

const saveDraft = () => {
  orderData.value = collectFormData()
  console.log('保存草稿:', orderData.value)
}

const loadDraft = () => {
  console.log('加载草稿')
}
</script>
```

**Step 2: 完整测试**

```bash
npm run dev
```

测试所有功能：
- 表单填写和验证
- 智能提示和自动填充
- 语音录入
- 草稿保存和加载
- 打印功能

**Step 3: 提交最终版本**

```bash
git add .
git commit -m "feat: 完成物流运单录单界面"
```

---

## 测试清单

- [ ] 所有表单字段验证正常
- [ ] 智能提示和自动填充工作正常
- [ ] 语音录入能正确解析
- [ ] 草稿保存和加载正常
- [ ] 打印功能正常
- [ ] 响应式布局适配
- [ ] 表单提交数据正确

---

## 后续优化

1. 添加运单号自动生成规则
2. 集成真实的地址选择组件
3. 添加运费自动计算逻辑
4. 集成后端 API
5. 添加批量录单功能
6. 添加扫码录入功能

---

Plan complete and saved to `docs/plans/2026-03-04-logistics-order-entry.md`. Two execution options:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
