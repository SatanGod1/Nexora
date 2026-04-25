// src/config/db.ts
import mongoose from "mongoose";

let isConnected = false;

export async function connectDB(): Promise<void> {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set in environment variables");

  try {
    await mongoose.connect(uri, {
      dbName: process.env.MONGODB_DBNAME ?? "nexora",
    });
    isConnected = true;
    console.log("✅  MongoDB connected:", mongoose.connection.host);

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB error:", err);
      isConnected = false;
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️  MongoDB disconnected");
      isConnected = false;
    });
  } catch (err) {
    console.error("❌  MongoDB connection failed:", err);
    process.exit(1);
  }
}
