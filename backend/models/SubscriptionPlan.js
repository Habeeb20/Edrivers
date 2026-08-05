// models/SubscriptionPlan.js
import mongoose from "mongoose";
const subscriptionPlanSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['fulltime_hire', 'hire_on_demand', 'driver_shop'],
    required: true
  },
  planName: {                    // ← changed from "package"
    type: String,
    enum: ['premium', 'classic', 'gold', 'chauffeur', 'within-state', 'interstate'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'NGN'
  },
  description: String,
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

subscriptionPlanSchema.index({ type: 1, planName: 1 }, { unique: true });

export default mongoose.model('SubscriptionPlan', subscriptionPlanSchema);