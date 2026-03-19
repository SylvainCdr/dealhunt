import mongoose from "mongoose";

const ClickSchema = new mongoose.Schema({
  dealId: { type: mongoose.Schema.Types.ObjectId, ref: "Deal", required: true },
  source: String,
  timestamp: { type: Date, default: Date.now },
  userAgent: String,
  referer: String,
});

ClickSchema.index({ dealId: 1 });
ClickSchema.index({ timestamp: 1 });

export default mongoose.models.Click || mongoose.model("Click", ClickSchema);
