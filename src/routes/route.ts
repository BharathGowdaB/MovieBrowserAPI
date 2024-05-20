import express from 'express';
import movieRoutes from './movie/route';

const router = express.Router();
router.use('/movie', movieRoutes);

export default router;

