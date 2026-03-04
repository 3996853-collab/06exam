# 精简菜单实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 精简项目菜单，只保留首页和录单页面，将录单页面从二级菜单改为一级菜单"经营管理"

**Architecture:** 修改 Layout.vue 组件中的 el-menu，删除多余的菜单项，调整录单菜单为一级菜单

**Tech Stack:** Vue 3 + Element Plus

---

### Task 1: 修改 Layout.vue 菜单结构

**Files:**
- Modify: `src/components/Layout.vue:23-48`

**Step 1: 简化菜单结构**

将当前的菜单结构：
- 首页
- 运营管理（二级菜单）
  - 会员管理
  - 订单管理
- 录单（二级菜单）
- 用户管理
- 数据分析
- 消息管理

改为：
- 首页
- 经营管理（一级菜单）
  - 录单

**Step 2: 删除多余菜单项**

删除以下菜单项：
- 用户管理
- 数据分析
- 消息管理

**Step 3: 代码修改**

```vue
<el-menu
  :default-active="activeMenu"
  class="el-menu-vertical-demo"
  background-color="#002140"
  text-color="#fff"
  active-text-color="#00b8c4"
>
  <el-menu-item index="1">
    <el-icon><House /></el-icon>
    <span>首页</span>
  </el-menu-item>
  <el-menu-item index="2">
    <el-icon><Setting /></el-icon>
    <span>经营管理</span>
  </el-menu-item>
</el-menu>
```

**Step 4: 更新菜单选择处理**

删除 `handleMenuSelect` 函数中对多余菜单的处理逻辑

**Step 5: 提交**

```bash
git add src/components/Layout.vue
git commit -m "refactor: 精简菜单，只保留首页和录单"
```

---

### Task 2: 更新路由配置（如需要）

**Files:**
- Modify: `src/router/index.js`

**Step 1: 检查路由配置**

确认路由配置是否需要更新，确保录单页面路由仍然可用

**Step 2: 提交**

```bash
git add src/router/index.js
git commit -m "refactor: 更新路由配置"
```

---

### Task 3: 测试验证

**Files:**
- Test: 手动测试

**Step 1: 访问项目**

打开 http://localhost:5175/

**Step 2: 验证菜单**

- 确认左侧菜单只显示"首页"和"经营管理"
- 点击"经营管理"，确认录单页面正常打开
- 点击"首页"，确认首页正常显示

**Step 3: 推送代码**

```bash
git push origin main
```
