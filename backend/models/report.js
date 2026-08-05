// models/Report.js
import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    hire: { type: mongoose.Schema.Types.ObjectId, ref: 'Hire', required: true },

    reason: {
      type: String,
      enum: [
        'harassment',
        'no_show',
        'unsafe_behavior',
        'payment_issue',
        'inappropriate_conduct',
        'fraud',
        'other',
      ],
      required: true,
    },

    details: { type: String, trim: true, maxlength: 1000, required: true },

    status: {
      type: String,
      enum: ['pending', 'reviewing', 'resolved', 'dismissed'],
      default: 'pending',
      index: true,
    },

    resolvedAt: Date,
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    adminNotes: { type: String, trim: true },
  },
  { timestamps: true }
);

reportSchema.index({ reportedUser: 1, status: 1 });
reportSchema.index({ reporter: 1, hire: 1 }, { unique: true }); // one report per driver per hire

const Report = mongoose.model('Report', reportSchema);
export default Report;