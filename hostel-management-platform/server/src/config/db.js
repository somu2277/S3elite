const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_hostel_db', {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Atlas Connection Error: ${error.message}`);
    try {
      console.log('Attempting fallback to local MongoDB instance...');
      const fallbackConn = await mongoose.connect('mongodb://127.0.0.1:27017/s3elite_pg_db', {
        serverSelectionTimeoutMS: 3000
      });
      console.log(`MongoDB Connected (Fallback): ${fallbackConn.connection.host}`);
    } catch (fallbackErr) {
      console.log('Ensure MongoDB is running locally or check Network Access whitelist (0.0.0.0/0) in MongoDB Atlas.');
    }
  }
};

module.exports = connectDB;
