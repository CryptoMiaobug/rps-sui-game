#!/bin/bash

echo "🔍 RPS-Sui Frontend 验证脚本"
echo "================================"
echo ""

# Check if dist exists
if [ -d "dist" ]; then
    echo "✅ dist/ 目录存在"
else
    echo "❌ dist/ 目录不存在，请先运行 npm run build"
    exit 1
fi

# Check key files
echo ""
echo "📁 检查关键文件..."
files=("dist/index.html" "dist/assets")
for file in "${files[@]}"; do
    if [ -e "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file 缺失"
    fi
done

# Check source files
echo ""
echo "📝 源代码统计..."
echo "  TypeScript/TSX 文件: $(find src -name "*.ts" -o -name "*.tsx" | wc -l | tr -d ' ')"
echo "  组件: $(find src/components -name "*.tsx" 2>/dev/null | wc -l | tr -d ' ')"
echo "  页面: $(find src/pages -name "*.tsx" 2>/dev/null | wc -l | tr -d ' ')"
echo "  Hooks: $(find src/hooks -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')"

# Check package.json scripts
echo ""
echo "📦 可用命令..."
echo "  npm run dev     - 启动开发服务器"
echo "  npm run build   - 构建生产版本"
echo "  npm run preview - 预览构建结果"

# Check build size
echo ""
echo "📊 构建产物大小..."
if [ -d "dist/assets" ]; then
    du -sh dist/assets/* 2>/dev/null | sed 's/^/  /'
fi

echo ""
echo "✅ 验证完成！"
echo ""
echo "🚀 下一步："
echo "  1. 运行 npm run preview 本地预览"
echo "  2. 推送到 GitHub 触发自动部署"
echo "  3. 或手动部署 dist/ 目录到托管平台"
