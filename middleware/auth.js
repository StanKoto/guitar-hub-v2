import passport from 'passport';
import verify from 'jsonwebtoken/verify.js';
import config from '../envVariables.cjs';
import { asyncHandler } from '../utils/helperFunctions.js';
import db from '../models/index.cjs';
import { ErrorResponse } from '../utils/errorHandling.js';

const { User } = db;

const checkAuthentication = (req, res, next) => {
  passport.authenticate('jwt', (err, user, info) => {
    if (err) return next(err)
    if (!user) return res.redirect('/auth')
    next();
  }) (req, res, next)
};

const checkUser = asyncHandler((req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    verify(token, config.jwt.secret, async (err, decodedToken) => {
      if (err) {
        res.locals.currentUser = null;
        return next();
      }    
      const user = await User.findByPk(decodedToken.id, { attributes: [ 'id', 'username', 'status', 'role' ] });
      if (!user) throw new ErrorResponse(`No user found with ID of ${decodedToken.id}`, 404)
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