# AGENTS 配置说明

## Skills 调用说明

### 所有可用 Skills 及其用途：
- **ai-studio-project-converter**：将 Google AI Studio 生成的 React 项目转换为本项目页面组件
- **axure-prototype-workflow**：使用 Axure 原型资产生成主题、数据模型和页面还原
- **brainstorming**：适用于所有疑问、计划、任务的初始分析和构思
- **dispatching-parallel-agents**：处理2个以上可并行执行的独立任务
- **executing-plans**：执行已制定的实施计划
- **finishing-a-development-branch**：完成开发分支的工作并决定如何集成
- **firecrawl-mcp-installer**：安装 Firecrawl MCP 用于网页抓取和爬取
- **local-axure-workflow**：处理本地导出的 Axure 原型资源
- **mcp-installer**：在各种客户端安装和配置 MCP 服务器
- **receiving-code-review**：处理代码审查反馈并实施建议
- **requesting-code-review**：适用于截图分析和代码审查
- **screenshot-page-workflow**：基于网页或 App 截图进行视觉分析与页面还原
- **subagent-driven-development**：使用子代理执行具有独立任务的实施计划
- **systematic-debugging**：适用于解决bug和测试失败问题
- **test-driven-development**：适用于新功能开发
- **using-git-worktrees**：创建隔离的 git worktrees 进行功能开发
- **using-superpowers**：启动对话并建立如何查找和使用技能的方法
- **v0-project-converter**：将 V0 生成的 Next.js 项目转换为本项目页面组件
- **verification-before-completion**：适用于任务完成前的验证
- **web-page-workflow**：使用 MCP 与 Firecrawl MCP 处理普通网页资产提取与页面还原
- **writing-plans**：根据规范或需求为多步骤任务编写实施计划
- **writing-skills**：创建新技能、编辑现有技能或验证技能工作

### Skills 匹配规则：
1. **根据任务类型自动匹配**：系统会根据任务描述自动推荐最合适的技能
2. **手动指定**：可以在指令中明确指定使用的技能
3. **技能组合**：复杂任务可以组合使用多个技能

## 项目要求

### 技术栈：
- **前端框架**：Vue 3 + TypeScript
- **构建工具**：Vite
- **UI库**：Element Plus
- **状态管理**：Pinia
- **路由**：Vue Router

### 项目结构：
- 纯前端项目，无后端依赖
- 模块化组件设计
- 响应式布局
- 统一的代码风格

### 主题和UI风格要求：
- **主题色**：创建新页面时，应根据页面功能和用途选择合适的主题色
- **UI风格**：保持整体风格统一，遵循现代前端设计原则
- **图片风格采集**：若用户上传图片，优先采集图片中的UI风格进行实现，包括颜色、布局、字体等元素

### 具体主题样式规范：

#### 颜色系统：
- **主色调**：rgb(0, 190, 190)（用于按钮、链接等重点元素）
- **背景色**：rgb(255, 255, 255)（主要背景）、rgb(240, 242, 245)（次要背景）
- **文本色**：rgba(0, 0, 0, 0.8)（主要文本）、rgb(96, 98, 102)（次要文本）
- **边框色**：rgb(235, 238, 245)（常规边框）、rgb(228, 231, 237)（分割线）

#### 布局和间距：
- **常用间距**：2px、4px、8px、12px、20px、32px
- **圆角**：2px、4px（常规按钮）、8px（卡片）
- **阴影**：rgba(0, 0, 0, 0.12) 0px 0px 12px 0px（卡片阴影）

#### 排版系统：
- **字体族**："Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif
- **字体大小**：12px（小文本）、14px（常规文本）、16px（标题）
- **字重**：400（常规）、500（中等）
- **行高**：12px文本使用20px-24px行高，14px文本使用23px-34px行高

#### 组件样式：
- **按钮**：圆角4px，主按钮使用主色调背景
- **卡片**：白色背景，轻微阴影，圆角8px
- **表格**：表头背景rgb(250, 250, 250)，边框色rgb(235, 238, 245)

#### 参考文件：
- 完整主题样式定义：`./主题样式.md`

## 添加菜单流程

创建新页面时，必须完成以下步骤：

1. **创建页面文件和目录**：
   - 在对应模块目录下创建新页面文件夹
   - 实现完整的页面组件

2. **更新路由配置**：
   - 在 `src/router/routes.ts` 中添加新路由
   - 设置正确的路径、组件和元信息

3. **更新侧边栏菜单**：
   - 在 `src/layout/components/Sidebar.vue` 中更新硬编码菜单数据
   - 确保菜单项显示在正确的分组中

4. **更新菜单点击事件**：
   - 在 `handleMegaItemClick` 函数中添加新菜单项的跳转逻辑
   - 确保能正确跳转到新页面

5. **验证功能**：
   - 检查菜单是否正确显示
   - 测试页面跳转是否正常
   - 验证页面功能是否完整

请务必确保所有步骤都已完成，不要遗漏任何环节。