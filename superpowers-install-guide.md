# Superpowers 安装指南

## 为 Codex 安装

在终端中执行以下命令：

```bash
# 1. 移动 superpowers 到 Codex 目录
mv /Users/houpe/Documents/trae_projects/pro_tool/superpowers ~/.codex/superpowers

# 2. 创建 skills 目录和符号链接
mkdir -p ~/.agents/skills
ln -s ~/.codex/superpowers/skills ~/.agents/skills/superpowers

# 3. 重启 Codex
# 退出并重新启动 Codex CLI 以发现技能
```

## 验证安装

```bash
# 检查符号链接是否正确
ls -la ~/.agents/skills/superpowers

# 查看可用的技能
ls ~/.agents/skills/superpowers
```

## 为 Claude Code 安装

如果您使用 Claude Code，在 Claude Code 中执行：

```bash
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace
```

## 为 Cursor 安装

如果您使用 Cursor，在 Cursor Agent chat 中执行：

```text
/plugin-add superpowers
```

## 使用

安装完成后，启动新的会话并请求帮助（例如"帮我规划这个功能"或"调试这个问题"），superpowers 技能会自动触发。
