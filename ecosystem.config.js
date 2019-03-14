module.exports = {
  apps : [{
    name: 'BitWave',
    script: './server/index.js', // Start server

    // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    args: '',
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }],

  deploy : {
    production : {
      user : '',
      host : '',
      ref  : 'origin/master',
      repo : 'git@github.com:repo.git',
      path : 'srv/bitwave.tv/',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production'
    }
  }
};
