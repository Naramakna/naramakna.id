module.exports = {
  apps: [
    {
      name: 'naramakna-backend',
      script: './backend/server.js',
      cwd: '/var/www/naramakna.id',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      max_restarts: 0,
      min_uptime: '10s',
      restart_delay: 5000,
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true,
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'naramakna-frontend',
      script: 'serve',
      args: ['-s', 'frontend/dist', '-l', '3000'],
      cwd: '/var/www/naramakna.id',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '200M',
      max_restarts: 0,
      min_uptime: '10s',
      restart_delay: 5000,
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
}