const express = require('express');
const { checkAuthentication } = require('../middleware/auth');
const { 
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
} = require('../controllers/authController');

const authRouter = express.Router();

authRouter.get('/',auth_get);
authRouter.route('/signup')
  .get(signup_get)
  .post(signup_post);
authRouter.route('/login')
  .get(login_get)
  .post(login_post);
authRouter.route('/forgot-password')
  .get(forgotPassword_get)
  .post(forgotPassword_post);
authRouter.route('/reset-password/:resetToken')
  .get(resetPassword_get)
  .put(resetPassword_put);
authRouter.use(checkAuthentication);
authRouter.get('/my-profile', myProfile_get);
authRouter.put('/my-profile/my-details', myDetails_put);
authRouter.put('/my-profile/my-password', myPassword_put);
authRouter.get('/logout', logout_get);

module.exports = authRouter;