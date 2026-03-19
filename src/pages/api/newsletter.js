// pages/api/newsletter.js — Store email subscriptions in MongoDB
import { connectDB } from "../../utils/database.js";
import mongoose from "mongoose";

const SubscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  subscribedAt: { type: Date, default: Date.now },
  active: { type: Boolean, default: true },
});

const Subscriber =
  mongoose.models.Subscriber || mongoose.model("Subscriber", SubscriberSchema);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body;

  // Basic email validation
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Valid email required" });
  }

  await connectDB();

  try {
    await Subscriber.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      {
        email: email.toLowerCase().trim(),
        active: true,
        subscribedAt: new Date(),
      },
      { upsert: true },
    );
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Newsletter signup error:", err.message);
    return res.status(500).json({ error: "Server error" });
  }
}
