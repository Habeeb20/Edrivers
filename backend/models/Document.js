// models/Document.js
import mongoose from 'mongoose';



const documentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  type: {
    type: String,
    enum: [
      'license',
      'insurance',
      'registration',
      'medical',
      'guarantor-id'
    ],
    required: true
  },

  guarantorPosition: {
    type: Number,
    enum: [1, 2],
    default: null
  },

  url: {
    type: String,
    required: true
  },

  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },

  verifiedAt: Date,
  rejectedAt: Date,
  rejectionReason: String

}, { timestamps: true });

documentSchema.index({ user: 1, type: 1, guarantorPosition: 1 }, { unique: true });


const Document = mongoose.model('Document', documentSchema);
export default Document;