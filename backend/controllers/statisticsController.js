const Car = require('../models/Car');
const Reservation = require('../models/Reservation');
const Review = require('../models/Review');

// ✅ HOMEPAGE STATS
exports.getHomeStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const totalCars = await Car.countDocuments();

    const reservedCarsToday = await Reservation.distinct('carId', {
      startDate: { $lte: new Date(`${today}T23:59:59`) },
      endDate: { $gte: new Date(`${today}T00:00:00`) },
      status: { $ne: 'cancelled' }
    });

    const notRentedToday = await Car.countDocuments({
      _id: { $nin: reservedCarsToday }
    });

    const totalReviews = await Review.countDocuments();
    const totalReservations = await Reservation.countDocuments();

    res.status(200).json({
      totalCars,
      notRentedToday,
      totalReviews,
      totalReservations
    });
  } catch (error) {
    console.error('Error in getHomeStats:', error.message);
    res.status(500).json({ message: 'Failed to fetch home stats' });
  }
};

// ✅ BUSINESS STATS
exports.getBusinessStats = async (req, res) => {
  try {
    const popularCar = await Reservation.aggregate([
      { $unwind: "$selectedCars" },
      { $group: { _id: "$selectedCars", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);

    let mostPopularCarDetails = null;
    if (popularCar.length > 0) {
      mostPopularCarDetails = await Car.findById(popularCar[0]._id).select('brand model dailyFee image');
    }

    const cars = await Car.find();
    const totalFee = cars.reduce((sum, car) => sum + car.dailyFee, 0);
    const averageDailyFee = cars.length > 0 ? (totalFee / cars.length).toFixed(2) : "0.00";

    res.status(200).json({
      averageDailyFee,
      mostPopularCar: mostPopularCarDetails
    });

  } catch (error) {
    console.error('Error in getBusinessStats:', error.message);
    res.status(500).json({ message: 'Failed to fetch business stats' });
  }
};
