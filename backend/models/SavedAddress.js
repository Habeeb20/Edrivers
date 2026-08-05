// models/Address.js
import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  label: {
    type: String,
    enum: ['home', 'work', 'pickup', 'dropoff', 'office', 'other'],
    required: true
  },
  fullAddress: {
    type: String,
    required: true
  },
  street: String,
  city: String,
  state: String,
  zipCode: String,
  country: {
    type: String,
    default: 'Nigeria'
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [lng, lat]
      default: [0, 0]
    }
  }
}, { timestamps: true });

addressSchema.index({ user: 1, isDefault: 1 });
addressSchema.index({ coordinates: '2dsphere' });

const Address = mongoose.model('Address', addressSchema);
export default Address;