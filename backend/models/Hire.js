


// models/Hire.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

// Flat call-out charge (₦) applied to every hire
export const CALL_OUT_CHARGE = 5000;

// ---------- Enums ----------

const genders = ['male', 'female', 'other', 'prefer_not_to_say'];
const maritalStatuses = ['single', 'married', 'divorced', 'separated', 'widowed'];

// Keep in sync with the vehicleTypes enum on DriverProfile
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
  'other',
];

const whoOptions = ['self', 'others'];

// ---------- Helpers ----------

// Image fields hold Cloudinary URLs uploaded from the frontend
const isHttpUrl = (v) => !v || /^https?:\/\/\S+$/i.test(v);
const imageUrlValidator = {
  validator: isHttpUrl,
  message: 'Image must be a valid URL',
};

// Required only when the hire is first created, so older hire documents
// (created before these fields existed) can still be saved when their
// status changes.
const requiredOnCreate = function () {
  return this.isNew;
};

const hireSchema = new Schema(
  {
    // References to users
    client: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    driver: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Core hire details
    category: {
      type: String,
      required: true,
    },
    durationHours: {
      type: Number,
      required: true,
      min: 1,
    },
    amountOffered: {
      type: Number,
      required: true,
      min: 0,
    },
    amount: {
      type: Number,
      min: 0,
      required: true,
    },

    // Flat call-out charge, charged on top of the hire amount
    callOutCharge: {
      type: Number,
      default: CALL_OUT_CHARGE,
      min: 0,
    },

    date: {
      type: Date,
    },
    time: {
      type: String,
    },
    address: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    accommodation: {
      type: Boolean,
      default: false,
    },
    benefits: {
      type: String,
      trim: true,
    },

    // ----- NEW: Vehicle the client wants the driver to drive -----
    vehicleType: {
      type: String,
      enum: {
        values: vehicleTypes,
        message: '{VALUE} is not a valid vehicle type',
      },
      required: [requiredOnCreate, 'Please select the type of vehicle'],
    },
    vehicleTypeOther: {
      type: String,
      trim: true,
      maxlength: 100,
      required: [
        function () {
          return this.vehicleType === 'other';
        },
        'Please specify the vehicle type',
      ],
    },

    // ----- NEW: Client information -----
    clientInfo: {
      age: {
        type: Number,
        min: [18, 'Client must be at least 18 years old'],
        max: [100, 'Please enter a valid age'],
        required: [requiredOnCreate, 'Age is required'],
      },
      gender: {
        type: String,
        enum: {
          values: genders,
          message: '{VALUE} is not a valid gender option',
        },
        required: [requiredOnCreate, 'Gender is required'],
      },
      maritalStatus: {
        type: String,
        enum: {
          values: maritalStatuses,
          message: '{VALUE} is not a valid marital status',
        },
        required: [requiredOnCreate, 'Marital status is required'],
      },
    },

    // ----- NEW: Passenger information -----
    passengerInfo: {
      // Who the driver will be driving: the client or someone else
      passengerType: {
        type: String,
        enum: {
          values: whoOptions,
          message: '{VALUE} is not a valid passenger option',
        },
        required: [requiredOnCreate, 'Please state who the driver will be driving'],
      },
      // Required when passengerType is "others"
      passengerDetails: {
        type: String,
        trim: true,
        maxlength: 300,
        required: [
          function () {
            return this.passengerInfo?.passengerType === 'others';
          },
          'Please specify who the driver will be driving',
        ],
      },
      numberOfPassengers: {
        type: Number,
        min: [1, 'There must be at least 1 passenger'],
        max: [60, 'Number of passengers seems too high'],
        required: [requiredOnCreate, 'Number of passengers is required'],
      },
      // Optional Cloudinary URLs
      pictures: {
        type: [
          {
            type: String,
            trim: true,
            validate: imageUrlValidator,
          },
        ],
        default: [],
        validate: {
          validator: (v) => v.length <= 10,
          message: 'You can upload a maximum of 10 passenger pictures',
        },
      },
    },

    // ----- NEW: Vehicle information -----
    vehicleInfo: {
      // Who owns the vehicle: the client or someone else
      ownership: {
        type: String,
        enum: {
          values: whoOptions,
          message: '{VALUE} is not a valid ownership option',
        },
        required: [requiredOnCreate, 'Please state who owns the vehicle'],
      },
      // Required when ownership is "others"
      owner: {
        name: {
          type: String,
          trim: true,
          maxlength: 100,
          required: [
            function () {
              return this.vehicleInfo?.ownership === 'others';
            },
            "Vehicle owner's name is required",
          ],
        },
        relationship: {
          type: String,
          trim: true,
          maxlength: 100,
          required: [
            function () {
              return this.vehicleInfo?.ownership === 'others';
            },
            "Relationship with the vehicle owner is required",
          ],
        },
        contact: {
          type: String,
          trim: true,
          maxlength: 30,
          required: [
            function () {
              return this.vehicleInfo?.ownership === 'others';
            },
            "Vehicle owner's contact is required",
          ],
        },
        // Optional Cloudinary URL
        picture: {
          type: String,
          trim: true,
          validate: imageUrlValidator,
        },
      },
      // Cloudinary URL of the vehicle
      vehiclePicture: {
        type: String,
        trim: true,
        validate: imageUrlValidator,
      },
    },

    // Status & lifecycle
    status: {
      type: String,
      enum: [
        'pending', // client sent, driver hasn't responded
        'pending_approval',
        'awaiting_admin_approval',
        'accepted', // approved and accepted
        'active', // hire is ongoing
        'ended', // hire completed normally
        'declined', // driver or admin declined
        'cancelled', // cancelled by either party
        'rejected',
      ],
      default: 'pending',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'success', 'failed', 'paid'],
      default: 'pending',
      index: true,
    },

    // Timeline
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    acceptedAt: Date,
    endedAt: Date,
    endReason: String,
    endedEarly: {
      type: Boolean,
      default: false,
    },

    // Cancellation
    cancelledAt: Date,
    cancelledBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    cancelledByRole: {
      type: String,
      enum: ['driver', 'client', 'admin'],
    },
    cancelReason: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    // Payment & conversation
    paymentReference: {
      type: String,
      trim: true,
    },
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
    },

    // Admin approval
    adminApprovedAt: Date,
    adminApprovedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    // Additional metadata
    hireReference: {
      type: String,
      unique: true,
      sparse: true,
    },


    payout: { 
      status: { type: String, enum: ['unpaid','processing','paid'], 
        default: 'unpaid', index: true }, 
        payoutId: { type: Schema.Types.ObjectId, ref: 'Payout' } }, 
        refund: { status: { type: String, enum: ['none','pending','processed','failed'], default: 'none' }, 
        amount: Number, refundId: { type: Schema.Types.ObjectId, ref: 'Refund' } 
      },
  },
  { timestamps: true }
);

// Clear dependent fields when the parent choice makes them irrelevant
hireSchema.pre('validate', function (next) {
  if (this.vehicleType !== 'other') this.vehicleTypeOther = undefined;

  if (this.passengerInfo?.passengerType === 'self') {
    this.passengerInfo.passengerDetails = undefined;
  }

  if (this.vehicleInfo?.ownership === 'self' && this.vehicleInfo.owner) {
    this.vehicleInfo.owner = undefined;
  }


});

// Indexes for fast queries
hireSchema.index({ client: 1, status: 1 });
hireSchema.index({ driver: 1, status: 1 });
hireSchema.index({ status: 1, paymentStatus: 1 });
hireSchema.index({ hireReference: 1 });

const Hire = mongoose.model('Hire', hireSchema);
export default Hire;

























