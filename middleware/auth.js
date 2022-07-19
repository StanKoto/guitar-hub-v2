import { asyncHandler } from '../utils/helperFunctions.js';
import { User } from '../models/User.js';
import { ErrorResponse } from '../utils/errorHandling.js';

const checkAuthentication = asyncHandler(async (req, res, next) => {
  if (req.session.user) {
    next();
  } else res.redirect('/auth')
});

const checkRole = asyncHandler((req, res, next) => {
  if (req.user.role === 'admin') return next()
  throw new ErrorResponse('You are not authorized to access this resource!', 401);
});

const checkUser = asyncHandler(async (req, res, next) => {
  if (req.session.user) {
    const user = await User.findById(req.session.user);
    if (!user) throw new ErrorResponse(`No user found with ID of ${req.session.user}`)
    req.user = user;
    res.locals.currentUser = user;
    return next();
  }
  res.locals.currentUser = null;
  next();
});

export { checkAuthentication, checkRole, checkUser };