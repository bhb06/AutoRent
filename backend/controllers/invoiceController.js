const Invoice = require('../models/Invoice');
const Reservation = require('../models/Reservation');
const Coupon = require('../models/Coupon');

// ✅ Create invoice (apply coupon discount)
exports.createInvoice = async (req, res) => {
  try {
    const { reservationId, paymentMethod, quotationRequested, couponCode } = req.body;

    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    let discountPercent = 0;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });

      if (!coupon) return res.status(400).json({ message: 'Invalid coupon code' });

      if (new Date() > new Date(coupon.expiryDate)) {
        return res.status(400).json({ message: 'Coupon has expired' });
      }

      if (coupon.usedBy.includes(req.user._id)) {
        return res.status(400).json({ message: 'You have already used this coupon' });
      }

      discountPercent = coupon.discountPercent;

      // ✅ Mark coupon as used
      coupon.usedBy.push(req.user._id);
      await coupon.save();
    }

    const discountAmount = reservation.totalPrice * (discountPercent / 100);
    const finalAmount = reservation.totalPrice - discountAmount;

    const invoice = new Invoice({
      reservationId,
      userId: req.user._id,
      amount: finalAmount,
      paymentMethod,
      quotationRequested: quotationRequested || false,
      couponCode: couponCode?.toUpperCase() || null,
      discountPercent
    });

    await invoice.save();
    res.status(201).json({ message: 'Invoice created', data: invoice });

  } catch (error) {
    res.status(500).json({ message: 'Error creating invoice', error: error.message });
  }
};

// ✅ Mark invoice as paid
exports.markAsPaid = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    invoice.status = 'paid'; // more descriptive than boolean
    await invoice.save();

    res.status(200).json({ message: 'Invoice marked as paid', data: invoice });
  } catch (error) {
    res.status(500).json({ message: 'Error updating invoice', error: error.message });
  }
};

// ✅ Get current user's invoices
exports.getUserInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ userId: req.user._id })
      .populate({
        path: 'reservationId',
        populate: ['pickupBranch', 'dropBranch', 'selectedCars']
      });

    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching invoices', error: error.message });
  }
};

// ✅ Delete invoice (user or admin)
exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    const isOwner = invoice.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this invoice' });
    }

    await invoice.deleteOne();
    res.status(200).json({ message: 'Invoice deleted' });

  } catch (error) {
    res.status(500).json({ message: 'Error deleting invoice', error: error.message });
  }
};

// ✅ Cancel invoice (user or admin)
exports.cancelInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    const isOwner = invoice.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to cancel this invoice' });
    }

    invoice.status = 'canceled';
    await invoice.save();

    res.status(200).json({ message: 'Invoice canceled successfully', data: invoice });
  } catch (error) {
    res.status(500).json({ message: 'Error canceling invoice', error: error.message });
  }
};

// ✅ Get user's saved (pending) transactions
exports.getUserSavedInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({
      userId: req.user._id,
      status: 'saved'
    })
    .populate({
      path: 'reservationId',
      populate: {
        path: 'selectedCars',
        select: 'brand model dailyFee'
      }
    });

    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching saved transactions', error: error.message });
  }
};

