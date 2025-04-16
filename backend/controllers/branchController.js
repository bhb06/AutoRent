const Branch = require('../models/Branch');

// Create a branch (admin only)
exports.createBranch = async (req, res) => {
  try {
    const branch = await Branch.create(req.body);
    res.status(201).json({ message: 'Branch created', data: branch });
  } catch (error) {
    res.status(500).json({ message: 'Error creating branch', error: error.message });
  }
};

// Get all branches (public)
exports.getAllBranches = async (req, res) => {
  try {
    const branches = await Branch.find();
    res.status(200).json(branches);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching branches', error: error.message });
  }
};

// Get single branch by ID
exports.getBranchById = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);
    if (!branch) return res.status(404).json({ message: 'Branch not found' });
    res.status(200).json(branch);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching branch', error: error.message });
  }
};

// Update branch (admin only)
exports.updateBranch = async (req, res) => {
  try {
    const updated = await Branch.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Branch not found' });
    res.status(200).json({ message: 'Branch updated', data: updated });
  } catch (error) {
    res.status(500).json({ message: 'Error updating branch', error: error.message });
  }
};

// Delete branch (admin only)
exports.deleteBranch = async (req, res) => {
  try {
    const deleted = await Branch.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Branch not found' });
    res.status(200).json({ message: 'Branch deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting branch', error: error.message });
  }
};
