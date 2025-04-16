const Invoice = require('../models/Invoice');
const Reservation = require('../models/Reservation');
const Coupon = require('../models/Coupon');

exports.createInvoice = async (req, res) => {
  try {
    const { reservationId, paymentMethod, quotationRequested, couponCode } = req.body;

    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Prepare invoice fields
    let discountPercent = 0;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });

      if (!coupon) {
        return res.status(400).json({ message: 'Invalid coupon code' });
      }

      if (new Date() > new Date(coupon.expiryDate)) {
        return res.status(400).json({ message: 'Coupon has expired' });
      }

      if (coupon.usedBy.includes(req.user._id)) {
        return res.status(400).json({ message: 'You have already used this coupon' });
      }

      discountPercent = coupon.discountPercent;

      // ✅ Mark as used by current user
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


exports.markAsPaid = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    invoice.paid = true;
    await invoice.save();

    res.status(200).json({ message: 'Invoice marked as paid', data: invoice });
  } catch (error) {
    res.status(500).json({ message: 'Error updating invoice', error: error.message });
  }
};

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
