import express from 'express';
import movieRoutes from './movie/route';
import tvshowRoutes from './tvshow/route';

const router = express.Router();
router.use('/movie', movieRoutes);
router.use('/tvshow', tvshowRoutes);

export default router;
