const ChatSession = require('../models/ChatSession');
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');

// 1. Send a message (user starts chat)
exports.sendMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    let session;

    if (sessionId) {
      // Reuse existing session
      session = await ChatSession.findById(sessionId);
      if (!session) return res.status(404).json({ message: 'Chat session not found' });
    } else {
      // Create new session and auto-assign first available admin
      const agent = await User.findOne({ role: 'admin' });
      if (!agent) return res.status(500).json({ message: 'No available agents' });

      session = await ChatSession.create({
        userId: req.user._id,
        agentId: agent._id
      });
    }

    const chat = await ChatMessage.create({
      sender: req.user._id,
      receiver: session.agentId,
      message,
      chatSessionId: session._id
    });

    res.status(201).json({ message: 'Message sent', data: chat, sessionId: session._id });

  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
};

// 2. Get all sessions for the logged-in user (or admin)
exports.getMySessions = async (req, res) => {
  try {
    const query = req.user.role === 'admin'
      ? { agentId: req.user._id }
      : { userId: req.user._id };

    const sessions = await ChatSession.find(query).sort('-updatedAt');
    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chat sessions', error: error.message });
  }
};

// 3. Get all messages in a session
exports.getMessagesInSession = async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const messages = await ChatMessage.find({ chatSessionId: sessionId })
      .sort('timestamp')
      .populate('sender', 'username')  // Populate only the username field
      .populate('receiver', 'username');
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages', error: error.message });
  }
};

// 4. Rename a session
exports.renameSession = async (req, res) => {
  try {
    const { title } = req.body;
    const session = await ChatSession.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ message: 'Chat session not found' });

    const isOwner = session.userId.toString() === req.user._id.toString();
    if (!isOwner) return res.status(403).json({ message: 'Not authorized to rename this session' });

    session.title = title;
    await session.save();
    res.status(200).json({ message: 'Session renamed', data: session });

  } catch (error) {
    res.status(500).json({ message: 'Error renaming session', error: error.message });
  }
};

// 5. Delete a session (user or admin)
exports.deleteSession = async (req, res) => {
  try {
    const session = await ChatSession.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ message: 'Chat session not found' });

    const isOwner = session.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this session' });
    }

    await ChatMessage.deleteMany({ chatSessionId: session._id }); // delete messages too
    await session.deleteOne();

    res.status(200).json({ message: 'Chat session and messages deleted' });

  } catch (error) {
    res.status(500).json({ message: 'Error deleting session', error: error.message });
  }
};
