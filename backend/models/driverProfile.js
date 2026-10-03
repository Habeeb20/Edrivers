// // backend/models/DriverProfile.js
// import mongoose from 'mongoose';

// const { Schema } = mongoose;

// // Enums for multi-select fields

// const transmissionTypes = ['automatic', 'manual', 'both'];

// const languagesSpoken = [
//   'English',
//   'Spanish',
//   'French',
//   'Hindi',
//   'Arabic',
//   'Mandarin',
//   'Yoruba',
//   'Igbo',
//   'Hausa',
//   'Portuguese',
//   // Add more as needed
// ];

// const driverProfileSchema = new Schema(
//   {
//     // Reference to the main User document (driver)
//     user: {
//       type: Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//       unique: true,
//     },

//     // Multi-select: Types of driving services offered
//     categories: {
//       type: [String],
//       required: true,
//       // enum: {
//       //   values: driverCategories,
//       //   message: '{VALUE} is not a valid driver category',
//       // },
//       validate: {
//         validator: (v) => v.length > 0,
//         message: 'At least one category must be selected',
//       },
//     },

//     // Expected earnings range
//     expectedEarnings: {
//       min: {
//         type: Number,
//         required: true,
//         min: [0, 'Minimum expected earnings cannot be negative'],
//       },
//       max: {
//         type: Number,
//         required: true,
//         min: [0, 'Maximum expected earnings cannot be negative'],
//       },
//       currency: {
//         type: String,
//         default: 'USD',
//         uppercase: true,
//       },
//       note: {
//         type: String,
//         trim: true,
//         maxlength: 200,
//       },
//     },

//     // Years of professional driving experience
//     yearsOfExperience: {
//       type: Number,
//       required: true,
//       min: [0, 'Experience cannot be negative'],
//       max: [50, 'Experience seems unusually high'],
//     },

//     // Transmission preferences (multi-select)
//     transmission: {
//       type: [String],
//       required: true,
//       enum: {
//         values: transmissionTypes,
//         message: '{VALUE} is not a valid transmission type',
//       },
//       validate: {
//         validator: (v) => v.length > 0,
//         message: 'At least one transmission type must be selected',
//       },
//     },

//     // Languages spoken (multi-select)
//     languagesSpoken: {
//       type: [String],
//       required: true,
//       enum: {
//         values: languagesSpoken,
//         message: '{VALUE} is not a supported language',
//       },
//       validate: {
//         validator: (v) => v.length > 0,
//         message: 'At least one language must be selected',
//       },
//     },

//     // NEW: Travel capabilities
//     travelCapabilities: {
//       interstate: {
//         type: Boolean,
//         default: false,
//       },
//       international: {
//         type: Boolean,
//         default: false,
//       },
//       // Optional: Notes about travel restrictions or requirements
//       travelNotes: {
//         type: String,
//         trim: true,
//         maxlength: 300,
//       },
//     },

//     // Optional bio
//     bio: {
//       type: String,
//       trim: true,
//       maxlength: 500,
//     },

//     // Availability status
//     isAvailable: {
//       type: Boolean,
//       default: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // Indexes for performance
// driverProfileSchema.index({ user: 1 });
// driverProfileSchema.index({ categories: 1 });
// driverProfileSchema.index({ 'expectedEarnings.min': 1 });
// driverProfileSchema.index({ languagesSpoken: 1 });
// driverProfileSchema.index({ 'travelCapabilities.interstate': 1 });
// driverProfileSchema.index({ 'travelCapabilities.international': 1 });

// const DriverProfile = mongoose.model('DriverProfile', driverProfileSchema);

// export default DriverProfile;





// backend/models/DriverProfile.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

// ---------- Enums ----------

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

export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT',
  'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi',
  'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo',
  'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
];

const maritalStatuses = ['single', 'married', 'divorced', 'separated', 'widowed'];

const religions = ['christianity', 'islam', 'traditional', 'other', 'prefer_not_to_say'];

const educationLevels = [
  'none',
  'primary',
  'secondary', // SSCE / WAEC / NECO
  'vocational',
  'ond',
  'hnd',
  'bachelors',
  'masters',
  'phd',
  'other',
];

const consumptionLevels = ['light', 'normal', 'heavy'];

const vehicleTypes = [
  'car',
  'suv',
  'jeep',
  'van',
  'minibus',
  'bus',
  'truck',
  'trailer',
  'tanker',
  'pickup',
  'motorcycle',
  'tricycle',
  'other', // requires otherVehicleTypes
];

// ---------- Sub-schemas ----------

const referenceSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Reference name is required'],
      trim: true,
      maxlength: 100,
    },
    contact: {
      type: String,
      required: [true, 'Reference contact is required'],
      trim: true,
      maxlength: 30,
    },
    occupation: {
      type: String,
      required: [true, 'Reference occupation is required'],
      trim: true,
      maxlength: 100,
    },
    address: {
      type: String,
      required: [true, 'Reference address is required'],
      trim: true,
      maxlength: 250,
    },
    relationship: {
      type: String,
      trim: true,
      maxlength: 100,
    },
  },
  { _id: true }
);

// ---------- Main schema ----------

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

    // Travel capabilities
    travelCapabilities: {
      interstate: { type: Boolean, default: false },
      international: { type: Boolean, default: false },
      travelNotes: {
        type: String,
        trim: true,
        maxlength: 300,
      },
    },

    // ----- NEW: Geography -----

    // States the driver has actually driven to
    statesDrivenTo: {
      type: [String],
      default: [],
      enum: {
        values: NIGERIAN_STATES,
        message: '{VALUE} is not a valid state',
      },
    },

    // States the driver is familiar with (knows the roads/area)
    statesFamiliarWith: {
      type: [String],
      default: [],
      enum: {
        values: NIGERIAN_STATES,
        message: '{VALUE} is not a valid state',
      },
    },

    // ----- NEW: Personal info -----

    maritalStatus: {
      type: String,
      enum: {
        values: maritalStatuses,
        message: '{VALUE} is not a valid marital status',
      },
    },

    religion: {
      type: String,
      enum: {
        values: religions,
        message: '{VALUE} is not a valid religion option',
      },
    },

    // ----- NEW: Education -----

    education: {
      highestLevel: {
        type: String,
        enum: {
          values: educationLevels,
          message: '{VALUE} is not a valid education level',
        },
      },
      degree: { type: String, trim: true, maxlength: 150 }, // e.g. "B.Sc Mechanical Engineering"
      institution: { type: String, trim: true, maxlength: 150 },
      graduationYear: {
        type: Number,
        min: [1950, 'Graduation year looks too early'],
        max: [new Date().getFullYear() + 1, 'Graduation year cannot be in the future'],
      },
      additionalInfo: { type: String, trim: true, maxlength: 500 }, // certificates, trainings, etc.
    },

    // ----- NEW: Lifestyle -----

    habits: {
      smokes: { type: Boolean, default: false },
      smokingLevel: {
        type: String,
        enum: {
          values: consumptionLevels,
          message: '{VALUE} is not a valid smoking level',
        },
        required: [
          function () {
            return this.habits?.smokes === true;
          },
          'Please specify how much you smoke (light, normal or heavy)',
        ],
      },
      drinksAlcohol: { type: Boolean, default: false },
      drinkingLevel: {
        type: String,
        enum: {
          values: consumptionLevels,
          message: '{VALUE} is not a valid drinking level',
        },
        required: [
          function () {
            return this.habits?.drinksAlcohol === true;
          },
          'Please specify how much you drink (light, normal or heavy)',
        ],
      },
    },

    // ----- NEW: Vehicles the driver can handle -----

    vehicleTypes: {
      type: [String],
      default: [],
      enum: {
        values: vehicleTypes,
        message: '{VALUE} is not a valid vehicle type',
      },
    },

    // Free-text types when "other" is selected
    otherVehicleTypes: {
      type: [String],
      default: [],
      validate: {
        validator: function (v) {
          // If "other" is chosen, at least one custom type must be specified
          if (this.vehicleTypes?.includes('other')) return v && v.length > 0;
          return true;
        },
        message: 'Please specify the other vehicle type(s) you can drive',
      },
    },

    // ----- NEW: References -----

    references: {
      type: [referenceSchema],
      default: [],
      validate: {
        validator: (v) => v.length <= 5,
        message: 'You can add a maximum of 5 references',
      },
    },

    // ----- NEW: Background -----

    isExConvict: {
      type: Boolean,
      default: false,
    },
    convictionDetails: {
      type: String,
      trim: true,
      maxlength: 500,
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

// Keep data clean: drop dependent fields when the parent flag is off
driverProfileSchema.pre('validate', function (next) {
  if (this.habits) {
    if (!this.habits.smokes) this.habits.smokingLevel = undefined;
    if (!this.habits.drinksAlcohol) this.habits.drinkingLevel = undefined;
  }
  if (!this.vehicleTypes?.includes('other')) this.otherVehicleTypes = [];
  if (!this.isExConvict) this.convictionDetails = undefined;

});

// Indexes for performance
driverProfileSchema.index({ user: 1 });
driverProfileSchema.index({ categories: 1 });
driverProfileSchema.index({ 'expectedEarnings.min': 1 });
driverProfileSchema.index({ languagesSpoken: 1 });
driverProfileSchema.index({ 'travelCapabilities.interstate': 1 });
driverProfileSchema.index({ 'travelCapabilities.international': 1 });
driverProfileSchema.index({ vehicleTypes: 1 });
driverProfileSchema.index({ statesFamiliarWith: 1 });
driverProfileSchema.index({ statesDrivenTo: 1 });

const DriverProfile = mongoose.model('DriverProfile', driverProfileSchema);

export default DriverProfile;