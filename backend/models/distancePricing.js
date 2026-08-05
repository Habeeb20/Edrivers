import mongoose from "mongoose";

const distanceTierSchema = new mongoose.Schema({
  minKm: { type: Number, required: true, min: 0 },
  maxKm: { type: Number, required: true, min: 1 },
  pricePerKm: { type: Number, required: true, min: 0 },
  fixedBasePrice: { type: Number, default: 0 }, // optional flat fee
  description: String, // e.g. "Short trip", "Long distance"
});

const distancePricingSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,

  },
  tiers: [distanceTierSchema],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

distancePricingSchema.index({ category: 1 }, { unique: true });

export default mongoose.model('DistancePricing', distancePricingSchema);