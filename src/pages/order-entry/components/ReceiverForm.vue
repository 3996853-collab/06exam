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
            <el-autocomplete
              v-model="form.name"
              :fetch-suggestions="queryReceiverHistory"
              placeholder="请输入姓名或选择历史记录"
              @select="handleReceiverSelect"
              style="width: 100%"
            />
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
              <el-option label="江苏省" value="江苏省" />
              <el-option label="浙江省" value="浙江省" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="城市" prop="city">
            <el-select v-model="form.city" placeholder="请选择城市" style="width: 100%">
              <el-option label="北京市" value="北京市" />
              <el-option label="上海市" value="上海市" />
              <el-option label="广州市" value="广州市" />
              <el-option label="深圳市" value="深圳市" />
              <el-option label="杭州市" value="杭州市" />
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
import { ElMessage } from 'element-plus'

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

// 历史记录数据
const receiverHistory = ref([
  { value: '赵六', phone: '13612341234', province: '北京市', city: '北京市', address: '北京市海淀区 xxx 路' },
  { value: '钱七', phone: '13512341234', province: '上海市', city: '上海市', address: '上海市黄浦区 xxx 街' },
  { value: '孙八', phone: '13412341234', province: '广东省', city: '广州市', address: '广州市天河区 xxx 大厦' }
])

const queryReceiverHistory = (queryString, cb) => {
  const results = queryString
    ? receiverHistory.value.filter(createFilter(queryString))
    : receiverHistory.value
  cb(results)
}

const createFilter = (queryString) => {
  return (item) => {
    return item.value.toLowerCase().includes(queryString.toLowerCase())
  }
}

const handleReceiverSelect = (item) => {
  // 自动填充其他字段
  const selectedData = receiverHistory.value.find(h => h.value === item.value)
  if (selectedData) {
    form.phone = selectedData.phone
    form.province = selectedData.province
    form.city = selectedData.city
    form.address = selectedData.address
  }
}

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
  // 解析语音结果，例如："收件人李四，电话 13912341234，地址上海市浦东新区"
  const nameMatch = text.match(/收件人 ([^，,]+)/)
  const phoneMatch = text.match(/电话 ([^，,]+)/)
  const addressMatch = text.match(/地址 ([^，,]+)/)

  if (nameMatch) form.name = nameMatch[1].trim()
  if (phoneMatch) form.phone = phoneMatch[1].trim()
  if (addressMatch) form.address = addressMatch[1].trim()

  ElMessage.success('语音识别成功')
}

defineExpose({
  form,
  formRef,
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
