module.exports = {
  apps: [{
    name: 'jiyibi',
    script: './server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }],

  deploy: {
    production: {
      user: 'root',
      host: '182.92.154.85',
      ref: 'origin/main',
      repo: 'https://github.com/comesoon/jiyibi.git',
      path: '/var/www/jiyibi-app',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npx pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};