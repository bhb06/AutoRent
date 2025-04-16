const express = require('express');
const router = express.Router();
const {
  createBranch,
  getAllBranches,
  getBranchById,
  updateBranch,
  deleteBranch
} = require('../controllers/branchController');

const { protect, isAdmin } = require('../middleware/authMiddleware');

router.post('/', protect, isAdmin, createBranch);
router.get('/', getAllBranches);
router.get('/:id', getBranchById);
router.put('/:id', protect, isAdmin, updateBranch);
router.delete('/:id', protect, isAdmin, deleteBranch);

module.exports = router;
