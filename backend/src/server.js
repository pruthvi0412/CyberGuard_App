const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/database');
const logger = require('./utils/logger');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/auth');
const complaintRoutes = require('./routes/complaints');
const analyticsRoutes = require('./routes/analytics');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/users');
const chatRoutes = require('./routes/chats');
const jarvisRoutes = require('./routes/jarvis');

const app = express();
const server = http.createServer(app);

// ─────────────────────────────────────────────────────────
// ✅ FIXED CORS & SOCKET CONFIGURATION
// ─────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

const corsOptions = {
  origin: true, // Allow all origins for mobile/tunnel development
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Bypass-Tunnel-Reminder'],
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Required for Preflight requests

const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});
app.set('io', io);

// ─────────────────────────────────────────────────────────
// SECURITY & PERFORMANCE
// ─────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false
}));
app.use(mongoSanitize());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());
app.use(morgan('dev'));

// ─────────────────────────────────────────────────────────
// ROUTES & ERROR HANDLING
// ─────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/jarvis', jarvisRoutes);

app.use(notFound);
app.use(errorHandler);

io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  // Join a specific complaint chat room
  socket.on('join-chat', (complaintId) => {
    socket.join(`chat-${complaintId}`);
    logger.debug(`Socket ${socket.id} joined chat room: chat-${complaintId}`);
  });

  // Relay real-time messages to the room
  socket.on('chat-message', (data) => {
    // Broadcast to everyone in the room (including sender for acknowledgment)
    io.to(`chat-${data.complaintId}`).emit('new-chat-message', data);
  });

  // Global Network Chat
  socket.on('join-global', () => {
    socket.join('global-network');
    logger.debug(`Socket ${socket.id} joined global network chat`);
  });

  socket.on('global-message', (data) => {
    io.to('global-network').emit('new-global-message', data);
  });

  // Private Messaging
  socket.on('join-user', (userId) => {
    socket.join(`user-${userId}`);
    logger.debug(`User ${userId} joined their private room: user-${userId}`);
  });

  socket.on('private-message', (data) => {
    // data: { sender, recipientId, content, iv }
    io.to(`user-${data.recipientId}`).to(`user-${data.sender._id}`).emit('new-private-message', data);
  });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// ─────────────────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5002;

const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Main Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(`❌ Startup Error: ${error.message}`);
  }
};

startServer();