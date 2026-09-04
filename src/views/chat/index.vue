<template>
  <div class="chat-container">
    <!-- 左侧对话列表 -->
    <div class="chat-sidebar-left">
      <div class="sidebar-left-header">
        <h3>我的对话</h3>
        <el-button type="primary" size="small" @click="openNewChatDialog">
          + 新聊天
        </el-button>
      </div>
      <div class="conversation-list">
        <div 
          v-for="(conversation, index) in conversationList" 
          :key="index" 
          class="conversation-item" 
          :class="{ active: selectedConversation === index }"
          @click="selectConversation(index)"
        >
          <div class="conversation-content">
            <div class="conversation-title">
              {{ conversation.title }}
              <el-badge v-if="conversation.hasNewMessage" type="danger" :value="''" class="conversation-badge" />
              <el-icon v-if="conversation.completed" class="completed-icon"><Check /></el-icon>
            </div>
            <div class="conversation-preview">{{ conversation.preview }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 中间聊天区域 -->
    <div class="chat-main">
      <!-- 顶部模式选择与标题 -->
      <div class="chat-header">
        <div class="header-left">
          <h2>{{ currentConversation?.title || '问数对话' }}</h2>
          <el-tag v-if="isDeepLinkRefreshed" type="warning" effect="dark" size="small" class="deeplink-badge">
            🔗 钉钉预警卡片回流中
          </el-tag>
        </div>
        <div class="mode-selector">
          <el-radio-group v-model="selectedMode" @change="handleModeChange">
            <el-radio-button label="quick">快速模式</el-radio-button>
            <el-radio-button label="thinking">思考模式</el-radio-button>
          </el-radio-group>
        </div>
      </div>
      
      <!-- 思考模式提示 -->
      <div v-if="selectedMode === 'thinking'" class="thinking-mode-alert">
        <el-alert
          title="思考模式加载时间较长，系统将在后台自动生成推理链，可通过右侧列表查看分析步骤"
          type="warning"
          show-icon
          :closable="false"
        />
      </div>

      <!-- 回流引导 Alert -->
      <div v-if="isDeepLinkRefreshed" class="deeplink-alert animate-slide-up">
        <el-alert
          title="💡 已为您复原「昨日华东冷链准点率预警」的数据上下文。您可以点击下方快捷按钮，或直接输入问题，向 AI 追问异常原因及明细。"
          type="success"
          show-icon
          @close="isDeepLinkRefreshed = false"
        />
      </div>
      
      <!-- 新对话输入区 -->
      <div v-if="selectedConversation === null" class="new-chat-area">
        <div class="assistant-welcome-logo">Antigravity</div>
        <h3>开启智能问数对话</h3>
        <p>输入自然语言问题，调动底层 SKILL 挖掘海量供应链及运营数据。</p>
        <div class="welcome-input-row">
          <el-input
            v-model="inputMessage"
            placeholder="例如：昨日华东大区冷链干线的准点率是多少？"
            @keyup.enter="sendMessage"
            class="main-welcome-input"
          >
            <template #suffix>
              <el-button type="primary" circle @click="sendMessage">
                <el-icon><Position /></el-icon>
              </el-button>
            </template>
          </el-input>
        </div>
        <div class="recommended-questions">
          <div class="rec-label">您可以试着问：</div>
          <div class="rec-buttons">
            <el-button 
              v-for="(question, index) in recommendedQuestions" 
              :key="index"
              @click="selectRecommendedQuestion(question)"
              class="rec-btn"
            >
              {{ question }}
            </el-button>
          </div>
        </div>
      </div>
      
      <!-- 聊天消息区 -->
      <div v-else class="chat-messages" ref="chatScrollContainer">
        <div 
          v-for="(message, index) in currentConversation.messages" 
          :key="index" 
          class="message-item" 
          :class="message.type"
        >
          <div class="message-content">
            <div class="message-header">
              <span class="message-sender">{{ message.sender }}</span>
              <span class="message-time">{{ message.time }}</span>
            </div>
            
            <!-- 文本展示区，支持 HTML 渲染 -->
            <div class="message-text" v-html="message.text"></div>

            <!-- 智能订阅卡片提示 (非阻断式) -->
            <div 
              v-if="message.suggestSubscription && !message.subscriptionClosed" 
              class="smart-subscription-card animate-fade-in-down"
              :class="{ 'animate-fade-out-up': message.isClosing }"
            >
              <div class="card-left">
                <el-icon class="bell-icon"><Notification /></el-icon>
              </div>
              <div class="card-center">
                <div class="card-title">发现您在关注【{{ message.timeKeyword }}】【{{ message.businessKeyword }}】动态</div>
                <div class="card-desc">系统检测到该查询具有高频监控价值，建议开启定时预警任务，数据将自动投递至企业微信/钉钉。</div>
              </div>
              <div class="card-right">
                <el-button 
                  type="primary" 
                  size="small" 
                  class="btn-configure"
                  @click="handleConfigureCard(message)"
                >
                  一键配置监控
                </el-button>
                <el-button 
                  link 
                  class="btn-close"
                  @click="handleCloseCard(message)"
                >
                  <el-icon><Close /></el-icon>
                </el-button>
              </div>
            </div>

            <!-- 数据明细表格（如果是追问返回的数据） -->
            <div v-if="message.tableData" class="message-table-box">
              <el-table :data="message.tableData" border size="small" style="width: 100%">
                <el-table-column 
                  v-for="col in message.tableCols" 
                  :key="col.prop" 
                  :prop="col.prop" 
                  :label="col.label" 
                />
              </el-table>
            </div>

            <!-- 操作面板（订阅此问答入口） -->
            <div 
              v-if="message.type === 'ai' && !message.isThinkingMsg" 
              class="message-actions-bar"
            >
              <el-button 
                type="primary" 
                link 
                size="small" 
                class="sub-action-btn"
                @click="openSubscriptionDrawer(message, index)"
              >
                <el-icon class="sub-bell-icon"><Notification /></el-icon>
                <span>🔔 订阅此问答</span>
              </el-button>
              <el-button link size="small">复制回答</el-button>
              <el-button link size="small">点赞</el-button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 底部悬浮反馈组件（位于输入框上方） -->
      <FeedbackFloatingBar
        v-if="selectedConversation !== null && currentConversation?.completed"
        :query-id="feedbackQueryId"
        @feedback-submit="handleFeedbackSubmit"
      />

      <!-- 输入区域 -->
      <div v-if="selectedConversation !== null" class="chat-input-area">
        <!-- 快捷追问推荐（回流状态下展示） -->
        <div v-if="currentConversation.followUpButtons && currentConversation.followUpButtons.length > 0" class="input-follow-ups">
          <span class="tip-lbl">快捷追问：</span>
          <el-button 
            v-for="fup in currentConversation.followUpButtons" 
            :key="fup" 
            size="small" 
            round
            type="primary"
            plain
            @click="selectRecommendedQuestion(fup)"
          >
            {{ fup }}
          </el-button>
        </div>

        <div class="textarea-wrapper">
          <el-input
            v-model="inputMessage"
            type="textarea"
            placeholder="请输入您的问题... (Ctrl+Enter 发送)"
            :rows="3"
            @keyup.enter.ctrl="sendMessage"
            resize="none"
          />
          <div class="input-actions">
            <span class="ctrl-enter-tip">按 Ctrl + Enter 发送</span>
            <el-button type="primary" class="send-btn" @click="sendMessage">发送</el-button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 右侧进度列表 -->
    <div class="chat-sidebar-right">
      <div class="sidebar-right-header">
        <h3>分析进度 (SKILL 运行步骤)</h3>
      </div>
      <div class="progress-list">
        <div v-if="progressList.length === 0" class="progress-empty">
          <el-icon class="empty-icon"><Cpu /></el-icon>
          <p>当前无正在运行的分析任务</p>
        </div>
        <el-timeline v-else>
          <el-timeline-item
            v-for="(item, index) in progressList"
            :key="index"
            :timestamp="item.time"
            :type="item.status === 'completed' ? 'success' : 'warning'"
          >
            <div class="progress-item">
              <div class="progress-title">{{ item.title }}</div>
              <div class="progress-status">{{ item.status === 'completed' ? '已完成' : '下钻中' }}</div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
    </div>
    
    <!-- 新对话对话框 -->
    <el-dialog
      v-model="newChatDialogVisible"
      title="开启新对话"
      width="500px"
    >
      <el-form label-width="100px">
        <el-form-item label="模式选择">
          <el-radio-group v-model="newChatMode">
            <el-radio-button label="quick">快速模式</el-radio-button>
            <el-radio-button label="thinking">思考模式</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="问题">
          <el-input
            v-model="newChatQuestion"
            type="textarea"
            placeholder="请输入您的问题"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="newChatDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="createNewChat">创建</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- ========================================================= -->
    <!-- 订阅配置 Drawer (三个迭代阶段集成) -->
    <!-- ========================================================= -->
    <el-drawer
      v-model="subDrawerVisible"
      title="配置智能问数订阅"
      direction="rtl"
      size="520px"
      custom-class="sub-config-drawer"
    >
      <div class="drawer-scroll-container">
        <!-- 头部提示 -->
        <div class="drawer-alert-banner">
          <el-icon class="banner-icon"><Opportunity /></el-icon>
          <div>
            <strong>基于 SKILL 绑定配置：</strong> 
            当前订阅将基于底层的 <code>{{ activeSkillName }}</code> 定期执行，保持计算逻辑与当前问答完全一致。
          </div>
        </div>

        <el-form :model="subForm" label-position="top" class="drawer-form">
          <!-- 阶段一表单项 -->
          <div class="form-section">
            <h4 class="section-title">1. 定时投递基础设置 (阶段一)</h4>
            
            <el-form-item label="订阅任务名称" required>
              <el-input v-model="subForm.task_name" placeholder="请输入订阅名称" />
            </el-form-item>

            <div class="form-row-grid">
              <el-form-item label="推送频率" required>
                <el-select v-model="subForm.frequency" placeholder="请选择频率">
                  <el-option label="每天" value="daily" />
                  <el-option label="每周" value="weekly" />
                  <el-option label="每月" value="monthly" />
                </el-select>
              </el-form-item>

              <el-form-item label="推送时间" required>
                <el-time-picker
                  v-model="subForm.pushTime"
                  format="HH:mm"
                  value-format="HH:mm"
                  placeholder="选择时间"
                  style="width: 100%"
                />
              </el-form-item>
            </div>

            <el-form-item label="推送通道">
              <el-input value="钉钉互动卡片 (已绑定当前账号)" disabled>
                <template #prefix>
                  <el-icon><Platform /></el-icon>
                </template>
              </el-input>
              <span class="sub-form-tip">系统将自动推送到当前绑定的钉钉企业工作通知。</span>
            </el-form-item>
          </div>

          <!-- 阶段二表单项：接收人配置 -->
          <div class="form-section">
            <h4 class="section-title">2. 协同接收人设置 (阶段二)</h4>
            
            <el-form-item label="添加订阅接收人">
              <div class="recipient-tag-list">
                <el-tag 
                  v-for="user in subForm.recipients" 
                  :key="user.phone" 
                  :closable="user.phone !== 'self'"
                  size="default" 
                  type="info"
                  @close="removeRecipient(user)"
                >
                  <el-icon class="tag-user-icon"><User /></el-icon>
                  {{ user.name }} {{ user.phone !== 'self' ? `(${user.phone})` : '' }}
                </el-tag>
              </div>

              <!-- 添加输入手机号框 -->
              <div class="add-recipient-wrapper">
                <el-input
                  v-model="recipientPhoneInput"
                  placeholder="输入员工手机号，失焦后自动验证"
                  size="small"
                  class="phone-check-input"
                  clearable
                  @blur="validateAndAddRecipient"
                  @keyup.enter="validateAndAddRecipient"
                  :loading="verifyingPhone"
                >
                  <template #append>
                    <el-button @click="validateAndAddRecipient">添加</el-button>
                  </template>
                </el-input>
              </div>
              
              <span class="warning-tip-text">
                🔒 被添加人将收到订阅卡片通知。请确保对方具备相应业务数据的查看权限。
              </span>
            </el-form-item>
          </div>

          <!-- 阶段三表单项：条件触发设置 -->
          <div class="form-section">
            <h4 class="section-title">3. 触发条件设置 (阶段三)</h4>
            
            <el-form-item label="推送触发机制">
              <el-radio-group v-model="subForm.triggerMode" class="trigger-mode-radios">
                <el-radio label="all">每次执行后均推送</el-radio>
                <el-radio label="warning">仅满足特定条件时推送 (预警控制塔)</el-radio>
              </el-radio-group>
            </el-form-item>

            <!-- 规则构建器 (Condition Builder) -->
            <div v-if="subForm.triggerMode === 'warning'" class="condition-builder-panel animate-slide-up">
              <div class="builder-header">
                <span>预警规则构建器</span>
                <el-button type="primary" link size="small" @click="addConditionRule">+ 增加条件</el-button>
              </div>

              <div class="condition-rules-list">
                <div v-for="(rule, idx) in subForm.conditions" :key="idx" class="rule-row">
                  <!-- 条件连接词 -->
                  <el-select v-model="rule.logical" class="logical-select" size="small" v-if="idx > 0">
                    <el-option label="且 (AND)" value="AND" />
                    <el-option label="或 (OR)" value="OR" />
                  </el-select>
                  <span v-else class="first-rule-placeholder">当：</span>

                  <el-select v-model="rule.field" placeholder="选择字段" size="small" class="field-select">
                    <el-option 
                      v-for="item in activeSkillFields" 
                      :key="item.value" 
                      :label="item.label" 
                      :value="item.value" 
                    />
                  </el-select>

                  <el-select v-model="rule.op" placeholder="运算符" size="small" class="op-select">
                    <el-option label="小于 (<)" value="<" />
                    <el-option label="大于 (>)" value=">" />
                    <el-option label="等于 (=)" value="=" />
                    <el-option label="环比下降" value="down_ratio" />
                    <el-option label="同比下降" value="down_year" />
                  </el-select>

                  <el-input v-model="rule.value" placeholder="阈值" size="small" class="val-input" />

                  <el-button 
                    v-if="subForm.conditions.length > 1" 
                    type="danger" 
                    link 
                    size="small" 
                    class="del-rule-btn"
                    @click="removeConditionRule(idx)"
                  >
                    删除
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </el-form>
      </div>

      <template #footer>
        <div class="drawer-footer">
          <el-button @click="subDrawerVisible = false">取消</el-button>
          <el-button type="primary" class="save-sub-btn" @click="saveSubscription">保存并开启订阅</el-button>
        </div>
      </template>
    </el-drawer>


  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { checkSubscriptionIntent, extractKeywords } from '@/utils/IntentRecognizer'
import FeedbackFloatingBar from '@/components/FeedbackFloatingBar.vue'
import { 
  Notification, ArrowRight, Checked, Warning, User, Plus, 
  Cpu, Position, Platform, Opportunity, ChatDotRound, Check, Close
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

// 选择的模式
const selectedMode = ref('quick')

// 对话列表
const conversationList = ref([
  {
    id: 1,
    title: '昨日华东冷链准点率异常',
    preview: '分析昨日华东冷链时效情况...',
    hasNewMessage: false,
    completed: true,
    mode: 'quick',
    messages: [
      {
        type: 'user',
        sender: '用户',
        text: '昨日华东大区冷链干线的准点率是多少？是否触发预警？',
        time: '10:00'
      },
      {
        type: 'ai',
        sender: 'AI',
        text: `📊 **昨日华东大区冷链干线准点率报告：**<br/>昨日华东大区冷链干线整体准点率为 **92.5%** ⚠️，已**低于**设定的 95% 安全阈值，触发三级橙色预警。<br/><br/>- **异常主因**：华东干线A路段由于暴雨导致交通管制，超时2.4小时，影响了整体均值。<br/>- **异常网点**：上海青浦集配站与南京栖霞网点派送积压严重。<br/>*(💡 您可直接订阅此问答，以便每日由钉钉自动推送时效报表与归因)*`,
        time: '10:01',
        tableCols: [
          { prop: 'line', label: '干线线路' },
          { prop: 'ontime', label: '昨日准点率' },
          { prop: 'status', label: '状态' }
        ],
        tableData: [
          { line: '华东冷链干线A线', ontime: '89.2%', status: '严重超时 🔴' },
          { line: '华东冷链干线B线', ontime: '95.8%', status: '正常 🟢' },
          { line: '华东冷链干线C线', ontime: '93.0%', status: '轻微延误 🟡' }
        ]
      }
    ],
    followUpButtons: ["为什么华东A线严重超时？", "上海青浦网点超时明细", "与上周同期数据对比"]
  },
  {
    id: 2,
    title: '最近7天销量趋势',
    preview: '最近7天的销量趋势如何...',
    hasNewMessage: false,
    completed: true,
    mode: 'quick',
    messages: [
      {
        type: 'user',
        sender: '用户',
        text: '最近7天的销量趋势如何？',
        time: '09:30'
      },
      {
        type: 'ai',
        sender: 'AI',
        text: '最近7天的销量呈上升趋势。华东大区总件量上涨了12%，主要由于大客户促销活动。目前各网点派送正常，未见爆仓异常。',
        time: '09:31'
      }
    ]
  }
])

// 选中的对话
const selectedConversation = ref(null)

// 输入消息
const inputMessage = ref('')

// 进度列表
const progressList = ref([])

// 推荐问题
const recommendedQuestions = ref([
  '今天最新开单货量异常，请定时发送给我',
  '每天早上帮我统计哪些网点有温度异常',
  '昨日华东大区冷链干线的准点率是多少？是否触发预警？'
])

// 新对话对话框
const newChatDialogVisible = ref(false)
const newChatMode = ref('quick')
const newChatQuestion = ref('')

// 当前对话
const currentConversation = computed(() => {
  if (selectedConversation.value === null) return null
  return conversationList.value[selectedConversation.value]
})

// 滚动容器引用
const chatScrollContainer = ref(null)

// 底部悬浮反馈组件：当前查询 ID
const feedbackQueryId = computed(() => {
  if (!currentConversation.value) return ''
  return `query_${currentConversation.value.id}_${Date.now()}`
})

// 底部悬浮反馈组件：处理反馈提交
const handleFeedbackSubmit = (data) => {
  console.log('[反馈组件] 用户提交反馈：', data)
  if (data.isApproved) {
    ElMessage.success('感谢您的认可！')
  } else {
    ElMessage.info('已收到您的反馈，我们会持续优化。')
  }
}

// ----------------------------------------------------
// Deep Link 跳转回流逻辑
// ----------------------------------------------------
const isDeepLinkRefreshed = ref(false)

onMounted(() => {
  const fromSubId = route.query.from_sub_id
  if (fromSubId) {
    // 模拟匹配对应被订阅问题
    isDeepLinkRefreshed.value = true
    
    // 选中第一个对话（即“昨日华东冷链准点率异常”对话）
    selectedConversation.value = 0
    selectedMode.value = 'quick'
    
    // 追加提示性消息
    currentConversation.value.messages.push({
      type: 'system',
      sender: '系统',
      text: '🔔 针对 [昨日华东冷链准点率预警] 钉钉卡片的一键追问通道已激活。上下文状态已复原。',
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    })

    // 滚动到底部
    nextTick(() => {
      scrollToBottom()
    })
  }
})

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (chatScrollContainer.value) {
      chatScrollContainer.value.scrollTop = chatScrollContainer.value.scrollHeight
    }
  })
}

// 打开新对话对话框
const openNewChatDialog = () => {
  newChatDialogVisible.value = true
}

// 创建新对话
const createNewChat = () => {
  if (newChatQuestion.value.trim() === '') return
  
  const newConversation = {
    id: conversationList.value.length + 1,
    title: newChatQuestion.value.substring(0, 15) + (newChatQuestion.value.length > 15 ? '...' : ''),
    preview: newChatQuestion.value.substring(0, 30) + (newChatQuestion.value.length > 30 ? '...' : ''),
    hasNewMessage: false,
    completed: false,
    mode: newChatMode.value,
    messages: [
      {
        type: 'user',
        sender: '用户',
        text: newChatQuestion.value,
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      }
    ]
  }
  
  conversationList.value.unshift(newConversation)
  selectedConversation.value = 0
  selectedMode.value = newChatMode.value
  
  // 发送消息
  if (newChatMode.value === 'thinking') {
    simulateThinkingMode(newChatQuestion.value, 0)
  } else {
    setTimeout(() => {
      conversationList.value[0].messages.push({
        type: 'ai',
        sender: 'AI',
        text: `这是对 "${newChatQuestion.value}" 的快速模式回复。已调动底层 SKILL 运行。`,
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      })
      conversationList.value[0].completed = true
      scrollToBottom()
    }, 500)
  }
  
  newChatDialogVisible.value = false
  newChatQuestion.value = ''
}

// 选择对话
const selectConversation = (index) => {
  selectedConversation.value = index
  selectedMode.value = conversationList.value[index].mode
  conversationList.value[index].hasNewMessage = false
  scrollToBottom()
}

// 选择推荐问题
const selectRecommendedQuestion = (question) => {
  inputMessage.value = question
  sendMessage()
}

// 处理模式切换
const handleModeChange = () => {
  if (selectedConversation.value !== null) {
    conversationList.value[selectedConversation.value].mode = selectedMode.value
  }
}

// 发送消息
// 发送消息
const sendMessage = () => {
  if (inputMessage.value.trim() === '') return
  
  const queryText = inputMessage.value.trim()
  inputMessage.value = ''

  if (selectedConversation.value === null) {
    // 新对话
    const newConversation = {
      id: conversationList.value.length + 1,
      title: queryText.substring(0, 15) + (queryText.length > 15 ? '...' : ''),
      preview: queryText.substring(0, 30) + (queryText.length > 30 ? '...' : ''),
      hasNewMessage: false,
      completed: false,
      mode: selectedMode.value,
      messages: [
        {
          type: 'user',
          sender: '用户',
          text: queryText,
          time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        }
      ]
    }
    
    conversationList.value.unshift(newConversation)
    selectedConversation.value = 0
    
    if (selectedMode.value === 'thinking') {
      simulateThinkingMode(queryText, 0)
    } else {
      setTimeout(() => {
        respondToMessage(queryText, 0)
      }, 500)
    }
  } else {
    // 现有对话
    conversationList.value[selectedConversation.value].messages.push({
      type: 'user',
      sender: '用户',
      text: queryText,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    })
    
    scrollToBottom()

    if (selectedMode.value === 'thinking') {
      simulateThinkingMode(queryText, selectedConversation.value)
    } else {
      setTimeout(() => {
        respondToMessage(queryText, selectedConversation.value)
      }, 800)
    }
  }
}

// 提取命中的关键词，预填订阅 Drawer
const openSubscriptionDrawerWithKeywords = (queryText, keywords) => {
  // 根据提取的关键词，自动解析频率
  let frequency = 'daily'
  if (queryText.includes('每星期') || queryText.includes('每周') || queryText.includes('周一') || queryText.includes('星期')) {
    frequency = 'weekly'
  } else if (queryText.includes('每个月') || queryText.includes('每月')) {
    frequency = 'monthly'
  }
  
  // 提取具体的推送时间
  let pushTime = '08:30'
  if (queryText.includes('晚上')) {
    pushTime = '20:30'
  } else if (queryText.includes('早上') || queryText.includes('上午')) {
    pushTime = '08:30'
  } else if (queryText.includes('下午')) {
    pushTime = '14:30'
  }
  
  // 订阅任务名称
  const primaryBusiness = keywords.business.split('、')[0] || '物流指标'
  const primaryTime = keywords.time.split('、')[0] || '定期'
  const defaultName = `订阅-${primaryTime}${primaryBusiness}`

  subForm.value = {
    task_name: defaultName,
    frequency: frequency,
    pushTime: pushTime,
    recipients: [
      { name: '我 (创建者)', phone: 'self' }
    ],
    triggerMode: 'all',
    conditions: [
      { logical: 'AND', field: 'ontime_rate', op: '<', value: '95%' }
    ]
  }

  recipientPhoneInput.value = ''
  subDrawerVisible.value = true
}

// 智能订阅提示卡片配置回调
const handleConfigureCard = (message) => {
  openSubscriptionDrawerWithKeywords(message.text || '', { 
    time: message.timeKeyword, 
    business: message.businessKeyword 
  })
}

// 智能订阅提示卡片关闭回调（带细腻淡出动画）
const handleCloseCard = (message) => {
  message.isClosing = true
  setTimeout(() => {
    message.subscriptionClosed = true
  }, 300)
}


// 模拟自动回复（支持追问分支）
const respondToMessage = (query, conversationIndex) => {
  let replyText = ""
  let tableData = null
  let tableCols = null
  let followUps = []

  if (query.includes('为什么华东A线') || query.includes('严重超时')) {
    replyText = `🔍 **针对华东冷链干线A线严重超时的下钻分析：**<br/>底层的「干线时效异常归因 SKILL」分析得出以下主因：<br/>1. **极端暴雨管制**：昨日苏皖段遭遇强降雨，G2京沪高速临沂-淮安段自 14:20 至 16:30 实施了双向限行，导致车牌为「沪B-9831A」的冷链主干车在高速服务区被迫滞留 2.1 小时；<br/>2. **配载装车延误**：上海青浦集配站由于前置扫描扫码枪出现局部故障，装车较计划时间延迟了 25 分钟。`
    followUps = ["查看该车次的温控详情", "青浦站前置扫描故障记录", "下载时效明细表"]
  } else if (query.includes('青浦') || query.includes('网点超时')) {
    replyText = `📊 **上海青浦集配站昨日超时明细：**<br/>昨日青浦集配站共处理冷链包裹 **1.2万** 件，发生超时派送 **185** 件，超时率 **1.54%**。明细分类如下表所示：`
    tableCols = [
      { prop: 'reason', label: '超时归因' },
      { prop: 'count', label: '超时件数' },
      { prop: 'ratio', label: '占比' }
    ]
    tableData = [
      { reason: '末端派送运力不足', count: '98 件', ratio: '53.0%' },
      { reason: '干线接驳车迟到', count: '55 件', ratio: '29.7%' },
      { reason: '包装破损重新贴标', count: '32 件', ratio: '17.3%' }
    ]
    followUps = ["申请末端运力调配", "派送超时网点明细"]
  } else {
    replyText = `💡 针对您的问题 "${query}"，已成功调用底层对应业务经验 SKILL。相关数据运行稳定，各项准点率与健康度指标良好。`
  }

  // 检测是否触发订阅意图建议
  const hasSubIntent = checkSubscriptionIntent(query)
  let timeKeyword = ""
  let businessKeyword = ""
  if (hasSubIntent) {
    const keywords = extractKeywords(query)
    timeKeyword = keywords.time
    businessKeyword = keywords.business
  }

  conversationList.value[conversationIndex].messages.push({
    type: 'ai',
    sender: 'AI',
    text: replyText,
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    tableData: tableData,
    tableCols: tableCols,
    suggestSubscription: hasSubIntent,
    timeKeyword: timeKeyword,
    businessKeyword: businessKeyword,
    subscriptionClosed: false,
    isClosing: false
  })

  // 更新追问推荐按钮
  conversationList.value[conversationIndex].followUpButtons = followUps
  conversationList.value[conversationIndex].completed = true
  
  scrollToBottom()

  // 如果触发了订阅意图，等回答完毕后再弹出提醒
  if (hasSubIntent) {
    setTimeout(() => {
      ElMessageBox.confirm(
        `系统检测到您在关注时效词汇【${timeKeyword}】和核心指标【${businessKeyword}】。是否立即为此查询配置自动订阅，以便定时推送到钉钉？`,
        '💡 智能问数订阅建议',
        {
          confirmButtonText: '开启订阅',
          cancelButtonText: '暂不需要',
          type: 'info'
        }
      ).then(() => {
        openSubscriptionDrawerWithKeywords(query, { time: timeKeyword, business: businessKeyword })
      }).catch(() => {
        // 用户取消或关闭，无动作，仍保留页面内卡片
      })
    }, 600)
  }
}

// 模拟思考模式
const simulateThinkingMode = (message, conversationIndex) => {
  progressList.value = []
  
  conversationList.value[conversationIndex].messages.push({
    type: 'ai',
    sender: 'AI',
    text: '正在深度思考并加载分析链...',
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    isThinkingMsg: true
  })
  
  progressList.value.push({
    title: '分析自然语言意图 & 匹配底层 SKILL 算子',
    status: 'in_progress',
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  })
  
  scrollToBottom()

  setTimeout(() => {
    progressList.value[0].status = 'completed'
    progressList.value.push({
      title: '生成并提取时效/准点率业务规则与 SQL',
      status: 'in_progress',
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    })
    
    setTimeout(() => {
      progressList.value[1].status = 'completed'
      progressList.value.push({
        title: '读取底层干线 GPS 及网点扫描明细数据进行多维归因',
        status: 'in_progress',
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      })
      
      setTimeout(() => {
        progressList.value[2].status = 'completed'
        
        // 移除思考占位消息
        conversationList.value[conversationIndex].messages = conversationList.value[conversationIndex].messages.filter(m => !m.isThinkingMsg)
        
        respondToMessage(message, conversationIndex)
      }, 1500)
    }, 1000)
  }, 1000)
}

// =========================================================
// 订阅配置 Drawer 逻辑 (集成阶段一、二、三)
// =========================================================
const subDrawerVisible = ref(false)
const activeSkillName = ref('华东干线时效与准点率分析SKILL')
const recipientPhoneInput = ref('')
const verifyingPhone = ref(false)

// 订阅字段定义
const subForm = ref({
  task_name: '',
  frequency: 'daily',
  pushTime: '08:30',
  recipients: [
    { name: '我 (创建者)', phone: 'self' }
  ],
  triggerMode: 'all', // all 或 warning
  conditions: [
    { logical: 'AND', field: 'ontime_rate', op: '<', value: '95%' }
  ]
})

// 条件字段备选项
const activeSkillFields = [
  { label: '整体准点率 (ontime_rate)', value: 'ontime_rate' },
  { label: '干线超时车次 (timeout_trucks)', value: 'timeout_trucks' },
  { label: '网点积压工单数 (backlog_count)', value: 'backlog_count' },
  { label: '时效超时罚金 (penalty_amount)', value: 'penalty_amount' }
]

// 打开订阅 Drawer
const openSubscriptionDrawer = (message, msgIndex) => {
  // 提取当前对话的问题作为默认订阅名
  let defaultName = '订阅-冷链准点率时效分析'
  if (selectedConversation.value !== null) {
    const userMsg = currentConversation.value.messages.find(m => m.type === 'user')
    if (userMsg) {
      defaultName = `订阅-${userMsg.text.substring(0, 20)}`
    }
  }

  subForm.value = {
    task_name: defaultName,
    frequency: 'daily',
    pushTime: '08:30',
    recipients: [
      { name: '我 (创建者)', phone: 'self' }
    ],
    triggerMode: 'all',
    conditions: [
      { logical: 'AND', field: 'ontime_rate', op: '<', value: '95%' }
    ]
  }

  recipientPhoneInput.value = ''
  subDrawerVisible.value = true
}

// 阶段二：校验并添加接收人
const validateAndAddRecipient = () => {
  const phone = recipientPhoneInput.value.trim()
  if (!phone) return

  // 11位电话号码模拟校验
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(phone)) {
    ElMessage.error('❌ 未找到该企业员工，请核对手机号格式（11位数字）！')
    return
  }

  // 防重复添加
  if (subForm.value.recipients.some(r => r.phone === phone)) {
    ElMessage.warning('该接收人已在列表中')
    recipientPhoneInput.value = ''
    return
  }

  verifyingPhone.value = true
  
  setTimeout(() => {
    verifyingPhone.value = false
    
    // 模拟匹配组织架构
    let matchedName = "李四 - 华东区运营主管"
    if (phone.endsWith('888')) {
      matchedName = "王五 - 供应链控制塔总监"
    } else if (phone.endsWith('000')) {
      matchedName = "张三 - 冷链业务负责人"
    }

    subForm.value.recipients.push({
      name: matchedName,
      phone: phone
    })

    ElMessage.success(`✅ 成功添加企业员工：${matchedName}`)
    recipientPhoneInput.value = ''
  }, 600)
}

// 移除接收人
const removeRecipient = (user) => {
  subForm.value.recipients = subForm.value.recipients.filter(r => r.phone !== user.phone)
}

// 阶段三：条件规则添加与删除
const addConditionRule = () => {
  subForm.value.conditions.push({
    logical: 'AND',
    field: 'ontime_rate',
    op: '<',
    value: '95%'
  })
}
const removeConditionRule = (idx) => {
  subForm.value.conditions.splice(idx, 1)
}

// 保存订阅到 LocalStorage
const saveSubscription = () => {
  if (!subForm.value.task_name.trim()) {
    ElMessage.warning('请输入订阅任务名称！')
    return
  }

  // 构造标准本地存储订阅格式
  const newSubItem = {
    id: Date.now(), // 随机唯一 ID
    task_name: subForm.value.task_name,
    metrics: subForm.value.triggerMode === 'warning' 
      ? subForm.value.conditions.map(c => c.field) 
      : ["准点率", "干线时效"],
    dimensions: ["干线线路", "城市"],
    time_range: "昨天 (yesterday)",
    schedule_cron: `${subForm.value.frequency === 'daily' ? '每天' : subForm.value.frequency === 'weekly' ? '每周一' : '每月1号'} ${subForm.value.pushTime}`,
    recipient: subForm.value.recipients.map(r => r.name.split(' - ')[0]).join('、'),
    active: true,
    hasSensitiveData: subForm.value.conditions.some(c => c.field.includes('penalty_amount')),
    sensitiveMetrics: ["时效超时罚金"],
    pushTime: subForm.value.pushTime,
    
    // 用于预览的模拟数据结构
    insight: subForm.value.triggerMode === 'warning'
      ? `📊 **智能预警推送通知：[${subForm.value.task_name}]**\n昨日系统时效指标触发预警阀值！\n- **预警详情**：准点率(92.5%) 低于阀值(95%)\n- **干线预警**：华东A线昨日发生大面积延误。`
      : `📊 **每日问数订阅日报：[${subForm.value.task_name}]**\n昨日时效总体达标，准点率在安全阈值运行。\n- **平均准点率**：96.2% 🟢\n- **异常归因**：无重大超时车次。`,
    chartData: {
      categories: ['华东A线', '华东B线', '华东C线', '华南干线', '华北干线'],
      data: [89.2, 95.8, 93.0, 96.5, 94.8],
      label: '准点率 (%)'
    },
    stats: [
      { label: '触发类型', value: subForm.value.triggerMode === 'warning' ? '阈值报警' : '周期推送', trend: 'up' },
      { label: '当前准点率', value: '92.5%', trend: 'down' },
      { label: '接收总人数', value: `${subForm.value.recipients.length}人`, trend: 'up' }
    ],
    followUps: ["为什么华东A线严重超时？", "上海青浦网点超时明细", "与上周同期数据对比"],
    
    // 保存完整配置信息
    rawConfig: {
      frequency: subForm.value.frequency,
      pushTime: subForm.value.pushTime,
      recipients: [...subForm.value.recipients],
      triggerMode: subForm.value.triggerMode,
      conditions: [...subForm.value.conditions]
    }
  }

  // 写入 localStorage
  try {
    const existingListJson = localStorage.getItem('antigravity_subscriptions')
    let existingList = existingListJson ? JSON.parse(existingListJson) : []
    existingList.unshift(newSubItem)
    localStorage.setItem('antigravity_subscriptions', JSON.stringify(existingList))
  } catch (e) {
    console.error('LocalStorage error', e)
  }

  subDrawerVisible.value = false
  ElMessage.success('🎉 问答周期订阅任务已成功创建！已在调度中心同步开启。')
}
</script>

<style lang="scss" scoped>
.chat-container {
  display: flex;
  height: 100vh;
  background-color: rgb(240, 242, 245);
  overflow: hidden;
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif;
  
  // 左侧对话列表
  .chat-sidebar-left {
    width: 280px;
    background-color: white;
    border-right: 1px solid rgb(235, 238, 245);
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    
    .sidebar-left-header {
      padding: 16px;
      border-bottom: 1px solid rgb(235, 238, 245);
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      h3 {
        font-size: 14px;
        font-weight: 600;
        margin: 0;
        color: rgba(0, 0, 0, 0.8);
      }
    }
    
    .conversation-list {
      flex: 1;
      overflow-y: auto;
      
      .conversation-item {
        padding: 16px;
        border-bottom: 1px solid rgb(235, 238, 245);
        cursor: pointer;
        transition: background-color 0.2s;
        
        &:hover {
          background-color: rgb(240, 242, 245);
        }
        
        &.active {
          background-color: rgb(230, 247, 255);
          border-left: 4px solid rgb(0, 190, 190);
        }
        
        .conversation-content {
          position: relative;
          
          .conversation-title {
            font-size: 13px;
            font-weight: 500;
            margin-bottom: 6px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            color: rgba(0, 0, 0, 0.85);
            
            .conversation-badge {
              margin-left: 8px;
            }
            
            .completed-icon {
              color: #67c23a;
              font-size: 14px;
            }
          }
          
          .conversation-preview {
            font-size: 11px;
            color: rgb(96, 98, 102);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      }
    }
  }
  
  // 中间聊天区域
  .chat-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: white;
    
    .chat-header {
      padding: 16px 24px;
      border-bottom: 1px solid rgb(235, 238, 245);
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .header-left {
        display: flex;
        align-items: center;
        gap: 12px;

        h2 {
          font-size: 15px;
          font-weight: 600;
          margin: 0;
          color: rgba(0, 0, 0, 0.85);
        }
      }

      .deeplink-badge {
        font-size: 10px;
        animation: floatAnimation 2s infinite ease-in-out;
      }
    }
    
    .thinking-mode-alert {
      margin: 12px 24px 0;
    }

    .deeplink-alert {
      margin: 12px 24px 0;
      :deep(.el-alert) {
        border-radius: 6px;
      }
    }
    
    // 欢迎首屏样式
    .new-chat-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0 15%;
      background: radial-gradient(circle at top, rgba(0, 190, 190, 0.05) 0%, transparent 60%);
      
      .assistant-welcome-logo {
        font-size: 36px;
        font-weight: 800;
        color: rgb(0, 190, 190);
        margin-bottom: 12px;
        letter-spacing: 1px;
        text-shadow: 0 4px 10px rgba(0, 190, 190, 0.15);
      }

      h3 {
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 12px;
        color: rgba(0, 0, 0, 0.8);
      }
      
      p {
        font-size: 13px;
        color: rgb(96, 98, 102);
        margin-bottom: 32px;
        text-align: center;
      }

      .welcome-input-row {
        width: 100%;
        max-width: 550px;
        margin-bottom: 32px;

        .main-welcome-input {
          :deep(.el-input__wrapper) {
            border-radius: 24px;
            padding: 8px 6px 8px 16px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.06);
            border: 1px solid #dcdfe6;
            
            &:focus-within {
              border-color: rgb(0, 190, 190);
            }
          }
        }
      }
      
      .recommended-questions {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;

        .rec-label {
          font-size: 12px;
          color: #999;
        }

        .rec-buttons {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: center;
          
          .rec-btn {
            font-size: 12px;
            border-radius: 16px;
            background: #f4f7f9;
            border: 1px solid #e2e8f0;
            color: #4a5568;
            transition: all 0.2s;

            &:hover {
              border-color: rgb(0, 190, 190);
              color: rgb(0, 190, 190);
              background: rgba(0, 190, 190, 0.02);
            }
          }
        }
      }
    }
    
    // 对话气泡列表区
    .chat-messages {
      flex: 1;
      padding: 24px;
      overflow-y: auto;
      background: #f8fafc;
      display: flex;
      flex-direction: column;
      gap: 20px;
      
      .message-item {
        display: flex;
        width: 100%;

        &.user {
          justify-content: flex-end;
          
          .message-content {
            background-color: rgb(0, 190, 190);
            color: white;
            border-radius: 12px 12px 0 12px;
            box-shadow: 0 3px 10px rgba(0, 190, 190, 0.15);
          }
          
          .message-sender {
            color: rgba(255, 255, 255, 0.8);
          }

          .message-time {
            color: rgba(255, 255, 255, 0.65);
          }
        }
        
        &.ai {
          justify-content: flex-start;
          
          .message-content {
            background-color: white;
            color: rgba(0, 0, 0, 0.85);
            border-radius: 12px 12px 12px 0;
            border: 1px solid rgb(235, 238, 245);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
          }

          .message-sender {
            color: rgb(0, 190, 190);
            font-weight: 600;
          }

          .message-time {
            color: rgb(144, 147, 153);
          }
        }

        &.system {
          justify-content: center;

          .message-content {
            background-color: #f0fdf4;
            color: #166534;
            border: 1px solid #bbf7d0;
            border-radius: 6px;
            font-size: 11px;
            padding: 6px 12px;
            max-width: 80%;
            text-align: center;
          }
        }
        
        .message-content {
          padding: 14px 16px;
          max-width: 75%;
          
          .message-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 11px;
            gap: 16px;
          }
          
          .message-text {
            font-size: 13px;
            line-height: 1.6;
          }
        }

        .message-table-box {
          margin-top: 12px;
          border-radius: 6px;
          overflow: hidden;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }

        // 操作栏（包括一键订阅）
        .message-actions-bar {
          margin-top: 12px;
          border-top: 1px solid #f2f2f2;
          padding-top: 8px;
          display: flex;
          gap: 12px;
          font-size: 11px;

          .el-button {
            font-size: 11px;
            color: #909399;

            &:hover {
              color: #333;
            }
          }

          .sub-action-btn {
            color: rgb(0, 190, 190) !important;
            font-weight: 500;

            &:hover {
              color: darken(rgb(0, 190, 190), 10%) !important;
            }

            .sub-bell-icon {
              font-size: 11px;
              margin-right: 4px;
            }
          }
        }
      }
    }
    
    // 输入框底栏
    .chat-input-area {
      padding: 16px 24px 20px;
      border-top: 1px solid rgb(235, 238, 245);
      background: white;

      // 快捷追问区
      .input-follow-ups {
        display: flex;
        gap: 8px;
        align-items: center;
        margin-bottom: 12px;
        flex-wrap: wrap;

        .tip-lbl {
          font-size: 11px;
          color: #999;
        }

        .el-button {
          font-size: 11px;
          padding: 4px 10px;
          height: auto;
        }
      }
      
      .textarea-wrapper {
        border: 1px solid #dcdfe6;
        border-radius: 6px;
        overflow: hidden;
        
        :deep(.el-textarea__inner) {
          border: none;
          box-shadow: none;
          padding: 12px;
          font-size: 13px;
          color: rgba(0,0,0,0.8);
          line-height: 1.5;
        }

        .input-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: #f8fafc;
          border-top: 1px solid #f1f5f9;

          .ctrl-enter-tip {
            font-size: 11px;
            color: #94a3b8;
          }

          .send-btn {
            background-color: rgb(0, 190, 190);
            border-color: rgb(0, 190, 190);

            &:hover {
              background-color: lighten(rgb(0, 190, 190), 5%);
              border-color: lighten(rgb(0, 190, 190), 5%);
            }
          }
        }
      }
    }
  }
  
  // 右侧进度列表
  .chat-sidebar-right {
    width: 260px;
    background-color: white;
    border-left: 1px solid rgb(235, 238, 245);
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    
    .sidebar-right-header {
      padding: 16px;
      border-bottom: 1px solid rgb(235, 238, 245);
      
      h3 {
        font-size: 13px;
        font-weight: 600;
        margin: 0;
        color: rgba(0, 0, 0, 0.8);
      }
    }
    
    .progress-list {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      
      .progress-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: #c0c4cc;
        text-align: center;

        .empty-icon {
          font-size: 32px;
          margin-bottom: 12px;
        }
        p {
          font-size: 12px;
          margin: 0;
        }
      }

      .progress-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
        
        .progress-title {
          font-size: 12px;
          color: #333;
          line-height: 1.4;
          font-weight: 500;
        }
        
        .progress-status {
          font-size: 10px;
          color: rgb(144, 147, 153);
        }
      }
    }
  }
}

// ----------------------------------------------------
// 订阅配置 Drawer 样式
// ----------------------------------------------------
.drawer-scroll-container {
  padding: 20px;
  height: calc(100vh - 120px);
  overflow-y: auto;

  .drawer-alert-banner {
    background: rgba(0, 190, 190, 0.05);
    border: 1px solid rgba(0, 190, 190, 0.15);
    padding: 12px 16px;
    border-radius: 6px;
    font-size: 12px;
    color: #0f3057;
    display: flex;
    gap: 8px;
    line-height: 1.5;
    margin-bottom: 24px;

    .banner-icon {
      font-size: 16px;
      color: rgb(0, 190, 190);
      flex-shrink: 0;
    }
    code {
      font-weight: 600;
      color: rgb(0, 190, 190);
    }
  }

  .form-section {
    margin-bottom: 28px;
    
    .section-title {
      font-size: 13px;
      font-weight: 600;
      color: #303133;
      border-left: 3px solid rgb(0, 190, 190);
      padding-left: 8px;
      margin: 0 0 16px;
    }

    .sub-form-tip {
      font-size: 11px;
      color: #999;
      margin-top: 4px;
      display: block;
    }

    .warning-tip-text {
      font-size: 11px;
      color: #f56c6c;
      margin-top: 8px;
      display: block;
      line-height: 1.4;
    }
  }

  .form-row-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  // 接收人列表标签与手机输入
  .recipient-tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;

    .tag-user-icon {
      font-size: 12px;
      margin-right: 4px;
    }
  }

  .add-recipient-wrapper {
    max-width: 320px;
  }

  .trigger-mode-radios {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  // 规则构建器面板
  .condition-builder-panel {
    margin-top: 16px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 16px;

    .builder-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      font-weight: 600;
      color: #475569;
      margin-bottom: 12px;
    }

    .condition-rules-list {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .rule-row {
        display: flex;
        align-items: center;
        gap: 8px;

        .logical-select {
          width: 80px;
          flex-shrink: 0;
        }

        .first-rule-placeholder {
          width: 80px;
          font-size: 12px;
          color: #94a3b8;
          text-align: right;
          padding-right: 4px;
        }

        .field-select {
          flex: 2;
        }

        .op-select {
          flex: 1.2;
        }

        .val-input {
          width: 80px;
          flex-shrink: 0;
        }

        .del-rule-btn {
          color: #ef4444;
        }
      }
    }
  }
}

.drawer-footer {
  padding: 16px 20px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;

  .save-sub-btn {
    background-color: rgb(0, 190, 190);
    border-color: rgb(0, 190, 190);

    &:hover {
      background-color: lighten(rgb(0, 190, 190), 5%);
    }
  }
}

.animate-slide-up {
  animation: slideUp 0.25s ease-out;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes floatAnimation {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-3px); }
  100% { transform: translateY(0px); }
}

// 响应式
@media (max-width: 1024px) {
  .chat-container {
    flex-direction: column;
    
    .chat-sidebar-left, .chat-sidebar-right {
      width: 100%;
      height: 180px;
    }
  }
}

// 智能订阅提醒卡片
.smart-subscription-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background-color: #f0f7ff; // 柔和蓝色背景
  border: 1px solid #d0e7ff;
  border-radius: 8px;
  padding: 12px 16px;
  margin: 12px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease-out;

  &.animate-fade-in-down {
    animation: fadeInDown 0.35s ease-out forwards;
  }

  &.animate-fade-out-up {
    animation: fadeOutUp 0.3s ease-out forwards;
  }

  .card-left {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background-color: #e0f0ff;
    border-radius: 50%;
    color: #0076fe;
    flex-shrink: 0;

    .bell-icon {
      font-size: 18px;
      animation: bellRing 3s ease-in-out infinite;
    }
  }

  .card-center {
    flex: 1;
    min-width: 0;
    text-align: left;

    .card-title {
      font-size: 13px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 2px;
    }

    .card-desc {
      font-size: 11px;
      color: #64748b;
      line-height: 1.4;
    }
  }

  .card-right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;

    .btn-configure {
      background-color: #0076fe;
      border-color: #0076fe;
      color: #fff;
      font-weight: 500;
      font-size: 11px;
      padding: 6px 12px;
      height: auto;

      &:hover {
        background-color: #005ecb;
        border-color: #005ecb;
      }
    }

    .btn-close {
      color: #94a3b8;
      padding: 4px;
      font-size: 16px;
      
      &:hover {
        color: #64748b;
        background-color: rgba(0, 0, 0, 0.05);
        border-radius: 4px;
      }
    }
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeOutUp {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(8px) scale(0.95);
  }
}

@keyframes bellRing {
  0%, 100% { transform: rotate(0); }
  5%, 15%, 25% { transform: rotate(8deg); }
  10%, 20%, 30% { transform: rotate(-8deg); }
  35% { transform: rotate(0); }
}
</style>