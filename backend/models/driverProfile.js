// backend/models/DriverProfile.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

// Enums for multi-select fields

const transmissionTypes = ['automatic', 'manual', 'both'];

const languagesSpoken = [
  'English',
  'Spanish',
  'French',
  'Hindi',
  'Arabic',
  'Mandarin',
  'Yoruba',
  'Igbo',
  'Hausa',
  'Portuguese',
  // Add more as needed
];

const driverProfileSchema = new Schema(
  {
    // Reference to the main User document (driver)
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    // Multi-select: Types of driving services offered
    categories: {
      type: [String],
      required: true,
      // enum: {
      //   values: driverCategories,
      //   message: '{VALUE} is not a valid driver category',
      // },
      validate: {
        validator: (v) => v.length > 0,
        message: 'At least one category must be selected',
      },
    },

    // Expected earnings range
    expectedEarnings: {
      min: {
        type: Number,
        required: true,
        min: [0, 'Minimum expected earnings cannot be negative'],
      },
      max: {
        type: Number,
        required: true,
        min: [0, 'Maximum expected earnings cannot be negative'],
      },
      currency: {
        type: String,
        default: 'USD',
        uppercase: true,
      },
      note: {
        type: String,
        trim: true,
        maxlength: 200,
      },
    },

    // Years of professional driving experience
    yearsOfExperience: {
      type: Number,
      required: true,
      min: [0, 'Experience cannot be negative'],
      max: [50, 'Experience seems unusually high'],
    },

    // Transmission preferences (multi-select)
    transmission: {
      type: [String],
      required: true,
      enum: {
        values: transmissionTypes,
        message: '{VALUE} is not a valid transmission type',
      },
      validate: {
        validator: (v) => v.length > 0,
        message: 'At least one transmission type must be selected',
      },
    },

    // Languages spoken (multi-select)
    languagesSpoken: {
      type: [String],
      required: true,
      enum: {
        values: languagesSpoken,
        message: '{VALUE} is not a supported language',
      },
      validate: {
        validator: (v) => v.length > 0,
        message: 'At least one language must be selected',
      },
    },

    // NEW: Travel capabilities
    travelCapabilities: {
      interstate: {
        type: Boolean,
        default: false,
      },
      international: {
        type: Boolean,
        default: false,
      },
      // Optional: Notes about travel restrictions or requirements
      travelNotes: {
        type: String,
        trim: true,
        maxlength: 300,
      },
    },

    // Optional bio
    bio: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    // Availability status
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
driverProfileSchema.index({ user: 1 });
driverProfileSchema.index({ categories: 1 });
driverProfileSchema.index({ 'expectedEarnings.min': 1 });
driverProfileSchema.index({ languagesSpoken: 1 });
driverProfileSchema.index({ 'travelCapabilities.interstate': 1 });
driverProfileSchema.index({ 'travelCapabilities.international': 1 });

const DriverProfile = mongoose.model('DriverProfile', driverProfileSchema);

export default DriverProfile;