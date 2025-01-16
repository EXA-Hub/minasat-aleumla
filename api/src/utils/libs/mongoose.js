// api/src/utils/libs/mongoose.js
import mongoose from 'mongoose';

let isConnecting = false;

// Function to connect to MongoDB
export const connectToMongoDB = async () => {
  // Check if already connected or connecting
  if (mongoose.connection.readyState === 1) return;

  if (isConnecting) {
    console.log('Connection in progress. Please wait.');
    return;
  }

  isConnecting = true;

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  } finally {
    isConnecting = false;
  }
};
