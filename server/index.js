const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Initialize app
const app = express();
const server = http.createServer(app);

// Setup CORS
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

// Middlewares
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Make io accessible to our router
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Local Service Booking API!' });
});

//connect the auth router to app
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

//connect service router to app
const serviceRoutes = require('./routes/services');
app.use('/api/services', serviceRoutes);

//conect the availability router to app
const availabilityRoutes = require('./routes/availability');
app.use('/api/availability', availabilityRoutes);

//connect the bookings router
const bookingRoutes = require('./routes/bookings');
app.use('/api/bookings', bookingRoutes);

//endpoint for listing the providers for users
const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);
//endpoint for provider homepage
const dashboardRoutes = require('./routes/dashboard');
app.use('/api/dashboard', dashboardRoutes);


// Socket.IO connection

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Listen for a 'joinRoom' event from the client
  socket.on('joinRoom', (userId) => {
    socket.join(userId); // The user joins a room named after their userId
    console.log(`User ${socket.id} joined room ${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});