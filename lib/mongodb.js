import mongoose from 'mongoose';

// HARD-CODED (as requested)
const MONGODB_URI =
  'mongodb+srv://prakashaniket3_db_user:AniketParkash@cluster0.jlqhj1d.mongodb.net/?appName=Cluster0';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      // Fail fast on serverless (Vercel) to avoid long hangs
      serverSelectionTimeoutMS: 8000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    const msg = String(e?.message || '');
    const isSelection =
      e?.name === 'MongooseServerSelectionError' ||
      msg.includes('Could not connect to any servers') ||
      msg.toLowerCase().includes('server selection') ||
      msg.toLowerCase().includes('replicasetnoprimary');

    if (isSelection) {
      e.publicStatus = 503;
      e.publicMessage = 'Database connection failed.';
      e.publicHint =
        'MongoDB Atlas is not reachable from Vercel. In Atlas → Network Access, allow access (for testing: add 0.0.0.0/0). Also confirm username/password in the connection string are correct.';
    } else if (msg.toLowerCase().includes('authentication failed')) {
      e.publicStatus = 503;
      e.publicMessage = 'Database authentication failed.';
      e.publicHint =
        'MongoDB URI credentials are wrong. Update the username/password in the connection string and redeploy.';
    } else {
      e.publicStatus = 503;
      e.publicMessage = 'Database unavailable.';
      e.publicHint = 'Check MongoDB connection string and Atlas status.';
    }
    throw e;
  }

  return cached.conn;
}

export default connectDB;

