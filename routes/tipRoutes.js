const express = require('express');
const multer = require('multer');
const { checkAuthentication } = require('../middleware/auth');
const { searchResults } = require('../middleware/searchResults');
const { Tip } = require('../models/Tip');
const {
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
} = require('../controllers/tipController');
const tipRatingRouter = require('../routes/tipRatingRoutes');

const upload = multer({
  limits: {
    fileSize: 2000000
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
tipRouter.get('/tips', searchResults(Tip, [{ path: 'author', select: 'username' }]), tips_get);
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

module.exports = tipRouter;