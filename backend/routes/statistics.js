const express = require('express');
const router = express.Router();
const {
  getHomeStats,
  getBusinessStats
} = require('../controllers/statisticsController');

// Homepage stats (available cars, reviews, etc.)
router.get('/home-stats', getHomeStats);

// Business insights (most popular car, avg fee)
router.get('/business', getBusinessStats);

module.exports = router;
