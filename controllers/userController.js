import { User } from '../models/User.js';
import { 
  asyncHandler,
  checkPassword, 
  checkResource
} from '../utils/helperFunctions.js';
import { ErrorResponse } from '../utils/errorHandling.js';

const userManagement_get = asyncHandler((req, res, next) => {
  res.render('userViews/userManagement', { title: 'User Management' });
});

const newUserForm_get = asyncHandler((req, res, next) => {
  res.render('userViews/createUser', { title: 'Create new user' });
});

const users_get = asyncHandler(async (req, res, next) => {
  res.render('userViews/getUsers', { title: 'Users', data: res.searchResults, path: req.baseUrl + req.path });
});

const users_post = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);
  res.status(201).json({ user } );
});

const user_get = asyncHandler(async (req, res, next) => {
  const user = await checkResource(req, User);
  res.render('userViews/getUser', { title: user.username, user, path: req.baseUrl + req.path });
});

const user_delete = asyncHandler(async (req, res, next) => {
  const user = await checkResource(req, User);
  await user.remove();
  if (user._id.equals(req.user._id)) {
    res.cookie('jwt', '', { maxAge: 1 });
    return res.status(200).json({ selfDelete: true });
  }
  res.status(200).json({ success: true });
});

const userEditForm_get = asyncHandler(async (req, res, next) => {
  const user = await checkResource(req, User);
  res.render('userViews/updateUser', { title: 'Update user details', user });
});

const userDetails_put = asyncHandler(async (req, res, next) => {
  const user = await checkResource(req, User);
  if (req.body.username) user.username = req.body.username
  if (req.body.email) user.email = req.body.email
  if (req.body.role) user.role = req.body.role
  await user.save();
  if (user._id.equals(req.user._id)) return res.status(200).json({ user, selfUpdate: true })
  res.status(200).json({ user });
});

const userPassword_put = asyncHandler(async (req, res, next) => {
  const adminUser = await User.findById(req.user._id).select('+password');
  if (!adminUser) throw new ErrorResponse(`No admin account found with id of ${req.user._id}`, 404);
  await checkPassword(req, adminUser, req.body.adminPassword);
  const user = await checkResource(req, User);
  user.password = req.body.newPassword;
  await user.save();
  res.status(200).json({ user });
});

export { 
  userManagement_get,
  newUserForm_get,
  users_get,
  users_post,
  user_get,
  user_delete,
  userEditForm_get,
  userDetails_put,
  userPassword_put
};