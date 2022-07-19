import express from 'express';
import { searchResults } from '../middleware/searchResults.js';
import { Rating } from '../models/Rating.js';
import { ratings_get } from '../controllers/ratingController.js';

const userRatingRouter = express.Router({ mergeParams: true });

userRatingRouter.get('/given-ratings', searchResults(Rating, [
  { path: 'tip', select: 'title' }, 
  { path: 'reviewer', select: 'username' },
  { path: 'recipient', select: 'username' }
]), ratings_get);

userRatingRouter.get('/received-ratings', searchResults(Rating, [
  { path: 'tip', select: 'title' }, 
  { path: 'reviewer', select: 'username' },
  { path: 'recipient', select: 'username' }
]), ratings_get);

export { userRatingRouter };