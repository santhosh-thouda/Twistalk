import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import AuthRoute from './Routes/AuthRoute.js';
import UserRoute from './Routes/UserRoute.js';
import PostRoute from './Routes/PostRoute.js';
import UploadRoute from './Routes/UploadRoute.js';
import MessageRoute from './Routes/MessageRoute.js';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

// Load environment variables first
dotenv.config();

// Routes
const app = express();

// to serve images for public (public folder)
app.use(express.static('public'));
app.use('/images', express.static('images'));

// MiddleWare
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

// Add request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Check environment variables
console.log('Environment check:');
console.log('MONGO_DB:', process.env.MONGO_DB ? 'Set' : 'Not set');
console.log('JWT_KEY:', process.env.JWT_KEY ? 'Set' : 'Not set');
console.log('PORT:', process.env.PORT || 5000);

// Create HTTP server and wrap Express app
const server = http.createServer(app);

// Setup Socket.io
const io = new SocketIOServer(server, {
  cors: {
    origin: '*', // Adjust as needed for production
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Store connected users
const onlineUsers = new Map();

io.on('connection', (socket) => {
  // Listen for user connection with userId
  socket.on('user-connected', (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit('online-users', Array.from(onlineUsers.keys()));
  });

  // Listen for user disconnect
  socket.on('disconnect', () => {
    for (const [userId, id] of onlineUsers.entries()) {
      if (id === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit('online-users', Array.from(onlineUsers.keys()));
  });
});

// Make io accessible in req.app.get('io')
app.set('io', io);

mongoose.connect(process.env.MONGO_DB, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
.then(() => {
    console.log('Connected to MongoDB successfully');
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
})
.catch((error) => {
    console.log('MongoDB connection error:', error.message);
});

// uses of routes
app.use('/auth', AuthRoute);
app.use('/user', UserRoute);
app.use('/post', PostRoute);
app.use('/upload', UploadRoute);
app.use('/message', MessageRoute);

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
});