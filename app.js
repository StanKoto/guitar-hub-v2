import * as dotenv from 'dotenv';
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
import { checkUser } from './middleware/auth.js';
import { authRouter } from './routes/authRoutes.js';
import { tipRouter } from './routes/tipRoutes.js';
import { userRouter } from './routes/userRoutes.js';
import { errorRouter } from './routes/errorRoutes.js';
import { mainRouter } from './routes/mainRoutes.js';
import { handleErrors } from './utils/errorHandling.js';

dotenv.config({ path: new URL('config.env', import.meta.url) });

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI)
  .then(res => {
    console.log('MongoDB successfully connected');
    app.listen(PORT, console.log(`Listening on port ${PORT}`));
  })
  .catch(err => console.error(err));

app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('trust proxy', 1);
app.use(session({
  secret: process.env.SESSION_SECRET,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: true,
    httpOnly: true,
    maxAge: 10800000
  }
}));

app.use(mongoSanitize());
app.use(helmet());
app.use(xss());

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100
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