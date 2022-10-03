import express from 'express';
import { checkAuthentication, checkRole } from '../middleware/auth.js';
import { searchResults } from '../middleware/searchResults.js';
import db from '../models/index.cjs';
import {
  userManagement_get, 
  newUserForm_get, 
  users_get, 
  users_post, 
  user_get, 
  user_delete,
  userEditForm_get, 
  userDetails_put, 
  userPassword_put 
} from '../controllers/userController.js';
import { userRatingRouter } from '../routes/userRatingRoutes.js';

const { User } = db;

const userRouter = express.Router();

userRouter.use(checkAuthentication, checkRole);

userRouter.get('/', userManagement_get);
userRouter.get('/new-user-form' ,newUserForm_get)
userRouter.route('/users')
  .get(searchResults(User, undefined, [
    'password', 
    'passwordSet', 
    'resetPasswordToken', 
    'resetPasswordExpire'
  ]), users_get)
  .post(users_post);
userRouter.route('/users/:id/:slug')
  .get(user_get)
  .delete(user_delete);
userRouter.use('/users/:id/:slug/user-ratings', userRatingRouter);
userRouter.get('/users/:id/:slug/user-edit-form', userEditForm_get);
userRouter.put('/users/:id/:slug/user-details', userDetails_put);
userRouter.put('/users/:id/:slug/user-password', userPassword_put);

export { userRouter };