const express = require('express');
const { searchResults } = require('../middleware/searchResults');
const { Rating } = require('../models/Rating');
const { ratings_get } = require('../controllers/ratingController');

const ratingRouter = express.Router({ mergeParams: true });

ratingRouter.get('/given-ratings', searchResults(Rating, [
  { path: 'tip', select: 'title' }, 
  { path: 'reviewer', select: 'username' },
  { path: 'recipient', select: 'username' }
]), ratings_get);

ratingRouter.get('/received-ratings', searchResults(Rating, [
  { path: 'tip', select: 'title' }, 
  { path: 'reviewer', select: 'username' },
  { path: 'recipient', select: 'username' }
]), ratings_get);

module.exports = ratingRouter;