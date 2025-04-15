const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Set up Socket.IO with CORS
const io = socketIo(server, {
  cors: {
    origin: '*', // Replace with frontend domain in production
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Sample test route
app.get('/', (req, res) => {
  res.send('🚀 Backend is running and connected to MongoDB!');
});

// === Real-time Chat Logic ===
io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  socket.on('chatMessage', (msg) => {
    console.log('💬 Message:', msg);
    io.emit('chatMessage', msg); // broadcast to all connected clients
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

// Server Listening
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🌐 Server running on port ${PORT}`);
});
