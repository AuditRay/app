import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/staging';
const MONGO_USER = process.env.MONGO_USER || 'yourUsername';
const MONGO_PASSWORD = process.env.MONGO_PASSWORD || 'yourPassword';

interface CachedConnection {
    connection?: typeof mongoose;
    promise?: Promise<typeof mongoose>;
}

const cached: CachedConnection = {};

export async function connectMongo() {
    if (!MONGO_URI || !MONGO_USER || !MONGO_PASSWORD) {
        throw new Error('Please define the MONGO_URI, MONGO_USER, and MONGO_PASSWORD environment variables inside .env.local');
    }

    if (cached.connection) {
        return cached.connection;
    }

    if (!cached.promise) {
        const opts = {
            user: MONGO_USER,
            pass: MONGO_PASSWORD,
            bufferCommands: false,
            authSource: 'admin',
        };

        cached.promise = mongoose.connect(MONGO_URI, opts);
    }

    try {
        cached.connection = await cached.promise;
    } catch (e) {
        cached.promise = undefined;
        console.error(e);
    }

    return cached.connection;
}