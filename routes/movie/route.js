const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.route('/popular').get(controller.getPopularMovies);

module.exports = router;
