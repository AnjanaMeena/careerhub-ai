const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/careerhub_ai', {
      serverSelectionTimeoutMS: 3000 // 3 sec timeout for quick response
    });
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[MongoDB Warning]: Could not connect to local MongoDB (${error.message}).`);
    console.warn(`[MongoDB Warning]: Server will attempt reconnect or use fallback handlers.`);
  }
};

module.exports = connectDB;
