const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// GET /api/chat/messages
router.get('/messages', chatController.getAllMessages);

module.exports = router;
