const Coupon = require('../models/Coupon');
const Invoice = require('../models/Invoice');

// ✅ Admin creates a coupon
exports.createCoupon = async (req, res) => {
  try {
    const { code, discountPercent, expiryDate } = req.body;

    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) return res.status(400).json({ message: 'Coupon code already exists' });

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountPercent,
      expiryDate
    });

    res.status(201).json({ message: 'Coupon created', data: coupon });
  } catch (error) {
    res.status(500).json({ message: 'Error creating coupon', error: error.message });
  }
};

// ✅ Admin deletes a coupon
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });

    res.status(200).json({ message: 'Coupon deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting coupon', error: error.message });
  }
};

// ✅ Admin gets all coupons
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.status(200).json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching coupons', error: error.message });
  }
};

// ✅ Validate coupon (used for admin or if separate validation needed)
exports.validateCoupon = async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    const coupon = await Coupon.findOne({ code });

    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });

    if (new Date() > new Date(coupon.expiryDate)) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }

    const userId = req.user._id.toString();
    if (coupon.usedBy && coupon.usedBy.includes(userId)) {
      return res.status(400).json({ message: 'You have already used this coupon' });
    }

    res.status(200).json({
      message: 'Coupon is valid',
      discountPercent: coupon.discountPercent,
      couponId: coupon._id,
      code: coupon.code
    });

  } catch (error) {
    res.status(500).json({ message: 'Error validating coupon', error: error.message });
  }
};

// ✅ Mark coupon as used manually (e.g., after invoice is paid)
exports.markCouponAsUsed = async (req, res) => {
  try {
    const { code } = req.body;

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });

    if (!coupon.usedBy.includes(req.user._id)) {
      coupon.usedBy.push(req.user._id);
      await coupon.save();
    }

    res.status(200).json({ message: 'Coupon marked as used' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating coupon', error: error.message });
  }
};

// ✅ User applies coupon directly (main route for frontend use)
exports.applyCoupon = async (req, res) => {
  try {
    const { couponCode, reservationId } = req.body;
    if (!couponCode || !reservationId) {
      return res.status(400).json({ message: 'Coupon code and reservationId are required' });
    }

    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });

    if (new Date() > new Date(coupon.expiryDate)) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }

    const userId = req.user._id.toString();
    if (coupon.usedBy && coupon.usedBy.includes(userId)) {
      return res.status(400).json({ message: 'You have already used this coupon' });
    }

    // Mark coupon as used now (assuming once applied it’s consumed)
    coupon.usedBy.push(userId);
    await coupon.save();

    res.status(200).json({
      message: 'Coupon applied successfully',
      discountPercent: coupon.discountPercent,
      code: coupon.code
    });
  } catch (error) {
    res.status(500).json({ message: 'Error applying coupon', error: error.message });
  }
};
