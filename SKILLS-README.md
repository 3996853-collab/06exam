# Trae 技能安装指南

本项目包含了完整的技能集合，用于增强 Trae 的编码能力。

## 快速安装

### 方法一：自动安装脚本（推荐）

在项目根目录执行：

```bash
./install-skills.sh
```

### 方法二：手动安装

```bash
# 1. 确保 superpowers 源码存在
git clone https://github.com/obra/superpowers.git

# 2. 复制技能到项目目录
mkdir -p .trae/skills
cp -r superpowers/skills/* .trae/skills/
cp -r skills/* .trae/skills/

# 或者使用安装脚本
./install-skills.sh
```

## 已包含的技能

### Superpowers 技能集

- **brainstorming** - 头脑风暴，需求分析
- **writing-plans** - 编写实现计划
- **executing-plans** - 执行计划
- **systematic-debugging** - 系统调试
- **test-driven-development** - 测试驱动开发
- **requesting-code-review** - 请求代码审查
- **receiving-code-review** - 接收代码审查
- **subagent-driven-development** - 子代理驱动开发
- **using-git-worktrees** - Git 工作树使用
- **verification-before-completion** - 完成前验证
- **writing-skills** - 编写技能
- **dispatching-parallel-agents** - 并行代理分发
- **finishing-a-development-branch** - 完成开发分支
- **using-superpowers** - 使用 Superpowers

### 项目自带技能

- **ai-studio-project-converter** - AI Studio 项目转换
- **axure-prototype-workflow** - Axure 原型工作流
- **local-axure-workflow** - 本地 Axure 工作流
- **mcp-installer** - MCP 安装器
- **screenshot-page-workflow** - 截图页面工作流
- **v0-project-converter** - v0 项目转换
- **web-page-workflow** - Web 页面工作流

### 自定义技能

- **firecrawl-mcp-installer** - Firecrawl MCP 安装
- **superpowers** - Superpowers 安装

## 使用方式

1. 运行安装脚本后
2. **重启 Trae**
3. 在对话中自然提及相关任务，技能会自动触发

例如：
- "帮我规划这个功能" → 触发 `writing-plans`
- "调试这个问题" → 触发 `systematic-debugging`
- "审查这段代码" → 触发 `requesting-code-review`

## 项目分发

当您将此项目分发给其他人时：

1. 确保 `superpowers/` 目录和 `.trae/skills/` 目录都在版本控制中
2. 接收者克隆项目后，运行 `./install-skills.sh`
3. 重启 Trae 即可使用所有技能

## 注意事项

- 技能文件较大，建议将 `.trae/skills/` 加入 `.gitignore`，只保留安装脚本
- 或者将 `superpowers/` 作为 git submodule 引入
- 首次使用需要重启 Trae 以加载技能

## 技能来源

- Superpowers: https://github.com/obra/superpowers
- Firecrawl MCP: 自定义安装技能
