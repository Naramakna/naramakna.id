module.exports = {
  apps: [{
    name: 'tiktok-booster',
    script: './tiktok-booster-venv/bin/python',
    args: 'tiktok-booster.py',
    cwd: '/var/www/naramakna.id',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '200M',
    error_file: './logs/tiktok-booster-error.log',
    out_file: './logs/tiktok-booster-out.log',
    log_file: './logs/tiktok-booster-combined.log',
    time: true,
    env: {
      NODE_ENV: 'production'
    }
  }]
}