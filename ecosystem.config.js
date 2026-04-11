module.exports = {
  apps: [{
    name: 'schoolpro-dev',
    script: 'node_modules/.bin/next',
    args: 'start -p 3001',
    cwd: '/var/www/schoolpro-dev',
    env: { NODE_ENV: 'production', PORT: 3001 },
    max_restarts: 5,
    restart_delay: 3000,
  }]
}
