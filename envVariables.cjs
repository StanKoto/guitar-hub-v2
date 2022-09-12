const path = require('path');
const dotenv = require('dotenv');

// dotenv.config({ path: new URL('config.env', import.meta.url) });
dotenv.config({ path: path.join(__dirname, 'config.env') })

module.exports = {
  main: {
    env: process.env.NODE_ENV,
    port: Number(process.env.PORT)
  },
  db: {
    mongoUri: process.env.MONGO_URI,
    pgUri: process.env.PG_URI
  },
  googleStrategy: {
    clientId: process.env.CLIENT_ID,
    secret: process.env.CLIENT_SECRET
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: Number(process.env.JWT_EXPIRES_IN)
  },
  cookie: {
    maxAge: Number(process.env.COOKIE_MAX_AGE),
  },
  limiter: {
    windowMS: Number(process.env.LIMITER_WINDOW_MS),
    max: Number(process.env.LIMITER_MAX)
  },
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY,
    fromEmail: process.env.SENDGRID_FROM_EMAIL
  },
  multer: {
    fileSize: Number(process.env.MULTER_FILE_SIZE)
  }
};