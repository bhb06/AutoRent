const Reservation = require('../models/Reservation');
const Invoice = require('../models/Invoice');
const Coupon = require('../models/Coupon');

// ✅ Create a transaction (save without paying)
exports.createTransaction = async (req, res) => {
  try {
    const { reservationId, paymentMethod, quotationRequested, couponCode } = req.body;

    // Check if user already has a saved transaction
    const existingInvoice = await Invoice.findOne({ userId: req.user._id, status: 'saved' });
    if (existingInvoice) {
      return res.status(400).json({ message: 'You already have a saved transaction.' });
    }

    const reservation = await Reservation.findById(reservationId);
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });

    let discountPercent = 0;

    // Apply coupon if provided
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });

      if (!coupon) return res.status(400).json({ message: 'Invalid coupon code' });
      if (new Date() > new Date(coupon.expiryDate)) return res.status(400).json({ message: 'Coupon has expired' });
      if (coupon.usedBy.includes(req.user._id)) return res.status(400).json({ message: 'You have already used this coupon' });

      discountPercent = coupon.discountPercent;

      // Mark coupon as used for this user
      coupon.usedBy.push(req.user._id);
      await coupon.save();
    }

    const totalPrice = reservation.totalPrice;
    const discountAmount = totalPrice * (discountPercent / 100);
    const finalAmount = totalPrice - discountAmount;

    const invoice = new Invoice({
      reservationId,
      userId: req.user._id,
      amount: finalAmount,
      paymentMethod,
      quotationRequested: quotationRequested || false,
      couponCode: couponCode?.toUpperCase() || null,
      discountPercent,
      status: 'saved'
    });

    await invoice.save();
    res.status(201).json({ message: 'Transaction saved', data: invoice });

  } catch (error) {
    res.status(500).json({ message: 'Error saving transaction', error: error.message });
  }
};

// ✅ Complete payment (finalize transaction)
exports.completeTransaction = async (req, res) => {
  try {
    const { invoiceId, paymentMethod } = req.body;

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    invoice.paymentMethod = paymentMethod;
    invoice.status = 'paid';  // Mark as paid
    await invoice.save();

    res.status(200).json({ message: 'Payment completed', data: invoice });

  } catch (error) {
    res.status(500).json({ message: 'Error completing payment', error: error.message });
  }
};

// ✅ Cancel transaction (user or admin)
exports.cancelTransaction = async (req, res) => {
  try {
    const { invoiceId } = req.body;

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    invoice.status = 'canceled'; // Mark as canceled
    await invoice.save();

    res.status(200).json({ message: 'Transaction canceled', data: invoice });

  } catch (error) {
    res.status(500).json({ message: 'Error canceling transaction', error: error.message });
  }
};

// ✅ Request quotation (save transaction without payment)
exports.quotationRequest = async (req, res) => {
  try {
    const { reservationId } = req.body;

    const reservation = await Reservation.findById(reservationId);
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });

    // Save the transaction as a quotation (no payment)
    const quotation = new Invoice({
      reservationId,
      userId: req.user._id,
      amount: reservation.totalPrice,
      paymentMethod: 'Pay at location',
      quotationRequested: true,
    });

    await quotation.save();
    res.status(201).json({ message: 'Quotation saved', data: quotation });

  } catch (error) {
    res.status(500).json({ message: 'Error requesting quotation', error: error.message });
  }
};