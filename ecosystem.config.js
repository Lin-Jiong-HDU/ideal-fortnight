module.exports = {
  apps: [{
    name: 'geo-frontend',
    script: 'pnpm',
    args: 'start',
    cwd: '/var/www/geo-frontend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      // 生产环境使用相对路径，由 nginx 代理
      NEXT_PUBLIC_API_URL: '/api',
    },
  }],
};
