#!/bin/bash

# 技能安装脚本
# 用于将 .trae/skills/ 中的技能重新注册，让 Trae 识别

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_TARGET="$SCRIPT_DIR/.trae/skills"

echo "🚀 开始注册技能..."

# 创建目标目录
mkdir -p "$SKILLS_TARGET"

# 技能已经在 .trae/skills/ 中，只需确保目录存在
echo ""
echo "📦 检查技能..."

# 列出所有已安装的技能
if [ -d "$SKILLS_TARGET" ]; then
    echo "✅ 技能目录已存在："
    ls -1 "$SKILLS_TARGET" | while read skill; do
        echo "   ✓ $skill"
    done
else
    echo "❌ 技能目录不存在，无法安装"
    exit 1
fi

echo ""
echo "✅ 技能注册完成！"
echo ""
echo "💡 提示：重启 Trae 后，这些技能将自动可用。"
