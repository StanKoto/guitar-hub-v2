import express from 'express';
import { searchResults } from '../middleware/searchResults.js';
import db from '../models/index.cjs';
import { ratings_get, ratings_post } from '../controllers/ratingController.js';

const { Rating, Tip, User } = db;

const tipRatingRouter = express.Router({ mergeParams: true });

tipRatingRouter.route('/')
  .get(searchResults(Rating, [
  { 
    model: Tip, 
    attributes: [ 'title' ] 
  }, 
  { 
    model: User,
    as: 'reviewer', 
    attributes: [ 'username' ]
   },
  { 
    model: User,
    as: 'recipient',
    attributes: [ 'username' ]
  }
]), ratings_get)
  .post(ratings_post);

export { tipRatingRouter };