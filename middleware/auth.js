import verify from 'jsonwebtoken/verify.js';
import config from '../envVariables.js';
import { asyncHandler } from '../utils/helperFunctions.js';
import { User } from '../models/User.js';
import { ErrorResponse } from '../utils/errorHandling.js';

const checkAuthentication = asyncHandler((req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    verify(token, config.jwt.secret, (err, decodedToken) => {
      if (err) return res.redirect('/auth')
      next();
    })
  } else res.redirect('/auth')
});

const checkUser = asyncHandler((req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    verify(token, config.jwt.secret, async (err, decodedToken) => {
      if (err) {
        res.locals.currentUser = null;
        return next();
      }      
      const user = await User.findById(decodedToken.id);
      if (!user) throw new ErrorResponse(`No user found with ID of ${req.session.user}`)
      req.user = user;
      res.locals.currentUser = user;
      next();
    })
  } else {
    res.locals.currentUser = null;
    next();
  }
});

const checkRole = asyncHandler((req, res, next) => {
  if (req.user.role === 'admin') return next()
  throw new ErrorResponse('You are not authorized to access this resource!', 401);
});

export { checkAuthentication, checkUser, checkRole };