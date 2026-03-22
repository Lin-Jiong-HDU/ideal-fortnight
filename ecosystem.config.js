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
      NEXT_PUBLIC_API_URL: 'http://localhost:8080',
    },
  }],
};
