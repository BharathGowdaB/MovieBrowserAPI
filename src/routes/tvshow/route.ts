import express from 'express';
import { controller } from './controller';

const router = express.Router();
router.route('/id/:tvshowId').get(controller.getTvshowById);
router.route('/popular').get(controller.getPopularTvshow);
router.route('/upcoming').get(controller.getUpcomingTvshow);
router.route('/top-rated').get(controller.getTopRatedTvshow);
router.route('/newly-added').get(controller.getNewlyAddedTvshow);
router.route('/search').get(controller.searchTvshow);

export default router;
