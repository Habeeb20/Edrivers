import mongoose from "mongoose";
const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
  
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  relatedHire: { type: mongoose.Schema.Types.ObjectId, ref: 'Proposal' },
  relatedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

notificationSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);