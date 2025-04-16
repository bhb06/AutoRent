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

// Auth Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Sample test route
app.get('/', (req, res) => {
  res.send('🚀 Backend is running and connected to MongoDB!');
});

io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  socket.on('chatMessage', async ({ sender, receiver, message }) => {
    io.to(receiver).emit('chatMessage', { sender, message });

    // ✅ Save the message to MongoDB
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


// Server Listening
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🌐 Server running on port ${PORT}`);
});

const carGroupRoutes = require('./routes/carGroupRoutes');
app.use('/api/cargroups', carGroupRoutes);

const carRoutes = require('./routes/cars');
app.use('/api/cars', carRoutes);

const reservationRoutes = require('./routes/reservations');
app.use('/api/reservations', reservationRoutes);

const invoiceRoutes = require('./routes/invoices');
app.use('/api/invoices', invoiceRoutes);

const reviewRoutes = require('./routes/reviews');
app.use('/api/reviews', reviewRoutes);

const chatRoutes = require('./routes/chat');
app.use('/api/chat', chatRoutes);

const branchRoutes = require('./routes/branch');
app.use('/api/branches', branchRoutes);

const couponRoutes = require('./routes/coupons');
app.use('/api/coupons', couponRoutes);
