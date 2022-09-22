import express from 'express';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import sqlSanitizer from 'sql-sanitizer';
import helmet from 'helmet';
import xss from 'xss-clean';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import cors from 'cors';
import config from './envVariables.cjs';
import db from './models/index.cjs';
import { checkUser } from './middleware/auth.js';
import './middleware/passportSetup.js';
import { authRouter } from './routes/authRoutes.js';
import { tipRouter } from './routes/tipRoutes.js';
import { userRouter } from './routes/userRoutes.js';
import { errorRouter } from './routes/errorRoutes.js';
import { mainRouter } from './routes/mainRoutes.js';
import { handleErrors } from './utils/errorHandling.js';

const app = express();
const PORT = config.main.port || 3000;

db.sequelize.authenticate()
  .then(res => {
    console.log('PostgreSQL successfully connected');
    app.listen(PORT, console.log(`Listening on port ${PORT}`));
  })
  .catch(err => console.error(err));

app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

app.use(sqlSanitizer);
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      "img-src": [ "'self'", "data:", "https://ik.imagekit.io" ]
    }
  }
}));
app.use(xss());

const limiter = rateLimit({
  windowMs: config.limiter.windowMS,
  max: config.limiter.max
});

app.use(limiter);
app.use(hpp());
app.use(cors());

app.use(checkUser);
app.use('/auth', authRouter);
app.use('/tips-overview', tipRouter);
app.use('/user-management', userRouter);
app.use('/errors', errorRouter);
app.use(mainRouter);
app.use(handleErrors);