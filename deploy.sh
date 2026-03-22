#!/bin/bash
# GEO 优化平台部署脚本

set -e

echo "🔨 构建静态文件..."
pnpm build

echo "📦 部署到服务器..."
# 方式1: 使用 rsync 部署（推荐）
# rsync -avz --delete out/ user@your-server:/var/www/geo-platform/out/

# 方式2: 使用 scp 部署
# scp -r out/* user@your-server:/var/www/geo-platform/out/

echo "✅ 部署完成！"
echo ""
echo "后续步骤："
echo "1. 将 nginx.conf 复制到服务器 /etc/nginx/sites-available/geo-platform"
echo "2. 创建软链接: sudo ln -s /etc/nginx/sites-available/geo-platform /etc/nginx/sites-enabled/"
echo "3. 修改 nginx.conf 中的域名和后端地址"
echo "4. 测试配置: sudo nginx -t"
echo "5. 重载 Nginx: sudo systemctl reload nginx"
