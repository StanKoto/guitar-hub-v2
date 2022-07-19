import { asyncHandler } from '../utils/helperFunctions.js';

const unauthorized_get = asyncHandler((req, res, next) => {
  res.status(401).render('errorViews/userError', { title: '401', message: req.query.message });
})

const userError_get = asyncHandler((req, res, next) => {
  res.status(404).render('errorViews/userError', { title: '404', message: req.query.message });
});

const serverError_get = asyncHandler((req, res, next) => {
  res.status(500).render('errorViews/serverError', { title: '500' });
})

export { unauthorized_get, userError_get, serverError_get };