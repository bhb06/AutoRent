const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/authMiddleware');
const {
  createReservation,
  getAllReservations,
  getUserReservations,
  updateReservationStatus,
  updateReservationByUser,
  deleteReservation,
  getCarReservedDates,
  autoCompleteReservations,
  cancelReservationByUser, // ✅ Add this line
  getReservationById
} = require('../controllers/reservationController');


// ✅ Create a new reservation (User only)
router.post('/', protect, createReservation);


// ✅ Cancel Reservation (Only owner or admin can cancel)
router.put('/:id/cancel', protect, cancelReservationByUser);  // This is updated to include the reservation owner check

// ✅ Get all reservations (Admin only)
router.get('/', protect, isAdmin, getAllReservations);

// ✅ Get current user's reservations
router.get('/my', protect, getUserReservations);

router.get('/:id', protect, getReservationById);

// ✅ Update reservation status (Admin only)
router.put('/:id/status', protect, isAdmin, updateReservationStatus);

// ✅ Update reservation (User only, before pickup date)
router.put('/:id', protect, updateReservationByUser);

// ✅ Delete reservation (Owner or Admin only)
router.delete('/:id', protect, deleteReservation);

// ✅ Get reserved dates for a car
router.get('/car/:id/reserved-dates', protect, getCarReservedDates);

// ✅ Automatically complete reservations when dropDate has passed
router.put('/auto-complete', protect, autoCompleteReservations);

module.exports = router;
