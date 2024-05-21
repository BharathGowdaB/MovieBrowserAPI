import express from 'express';
import { controller } from './controller';

const router = express.Router();
router.route('/id/:movieId').get(controller.getMovieById);
router.route('/popular').get(controller.getPopularMovies);
router.route('/upcoming').get(controller.getUpcomingMovies);
router.route('/top-rated').get(controller.getTopRatedMovies);
router.route('/newly-added').get(controller.getNewlyAddedMovies);

export default router;
