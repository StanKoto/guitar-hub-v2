const express = require('express');
const { index_get, about_get, badRequest_get } = require('../controllers/mainController');

const mainRouter = express.Router();

mainRouter.get('/', index_get);
mainRouter.get('/about', about_get);
mainRouter.get('*', badRequest_get);

module.exports = mainRouter;