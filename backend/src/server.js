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

const app = express();
const server = http.createServer(app);


// ─────────────────────────────────────────────────────────
// ✅ FIXED CORS (NO MORE RANDOM FAILURES)
// ─────────────────────────────────────────────────────────

const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  // add deployed frontend later
  // 'https://your-frontend.vercel.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow Postman / mobile apps

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('❌ Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Apply CORS
app.use(cors(corsOptions));

// Handle preflight
app.options('*', cors(corsOptions));


// ─────────────────────────────────────────────────────────
// ✅ SOCKET.IO (MATCHES CORS)
// ─────────────────────────────────────────────────────────

const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.set('io', io);


// ─────────────────────────────────────────────────────────
// SECURITY + PERFORMANCE
// ─────────────────────────────────────────────────────────

app.use(helmet({ 
  crossOriginResourcePolicy: false, 
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false 
}));

app.use(mongoSanitize());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);


// ─────────────────────────────────────────────────────────
// BODY PARSING
// ─────────────────────────────────────────────────────────

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(compression());
app.use(morgan('dev'));


// ─────────────────────────────────────────────────────────
// STATIC FILES
// ─────────────────────────────────────────────────────────

app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));


// ─────────────────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────────────────

app.get('/', (req, res) => {
  res.status(200).send('Cybercrime API is active');
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);


// ─────────────────────────────────────────────────────────
// ERROR HANDLING
// ─────────────────────────────────────────────────────────

app.use(notFound);
app.use(errorHandler);


// ─────────────────────────────────────────────────────────
// SOCKET CONNECTION
// ─────────────────────────────────────────────────────────

io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
});


// ─────────────────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5002;

const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`✅ CORS configured properly`);
    });

  } catch (error) {
    console.error(`❌ Startup Error: ${error.message}`);
  }
};

startServer();

module.exports = { app, io };