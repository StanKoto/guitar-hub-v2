const express = require('express');
const { checkAuthentication, checkRole } = require('../middleware/auth');
const { searchResults } = require('../middleware/searchResults');
const { User } = require('../models/User');
const {
  userManagement_get, 
  newUserForm_get, 
  users_get, 
  users_post, 
  user_get, 
  user_delete,
  userEditForm_get, 
  userDetails_put, 
  userPassword_put 
} = require('../controllers/userController');
const userRatingRouter = require('../routes/userRatingRoutes');

const userRouter = express.Router();

userRouter.use(checkAuthentication, checkRole);

userRouter.get('/', userManagement_get);
userRouter.get('/new-user-form' ,newUserForm_get)
userRouter.route('/users')
  .get(searchResults(User), users_get)
  .post(users_post);
userRouter.route('/users/:id/:slug')
  .get(user_get)
  .delete(user_delete);
userRouter.use('/users/:id/:slug/user-ratings', userRatingRouter);
userRouter.get('/users/:id/:slug/user-edit-form', userEditForm_get);
userRouter.put('/users/:id/:slug/user-details', userDetails_put);
userRouter.put('/users/:id/:slug/user-password', userPassword_put);

module.exports = userRouter;