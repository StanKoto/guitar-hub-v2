import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy } from 'passport-jwt';
import config from '../envVariables.cjs';
import db from '../models/index.cjs';
import { checkPassword } from '../utils/helperFunctions.js';

const { User } = db;

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
    done(null, user.id);
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
    const user = await User.findOne({ where: { email } });
    if (!user) return done(null, false);
    checkPassword(req, user, password);
    done(null, user.id);
  } catch (err) {
    done(err);
  }
}));

passport.use(new GoogleStrategy({
  callbackURL: 'https://the-guitar-hub.herokuapp.com/auth/google/redirect',
  clientID: config.googleStrategy.clientId,
  clientSecret: config.googleStrategy.secret
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const currentUser = await User.findOne({ where: { email: profile.emails[0].value } });
    if (currentUser) return done(null, { id: currentUser.id, status: 200 })
    const newUser = await User.create({
      username: profile.emails[0].value.split('@')[0],
      email: profile.emails[0].value,
      passwordSet: false
    });
    done(null, { id: newUser.id, status: 201 });
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
  done(null, jwtPayload.id);
}));