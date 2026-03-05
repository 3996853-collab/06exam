# 执行计划页面布局修复

**修复日期**: 2026-03-04  
**问题**: 页面双重嵌套，左侧导航栏和顶部导航栏显示两次

## 问题原因

执行计划页面 (`/executing-plans`) 被配置为在 [Layout](file:///Users/houpe/Documents/trae_projects/pro_tool/src/components/Layout.vue) 组件的内容区渲染，但页面组件自己又包含了完整的布局结构（侧边栏 + 顶栏），导致双重嵌套。

### 路由结构
```javascript
{
  path: '/executing-plans',
  name: 'executingPlans',
  component: () => import('../pages/executing-plans/index.vue')
}
```

### Layout 组件结构
[Layout.vue](file:///Users/houpe/Documents/trae_projects/pro_tool/src/components/Layout.vue) 提供了：
- ✅ 左侧导航栏（系统级导航）
- ✅ 顶部导航栏（租户切换、用户信息等）
- ✅ Tab 栏（多标签页管理）
- ✅ 内容区（`<router-view>`）

### 原始问题
执行计划页面包含了：
- ❌ 自己的左侧导航栏
- ❌ 自己的顶部导航栏
- ✅ 内容区（待处理事项、数据概览等）

导致渲染结果：
```
Layout
├── 侧边栏（第一次显示）
└── 主内容区
    ├── 顶栏（第一次显示）
    └── 执行计划页面
        ├── 侧边栏（第二次显示 - 重复）
        └── 主内容区
            └── 顶栏（第二次显示 - 重复）
```

## 修复方案

### 修改执行计划页面结构

**修复前**：
```vue
<template>
  <div class="executing-plans-page">
    <aside class="sidebar">
      <!-- 左侧导航栏 - 删除 -->
    </aside>
    
    <main class="main-content">
      <header class="top-header">
        <!-- 顶部导航栏 - 删除 -->
      </header>
      
      <!-- 内容区 - 保留 -->
      <section class="pending-section">...</section>
      <section class="overview-section">...</section>
    </main>
  </div>
</template>
```

**修复后**：
```vue
<template>
  <div class="executing-plans-page">
    <!-- 只保留内容区 -->
    <section class="pending-section">...</section>
    <section class="overview-section">...</section>
    <aside class="target-sidebar">...</aside>
    <section class="empty-state">...</section>
  </div>
</template>
```

### 修改样式

**修复前**：
```css
.executing-plans-page {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 240px;
  /* ... */
}

.main-content {
  flex: 1;
  margin-left: 240px;
}

.top-header {
  height: 64px;
  /* ... */
}
```

**修复后**：
```css
.executing-plans-page {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 150px); /* 减去 Layout 的顶部导航和 Tab 栏高度 */
}

/* 只保留内容区样式 */
.pending-section,
.overview-section {
  padding: 24px;
  margin-bottom: 24px;
}
```

## 修复后的渲染结构

```
Layout
├── 侧边栏（系统级导航）
└── 主内容区
    ├── 顶栏（租户切换、用户信息）
    ├── Tab 栏（多标签页管理）
    └── 执行计划页面
        ├── 待处理事项
        ├── 数据概览
        ├── 目标区域
        └── 空状态提示
```

## 文件修改清单

1. **[index.vue](file:///Users/houpe/Documents/trae_projects/pro_tool/src/pages/executing-plans/index.vue)**
   - 删除左侧导航栏模板（约 40 行）
   - 删除顶部导航栏模板（约 30 行）
   - 删除 `</main>` 和 `</div>` 闭合标签

2. **[style.css](file:///Users/houpe/Documents/trae_projects/pro_tool/src/pages/executing-plans/style.css)**
   - 删除 `.sidebar` 相关样式（约 150 行）
   - 删除 `.main-content` 相关样式
   - 删除 `.top-header` 相关样式（约 80 行）
   - 简化 `.executing-plans-page` 样式

## 设计原则

### 关注点分离
- **Layout 组件**：负责系统级布局（导航、Tab 管理）
- **页面组件**：负责具体业务内容展示

### 复用性
- 所有页面共享统一的 Layout
- 页面组件专注于业务逻辑

### 一致性
- 统一的导航体验
- 统一的 Tab 管理
- 统一的视觉风格

## 其他页面参考

本项目的其他页面也遵循相同的模式：

### order-entry（录单页面）
```vue
<template>
  <div class="order-entry-page">
    <!-- 只包含业务内容，没有导航栏 -->
    <SenderForm />
    <ReceiverForm />
    <CargoForm />
    <FeeForm />
  </div>
</template>
```

## 验证步骤

1. 访问 `http://localhost:5173/executing-plans`
2. 确认左侧导航栏只显示一次（Layout 提供的系统导航）
3. 确认顶部导航栏只显示一次（Layout 提供的租户导航）
4. 确认 Tab 栏正常显示
5. 确认内容区正常展示（待处理事项、数据概览等）

## 经验总结

### 在 Vue Router 嵌套路由中：
1. **父路由组件**（Layout）：提供共享布局和导航
2. **子路由组件**（页面）：只关注业务内容
3. **避免重复**：子组件不应包含父组件已提供的布局

### 页面组件开发规范：
- ✅ 使用 `<script setup>` 语法
- ✅ 只包含业务内容区
- ✅ 样式独立，使用 scoped 或独立 CSS 文件
- ❌ 不包含系统级导航
- ❌ 不包含 Tab 管理
- ❌ 不使用 `min-height: 100vh`（应使用 `calc(100vh - 导航高度)`）

## 相关文档

- [Layout.vue](file:///Users/houpe/Documents/trae_projects/pro_tool/src/components/Layout.vue) - 布局组件
- [router/index.js](file:///Users/houpe/Documents/trae_projects/pro_tool/src/router/index.js) - 路由配置
- [development-standards.md](file:///Users/houpe/Documents/trae_projects/pro_tool/rules/development-standards.md) - 开发规范

---

**修复完成时间**: 2026-03-04  
**影响范围**: 执行计划首页  
**技术栈**: Vue 3 + Vite + Element Plus + Tailwind CSS
