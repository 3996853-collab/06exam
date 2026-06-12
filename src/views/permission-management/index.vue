<template>
  <div class="permission-management">
    <el-card shadow="hover" class="card-container">
      <template #header>
        <div class="card-header">
          <span>权限管理</span>
        </div>
      </template>
      <div class="content">
        <div class="role-mapping-section">
          <h3>角色映射</h3>
          <div class="mapping-container">
            <!-- 系统A角色选择 -->
            <div class="system-section">
              <h4>系统A角色</h4>
              <el-select v-model="selectedSystemARole" placeholder="选择角色" class="role-select">
                <el-option
                  v-for="role in systemARoles"
                  :key="role.id"
                  :label="role.name"
                  :value="role.id"
                />
              </el-select>
              <div class="role-list">
                <el-tree
                  v-if="selectedSystemARole"
                  :data="systemARolePermissions"
                  node-key="id"
                  show-checkbox
                  default-expand-all
                  @check="handleSystemAPermissionCheck"
                />
              </div>
            </div>
            
            <!-- 映射按钮 -->
            <div class="mapping-controls">
              <el-button type="primary" @click="mapRoles" :disabled="!selectedSystemARole || !selectedSystemBRole">
                映射
              </el-button>
            </div>
            
            <!-- 系统B角色选择 -->
            <div class="system-section">
              <h4>系统B角色</h4>
              <el-select v-model="selectedSystemBRole" placeholder="选择角色" class="role-select">
                <el-option
                  v-for="role in systemBRoles"
                  :key="role.id"
                  :label="role.name"
                  :value="role.id"
                />
              </el-select>
              <div class="role-list">
                <el-tree
                  v-if="selectedSystemBRole"
                  :data="systemBRolePermissions"
                  node-key="id"
                  show-checkbox
                  default-expand-all
                  @check="handleSystemBPermissionCheck"
                />
              </div>
            </div>
          </div>
        </div>
        
        <!-- 映射列表 -->
        <div class="mapping-list-section">
          <h3>现有映射关系</h3>
          <el-table :data="mappingList" style="width: 100%">
            <el-table-column prop="systemARole" label="系统A角色" />
            <el-table-column prop="systemBRole" label="系统B角色" />
            <el-table-column label="操作">
              <template #default="scope">
                <el-button type="danger" size="small" @click="deleteMapping(scope.row.id)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

// 系统A角色列表
const systemARoles = ref([
  { id: 1, name: '管理员' },
  { id: 2, name: '普通用户' },
  { id: 3, name: '只读用户' }
])

// 系统B角色列表
const systemBRoles = ref([
  { id: 1, name: '超级管理员' },
  { id: 2, name: '运营人员' },
  { id: 3, name: '查看人员' }
])

// 选中的角色
const selectedSystemARole = ref('')
const selectedSystemBRole = ref('')

// 系统A角色权限树
const systemARolePermissions = ref([
  {
    id: 1,
    label: '系统管理',
    children: [
      { id: 11, label: '用户管理' },
      { id: 12, label: '角色管理' },
      { id: 13, label: '权限管理' }
    ]
  },
  {
    id: 2,
    label: '业务管理',
    children: [
      { id: 21, label: '订单管理' },
      { id: 22, label: '客户管理' }
    ]
  }
])

// 系统B角色权限树
const systemBRolePermissions = ref([
  {
    id: 1,
    label: '系统配置',
    children: [
      { id: 11, label: '用户配置' },
      { id: 12, label: '角色配置' },
      { id: 13, label: '权限配置' }
    ]
  },
  {
    id: 2,
    label: '业务操作',
    children: [
      { id: 21, label: '订单处理' },
      { id: 22, label: '客户服务' }
    ]
  }
])

// 映射列表
const mappingList = ref([
  { id: 1, systemARole: '管理员', systemBRole: '超级管理员' },
  { id: 2, systemARole: '普通用户', systemBRole: '运营人员' },
  { id: 3, systemARole: '只读用户', systemBRole: '查看人员' }
])

// 处理系统A权限勾选
const handleSystemAPermissionCheck = (data, checked, indeterminate) => {
  console.log('System A permission check:', data, checked, indeterminate)
}

// 处理系统B权限勾选
const handleSystemBPermissionCheck = (data, checked, indeterminate) => {
  console.log('System B permission check:', data, checked, indeterminate)
}

// 映射角色
const mapRoles = () => {
  if (selectedSystemARole.value && selectedSystemBRole.value) {
    const systemARoleName = systemARoles.value.find(role => role.id === selectedSystemARole.value).name
    const systemBRoleName = systemBRoles.value.find(role => role.id === selectedSystemBRole.value).name
    
    const newMapping = {
      id: mappingList.value.length + 1,
      systemARole: systemARoleName,
      systemBRole: systemBRoleName
    }
    
    mappingList.value.push(newMapping)
    
    // 清空选择
    selectedSystemARole.value = ''
    selectedSystemBRole.value = ''
  }
}

// 删除映射
const deleteMapping = (id) => {
  mappingList.value = mappingList.value.filter(item => item.id !== id)
}
</script>

<style lang="scss" scoped>
.permission-management {
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
    .role-mapping-section {
      margin-bottom: 32px;

      h3 {
        margin-bottom: 20px;
        font-size: 16px;
        font-weight: 500;
      }

      .mapping-container {
        display: flex;
        align-items: flex-start;
        gap: 20px;

        .system-section {
          flex: 1;

          h4 {
            margin-bottom: 12px;
            font-size: 14px;
            font-weight: 500;
          }

          .role-select {
            width: 100%;
            margin-bottom: 12px;
          }

          .role-list {
            border: 1px solid rgb(235, 238, 245);
            border-radius: 8px;
            padding: 12px;
            background-color: white;
            min-height: 200px;
          }
        }

        .mapping-controls {
          display: flex;
          align-items: center;
          padding: 0 10px;
        }
      }
    }

    .mapping-list-section {
      h3 {
        margin-bottom: 20px;
        font-size: 16px;
        font-weight: 500;
      }
    }
  }
}
</style>