// backend/models/VehicleLicenseApplication.js
import mongoose from 'mongoose';

const vehicleLicenseApplicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['new', 'renewal'],
    required: true,
  },
  // Owner details
  ownerFullName: { type: String, required: true },
  ownerPhone: { type: String, required: true },
  ownerEmail: { type: String, required: true },

  // Vehicle details
  vehicleMake: { type: String, required: true },
  vehicleModel: { type: String, required: true },
  vehicleYear: { type: Number, required: true },
  chassisNumber: { type: String, required: true },
  engineNumber: { type: String, required: true },
  plateNumber: { type: String, required: true },
  vehicleColor: { type: String, required: true },
  fuelType: { type: String, enum: ['petrol', 'diesel', 'electric', 'hybrid'], required: true },
  vehicleType: { type: String, required: true }, // e.g., Saloon, SUV, Truck

  // Uploads
  vehiclePhoto: { type: String, required: true },
  proofOfOwnership: { type: String, required: true },
  insuranceCertificate: { type: String, required: true },
  roadWorthyCertificate: { type: String, required: true },

  // Renewal only
  currentLicenseNumber: String,
  currentExpiryDate: Date,

  // Payment & Status
  paymentRef: String,
  amountPaid: Number,
  status: {
    type: String,
    enum: ['payment-pending', 'submitted', 'processing', 'ready', 'rejected'],
    default: 'payment-pending',
  },
  submittedAt: { type: Date, default: Date.now },
  confirmedAt: Date,
  processedAt: Date,
  rejectedAt: Date,
  rejectionReason: String,
}, { timestamps: true });

const VehicleLicenseApplication = mongoose.model('VehicleLicenseApplication', vehicleLicenseApplicationSchema);
export default VehicleLicenseApplication;