const config = require ('../envVariables.cjs');

module.exports = {
  development: {
    url: config.db.pgUri
  },
  production: {
    url: config.db.pgUri
  }
};