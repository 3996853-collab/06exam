<template>
  <div class="layout-container">
    <!-- 左侧导航栏 -->
    <el-aside width="200px" class="side-bar">
      <div class="logo">
        <div class="custom-logo">
          <img src="/image.png" alt="ZTO Logo" class="zto-logo" />
        </div>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="el-menu-vertical-demo"
        background-color="#002140"
        text-color="#fff"
        active-text-color="#00b8c4"
      >
        <el-menu-item index="1">
          <el-icon><House /></el-icon>
          <span>首页</span>
        </el-menu-item>
        <el-sub-menu index="2">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>运营管理</span>
          </template>
          <el-menu-item index="2-1">会员管理</el-menu-item>
          <el-menu-item index="2-2">订单管理</el-menu-item>
        </el-sub-menu>
        <el-menu-item index="3">
          <el-icon><Document /></el-icon>
          <span>录单</span>
        </el-menu-item>
        <el-menu-item index="4">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="5">
          <el-icon><Document /></el-icon>
          <span>数据分析</span>
        </el-menu-item>
        <el-menu-item index="6">
          <el-icon><Message /></el-icon>
          <span>消息管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 顶部导航 -->
      <div class="top-nav">
        <div class="nav-left">
          <div class="nav-tabs">
            <div class="nav-tab" :class="{ active: activeTopMenu === '1' }" @click="activeTopMenu = '1'">冷链快运</div>
            <div class="nav-tab" :class="{ active: activeTopMenu === '2' }" @click="activeTopMenu = '2'">冷链智运</div>
            <div class="nav-tab" :class="{ active: activeTopMenu === '3' }" @click="activeTopMenu = '3'">冷链云仓</div>
            <div class="nav-tab" :class="{ active: activeTopMenu === '4' }" @click="activeTopMenu = '4'">更多租户...</div>
          </div>
        </div>
        <div class="nav-right">
          <div class="nav-actions">
            <span class="action-item"><el-icon><Clock /></el-icon> 返回旧版</span>
            <span class="action-item">快件跟踪</span>
            <span class="action-item"><el-icon><Document /></el-icon> 待办</span>
            <span class="action-item">
              <el-badge value="99+" type="danger">
                <span><el-icon><Bell /></el-icon> 消息</span>
              </el-badge>
            </span>
            <span class="action-item">导出</span>
            <span class="action-item">下载</span>
            <span class="action-item">工单</span>
            <span class="action-item">反馈</span>
            <el-dropdown>
              <span class="user-info">
                <span style="margin-right: 8px;">侯鹏</span>
                <el-icon><Setting /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>个人中心</el-dropdown-item>
                  <el-dropdown-item>设置</el-dropdown-item>
                  <el-dropdown-item>退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </div>

      <!-- Tab 栏 -->
      <div class="tabs-bar">
        <div class="tabs-container">
          <div
            v-for="tab in tabs"
            :key="tab.path"
            class="tab-item"
            :class="{ active: tab.path === activeTab }"
            @click="handleTabClick(tab)"
          >
            <span class="tab-title">{{ tab.title }}</span>
            <el-icon
              v-if="tab.path !== '/'"
              class="tab-close"
              @click.stop="handleTabClose(tab.path)"
            >
              <Close />
            </el-icon>
          </div>
        </div>
        <div class="tabs-actions">
          <el-dropdown @command="handleTabsCommand">
            <el-button size="small" type="primary">
              <el-icon><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="closeOther">关闭其他</el-dropdown-item>
                <el-dropdown-item command="closeAll">关闭所有</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="content-area">
        <router-view v-slot="{ Component, route }">
          <component
            :is="Component"
            :key="route.fullPath"
            @close-tab="handleTabClose"
          />
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { House, Setting, Document, Message, ArrowDown, Close, Clock, Bell } from '@element-plus/icons-vue'
import { useRoute, useRouter } from 'vue-router'
import { useTabsStore } from '../stores/tabs'

const route = useRoute()
const router = useRouter()
const tabsStore = useTabsStore()

const activeMenu = ref('1')
const activeTopMenu = ref('1')

const tabs = computed(() => tabsStore.tabs)
const activeTab = computed(() => tabsStore.activeTab)

watch(
  () => route.fullPath,
  () => {
    tabsStore.addTab(route)
  },
  { immediate: true }
)

const handleTabClick = (tab) => {
  router.push(tab.path)
}

const handleTabClose = (path) => {
  tabsStore.removeTab(path)
}

const handleTabsCommand = (command) => {
  if (command === 'closeOther') {
    tabsStore.closeOtherTabs(activeTab.value)
  } else if (command === 'closeAll') {
    tabsStore.closeAllTabs()
    router.push('/')
  }
}
</script>

<style scoped>
.layout-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background-color: #f5f7fa;
}

.side-bar {
  background-color: #002140;
  color: #fff;
  display: flex;
  flex-direction: column;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #002f52;
}

.custom-logo {
  width: 120px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.zto-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.top-nav {
  height: 50px;
  background-color: #00b8c4;
  color: #fff;
  display: flex;
  align-items: center;
  padding: 0 20px;
  flex-shrink: 0;
}

.nav-left {
  flex: 1;
}

.nav-tabs {
  display: flex;
  gap: 20px;
}

.nav-tab {
  color: #fff;
  cursor: pointer;
  font-size: 14px;
  padding: 8px 12px;
  border-radius: 4px;
  transition: all 0.3s;
}

.nav-tab:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-tab.active {
  color: #fff;
  font-weight: bold;
  background-color: rgba(255, 255, 255, 0.2);
  border-bottom: 2px solid #fff;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.action-item {
  color: #fff;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-item:hover {
  color: #fff;
  opacity: 0.8;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  color: #fff;
}

.user-info:hover {
  color: #fff;
  opacity: 0.8;
}

.tabs-bar {
  height: 40px;
  background-color: #f0f0f0;
  border-bottom: 1px solid #dcdcdc;
  display: flex;
  align-items: center;
  padding: 0 10px;
  gap: 10px;
  flex-shrink: 0;
}

.tabs-container {
  display: flex;
  gap: 5px;
  overflow-x: auto;
  flex: 1;
  scrollbar-width: none;
}

.tabs-container::-webkit-scrollbar {
  display: none;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: #e6e6e6;
  border-radius: 4px 4px 0 0;
  cursor: pointer;
  font-size: 13px;
  color: #606266;
  white-space: nowrap;
  transition: all 0.3s;
  position: relative;
}

.tab-item:hover {
  background-color: #dcdcdc;
}

.tab-item.active {
  background-color: #fff;
  color: #002140;
  font-weight: bold;
}

.tab-item.active::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #002140;
}

.tab-title {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tab-close {
  cursor: pointer;
  font-size: 12px;
  color: #999;
  transition: all 0.3s;
}

.tab-close:hover {
  color: #f56c6c;
}

.tabs-actions {
  display: flex;
  align-items: center;
}

.content-area {
  flex: 1;
  overflow: auto;
  padding: 20px;
}
</style>
