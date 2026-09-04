<template>
  <!-- 使用 Vue 内置 <Transition> 实现平滑滑入/滑出 -->
  <Transition
    enter-from-class="fb-enter-from"
    enter-active-class="fb-enter-active"
    enter-to-class="fb-enter-to"
    leave-from-class="fb-leave-from"
    leave-active-class="fb-leave-active"
    leave-to-class="fb-leave-to"
  >
    <div v-if="isVisible" class="feedback-floating-bar">
      <!-- ========== 初始状态：询问用户是否认可 ========== -->
      <div v-if="state === 'idle'" class="fb-content idle-content">
        <span class="fb-prompt">这次的问数回答是否解决了您的问题？</span>
        <div class="fb-actions">
          <button class="fb-btn fb-btn-approve" @click="handleApprove" title="认可">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/></svg>
            <span>认可</span>
          </button>
          <button class="fb-btn fb-btn-disapprove" @click="handleDisapprove" title="不认可">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 14V2"/><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z"/></svg>
            <span>不认可</span>
          </button>
          <button class="fb-btn-close" @click="handleClose" title="关闭">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      </div>

      <!-- ========== 认可后：显示感谢文案 ========== -->
      <div v-else-if="state === 'approved'" class="fb-content thanks-content">
        <svg class="fb-check-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
        <span class="fb-thanks-text">感谢您的认可！您的反馈将帮助我们持续优化问数体验 ✨</span>
      </div>

      <!-- ========== 不认可：展开诊断面板 ========== -->
      <div v-else-if="state === 'disapproved'" class="fb-content diagnose-content">
        <div class="diagnose-header">
          <span class="diagnose-title">🔍 请帮助我们定位问题：</span>
          <button class="fb-btn-close" @click="handleClose" title="关闭">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        <div class="diagnose-tags">
          <button
            v-for="tag in diagnoseTags"
            :key="tag.value"
            class="diagnose-tag"
            :class="{ active: selectedTags.includes(tag.value) }"
            @click="toggleTag(tag.value)"
          >
            {{ tag.label }}
          </button>
        </div>
        <div v-if="selectedTags.includes('other')" class="diagnose-input-row">
          <input
            v-model="comment"
            class="diagnose-input"
            type="text"
            placeholder="请输入您的意见或建议（选填）..."
            maxlength="200"
            @keyup.enter="submitDiagnose"
          />
        </div>
        <div class="diagnose-footer">
          <span class="diagnose-tip">已选 {{ selectedTags.length }} 项</span>
          <button
            class="fb-btn fb-btn-submit"
            :disabled="selectedTags.length === 0"
            @click="submitDiagnose"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/></svg>
            <span>提交反馈</span>
          </button>
        </div>
      </div>

      <!-- ========== 诊断提交后：显示感谢文案 ========== -->
      <div v-else-if="state === 'submitted'" class="fb-content thanks-content">
        <svg class="fb-check-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
        <span class="fb-thanks-text">感谢反馈！您的意见已记录，我们会尽快优化 🙏</span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

/**
 * 反馈提交数据接口
 */
export interface FeedbackData {
  queryId: string
  isApproved: boolean
  tags?: string[]
  comment?: string
}

/**
 * 组件 Props 定义
 */
const props = defineProps<{
  /** 当前问数查询的唯一 ID */
  queryId: string
}>()

/**
 * 组件 Emits 定义
 */
const emit = defineEmits<{
  'feedback-submit': [data: FeedbackData]
}>()

/** 组件可见性（控制 Transition 的 v-if） */
const isVisible = ref(false)

/** 组件状态机：idle -> approved/disapproved -> submitted */
type FeedbackState = 'idle' | 'approved' | 'disapproved' | 'submitted'
const state = ref<FeedbackState>('idle')

/** 诊断标签选项 */
const diagnoseTags = [
  { label: '1. 理解错我的问题了', value: 'misunderstood' },
  { label: '2. 数据结果错误', value: 'wrong_data' },
  { label: '3. 结果展示不合适', value: 'bad_display' },
  { label: '4. 其他', value: 'other' }
]

/** 用户选中的诊断标签 */
const selectedTags = ref<string[]>([])

/** 用户填写的补充意见 */
const comment = ref('')

/**
 * 延迟挂载：1.5 秒后组件平滑滑入
 */
onMounted(() => {
  setTimeout(() => {
    isVisible.value = true
  }, 1500)
})

/**
 * 切换诊断标签的选中状态（支持多选）
 */
const toggleTag = (tagValue: string) => {
  const idx = selectedTags.value.indexOf(tagValue)
  if (idx > -1) {
    selectedTags.value.splice(idx, 1)
  } else {
    selectedTags.value.push(tagValue)
  }
}

/**
 * 用户点击"认可 (👍)"
 */
const handleApprove = () => {
  state.value = 'approved'
  emit('feedback-submit', {
    queryId: props.queryId,
    isApproved: true
  })
  // 1.5 秒后自动滑出
  autoHide()
}

/**
 * 用户点击"不认可 (👎)"，展开诊断面板
 */
const handleDisapprove = () => {
  state.value = 'disapproved'
}

/**
 * 用户提交诊断反馈
 */
const submitDiagnose = () => {
  if (selectedTags.value.length === 0) return

  state.value = 'submitted'
  emit('feedback-submit', {
    queryId: props.queryId,
    isApproved: false,
    tags: [...selectedTags.value],
    comment: comment.value.trim() || undefined
  })
  // 1.5 秒后自动滑出
  autoHide()
}

/**
 * 用户点击关闭按钮
 */
const handleClose = () => {
  isVisible.value = false
}

/**
 * 1.5 秒后自动隐藏组件
 */
const autoHide = () => {
  setTimeout(() => {
    isVisible.value = false
  }, 1500)
}
</script>

<style scoped>
/* ============ Transition 动画类 ============ */
.fb-enter-from,
.fb-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
.fb-enter-active {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.fb-leave-active {
  transition: all 0.3s ease-in;
}
.fb-enter-to,
.fb-leave-from {
  opacity: 1;
  transform: translateY(0);
}

/* ============ 悬浮条容器 ============ */
.feedback-floating-bar {
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 0 16px;
  box-sizing: border-box;
  /* 毛玻璃半透明效果 */
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border-top: 1px solid rgba(235, 238, 245, 0.6);
  border-bottom: 1px solid rgba(235, 238, 245, 0.6);
  overflow: hidden;
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif;
  flex-shrink: 0;
}

/* ============ 内容区域通用 ============ */
.fb-content {
  padding: 16px 20px;
}

/* ============ 初始状态 (Idle) ============ */
.idle-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.fb-prompt {
  font-size: 13px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.75);
  white-space: nowrap;
  flex-shrink: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.fb-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* ============ 按钮通用 ============ */
.fb-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 14px;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}

.fb-btn-approve {
  background: rgba(0, 190, 190, 0.1);
  color: rgb(0, 170, 170);
}
.fb-btn-approve:hover {
  background: rgba(0, 190, 190, 0.2);
  transform: scale(1.04);
}

.fb-btn-disapprove {
  background: rgba(245, 108, 108, 0.08);
  color: #e85d5d;
}
.fb-btn-disapprove:hover {
  background: rgba(245, 108, 108, 0.18);
  transform: scale(1.04);
}

.fb-btn-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}
.fb-btn-close:hover {
  background: rgba(0, 0, 0, 0.06);
  color: #64748b;
}

/* ============ 认可 / 提交感谢 ============ */
.thanks-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 18px 20px;
  animation: fbPulse 0.4s ease-out;
}

.fb-check-icon {
  color: rgb(0, 190, 190);
  flex-shrink: 0;
}

.fb-thanks-text {
  font-size: 13px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.7);
}

/* ============ 诊断面板 ============ */
.diagnose-content {
  animation: fbExpand 0.35s ease-out;
}

.diagnose-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.diagnose-title {
  font-size: 13px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.8);
}

.diagnose-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.diagnose-tag {
  padding: 6px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  background: rgba(248, 250, 252, 0.8);
  font-size: 12px;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
  user-select: none;
}
.diagnose-tag:hover {
  border-color: rgb(0, 190, 190);
  color: rgb(0, 170, 170);
  background: rgba(0, 190, 190, 0.06);
}
.diagnose-tag.active {
  border-color: rgb(0, 190, 190);
  background: rgba(0, 190, 190, 0.1);
  color: rgb(0, 160, 160);
  font-weight: 500;
}

.diagnose-input-row {
  margin-bottom: 12px;
  animation: fbSlideDown 0.25s ease-out;
}

.diagnose-input {
  width: 100%;
  padding: 9px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 12px;
  color: #334155;
  background: rgba(248, 250, 252, 0.6);
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
  font-family: inherit;
}
.diagnose-input::placeholder {
  color: #94a3b8;
}
.diagnose-input:focus {
  border-color: rgb(0, 190, 190);
  box-shadow: 0 0 0 3px rgba(0, 190, 190, 0.08);
}

.diagnose-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.diagnose-tip {
  font-size: 11px;
  color: #94a3b8;
}

.fb-btn-submit {
  background: rgb(0, 190, 190);
  color: #fff;
}
.fb-btn-submit:hover:not(:disabled) {
  background: rgb(0, 170, 170);
  transform: scale(1.04);
}
.fb-btn-submit:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
}

/* ============ 动画关键帧 ============ */
@keyframes fbPulse {
  0% { transform: scale(0.96); opacity: 0.6; }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes fbExpand {
  0% { opacity: 0; transform: translateY(-6px); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes fbSlideDown {
  0% { opacity: 0; max-height: 0; }
  100% { opacity: 1; max-height: 60px; }
}

/* ============ 移动端自适应 ============ */
@media (max-width: 640px) {
  .feedback-floating-bar {
    width: 96%;
    bottom: 16px;
    border-radius: 12px;
  }
  .idle-content {
    flex-direction: column;
    gap: 10px;
  }
  .fb-prompt {
    white-space: normal;
    text-align: center;
  }
  .diagnose-tags {
    gap: 6px;
  }
  .diagnose-tag {
    padding: 5px 10px;
    font-size: 11px;
  }
}
</style>
