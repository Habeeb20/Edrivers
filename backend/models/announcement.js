// models/Announcement.js
import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['info', 'warning', 'success', 'urgent'],
      default: 'info',
    },
    priority: {
      type: Number,
      default: 1, // 1 = normal, 2 = high, 3 = urgent
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetRole: {
      type: String,
      enum: ['provider', 'client', 'all'],
      default: 'provider', // mainly for providers as per your request
    },
    expiresAt: {
      type: Date, // optional expiry
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index for better query performance
announcementSchema.index({ targetRole: 1, isActive: 1, priority: -1, createdAt: -1 });

export default mongoose.model('Announcement', announcementSchema);