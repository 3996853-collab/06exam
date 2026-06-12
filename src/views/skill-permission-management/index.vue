<template>
  <div class="skill-permission-management">
    <el-card shadow="hover" class="card-container">
      <template #header>
        <div class="card-header">
          <span>SKILL权限管理</span>
          <el-button type="primary" @click="dialogVisible = true">
            新增SKILL
          </el-button>
        </div>
      </template>
      <div class="content">
        <el-table :data="skillList" style="width: 100%">
          <el-table-column prop="name" label="SKILL名称" />
          <el-table-column prop="description" label="SKILL描述" />
          <el-table-column prop="mode" label="模式">
            <template #default="scope">
              <el-tag :type="scope.row.mode === 'quick' ? 'success' : 'warning'">
                {{ scope.row.mode === 'quick' ? '快速模式' : '思考模式' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="roles" label="绑定角色">
            <template #default="scope">
              <el-tag v-for="role in scope.row.roles" :key="role.id" size="small" style="margin-right: 4px">
                {{ role.name }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="priority" label="优先级" />
          <el-table-column prop="status" label="状态">
            <template #default="scope">
              <el-tag :type="scope.row.status ? 'success' : 'danger'">
                {{ scope.row.status ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template #default="scope">
              <el-button type="primary" size="small" @click="editSkill(scope.row)">
                编辑
              </el-button>
              <el-button type="danger" size="small" @click="deleteSkill(scope.row.id)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <!-- 新增/编辑SKILL对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditing ? '编辑SKILL' : '新增SKILL'"
      width="800px"
    >
      <el-form :model="form" label-width="120px">
        <el-form-item label="SKILL名称">
          <el-input v-model="form.name" placeholder="请输入SKILL名称" />
        </el-form-item>
        <el-form-item label="SKILL描述">
          <el-input
            v-model="form.description"
            type="textarea"
            placeholder="请输入SKILL描述"
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="模式选择">
          <el-select v-model="form.mode" placeholder="选择模式">
            <el-option label="快速模式" value="quick" />
            <el-option label="思考模式" value="thinking" />
          </el-select>
        </el-form-item>
        <el-form-item label="绑定角色">
          <el-select v-model="form.roles" multiple placeholder="选择角色">
            <el-option
              v-for="role in roleList"
              :key="role.id"
              :label="role.name"
              :value="role"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-input-number v-model="form.priority" :min="1" :max="10" />
        </el-form-item>
        <el-form-item label="启用状态">
          <el-switch v-model="form.status" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveSkill">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

// 角色列表
const roleList = ref([
  { id: 1, name: '管理员' },
  { id: 2, name: '普通用户' },
  { id: 3, name: '只读用户' },
  { id: 4, name: '运营人员' },
  { id: 5, name: '查看人员' }
])

// SKILL列表
const skillList = ref([
  {
    id: 1,
    name: 'Web搜索',
    description: '使用Web搜索获取实时信息',
    mode: 'quick',
    roles: [
      { id: 1, name: '管理员' },
      { id: 2, name: '普通用户' }
    ],
    priority: 5,
    status: true
  },
  {
    id: 2,
    name: '数据分析',
    description: '对数据进行分析和处理',
    mode: 'thinking',
    roles: [
      { id: 1, name: '管理员' },
      { id: 4, name: '运营人员' }
    ],
    priority: 3,
    status: true
  },
  {
    id: 3,
    name: '文本翻译',
    description: '将文本从一种语言翻译到另一种语言',
    mode: 'quick',
    roles: [
      { id: 1, name: '管理员' },
      { id: 2, name: '普通用户' },
      { id: 5, name: '查看人员' }
    ],
    priority: 4,
    status: false
  }
])

// 对话框状态
const dialogVisible = ref(false)
const isEditing = ref(false)

// 表单数据
const form = reactive({
  id: '',
  name: '',
  description: '',
  mode: 'quick',
  roles: [],
  priority: 5,
  status: true
})

// 打开新增SKILL对话框
const openAddDialog = () => {
  isEditing.value = false
  resetForm()
  dialogVisible.value = true
}

// 打开编辑SKILL对话框
const editSkill = (skill) => {
  isEditing.value = true
  // 深拷贝数据
  form.id = skill.id
  form.name = skill.name
  form.description = skill.description
  form.mode = skill.mode
  form.roles = JSON.parse(JSON.stringify(skill.roles))
  form.priority = skill.priority
  form.status = skill.status
  dialogVisible.value = true
}

// 重置表单
const resetForm = () => {
  form.id = ''
  form.name = ''
  form.description = ''
  form.mode = 'quick'
  form.roles = []
  form.priority = 5
  form.status = true
}

// 保存SKILL
const saveSkill = () => {
  if (isEditing.value) {
    // 编辑现有SKILL
    const index = skillList.value.findIndex(item => item.id === form.id)
    if (index !== -1) {
      skillList.value[index] = { ...form }
    }
  } else {
    // 新增SKILL
    const newSkill = {
      ...form,
      id: skillList.value.length + 1
    }
    skillList.value.push(newSkill)
  }
  dialogVisible.value = false
}

// 删除SKILL
const deleteSkill = (id) => {
  skillList.value = skillList.value.filter(item => item.id !== id)
}
</script>

<style lang="scss" scoped>
.skill-permission-management {
  padding: 20px;
  background-color: rgb(240, 242, 245);
  min-height: 100vh;

  .card-container {
    margin-bottom: 20px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .content {
    margin-top: 20px;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
  }
}
</style>