#!/bin/bash

# 技能安装脚本
# 用于将所有技能安装到项目的 .trae/skills/ 目录

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_TARGET="$SCRIPT_DIR/.trae/skills"

echo "🚀 开始安装技能..."

# 创建目标目录
mkdir -p "$SKILLS_TARGET"

# 复制 superpowers 技能
echo ""
echo "📦 安装 Superpowers 技能..."
SKILLS_SOURCE="$SCRIPT_DIR/superpowers/skills"
for skill in brainstorming dispatching-parallel-agents executing-plans finishing-a-development-branch receiving-code-review requesting-code-review subagent-driven-development systematic-debugging test-driven-development using-git-worktrees using-superpowers verification-before-completion writing-plans writing-skills; do
    if [ -d "$SKILLS_SOURCE/$skill" ]; then
        echo "   ✓ $skill"
        cp -r "$SKILLS_SOURCE/$skill" "$SKILLS_TARGET/"
    else
        echo "   ⚠️  技能不存在：$skill"
    fi
done

# 复制项目自带技能
echo ""
echo "📦 安装项目技能..."
PROJECT_SKILLS_SOURCE="$SCRIPT_DIR/skills"
for skill in ai-studio-project-converter axure-prototype-workflow local-axure-workflow mcp-installer screenshot-page-workflow v0-project-converter web-page-workflow; do
    if [ -d "$PROJECT_SKILLS_SOURCE/$skill" ]; then
        echo "   ✓ $skill"
        cp -r "$PROJECT_SKILLS_SOURCE/$skill" "$SKILLS_TARGET/"
    else
        echo "   ⚠️  技能不存在：$skill"
    fi
done

# 复制自定义技能
echo ""
echo "📦 安装自定义技能..."
CUSTOM_SKILLS_SOURCE="$SCRIPT_DIR/.trae/skills"
if [ -d "$SCRIPT_DIR/.trae/skills/firecrawl-mcp-installer" ]; then
    echo "   ✓ firecrawl-mcp-installer"
    # 已存在，跳过
fi
if [ -d "$SCRIPT_DIR/.trae/skills/superpowers" ]; then
    echo "   ✓ superpowers"
    # 已存在，跳过
fi

echo ""
echo "✅ 技能安装完成！"
echo ""
echo "已安装的技能列表："
ls -1 "$SKILLS_TARGET"

echo ""
echo "💡 提示：重启 Trae 后，这些技能将自动可用。"
