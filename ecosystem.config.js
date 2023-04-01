// eslint-disable-next-line unicorn/prefer-module
module.exports = {
  apps: [{
    name: 'kingsdecree',
    script: 'dist/index.js',
    autorestart: true,
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};
