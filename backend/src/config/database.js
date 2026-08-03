const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    // Railway usually just uses MONGODB_URI. 
    // This line checks for the specific production string, but falls back to your main URI.
    const uri = process.env.MONGODB_URI_PROD || process.env.MONGODB_URI;

    if (!uri) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    const conn = await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Reconnection & Error Listeners
    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    // Seed admin user
    // We use a try/catch here so if seeding fails, the DB connection stays alive
    try {
      await seedAdmin();
    } catch (seedError) {
      logger.error(`Admin seeding failed: ${seedError.message}`);
    }

    return conn;
  } catch (error) {
    logger.error(`❌ MongoDB connection failed: ${error.message}`);
    // We exit here because the app cannot function without the DB
    process.exit(1);
  }
};

const seedAdmin = async () => {
  // Use a relative path to ensure models are found correctly in Railway's file system
  const User = require('../models/User');
  const bcrypt = require('bcryptjs');

  const adminExists = await User.findOne({ role: 'admin' });
  
  if (!adminExists) {
    logger.info('Seeding admin user...');
    
    await User.create({
      name: 'System Administrator',
      email: process.env.ADMIN_EMAIL || 'admin@cybercrime.gov',
      password: process.env.ADMIN_PASSWORD || 'Admin@123456',
      role: 'admin',
      isVerified: true,
      phone: '9000000000',   // placeholder; real admin can update via profile
    });
    logger.info('✅ Admin user seeded successfully');
  }
};

module.exports = connectDB;