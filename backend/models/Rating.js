// models/Rating.js
import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
  // Who rated whom
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // What hire this rating is for (optional)
  hireId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hire'
  },

  // Rating details
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    trim: true,
    maxlength: [500, 'Review too long']
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [1000, 'Comment too long']
  },

  // Metadata
  context: {
    type: String,
    enum: ['hire', 'trip', 'service'],
    default: 'hire'
  }

}, { timestamps: true });

// Indexes
ratingSchema.index({ fromUser: 1, toUser: 1 });
ratingSchema.index({ toUser: 1, rating: -1 }); // for user rating summaries
ratingSchema.index({ hireId: 1 });

const Rating = mongoose.model('Rating', ratingSchema);
export default Rating;