// models/Subscription.js
import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Type of subscription
  type: {
    type: String,
    enum: [
      'fulltime_hire',    // client hiring full-time driver
      'hire_on_demand',   // on-demand hire service
      'driver_shop',      // driver subscription to shop
      'premium_client'    // client premium features
    ],
    required: true
  },

  // Plan/package details
  package: {
    type: String,
    enum: ['premium', 'classic', 'gold', 'chauffeur', 'within-state', 'interstate'],
    required: true
  },
  serviceLevel: {
    type: String,
    enum: ['chauffeur', 'premium', 'standard']
  },

  // Status
  subscribed: {
    type: Boolean,
    default: false
  },
  subscriptionStatus: {
    type: String,
    enum: ['pending', 'approved', 'declined', 'active', 'expired', 'cancelled'],
    default: 'pending'
  },

  // Payment
  paymentRef: String,
  subscriptionAmount: {
    type: Number,
    required: true,
    min: 0
  },

  // Timeline
  subscribedAt: Date,
  approvedAt: Date,
  declinedAt: Date,
  expiresAt: Date,
  cancelledAt: Date,
  declineReason: String,

  // Full-time hire specific fields
  fulltimeDetails: {
    carMaker: String,
    carModel: String,
    carTransmission: { type: String, enum: ['automatic', 'manual', 'both'] },
    officeAddress: String,
    homeAddress: String,
    startTime: String,
    closeTime: String,
    insurancePolicy: { type: String, enum: ['comprehensive', 'third-party'] },
    hirePurpose: { type: String, enum: ['commercial', 'personal', 'interstate', 'school-bus'] },
    accommodation: Boolean,
    numberOfDrivers: Number,
    location: String,
    currentFulltimeJob: {
      status: { type: String, enum: ['active', 'completed', 'cancelled'] },
      startedAt: Date,
      endedAt: Date,
      amountPaid: Number,
      paymentRef: String
    }
  },

  // Hire on demand specific fields
  onDemandDetails: {
    plan: { type: String, enum: ['within-state', 'interstate'] },
    currentHireOnDemandJob: {
      status: { type: String, enum: ['active', 'completed', 'cancelled'] },
      startedAt: Date,
      endedAt: Date,
      amountPaid: Number,
      paymentRef: String,
      travelType: { type: String, enum: ['within-state', 'interstate'] },
      serviceLevel: { type: String, enum: ['chauffeur', 'premium'] }
    },
    hireOnDemandRequests: [{
      client: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      durationHours: Number,
      transmission: { type: String, enum: ['automatic', 'manual', 'both'] },
      amountOffered: Number,
      pickupTime: String,
      pickupLocation: String,
      startDate: Date,
      endDate: Date,
      status: { type: String, enum: ['pending', 'accepted', 'declined', 'active', 'ended'], default: 'pending' },
      requestedAt: { type: Date, default: Date.now }
    }]
  }

}, { timestamps: true });

// Indexes
subscriptionSchema.index({ user: 1, type: 1 });
subscriptionSchema.index({ subscriptionStatus: 1 });
subscriptionSchema.index({ type: 1, package: 1 });


// models/Subscription.js (keep mostly as-is, add these)
subscriptionSchema.statics.getActiveSubscriptions = async function (userId) {
  return this.find({
    user: userId,
    subscriptionStatus: 'active',
    expiresAt: { $gt: new Date() }
  }).lean();
};

subscriptionSchema.methods.isActive = function () {
  return this.subscriptionStatus === 'active' && this.expiresAt > new Date();
};
const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;