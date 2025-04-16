const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path'); 
const connectDB = require('./config/db');

// Load environment variables
dotenv.config({ path: __dirname + '/.env' });
console.log('Loaded MONGO_URI:', process.env.MONGO_URI);

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

const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

const uploadRoutes = require('./routes/upload');
app.use('/api/upload', uploadRoutes);

//  Serve static image files (e.g., /images/users/pic.jpg)
app.use('/images', express.static(path.join(__dirname, 'public/images')));


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

const carGroupRoutes = require('./routes/carGroupRoutes');
app.use('/api/cargroups', carGroupRoutes);

const carRoutes = require('./routes/cars');
app.use('/api/cars', carRoutes);

const reservationRoutes = require('./routes/reservations');
app.use('/api/reservations', reservationRoutes);
