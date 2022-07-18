const { asyncHandler } = require('../utils/helperFunctions');
const { User } = require('../models/User');
const { ErrorResponse } = require('../utils/errorHandling');

exports.checkAuthentication = asyncHandler(async (req, res, next) => {
  if (req.session.user) {
    next();
  } else res.redirect('/auth')
});

exports.checkRole = asyncHandler((req, res, next) => {
  if (req.user.role === 'admin') return next()
  throw new ErrorResponse('You are not authorized to access this resource!', 401);
});

exports.checkUser = asyncHandler(async (req, res, next) => {
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