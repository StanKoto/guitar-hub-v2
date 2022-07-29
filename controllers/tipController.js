import { Tip } from '../models/Tip.js';
import { asyncHandler, checkAuthorship, checkUserStatus, checkResource, processImages } from '../utils/helperFunctions.js';
import { ErrorResponse } from '../utils/errorHandling.js';

const tipsOverview_get = asyncHandler((req, res, next) => {
  res.render('tipViews/tipsOverview', { title: 'Tips Overview' });
});

const tips_get = asyncHandler(async (req, res, next) => {
  res.render('tipViews/getTips', { title: 'Guitar Tips', data: res.searchResults, path: req.baseUrl + req.path });
});

const tip_get = asyncHandler(async (req, res, next) => {
  const tip = await checkResource(req, Tip, '+images', { path: 'author', select: 'username slug' });
  let notRated = true;
  if (req.user && (!tip.author || !tip.author._id.equals(req.user._id))) {
    await tip.populate({ path: 'ratings', select: 'reviewer' });
    for (const rating of tip.ratings) {
      if (rating.reviewer && rating.reviewer.equals(req.user._id)) {
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
  const images = [];
  await processImages(req, images);
  const tip = await Tip.create({ 
    title: req.body.title, 
    contents: req.body.contents, 
    category: req.body.category, 
    author: req.user._id, 
    images
  });
  await checkUserStatus(req);
  res.status(201).json({ tip });
});

const tip_delete = asyncHandler(async (req, res, next) => {
  const tip = await checkResource(req, Tip);
  checkAuthorship(req, tip);
  await tip.remove();
  res.status(200).json({ success: true });
});

const tipEditForm_get = asyncHandler(async (req, res, next) => {
  const tip = await checkResource(req, Tip, '+images');
  res.render('tipViews/updateTip', { title: 'Update tip', tip });
});

const tip_put = asyncHandler(async (req, res, next) => {
  let tip = await checkResource(req, Tip);
  checkAuthorship(req, tip);
  tip.title = req.body.title;
  tip.contents = req.body.contents;
  if (req.body.category) tip.category = req.body.category
  await tip.save();
  res.status(200).json({ tip });
});

const tipImages_post = asyncHandler(async (req, res, next) => {
  const tip = await checkResource(req, Tip, '+images');
  await processImages(req, tip.images);
  await tip.save();
  res.status(200).json({ success: true });
});

const tipImages_delete = asyncHandler(async (req, res, next) => {
  const tip = await checkResource(req, Tip, '+images');
  if (!tip.images) throw new ErrorResponse(`No images found for tip with id of ${id}`, 404)
  tip.images.splice(req.params.index, 1);
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