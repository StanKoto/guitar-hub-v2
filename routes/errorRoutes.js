const express = require('express');
const { unauthorized_get, userError_get, serverError_get } = require('../controllers/errorController');

const errorRouter = express.Router();

errorRouter.get('/unauthorized', unauthorized_get);
errorRouter.get('/bad-request', userError_get);
errorRouter.get('/server-error', serverError_get);

module.exports = errorRouter;