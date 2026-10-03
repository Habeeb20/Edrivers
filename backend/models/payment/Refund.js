import mongoose from 'mongoose';
const { Schema } = mongoose;
export default mongoose.model('Refund', new Schema({
  hire: { type: Schema.Types.ObjectId, ref: 'Hire', required: true, index: true },
  client: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amount: { type: Number, required: true, min: 1 },
  reason: { type: String, trim: true, maxlength: 500 },
  status: { type: String, enum: ['pending', 'processed', 'failed'], default: 'pending' },
  paymentReference: String,
  paystackRefundId: String,
  failureReason: String,
  processedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true }));