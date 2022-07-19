import { asyncHandler } from '../utils/helperFunctions.js';

const index_get = asyncHandler((req, res, next) => {
  res.render('mainViews/index', { title: 'Guitar Wiki' });
});

const about_get = asyncHandler((req, res, next) => {
  res.render('mainViews/about', { title: 'About' });
});

const badRequest_get = asyncHandler((req, res, next) => {
  res.status(404).render('errorViews/userError', { 
    title: '404', 
    message: 'Oops! It seems the page you wanted to reach does not exist!'
  })
});

export { index_get, about_get, badRequest_get };