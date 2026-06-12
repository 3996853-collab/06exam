<template>
  <div class="smart-sub-container">
    <!-- 顶部 Banner -->
    <div class="sub-banner">
      <div class="banner-content">
        <div class="banner-title">
          <el-icon class="logo-icon"><Notification /></el-icon>
          <span>Antigravity 智能问数订阅中心</span>
        </div>
        <div class="banner-desc">
          “反重力”数据体验：免去复杂报表与SQL，将您的核心业务提问转化为周期投递卡片，并自动生成 LLM 微报告与智能数据归因。
        </div>
      </div>
      <div class="banner-badge">
        <span class="status-dot"></span> 协同控制塔 v2.0
      </div>
    </div>

    <!-- 页面主体布局 -->
    <div class="sub-main-layout">
      <!-- 左栏：配置与管理 -->
      <div class="left-panel">
        <el-card class="box-card main-tabs-card" shadow="never">
          <el-tabs v-model="activeTab" class="sub-tabs" @tab-change="handleTabChange">
            <!-- 选项卡1：智能配置助手 -->
            <el-tab-pane name="assistant">
              <template #label>
                <div class="tab-label">
                  <el-icon><Cpu /></el-icon>
                  <span>智能配置助手</span>
                </div>
              </template>

              <div class="assistant-content">
                <div class="helper-welcome">
                  <div class="ai-avatar">AI</div>
                  <div class="welcome-speech">
                    <p>您好！我是 <strong>Antigravity 订阅助手</strong>。请直接输入您想订阅的指标（如：每日大区成交GMV，每周品控时效）并指定推送频率，我将为您自动匹配解析。</p>
                  </div>
                </div>

                <!-- 推荐指令 -->
                <div class="prompt-suggestions">
                  <span class="suggest-label">推荐订阅指令（点击直接填入）：</span>
                  <div class="suggest-items">
                    <div 
                      v-for="(sug, index) in suggestions" 
                      :key="index" 
                      class="suggest-tag"
                      @click="fillInput(sug)"
                    >
                      <el-icon class="tag-icon"><Promotion /></el-icon>
                      <span>{{ sug }}</span>
                    </div>
                  </div>
                </div>

                <!-- 输入框 -->
                <div class="prompt-input-area">
                  <el-input
                    v-model="naturalLanguageInput"
                    type="textarea"
                    :rows="4"
                    placeholder="例如：以后每天早上八点半，把昨天各个大区的成交GMV发到我的飞书里..."
                    resize="none"
                    class="custom-textarea"
                  />
                  <div class="input-footer">
                    <span class="input-tip">支持匹配频率、接收终端、指标与维度</span>
                    <el-button 
                      type="primary" 
                      class="btn-parse" 
                      :loading="parsing" 
                      @click="handleParse"
                    >
                      <template #loading>
                        <span class="loading-icon-custom"></span>
                      </template>
                      智能解析并生成
                    </el-button>
                  </div>
                </div>

                <!-- 解析中动画 -->
                <div v-if="parsing" class="parse-loader-box">
                  <div class="gravity-waves">
                    <div class="wave wave1"></div>
                    <div class="wave wave2"></div>
                    <div class="wave wave3"></div>
                  </div>
                  <div class="loader-text">
                    <p class="main-loading-text">{{ loadingStageText }}</p>
                    <p class="sub-loading-text">正在分析业务经验 SKILL & 进行权限匹配...</p>
                  </div>
                </div>

                <!-- 解析结果确认面板 -->
                <div v-if="parseResult && !parsing" class="parse-result-panel animate-slide-up">
                  <div class="panel-header">
                    <span class="panel-title">
                      <el-icon class="success-icon"><SuccessFilled /></el-icon>
                      意图解析成功 (已关联底层 SKILL)
                    </span>
                    <el-tag size="small" type="success" effect="dark">匹配度 99%</el-tag>
                  </div>

                  <div class="result-details">
                    <el-form :model="parseResult" label-position="left" label-width="100px" size="small">
                      <el-form-item label="订阅任务名称">
                        <el-input v-model="parseResult.task_name" placeholder="请输入任务名" />
                      </el-form-item>
                      <el-form-item label="度量指标">
                        <div class="form-tag-list">
                          <el-tag v-for="m in parseResult.metrics" :key="m" size="small" type="info">{{ m }}</el-tag>
                        </div>
                      </el-form-item>
                      <el-form-item label="下钻维度">
                        <div class="form-tag-list">
                          <el-tag v-for="d in parseResult.dimensions" :key="d" size="small" type="warning">{{ d }}</el-tag>
                        </div>
                      </el-form-item>
                      <el-form-item label="时间范围">
                        <el-input v-model="parseResult.time_range" placeholder="时间范围" />
                      </el-form-item>
                      <el-form-item label="推送调度规则">
                        <el-input v-model="parseResult.schedule_cron" placeholder="频率" />
                      </el-form-item>
                      <el-form-item label="接收终端">
                        <el-input v-model="parseResult.recipient" placeholder="渠道" />
                      </el-form-item>
                    </el-form>
                  </div>

                  <!-- 权限校验提示 -->
                  <div class="permission-check-box" :class="{ 'warning-border': parseResult.hasSensitiveData }">
                    <div class="permission-header">
                      <el-icon class="shield-icon" :class="{ 'warn-icon': parseResult.hasSensitiveData }">
                        <component :is="parseResult.hasSensitiveData ? 'Warning' : 'Checked'" />
                      </el-icon>
                      <span class="shield-title">🔒 权限校验与敏感过滤</span>
                    </div>
                    <div class="permission-body">
                      <template v-if="parseResult.hasSensitiveData">
                        此订阅任务包含敏感运营指标（如：{{ parseResult.sensitiveMetrics.join('、') }}），系统已匹配您当前的<strong>「冷链运营总监」</strong>权限树，校验通过。若接收人变更，卡片内容将自动过滤敏感项。
                      </template>
                      <template v-else>
                        该订阅任务指标为常规公开级时效与货量数据，符合基础查看权限，校验通过。
                      </template>
                    </div>
                  </div>

                  <div class="panel-actions">
                    <el-button @click="resetParse">重新输入</el-button>
                    <el-button type="primary" class="confirm-btn" @click="confirmSubscription">确认创建订阅</el-button>
                  </div>
                </div>
              </div>
            </el-tab-pane>

            <!-- 选项卡2：已订阅任务管理 -->
            <el-tab-pane name="list">
              <template #label>
                <div class="tab-label">
                  <el-icon><List /></el-icon>
                  <span>已订阅任务</span>
                  <el-badge :value="subscriptions.length" class="tab-badge" type="info" />
                </div>
              </template>

              <div class="sub-list-container">
                <el-table :data="subscriptions" style="width: 100%" size="default" class="custom-table">
                  <el-table-column label="订阅名称" min-width="160">
                    <template #default="scope">
                      <div class="task-info-cell">
                        <span class="task-name" @click="triggerPush(scope.row)" style="cursor: pointer; color: rgb(0, 190, 190);">
                          {{ scope.row.task_name }}
                        </span>
                        <el-tag size="small" type="danger" class="sensitive-tag" effect="plain" v-if="scope.row.hasSensitiveData">预警/敏感</el-tag>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column label="关联SKILL" prop="associated_skill" min-width="140" show-overflow-tooltip>
                    <template #default="scope">
                      <code class="associated-skill-code">{{ scope.row.associated_skill || '干线时效分析SKILL' }}</code>
                    </template>
                  </el-table-column>
                  <el-table-column label="推送频率" prop="schedule_cron" width="100" />
                  <el-table-column label="接收人" min-width="120" show-overflow-tooltip>
                    <template #default="scope">
                      <span class="recipient-names">{{ scope.row.recipient }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="最近推送时间" prop="last_push_time" width="120" />
                  <el-table-column label="状态" width="70">
                    <template #default="scope">
                      <el-switch 
                        v-model="scope.row.active" 
                        active-color="rgb(0, 190, 190)" 
                        @change="handleStatusChange(scope.row)"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="180" fixed="right">
                    <template #default="scope">
                      <div class="table-actions">
                        <el-button link type="primary" size="small" @click="triggerPush(scope.row)">预览</el-button>
                        <el-button link type="primary" size="small" @click="openEditDialog(scope.row)">编辑</el-button>
                        <el-button link type="success" size="small" @click="showLogs(scope.row)">日志</el-button>
                        <el-button link type="danger" size="small" @click="deleteSubscription(scope.row)">删除</el-button>
                      </div>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </div>

      <!-- 右栏：自适应卡片推送预览 -->
      <div class="right-panel">
        <div class="preview-header">
          <div class="header-title">
            <el-icon class="preview-icon"><Monitor /></el-icon>
            <span>触达推送卡片预览 (钉钉互动卡片)</span>
          </div>
          <!-- 终端切换 -->
          <el-radio-group v-model="selectedTerminal" size="small" class="terminal-selector">
            <el-radio-button label="dingtalk">钉钉 (互动卡片)</el-radio-button>
            <el-radio-button label="feishu">飞书</el-radio-button>
            <el-radio-button label="wechat">企业微信</el-radio-button>
            <el-radio-button label="mail">邮件</el-radio-button>
          </el-radio-group>
        </div>

        <!-- 卡片预览区 -->
        <div class="preview-canvas-wrapper" :class="selectedTerminal">
          <!-- 手机外壳包装（钉钉/飞书/企微端） -->
          <div v-if="selectedTerminal !== 'mail'" class="phone-mockup">
            <div class="phone-status-bar">
              <span class="time-string">13:06</span>
              <div class="phone-notches">
                <span class="wifi-icon">📶</span>
                <span class="battery-icon">🔋</span>
              </div>
            </div>
            
            <div class="phone-app-header">
              <el-icon class="back-btn"><ArrowLeft /></el-icon>
              <span class="chat-title">{{ getTerminalTitle }}</span>
              <el-icon class="more-btn"><MoreFilled /></el-icon>
            </div>

            <div class="phone-chat-body">
              <div class="chat-time-divider">今天 {{ previewData.pushTime || '08:30' }}</div>

              <!-- 机器人推送气泡 -->
              <div class="bot-message-wrapper">
                <div class="bot-avatar"></div>
                <div class="bot-message-bubble">
                  
                  <!-- 实际的数据卡片主体 -->
                  <div class="adaptive-card" :class="selectedTerminal">
                    <!-- 1. 卡片页眉 -->
                    <div class="card-header">
                      <div class="header-accent"></div>
                      <div class="header-text-group">
                        <span class="card-tag">📊 智能问数日报/预警通知</span>
                        <h4 class="card-main-title">{{ previewData.task_name }}</h4>
                      </div>
                    </div>

                    <!-- 2. 预警/推送摘要信息 -->
                    <div class="card-summary-info">
                      <div class="info-row">
                        <span class="lbl">执行时间：</span>
                        <span class="val">2026-06-08 {{ previewData.pushTime || '08:30' }}</span>
                      </div>
                      <div class="info-row">
                        <span class="lbl">触发原因：</span>
                        <span class="val" :class="{ 'warning-reason': previewData.hasSensitiveData }">
                          {{ previewData.hasSensitiveData ? '⚠️ 触发指标预警 (整体准点率 < 95%)' : '周期投递任务' }}
                        </span>
                      </div>
                    </div>

                    <!-- 3. 大模型解读的“微报告” -->
                    <div class="card-report-section">
                      <div class="report-ai-badge">
                        <el-icon class="spark-icon"><Opportunity /></el-icon>
                        <span>Markdown 渲染内容 (Bot 回答区)</span>
                      </div>
                      <div class="report-content" v-html="formattedInsight"></div>
                    </div>

                    <!-- 4. 自适应数据图表区域 -->
                    <div class="card-chart-section">
                      <div class="chart-box" ref="previewChart"></div>
                    </div>

                    <!-- 5. 一键追问（互动式推送）快捷按钮 -->
                    <div class="card-actions-section">
                      <div class="actions-title">💬 互动行动点 (回流主系统)：</div>
                      <div class="action-buttons">
                        <button class="deeplink-btn" @click="handleDeepLinkRedirection(previewData)">
                          <el-icon class="btn-chat-icon"><ChatDotRound /></el-icon>
                          <span>查看完整数据 / 继续一键追问</span>
                          <el-icon class="btn-arrow"><ArrowRight /></el-icon>
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
            
            <div class="phone-chat-footer">
              <el-icon class="input-icon"><Mic /></el-icon>
              <div class="dummy-input">点击卡片内按钮一键追问</div>
              <el-icon class="input-icon"><CirclePlus /></el-icon>
            </div>
          </div>

          <!-- 邮件大排版预览 -->
          <div v-else class="mail-mockup animate-fade-in">
            <div class="mail-header-info">
              <div><strong>发件人：</strong> Antigravity 智能数据助理 &lt;assistant@antigravity.internal&gt;</div>
              <div><strong>收件人：</strong> {{ previewData.recipient || '当前用户' }}</div>
              <div><strong>主题：</strong> 📈 【智能订阅】{{ previewData.task_name }} (2026-06-08)</div>
            </div>
            
            <div class="mail-body-content">
              <div class="mail-card-container">
                <div class="mail-banner">
                  <h2>Antigravity 商业智能自动订阅报告</h2>
                  <p>您订阅的 <strong>{{ previewData.task_name }}</strong> 已准时送达。</p>
                </div>
                
                <div class="mail-section">
                  <h3>🧠 LLM 智能洞察与深度归因</h3>
                  <div class="mail-report-content" v-html="formattedInsight"></div>
                </div>

                <div class="mail-section">
                  <h3>📊 趋势对比图表</h3>
                  <div class="mail-chart-box" ref="mailChart"></div>
                </div>

                <div class="mail-footer-actions">
                  <div class="footer-action-tip">💡 本邮件由大模型驱动。如果您对数据有疑问或希望进一步下钻分析，请点击下方快捷追问按钮：</div>
                  <div class="mail-buttons-row">
                    <el-button type="primary" size="small" @click="handleDeepLinkRedirection(previewData)">
                      查看完整数据/继续一键追问
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================= -->
    <!-- 编辑配置 Dialog (个人中心) -->
    <!-- ========================================================= -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑订阅与预警配置"
      width="540px"
    >
      <el-form :model="editForm" label-position="top" size="default">
        <el-form-item label="订阅任务名称" required>
          <el-input v-model="editForm.task_name" />
        </el-form-item>

        <div class="form-grid-2">
          <el-form-item label="推送频率" required>
            <el-select v-model="editForm.frequency" style="width: 100%">
              <el-option label="每天" value="daily" />
              <el-option label="每周" value="weekly" />
              <el-option label="每月" value="monthly" />
            </el-select>
          </el-form-item>

          <el-form-item label="时间点" required>
            <el-time-picker v-model="editForm.pushTime" format="HH:mm" value-format="HH:mm" style="width: 100%" />
          </el-form-item>
        </div>

        <!-- 接收人 -->
        <el-form-item label="协同接收人 (手机号校验)">
          <div class="recipients-tags">
            <el-tag 
              v-for="user in editForm.recipients" 
              :key="user.phone" 
              :closable="user.phone !== 'self'"
              @close="removeEditRecipient(user)"
              type="info"
            >
              {{ user.name }}
            </el-tag>
          </div>
          <div class="phone-input-row" style="margin-top: 8px;">
            <el-input 
              v-model="editPhoneInput" 
              placeholder="输入手机号失焦校验" 
              size="small" 
              style="width: 280px"
              @blur="validateAndAddEditRecipient"
              @keyup.enter="validateAndAddEditRecipient"
            >
              <template #append>
                <el-button @click="validateAndAddEditRecipient">添加</el-button>
              </template>
            </el-input>
          </div>
        </el-form-item>

        <!-- 预警条件 -->
        <el-form-item label="推送触发机制">
          <el-radio-group v-model="editForm.triggerMode">
            <el-radio label="all">每次均推送</el-radio>
            <el-radio label="warning">仅满足特定条件时推送 (预警模式)</el-radio>
          </el-radio-group>
        </el-form-item>

        <div v-if="editForm.triggerMode === 'warning'" class="edit-condition-builder">
          <div class="builder-hdr">
            <span>预警规则：</span>
            <el-button type="primary" link size="small" @click="addEditCondition">+ 新增条件</el-button>
          </div>
          <div class="builder-list">
            <div v-for="(rule, idx) in editForm.conditions" :key="idx" class="rule-edit-row">
              <el-select v-model="rule.logical" size="small" style="width: 75px" v-if="idx > 0">
                <el-option label="且" value="AND" />
                <el-option label="或" value="OR" />
              </el-select>
              <span v-else style="width: 75px; font-size:12px; color:#999; text-align:right; display:inline-block; padding-right:8px;">当：</span>

              <el-select v-model="rule.field" size="small" style="width: 140px">
                <el-option label="整体准点率" value="ontime_rate" />
                <el-option label="超时车次" value="timeout_trucks" />
                <el-option label="积压工单数" value="backlog_count" />
                <el-option label="超时罚金" value="penalty_amount" />
              </el-select>

              <el-select v-model="rule.op" size="small" style="width: 100px">
                <el-option label="小于 (<)" value="<" />
                <el-option label="大于 (>)" value=">" />
                <el-option label="等于 (=)" value="=" />
                <el-option label="环比下降" value="down_ratio" />
              </el-select>

              <el-input v-model="rule.value" size="small" style="width: 70px" />

              <el-button v-if="editForm.conditions.length > 1" type="danger" link size="small" @click="removeEditCondition(idx)">
                删除
              </el-button>
            </div>
          </div>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEditConfig">保存修改</el-button>
      </template>
    </el-dialog>

    <!-- ========================================================= -->
    <!-- 查看执行日志 Dialog -->
    <!-- ========================================================= -->
    <el-dialog
      v-model="logsDialogVisible"
      :title="`[${selectedLogTask?.task_name}] 订阅执行日志记录`"
      width="600px"
    >
      <div class="logs-container">
        <el-timeline>
          <el-timeline-item
            v-for="(log, idx) in taskLogs"
            :key="idx"
            :timestamp="log.time"
            :type="log.status === 'success' ? 'success' : 'info'"
          >
            <div class="log-item-box">
              <div class="log-title">
                <strong>{{ log.event }}</strong>
                <el-tag size="small" :type="log.status === 'success' ? 'success' : 'info'" effect="plain">
                  {{ log.status === 'success' ? '触发推送' : '静默跳过' }}
                </el-tag>
              </div>
              <p class="log-detail-txt">{{ log.detail }}</p>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
      <template #footer>
        <el-button @click="logsDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import {
  Notification, Cpu, List, Promotion, Monitor, 
  Platform, ArrowLeft, MoreFilled, ArrowRight, Opportunity, 
  ChatDotRound, Checked, Warning, Mic, CirclePlus, SuccessFilled, User
} from '@element-plus/icons-vue'

const router = useRouter()

// 推荐指令
const suggestions = [
  "每天早上8:30，把昨天大区冷链干线的准点率发到我的钉钉里",
  "每周一早晨9:00，将上周品控退款明细和申诉率发到我的钉钉",
  "每天早上9点，发昨天的华东区销售额和利润率趋势，并对比上周数据"
]

// 界面状态
const activeTab = ref('list')
const selectedTerminal = ref('dingtalk')
const naturalLanguageInput = ref('')
const parsing = ref(false)
const loadingStageText = ref('正在理解意图')
const parseResult = ref(null)

// 订阅列表数据源
const subscriptions = ref([])

// 初始化基础订阅列表数据（如果 localStorage 为空则填入默认数据）
const initDefaultSubscriptions = () => {
  const defaultSubs = [
    {
      id: 1,
      task_name: "昨日华东冷链准点率异常",
      associated_skill: "华东干线时效与准点率分析SKILL",
      metrics: ["整体准点率", "超时车次"],
      dimensions: ["干线线路"],
      time_range: "昨天 (yesterday)",
      schedule_cron: "每天 08:30",
      recipient: "当前用户 (我)、张三",
      active: true,
      hasSensitiveData: true,
      sensitiveMetrics: ["整体准点率"],
      pushTime: "08:30",
      last_push_time: "今天 08:30",
      insight: `📊 **智能时效预警通知：昨日华东冷链准点率**<br/>昨日华东大区冷链干线整体准点率为 **92.5%** ⚠️，已**低于**设定的 95% 安全阈值，触发三级橙色预警。<br/><br/>- **异常路段**：华东冷链干线A线由于苏皖大雨限行，超时 2.4 小时；<br/>- **异常网点**：上海青浦集配站与北京路网点派送超时均呈上扬。<br/>*(💡 点击下方追问，回流系统对话分析具体滞留车次)*`,
      chartData: {
        categories: ['干线A线', '干线B线', '干线C线', '华南干线', '华北干线'],
        data: [89.2, 95.8, 93.0, 96.5, 94.8],
        label: '准点率 (%)'
      },
      stats: [
        { label: '预警类型', value: '指标低于95%', trend: 'down' },
        { label: '最低准点', value: '干线A线(89%)', trend: 'down' },
        { label: '整体准点率', value: '92.5%', trend: 'down' }
      ],
      followUps: ["为什么华东A线严重超时？", "上海青浦网点超时明细", "与上周同期数据对比"],
      rawConfig: {
        frequency: 'daily',
        pushTime: '08:30',
        recipients: [
          { name: '我 (创建者)', phone: 'self' },
          { name: '张三', phone: '13800138000' }
        ],
        triggerMode: 'warning',
        conditions: [
          { logical: 'AND', field: 'ontime_rate', op: '<', value: '95%' }
        ]
      }
    },
    {
      id: 2,
      task_name: "每日大区成交GMV早报",
      associated_skill: "大区销售业绩报表SKILL",
      metrics: ["成交GMV", "环比增长率"],
      dimensions: ["大区", "日期"],
      time_range: "昨天 (yesterday)",
      schedule_cron: "每天 08:30",
      recipient: "当前用户 (我)",
      active: true,
      hasSensitiveData: false,
      sensitiveMetrics: [],
      pushTime: "08:30",
      last_push_time: "今天 08:30",
      insight: `📊 **昨日业绩速递：稳中有升**<br/>昨日总成交GMV达 **150万**，环比 **增长 12%** 🚀。<br/>- **主力贡献**：华东区表现强劲（80万），占据半壁江山。<br/>- **预警提醒**：华北区仅为 20万，且环比出现 **5% 的下滑**，建议关注。`,
      chartData: {
        categories: ['华东区', '华南区', '华北区', '华中区', '西南区'],
        data: [80, 50, 20, 35, 25],
        label: 'GMV (万)'
      },
      stats: [
        { label: '销售冠军', value: '华东区(80w)', trend: 'up' },
        { label: '毛利警告', value: '华北下滑5%', trend: 'down' },
        { label: '整体环比', value: '+12%', trend: 'up' }
      ],
      followUps: ["查看各城市明细", "为什么华北区下滑了？", "与上周同期对比"],
      rawConfig: {
        frequency: 'daily',
        pushTime: '08:30',
        recipients: [
          { name: '我 (创建者)', phone: 'self' }
        ],
        triggerMode: 'all',
        conditions: []
      }
    }
  ]

  try {
    const listJson = localStorage.getItem('antigravity_subscriptions')
    if (!listJson) {
      localStorage.setItem('antigravity_subscriptions', JSON.stringify(defaultSubs))
      subscriptions.value = defaultSubs
    } else {
      subscriptions.value = JSON.parse(listJson)
    }
  } catch (e) {
    console.error(e)
    subscriptions.value = defaultSubs
  }
}

// 同步刷新列表
const refreshList = () => {
  try {
    const listJson = localStorage.getItem('antigravity_subscriptions')
    if (listJson) {
      subscriptions.value = JSON.parse(listJson)
    }
  } catch (e) {}
}

const handleTabChange = (tabName) => {
  if (tabName === 'list') {
    refreshList()
  }
}

// 预览数据
const previewData = ref({})

// 格式化洞察文本
const formattedInsight = computed(() => {
  if (!previewData.value.insight) return ''
  return previewData.value.insight
    .replace(/\n/g, '<br/>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/🚀/g, '<span style="color: #67c23a;">🚀</span>')
    .replace(/📈/g, '<span style="color: #67c23a;">📈</span>')
    .replace(/📉/g, '<span style="color: #f56c6c;">📉</span>')
})

// 图表 DOM 引用
const previewChart = ref(null)
const mailChart = ref(null)
let chartInstance = null
let mailChartInstance = null

const getTerminalTitle = computed(() => {
  switch (selectedTerminal.value) {
    case 'dingtalk': return '钉钉工作通知'
    case 'feishu': return '飞书数据助手'
    case 'wechat': return '企业微信工作通知'
    default: return '邮件预览'
  }
})

// 填充推荐指令
const fillInput = (text) => {
  naturalLanguageInput.value = text
}

// 模拟解析 AI 自然语言配置流程
const handleParse = () => {
  if (!naturalLanguageInput.value.trim()) {
    ElMessage.warning('请输入您的订阅需求描述！')
    return
  }

  parsing.value = true
  parseResult.value = null

  const stages = [
    { text: '🧠 正在分析自然语言意图...', delay: 0 },
    { text: '🕒 提取调度频率描述与时间范围...', delay: 600 },
    { text: '📊 匹配底层经验 SKILL 与安全校验...', delay: 1300 }
  ]

  stages.forEach(stage => {
    setTimeout(() => {
      if (parsing.value) {
        loadingStageText.value = stage.text
      }
    }, stage.delay)
  })

  setTimeout(() => {
    const text = naturalLanguageInput.value.toLowerCase()
    
    let parsed = {
      task_name: "昨日华东冷链准点率异常",
      metrics: ["整体准点率", "超时车次"],
      dimensions: ["干线线路"],
      time_range: "昨天 (yesterday)",
      recipient: "当前用户 (钉钉)",
      schedule_cron: "每天 08:30",
      hasSensitiveData: true,
      sensitiveMetrics: ["整体准点率"]
    }

    if (text.includes('gmv') || text.includes('成交')) {
      parsed.task_name = "每日大区成交GMV早报"
      parsed.metrics = ["成交GMV", "环比增长率"]
      parsed.dimensions = ["大区"]
      parsed.recipient = "当前用户 (我)"
      parsed.schedule_cron = "每天 08:30"
      parsed.hasSensitiveData = false
    }

    parsing.value = false
    parseResult.value = parsed
    ElMessage.success('意图提取并匹配成功，已生成确认面板！')
  }, 2000)
}

const resetParse = () => {
  parseResult.value = null
  naturalLanguageInput.value = ''
}

// 确认创建订阅
const confirmSubscription = () => {
  if (!parseResult.value.task_name) {
    ElMessage.warning('任务名称不能为空')
    return
  }

  const newSub = {
    id: Date.now(),
    task_name: parseResult.value.task_name,
    associated_skill: parseResult.value.hasSensitiveData ? "华东干线时效与准点率分析SKILL" : "大区销售业绩报表SKILL",
    metrics: [...parseResult.value.metrics],
    dimensions: [...parseResult.value.dimensions],
    time_range: parseResult.value.time_range,
    schedule_cron: parseResult.value.schedule_cron,
    recipient: parseResult.value.recipient,
    active: true,
    hasSensitiveData: parseResult.value.hasSensitiveData,
    sensitiveMetrics: parseResult.value.hasSensitiveData ? ["整体准点率"] : [],
    pushTime: "08:30",
    last_push_time: "刚刚",
    
    insight: parseResult.value.hasSensitiveData
      ? `📊 **智能时效预警通知：昨日华东冷链准点率**<br/>昨日华东大区冷链干线整体准点率为 **92.5%** ⚠️，已**低于**设定的 95% 安全阈值，触发三级橙色预警。<br/><br/>- **异常路段**：华东冷链干线A线由于苏皖大雨限行，超时 2.4 小时。`
      : `📊 **昨日业绩速递：稳中有升**<br/>昨日总成交GMV达 **150万**，环比 **增长 12%** 🚀。`,
    chartData: {
      categories: ['干线A线', '干线B线', '干线C线', '华南干线', '华北干线'],
      data: [89.2, 95.8, 93.0, 96.5, 94.8],
      label: '监控数值'
    },
    stats: [
      { label: '启用状态', value: '调度已激活', trend: 'up' },
      { label: '指标数', value: `${parseResult.value.metrics.length}个`, trend: 'up' },
      { label: '推送端口', value: '钉钉', trend: 'up' }
    ],
    followUps: ["为什么华东A线严重超时？", "上海青浦网点超时明细", "与上周同期数据对比"],
    rawConfig: {
      frequency: 'daily',
      pushTime: '08:30',
      recipients: [{ name: '我 (创建者)', phone: 'self' }],
      triggerMode: parseResult.value.hasSensitiveData ? 'warning' : 'all',
      conditions: parseResult.value.hasSensitiveData ? [
        { logical: 'AND', field: 'ontime_rate', op: '<', value: '95%' }
      ] : []
    }
  }

  // 写入 localStorage
  try {
    const list = [...subscriptions.value]
    list.unshift(newSub)
    localStorage.setItem('antigravity_subscriptions', JSON.stringify(list))
    subscriptions.value = list
  } catch (e) {}

  previewData.value = { ...newSub }
  
  nextTick(() => {
    initChart()
  })

  ElMessage.success('🎉 订阅任务创建成功，已同步写入已订阅列表！')
  activeTab.value = 'list'
  parseResult.value = null
  naturalLanguageInput.value = ''
}

const handleStatusChange = (row) => {
  // 同步到 localStorage
  try {
    localStorage.setItem('antigravity_subscriptions', JSON.stringify(subscriptions.value))
  } catch (e) {}
  ElMessage.success(`订阅 [${row.task_name}] 状态已更新为：${row.active ? '开启' : '关闭'}`)
}

const triggerPush = (row) => {
  previewData.value = { ...row }
  ElMessage.success(`🚀 手动推送预览卡片成功！已生成对应的钉钉卡片结构。`)
  
  nextTick(() => {
    initChart()
  })
}

const deleteSubscription = (row) => {
  ElMessageBox.confirm(`确认删除订阅 [${row.task_name}] 吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const list = subscriptions.value.filter(s => s.id !== row.id)
    subscriptions.value = list
    try {
      localStorage.setItem('antigravity_subscriptions', JSON.stringify(list))
    } catch (e) {}
    
    ElMessage.success('删除成功')
    
    if (previewData.value.id === row.id && list.length > 0) {
      previewData.value = { ...list[0] }
      nextTick(() => {
        initChart()
      })
    }
  }).catch(() => {})
}

// ----------------------------------------------------
// 钉钉 Deep Link 一键追问跳转回流
// ----------------------------------------------------
const handleDeepLinkRedirection = (row) => {
  ElMessageBox.confirm(`即将模拟 Deep Link 路由跳转，将回流至「问数对话」页面并加载此条订阅的问答上下文（深思模式）。确认执行吗？`, '提示', {
    confirmButtonText: '一键追问回流',
    cancelButtonText: '取消',
    type: 'success'
  }).then(() => {
    router.push({
      path: '/chat',
      query: {
        from_sub_id: row.id
      }
    })
  }).catch(() => {})
}

// ----------------------------------------------------
// 查看执行日志弹窗逻辑
// ----------------------------------------------------
const logsDialogVisible = ref(false)
const selectedLogTask = ref(null)
const taskLogs = ref([])

const showLogs = (row) => {
  selectedLogTask.value = row
  logsDialogVisible.value = true
  
  // 模拟生成与该任务匹配的高拟真日志
  const isWarningMode = row.rawConfig?.triggerMode === 'warning'
  
  taskLogs.value = [
    {
      time: '2026-06-08 08:30:00',
      event: isWarningMode ? '🚨 触发预警推送' : '🟢 周期性常规推送',
      status: 'success',
      detail: isWarningMode 
        ? `[定时调度] 执行关联 SKILL [${row.associated_skill || '干线时效分析SKILL'}]。获取指标「整体准点率」为 92.5%，已低于设定触发阈值(<95%)。已通过钉钉机器人互动接口，向 [${row.recipient}] 发送数据预警卡片。投递状态: 成功。`
        : `[定时调度] 执行关联 SKILL [${row.associated_skill || '干线时效分析SKILL'}]。获取整体业绩GMV达 150 万，符合正常周期投递要求。已向 [${row.recipient}] 成功投递数据卡片。`
    },
    {
      time: '2026-06-07 08:30:00',
      event: isWarningMode ? '⚪ 条件未达标，已略过' : '🟢 周期性常规推送',
      status: isWarningMode ? 'skip' : 'success',
      detail: isWarningMode
        ? `[定时调度] 执行关联 SKILL [${row.associated_skill || '干线时效分析SKILL'}]。获取指标「整体准点率」为 95.8%，符合安全线，未满足预警触发条件。系统执行静默，跳过消息卡片推送。`
        : `[定时调度] 执行关联 SKILL [${row.associated_skill || '干线时效分析SKILL'}]。已向 [${row.recipient}] 成功投递大区成交GMV数据日报卡片。`
    },
    {
      time: '2026-06-06 08:30:00',
      event: isWarningMode ? '🚨 触发预警推送' : '🟢 周期性常规推送',
      status: 'success',
      detail: isWarningMode
        ? `[定时调度] 执行关联 SKILL [${row.associated_skill || '干线时效分析SKILL'}]。获取指标「整体准点率」为 91.2%。触发预警条件(<95%)。已成功向钉钉工作圈推送预警。`
        : `[定时调度] 顺利完成数据整合，成功向 [${row.recipient}] 投递大区GMV卡片。`
    }
  ]
}

// ----------------------------------------------------
// 编辑配置 Dialog 逻辑 (个人中心)
// ----------------------------------------------------
const editDialogVisible = ref(false)
const editPhoneInput = ref('')
const editForm = ref({
  id: null,
  task_name: '',
  frequency: 'daily',
  pushTime: '08:30',
  recipients: [],
  triggerMode: 'all',
  conditions: []
})

const openEditDialog = (row) => {
  editPhoneInput.value = ''
  editForm.value = {
    id: row.id,
    task_name: row.task_name,
    frequency: row.rawConfig?.frequency || 'daily',
    pushTime: row.rawConfig?.pushTime || '08:30',
    recipients: row.rawConfig?.recipients ? [...row.rawConfig.recipients] : [{ name: '我 (创建者)', phone: 'self' }],
    triggerMode: row.rawConfig?.triggerMode || 'all',
    conditions: row.rawConfig?.conditions ? JSON.parse(JSON.stringify(row.rawConfig.conditions)) : [
      { logical: 'AND', field: 'ontime_rate', op: '<', value: '95%' }
    ]
  }
  editDialogVisible.value = true
}

const validateAndAddEditRecipient = () => {
  const phone = editPhoneInput.value.trim()
  if (!phone) return

  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(phone)) {
    ElMessage.error('❌ 未找到该企业员工，请核对手机号格式（11位数字）！')
    return
  }

  if (editForm.value.recipients.some(r => r.phone === phone)) {
    ElMessage.warning('该接收人已在列表中')
    editPhoneInput.value = ''
    return
  }

  // 模拟通讯录解析
  let matchedName = "李四 - 华东区运营主管"
  if (phone.endsWith('888')) {
    matchedName = "王五 - 供应链控制塔总监"
  } else if (phone.endsWith('000')) {
    matchedName = "张三 - 冷链业务负责人"
  }

  editForm.value.recipients.push({ name: matchedName, phone: phone })
  ElMessage.success(`✅ 成功添加企业员工：${matchedName}`)
  editPhoneInput.value = ''
}

const removeEditRecipient = (user) => {
  editForm.value.recipients = editForm.value.recipients.filter(r => r.phone !== user.phone)
}

const addEditCondition = () => {
  editForm.value.conditions.push({ logical: 'AND', field: 'ontime_rate', op: '<', value: '95%' })
}

const removeEditCondition = (idx) => {
  editForm.value.conditions.splice(idx, 1)
}

const saveEditConfig = () => {
  if (!editForm.value.task_name.trim()) {
    ElMessage.warning('名称不能为空')
    return
  }

  // 更新
  const index = subscriptions.value.findIndex(s => s.id === editForm.value.id)
  if (index !== -1) {
    const target = subscriptions.value[index]
    target.task_name = editForm.value.task_name
    target.schedule_cron = `${editForm.value.frequency === 'daily' ? '每天' : editForm.value.frequency === 'weekly' ? '每周一' : '每月1号'} ${editForm.value.pushTime}`
    target.recipient = editForm.value.recipients.map(r => r.name.split(' - ')[0]).join('、')
    target.hasSensitiveData = editForm.value.triggerMode === 'warning'
    target.pushTime = editForm.value.pushTime
    target.rawConfig = {
      frequency: editForm.value.frequency,
      pushTime: editForm.value.pushTime,
      recipients: [...editForm.value.recipients],
      triggerMode: editForm.value.triggerMode,
      conditions: [...editForm.value.conditions]
    }

    // 更新右侧展示
    if (previewData.value.id === target.id) {
      previewData.value = { ...target }
      nextTick(() => {
        initChart()
      })
    }
  }

  try {
    localStorage.setItem('antigravity_subscriptions', JSON.stringify(subscriptions.value))
  } catch (e) {}

  editDialogVisible.value = false
  ElMessage.success('订阅配置修改成功！已更新到后台调度程序。')
}

// ----------------------------------------------------
// ECharts 初始化与渲染逻辑
// ----------------------------------------------------
const initChart = () => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
  if (mailChartInstance) {
    mailChartInstance.dispose()
    mailChartInstance = null
  }

  const data = previewData.value.chartData
  if (!data) return

  const isPie = previewData.value.task_name.includes('品控')
  const colors = ['#00bebe', '#3c7bfd', '#1890ff', '#f56c6c', '#67c23a']

  if (previewChart.value && selectedTerminal.value !== 'mail') {
    chartInstance = echarts.init(previewChart.value)
    
    let option = {}
    if (isPie) {
      option = {
        tooltip: { trigger: 'item' },
        series: [
          {
            name: data.label,
            type: 'pie',
            radius: ['45%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 1 },
            color: colors,
            label: { show: true, fontSize: 9, formatter: '{b}\n({d}%)' },
            data: data.categories.map((cat, i) => ({ value: data.data[i], name: cat }))
          }
        ]
      }
    } else {
      option = {
        grid: { top: 25, right: 10, bottom: 20, left: 35 },
        xAxis: {
          type: 'category',
          data: data.categories,
          axisLabel: { fontSize: 9, color: '#909399' },
          axisTick: { show: false },
          axisLine: { lineStyle: { color: '#E4E7ED' } }
        },
        yAxis: {
          type: 'value',
          min: previewData.value.task_name.includes('准点率') ? 85 : 0,
          axisLabel: { fontSize: 9, color: '#909399' },
          splitLine: { lineStyle: { type: 'dashed', color: '#EBEEF5' } }
        },
        tooltip: { trigger: 'axis' },
        series: [
          {
            name: data.label,
            data: data.data,
            type: previewData.value.task_name.includes('准点率') ? 'line' : 'bar',
            barWidth: '40%',
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#00bebe' },
                { offset: 1, color: 'rgba(0, 190, 190, 0.1)' }
              ]),
              borderRadius: [4, 4, 0, 0]
            },
            lineStyle: { color: '#00bebe', width: 2.5 }
          }
        ]
      }
    }
    chartInstance.setOption(option)
  }

  if (mailChart.value && selectedTerminal.value === 'mail') {
    mailChartInstance = echarts.init(mailChart.value)
    
    let option = {
      title: { text: data.label, left: 'center', textStyle: { fontSize: 13 } },
      tooltip: { trigger: 'axis' },
      grid: { top: 40, right: 30, bottom: 30, left: 45 },
      xAxis: {
        type: 'category',
        data: data.categories
      },
      yAxis: {
        type: 'value',
        min: previewData.value.task_name.includes('准点率') ? 85 : 0
      },
      series: [
        {
          name: data.label,
          data: data.data,
          type: previewData.value.task_name.includes('准点率') ? 'line' : 'bar',
          barWidth: '35%',
          itemStyle: { color: '#00bebe' },
          lineStyle: { color: '#00bebe', width: 3 }
        }
      ]
    }
    mailChartInstance.setOption(option)
  }
}

watch(selectedTerminal, () => {
  nextTick(() => {
    initChart()
  })
})

onMounted(() => {
  initDefaultSubscriptions()
  if (subscriptions.value.length > 0) {
    previewData.value = { ...subscriptions.value[0] }
  }
  
  nextTick(() => {
    initChart()
  })
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  if (chartInstance) chartInstance.dispose()
  if (mailChartInstance) mailChartInstance.dispose()
  window.removeEventListener('resize', handleResize)
})

const handleResize = () => {
  if (chartInstance) chartInstance.resize()
  if (mailChartInstance) mailChartInstance.resize()
}
</script>

<style lang="scss" scoped>
$primary-color: rgb(0, 190, 190);
$bg-primary: rgb(255, 255, 255);
$bg-secondary: rgb(240, 242, 245);
$text-primary: rgba(0, 0, 0, 0.8);
$text-secondary: rgb(96, 98, 102);
$border-color: rgb(235, 238, 245);

.smart-sub-container {
  padding: 20px;
  background-color: $bg-secondary;
  min-height: calc(100vh - 84px);
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

// Banner
.sub-banner {
  background: linear-gradient(135deg, #091e36 0%, #002140 100%);
  padding: 20px 32px;
  border-radius: 8px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 33, 64, 0.12);

  .banner-content {
    .banner-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 10px;

      .logo-icon {
        color: $primary-color;
        font-size: 22px;
        animation: floatAnimation 3s ease-in-out infinite;
      }
    }

    .banner-desc {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.65);
    }
  }

  .banner-badge {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.15);
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 11px;
    display: flex;
    align-items: center;
    gap: 6px;

    .status-dot {
      width: 6px;
      height: 6px;
      background-color: $primary-color;
      border-radius: 50%;
      box-shadow: 0 0 6px $primary-color;
    }
  }
}

// 主体布局
.sub-main-layout {
  display: flex;
  gap: 20px;
  flex: 1;
}

.left-panel {
  flex: 55;
  min-width: 500px;
  display: flex;
  flex-direction: column;

  .main-tabs-card {
    border-radius: 8px;
    border: 1px solid $border-color;
    flex: 1;
    display: flex;
    flex-direction: column;

    :deep(.el-card__body) {
      padding: 20px;
      flex: 1;
      display: flex;
      flex-direction: column;
    }
  }

  .sub-tabs {
    flex: 1;
    display: flex;
    flex-direction: column;
    
    :deep(.el-tabs__content) {
      flex: 1;
      padding: 16px 0 0;
      overflow-y: auto;
    }
  }

  .tab-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 500;

    .tab-badge {
      margin-left: 4px;
      :deep(.el-badge__content) {
        transform: scale(0.8);
      }
    }
  }
}

// 配置助手内部
.assistant-content {
  display: flex;
  flex-direction: column;
  gap: 20px;

  .helper-welcome {
    display: flex;
    gap: 12px;
    align-items: flex-start;

    .ai-avatar {
      width: 32px;
      height: 32px;
      background: $primary-color;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 11px;
      font-weight: 700;
      flex-shrink: 0;
    }

    .welcome-speech {
      background-color: rgba(0, 190, 190, 0.04);
      border: 1px solid rgba(0, 190, 190, 0.08);
      padding: 10px 14px;
      border-radius: 4px;
      font-size: 12px;
      line-height: 1.6;

      p { margin: 0; }
    }
  }

  .prompt-suggestions {
    .suggest-label {
      font-size: 11px;
      color: $text-secondary;
      margin-bottom: 8px;
      display: block;
    }

    .suggest-items {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .suggest-tag {
        background: white;
        border: 1px solid $border-color;
        border-radius: 4px;
        padding: 5px 10px;
        font-size: 11px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: all 0.2s;

        &:hover {
          border-color: $primary-color;
          color: $primary-color;
          background: rgba(0, 190, 190, 0.02);
        }
      }
    }
  }

  .prompt-input-area {
    border: 1px solid $border-color;
    border-radius: 6px;
    background: #fdfdfd;
    overflow: hidden;

    &:focus-within {
      border-color: $primary-color;
    }

    .custom-textarea {
      :deep(.el-textarea__inner) {
        border: none;
        box-shadow: none;
        background: transparent;
        padding: 12px;
        font-size: 12px;
        line-height: 1.6;
      }
    }

    .input-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background: #f5f7fa;
      border-top: 1px solid $border-color;

      .input-tip {
        font-size: 11px;
        color: #999;
      }

      .btn-parse {
        background-color: $primary-color;
        border-color: $primary-color;
        font-size: 11px;
      }
    }
  }

  .parse-loader-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24px;
    background: #fdfdfd;
    border: 1px dashed $border-color;
    border-radius: 6px;
    gap: 12px;

    .gravity-waves {
      position: relative;
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;

      .wave {
        position: absolute;
        width: 100%;
        height: 100%;
        border: 2px solid $primary-color;
        border-radius: 50%;
        opacity: 0;
        animation: pulseWave 1.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
      }
      .wave1 { animation-delay: 0s; }
      .wave2 { animation-delay: 0.6s; }
    }

    .loader-text {
      text-align: center;
      p { margin: 0; }
      .main-loading-text {
        font-size: 12px;
        font-weight: 600;
        color: $primary-color;
        margin-bottom: 4px;
      }
      .sub-loading-text {
        font-size: 10px;
        color: $text-secondary;
      }
    }
  }

  .parse-result-panel {
    background: #ffffff;
    border: 1px solid $border-color;
    border-radius: 6px;
    padding: 16px;

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid $border-color;
      padding-bottom: 10px;
      margin-bottom: 14px;

      .panel-title {
        font-size: 13px;
        font-weight: 600;
        color: #333;
        display: flex;
        align-items: center;
        gap: 6px;

        .success-icon { color: #67c23a; }
      }
    }

    .result-details {
      margin-bottom: 12px;
      :deep(.el-form-item) { margin-bottom: 10px; }
      :deep(.el-form-item__label) { font-size: 11px; color: #999; }
    }

    .form-tag-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .permission-check-box {
      background: #f0f9eb;
      border: 1px solid #e1f3d8;
      border-radius: 4px;
      padding: 10px;
      margin-bottom: 16px;

      &.warning-border {
        background: #fef0f0;
        border-color: #fde2e2;
      }

      .permission-header {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 4px;
        font-weight: 500;
        font-size: 11px;

        .shield-icon {
          color: #67c23a;
          &.warn-icon { color: #f56c6c; }
        }
      }

      .permission-body {
        font-size: 10px;
        line-height: 1.4;
        color: $text-secondary;
      }
    }

    .panel-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      .confirm-btn { background-color: $primary-color; border-color: $primary-color; }
    }
  }
}

// 订阅列表管理
.sub-list-container {
  .task-info-cell {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: flex-start;

    .task-name {
      font-weight: 600;
      font-size: 12px;
    }
    
    .sensitive-tag {
      transform: scale(0.85);
      transform-origin: left;
    }
  }

  .associated-skill-code {
    background: #f4f5f7;
    color: #475569;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
  }

  .recipient-names {
    font-size: 11px;
    color: #606266;
  }

  .table-actions {
    display: flex;
    gap: 8px;
  }
}

// 右栏推送卡片预览
.right-panel {
  flex: 45;
  min-width: 420px;
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 8px;
  border: 1px solid $border-color;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
  overflow: hidden;

  .preview-header {
    padding: 14px 20px;
    border-bottom: 1px solid $border-color;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-title {
      font-size: 13px;
      font-weight: 600;
      color: #333;
      display: flex;
      align-items: center;
      gap: 8px;

      .preview-icon { color: $primary-color; }
    }

    .terminal-selector {
      :deep(.el-radio-button__inner) {
        font-size: 10px;
        padding: 4px 10px;
      }
      :deep(.el-radio-button__orig-radio:checked + .el-radio-button__inner) {
        background-color: $primary-color;
        border-color: $primary-color;
      }
    }
  }
}

.preview-canvas-wrapper {
  flex: 1;
  background-color: #e6ebf0;
  padding: 20px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  overflow-y: auto;

  &.feishu { background-color: #f0f3f6; }
  &.wechat { background-color: #ededed; }
  &.mail { background-color: #ffffff; padding: 0; }
}

.phone-mockup {
  width: 350px;
  height: 600px;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
  border: 6px solid #333;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;

  .phone-status-bar {
    height: 18px;
    background: #f3f3f3;
    padding: 0 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 9px;
    color: #666;
  }

  .phone-app-header {
    height: 40px;
    display: flex;
    align-items: center;
    padding: 0 10px;
    border-bottom: 1px solid #e5e5e5;
    background: #f8f8f8;

    .back-btn, .more-btn { font-size: 14px; color: #333; }
    .chat-title { flex: 1; text-align: center; font-size: 12px; font-weight: 600; }
  }

  .phone-chat-body {
    flex: 1;
    background: #f3f3f3;
    padding: 10px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;

    .chat-time-divider {
      text-align: center;
      font-size: 9px;
      color: #999;
      background: rgba(0, 0, 0, 0.04);
      align-self: center;
      padding: 1px 6px;
      border-radius: 8px;
    }
  }

  .phone-chat-footer {
    height: 44px;
    border-top: 1px solid #e5e5e5;
    background: #f8f8f8;
    display: flex;
    align-items: center;
    padding: 0 8px;
    gap: 6px;
    .input-icon { font-size: 18px; color: #777; }
    .dummy-input { flex: 1; height: 28px; background: white; border: 1px solid #ddd; border-radius: 4px; display: flex; align-items: center; padding-left: 8px; font-size: 10px; color: #999; }
  }
}

.bot-message-wrapper {
  display: flex;
  gap: 6px;
  align-items: flex-start;
  .bot-avatar {
    width: 28px;
    height: 28px;
    background-color: $primary-color;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .bot-message-bubble { flex: 1; max-width: 285px; }
}

// 精美的钉钉/自适应卡片
.adaptive-card {
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
  border: 1px solid rgba(0,0,0,0.05);
  overflow: hidden;
  display: flex;
  flex-direction: column;

  &.dingtalk { border-top: 4px solid #1890ff; .card-header { background: rgba(24, 144, 255, 0.03); } }
  &.feishu { border-top: 4px solid #00bebe; .card-header { background: rgba(0, 190, 190, 0.03); } }
  &.wechat { border-top: 4px solid #3c7bfd; .card-header { background: rgba(60, 123, 253, 0.03); } }

  .card-header {
    padding: 10px 12px;
    border-bottom: 1px solid #f2f2f2;
    .header-text-group {
      display: flex;
      flex-direction: column;
      gap: 2px;
      .card-tag { font-size: 9px; color: #888; }
      .card-main-title { margin: 0; font-size: 12px; font-weight: 600; color: #333; }
    }
  }

  .card-summary-info {
    padding: 8px 12px;
    background: #fafafa;
    border-bottom: 1px dashed #eee;
    font-size: 9px;
    display: flex;
    flex-direction: column;
    gap: 4px;

    .info-row {
      display: flex;
      justify-content: space-between;
      .lbl { color: #999; }
      .val { color: #555; }
      .warning-reason { color: #f56c6c; font-weight: 500; }
    }
  }

  .card-report-section {
    padding: 10px 12px;
    .report-ai-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 9px;
      color: $primary-color;
      background: rgba(0, 190, 190, 0.05);
      padding: 1px 5px;
      border-radius: 3px;
      margin-bottom: 6px;
    }
    .report-content { font-size: 10px; line-height: 1.4; color: #555; }
  }

  .card-chart-section {
    padding: 2px 12px;
    .chart-box { width: 100%; height: 120px; }
  }

  .card-actions-section {
    padding: 10px 12px;
    background: #fff;
    border-top: 1px solid #f2f2f2;

    .actions-title { font-size: 9px; color: #999; margin-bottom: 6px; }

    .deeplink-btn {
      background: #f0fdfa;
      border: 1px solid rgba(0, 190, 190, 0.25);
      border-radius: 4px;
      padding: 6px 10px;
      font-size: 11px;
      color: $primary-color;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      font-weight: 500;
      transition: all 0.2s;

      &:hover {
        background: rgba(0, 190, 190, 0.06);
        border-color: $primary-color;
      }

      .btn-chat-icon { font-size: 12px; margin-right: 4px; }
      .btn-arrow { font-size: 10px; }
    }
  }
}

// 邮件预览
.mail-mockup {
  background: white;
  width: 100%;
  max-width: 680px;

  .mail-header-info {
    padding: 12px 16px;
    background: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
    font-size: 11px;
    color: #495057;
  }

  .mail-body-content {
    padding: 16px;
    background-color: #fafbfc;
    .mail-card-container { background: white; border: 1px solid #e1e4e8; border-radius: 6px; overflow: hidden; }
    .mail-banner {
      background: #002140; color: white; padding: 16px; text-align: center;
      h2 { margin: 0 0 4px; font-size: 14px; color: $primary-color; }
      p { margin: 0; font-size: 10px; color: rgba(255,255,255,0.7); }
    }
    .mail-section {
      padding: 16px; border-bottom: 1px solid #eee;
      h3 { margin: 0 0 10px; font-size: 12px; color: #333; }
      .mail-report-content { font-size: 11px; line-height: 1.5; color: #555; }
      .mail-chart-box { width: 100%; height: 180px; }
    }
    .mail-footer-actions {
      padding: 16px; background: #fdfdfd;
      .footer-action-tip { font-size: 10px; color: #999; margin-bottom: 10px; }
      .mail-buttons-row { display: flex; gap: 8px; }
    }
  }
}

// 编辑弹窗
.form-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.recipients-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.edit-condition-builder {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 12px;
  
  .builder-hdr {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #666;
    margin-bottom: 8px;
  }
  
  .builder-list {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .rule-edit-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }
  }
}

// 日志弹窗
.logs-container {
  max-height: 400px;
  overflow-y: auto;
  padding: 8px;

  .log-item-box {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .log-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: #333;
    }

    .log-detail-txt {
      font-size: 11px;
      color: #777;
      margin: 4px 0 0;
      line-height: 1.4;
    }
  }
}

.animate-slide-up { animation: slideUp 0.3s ease-out; }
.animate-fade-in { animation: fadeIn 0.3s ease-out; }

@keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes floatAnimation { 0% { transform: translateY(0px); } 50% { transform: translateY(-3px); } 100% { transform: translateY(0px); } }

.loading-icon-custom {
  display: inline-block;
  width: 10px;
  height: 10px;
  border: 2px solid white;
  border-left-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 4px;
}
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>
