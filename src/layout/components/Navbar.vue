<template>
  <div class="navbar">
    <div class="navbar-left">
      <div class="logo-container">
        <img src="/image.png" alt="ZTO" class="logo-img" />
      </div>
    </div>

    <div class="navbar-right">
      <div class="nav-menu">
        <a href="#" :class="{ active: activeTenant === '冷链快运' }" @click.prevent="activeTenant = '冷链快运'">冷链快运</a>
        <a href="#" :class="{ active: activeTenant === '冷链智运' }" @click.prevent="activeTenant = '冷链智运'">冷链智运</a>
        <a href="#" :class="{ active: activeTenant === '冷链云仓' }" @click.prevent="activeTenant = '冷链云仓'">冷链云仓</a>
        <a href="#" :class="{ active: activeTenant === '更多租户' }" @click.prevent="activeTenant = '更多租户'">更多租户<el-icon><ArrowDown /></el-icon></a>
      </div>

      <div class="nav-actions">
        <el-tooltip content="返回旧版" placement="bottom">
          <div class="action-item" @click="handleBackOld">
            <el-icon><Clock /></el-icon>
            <span>返回旧版</span>
          </div>
        </el-tooltip>

        <div class="action-divider"></div>

        <el-tooltip content="快件跟踪" placement="bottom">
          <div class="action-item" @click="handleTrack">
            <span>快件跟踪</span>
          </div>
        </el-tooltip>
        
        <div class="action-divider"></div>

        <el-tooltip content="待办" placement="bottom">
          <div class="action-item" @click="handleTodo">
            <el-icon><Document /></el-icon>
            <span>待办</span>
          </div>
        </el-tooltip>

        <div class="action-item" @click="handleMessage">
          <el-badge :value="messageCount" type="danger" class="badge-item">
            <el-icon><Bell /></el-icon>
          </el-badge>
          <span>消息</span>
        </div>

        <div class="action-item" @click="handleExport">
          <span>导出</span>
        </div>

        <div class="action-item" @click="handleDownload">
          <span>下载</span>
        </div>

        <div class="action-item" @click="handleWorkOrder">
          <span>工单</span>
        </div>

        <div class="action-item" @click="handleFeedback">
          <el-icon><ChatDotRound /></el-icon>
          <span>反馈</span>
        </div>

        <el-dropdown @command="handleCommand">
          <span class="user-info">
            <span class="user-name">侯鹏</span>
            <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">
                <el-icon><User /></el-icon>
                个人中心
              </el-dropdown-item>
              <el-dropdown-item command="settings">
                <el-icon><Setting /></el-icon>
                设置
              </el-dropdown-item>
              <el-dropdown-item command="logout" divided>
                <el-icon><SwitchButton /></el-icon>
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/store/modules/app'
import Hamburger from '@/components/Hamburger.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'

const route = useRoute()
const appStore = useAppStore()

const sidebar = computed(() => appStore.sidebar)
const activeTenant = ref('冷链快运')
const messageCount = ref('99+')

const toggleSidebar = () => {
  appStore.toggleSidebar()
}

const handleBackOld = () => {
  console.log('返回旧版')
}

const handleTrack = () => {
  console.log('快件跟踪')
}

const handleTodo = () => {
  console.log('待办')
}

const handleMessage = () => {
  console.log('消息')
}

const handleExport = () => {
  console.log('导出')
}

const handleDownload = () => {
  console.log('下载')
}

const handleWorkOrder = () => {
  console.log('工单')
}

const handleFeedback = () => {
  console.log('反馈')
}

const handleCommand = (command) => {
  switch (command) {
    case 'profile':
      console.log('个人中心')
      break
    case 'settings':
      console.log('设置')
      break
    case 'logout':
      console.log('退出登录')
      break
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  background: #00b8c4;
  color: white;
  display: flex;
  justify-content: space-between;
  padding: 0 20px 0 0;

  .navbar-left {
    display: flex;
    align-items: center;

    .logo-container {
      width: 200px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #00a5b1; /* Slightly darker than nav for distinction */

      .logo-img {
        max-width: 140px;
        height: 36px;
        object-fit: contain;
      }
    }
  }

  .navbar-right {
    display: flex;
    align-items: center;
    flex: 1;
    justify-content: space-between;
    padding-left: 20px;

    .nav-menu {
      display: flex;
      gap: 30px;

      a {
        color: rgba(255, 255, 255, 0.8);
        text-decoration: none;
        font-size: 14px;
        position: relative;
        height: 50px;
        line-height: 50px;
        transition: all 0.3s;
        display: flex;
        align-items: center;
        gap: 4px;

        &:hover, &.active {
          color: white;
          font-weight: 500;
        }

        &.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: white;
          border-radius: 3px 3px 0 0;
        }
      }
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 16px;
      font-size: 13px;

      .action-divider {
        width: 1px;
        height: 14px;
        background: rgba(255, 255, 255, 0.3);
      }

      .action-item {
        display: flex;
        align-items: center;
        gap: 4px;
        cursor: pointer;
        color: white;
        transition: opacity 0.3s;

        &:hover {
          opacity: 0.8;
        }

        .badge-item {
          :deep(.el-badge__content.is-fixed) {
            transform: translateY(-50%) translateX(100%);
            border: none;
          }
        }
      }

      .user-info {
        display: flex;
        align-items: center;
        cursor: pointer;
        color: white;
        margin-left: 10px;

        .user-name {
          margin-right: 4px;
          font-size: 13px;
        }
      }
    }
  }
}
</style>
