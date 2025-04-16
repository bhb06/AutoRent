const express = require('express');
const router = express.Router();
const {
  createInvoice,
  markAsPaid,
  getUserInvoices,
  deleteInvoice
} = require('../controllers/invoiceController');

const { protect, isAdmin } = require('../middleware/authMiddleware');

router.post('/', protect, createInvoice);
router.put('/:id/pay', protect, isAdmin, markAsPaid);
router.get('/my', protect, getUserInvoices);
router.delete('/:id', protect, deleteInvoice);

module.exports = router;
