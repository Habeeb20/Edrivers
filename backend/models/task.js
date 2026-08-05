// backend/models/Task.js
import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: [20, 'Description too short'],
    maxlength: [2000, 'Description too long'],
  },
  visibility: {
    type: String,
    enum: ['all', 'full-time', 'short-term'],
    required: true,
  },
  paymentRef: String,
  amountPaid: { type: Number, default: 5000 },
  status: {
    type: String,
    enum: ['pending', 'approved', 'declined'],
    default: 'approved',
  },
  approvedAt: Date,
  declinedAt: Date,
  declineReason: String,
  postedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Index for fast querying
taskSchema.index({ status: 1 });
taskSchema.index({ visibility: 1 });

const Task = mongoose.model('Task', taskSchema);
export default Task;