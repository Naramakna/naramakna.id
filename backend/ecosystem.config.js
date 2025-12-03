module.exports = {
  apps: [{
    name: "naramakna-backend",
    script: "./server.js",
    cwd: "/var/www/naramakna.id/backend",
    instances: 2,
    exec_mode: "cluster",
    max_memory_restart: "600M",
    env: {
      NODE_ENV: "production"
    },
    env_file: "/var/www/naramakna.id/backend/.env"
  }]
};
