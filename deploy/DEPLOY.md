# 部署指南

## 服务器要求

- Node.js 18+
- pnpm
- PM2
- Nginx

## 1. 安装依赖

```bash
# 安装 pnpm
npm install -g pnpm

# 安装 PM2
npm install -g pm2
```

## 2. 部署应用

```bash
# 克隆代码到服务器
git clone <repo-url> /var/www/geo-frontend
cd /var/www/geo-frontend

# 安装依赖
pnpm install

# 构建
pnpm build

# 修改 ecosystem.config.js 中的 NEXT_PUBLIC_API_URL
# 指向你的后端 API 地址

# 启动 PM2
pm2 start ecosystem.config.js

# 保存 PM2 配置
pm2 save

# 设置开机自启
pm2 startup
# 按照输出的命令执行
```

## 3. 配置 Nginx

```bash
# 复制配置文件
sudo cp deploy/nginx.conf.example /etc/nginx/sites-available/geo-frontend

# 创建软链接
sudo ln -s /etc/nginx/sites-available/geo-frontend /etc/nginx/sites-enabled/

# 修改配置中的域名
sudo nano /etc/nginx/sites-available/geo-frontend

# 测试配置
sudo nginx -t

# 重载 Nginx
sudo systemctl reload nginx
```

## 4. 配置 SSL (可选但推荐)

```bash
# 安装 certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo systemctl enable certbot.timer
```

## 5. 更新部署

```bash
cd /var/www/geo-frontend
git pull
pnpm install
pnpm build
pm2 restart geo-frontend
```

## 常用命令

```bash
pm2 status              # 查看状态
pm2 logs geo-frontend   # 查看日志
pm2 restart geo-frontend
pm2 stop geo-frontend
pm2 delete geo-frontend
```
