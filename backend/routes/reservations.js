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
    cancelReservationByUser // ✅ Add this line
  } = require('../controllers/reservationController');
  
    router.put('/:id/cancel', protect, cancelReservationByUser);          // ✅ FIRST
    router.post('/', protect, createReservation);
    router.get('/', protect, isAdmin, getAllReservations);
    router.get('/my', protect, getUserReservations);
    router.put('/:id/status', protect, isAdmin, updateReservationStatus);
    router.put('/:id', protect, updateReservationByUser);                // ✅ AFTER cancel
    router.delete('/:id', protect, deleteReservation);
    router.get('/car/:id/reserved-dates', protect, getCarReservedDates);

  module.exports = router;

  