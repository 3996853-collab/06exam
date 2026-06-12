<template>
  <div class="ai-config-container">
    <!-- 顶部导航 -->
    <div class="ai-header">
      <div class="header-left">
        <el-button @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h2 class="page-title">智能规则配置助手</h2>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="confirmRule">确认生成规则</el-button>
      </div>
    </div>

    <div class="ai-content">
      <!-- 左侧对话区 -->
      <div class="chat-panel">
        <div class="chat-header">
          <div class="agent-info">
            <div class="agent-avatar">
              <el-icon><Setting /></el-icon>
            </div>
            <div class="agent-detail">
              <div class="agent-name">智能配置助手</div>
              <div class="agent-status">在线 - 随时为您服务</div>
            </div>
          </div>
        </div>

        <div class="chat-messages" ref="chatMessages">
          <div 
            v-for="(msg, index) in messages" 
            :key="index"
            class="message-item"
            :class="{ 'is-ai': msg.isAI }"
          >
            <div v-if="msg.isAI" class="message-avatar ai-avatar">
              <el-icon><Setting /></el-icon>
            </div>
            <div v-else class="message-avatar user-avatar">
              <el-icon><UserFilled /></el-icon>
            </div>
            <div class="message-content">
              <div v-if="msg.isAI" class="message-bubble ai-bubble">
                <div class="message-text">{{ msg.content }}</div>
                <div v-if="msg.params" class="message-params">
                  <div class="params-title">已识别的关键参数：</div>
                  <div 
                    v-for="(param, pIndex) in msg.params" 
                    :key="pIndex"
                    class="param-item"
                  >
                    <span class="param-label">{{ param.label }}</span>
                    <span 
                      class="param-value" 
                      @click="editParam(param)"
                    >{{ param.value }}</span>
                    <el-icon class="param-edit"><EditPen /></el-icon>
                  </div>
                </div>
                <div v-if="msg.suggestions" class="message-suggestions">
                  <div class="suggestions-title">追问澄清：</div>
                  <div 
                    v-for="(suggestion, sIndex) in msg.suggestions" 
                    :key="sIndex"
                    class="suggestion-item"
                    @click="handleSuggestion(suggestion)"
                  >
                    {{ suggestion }}
                  </div>
                </div>
              </div>
              <div v-else class="message-bubble user-bubble">
                {{ msg.content }}
              </div>
            </div>
          </div>
        </div>

        <div class="chat-input-area">
          <el-input 
            v-model="userInput" 
            placeholder="请用日常语言描述您的预警需求..."
            class="chat-input"
            @keyup.enter="sendMessage"
          />
          <el-button type="primary" @click="sendMessage">
            <el-icon><Plus /></el-icon>
            发送
          </el-button>
        </div>
      </div>

      <!-- 右侧实时预览区 -->
      <div class="preview-panel">
        <div class="panel-title">
          <el-icon><Document /></el-icon>
          规则预览
        </div>

        <div class="preview-content">
          <div class="rule-name-preview">
            <label>规则名称</label>
            <el-input v-model="generatedRule.name" />
          </div>

          <div class="rule-description">
            <label>规则描述</label>
            <div class="description-text">{{ generatedRule.description }}</div>
          </div>

          <div class="rule-visual">
            <label>规则逻辑</label>
            <div class="visual-flow">
              <div 
                v-for="(step, index) in generatedRule.steps" 
                :key="index"
                class="flow-step"
              >
                <div class="step-icon" :class="step.type">
                  <el-icon>{{ getStepIcon(step.type) }}</el-icon>
                </div>
                <div class="step-content">
                  <div class="step-label">{{ step.label }}</div>
                  <div class="step-value">{{ step.value }}</div>
                </div>
                <div v-if="index < generatedRule.steps.length - 1" class="step-arrow">
                  <el-icon><ArrowRight /></el-icon>
                </div>
              </div>
            </div>
          </div>

          <div class="rule-actions-preview">
            <label>触发动作</label>
            <div class="actions-list">
              <div 
                v-for="(action, index) in generatedRule.actions" 
                :key="index"
                class="action-item"
              >
                <el-icon class="action-icon">{{ getActionIcon(action.type) }}</el-icon>
                <span class="action-text">{{ action.text }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="panel-footer">
          <el-button @click="resetRule">重新生成</el-button>
          <el-button type="primary" @click="goToBuilder">进入编辑器</el-button>
        </div>
      </div>
    </div>

    <!-- 参数编辑弹窗 -->
    <el-dialog title="编辑参数" v-model="showParamModal" width="400px">
      <div class="param-edit-form">
        <div class="form-item">
          <label>{{ editingParam.label }}</label>
          <el-input v-model="editingParam.value" />
        </div>
      </div>
      <template #footer>
        <el-button @click="showParamModal = false">取消</el-button>
        <el-button type="primary" @click="saveParamEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ArrowLeft, ArrowUp, Message, UserFilled, Plus, EditPen, Document, ArrowRight,
  Bell, Clock, Box, Setting
} from '@element-plus/icons-vue'

const router = useRouter()
const userInput = ref('')
const showParamModal = ref(false)
const editingParam = ref({})
const chatMessages = ref(null)

const messages = ref([
  {
    isAI: true,
    content: '您好！我是智能配置助手，请问您需要配置什么预警规则？请用日常语言描述即可，比如："如果上海到杭州的生鲜车连续两小时没有GPS更新，就钉钉发给华东区调度主管"',
    params: [],
    suggestions: []
  }
])

const generatedRule = ref({
  name: '',
  description: '',
  steps: [],
  actions: []
})

const mockAIResponse = (input) => {
  // 模拟AI解析
  const responses = [
    {
      content: '我来帮您配置这个预警规则。根据您的描述，我已识别以下关键信息：',
      params: [
        { label: '运输路线', value: '上海到杭州' },
        { label: '运输类型', value: '生鲜车' },
        { label: '触发条件', value: '连续两小时没有GPS更新' },
        { label: '通知对象', value: '华东区调度主管' },
        { label: '通知方式', value: '钉钉' }
      ],
      suggestions: []
    },
    {
      content: '收到！我来分析您的需求...',
      params: [
        { label: '监控对象', value: '仓库库存' },
        { label: '触发条件', value: '超过容量的90%' }
      ],
      suggestions: ['请问需要发送给谁？', '需要通过什么渠道通知？']
    }
  ]
  
  const response = responses[Math.floor(Math.random() * responses.length)]
  messages.value.push({
    isAI: true,
    ...response
  })

  // 更新规则预览
  generatedRule.value = {
    name: '智能生成规则',
    description: '根据您的描述自动生成的预警规则',
    steps: [
      { type: 'data', label: '运输路线', value: '上海到杭州' },
      { type: 'data', label: '运输类型', value: '生鲜车' },
      { type: 'condition', label: '触发条件', value: '连续两小时没有GPS更新' }
    ],
    actions: [
      { type: 'dingtalk', text: '发送钉钉消息给华东区调度主管' }
    ]
  }
}

const sendMessage = () => {
  if (!userInput.value.trim()) return

  messages.value.push({
    isAI: false,
    content: userInput.value
  })

  const input = userInput.value
  userInput.value = ''

  // 模拟AI处理延迟
  setTimeout(() => {
    mockAIResponse(input)
    nextTick(() => {
      if (chatMessages.value) {
        chatMessages.value.scrollTop = chatMessages.value.scrollHeight
      }
    })
  }, 500)
}

const editParam = (param) => {
  editingParam.value = { ...param }
  showParamModal.value = true
}

const saveParamEdit = () => {
  // 更新消息中的参数值
  const lastMsg = messages.value[messages.value.length - 1]
  if (lastMsg.params) {
    const param = lastMsg.params.find(p => p.label === editingParam.value.label)
    if (param) {
      param.value = editingParam.value.value
    }
  }
  showParamModal.value = false
}

const handleSuggestion = (suggestion) => {
  userInput.value = suggestion
}

const getStepIcon = (type) => {
  const icons = {
    data: Document,
    condition: ArrowUp,
    action: Bell
  }
  return icons[type] || Document
}

const getActionIcon = (type) => {
  const icons = {
    dingtalk: Message,
    sms: Document,
    email: Clock,
    phone: Bell
  }
  return icons[type] || Message
}

const goBack = () => {
  router.push('/rule-config')
}

const confirmRule = () => {
  alert('规则已确认，即将发布')
  router.push('/rule-config')
}

const resetRule = () => {
  generatedRule.value = {
    name: '',
    description: '',
    steps: [],
    actions: []
  }
}

const goToBuilder = () => {
  router.push('/rule-config/builder')
}
</script>

<style lang="scss" scoped>
.ai-config-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 84px);
  background: #f0f2f5;
}

.ai-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: white;
  border-bottom: 1px solid #ebeef5;

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;

    .page-title {
      font-size: 16px;
      font-weight: 500;
      color: #333;
    }
  }
}

.ai-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 左侧对话区 */
.chat-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  margin: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;

  .chat-header {
    padding: 16px 20px;
    border-bottom: 1px solid #ebeef5;

    .agent-info {
      display: flex;
      align-items: center;
      gap: 12px;

      .agent-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 20px;
      }

      .agent-detail {
        .agent-name {
          font-size: 15px;
          font-weight: 500;
          color: #333;
        }

        .agent-status {
          font-size: 12px;
          color: #67c23a;
        }
      }
    }
  }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px;

    .message-item {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;

      &.is-ai {
        flex-direction: row;
      }

      &:not(.is-ai) {
        flex-direction: row-reverse;

        .message-bubble {
          background: #00b8c4;
          color: white;
          border-radius: 12px 12px 4px 12px;
        }
      }

      .message-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        &.ai-avatar {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          color: white;
        }

        &.user-avatar {
          background: #f0f2f5;
          color: #666;
        }
      }

      .message-content {
        max-width: 70%;

        .message-bubble {
          padding: 12px 16px;
          border-radius: 12px 12px 12px 4px;
          font-size: 14px;
          line-height: 1.6;

          &.ai-bubble {
            background: #f5f7fa;
            color: #333;
          }
        }

        .message-params {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px dashed #e4e7ed;

          .params-title {
            font-size: 12px;
            color: #999;
            margin-bottom: 8px;
          }

          .param-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 0;
            font-size: 13px;

            .param-label {
              color: #666;
              min-width: 80px;
            }

            .param-value {
              color: #00b8c4;
              font-weight: 500;
              cursor: pointer;
              padding: 2px 6px;
              background: #f0f9fa;
              border-radius: 4px;

              &:hover {
                background: #e0f2f1;
              }
            }

            .param-edit {
              color: #999;
              font-size: 12px;
              cursor: pointer;
            }
          }
        }

        .message-suggestions {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px dashed #e4e7ed;

          .suggestions-title {
            font-size: 12px;
            color: #999;
            margin-bottom: 8px;
          }

          .suggestion-item {
            display: inline-block;
            padding: 6px 12px;
            background: #f5f7fa;
            border-radius: 16px;
            font-size: 13px;
            color: #666;
            margin-right: 8px;
            margin-bottom: 8px;
            cursor: pointer;
            transition: all 0.2s;

            &:hover {
              background: #e0f2f1;
              color: #00b8c4;
            }
          }
        }
      }
    }
  }

  .chat-input-area {
    display: flex;
    gap: 12px;
    padding: 16px 20px;
    border-top: 1px solid #ebeef5;

    .chat-input {
      flex: 1;
    }
  }
}

/* 右侧预览区 */
.preview-panel {
  width: 400px;
  background: white;
  margin: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .panel-title {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 16px 20px;
    font-size: 15px;
    font-weight: 500;
    color: #333;
    border-bottom: 1px solid #ebeef5;
  }

  .preview-content {
    flex: 1;
    padding: 16px 20px;
    overflow-y: auto;

    .rule-name-preview {
      margin-bottom: 20px;

      label {
        display: block;
        font-size: 12px;
        color: #666;
        margin-bottom: 6px;
      }
    }

    .rule-description {
      margin-bottom: 20px;

      label {
        display: block;
        font-size: 12px;
        color: #666;
        margin-bottom: 6px;
      }

      .description-text {
        padding: 12px;
        background: #f5f7fa;
        border-radius: 6px;
        font-size: 13px;
        color: #666;
        line-height: 1.5;
      }
    }

    .rule-visual {
      margin-bottom: 20px;

      label {
        display: block;
        font-size: 12px;
        color: #666;
        margin-bottom: 12px;
      }

      .visual-flow {
        .flow-step {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;

          &:last-child {
            margin-bottom: 0;
          }

          .step-icon {
            width: 36px;
            height: 36px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 14px;

            &.data {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }

            &.condition {
              background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            }

            &.action {
              background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
            }
          }

          .step-content {
            flex: 1;

            .step-label {
              font-size: 13px;
              color: #666;
            }

            .step-value {
              font-size: 14px;
              font-weight: 500;
              color: #333;
            }
          }

          .step-arrow {
            color: #ccc;
          }
        }
      }
    }

    .rule-actions-preview {
      margin-bottom: 12px;

      label {
        display: block;
        font-size: 12px;
        color: #666;
        margin-bottom: 12px;
      }

      .actions-list {
        .action-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #f5f7fa;
          border-radius: 6px;
          margin-bottom: 8px;

          &:last-child {
            margin-bottom: 0;
          }

          .action-icon {
            color: #00b8c4;
            font-size: 14px;
          }

          .action-text {
            font-size: 13px;
            color: #333;
          }
        }
      }
    }
  }

  .panel-footer {
    display: flex;
    gap: 8px;
    padding: 16px 20px;
    border-top: 1px solid #ebeef5;
  }
}

/* 参数编辑弹窗 */
.param-edit-form {
  .form-item {
    margin-bottom: 16px;

    label {
      display: block;
      font-size: 13px;
      color: #666;
      margin-bottom: 8px;
    }
  }
}
</style>