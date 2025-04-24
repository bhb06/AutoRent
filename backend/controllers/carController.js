const mongoose = require('mongoose');
const Car = require('../models/Car');
const CarGroup = require('../models/CarGroup');
const ObjectId = mongoose.Types.ObjectId;

// ✅ Create a car
exports.createCar = async (req, res) => {
  try {
    const {
      groupId,
      brand,
      model,
      year,
      dailyFee,
      plateNumber,
      availability
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required' });
    }

    const imagePath = `/images/cars/${req.file.filename}`;

    const newCar = new Car({
      groupId,
      brand,
      model,
      year: parseInt(year),
      dailyFee: parseFloat(dailyFee),
      image: imagePath,
      plateNumber,
      availability: availability === 'true'
    });

    await newCar.save();

    await CarGroup.findByIdAndUpdate(
      groupId,
      { $push: { cars: newCar._id } },
      { new: true }
    );

    res.status(201).json({
      message: '✅ Car created and added to group',
      data: newCar
    });

  } catch (error) {
    console.error('❌ Error creating car:', error);
    res.status(500).json({
      message: 'Error creating car',
      error: error.message
    });
  }
};

// ✅ Get all cars (with optional group filter)
exports.getAllCars = async (req, res) => {
  try {
    const filter = {};

    if (req.query.groupId) {
      try {
        filter.groupId = req.query.groupId;
      } catch (error) {
        console.error("Invalid ObjectId format:", req.query.groupId);
        return res.status(400).json({ message: "Invalid groupId format" });
      }
    }

    const cars = await Car.find(filter).populate('groupId', 'groupName');
    res.status(200).json(cars);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cars", error: error.message });
  }
};

// ✅ Get single car by ID (merges missing fields from CarGroup)
exports.getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id).lean();
    if (!car) return res.status(404).json({ message: 'Car not found' });

    let group = null;
    if (car.groupId) {
      group = await CarGroup.findById(car.groupId).lean();
    }

    const mergedCar = {
      ...car,
      engineSize: car.engineSize ?? group?.engineSize ?? null,
      passengers: car.passengers ?? group?.passengers ?? null,
      numDoors: car.numDoors ?? group?.numDoors ?? null,
      gearbox: car.gearbox ?? group?.gearbox ?? null,
      fuelType: car.fuelType ?? group?.fuelType ?? null,
      ac: car.ac ?? group?.ac ?? false,
      electricWindows: car.electricWindows ?? group?.electricWindows ?? false
    };

    res.status(200).json(mergedCar);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching car', error: error.message });
  }
};

// ✅ Update car
exports.updateCar = async (req, res) => {
  try {
    const updated = await Car.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Car not found" });
    res.status(200).json({ message: "Car updated", data: updated });
  } catch (error) {
    res.status(500).json({ message: "Error updating car", error: error.message });
  }
};

// ✅ Delete car and remove from CarGroup
exports.deleteCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    await Car.findByIdAndDelete(req.params.id);

    await CarGroup.findByIdAndUpdate(
      car.groupId,
      { $pull: { cars: car._id } }
    );

    res.status(200).json({ message: "Car deleted and removed from group" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting car", error: error.message });
  }
};
