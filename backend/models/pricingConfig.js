// models/pricingConfig.js
import mongoose from 'mongoose';

const pricingConfigSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,

      unique: true, // one config per category
    },

    // Base rates (admin sets these)
    hourlyRate: {
      type: Number,
      // required: true,
      min: 0,
    },
    dailyRate: {
      type: Number,
      // required: true,
      min: 0,
    },
    weeklyRate: {
      type: Number,
      // required: true,
      min: 0,
    },
    monthlyRate: {
      type: Number,
      required: true,
      min: 0,
    },
    callOutCharge: {
      type: Number,
      required: false,
      min: 0,
    },

    // Optional: multipliers, currency, zone, active status, etc.
    currency: {
      type: String,
      default: 'NGN',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: String, // e.g. "Standard motorcycle errand service"

    // Audit trail
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model('PricingConfig', pricingConfigSchema);