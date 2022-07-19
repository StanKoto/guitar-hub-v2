import * as crypto from 'crypto';
import { User } from '../models/User.js';
import { 
  asyncHandler, 
  regenerateSession,
  clearSessionUser, 
  checkPassword, 
  checkResource, 
  checkResourceAndUpdate
} from '../utils/helperFunctions.js';
import { sendEmail } from '../utils/sendEmail.js';

const auth_get = asyncHandler((req, res, next) => {
  res.render('authViews/auth', { title: 'Authorization' });
});

const signup_get = asyncHandler((req, res, next) => {
  res.render('authViews/signup', { title: 'Sign up' });
});

const signup_post = asyncHandler(async (req, res, next) => {
  const user = await User.create({ username: req.body.username, email: req.body.email, password: req.body.password });
  regenerateSession(req, res, user, 201);
});

const login_get = asyncHandler((req, res, next) => {
  res.render('authViews/login', { title: 'Log in' });
});

const login_post = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new Error('Invalid credentials');
  await checkPassword(req, user, password);
  regenerateSession(req, res, user);
});

const forgotPassword_get = asyncHandler(async (req, res, next) => {
  res.render('authViews/forgotPassword', { title: 'Forgot password' });
});

const forgotPassword_post = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) throw new Error('Invalid email');
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  const resetUrl = `${req.protocol}://${req.get('host')}/auth/reset-password/${resetToken}`;
  const message = `You are receiving this email because you (or someone else) have requested the reset of your password. If it weren't you, simply ignore this message, otherwise follow the link below to complete the password change: \n\n ${resetUrl}`;
  try {
    await sendEmail(req.body.email, 'Password reset link', message);
    res.json({ success: true });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    next(err);
  }
});

const resetPassword_get = asyncHandler(async (req, res, next) => {
  res.render('authViews/resetPassword', { title: 'Reset password' });
});

const resetPassword_put = asyncHandler(async (req, res, next) => {
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');
  const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } });
  if (!user) throw new Error('Invalid token')
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  res.status(200).json({ success: true });
});

const myProfile_get = asyncHandler(async (req, res, next) => {
  const user = await checkResource(req, User);
  res.render('authViews/myProfile', { title: 'Update my details', user });
});

const myDetails_put = asyncHandler(async (req, res, next) => {
  const user = await checkResourceAndUpdate(req, User);
  regenerateSession(req, res, user);
});

const myPassword_put = asyncHandler(async (req, res, next) => {
  const user = await checkResource(req, User, '+password');
  await checkPassword(req, user, req.body.currentPassword);
  user.password = req.body.newPassword;
  await user.save();
  regenerateSession(req, res, user);
});

const logout_get = asyncHandler((req, res, next) => {
  clearSessionUser(req, res, false);
});

export { 
  auth_get, 
  signup_get, 
  signup_post, 
  login_get, 
  login_post, 
  forgotPassword_get, 
  forgotPassword_post,
  resetPassword_get,
  resetPassword_put,
  myProfile_get,
  myDetails_put,
  myPassword_put,
  logout_get
};