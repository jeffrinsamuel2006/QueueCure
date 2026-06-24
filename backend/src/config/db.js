import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDatabase() {
  if (!env.mongodbUri) {
    console.warn('MONGODB_URI is not set. Running with in-memory storage.');
    return { connected: false };
  }

  try {
    await mongoose.connect(env.mongodbUri);
    console.log('MongoDB connected');
    return { connected: true };
  } catch (error) {
    console.warn('MongoDB connection failed. Falling back to in-memory storage.');
    console.warn(error.message);
    return { connected: false };
}
}
