// 草稿管理工具
// 使用 localStorage 存储草稿数据

const DRAFT_KEY = 'order_entry_drafts'
const MAX_DRAFTS = 10 // 最多保留 10 条草稿

/**
 * 保存草稿
 * @param {Object} data - 表单数据
 * @returns {Object} 保存的草稿对象
 */
export function saveDraft(data) {
  const drafts = loadDrafts()
  const draft = {
    id: Date.now(),
    data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  // 添加到列表开头
  drafts.unshift(draft)
  
  // 限制草稿数量
  if (drafts.length > MAX_DRAFTS) {
    drafts.pop()
  }
  
  localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts))
  return draft
}

/**
 * 加载所有草稿
 * @returns {Array} 草稿列表
 */
export function loadDrafts() {
  try {
    const draftsJson = localStorage.getItem(DRAFT_KEY)
    return draftsJson ? JSON.parse(draftsJson) : []
  } catch (e) {
    console.error('加载草稿失败:', e)
    return []
  }
}

/**
 * 获取单个草稿
 * @param {number} id - 草稿 ID
 * @returns {Object|null} 草稿对象
 */
export function getDraft(id) {
  const drafts = loadDrafts()
  return drafts.find(d => d.id === id) || null
}

/**
 * 删除草稿
 * @param {number} id - 草稿 ID
 */
export function deleteDraft(id) {
  const drafts = loadDrafts()
  const filtered = drafts.filter(d => d.id !== id)
  localStorage.setItem(DRAFT_KEY, JSON.stringify(filtered))
}

/**
 * 清空所有草稿
 */
export function clearAllDrafts() {
  localStorage.removeItem(DRAFT_KEY)
}

/**
 * 格式化日期时间
 * @param {string} isoString - ISO 日期字符串
 * @returns {string} 格式化后的日期
 */
export function formatDateTime(isoString) {
  const date = new Date(isoString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
