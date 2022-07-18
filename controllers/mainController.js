const { asyncHandler } = require('../utils/helperFunctions');

exports.index_get = asyncHandler((req, res, next) => {
  res.render('mainViews/index', { title: 'Guitar Wiki' });
});

exports.about_get = asyncHandler((req, res, next) => {
  res.render('mainViews/about', { title: 'About' });
});

exports.badRequest_get = asyncHandler((req, res, next) => {
  res.status(404).render('errorViews/userError', { 
    title: '404', 
    message: 'Oops! It seems the page you wanted to reach does not exist!'
  })
});