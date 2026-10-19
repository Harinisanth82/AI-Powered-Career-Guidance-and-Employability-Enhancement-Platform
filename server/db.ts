import mongoose from 'mongoose';

const DEFAULT_DB_NAME = 'career_guidance_platform';

let isConnected = false;
let lastConnectionError: string | null = null;

export async function connectMongoDB(): Promise<boolean> {
  const rawUri = process.env.MONGODB_URI;

  if (!rawUri || !rawUri.trim()) {
    lastConnectionError = 'MONGODB_URI is not set in backend .env';
    console.error('[MongoDB Error] MONGODB_URI environment variable is missing.');
    console.error('[MongoDB Help] Please set MONGODB_URI in backend .env with your MongoDB Atlas connection string.');
    return false;
  }

  const uri = rawUri.trim();

  // Check for common password placeholders
  if (uri.includes('<NEW_PASSWORD>') || uri.includes('<PASSWORD>')) {
    lastConnectionError = 'MONGODB_URI contains a placeholder password (<NEW_PASSWORD>). Please update .env with your actual MongoDB Atlas password.';
    console.error('[MongoDB Error] Database connection failed: MONGODB_URI contains a placeholder password (<NEW_PASSWORD>).');
    console.error('[MongoDB Help] Please open backend .env and replace <NEW_PASSWORD> with your rotated MongoDB Atlas password.');
    return false;
  }

  try {
    console.log('[MongoDB] Establishing connection to MongoDB Atlas...');

    // Close any previous stale connection before reconnecting
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    await mongoose.connect(uri, {
      dbName: DEFAULT_DB_NAME,
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    lastConnectionError = null;
    console.log('MongoDB connected successfully');
    console.log(`[MongoDB] Database target: ${DEFAULT_DB_NAME}`);
    return true;
  } catch (err: any) {
    isConnected = false;
    console.error('[MongoDB Error] Connection failed:');

    if (err.name === 'MongoServerSelectionError') {
      lastConnectionError = 'MongoDB Atlas cluster selection timed out. Please verify cluster status and IP Access List (0.0.0.0/0).';
      console.error('[MongoDB Error] Server selection timeout.');
      console.error('[MongoDB Help] Ensure IP 0.0.0.0/0 is added to MongoDB Atlas Network Access.');
    } else if (
      err.code === 8000 ||
      err.codeName === 'AtlasError' ||
      err.message?.includes('bad auth') ||
      err.message?.includes('Authentication failed')
    ) {
      lastConnectionError = 'MongoDB Atlas authentication failed. Invalid database username or password.';
      console.error('[MongoDB Error] Authentication failure (bad auth).');
      console.error('[MongoDB Help] Verify username (savihari10_db_user) and your new rotated password in backend .env.');
    } else if (err.name === 'MongoParseError' || err.message?.includes('Invalid connection string')) {
      lastConnectionError = 'Invalid MongoDB connection string format.';
      console.error('[MongoDB Error] Malformed URI string format:', err.message);
    } else {
      lastConnectionError = err.message || 'Unknown database connection error';
      console.error('[MongoDB Error]', err.message || err);
    }

    return false;
  }
}

mongoose.connection.on('connected', () => {
  isConnected = true;
  lastConnectionError = null;
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('[MongoDB] Disconnected from MongoDB Atlas cluster.');
});

mongoose.connection.on('error', (err) => {
  isConnected = false;
  lastConnectionError = err?.message || 'Database error';
  console.error('[MongoDB Runtime Error]:', err?.message || err);
});

export function isMongoDBConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}

export function getMongoDBError(): string | null {
  return lastConnectionError;
}
