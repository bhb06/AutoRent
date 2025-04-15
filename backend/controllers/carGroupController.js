const CarGroup = require('../models/CarGroup');

// CREATE a new car group
exports.createCarGroup = async (req, res) => {
  try {
    const newGroup = new CarGroup(req.body);
    await newGroup.save();
    res.status(201).json({ message: "Car group created", data: newGroup });
  } catch (error) {
    res.status(500).json({ message: "Error creating car group", error: error.message });
  }
};

// GET all car groups
exports.getAllCarGroups = async (req, res) => {
  try {
    const groups = await CarGroup.find();
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: "Error fetching car groups", error: error.message });
  }
};

// GET one car group by ID
exports.getCarGroupById = async (req, res) => {
  try {
    const group = await CarGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Car group not found" });
    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({ message: "Error fetching car group", error: error.message });
  }
};

// UPDATE a car group
exports.updateCarGroup = async (req, res) => {
  try {
    const updated = await CarGroup.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Car group not found" });
    res.status(200).json({ message: "Car group updated", data: updated });
  } catch (error) {
    res.status(500).json({ message: "Error updating car group", error: error.message });
  }
};

// DELETE a car group
exports.deleteCarGroup = async (req, res) => {
  try {
    const deleted = await CarGroup.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Car group not found" });
    res.status(200).json({ message: "Car group deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting car group", error: error.message });
  }
};
