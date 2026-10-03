import DriverProfile from '../models/driverProfile.js';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import SubscriptionPlan from '../models/SubscriptionPlan.js';
// export const updateDriverProfile = async (req, res) => {
//   const {
//     categories,
//     expectedEarnings,
//     yearsOfExperience,
//     transmission,
//     languagesSpoken,
//     travelCapabilities,
//     bio,
//     isAvailable,
//   } = req.body;

//   try {
//     // Ensure user is a driver
//     if (req.user.role !== 'driver' && req.user.role !== 'superadmin') {
//       return res.status(403).json({
//         success: false,
//         message: 'Only drivers can update driver profile',
//       });
//     }

//     // Validate required arrays
//     if (!Array.isArray(categories) || categories.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'At least one category must be selected',
//       });
//     }
//     if (!Array.isArray(transmission) || transmission.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'At least one transmission type must be selected',
//       });
//     }
//     if (!Array.isArray(languagesSpoken) || languagesSpoken.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'At least one language must be selected',
//       });
//     }

//     // Validate expected earnings
//     // if (
//     //   !expectedEarnings ||
    
//     //   expectedEarnings.min < 0  ||
//     //   expectedEarnings.max < expectedEarnings.min
//     // ) {
//     //   return res.status(400).json({
//     //     success: false,
//     //     message: 'Valid min and max expected earnings are required (min ≤ max)',
//     //   });
//     // }

//     // Find or create profile
//     let driverProfile = await DriverProfile.findOne({ user: req.user._id });

//     if (driverProfile) {
//       // Update existing profile
//       driverProfile.categories = categories;
//       driverProfile.expectedEarnings = {
//         min: expectedEarnings.min,
//         max: expectedEarnings.max,
//         currency: expectedEarnings.currency?.toUpperCase() || 'USD',
//         note: expectedEarnings.note || '',
//       };
//       driverProfile.yearsOfExperience = yearsOfExperience;
//       driverProfile.transmission = transmission;
//       driverProfile.languagesSpoken = languagesSpoken;
//       driverProfile.travelCapabilities = {
//         interstate: travelCapabilities?.interstate || false,
//         international: travelCapabilities?.international || false,
//         travelNotes: travelCapabilities?.travelNotes || '',
//       };
//       driverProfile.bio = bio || '';
//       driverProfile.isAvailable = isAvailable !== undefined ? isAvailable : driverProfile.isAvailable;
//     } else {
//       // Create new profile
//       driverProfile = new DriverProfile({
//         user: req.user._id,
//         categories,
//         expectedEarnings: {
//           min: expectedEarnings.min,
//           max: expectedEarnings.max,
//           currency: expectedEarnings.currency?.toUpperCase() || 'USD',
//           note: expectedEarnings.note || '',
//         },
//         yearsOfExperience,
//         transmission,
//         languagesSpoken,
//         travelCapabilities: {
//           interstate: travelCapabilities?.interstate || false,
//           international: travelCapabilities?.international || false,
//           travelNotes: travelCapabilities?.travelNotes || '',
//         },
//         bio: bio || '',
//         isAvailable: isAvailable ?? true,
//       });
//     }

//     await driverProfile.save();

//     res.json({
//       success: true,
//       message: 'Driver profile updated successfully',
//       profile: driverProfile,
//     });
//   } catch (error) {
//     console.error('Update driver profile error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error',
//     });
//   }
// };

const isNonEmptyArray = (v) => Array.isArray(v) && v.length > 0;

// Trim, drop empties, dedupe
const cleanStringArray = (arr) =>
  Array.isArray(arr)
    ? [...new Set(arr.map((s) => String(s).trim()).filter(Boolean))]
    : [];

export const updateDriverProfile = async (req, res) => {
  const {
    categories,
    expectedEarnings,
    yearsOfExperience,
    transmission,
    languagesSpoken,
    travelCapabilities,
    bio,
    isAvailable,
    // NEW fields
    statesDrivenTo,
    statesFamiliarWith,
    maritalStatus,
    religion,
    education,
    habits,
    vehicleTypes,
    otherVehicleTypes,
    references,
    isExConvict,
    convictionDetails,
  } = req.body;

  try {
    // Ensure user is a driver
    if (req.user.role !== 'driver' && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Only drivers can update driver profile',
      });
    }

    // Validate required arrays
    if (!isNonEmptyArray(categories)) {
      return res.status(400).json({
        success: false,
        message: 'At least one category must be selected',
      });
    }
    if (!isNonEmptyArray(transmission)) {
      return res.status(400).json({
        success: false,
        message: 'At least one transmission type must be selected',
      });
    }
    if (!isNonEmptyArray(languagesSpoken)) {
      return res.status(400).json({
        success: false,
        message: 'At least one language must be selected',
      });
    }

    // Guard against a missing expectedEarnings object (avoids a TypeError)
    if (!expectedEarnings || typeof expectedEarnings !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Expected earnings are required',
      });
    }

    // ---- Build the update payload ----
    const updates = {
      categories,
      expectedEarnings: {
        min: expectedEarnings.min,
        max: expectedEarnings.max,
        currency: expectedEarnings.currency?.toUpperCase() || 'USD',
        note: expectedEarnings.note || '',
      },
      yearsOfExperience,
      transmission,
      languagesSpoken,
      travelCapabilities: {
        interstate: travelCapabilities?.interstate || false,
        international: travelCapabilities?.international || false,
        travelNotes: travelCapabilities?.travelNotes || '',
      },
      bio: bio || '',
    };

    if (isAvailable !== undefined) updates.isAvailable = isAvailable;

    // New fields: only touched when the client actually sends them,
    // so older app versions don't wipe the data.
    if (statesDrivenTo !== undefined) updates.statesDrivenTo = cleanStringArray(statesDrivenTo);
    if (statesFamiliarWith !== undefined) updates.statesFamiliarWith = cleanStringArray(statesFamiliarWith);

    if (maritalStatus !== undefined) updates.maritalStatus = maritalStatus || undefined;
    if (religion !== undefined) updates.religion = religion || undefined;

    if (education !== undefined) {
      updates.education = {
        highestLevel: education?.highestLevel || undefined,
        degree: education?.degree || '',
        institution: education?.institution || '',
        graduationYear: education?.graduationYear || undefined,
        additionalInfo: education?.additionalInfo || '',
      };
    }

    if (habits !== undefined) {
      updates.habits = {
        smokes: !!habits?.smokes,
        smokingLevel: habits?.smokes ? habits?.smokingLevel : undefined,
        drinksAlcohol: !!habits?.drinksAlcohol,
        drinkingLevel: habits?.drinksAlcohol ? habits?.drinkingLevel : undefined,
      };
    }

    if (vehicleTypes !== undefined) updates.vehicleTypes = cleanStringArray(vehicleTypes);
    if (otherVehicleTypes !== undefined) updates.otherVehicleTypes = cleanStringArray(otherVehicleTypes);

    if (references !== undefined) {
      if (!Array.isArray(references)) {
        return res.status(400).json({
          success: false,
          message: 'References must be an array',
        });
      }
      // Whitelist the fields we accept per reference
      updates.references = references.map((r) => ({
        name: r?.name,
        contact: r?.contact,
        occupation: r?.occupation,
        address: r?.address,
        relationship: r?.relationship,
      }));
    }

    if (isExConvict !== undefined) {
      updates.isExConvict = !!isExConvict;
      updates.convictionDetails = isExConvict ? convictionDetails || '' : undefined;
    }

    // ---- Find or create profile ----
    let driverProfile = await DriverProfile.findOne({ user: req.user._id });

    if (driverProfile) {
      driverProfile.set(updates);
    } else {
      driverProfile = new DriverProfile({
        user: req.user._id,
        isAvailable: true,
        ...updates,
      });
    }

    await driverProfile.save();

    res.json({
      success: true,
      message: 'Driver profile updated successfully',
      profile: driverProfile,
    });
  } catch (error) {
    // Surface Mongoose validation problems as 400s with readable messages
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages[0],
        errors: messages,
      });
    }

    console.error('Update driver profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// controllers/driverController.js
export const getDriverProfileById = async (req, res) => {
  try {
    const { driverId } = req.params;

    const profile = await DriverProfile.findOne({ user: driverId })
      .populate('user', 'firstName lastName phone avatar rating totalTrips vehicle location')
      .lean();

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Driver profile not found' });
    }

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getDriverProfile = async (req, res) => {
 console.log(req.user._idd)
  try {
    if (req.user.role !== 'driver' && req.user.role !== 'superadmin') {
      console.log("I am here")
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const profile = await DriverProfile.findOne({ user: req.user._id || req.user.id || req.user?._id });
    console.log(profile, "your request")
    // if (!profile) {
    //   return res.status(404).json({
    //     success: false,
    //     message: 'Driver profile not found',
    //   });
    // }

    res.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error('Get driver profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};





export const subscribeToPlan = async (req, res) => {
  const userId = req.user._id;
  const { type,  planName } = req.body;

  try {
    // Check if already subscribed
    const existing = await Subscription.findOne({
      user: userId,
      type,
      planName,
      subscriptionStatus: { $in: ['active', 'pending'] }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active or pending subscription for this plan'
      });
    }

    // Get plan price set by admin
    const plan = await SubscriptionPlan.findOne({ type, planName, isActive: true });
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'This subscription plan is not available'
      });
    }

    // Create subscription (pending payment)
    const subscription = await Subscription.create({
      user: userId,
      type,
      planName,
      subscriptionAmount: plan.amount,
      currency: plan.currency,
      subscriptionStatus: 'pending',
      subscribedAt: Date.now()
    });

    res.status(201).json({
      success: true,
      message: 'Subscription request created – proceed to payment',
      data: subscription
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};