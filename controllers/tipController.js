import db from '../models/index.cjs';
import { 
  asyncHandler, 
  checkAuthorship, 
  checkUserStatus, 
  checkResource, 
  processImages, 
  deleteOneImage,
  deleteAllImages
} from '../utils/helperFunctions.js';
import { ErrorResponse } from '../utils/errorHandling.js';

const { Tip, User, sequelize } = db;

const tipsOverview_get = asyncHandler((req, res, next) => {
  res.render('tipViews/tipsOverview', { title: 'Tips Overview' });
});

const tips_get = asyncHandler(async (req, res, next) => {
  res.render('tipViews/getTips', { title: 'Guitar Tips', data: res.searchResults, path: req.baseUrl + req.path });
});

const tip_get = asyncHandler(async (req, res, next) => {
  const tip = await checkResource(req, Tip, undefined, { model: User, as: 'author', attributes: [ 'username', 'slug' ] } );
  let notRated;
  if (req.user && (!tip.authorId || tip.authorId !== req.user.id)) {
    notRated = true;
    const tipRatings = await tip.getRatings();
    for (const rating of tipRatings) {
      if (rating.reviewerId && rating.reviewerId === req.user.id) {
        notRated = false;
        break;
      }
    }
  }
  res.render('tipViews/getTip', { title: tip.title, tip, path: req.baseUrl + req.path, notRated });
});

const newTipForm_get = asyncHandler((req, res, next) => {
  res.render('tipViews/createTip', { title: 'Create new tip' });
});

const tips_post = asyncHandler(async (req, res, next) => {
  let tip;
  await sequelize.transaction(async t => {
    tip = await Tip.create({ 
      title: req.body.title, 
      contents: req.body.contents, 
      category: req.body.category, 
      authorId: req.user.id
    }, {
      transaction: t
    });
    if (req.files) await processImages(req, tip)
    await tip.save({ transaction: t });
    await checkUserStatus(req, t);
  });
  res.status(201).json({ tip });
});

const tip_delete = asyncHandler(async (req, res, next) => {
  const tip = await checkResource(req, Tip);
  checkAuthorship(req, tip);
  if (tip.images && tip.images.length !== 0) await deleteAllImages(tip.images.map(image => image.id));
  await tip.destroy();
  res.status(200).json({ success: true });
});

const tipEditForm_get = asyncHandler(async (req, res, next) => {
  const tip = await checkResource(req, Tip);
  checkAuthorship(req, tip);
  res.render('tipViews/updateTip', { title: 'Update tip', tip });
});

const tip_put = asyncHandler(async (req, res, next) => {
  let tip = await checkResource(req, Tip);
  checkAuthorship(req, tip);
  tip.set({
    title: req.body.title,
    contents: req.body.contents
  });
  if (req.body.category) tip.category = req.body.category
  await tip.save();
  res.status(200).json({ tip });
});

const tipImages_post = asyncHandler(async (req, res, next) => {
  const tip = await checkResource(req, Tip);
  checkAuthorship(req, tip);
  if (req.files) await processImages(req, tip);
  await tip.save();
  res.status(200).json({ success: true });
});

const tipImages_delete = asyncHandler(async (req, res, next) => {
  const index = req.params.index;
  const tip = await checkResource(req, Tip);
  checkAuthorship(req, tip);
  if (!tip.images) throw new ErrorResponse(`No images found for tip with id of ${tip.id}`, 404)
  await deleteOneImage(tip.images, index);
  tip.images.splice(index, 1);
  tip.changed('images', true);
  await tip.save();
  res.status(200).json({ success: true });
});

export { 
  tipsOverview_get, 
  tips_get, 
  tip_get, 
  newTipForm_get, 
  tips_post,
  tip_delete,
  tipEditForm_get,
  tip_put,
  tipImages_post,
  tipImages_delete
};