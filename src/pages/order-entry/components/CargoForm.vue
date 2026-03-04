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
  formRef,
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
