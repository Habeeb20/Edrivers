










// models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import slugify from 'slugify';
import { v4 as uuidv4 } from 'uuid';
import { customAlphabet } from 'nanoid';
import {  isProfileComplete as computeProfileComplete } from '../utils/profileCompletion.js';
const nanoid = customAlphabet('23456789ABCDEFGHJKLMNPQRSTUVWXYZ', 8);

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      default: () => uuidv4(),
    },

    firstName: { type: String, required: true, trim: true, maxlength: 50 },
    lastName: { type: String, required: true, trim: true, maxlength: 50 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, 'Invalid email'],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    role: {
      type: String,
      required: true,
      enum: ['driver', 'client', 'superadmin'],
      default: 'client',
    },

      eAuthOtp: {
  code: { type: String, select: false },
  expiresAt: { type: Date },
  attempts: { type: Number, default: 0 },
},

    eAuthOtp: {
  code: { type: String, select: false },
  expiresAt: { type: Date },
  attempts: { type: Number, default: 0 },
},

totalLoyaltyEarnedFromRegistrations: {
  type: Number,
  default: 0
},

    loyaltyPoints: {
    type: Number,
    default: 0,
    min: 0
  },

  // Optional: track how points were earned (audit trail)
  loyaltyTransactions: [{
    type: { type: String, enum: ['hire_completed','completed_hire_as_provider', 'completed_hire_as_client',   'user_registration', 'referral',     'referral_signup',   // ADD: 20 points — someone signed up with their referral link
      'job_referral', ] },
    amount: Number,
    hireId: { type: mongoose.Schema.Types.ObjectId, ref: 'HireRequest' },
    createdAt: { type: Date, default: Date.now }
  }],
    // ── Loyalty / Referral Redemption Tracking ──────────────────────────
totalPointsRedeemed: {
  type: Number,
  default: 0,
  min: 0,
},

redemptionRequests: [{
  pointsRequested: { type: Number, required: true },
  amountRequested: { type: Number, required: true }, // in Naira, 1:1 with points

  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },

  // Snapshot of wallet details AT THE TIME of the request — protects
  // against the admin sending money to a stale/changed account later.
  walletSnapshot: {
    accountNumber: String,
    accountName: String,
    bankName: String,
  },

  requestedAt: { type: Date, default: Date.now },
  approvedAt: Date,
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rejectedAt: Date,
  rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rejectionReason: { type: String, trim: true, maxlength: 300 },
}],


    // ==================== LOCATION (Fixed) ====================
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
      address: String,
      lastUpdated: {
        type: Date,
        default: Date.now,
      },
    },

    slug: { type: String, unique: true, sparse: true, trim: true },

    verificationStatus: {
      type: String,
      enum: ['unverified', 'verified', 'pending'],
      default: 'unverified',
    },
    status: {
      type: String,
      enum: ['active', 'blocked', 'pending'],
      default: 'pending',
    },

    uniqueNumber: { type: String, unique: true, sparse: true },

    phone: {
      type: String,
      trim: true,
      validate: [validator.isMobilePhone, 'Invalid phone'],
    },
    avatar: String,
    address: String,
    state: String,
    lga: String,
    country: { type: String, default: 'Nigeria' },
    
    // category: {  // Fixed typo: catgeory → category
    //   type: String,
    //   default: 'full-time',
    // },

    dateOfBirth: Date,

    // Driver fields
    isVerified: { type: Boolean, default: false },
    isCertified: { type: Boolean, default: false },
    vehicle: {
      make: String,
      model: String,
      year: Number,
      color: String,
      licensePlate: String,
      capacity: Number,
    },

    // Client fields
    preferredPayment: {
      type: String,
      enum: ['card', 'wallet', 'cash'],
    },

    // Stats
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalTrips: { type: Number, default: 0 },
    earnings: { type: Number, default: 0 },
    timesHired: { type: Number, default: 0 },
    timesHiredDrivers: { type: Number, default: 0 },
    isProfileComplete: { type: Boolean, default: false },
    currentHireStatus: {
      type: String,
      enum: ['available', 'hired'],
      default: 'available',
    },

    // Admin settings
    adminSettings: {
      driverCommissionPercentage: {
        type: Number,
        default: 30,
        min: 0,
        max: 100,
      },
      commissionUpdatedAt: Date,
    },

    driverProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DriverProfile',
    },

    driverShop: {
      subscribed: { type: Boolean, default: false },
      subscribedAt: Date,
      subscriptionStatus: {
        type: String,
        enum: ['pending', 'active', 'expired'],
      },
      paymentRef: String,
    },

    isActive: { type: Boolean, default: true },
    isBlacklisted: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },

    // Referral System
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    referralPoints: { type: Number, default: 0 },
    referralCount: { type: Number, default: 0 },
    referredUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    platform: {
      type: String,
      default: 'edriver',
    },

    isAvailable: { type: Boolean, default: true },
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: null },
    lastActivity: { type: Date, default: null },

    views: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

// Wallet fields
walletId: String,
wallet: {
  customerCode: String,
  customerId: String,
  accountNumber: String,
  accountName: String,
  bankName: String,
  bankId: String,
  currency: String,
  linkedAt: Date,
   balance: { type: Number, default: 0 },
  balanceLastSyncedAt: Date,
},
walletData: mongoose.Schema.Types.Mixed,     // full raw registration response
walletResponse: mongoose.Schema.Types.Mixed, // full raw virtual account response

    // Tokens
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
    newEmail: String,
    emailChangeToken: String,
    emailChangeExpiresAt: Date,
  },
  { timestamps: true }
);

// ==================== PRE-SAVE MIDDLEWARE ====================
// Single hook — previously there were two, with the second nested INSIDE the
// first. That meant a fresh `pre('save')` handler got registered on every
// single save() call (duplicate hooks piling up over the app's lifetime),
// and neither hook ever called next(), which can hang saves depending on
// your Mongoose version. Merged into one hook that always calls next().
userSchema.pre('save', async function (next) {
  // Ensure valid location (prevents the error you had)
  if (!this.location || !this.location.coordinates || this.location.coordinates.length !== 2) {
    this.location = {
      type: 'Point',
      coordinates: [0, 0],
      lastUpdated: new Date(),
    };
  }

  // Keep isProfileComplete in sync whenever a relevant field changes (or on
  // first creation)
  if (
    this.isNew ||
    this.isModified('phone') ||
    this.isModified('address') ||
    this.isModified('state') ||
    this.isModified('lga') ||
    this.isModified('dateOfBirth') ||
    this.isModified('vehicle')
  ) {
    this.isProfileComplete = computeProfileComplete(this);
  }

  // Generate slug
  if (!this.slug) {
    const base = this.email
      ? this.email.split('@')[0]
      : `${this.firstName}-${this.lastName}`.toLowerCase();
    this.slug = slugify(base + '-' + Date.now(), { lower: true, strict: true });
  }

  // Generate referral code
  if (!this.referralCode) {
    let isUnique = false;
    let code;
    while (!isUnique) {
      code = nanoid();
      const existing = await mongoose.models.User.findOne({ referralCode: code });
      isUnique = !existing;
    }
    this.referralCode = code;
  }

});

// ==================== METHODS ====================
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.resetPasswordToken;
  delete user.verificationToken;
  delete user.emailChangeToken;
  return user;
};

// ==================== INDEXES ====================
userSchema.index({ location: '2dsphere' });
userSchema.index({ email: 1 });
userSchema.index({ slug: 1 });
userSchema.index({ referralCode: 1 });
userSchema.index({ uniqueNumber: 1 });
userSchema.index({ role: 1, status: 1 });
userSchema.index({ isActive: 1, role: 1 });

const User = mongoose.model('User', userSchema);

export default User;