import mongoose from 'mongoose';

const walletTransactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['transfer', 'deposit'], default: 'transfer' },
    amount: { type: Number, required: true }, // Naira
    currency: { type: String, default: 'NGN' },
    recipient: String, // Paystack recipient code
    reason: String,
    reference: { type: String, unique: true, sparse: true },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
    },
    bankCode: String,
    bankName: String,
    savedBeneficiary: { type: Boolean, default: false },
    rawResponse: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

walletTransactionSchema.index({ user: 1, createdAt: -1 });

const WalletTransaction = mongoose.model('WalletTransaction', walletTransactionSchema);
export default WalletTransaction;