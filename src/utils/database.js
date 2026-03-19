// utils/database.js
import mongoose from "mongoose";

const dbName = "cjDrop";

let cached = global._mongooseCache;
if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

export const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const login = encodeURIComponent(process.env.DB_USER);
    const password = encodeURIComponent(process.env.DB_PASSWORD);
    const uri = `mongodb+srv://${login}:${password}@sly95.rk84wkd.mongodb.net/${dbName}?retryWrites=true&w=majority`;

    cached.promise = mongoose.connect(uri).then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
};
