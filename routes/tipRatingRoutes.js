const express = require('express');
const { searchResults } = require('../middleware/searchResults');
const { Rating } = require('../models/Rating');
const { ratings_get, ratings_post } = require('../controllers/ratingController');

const tipRatingRouter = express.Router({ mergeParams: true });

tipRatingRouter.route('/')
  .get(searchResults(Rating, [
  { 
    path: 'tip', 
    select: 'title' 
  }, 
  { 
    path: 'reviewer', 
    select: 'username'
   },
  { 
    path: 'recipient', 
    select: 'username'
  }
]), ratings_get)
  .post(ratings_post);

module.exports = tipRatingRouter;