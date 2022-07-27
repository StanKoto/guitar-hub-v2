  import * as dotenv from 'dotenv';

  dotenv.config({ path: new URL('config.env', import.meta.url) });

  export default {
    main: {
      port: Number(process.env.PORT)
    },
    db: {
      mongoUri: process.env.MONGO_URI
    },
    session: {
      secret: process.env.SESSION_SECRET,
      cookieMaxAge: Number(process.env.COOKIE_MAX_AGE),
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