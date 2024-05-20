import express from 'express';
import { controller } from './controller';

const router = express.Router();
router.route('/popular').get(controller.getPopularMovies);

export default router;
