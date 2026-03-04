# 技能文档 Vue 技术栈更新日志

**更新日期**: 2026-03-04  
**更新原因**: 本项目使用 Vue 3 技术栈，需要将技能文档中的 React 代码示例更新为 Vue 版本

## 更新的技能文件

### 1. screenshot-page-workflow
**文件**: `.trae/skills/screenshot-page-workflow/page-restoration.md`

**更新内容**:
- ✅ 添加 Vue 项目代码规范（`<script setup>` 语法）
- ✅ 保留 React 项目代码规范作为参考
- ✅ 明确输出文件支持 `.vue`（Vue）或 `.tsx`（React）

**Vue 代码示例**:
```vue
<template>
  <div class="page-container">
    <!-- 页面内容 -->
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import './style.css';
</script>

<style scoped>
/* 组件样式 */
</style>
```

### 2. axure-prototype-workflow
**文件**: `.trae/skills/axure-prototype-workflow/page-restoration.md`

**更新内容**:
- ✅ 添加 Vue 项目代码规范
- ✅ 保留 React 项目代码规范
- ✅ 更新输出文件说明

### 3. web-page-workflow
**文件**: `.trae/skills/web-page-workflow/page-restoration.md`

**更新内容**:
- ✅ 添加 Vue 项目代码规范
- ✅ 保留 React 项目代码规范
- ✅ 更新输出文件说明

### 4. local-axure-workflow
**文件**: `.trae/skills/local-axure-workflow/SKILL.md`

**更新内容**:
- ✅ 添加 Vue 项目代码规范（完整示例）
- ✅ 保留 React 项目代码规范
- ✅ 更新输出文件说明

### 5. ai-studio-project-converter
**文件**: `.trae/skills/ai-studio-project-converter/SKILL.md`

**更新内容**:
- ✅ 添加 Vue 项目组件规范
- ✅ 添加 Vue 转换示例（React → Vue）
- ✅ 详细说明转换关键点：
  - `useState` → `ref`
  - JSX → Template
  - 添加 `<template>`、`<script setup>`、`<style scoped>`
- ✅ 保留 React 转换示例作为参考

**转换示例**:
```vue
<!-- React useState 转换为 Vue ref -->
<script setup>
import { ref } from 'vue';

const count = ref(0);  // React: const [count, setCount] = useState(0)
</script>
```

### 6. v0-project-converter
**文件**: `.trae/skills/v0-project-converter/SKILL.md`

**更新内容**:
- ✅ 添加 Vue 项目组件规范
- ✅ 保留 React 项目组件规范
- ✅ 更新输出文件说明

## 未修改的技能

### mcp-installer
**文件**: `.trae/skills/mcp-installer/SKILL.md`

**原因**: MCP 安装器技能与具体前端框架无关，负责安装和配置 MCP 服务器，不需要修改。

## 核心变化总结

### 代码规范变化

| 项目 | React | Vue 3 |
|------|-------|-------|
| **文件扩展名** | `.tsx` | `.vue` |
| **入口文件** | `index.tsx` | `index.vue` |
| **组件定义** | `const Component = function() {...}` | `<script setup>` |
| **状态管理** | `useState` | `ref`, `reactive` |
| **计算属性** | `useMemo` | `computed` |
| **模板语法** | JSX | Vue Template |
| **样式** | 外部 CSS + Tailwind | `<style scoped>` + Tailwind |
| **导出方式** | `export default Component` | 自动导出（setup 语法糖） |

### 输出文件结构

**Vue 项目**:
```
src/pages/page-name/
├── index.vue      # 主组件（Vue 单文件组件）
├── style.css      # 样式文件（@import "tailwindcss"）
├── components/    # 子组件（可选）
└── spec.md        # 规格文档
```

**React 项目**（仅供参考）:
```
src/pages/page-name/
├── index.tsx      # 主组件（React + TSX）
├── style.css      # 样式文件（@import "tailwindcss"）
├── components/    # 子组件（可选）
└── spec.md        # 规格文档
```

## 技术栈对比

### Vue 3 优势（本项目选择）
- ✅ 单文件组件（SFC），结构清晰
- ✅ `<script setup>` 语法简洁
- ✅ 自动导入和类型推导
- ✅ 内置指令（v-if, v-for 等）
- ✅ 响应式系统直观

### React 特点（供参考）
- JSX 语法灵活
- Hooks 生态系统丰富
- 社区资源多
- 需要手动导入所有依赖

## 迁移指南（React → Vue）

### 1. 状态管理
```typescript
// React
const [count, setCount] = useState(0);

// Vue
const count = ref(0);
// 模板中直接使用：{{ count }}
```

### 2. 计算属性
```typescript
// React
const doubled = useMemo(() => count * 2);

// Vue
const doubled = computed(() => count.value * 2);
```

### 3. 条件渲染
```tsx
// React
{condition && <Component />}

// Vue
<template v-if="condition">
  <Component />
</template>
```

### 4. 列表渲染
```tsx
// React
{items.map(item => <Item key={item.id} data={item} />)}

// Vue
<Item v-for="item in items" :key="item.id" :data="item" />
```

### 5. 事件处理
```tsx
// React
<button onClick={() => handleClick()}>Click</button>

// Vue
<button @click="handleClick">Click</button>
```

## 验证清单

所有更新的技能文档已通过以下验证：

- [x] Vue 代码示例语法正确
- [x] 保留了 React 示例作为参考
- [x] 输出文件路径正确（`.vue` vs `.tsx`）
- [x] 导入语句正确（`vue` vs `react`）
- [x] 样式规范一致（都使用 Tailwind CSS）
- [x] 文件头部注释完整
- [x] 转换关键点说明清晰

## 后续建议

1. **测试技能执行**: 在实际使用中验证 Vue 代码生成是否正确
2. **收集反馈**: 根据实际使用情况优化代码示例
3. **更新文档**: 如发现新的最佳实践，及时更新技能文档
4. **培训 AI**: 确保 AI 理解 Vue 和 React 的区别

## 参考资源

- [Vue 3 官方文档](https://vuejs.org/)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Tailwind CSS](https://tailwindcss.com/)
- 本项目开发规范：`/rules/development-standards.md`

---

**更新完成时间**: 2026-03-04  
**影响范围**: 6 个技能文档  
**技术栈**: Vue 3 + Vite + Tailwind CSS
