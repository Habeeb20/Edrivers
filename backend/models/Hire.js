
// models/Hire.js
import mongoose from 'mongoose';

const hireSchema = new mongoose.Schema({
  // References to users
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Core hire details
  category: {
    type: String,
    // enum: ['short-time', 'long-term', 'full-time', 'on-demand', 'other'],
    required: true
  },
  durationHours: {
    type: Number,
    required: true,
    min: 1
  },
  amountOffered: {
    type: Number,
    required: true,
    min: 0
  },
  amount: {
    type: Number,
    min: 0,
    required: true
  },
  date:{
    type: Date
    
  },
  time:{
    type: String
  },
  address: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  accommodation: {
    type: Boolean,
    default: false
  },
  benefits: {
    type: String,
    trim: true
  },

  // Status & lifecycle
  status: {
    type: String,
    enum: [
      'pending',           // client sent, driver hasn't responded
      'pending_approval',
      'awaiting_admin_approval',  
      'accepted',          // approved and accepted
      'active',            // hire is ongoing
      'ended',             // hire completed normally
      'declined',          // driver or admin declined
      'cancelled',          // cancelled by either party
      'rejected'
    ],
    default: 'pending',
    index: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'success', 'failed', 'paid'],
    default: 'pending',
    index: true
  },

  // Timeline
  requestedAt: {
    type: Date,
    default: Date.now
  },
  acceptedAt: Date,
  endedAt: Date,
  endReason: String,
  endedEarly: {
    type: Boolean,
    default: false
  },

  // Payment & conversation
  paymentReference: {
    type: String,
    trim: true
  },
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation'
  },

  // Admin approval
  adminApprovedAt: Date,
  adminApprovedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Additional metadata
  hireReference: {
    type: String,
    unique: true,
    sparse: true
  }

}, { timestamps: true });

// Indexes for fast queries
hireSchema.index({ client: 1, status: 1 });
hireSchema.index({ driver: 1, status: 1 });
hireSchema.index({ status: 1, paymentStatus: 1 });
hireSchema.index({ hireReference: 1 });

const Hire = mongoose.model('Hire', hireSchema);
export default Hire;