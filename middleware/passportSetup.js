import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import config from '../envVariables.js';
import { User } from '../models/User.js';
import { checkPassword } from '../utils/helperFunctions.js';

passport.use('local-signup', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, email, password, done) => {
  try {
    const user = await User.create({
      username: req.body.username,
      email,
      password
    });
    done(null, user._id);
  } catch (err) {
    done(err);
  }
}));

passport.use('local-login', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, email, password, done) => {
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) done(null, false);
    await checkPassword(req, user, password);
    done(null, user._id);
  } catch (err) {
    done(err);
  }
}));

passport.use(new GoogleStrategy({
  callbackURL: '/auth/google/redirect',
  clientID: config.googleStrategy.clientId,
  clientSecret: config.googleStrategy.secret
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const currentUser = await User.findOne({ email: profile.emails[0].value });
    if (currentUser) return done(null, currentUser._id)
  } catch (err) {
    done(err);
  }
  try {
    const newUser = await User.create({
      username: profile.emails[0].value.split('@')[0],
      email: profile.emails[0].value,
      passwordSet: false
    });
    done(null, newUser._id);
  } catch (err) {
    done(err);
  }
}));

passport.use(new JwtStrategy({
  jwtFromRequest: req => {
    let token = null;
    if (req.cookies) token = req.cookies.jwt
    return token;
  },
  secretOrKey: config.jwt.secret
}, (jwtPayload, done) => {
  if (!jwtPayload.id) return done(null, false)
  return done(null, jwtPayload.id);
}));