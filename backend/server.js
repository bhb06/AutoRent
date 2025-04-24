const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// Load environment variables early
dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*', // Replace with your frontend URL in production
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = ['http://localhost:5500', 'http://127.0.0.1:5500'];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed for this origin'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/cargroups', require('./routes/carGroupRoutes'));
app.use('/api/cars', require('./routes/cars'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/branches', require('./routes/branch'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/statistics', require('./routes/statistics'));
app.use('/api/contact', require('./routes/contact'));

// Default route
app.get('/', (req, res) => {
  res.send('🚀 Backend is running and connected to MongoDB!');
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// WebSocket handling
io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  socket.on('chatMessage', async ({ sender, receiver, message }) => {
    io.to(receiver).emit('chatMessage', { sender, message });

    try {
      const ChatMessage = require('./models/ChatMessage');
      await ChatMessage.create({ sender, receiver, message });
    } catch (err) {
      console.error('Error saving message:', err.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🌐 Server running on port ${PORT}`);
});

const invoiceRoutes = require('./routes/invoices');
app.use('/api/invoices', invoiceRoutes);