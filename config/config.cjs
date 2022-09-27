const config = require ('../envVariables.cjs');

module.exports = {
  development: {
    url: config.db.devUri
  },
  production: {
    url: config.db.prodUri,
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false
      }
    }
  }
};