const express = require('express');
const router = express.Router();
const { 
  createTransaction, 
  completeTransaction, 
  cancelTransaction, 
  quotationRequest ,
} = require('../controllers/paymentController');
const { protect, isUser, isAdmin, canCompleteTransaction } = require('../middleware/authMiddleware');

// Save transaction (without paying)
router.post('/transaction', protect, isUser, createTransaction);

// Complete payment (both users and admins can complete)
router.put('/transaction/complete', protect, canCompleteTransaction, completeTransaction);

// Cancel transaction (only users or admins can cancel)
router.put('/transaction/cancel', protect, isAdmin, cancelTransaction);

// Request for quotation
router.post('/quotation', protect, isUser, quotationRequest);

module.exports = router;
