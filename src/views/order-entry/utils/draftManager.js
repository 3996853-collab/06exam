/**
 * 草稿管理工具函数
 */

export const saveDraft = (data) => {
  console.log('保存草稿:', data)
  return Promise.resolve({ success: true, id: Date.now() })
}

export const loadDrafts = () => {
  console.log('加载草稿列表')
  return Promise.resolve([])
}

export const getDraft = (id) => {
  console.log('获取草稿:', id)
  return Promise.resolve({})
}

export const deleteDraft = (id) => {
  console.log('删除草稿:', id)
  return Promise.resolve({ success: true })
}
