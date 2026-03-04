<template>
  <div class="app-container">
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
        @select="handleMenuSelect"
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
        <el-menu-item index="3" @click="$router.push('/order-entry')">
          <el-icon><Document /></el-icon>
          <span>录单</span>
        </el-menu-item>
        <el-menu-item index="4">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="4">
          <el-icon><Document /></el-icon>
          <span>数据分析</span>
        </el-menu-item>
        <el-menu-item index="5">
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

      <!-- 内容区域 -->
      <div class="content-area">
        <!-- 状态管理卡片 -->
        <div class="status-cards">
          <div class="status-card">
            <div class="card-header">
              <span>待处理订单</span>
              <el-badge value="10" type="danger" />
            </div>
            <div class="card-content">
              <div class="number">674</div>
              <div class="desc">今日新增</div>
            </div>
          </div>
          <div class="status-card">
            <div class="card-header">
              <span>可用库存预警</span>
            </div>
            <div class="card-content">
              <div class="number">47</div>
              <div class="desc">库存不足</div>
            </div>
          </div>
          <div class="status-card">
            <div class="card-header">
              <span>待发货</span>
            </div>
            <div class="card-content">
              <div class="number">214</div>
              <div class="desc">待处理</div>
            </div>
          </div>
          <div class="status-card">
            <div class="card-header">
              <span>缺货</span>
            </div>
            <div class="card-content">
              <div class="number">2</div>
              <div class="desc">严重缺货</div>
            </div>
          </div>
          <div class="status-card">
            <div class="card-header">
              <span>退款确认</span>
            </div>
            <div class="card-content">
              <div class="number">41</div>
              <div class="desc">待处理</div>
            </div>
          </div>
          <div class="status-card">
            <div class="card-header">
              <span>次品</span>
            </div>
            <div class="card-content">
              <div class="number">148</div>
              <div class="desc">待处理</div>
            </div>
          </div>
          <div class="status-card">
            <div class="card-header">
              <span>调账</span>
            </div>
            <div class="card-content">
              <div class="number">955</div>
              <div class="desc">待处理</div>
            </div>
          </div>
        </div>

        <!-- 数据统计卡片 -->
        <div class="stats-cards">
          <div class="stats-card">
            <div class="card-header">
              <span>交易</span>
            </div>
            <div class="card-content">
              <div class="status-item">
                <span class="status-dot green"></span>
                <span>正常</span>
                <span class="status-number">304</span>
              </div>
              <div class="status-item">
                <span class="status-dot orange"></span>
                <span>交易</span>
                <span class="status-number">235</span>
              </div>
              <div class="status-item">
                <span class="status-dot red"></span>
                <span>异常</span>
                <span class="status-number">39</span>
              </div>
            </div>
          </div>
          <div class="stats-card">
            <div class="card-header">
              <span>出库</span>
            </div>
            <div class="card-content">
              <div class="status-item">
                <span class="status-dot green"></span>
                <span>正常</span>
                <span class="status-number">228</span>
              </div>
              <div class="status-item">
                <span class="status-dot orange"></span>
                <span>交易</span>
                <span class="status-number">214</span>
              </div>
              <div class="status-item">
                <span class="status-dot red"></span>
                <span>异常</span>
                <span class="status-number">5</span>
              </div>
            </div>
          </div>
          <div class="stats-card">
            <div class="card-header">
              <span>核销</span>
            </div>
            <div class="card-content">
              <div class="status-item">
                <span class="status-dot green"></span>
                <span>正常</span>
                <span class="status-number">107</span>
              </div>
              <div class="status-item">
                <span class="status-dot orange"></span>
                <span>交易</span>
                <span class="status-number">79</span>
              </div>
              <div class="status-item">
                <span class="status-dot red"></span>
                <span>异常</span>
                <span class="status-number">28</span>
              </div>
            </div>
          </div>
          <div class="stats-card">
            <div class="card-header">
              <span>退款</span>
            </div>
            <div class="card-content">
              <div class="status-item">
                <span class="status-dot green"></span>
                <span>正常</span>
                <span class="status-number">3830</span>
              </div>
              <div class="status-item">
                <span class="status-dot orange"></span>
                <span>交易</span>
                <span class="status-number">742</span>
              </div>
              <div class="status-item">
                <span class="status-dot red"></span>
                <span>异常</span>
                <span class="status-number">65</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 月度数据 -->
        <div class="monthly-data">
          <div class="monthly-card">
            <div class="card-header">
              <span>月度数据总结</span>
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM"
                value-format="YYYY-MM"
                size="small"
              />
            </div>
            <div class="monthly-number">31465</div>
            <el-slider v-model="progress" :min="0" :max="100" :format-tooltip="() => '目标完成度'" />
          </div>
        </div>

        <!-- 数据图表 -->
        <div class="chart-container">
          <div class="chart-card">
            <div class="card-header">
              <span>销售趋势</span>
            </div>
            <div class="chart-content">
              <div class="no-data">
                <el-empty description="暂无数据" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { House, Setting, User, Document, Message, ArrowDown, Plus, Clock, Bell } from '@element-plus/icons-vue'

const activeMenu = ref('1')
const activeTopMenu = ref('1')
const dateRange = ref(['2024-04', '2025-05'])
const progress = ref(75)
</script>

<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.app-container {
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
  width: 200px;
  flex-shrink: 0;
}

.logo {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #00355f;
}

.custom-logo {
  display: flex;
  justify-content: center;
  align-items: center;
}

.zto-logo {
  width: 120px;
  height: 40px;
  object-fit: contain;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #00b8c4;
  color: #fff;
  padding: 0 20px;
  height: 60px;
  flex-shrink: 0;
}

.nav-left {
  display: flex;
  align-items: center;
}

.nav-tabs {
  display: flex;
  align-items: center;
}

.nav-tab {
  padding: 0 24px;
  height: 60px;
  line-height: 60px;
  cursor: pointer;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  position: relative;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
}

.nav-tab:last-child {
  border-right: none;
}

.nav-tab:hover {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-tab.active {
  color: #fff;
  font-weight: 500;
  background-color: rgba(255, 255, 255, 0.2);
  position: relative;
}

.nav-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 24px;
  right: 24px;
  height: 3px;
  background-color: #fff;
}

.nav-right {
  display: flex;
  align-items: center;
}

.nav-actions {
  display: flex;
  align-items: center;
}

.action-item {
  padding: 0 12px;
  cursor: pointer;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  height: 60px;
  line-height: 60px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-item::after {
  content: '|';
  position: absolute;
  right: 0;
  color: rgba(255, 255, 255, 0.3);
}

.action-item:last-child::after {
  content: none;
}

.action-item:hover {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  color: #fff;
  padding: 0 12px;
  height: 60px;
  line-height: 60px;
}

.user-info:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.content-area {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.status-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.status-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: 120px;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-size: 14px;
  color: #606266;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.number {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
}

.desc {
  font-size: 12px;
  color: #909399;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.stats-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: 140px;
}

.status-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
}

.status-dot.green {
  background-color: #67c23a;
}

.status-dot.orange {
  background-color: #e6a23c;
}

.status-dot.red {
  background-color: #f56c6c;
}

.status-number {
  margin-left: auto;
  font-weight: bold;
  color: #303133;
}

.monthly-data {
  margin-bottom: 20px;
}

.monthly-card {
  background-color: #e6f7ff;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #b3d9ff;
}

.monthly-number {
  font-size: 36px;
  font-weight: bold;
  color: #00b8c4;
  text-align: center;
  margin: 20px 0;
}

.chart-container {
  margin-bottom: 20px;
}

.chart-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: 300px;
}

.chart-content {
  height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-data {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 响应式设计 */
@media screen and (max-width: 1200px) {
  .status-cards {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .system-title {
    margin-right: 20px;
  }
  
  .nav-tab {
    padding: 0 12px;
  }
}

@media screen and (max-width: 768px) {
  .side-bar {
    width: 180px;
  }
  
  .status-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .system-title {
    margin-right: 12px;
  }
  
  .logo-text {
    font-size: 20px;
  }
  
  .system-name {
    font-size: 16px;
  }
  
  .nav-tab {
    padding: 0 8px;
    font-size: 13px;
  }
  
  .action-item {
    padding: 0 8px;
    font-size: 13px;
  }
  
  .top-nav {
    padding: 0 12px;
  }
  
  .content-area {
    padding: 12px;
  }
}
</style>