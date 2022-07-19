import express from 'express';
import { searchResults } from '../middleware/searchResults.js';
import { Rating } from '../models/Rating.js';
import { ratings_get, ratings_post } from '../controllers/ratingController.js';

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

export { tipRatingRouter };