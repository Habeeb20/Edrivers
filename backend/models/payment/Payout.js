import mongoose from 'mongoose';
const { Schema } = mongoose;
const s = new Schema({
  driver: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  reference: { type: String, unique: true },
  status: { type: String, enum: ['processing', 'success', 'failed'], default: 'processing', index: true },
  trigger: { type: String, enum: ['manual', 'scheduled'], default: 'manual' },
  items: [{ hire: { type: Schema.Types.ObjectId, ref: 'Hire' }, hireAmount: Number, callOutCharge: Number,
    hirePercent: Number, callOutPercent: Number, driverHireShare: Number, driverCallOutShare: Number, driverAmount: Number }],
  totalAmount: Number,       // ₦ sent to driver
  platformCut: Number,       // ₦ retained
  walletSnapshot: { accountNumber: String, accountName: String, bankName: String, bankCode: String },
  paystack: { transferCode: String, recipientCode: String, status: String, failureReason: String },
  initiatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  paidAt: Date,
}, { timestamps: true });
export default mongoose.model('Payout', s);