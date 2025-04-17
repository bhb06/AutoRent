const Reservation = require('../models/Reservation');
const Car = require('../models/Car');

exports.getStatistics = async (req, res) => {
  try {
    // Find the most popular car
    const popularCar = await Reservation.aggregate([
      { $unwind: "$selectedCars" },
      { $group: { _id: "$selectedCars", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);

    // Find the car details (brand, model, etc.) for the most popular car
    const mostPopularCarId = popularCar[0]?._id;
    const mostPopularCarDetails = await Car.findById(mostPopularCarId).select('brand model dailyFee');

    // Calculate the average daily rental fee of all cars
    const cars = await Car.find();
    const totalFee = cars.reduce((sum, car) => sum + car.dailyFee, 0);
    const averageDailyFee = totalFee / cars.length;

    res.status(200).json({
      mostPopularCar: mostPopularCarDetails,
      averageDailyFee: averageDailyFee.toFixed(2), // Rounded to 2 decimal places
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
};
