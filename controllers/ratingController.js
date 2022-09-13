import db from '../models/index.cjs';
import { asyncHandler, checkUserStatus, checkResource } from '../utils/helperFunctions.js';

const { Rating, Tip, TipReviewers, sequelize } = db;

const ratings_get = asyncHandler(async (req, res, next) => {
  let title;
  if (req.baseUrl.includes('tip-ratings')) title = `Tip ${req.params.id} ratings`
  if (req.path.includes('given-ratings')) title = `Ratings given by ${req.params.slug}`
  if (req.path.includes('received-ratings')) title = `Ratings received by ${req.params.slug}`
  res.render('ratingViews/getRatings', { 
    title, 
    data: res.searchResults, 
    path: req.baseUrl + req.path, 
    id: req.params.id, 
    slug: req.params.slug 
  });
});

const ratings_post = asyncHandler(async (req, res, next) => {
  const tip = await checkResource(req, Tip);
  if (tip.authorId && tip.authorId === req.user.id) throw new Error('Own tip rated')
  await sequelize.transaction(async t => {
    await Rating.create({
      rating: req.body.rating, 
      tipId: tip.id, 
      reviewerId: req.user.id,
      recipientId: tip.authorId
    },
    {
      transaction: t
    });
    await checkUserStatus(req, t);
  });
  res.status(201).json({ success: true });
});

export { ratings_get, ratings_post };