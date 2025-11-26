import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

declare global {
    var mongooseCache: {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
    }
}

let cached = global.mongooseCache;

if (!cached){
    cached = global.mongooseCache = { conn: null, promise: null };
}

export const connectToDatabase = async () => {
    // Skip database connection during build time
    if (process.env.NEXT_PHASE === 'phase-production-build') {
        // Return a mock connection during build
        return mongoose;
    }

    if(!MONGODB_URI){
        throw new Error("MongoDB URI is missing");
    }

    if(cached.conn) return cached.conn;

    if(!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, {bufferCommands: false});
    }

    try{
        cached.conn = await cached.promise;
    }
    catch(err){
        cached.promise = null;
        throw err;
    }

    if (process.env.NODE_ENV === 'development') {
        console.log(`MongoDB Connected in ${process.env.NODE_ENV}`);
    }
    return cached.conn;
}