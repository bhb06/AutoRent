const express = require('express');
const router = express.Router();
const {
  createInvoice,
  markAsPaid,
  getUserInvoices,
  deleteInvoice,
  cancelInvoice,
  getUserSavedInvoices
} = require('../controllers/invoiceController');

const { protect, isAdmin } = require('../middleware/authMiddleware');

router.post('/', protect, createInvoice);
router.put('/:id/pay', protect, markAsPaid);
router.get('/my', protect, getUserInvoices);
router.delete('/:id', protect, deleteInvoice);
router.put('/:id/cancel', protect, cancelInvoice)
router.put('/complete', protect, markAsPaid); // <-- Add this line
router.get('/my-saved', protect, getUserSavedInvoices);

module.exports = router;
