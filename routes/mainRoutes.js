import express from 'express';
import { index_get, about_get, badRequest_get } from '../controllers/mainController.js';

const mainRouter = express.Router();

mainRouter.get('/', index_get);
mainRouter.get('/about', about_get);
mainRouter.get('*', badRequest_get);

export { mainRouter };