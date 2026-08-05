// // backend/models/Car.js
// import mongoose from 'mongoose';

// const carSchema = new mongoose.Schema({
//   carId: {
//   type: String,
//   unique: true,
//   sparse: true, // allows multiple nulls
//   default: () => `CAR-${Date.now()}-${Math.floor(Math.random() * 1000)}`
// },
//   owner: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//   },
//   make: { type: String, required: true },
//   model: { type: String, required: true },
//   year: { type: Number, required: true },
//   color: String,
//   plateNumber: { type: String, uppercase: true, unique: true, sparse: true },
//   transmission: { type: String, enum: ['automatic', 'manual'], required: true },
//   fuelType: { type: String, enum: ['petrol', 'diesel', 'electric', 'hybrid'], required: true },

//   photos: [String], // Cloudinary URLs
//   documents: {
//     insurance: { type: String, required: true },
//     roadWorthy: { type: String, required: true },
//     license: { type: String, required: true },
//   },

//   rentalPrice: { type: Number, required: true }, // Per day
//   location: { type: String, required: true },

//   available: { type: Boolean, default: true },
//   status: { type: String, enum: ['pending', 'approved', 'declined', 'paid'], default: 'pending' },
//   approvedAt: Date,
//   declinedAt: Date,
//   declineReason: String,

  

//   rating: { type: Number, default: 0 },
//   totalRentals: { type: Number, default: 0 },
//   reviews: [{
//     renter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//     rating: { type: Number, min: 1, max: 5 },
//     comment: String,
//     date: { type: Date, default: Date.now },
//   }],
// isDeleted: { type: Boolean, default: false },
//   postedAt: { type: Date, default: Date.now },
// }, { timestamps: true });

// carSchema.index({ owner: 1 });
// carSchema.index({ status: 1 });
// carSchema.index({ available: 1 });

// const Car = mongoose.model('Car', carSchema);
// export default Car;
































































// backend/models/Car.js
import mongoose from 'mongoose';

const carSchema = new mongoose.Schema({
  carId: {
    type: String,
    unique: true,
    sparse: true,
    default: () => `CAR-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  color: String,
  plateNumber: { type: String, uppercase: true, unique: true, sparse: true },

  transmission: { type: String, enum: ['automatic', 'manual'], required: true },
  fuelType: { type: String, enum: ['petrol', 'diesel', 'electric', 'hybrid'], required: true },

  // === NEW FIELDS FOR CAR OWNER ===
  hasAirCondition: { type: Boolean, default: true },

  rentalPriceWithFuel: { type: Number, required: true },   // Price when fuel is included
  rentalPriceWithoutFuel: { type: Number, required: true }, // Price when fuel is NOT included

  driver: {
    name: { type: String },
    contactNumber: { type: String },
    photo: { type: String },           // Cloudinary URL
    yearsOfExperience: { type: Number, min: 0 },
  },

  // === ADMIN INSPECTION ===
  inspection: {
    grade: { 
      type: String, 
      enum: ['A', 'B', 'C', 'D', 'E'],
      default: null 
    },
    condition: { type: String },           // e.g. "Excellent", "Good", "Fair", "Poor"
    rating: { type: Number, min: 1, max: 10 }, // Overall rating out of 10
    inspectedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    inspectedAt: Date,
    notes: String,
  },

  photos: [String], // Cloudinary URLs
  documents: {
    insurance: { type: String, required: true },
    roadWorthy: { type: String, required: true },
    license: { type: String, required: true },
  },

  rentalPrice: { type: Number }, // Keep for backward compatibility (optional now)
  location: { type: String, required: true },

  available: { type: Boolean, default: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'declined', 'paid'], 
    default: 'pending' 
  },

  approvedAt: Date,
  declinedAt: Date,
  declineReason: String,

  rating: { type: Number, default: 0 },
  totalRentals: { type: Number, default: 0 },
  reviews: [{
    renter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    date: { type: Date, default: Date.now },
  }],

  isDeleted: { type: Boolean, default: false },
  postedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Indexes
carSchema.index({ owner: 1 });
carSchema.index({ status: 1 });
carSchema.index({ available: 1 });
carSchema.index({ 'inspection.grade': 1 });

const Car = mongoose.model('Car', carSchema);
export default Car;