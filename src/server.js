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

// Route imports
const authRoutes = require('./routes/auth');
const complaintRoutes = require('./routes/complaints');
const analyticsRoutes = require('./routes/analytics');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/users');

const app = express();
const server = http.createServer(app);

// ── EMERGENCY CORS FIX (THE NUCLEAR PART) ────────────────────────────────────
// This must stay at the VERY TOP of the middleware stack.
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true
}));

// Pre-flight request handling
app.options('*', cors());

// Socket.IO setup (Unrestricted for debugging)
const io = socketIo(server, {
  cors: {
    origin: "*", 
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  },
});
app.set('io', io);

// ── SECURITY & OPTIMIZATION ──────────────────────────────────────────────────
// Modified Helmet to allow cross-origin requests from your frontend
app.use(helmet({ 
  crossOriginResourcePolicy: false, 
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false 
}));

app.use(mongoSanitize());

// Loosened Rate Limiting for Testing
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000, 
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());
app.use(morgan('dev'));

// Static path for evidence uploads
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

// ── ROUTES ───────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.status(200).send('Cybercrime API is active and unrestricted');
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', cors: 'Unrestricted' });
});

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);

// ── ERROR HANDLING ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
});

// STARTUP
const PORT = process.env.PORT || 5002;

const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 NUCLEAR BACKEND LIVE ON PORT ${PORT}`);
      console.log(`📡 CORS POLICY: [ALLOW ALL]`);
    });
  } catch (error) {
    console.error(`❌ Startup Error: ${error.message}`);
  }
};

startServer();

module.exports = { app, io };