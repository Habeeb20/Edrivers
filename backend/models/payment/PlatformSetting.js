import mongoose from 'mongoose';
const s = new mongoose.Schema({
  key: { type: String, default: 'default', unique: true },
  driverHirePercent: { type: Number, default: 70, min: 0, max: 100 },     // % of hire amount paid to driver
  driverCallOutPercent: { type: Number, default: 50, min: 0, max: 100 },  // % of call-out charge paid to driver
  payoutSchedule: { type: String, enum: ['daily', 'weekly', 'monthly', 'manual'], default: 'weekly' },
  payoutWeekday: { type: Number, default: 5, min: 0, max: 6 },            // 0=Sun
  payoutMonthDay: { type: Number, default: 1, min: 1, max: 28 },
  autoPayout: { type: Boolean, default: false },
  minPayoutAmount: { type: Number, default: 1000, min: 0 },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
export default mongoose.model('PlatformSettings', s);