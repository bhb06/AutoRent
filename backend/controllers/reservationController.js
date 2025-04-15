const Reservation = require('../models/Reservation');
const Car = require('../models/Car');

const SERVICE_FEES = {
  insurance: 50,
  "baby seat": 20,
  wifi: 10,
  gps: 15,
  "extra driver": 30
};

// ✅ Create a reservation (user only, prevents overlapping)
exports.createReservation = async (req, res) => {
  try {
    const {
      pickupLocation,
      dropLocation,
      pickupDate,
      dropDate,
      selectedCars,
      services
    } = req.body;

    const start = new Date(pickupDate);
    const end = new Date(dropDate);
    const rentalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (rentalDays <= 0) return res.status(400).json({ message: 'Invalid date range' });

    for (let carId of selectedCars) {
      const conflict = await Reservation.findOne({
        selectedCars: carId,
        $or: [
          {
            pickupDate: { $lte: end },
            dropDate: { $gte: start }
          }
        ]
      });

      if (conflict) {
        return res.status(400).json({
          message: `Car with ID ${carId} is already reserved during the selected period.`
        });
      }
    }

    const cars = await Car.find({ _id: { $in: selectedCars } });
    const carFees = cars.reduce((sum, car) => sum + car.dailyFee, 0) * rentalDays;
    const serviceFee = services?.reduce((sum, s) => sum + (SERVICE_FEES[s] || 0), 0) || 0;
    const totalPrice = carFees + serviceFee;

    const reservation = new Reservation({
        userId: req.user._id,
        pickupLocation,
        dropLocation,
        pickupDate: start,
        dropDate: end,
        selectedCars,
        services,
        status: 'reserved',
        totalPrice
      });
      

    await reservation.save();
    res.status(201).json({ message: 'Reservation created', data: reservation });

  } catch (error) {
    res.status(500).json({ message: 'Error creating reservation', error: error.message });
  }
};

// ✅ Get all reservations (admin)
exports.getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('userId', 'username email')
      .populate('selectedCars', 'brand model dailyFee');
    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reservations', error: error.message });
  }
};

// ✅ Get own reservations (user)
exports.getUserReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ userId: req.user._id })
      .populate('selectedCars', 'brand model dailyFee');
    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reservations', error: error.message });
  }
};

exports.updateReservationStatus = async (req, res) => {
    try {
      const { status } = req.body;
  
      // Restrict status values
      if (!['reserved', 'canceled', 'completed'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
      }
  
      const updated = await Reservation.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );
  
      if (!updated) {
        return res.status(404).json({ message: 'Reservation not found' });
      }
  
      res.status(200).json({ message: 'Reservation status updated', data: updated });
  
    } catch (error) {
      res.status(500).json({ message: 'Error updating reservation', error: error.message });
    }
  };
  
  // restricted to hitory reservations (cancel is present for users to cancel)
  exports.deleteReservation = async (req, res) => {
    try {
      const reservation = await Reservation.findById(req.params.id);
      if (!reservation) return res.status(404).json({ message: "Reservation not found" });
  
      const isOwner = reservation.userId.toString() === req.user._id.toString();
      const isAdmin = req.user.role === 'admin';
  
      // Only allow user to delete if status is canceled or completed
      if (isOwner && !['canceled', 'completed'].includes(reservation.status)) {
        return res.status(403).json({
          message: "You can only delete completed or canceled reservations from your history"
        });
      }
  
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: "Not authorized to delete this reservation" });
      }
  
      await reservation.deleteOne();
      res.status(200).json({ message: "Reservation deleted successfully" });
  
    } catch (error) {
      res.status(500).json({ message: "Error deleting reservation", error: error.message });
    }
  };
  

// ✅ User edits reservation (before pickup date)
exports.updateReservationByUser = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });

    if (reservation.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this reservation' });
    }

    const now = new Date();
    if (new Date(reservation.pickupDate) <= now) {
      return res.status(400).json({ message: 'Cannot edit a reservation that has started' });
    }

    const {
      pickupLocation,
      dropLocation,
      pickupDate,
      dropDate,
      selectedCars,
      services
    } = req.body;

    reservation.pickupLocation = pickupLocation || reservation.pickupLocation;
    reservation.dropLocation = dropLocation || reservation.dropLocation;
    reservation.pickupDate = pickupDate || reservation.pickupDate;
    reservation.dropDate = dropDate || reservation.dropDate;
    reservation.selectedCars = selectedCars || reservation.selectedCars;
    reservation.services = services || reservation.services;

    await reservation.save();
    res.status(200).json({ message: 'Reservation updated successfully', data: reservation });

  } catch (error) {
    res.status(500).json({ message: 'Error updating reservation', error: error.message });
  }
};

// ✅ Show reserved dates for a car
exports.getCarReservedDates = async (req, res) => {
  try {
    const { id } = req.params;
    const reservations = await Reservation.find({ selectedCars: id });

    const reservedPeriods = reservations.map(r => ({
      pickupDate: r.pickupDate,
      dropDate: r.dropDate
    }));

    res.status(200).json({
      carId: id,
      reservedPeriods
    });

  } catch (error) {
    res.status(500).json({ message: 'Error fetching reserved dates', error: error.message });
  }
};

exports.autoCompleteReservations = async (req, res) => {
    try {
      const now = new Date();
  
      const result = await Reservation.updateMany(
        {
          dropDate: { $lt: now },
          status: 'reserved'
        },
        { status: 'completed' }
      );
  
      res.status(200).json({
        message: 'Auto-complete check done',
        updatedCount: result.modifiedCount
      });
  
    } catch (error) {
      res.status(500).json({ message: 'Error auto-completing reservations', error: error.message });
    }
  };

  exports.cancelReservationByUser = async (req, res) => {
    try {
      const reservation = await Reservation.findById(req.params.id);
      if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
  
      if (reservation.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to cancel this reservation' });
      }
  
      if (reservation.status !== 'reserved') {
        return res.status(400).json({ message: 'Only active reservations can be canceled' });
      }
  
      reservation.status = 'canceled';
      await reservation.save();
  
      res.status(200).json({ message: 'Reservation canceled successfully', data: reservation });
  
    } catch (error) {
      res.status(500).json({ message: 'Error canceling reservation', error: error.message });
    }
  };
