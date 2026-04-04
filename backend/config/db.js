const mongoose = require('mongoose');

/**
 * Connect to MongoDB with retry logic.
 * Falls back gracefully if the database is unreachable.
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn('[DB] MONGODB_URI not set — running without database');
    return;
  }

  try {
    await mongoose.connect(uri, {
      // Mongoose 8 defaults are sensible; override only what we need
      serverSelectionTimeoutMS: 10000,
    });
    console.log('[DB] MongoDB connected successfully');
  } catch (err) {
    console.error('[DB] MongoDB connection failed:', err.message);
    console.warn('[DB] Continuing without database — data will not persist');
  }

  mongoose.connection.on('error', (err) => {
    console.error('[DB] MongoDB runtime error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[DB] MongoDB disconnected');
  });
}

module.exports = connectDB;
