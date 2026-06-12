<template>
  <div class="builder-container">
    <!-- 顶部操作栏 -->
    <div class="builder-header">
      <div class="header-left">
        <el-button @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <el-input 
          v-model="ruleName" 
          placeholder="输入规则名称" 
          class="rule-name-input"
        />
        <el-select v-model="businessLine" placeholder="选择业务线" class="business-line-select">
          <el-option label="华东物流" value="华东物流" />
          <el-option label="华南仓储" value="华南仓储" />
          <el-option label="电商业务" value="电商业务" />
          <el-option label="冷链物流" value="冷链物流" />
          <el-option label="财务结算" value="财务结算" />
        </el-select>
      </div>
      <div class="header-right">
        <el-button @click="saveDraft">保存草稿</el-button>
        <el-button @click="previewTest">预览测试</el-button>
        <el-button type="primary" @click="publishRule">发布规则</el-button>
      </div>
    </div>

    <div class="builder-content">
      <!-- 左侧积木面板 -->
      <div class="blocks-panel">
        <div class="panel-section">
          <div class="section-title">
            <el-icon class="section-icon"><Document /></el-icon>
            数据项
          </div>
          <div class="blocks-grid">
            <div 
              v-for="block in dataBlocks" 
              :key="block.id" 
              class="block-item"
              :class="{ 'is-dragging': draggingBlock === block.id }"
              draggable="true"
              @dragstart="handleDragStart($event, block)"
              @dragend="handleDragEnd"
            >
              <div class="block-icon blue">{{ block.icon }}</div>
              <div class="block-label">{{ block.label }}</div>
            </div>
          </div>
        </div>

        <div class="panel-section">
          <div class="section-title">
            <el-icon class="section-icon"><ArrowUp /></el-icon>
            条件判断
          </div>
          <div class="blocks-grid">
            <div 
              v-for="block in conditionBlocks" 
              :key="block.id" 
              class="block-item"
              :class="{ 'is-dragging': draggingBlock === block.id }"
              draggable="true"
              @dragstart="handleDragStart($event, block)"
              @dragend="handleDragEnd"
            >
              <div class="block-icon orange">{{ block.icon }}</div>
              <div class="block-label">{{ block.label }}</div>
            </div>
          </div>
        </div>

        <div class="panel-section">
          <div class="section-title">
            <el-icon class="section-icon"><Bell /></el-icon>
            动作执行
          </div>
          <div class="blocks-grid">
            <div 
              v-for="block in actionBlocks" 
              :key="block.id" 
              class="block-item"
              :class="{ 'is-dragging': draggingBlock === block.id }"
              draggable="true"
              @dragstart="handleDragStart($event, block)"
              @dragend="handleDragEnd"
            >
              <div class="block-icon green">{{ block.icon }}</div>
              <div class="block-label">{{ block.label }}</div>
            </div>
          </div>
        </div>

        <div class="panel-section">
          <div class="section-title">
            <el-icon class="section-icon"><ArrowRight /></el-icon>
            逻辑连接
          </div>
          <div class="blocks-grid">
            <div 
              v-for="block in logicBlocks" 
              :key="block.id" 
              class="block-item"
              :class="{ 'is-dragging': draggingBlock === block.id }"
              draggable="true"
              @dragstart="handleDragStart($event, block)"
              @dragend="handleDragEnd"
            >
              <div class="block-icon purple">{{ block.icon }}</div>
              <div class="block-label">{{ block.label }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 中间画布区 -->
      <div 
        class="canvas-area"
        @dragover.prevent="handleDragOver"
        @drop="handleDrop"
        @click="handleCanvasClick"
      >
        <div class="canvas-grid">
          <div 
            v-for="(node, index) in canvasNodes" 
            :key="node.id"
            class="canvas-node"
            :class="{ 'is-selected': selectedNode === node.id }"
            @click.stop="selectNode(node)"
          >
            <div class="node-header" :class="getNodeClass(node.type)">
              <el-icon class="node-icon">{{ getNodeIcon(node.type) }}</el-icon>
              <span class="node-label">{{ node.label }}</span>
              <el-icon class="node-delete" @click.stop="removeNode(index)">
                <Close />
              </el-icon>
            </div>
            <div class="node-content">
              <template v-if="node.type === 'data'">
                <el-input 
                  v-model="node.value" 
                  placeholder="输入阈值" 
                  size="small"
                />
                <el-select v-model="node.unit" placeholder="单位" size="small">
                  <el-option label="数量" value="数量" />
                  <el-option label="百分比" value="%" />
                  <el-option label="小时" value="小时" />
                  <el-option label="分钟" value="分钟" />
                  <el-option label="元" value="元" />
                </el-select>
              </template>
              <template v-else-if="node.type === 'condition'">
                <el-select v-model="node.operator" placeholder="选择运算符" size="small">
                  <el-option label="大于" value=">" />
                  <el-option label="小于" value="<" />
                  <el-option label="等于" value="=" />
                  <el-option label="不等于" value="!=" />
                  <el-option label="在范围内" value="between" />
                </el-select>
                <el-input 
                  v-model="node.value" 
                  placeholder="输入数值" 
                  size="small"
                />
              </template>
              <template v-else-if="node.type === 'action'">
                <el-select v-model="node.target" placeholder="选择接收人" size="small">
                  <el-option label="华东区调度主管" value="华东区调度主管" />
                  <el-option label="华南区仓储经理" value="华南区仓储经理" />
                  <el-option label="系统管理员" value="系统管理员" />
                  <el-option label="相关负责人" value="相关负责人" />
                </el-select>
              </template>
              <template v-else-if="node.type === 'logic'">
                <div class="logic-display">{{ node.label }}</div>
              </template>
            </div>
          </div>

          <!-- 连线SVG -->
          <svg class="connection-lines" v-if="canvasNodes.length > 1">
            <line 
              v-for="(conn, idx) in connections" 
              :key="idx"
              :x1="conn.x1" 
              :y1="conn.y1" 
              :x2="conn.x2" 
              :y2="conn.y2"
              stroke="#00b8c4"
              stroke-width="2"
              marker-end="url(#arrowhead)"
            />
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#00b8c4" />
              </marker>
            </defs>
          </svg>
        </div>

        <div v-if="canvasNodes.length === 0" class="empty-canvas">
          <el-icon class="empty-icon"><Box /></el-icon>
          <p class="empty-text">从左侧拖拽积木到这里</p>
          <p class="empty-hint">开始构建您的预警规则</p>
        </div>
      </div>

      <!-- 右侧属性面板 -->
      <div class="properties-panel">
        <div class="panel-title">
          <el-icon><Settings /></el-icon>
          属性配置
        </div>
        
        <div v-if="selectedNodeData" class="properties-content">
          <div class="property-item">
            <label>积木名称</label>
            <el-input v-model="selectedNodeData.label" size="small" />
          </div>
          <div class="property-item">
            <label>积木类型</label>
            <span class="property-value">{{ getNodeTypeName(selectedNodeData.type) }}</span>
          </div>
          <div v-if="selectedNodeData.type === 'data'" class="property-item">
            <label>阈值设置</label>
            <el-input v-model="selectedNodeData.value" placeholder="设置阈值" size="small" />
          </div>
          <div v-if="selectedNodeData.type === 'action'" class="property-item">
            <label>通知渠道</label>
            <el-select v-model="selectedNodeData.channel" size="small" multiple>
              <el-option label="钉钉" value="dingtalk" />
              <el-option label="短信" value="sms" />
              <el-option label="邮件" value="email" />
              <el-option label="电话" value="phone" />
            </el-select>
          </div>
        </div>

        <div v-else class="properties-empty">
          <el-icon><Setting /></el-icon>
          <p>点击画布中的积木进行配置</p>
        </div>

        <!-- 规则预览 -->
        <div class="rule-preview">
          <div class="preview-title">
            <el-icon><Document /></el-icon>
            规则预览
          </div>
          <div class="preview-content">
            {{ generateRulePreview() }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ArrowLeft, ArrowUp, Bell, Close, 
  Box, Setting, 
  Document, Clock, 
  ArrowRight, ArrowDown,
  Message, Phone,
  Plus
} from '@element-plus/icons-vue'

const router = useRouter()
const ruleName = ref('')
const businessLine = ref('')
const draggingBlock = ref(null)
const selectedNode = ref(null)
const canvasNodes = ref([])
const connections = ref([])

const dataBlocks = ref([
  { id: 'data-order', label: '订单量', icon: Document, type: 'data' },
  { id: 'data-stock', label: '库存数量', icon: Document, type: 'data' },
  { id: 'data-time', label: '运输时长', icon: Clock, type: 'data' },
  { id: 'data-temp', label: '温度值', icon: Bell, type: 'data' },
  { id: 'data-location', label: '位置信息', icon: Box, type: 'data' }
])

const conditionBlocks = ref([
  { id: 'cond-gt', label: '大于', icon: ArrowRight, type: 'condition' },
  { id: 'cond-lt', label: '小于', icon: ArrowRight, type: 'condition' },
  { id: 'cond-trend', label: '环比下降', icon: ArrowDown, type: 'condition' },
  { id: 'cond-repeat', label: '连续触发', icon: Plus, type: 'condition' }
])

const actionBlocks = ref([
  { id: 'act-dingtalk', label: '钉钉消息', icon: Message, type: 'action' },
  { id: 'act-sms', label: '短信提醒', icon: Phone, type: 'action' },
  { id: 'act-email', label: '邮件通知', icon: Document, type: 'action' },
  { id: 'act-upgrade', label: '触发升级', icon: Plus, type: 'action' }
])

const logicBlocks = ref([
  { id: 'logic-and', label: '且', icon: Plus, type: 'logic' },
  { id: 'logic-or', label: '或', icon: Plus, type: 'logic' }
])

const selectedNodeData = computed(() => {
  return canvasNodes.value.find(n => n.id === selectedNode.value)
})

const handleDragStart = (event, block) => {
  draggingBlock.value = block.id
  event.dataTransfer.setData('block', JSON.stringify(block))
  event.dataTransfer.effectAllowed = 'copy'
}

const handleDragEnd = () => {
  draggingBlock.value = null
}

const handleDragOver = (event) => {
  event.preventDefault()
}

const handleDrop = (event) => {
  const blockData = JSON.parse(event.dataTransfer.getData('block'))
  const newNode = {
    id: Date.now().toString(),
    ...blockData,
    value: '',
    unit: '',
    operator: '>',
    target: '',
    channel: []
  }
  canvasNodes.value.push(newNode)
  
  // 更新连线
  updateConnections()
}

const handleCanvasClick = () => {
  selectedNode.value = null
}

const selectNode = (node) => {
  selectedNode.value = node.id
}

const removeNode = (index) => {
  canvasNodes.value.splice(index, 1)
  selectedNode.value = null
  updateConnections()
}

const updateConnections = () => {
  connections.value = []
  for (let i = 0; i < canvasNodes.value.length - 1; i++) {
    connections.value.push({
      x1: 200,
      y1: 80 + i * 100,
      x2: 50,
      y2: 80 + (i + 1) * 100
    })
  }
}

const getNodeClass = (type) => {
  const classes = {
    data: 'node-blue',
    condition: 'node-orange',
    action: 'node-green',
    logic: 'node-purple'
  }
  return classes[type] || 'node-blue'
}

const getNodeIcon = (type) => {
  const icons = {
    data: Document,
    condition: ArrowUp,
    action: Bell,
    logic: ArrowRight
  }
  return icons[type] || Document
}

const getNodeTypeName = (type) => {
  const names = {
    data: '数据项',
    condition: '条件判断',
    action: '动作执行',
    logic: '逻辑连接'
  }
  return names[type] || type
}

const generateRulePreview = () => {
  if (canvasNodes.value.length === 0) {
    return '请从左侧拖拽积木开始配置规则...'
  }
  
  const parts = canvasNodes.value.map(node => {
    if (node.type === 'data') {
      return `当${node.label}${node.value ? '为' + node.value + (node.unit || '') : ''}`
    } else if (node.type === 'condition') {
      return node.label
    } else if (node.type === 'action') {
      return `则${node.label}给${node.target || '相关人员'}`
    } else if (node.type === 'logic') {
      return node.label
    }
    return node.label
  })
  
  return parts.join(' ') + '。'
}

const goBack = () => {
  router.push('/rule-config')
}

const saveDraft = () => {
  alert('规则草稿已保存')
}

const previewTest = () => {
  router.push('/rule-config/test')
}

const publishRule = () => {
  if (!ruleName.value) {
    alert('请输入规则名称')
    return
  }
  alert('规则已发布')
  router.push('/rule-config')
}
</script>

<style lang="scss" scoped>
.builder-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 84px);
  background: #f0f2f5;
}

.builder-header {
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

    .rule-name-input {
      width: 240px;
    }

    .business-line-select {
      width: 160px;
    }
  }

  .header-right {
    display: flex;
    gap: 8px;
  }
}

.builder-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 左侧积木面板 */
.blocks-panel {
  width: 220px;
  background: #fafafa;
  border-right: 1px solid #ebeef5;
  overflow-y: auto;
  padding: 12px;

  .panel-section {
    margin-bottom: 20px;

    .section-title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 500;
      color: #666;
      margin-bottom: 12px;
      padding: 4px 8px;
      background: white;
      border-radius: 4px;

      .section-icon {
        font-size: 12px;
        color: #00b8c4;
      }
    }

    .blocks-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
    }
  }

  .block-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px;
    background: white;
    border-radius: 6px;
    cursor: grab;
    transition: all 0.2s;
    border: 1px solid #ebeef5;

    &:hover {
      border-color: #00b8c4;
      box-shadow: 0 2px 8px rgba(0, 184, 196, 0.15);
    }

    &.is-dragging {
      opacity: 0.6;
      cursor: grabbing;
    }

    .block-icon {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      color: white;

      &.blue {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      &.orange {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }

      &.green {
        background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
      }

      &.purple {
        background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
        color: #666;
      }
    }

    .block-label {
      font-size: 13px;
      color: #333;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

/* 中间画布区 */
.canvas-area {
  flex: 1;
  background: white;
  position: relative;
  overflow: auto;

  .canvas-grid {
    position: relative;
    padding: 40px;
    min-height: 100%;
  }

  .canvas-node {
    background: white;
    border: 2px solid #ebeef5;
    border-radius: 8px;
    margin-bottom: 20px;
    max-width: 320px;
    transition: all 0.2s;

    &.is-selected {
      border-color: #00b8c4;
      box-shadow: 0 4px 12px rgba(0, 184, 196, 0.2);
    }

    .node-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      color: white;
      border-radius: 6px 6px 0 0;

      &.node-blue {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      &.node-orange {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }

      &.node-green {
        background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
      }

      &.node-purple {
        background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
        color: #666;
      }

      .node-icon {
        font-size: 14px;
      }

      .node-label {
        flex: 1;
        font-size: 13px;
        font-weight: 500;
      }

      .node-delete {
        cursor: pointer;
        opacity: 0.7;

        &:hover {
          opacity: 1;
        }
      }
    }

    .node-content {
      padding: 12px;
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .logic-display {
      font-size: 14px;
      font-weight: 600;
      color: #666;
    }
  }

  .connection-lines {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
  }

  .canvas-node {
    position: relative;
    z-index: 1;
  }

  .empty-canvas {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;

    .empty-icon {
      font-size: 48px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .empty-text {
      font-size: 16px;
      color: #666;
      margin-bottom: 8px;
    }

    .empty-hint {
      font-size: 13px;
      color: #999;
    }
  }
}

/* 右侧属性面板 */
.properties-panel {
  width: 280px;
  background: #fafafa;
  border-left: 1px solid #ebeef5;
  padding: 16px;
  overflow-y: auto;

  .panel-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 500;
    color: #333;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #ebeef5;
  }

  .properties-content {
    .property-item {
      margin-bottom: 16px;

      label {
        display: block;
        font-size: 12px;
        color: #666;
        margin-bottom: 6px;
      }

      .property-value {
        font-size: 13px;
        color: #333;
        background: white;
        padding: 6px 10px;
        border-radius: 4px;
        display: inline-block;
      }
    }
  }

  .properties-empty {
    text-align: center;
    padding: 40px 20px;

    el-icon {
      font-size: 32px;
      color: #ccc;
      margin-bottom: 12px;
    }

    p {
      font-size: 13px;
      color: #999;
    }
  }

  .rule-preview {
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid #ebeef5;

    .preview-title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 500;
      color: #666;
      margin-bottom: 12px;
    }

    .preview-content {
      background: white;
      padding: 12px;
      border-radius: 6px;
      font-size: 13px;
      color: #333;
      line-height: 1.6;
      min-height: 60px;
    }
  }
}
</style>