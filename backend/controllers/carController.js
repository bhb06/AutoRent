const Car = require('../models/Car');
const CarGroup = require('../models/CarGroup');

// CREATE a new car (admin only)
exports.createCar = async (req, res) => {
  try {
    // Step 1: Create and save the car
    const newCar = new Car(req.body);
    await newCar.save();

    // Step 2: Add the car to its CarGroup's cars[] array
    await CarGroup.findByIdAndUpdate(
      newCar.groupId,
      { $push: { cars: newCar._id } },
      { new: true }
    );

    // Step 3: Respond
    res.status(201).json({ message: "Car created and added to group", data: newCar });

  } catch (error) {
    res.status(500).json({ message: "Error creating car", error: error.message });
  }
};

// GET all cars (with optional group filter)
exports.getAllCars = async (req, res) => {
  try {
    const filter = {};

    // Optional filter by group ID or group name
    if (req.query.groupId) {
      filter.groupId = req.query.groupId;
    }

    const cars = await Car.find(filter).populate('groupId', 'groupName');
    res.status(200).json(cars);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cars", error: error.message });
  }
};

// GET single car by ID
exports.getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id).populate('groupId', 'groupName');
    if (!car) return res.status(404).json({ message: "Car not found" });
    res.status(200).json(car);
  } catch (error) {
    res.status(500).json({ message: "Error fetching car", error: error.message });
  }
};

// UPDATE car
exports.updateCar = async (req, res) => {
  try {
    const updated = await Car.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Car not found" });
    res.status(200).json({ message: "Car updated", data: updated });
  } catch (error) {
    res.status(500).json({ message: "Error updating car", error: error.message });
  }
};

// DELETE car and remove it from the group
exports.deleteCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    // Step 1: Delete the car
    await Car.findByIdAndDelete(req.params.id);

    // Step 2: Remove car ID from the group's cars[] array
    await CarGroup.findByIdAndUpdate(
      car.groupId,
      { $pull: { cars: car._id } }
    );

    res.status(200).json({ message: "Car deleted and removed from group" });

  } catch (error) {
    res.status(500).json({ message: "Error deleting car", error: error.message });
  }
};

