#!/bin/bash

# Superpowers 技能安装脚本
# 用于将 superpowers 技能安装到项目的 .trae/skills/ 目录

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_SOURCE="$SCRIPT_DIR/superpowers/skills"
SKILLS_TARGET="$SCRIPT_DIR/.trae/skills"

echo "🚀 开始安装 Superpowers 技能..."

# 创建目标目录
mkdir -p "$SKILLS_TARGET"

# 复制所有技能
for skill in brainstorming dispatching-parallel-agents executing-plans finishing-a-development-branch receiving-code-review requesting-code-review subagent-driven-development systematic-debugging test-driven-development using-git-worktrees using-superpowers verification-before-completion writing-plans writing-skills; do
    if [ -d "$SKILLS_SOURCE/$skill" ]; then
        echo "📦 安装技能：$skill"
        cp -r "$SKILLS_SOURCE/$skill" "$SKILLS_TARGET/"
    else
        echo "⚠️  技能不存在：$skill"
    fi
done

echo "✅ 技能安装完成！"
echo ""
echo "已安装的技能列表："
ls -1 "$SKILLS_TARGET"

echo ""
echo "💡 提示：重启 Trae 后，这些技能将自动可用。"
