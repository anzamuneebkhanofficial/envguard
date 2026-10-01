import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../shared/utils/logger.js';

let isConnected = false;

export async function connectDatabase(retries = 5, delayMs = 3000): Promise<void> {
  if (isConnected) return;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: 10,
      });
      isConnected = true;
      logger.info('Connected to MongoDB successfully', { uri: env.MONGODB_URI.replace(/\/\/.*@/, '//<masked>@') });
      return;
    } catch (error) {
      logger.warn(`MongoDB connection attempt ${attempt}/${retries} failed`, {
        error: error instanceof Error ? error.message : 'Unknown database error'
      });
      if (attempt === retries) {
        if (env.NODE_ENV === 'production') {
          throw error;
        } else {
          logger.error('Could not connect to MongoDB. Running in disconnected mode for local dev/testing without local Mongo.');
          return;
        }
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
  logger.info('Disconnected from MongoDB');
}

export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
