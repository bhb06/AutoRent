const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  sendMessage,
  getMySessions,
  getMessagesInSession,
  renameSession,
  deleteSession
} = require('../controllers/chatController');

router.post('/', protect, sendMessage);
router.get('/sessions', protect, getMySessions);
router.get('/messages/:sessionId', protect, getMessagesInSession);
router.put('/rename/:sessionId', protect, renameSession);
router.delete('/:sessionId', protect, deleteSession);

module.exports = router;
