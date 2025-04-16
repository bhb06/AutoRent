const express = require('express');
const router = express.Router();
const {
    createReview,
    getAllReviews,
    deleteReview,
    updateReview
  } = require('../controllers/reviewController');
  
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.post('/', protect, createReview);
router.put('/:id', protect, updateReview);
router.get('/', getAllReviews);
router.delete('/:id', protect, deleteReview);

module.exports = router;
