import express from 'express';
import multer from 'multer';
import config from '../envVariables.cjs';
import { checkAuthentication } from '../middleware/auth.js';
import { searchResults } from '../middleware/searchResults.js';
import db from '../models/index.cjs';
import {
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
} from '../controllers/tipController.js';
import { tipRatingRouter } from '../routes/tipRatingRoutes.js';

const { Tip, User } = db;

const upload = multer({
  limits: {
    fileSize: config.multer.fileSize
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|png)$/)) {
      return cb(new Error('Not an image'));
    }
    cb(undefined, true);
  }
});

const tipRouter = express.Router();

tipRouter.get('/', tipsOverview_get);
tipRouter.get('/tips', searchResults(Tip, [
  { model: User, as: 'author', attributes: [ 'username' ] }
], [ 'contents', 'images' ]), tips_get);
tipRouter.get('/tips/:id/:slug', tip_get);
tipRouter.use(checkAuthentication);
tipRouter.get('/new-tip-form', newTipForm_get)
tipRouter.post('/tips', upload.array('images', 10), tips_post);
tipRouter.route('/tips/:id/:slug')
  .put(tip_put)
  .delete(tip_delete);
tipRouter.use('/tips/:id/:slug/tip-ratings', tipRatingRouter);
tipRouter.get('/tips/:id/:slug/tip-edit-form', tipEditForm_get);
tipRouter.post('/tips/:id/:slug/images', upload.array('images', 10), tipImages_post)
tipRouter.delete('/tips/:id/:slug/images/:index', tipImages_delete);

export { tipRouter };