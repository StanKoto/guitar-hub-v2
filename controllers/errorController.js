const { asyncHandler } = require('../utils/helperFunctions');

exports.unauthorized_get = asyncHandler((req, res, next) => {
  res.status(401).render('errorViews/userError', { title: '401', message: req.query.message });
})

exports.userError_get = asyncHandler((req, res, next) => {
  res.status(404).render('errorViews/userError', { title: '404', message: req.query.message });
});

exports.serverError_get = asyncHandler((req, res, next) => {
  res.status(500).render('errorViews/serverError', { title: '500' });
})