import * as crypto from 'crypto';
import passport from 'passport';
import db from '../models/index.cjs';
import { 
  asyncHandler,
  createJwtTokenAndSetCookie,
  checkPassword, 
  checkResource
} from '../utils/helperFunctions.js';
import { sendEmail } from '../utils/sendEmail.js';

const { User, Sequelize }  = db;

const auth_get = asyncHandler((req, res, next) => {
  res.render('authViews/auth', { title: 'Authorization' });
});

const signup_get = asyncHandler((req, res, next) => {
  res.render('authViews/signup', { title: 'Sign up' });
});

const signup_post = (req, res, next) => {
  passport.authenticate('local-signup', (err, user, info) => {
    if (err) return next(err)
    if (!user) {
      if (!req.body.username) return next(new Error('Username required'))
      if (!req.body.email) return next(new Error('Email required'))
      if (!req.body.password) return next(new Error('Password required'))
    }
    try {
      createJwtTokenAndSetCookie(req, res, user, 201);
    } catch (err) {
      next(err);
    }
  }) (req, res, next);
};

const login_get = asyncHandler((req, res, next) => {
  res.render('authViews/login', { title: 'Log in' });
});

const login_post = (req, res, next) => {
  passport.authenticate('local-login', (err, user, info) => {
    if (err) return next(err)
    if (!user) return next(new Error('Invalid credentials'))
    try {
      createJwtTokenAndSetCookie(req, res, user);
    } catch (err) {
      next(err);
    }
  }) (req, res, next);  
};

const googleLogin_get = (req, res, next) => {
  passport.authenticate('google', (err, user, info) => {
    if (err) return next(err)
    if (!user) res.redirect('/auth')
    try {
      createJwtTokenAndSetCookie(req, res, user.id, user.status);
    } catch (err) {
      next(err);
    }
  }) (req, res, next);
};

const forgotPassword_get = asyncHandler(async (req, res, next) => {
  res.render('authViews/forgotPassword', { title: 'Forgot password' });
});

const forgotPassword_post = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ where: { email: req.body.email } });
  if (!user) throw new Error('Invalid email');
  const resetToken = user.getResetPasswordToken();
  await user.save();
  const resetUrl = `${req.protocol}://${req.get('host')}/auth/reset-password/${resetToken}`;
  const message = `You are receiving this email because you (or someone else) have requested the reset of your password. If it weren't you, simply ignore this message, otherwise follow the link below to complete the password change: \n\n ${resetUrl}`;
  try {
    await sendEmail(req.body.email, 'Password reset link', message);
    res.json({ success: true });
  } catch (err) {
    user.set({
      resetPasswordToken: null,
      resetPasswordExpire: null
    });
    await user.save();
    next(err);
  }
});

const resetPassword_get = asyncHandler(async (req, res, next) => {
  res.render('authViews/resetPassword', { title: 'Reset password' });
});

const resetPassword_put = asyncHandler(async (req, res, next) => {
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');
  const user = await User.findOne({ where: { resetPasswordToken, resetPasswordExpire: { [Sequelize.Op.gt]: Date.now() } } });
  if (!user) throw new Error('Invalid token')
  user.set({
    password: req.body.password,
    resetPasswordToken: null,
    resetPasswordExpired: null
  });
  await user.save();
  res.status(200).json({ success: true });
});

const myProfile_get = asyncHandler(async (req, res, next) => {
  const user = await checkResource(req, User, [ 'password', 'resetPasswordToken', 'resetPasswordExpire' ]);
  res.render('authViews/myProfile', { title: 'Update my details', user });
});

const myDetails_put = asyncHandler(async (req, res, next) => {
  const user = await checkResource(req, User);
  if (req.body.username) user.username = req.body.username
  if (req.body.email) user.email = req.body.email
  await user.save(); 
  res.status(200).json({ success: true });
});

const myPassword_put = asyncHandler(async (req, res, next) => {
  const user = await checkResource(req, User);
  if (user.passwordSet) {
    checkPassword(req, user, req.body.currentPassword)
  } else {
    user.passwordSet = true;
  }
  user.password = req.body.newPassword;
  await user.save();
  res.status(200).json({ success: true });
});

const logout_get = asyncHandler((req, res, next) => {
  res.cookie('jwt', '', { maxAge: 1 });
  res.redirect('/auth');
});

export { 
  auth_get, 
  signup_get, 
  signup_post, 
  login_get, 
  login_post,
  googleLogin_get, 
  forgotPassword_get, 
  forgotPassword_post,
  resetPassword_get,
  resetPassword_put,
  myProfile_get,
  myDetails_put,
  myPassword_put,
  logout_get
};