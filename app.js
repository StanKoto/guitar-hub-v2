import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import xss from 'xss-clean';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import cors from 'cors';
import config from './envVariables.js';
import { checkUser } from './middleware/auth.js';
import { authRouter } from './routes/authRoutes.js';
import { tipRouter } from './routes/tipRoutes.js';
import { userRouter } from './routes/userRoutes.js';
import { errorRouter } from './routes/errorRoutes.js';
import { mainRouter } from './routes/mainRoutes.js';
import { handleErrors } from './utils/errorHandling.js';

const app = express();
const PORT = config.main.port || 3000;

mongoose.connect(config.db.mongoUri)
  .then(res => {
    console.log('MongoDB successfully connected');
    app.listen(PORT, console.log(`Listening on port ${PORT}`));
  })
  .catch(err => console.error(err));

app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sessionOptions = {
  secret: config.session.secret,
  store: MongoStore.create({ mongoUrl: config.db.mongoUri }),
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    maxAge: config.session.cookieMaxAge
  }
};

if (app.get('env') === 'production') {
  app.set('trust proxy', 1);
  sessionOptions.cookie.secure = true;
}
app.use(session(sessionOptions));

app.use(mongoSanitize());
app.use(helmet());
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