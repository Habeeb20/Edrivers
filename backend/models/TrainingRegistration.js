// backend/models/TrainingRegistration.js
import mongoose from 'mongoose';

const trainingRegistrationSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  previousExperience: {
    type: String,
    enum: ['none', 'less-than-1', '1-3', '3-plus'],
    default: 'none',
  },
  preferredSchedule: {
    type: String,
    enum: ['weekday', 'weekend', 'flexible'],
    default: 'weekday',
  },
  referralSource: String,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-training', 'completed', 'certified'],
    default: 'pending',
  },
  registeredAt: { type: Date, default: Date.now },
}, { timestamps: true });

const TrainingRegistration = mongoose.model('TrainingRegistration', trainingRegistrationSchema);
export default TrainingRegistration;