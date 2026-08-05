// backend/models/Rental.js
import mongoose from 'mongoose';

const rentalSchema = new mongoose.Schema({
  rentalId: {
    type: String,
    required: false,
    unique: true,
    default: () => `RENT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
  },
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true,
  },
  renter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  location: { type: String, required: false },
  // In Rental Schema
reasonForRent: {
  type: String,
  maxlength: 500
},
  fullname: { type: String, required: false },
  durationDays: { type: Number, required: false },
  destination: { type: String, required: false },
  totalAmount: { type: Number, required: false },
  paymentRef: String,
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled'],
    default: 'pending',
  },
  startedAt: Date,
  endedAt: Date,
  rentedAt: { type: Date, default: Date.now },
}, { timestamps: true });
rentalSchema.index({ rentalId: 1 }, { unique: true });
const Rental = mongoose.model('Rental', rentalSchema);
export default Rental;