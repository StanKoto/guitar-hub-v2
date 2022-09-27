import express from 'express';
import { searchResults } from '../middleware/searchResults.js';
import db from '../models/index.cjs';
import { ratings_get } from '../controllers/ratingController.js';

const { Rating, Tip, User } = db;

const userRatingRouter = express.Router({ mergeParams: true });

userRatingRouter.get('/given-ratings', searchResults(Rating, [
  { model: Tip, attributes: [ 'title' ] }, 
  { model: User, as: 'reviewer', attributes: [ 'username' ] },
  { model: User, as: 'recipient', attributes: [ 'username' ] }
]), ratings_get);

userRatingRouter.get('/received-ratings', searchResults(Rating, [
  { model: Tip, attributes: [ 'title' ] }, 
  { model: User, as: 'reviewer', attributes: [ 'username' ] },
  { model: User, as: 'recipient', attributes: [ 'username' ] }
]), ratings_get);

export { userRatingRouter };