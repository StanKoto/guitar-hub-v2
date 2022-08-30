import config from '../envVariables.js';

export default {
  development: {
    url: config.db.pgUri,
    dialect: 'postgres'
  },
  production: {
    url: config.db.pgUri,
    dialect: 'postgres'
  }
};