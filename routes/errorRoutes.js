import express from 'express';
import { unauthorized_get, userError_get, serverError_get } from '../controllers/errorController.js';

const errorRouter = express.Router();

errorRouter.get('/unauthorized', unauthorized_get);
errorRouter.get('/bad-request', userError_get);
errorRouter.get('/server-error', serverError_get);

export { errorRouter };