<template>
  <div class="smart-chat-container">
    <!-- Header -->
    <header class="chat-header">
      <div class="header-title">智能对话分析</div>
      <div class="mode-switch">
        <el-radio-group v-model="viewMode" size="small">
          <el-radio-button label="conclusion">仅看结论</el-radio-button>
          <el-radio-button label="detailed">查看详细分析</el-radio-button>
        </el-radio-group>
      </div>
    </header>

    <!-- Content -->
    <main class="chat-content" ref="chatContentRef">
      <div class="chat-wrapper">
        <!-- User Message -->
        <div class="message-row user-row">
          <div class="user-bubble">
            请帮我分析一下近期的班线装载情况。
          </div>
        </div>

<!-- AI Message -->
        <div class="message-row ai-row">
          <div class="ai-avatar">
            <el-icon><Service /></el-icon>
          </div>
          
          <div class="ai-cards">
            <h1 class="report-title">📊 货量分析日报（2026-03-23）</h1>

            <!-- 1. 核心结论 -->
            <div class="ai-card conclusion-card">
              <h2 class="card-h2">🧭 一、核心结论</h2>
              <div class="summary-box">
                <p>✅ 今日货量明显下降</p>
                <p>⚠️ 冷链快递异常下降（-86.1%）</p>
                <p>📉 重货占比下降，结构偏轻</p>
                <p>🚀 四川、重庆异常增长</p>
              </div>
            </div>

            <!-- 2. 今日货量概况 -->
            <div class="ai-card">
              <h2 class="card-h2">📦 二、今日货量概况</h2>
              <el-table :data="overviewData" style="width: 100%" size="small" border>
                <el-table-column prop="indicator" label="指标"></el-table-column>
                <el-table-column prop="value" label="数值" align="right"></el-table-column>
                <el-table-column prop="mom" label="环比" align="right">
                  <template #default="{ row }">
                    <span class="text-red">🔻{{ row.mom }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="yoy" label="同比" align="right">
                  <template #default="{ row }">
                    <span class="text-red">🔻{{ row.yoy }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="conclusion" label="结论"></el-table-column>
              </el-table>
              <div class="card-footer-tip">
                💡 说明：周一数据通常偏低，建议下午复核
              </div>
            </div>

            <!-- 3. 产品类型分析 -->
            <div class="ai-card">
              <h2 class="card-h2">🧱 三、产品类型分析</h2>
              <el-table :data="productData" style="width: 100%" size="small">
                <el-table-column prop="type" label="产品"></el-table-column>
                <el-table-column prop="ratio" label="占比" align="right"></el-table-column>
                <el-table-column prop="mom" label="环比" align="right"></el-table-column>
                <el-table-column prop="change" label="变化" align="right">
                  <template #default="{ row }">
                    <span :class="row.isUp ? 'text-green' : 'text-red'">
                      {{ row.isUp ? '🔺' : '🔻' }}{{ row.change }}
                    </span>
                  </template>
                </el-table-column>
              </el-table>
              <div class="anomaly-warning">
                ⚠️ 冷链快递异常下降，需排查数据 or 业务问题
              </div>
            </div>

            <!-- 4. 重量结构分析 -->
            <div class="ai-card">
              <h2 class="card-h2">⚖️ 四、重量结构分析</h2>
              <el-table :data="ladderData" style="width: 100%" size="small">
                <el-table-column prop="ladder" label="重量段"></el-table-column>
                <el-table-column prop="ratio" label="占比" align="right"></el-table-column>
                <el-table-column prop="mom" label="环比" align="right">
                  <template #default="{ row }">
                    <span class="text-red">🔻{{ row.mom }}</span>
                  </template>
                </el-table-column>
              </el-table>
              <div class="card-footer-tip">
                💡 结构结论：<br/>
                - 轻货占比过高<br/>- 重货明显不足
              </div>
            </div>

            <!-- 5. 省区分布 TOP10 -->
            <div class="ai-card">
              <h2 class="card-h2">🌍 五、省区分布 TOP10</h2>
              <el-table :data="provinceData" style="width: 100%" size="small">
                <el-table-column prop="province" label="省区"></el-table-column>
                <el-table-column prop="ratio" label="占比" align="right"></el-table-column>
                <el-table-column prop="mom" label="环比" align="right">
                  <template #default="{ row }">
                    <span :class="row.isUp ? 'text-green' : 'text-red'">
                      {{ row.isUp ? '🔺' : '🔻' }}{{ row.mom }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" align="center">
                  <template #default="{ row }">
                    <span>{{ row.isUp ? '🚀' : '📉' }} {{ row.status }}</span>
                  </template>
                </el-table-column>
              </el-table>
              <div class="anomaly-warning">
                ⚠️ 异常：<br/>
                - 四川 / 重庆：需确认是否大客户<br/>- 广东：下降明显
              </div>
            </div>

            <!-- 6. 异常与风险 -->
            <div class="ai-card risk-card">
              <h2 class="card-h2">🚨 六、异常与风险</h2>
              <div class="risk-list">
                <div class="risk-item">⚠️ 冷链快递大幅下降（优先级 P0）</div>
                <div class="risk-item">⚠️ 广东区域异常下滑</div>
                <div class="risk-item">⚠️ 数据可能未完整（周一效应）</div>
              </div>
            </div>

            <!-- 7. 行动建议 -->
            <div class="ai-card action-card">
              <h2 class="card-h2">🎯 七、行动建议</h2>
              <div class="action-list">
                <div class="action-item">✅ 下午复核数据完整性</div>
                <div class="action-item">✅ 排查冷链快递链路</div>
                <div class="action-item">✅ 跟进四川/重庆增长来源</div>
              </div>
            </div>

            <div class="data-source-footer">
              📊 详细数据请查看：网点开单货量统计-实时
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer Input -->
    <footer class="chat-footer">
      <div class="input-container">
        <el-input 
          v-model="inputText" 
          placeholder="请输入您想查询的问题..." 
          class="chat-input"
          size="large"
          @keyup.enter="handleSend"
        >
          <template #append>
            <el-button icon="Position" @click="handleSend"></el-button>
          </template>
        </el-input>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const viewMode = ref('detailed')
const inputText = ref('')

// 1. Overview Data
const overviewData = ref([
  { indicator: '票数', value: '1.82万', mom: '49.3%', yoy: '60.6%', conclusion: '明显下降' },
  { indicator: '重量', value: '359.3吨', mom: '27.5%', yoy: '49.1%', conclusion: '明显下降' }
])

// 2. Product Data
const productData = ref([
  { type: '普通', ratio: '78.5%', mom: '98.6%', change: '37.2%', isUp: false },
  { type: '冷链小件', ratio: '13.7%', mom: '0.9%', change: '16.1%', isUp: false },
  { type: '冷链快递', ratio: '7.8%', mom: '0.2%', change: '86.1%', isUp: false }
])

// 3. Ladder Data
const ladderData = ref([
  { ladder: '0-300kg', ratio: '83.1%', mom: '53.1%' },
  { ladder: '300-600kg', ratio: '8.9%', mom: '18.1%' },
  { ladder: '600kg+', ratio: '4.5%', mom: '1.2%' }
])

// 4. Province Data
const provinceData = ref([
  { province: '四川', ratio: '12.6%', mom: '102.9%', isUp: true, status: '增长' },
  { province: '重庆', ratio: '3.3%', mom: '155.6%', isUp: true, status: '增长' },
  { province: '山东', ratio: '10.1%', mom: '42.5%', isUp: false, status: '下滑' }
])

const handleSend = () => {
  if (!inputText.value.trim()) return
  inputText.value = ''
}
</script>



<style lang="scss" scoped>

$c-bg: #F7F8FA;
$c-card: #FFFFFF;
$c-main-text: #1F1F1F;
$c-sub-text: #666666;
$c-weak-text: #999999;
$c-red: #FF4D4F;
$c-orange: #FAAD14;
$c-green: #52C41A;
$c-user-bg: #E6F4FF;

.smart-chat-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 84px); /* Subtract Header/Layout Navbar height */
  background-color: $c-bg;
  color: $c-main-text;
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif;
  overflow: hidden;
}

.chat-header {
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  background-color: #fff;
  border-bottom: 1px solid #E5E6EB;
  flex-shrink: 0;
  z-index: 10;

  .header-title {
    font-size: 16px;
    font-weight: 500;
  }
}

.chat-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px 0;
}

.chat-wrapper {
  width: 100%;
  max-width: 720px;
  min-width: 680px;
  margin: 0 auto;
}

.message-row {
  margin-bottom: 24px;
  display: flex;
  width: 100%;
}

.user-row {
  justify-content: flex-end;

  .user-bubble {
    background-color: $c-user-bg;
    color: $c-main-text;
    font-size: 14px;
    border-radius: 12px;
    border-top-right-radius: 4px;
    padding: 12px 16px;
    line-height: 1.6;
    max-width: 80%;
    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  }
}

.ai-row {
  justify-content: flex-start;
  align-items: flex-start;

  .ai-avatar {
    width: 32px;
    height: 32px;
    background-color: #00b8c4;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    font-size: 18px;
    margin-right: 12px;
    flex-shrink: 0;
    box-shadow: 0 2px 6px rgba(0, 184, 196, 0.4);
  }

  .ai-cards {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: calc(100% - 44px);
  }
}

.ai-card {
  background-color: $c-card;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  &.think-card, &.detail-card {
    padding: 0;
  }
}

.conclusion-card {
  .card-title {
    font-size: 17px;
    font-weight: 600;
    margin-bottom: 20px;
  }

  .metrics-row {
    display: flex;
    gap: 40px;
    margin-bottom: 20px;

    .metric-item {
      display: flex;
      flex-direction: column;
      gap: 6px;

      .metric-val {
        font-size: 28px; 
        font-weight: 600;
        color: #000;
        line-height: 1;
      }

      .metric-label {
        font-size: 12px;
        color: $c-sub-text;
      }
    }
  }

  .alert-line {
    background: #FAFAFA;
    border-radius: 8px;
    padding: 10px 16px;
    font-size: 13px;
    color: #333;
    display: inline-flex;
    align-items: center;

    .alert-item {
      cursor: pointer;
      font-weight: 500;
      transition: opacity 0.2s;
      
      &:hover { opacity: 0.8; }
      
      &.red-alert { color: $c-red; }
      &.orange-alert { color: $c-orange; }
    }

    .divider {
      color: #E0E0E0;
      margin: 0 12px;
    }
  }
}

.exception-card {
  .card-title {
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 12px;

    &.red-title { color: $c-red; }
    &.orange-title { color: $c-orange; }
  }

  .list-container {
    .list-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 36px;
      font-size: 13px;
      border-bottom: 1px solid #F0F0F0;
      transition: background-color 0.2s;
      cursor: default;

      &:hover {
        background-color: #FAFAFA;
      }

      &:last-of-type {
        border-bottom: none;
      }

      .item-line {
        flex: 1;
        color: $c-main-text;
      }

      .item-rate {
        width: 60px;
        text-align: right;
        font-weight: 600;
        margin-right: 16px;
      }

      .item-volume {
        width: 50px;
        text-align: right;
        color: $c-sub-text;
      }
    }

    .view-more {
      text-align: center;
      color: $c-weak-text;
      font-size: 12px;
      cursor: pointer;
      padding: 12px 0 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;

      &:hover {
        color: #00b8c4;
      }
    }
  }
}

.collapsible-header {
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 500;
  transition: background-color 0.2s;
  border-radius: 12px;

  &:hover {
    background-color: #FAFAFA;
  }

  .el-icon {
    transition: transform 0.3s;
    color: $c-weak-text;
    &.is-rotated {
      transform: rotate(90deg);
    }
  }
}

.think-card {
  background-color: transparent !important;
  box-shadow: none !important;

  .collapsible-header {
    background-color: transparent;
    color: $c-sub-text;
    padding: 8px 0;
    justify-content: flex-start;
    gap: 8px;

    &:hover { background-color: transparent;}
  }

  .think-body {
    background-color: $c-bg;
    border-left: 2px solid #E5E6EB;
    padding: 4px 12px;
    margin-left: 6px;
    margin-top: 4px;
    font-size: 12px;
    color: $c-sub-text;
    line-height: 2;

    .think-step {
      margin-bottom: 4px;
      &:last-child { margin-bottom: 0; }
    }
  }
}

.detail-card {
  .collapsible-body {
    padding: 0 16px 16px;

    :deep(.el-table) {
      .el-table__header th {
        background-color: #FAFAFA;
        color: $c-main-text;
        font-weight: 500;
        padding: 8px 0;
      }
      .el-table__row td {
        height: 40px;
        padding: 4px 0;
        font-size: 12px;
      }
    }
  }
}

.chat-footer {
  height: 80px;
  background-color: #fff;
  border-top: 1px solid #E5E6EB;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  padding: 0 24px;

  .input-container {
    width: 100%;
    max-width: 720px;
    min-width: 680px;
    
    .chat-input {
      :deep(.el-input__wrapper) {
        box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        border-radius: 8px;
        height: 44px;
      }

      :deep(.el-input-group__append) {
        background-color: #00b8c4;
        color: #fff;
        border: none;
        border-radius: 0 8px 8px 0;
        box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        cursor: pointer;
        transition: background-color 0.2s;

        &:hover {
          background-color: lighten(#00b8c4, 5%);
        }
      }
    }
  }
}

.report-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 16px;
  padding: 0 4px;
}

.card-h2 {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-box {
  background-color: #f8fbff;
  border-radius: 8px;
  padding: 12px 16px;
  border-left: 4px solid #00b8c4;
  
  p {
    margin: 6px 0;
    font-size: 13px;
    font-weight: 500;
    color: #444;
  }
}

.card-footer-tip {
  margin-top: 12px;
  padding: 10px 12px;
  background-color: #fdfdfd;
  border-radius: 6px;
  font-size: 12px;
  color: #666;
  line-height: 1.6;
  border: 1px dashed #eee;
}

.anomaly-warning {
  margin-top: 12px;
  padding: 10px 12px;
  background-color: #fffbe6;
  border-radius: 6px;
  border: 1px solid #ffe58f;
  font-size: 12px;
  color: #856404;
  line-height: 1.6;
}

.risk-card {
  .risk-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .risk-item {
    font-size: 13px;
    color: #d4380d;
    background: #fff2e8;
    padding: 8px 12px;
    border-radius: 4px;
    border: 1px solid #ffbb96;
  }
}

.action-card {
  .action-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .action-item {
    font-size: 13px;
    color: #389e0d;
    background: #f6ffed;
    padding: 8px 12px;
    border-radius: 4px;
    border: 1px solid #b7eb8f;
  }
}

.data-source-footer {
  font-size: 12px;
  color: #999;
  text-align: center;
  margin-top: 24px;
  padding: 16px 0;
  border-top: 1px dashed #eee;
}

.text-green {
  color: #52C41A !important;
  font-weight: 600;
}

.text-red {
  color: #FF4D4F !important;
  font-weight: 600;
}

.text-orange {
  color: #FAAD14 !important;
}

.text-normal {
  color: #1F1F1F !important;
}
</style>
