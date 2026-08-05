import mongoose from "mongoose";

const driverLicenseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },

  // Common fields
  fullname: { type: String, required: true },
  dob: { type: Date, required: true },
  gender: { type: String, enum: ["male", "female", "other"], required: true },
  // nin: { type: String, required: false,unique: false,          
  // sparse: true, default: "",  },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  bloodGroup: { type: String,  },

  // License /
  licenseNumber: { type: String, unique: true }, // Generated or from renewal
  licenseType: { 
    type: String, 
    enum: ["new", "renewal"], 
    required: true 
  },
  oldLicenseNumber: { type: String }, // Only for renewal
  status: {
    type: String,
  
    default: "pending"
  },
  issuedAt: Date,
  expiresAt: Date,

  // Documents
  photo: String,        // Face photo
  signature: String,    // Signature
  documents: {
    ninSlip: String,
    birthCert: String,
    proofOfAddress: String
  },

  // Admin notes
  adminNote: String,
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

// Auto-generate license number for new
driverLicenseSchema.pre("save", function(next) {
  if (this.licenseType === "new" && !this.licenseNumber) {
    this.licenseNumber = `DL${Date.now().toString().slice(-8)}`;
    this.expiresAt = new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000); // 5 years
  }
  if (this.licenseType === "renewal" && this.oldLicenseNumber) {
    this.expiresAt = new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000);
  }

});

export default mongoose.model("DriverLicense", driverLicenseSchema);