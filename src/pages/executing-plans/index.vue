/**
 * @name 执行计划首页
 * 
 * 参考资料：
 * - /rules/development-standards.md
 * - /rules/design-guide.md
 */
<template>
  <div class="executing-plans-page">
    <!-- 左侧导航栏 -->
    <aside class="sidebar">
      <div class="logo-area">
        <div class="logo-icon">📋</div>
        <span class="logo-text">执行计划</span>
      </div>
      <nav class="nav-menu">
        <div class="nav-item active">
          <span class="nav-icon">🏠</span>
          <span>首页</span>
        </div>
        <div class="nav-item">
          <span class="nav-icon">📊</span>
          <span>计划管理</span>
        </div>
        <div class="nav-item">
          <span class="nav-icon">✅</span>
          <span>任务执行</span>
        </div>
        <div class="nav-item">
          <span class="nav-icon">📝</span>
          <span>审查报告</span>
        </div>
        <div class="nav-item">
          <span class="nav-icon">📁</span>
          <span>批次管理</span>
        </div>
        <div class="nav-item">
          <span class="nav-icon">⚙️</span>
          <span>设置</span>
        </div>
      </nav>
      <div class="sidebar-footer">
        <div class="toggle-switch">
          <span>快捷模式</span>
          <div class="switch active"></div>
        </div>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 顶部导航 -->
      <header class="top-header">
        <div class="header-left">
          <button class="back-btn">←</button>
          <div class="breadcrumb">
            <span>执行计划</span>
            <span class="separator">/</span>
            <span>首页</span>
          </div>
        </div>
        <div class="header-center">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input type="text" placeholder="搜索计划、任务..." />
          </div>
        </div>
        <div class="header-right">
          <div class="header-actions">
            <button class="action-btn">🔔 消息</button>
            <button class="action-btn">👤 用户</button>
            <button class="action-btn">⚙️ 设置</button>
          </div>
        </div>
      </header>

      <!-- 待处理事项 -->
      <section class="pending-section">
        <h2 class="section-title">待处理事项</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-icon">⏳</span>
              <span class="stat-label">待审查</span>
            </div>
            <div class="stat-value">800</div>
          </div>
          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-icon">🔄</span>
              <span class="stat-label">处理中</span>
            </div>
            <div class="stat-value">27</div>
          </div>
          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-icon">⏸️</span>
              <span class="stat-label">待反馈</span>
            </div>
            <div class="stat-value">-</div>
          </div>
          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-icon">✅</span>
              <span class="stat-label">待提交</span>
            </div>
            <div class="stat-value">82</div>
          </div>
          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-icon">📬</span>
              <span class="stat-label">待审查确认</span>
            </div>
            <div class="stat-value">2</div>
          </div>
          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-icon">🚫</span>
              <span class="stat-label">已阻塞</span>
            </div>
            <div class="stat-value">41</div>
          </div>
          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-icon">⚠️</span>
              <span class="stat-label">风险</span>
            </div>
            <div class="stat-value">142</div>
          </div>
          <div class="stat-card highlight">
            <div class="stat-header">
              <span class="stat-icon">📊</span>
              <span class="stat-label">总量</span>
            </div>
            <div class="stat-value">949</div>
          </div>
        </div>
      </section>

      <!-- 数据概览 -->
      <section class="overview-section">
        <div class="section-header">
          <h3 class="section-subtitle">数据概览</h3>
          <div class="legend">
            <span class="legend-item"><span class="dot green"></span>未阻塞</span>
            <span class="legend-item"><span class="dot orange"></span>已经反馈</span>
            <span class="legend-item"><span class="dot red"></span>严重延误</span>
            <a href="#" class="view-more">查看更多数据&gt;&gt;</a>
          </div>
        </div>
        
        <div class="overview-cards">
          <div class="overview-card pending-ship">
            <div class="card-header">
              <span class="card-title">待发货</span>
            </div>
            <div class="card-metrics">
              <div class="metric">
                <span class="dot green"></span>
                <span class="metric-value">278</span>
              </div>
              <div class="metric">
                <span class="dot orange"></span>
                <span class="metric-value">222</span>
              </div>
              <div class="metric">
                <span class="dot red"></span>
                <span class="metric-value">30</span>
              </div>
            </div>
          </div>

          <div class="overview-card in-transit">
            <div class="card-header">
              <span class="card-title">在途</span>
            </div>
            <div class="card-metrics">
              <div class="metric">
                <span class="dot green"></span>
                <span class="metric-value">243</span>
              </div>
              <div class="metric">
                <span class="dot orange"></span>
                <span class="metric-value">179</span>
              </div>
              <div class="metric">
                <span class="dot red"></span>
                <span class="metric-value">7</span>
              </div>
            </div>
          </div>

          <div class="overview-card arrived">
            <div class="card-header">
              <span class="card-title">到货</span>
            </div>
            <div class="card-metrics">
              <div class="metric">
                <span class="dot green"></span>
                <span class="metric-value">984</span>
              </div>
              <div class="metric">
                <span class="dot orange"></span>
                <span class="metric-value">217</span>
              </div>
              <div class="metric">
                <span class="dot red"></span>
                <span class="metric-value">28</span>
              </div>
            </div>
          </div>

          <div class="overview-card signed">
            <div class="card-header">
              <span class="card-title">签收</span>
            </div>
            <div class="card-metrics">
              <div class="metric">
                <span class="dot green"></span>
                <span class="metric-value">3849</span>
              </div>
              <div class="metric">
                <span class="dot orange"></span>
                <span class="metric-value">987</span>
              </div>
              <div class="metric">
                <span class="dot red"></span>
                <span class="metric-value">43</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 右侧目标区域 -->
      <aside class="target-sidebar">
        <div class="target-card">
          <div class="target-header">
            <span class="target-label">本月货量目标 (T)</span>
          </div>
          <div class="target-value">31465</div>
          <div class="target-progress">
            <div class="progress-info">
              <span>已完成：2402</span>
              <span>未完成：29063</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: targetProgress + '%' }"></div>
            </div>
          </div>
        </div>
      </aside>

      <!-- 底部空状态 -->
      <section class="empty-state">
        <div class="empty-content">
          <div class="empty-icon">🤖</div>
          <p class="empty-text">功能开发中，敬请期待</p>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import './style.css';

const pendingCount = ref(800);
const processingCount = ref(27);
const completedCount = ref(82);
const reviewCount = ref(2);
const waitingConfirmCount = ref(41);
const blockedCount = ref(142);
const totalCount = ref(949);
const monthlyTarget = ref(31465);
const completedTarget = ref(2402);
const targetProgress = ref(7.6);
</script>

<style scoped>
/* 页面样式在 style.css 中定义 */
</style>
