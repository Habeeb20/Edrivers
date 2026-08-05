import mongoose from 'mongoose';
import validator from 'validator';

const guarantorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  position: {
    type: Number,
    enum: [1, 2],
    required: true
  },

  name: {
    type: String,
    required: true,
    trim: true
  },

  phone: {
    type: String,
    required: true,
    validate: [validator.isMobilePhone, 'Invalid phone number']
  },

  address: {
    street: String,
    city: String,
    state: String,
    country: { type: String, default: 'Nigeria' }
  },

  relationship: {
    type: String,
 
    required: true
  },

  idDocument: {
    type: String, // ✅ Cloudinary URL (STRING)
    required: true
  },

  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },

  verifiedAt: Date,
  rejectionReason: String

}, { timestamps: true });

/* 🔐 Prevent duplicate guarantor positions */
guarantorSchema.index(
  { user: 1, position: 1 },
  { unique: true }
);

export default mongoose.model('Guarantor', guarantorSchema);
