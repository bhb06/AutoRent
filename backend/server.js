const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // or 'http://127.0.0.1:5500' if strict
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Routes — optional, only needed when DB is back
// app.use('/api/chat', require('./routes/chat'));

// Real-time chat logic (no DB)
io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  socket.on('chatMessage', (msg) => {
    console.log('💬 Message:', msg);
    io.emit('chatMessage', msg); // broadcast to all clients
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
