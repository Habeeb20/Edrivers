// // controllers/hireController.js
// import Hire from "../models/Hire.js";
// import User from "../models/User.js";
// import Conversation from "../models/Conversation.js";
// import { sendNotification } from "../utils/sendNotification.js";
// import Paystack from 'paystack';
// import PricingConfig from "../models/pricingConfig.js"
// import Rating from "../models/Rating.js"
// import mongoose from "mongoose";
// const paystack = Paystack(process.env.PAYSTACK_SECRET_KEY);


// export const sendHireRequest = async (req, res) => {
//   const clientId = req.user._id;
//   const {
//     driverId,
//     durationHours,
//     amountOffered,
//     description,
//     category,
//     amount, // system calculated (minimum acceptable)
//     address,
//     date,
//     time,
//     state,
//     lga,
//     country = 'Nigeria',
//     accommodation,
//     benefits
//   } = req.body;

//   try {
//     // Validate required fields
//     if (!driverId || !durationHours || !address || !category || !amountOffered || !amount || !date || !time) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing required fields: driverId, durationHours, address, category, amountOffered, amount, date, time'
//       });
//     }

//     // Convert to numbers safely
//     const offered = Number(amountOffered);
//     const system = Number(amount);

//     if (isNaN(offered) || isNaN(system) || offered <= 0 || system <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid amount values'
//       });
//     }

//     // Check driver
//     const driver = await User.findById(driverId);
//     if (!driver || driver.role !== 'driver') {
//       return res.status(404).json({ success: false, message: 'Driver not found' });
//     }
//     if (driver.currentHireStatus === 'hired') {
//       return res.status(400).json({ success: false, message: 'Driver is currently hired' });
//     }

//     // Determine initial status based on offer vs system amount
//     const initialStatus = offered >= system ? 'pending' : 'pending_approval';

//     // Create Hire document
//     const hire = await Hire.create({
//       client: clientId,
//       driver: driverId,
//       amount: system, 
//       description,                   // system minimum (for reference)
//       amountOffered: offered,            // client's actual offer
//       category,
//       date,
//       time,
//       durationHours: Number(durationHours),
//       address,
//       state,
//       lga,
//       country,
//       accommodation: !!accommodation,
//       benefits: benefits || '',
//       status: initialStatus,             // ← THIS IS THE KEY CHANGE
//       paymentStatus: 'pending',
//       requestedAt: new Date()
//     });

//     // Increment counters (optional)
//     await User.findByIdAndUpdate(clientId, { $inc: { timesHiredDrivers: 1 } });
//     await User.findByIdAndUpdate(driverId, { $inc: { timesHired: 1 } });

//     // Notify driver
//     sendNotification(
//       driverId,
//       `New hire request from ${req.user.firstName} ${req.user.lastName} - ${category}`
//     );

//     // Optional: notify admin if low offer
//     if (initialStatus === 'pending_approval') {
//       // You can notify superadmin here or just let them see it in pending list
//       console.log(`Low offer detected - hire ${hire._id} pending admin approval`);
//       // sendNotification(superAdminId, `Low offer hire request: ${hire._id}`);
//     }

//     res.status(201).json({
//       success: true,
//       message: initialStatus === 'pending_approval'
//         ? 'Hire request sent - pending admin approval due to low offer'
//         : 'Hire request sent successfully!',
//       hireId: hire._id,
//       status: initialStatus,
//       amountOffered: offered,
//       systemAmount: system,
//       needsAdminApproval: initialStatus === 'pending_approval'
//     });
//   } catch (err) {
//     console.error('sendHireRequest error:', err);
//     res.status(500).json({ success: false, message: err.message || 'Server error' });
//   }
// };

// // 2. Driver accepts a hire request
// export const acceptHire = async (req, res) => {
//   const driverId = req.user._id;
//   const { hireId } = req.params;

//   try {
//     // Find the hire
//     const hire = await Hire.findOne({
//       _id: hireId,
//       driver: driverId,
//        status: { $in: ['pending', 'pending_approval'] }
//     }).populate('client');

//     if (!hire) {
//       return res.status(404).json({ success: false, message: 'Hire request not found or already processed' });
//     }

//     // Create conversation immediately (as per your flow)
//     let conversation = await Conversation.findOne({ hireId: hire._id });

//     if (!conversation) {
//       conversation = await Conversation.create({
//         participants: [hire.client._id, driverId],
//         hireId: hire._id,
//         client: hire.client._id,
//         driver: driverId,
//         messages: [{
//           sender: null,
//           content: 'Chat started! You can now message each other about this hire.',
//           createdAt: new Date()
//         }]
//       });

//       conversation.lastMessage = {
//         content: 'Chat started!',
//         createdAt: new Date()
//       };

//       await conversation.save();
//     }

//     const conversationId = conversation._id;

//     const wasLowOffer = hire.status === 'pending_approval';

//     // Update hire
// if (hire.status === 'pending') {
//       hire.status = 'accepted';

//     } else if (hire.status === 'pending_approval') {
//       hire.status = 'accepted'; 
//     }
//     // } else if (hire.status === 'pending_approval') {
//     //   hire.status = 'awaiting_admin_approval'; 
//     // }
//     hire.acceptedAt = new Date();
//     hire.conversationId = conversationId;
//     await hire.save();

//     // Update driver's current status
//     await User.findByIdAndUpdate(driverId, { currentHireStatus: 'hired' });

//     // Notify client
//     sendNotification(hire.client, `Your hire request to ${req.user.firstName} ${req.user.lastName} has been accepted!`);

//     // Decide next step based on amount
//     const systemAmount = hire.amount || hire.amountOffered; // fallback if amount not set
//  if (wasLowOffer) {
//       return res.json({
//         success: true,
//         message: 'Hire accepted! Waiting for admin approval due to low offer.',
//         status: 'accepted_pending_approval',  // custom status for frontend
//         conversationId: conversationId.toString(),
//         paymentRequired: false,
//         needsAdminApproval: true
//       });
//     } else {
//       return res.json({
//         success: true,
//         message: 'Hire accepted - waiting for admin approval due to low offer',
//         status: 'accepted_pending_approval',
//         conversationId: conversationId.toString(),
//         paymentRequired: false
//       });
//     }
//   } catch (err) {
//     console.error('[acceptHire] Error:', err);
//     res.status(500).json({ success: false, message: err.message || 'Server error' });
//   }
// };

// // 3. Driver declines a hire request
// export const declineHire = async (req, res) => {
//   const driverId = req.user._id;
//   const { hireId } = req.params;

//   try {
//     const hire = await Hire.findOne({
//       _id: hireId,
//       driver: driverId,
//       status: 'pending'
//     });

//     if (!hire) {
//       return res.status(404).json({ success: false, message: 'Hire request not found or already processed' });
//     }

//     hire.status = 'declined';
//     await hire.save();

//     // Notify client
//     sendNotification(hire.client, `Your hire request to ${req.user.firstName} ${req.user.lastName} was declined.`);

//     res.json({ success: true, message: 'Hire request declined' });
//   } catch (err) {
//     console.error('[declineHire] Error:', err);
//     res.status(500).json({ success: false, message: err.message || 'Server error' });
//   }
// };

// // 4. End an active hire (driver or client)
// export const endHire = async (req, res) => {
//   const userId = req.user._id;
//   const { hireId } = req.params;
//   const { endReason } = req.body;

//   try {
//     const hire = await Hire.findOne({
//       _id: hireId,
//       $or: [{ client: userId }, { driver: userId }],
//       status: { $in: ['active', 'accepted'] }
//     });

//     if (!hire) {
//       return res.status(400).json({ success: false, message: 'No active hire to end' });
//     }

//     const now = new Date();
//     const durationMs = hire.durationHours * 3600000;
//     const expectedEnd = new Date(hire.acceptedAt?.getTime() + durationMs);
//     const endedEarly = now < expectedEnd;

//     hire.status = 'ended';
//     hire.endedAt = now;
//     hire.endedEarly = endedEarly;
//     if (endReason) hire.endReason = endReason;
//     await hire.save();

//     // Reset driver's current status
//     await User.findByIdAndUpdate(hire.driver, { currentHireStatus: 'available' });

//     // Notify the other party
//     const otherPartyId = userId.toString() === hire.client.toString() ? hire.driver : hire.client;
//     sendNotification(otherPartyId, `Hire ended by ${req.user.firstName} ${req.user.lastName}`);

//     res.json({ success: true, message: 'Hire ended successfully' });
//   } catch (err) {
//     console.error('[endHire] Error:', err);
//     res.status(500).json({ success: false, message: err.message || 'Server error' });
//   }
// };

// // 5. Submit rating after hire ends
// export const submitRating = async (req, res) => {
//   const { hireId, rating, review, comment } = req.body;
//   const fromUserId = req.user._id;

//   try {
//     const hire = await Hire.findById(hireId);
//     if (!hire || hire.status !== 'ended') {
//       return res.status(400).json({ success: false, message: 'Cannot rate active or non-ended hire' });
//     }

//     const toUserId = fromUserId.toString() === hire.client.toString() ? hire.driver : hire.client;

//     // Create rating
//     await Rating.create({
//       fromUser: fromUserId,
//       toUser: toUserId,
//       hireId: hire._id,
//       rating,
//       review,
//       comment
//     });

//     res.json({ success: true, message: 'Thank you for your feedback!' });
//   } catch (err) {
//     console.error('[submitRating] Error:', err);
//     res.status(500).json({ success: false, message: err.message || 'Server error' });
//   }
// };

// // 6. Client gets all their hires (sent requests + accepted)
// export const getMyHiredDrivers = async (req, res) => {
//   const clientId = req.user._id;

//   try {
//     const hires = await Hire.find({ client: clientId })
//       .populate('driver', 'firstName lastName state lga address email phone avatar rating vehicle')
//       .sort({ requestedAt: -1 });

//     res.json({
//       success: true,
//       count: hires.length,
//       hires
//     });
//   } catch (err) {
//     console.error('[getMyHiredDrivers] Error:', err);
//     res.status(500).json({ success: false, message: err.message || 'Server error' });
//   }
// };

// // 7. Driver gets all their hire requests
// export const getMyHireRequests = async (req, res) => {
//   const driverId = req.user._id;

//   try {
//     const hires = await Hire.find({ driver: driverId })
//       .populate('client', 'firstName lastName email phone avatar address state lga country')
//       .sort({ requestedAt: -1 });

//     res.json({
//       success: true,
//       count: hires.length,
//       requests: hires
//     });
//   } catch (err) {
//     console.error('[getMyHireRequests] Error:', err);
//     res.status(500).json({ success: false, message: err.message || 'Server error' });
//   }
// };


// export const initializeHirePayment = async (req, res) => {
//   const clientId = req.user._id;
//   const { hireId } = req.body;

//   try {
//     const hire = await Hire.findOne({
//       _id: hireId,
//       client: clientId,
//       status: 'accepted',
//       paymentStatus: 'pending'
//     }).populate('driver');

//     if (!hire) {
//       return res.status(400).json({
//         success: false,
//         message: 'Cannot pay: hire not accepted or already paid'
//       });
//     }

//     const pricing = await PricingConfig.findOne({
//       category: hire.category,
//       isActive: true
//     })

//     const callOutCharge = pricing?.callOutCharge || 0;

//     const totalAmount = hire.amountOffered + callOutCharge;
    
// const amountInKobo = Math.round(totalAmount * 100);
//     const reference = `hire-${hireId}-${Date.now()}`;

//     const payload = {
//       email: req.user.email,
//       amount: amountInKobo,
//       reference,
//       callback_url: `${process.env.BACKEND_URL}/api/hire/payment/verify/${reference}`,
//       metadata: {
//         hireId: hire._id.toString(),
//         clientId: clientId.toString(),
//         driverId: hire.driver._id.toString(),
//         amount: hire.amountOffered,
//         callOutCharge,
//         totalAmount
//       }
//     };

//     const response = await paystack.transaction.initialize(payload);

//     // Save reference
//     hire.paymentReference = reference;
//     hire.paymentStatus = 'pending';
//     await hire.save();

//     res.json({
//       success: true,
//       data: {
//         authorization_url: response.data.authorization_url,
//         reference,
//         amount: totalAmount,
//      breakdown: {
//     amountOffered: hire.amountOffered,
//     callOutCharge,
//     totalAmount
//   }
//       }
//     });
//   } catch (err) {
//     console.error('[initializeHirePayment] Error:', err);
//     res.status(500).json({ success: false, message: 'Payment initialization failed' });
//   }
// };


// // 9. Verify payment callback
// export const verifyHirePayment = async (req, res) => {
//   const { reference } = req.params;

//   try {
//     const verification = await paystack.transaction.verify(reference);

//     if (verification.data.status !== 'success') {
//       if (req.method === 'GET') {
//         return res.redirect(`${process.env.CLIENT_URL}/dashboard?status=failed`);
//       }
//       return res.status(200).json({ status: 'failed' });
//     }

//     const meta = verification.data.metadata;
//     const { hireId, clientId, driverId } = meta;

//     if (!hireId || !clientId || !driverId) {
//       if (req.method === 'GET') {
//         return res.redirect(`${process.env.CLIENT_URL}/dashboard?status=error`);
//       }
//       return res.status(200).json({ status: 'error' });
//     }

//     // Update hire
//     const hire = await Hire.findById(hireId);
//     if (hire && hire.paymentStatus === 'pending') {
//       hire.paymentStatus = 'paid';
//       hire.paidAt = new Date();
//       hire.paymentReference = reference;
//       hire.paymentTransactionId = verification.data.id;
//       hire.paymentAmount = verification.data.amount / 100;
//       hire.status = 'active'; // activate hire on successful payment
//       await hire.save();

//       // Notify driver
//       sendNotification(driverId, `Payment received for hire ${hireId}! You can now start.`);
//     }

//     if (req.method === 'GET') {
//       return res.redirect(`${process.env.CLIENT_URL}/dashboard?status=paid&hire=${hireId}`);
//     }

//     return res.status(200).json({ status: 'success' });
//   } catch (err) {
//     console.error('[verifyHirePayment] E rror:', err);
//     if (req.method === 'GET') {
//       return res.redirect(`${process.env.CLIENT_URL}/dashboard?status=error`);
//     }
//     return res.status(200).json({ status: 'error' });
//   }
// };
















// // Get Hire History for Driver or Client
// export const getHireHistory = async (req, res) => {
//   try {
//     const { userId } = req.params;        // or use req.user.id from auth middleware
//     const { role } = req.query;           // 'driver' or 'client'  (required)

//     if (!userId) {
//       return res.status(400).json({
//         status: false,
//         message: "User ID is required"
//       });
//     }

//     if (!role || !['driver', 'client'].includes(role)) {
//       return res.status(400).json({
//         status: false,
//         message: "Role query parameter is required and must be 'driver' or 'client'"
//       });
//     }

//     // Build query based on role
//     const query = role === 'driver' 
//       ? { driver: userId } 
//       : { client: userId };

//     const hireHistory = await Hire.find(query)
//       .sort({ createdAt: -1 })                    // Most recent first
//       .populate({
//         path: 'client',
//         model: 'User',
//         select: 'firstName lastName email phone avatar role status uniqueNumber isOnline lastSeen'
//       })
//       .populate({
//         path: 'driver',
//         model: 'User',
//         select: 'firstName lastName email phone avatar role status uniqueNumber isOnline lastSeen vehicle rating isVerified isCertified currentHireStatus isAvailable'
//       })
//       .lean();   // Better performance

//     if (!hireHistory || hireHistory.length === 0) {
//       return res.status(200).json({
//         status: true,
//         message: `No hire history found for this ${role}`,
//         data: [],
//         total: 0
//       });
//     }

//     // Optional: Enhance response with useful calculated fields
//     const enhancedHistory = hireHistory.map(hire => ({
//       ...hire,
//       // Add human-readable status
//       statusText: getStatusText(hire.status),
      
//       // Calculate duration in readable format
//       durationText: `${hire.durationHours} hour${hire.durationHours > 1 ? 's' : ''}`,

//       // Add who initiated the hire
//       initiatedBy: hire.client?._id.toString() === userId ? 'Client' : 'Driver',

//       // Time ago (optional helper)
//       requestedDaysAgo: Math.floor((Date.now() - new Date(hire.requestedAt)) / (1000 * 60 * 60 * 24))
//     }));

//     return res.status(200).json({
//       status: true,
//       message: `Hire history retrieved successfully for ${role}`,
//       data: enhancedHistory,
//       total: enhancedHistory.length,
//       role: role
//     });

//   } catch (error) {
//     console.error("Get Hire History Error:", error);
//     return res.status(500).json({
//       status: false,
//       message: "Server error while fetching hire history",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Helper function for readable status
// const getStatusText = (status) => {
//   const statusMap = {
//     pending: 'Pending Approval',
//     pending_approval: 'Pending Driver Approval',
//     awaiting_admin_approval: 'Awaiting Admin Approval',
//     accepted: 'Accepted',
//     active: 'Ongoing Hire',
//     ended: 'Completed',
//     declined: 'Declined',
//     cancelled: 'Cancelled',
//     rejected: 'Rejected'
//   };
//   return statusMap[status] || status;
// };











// export const getDriverHireCount = async (req, res) => {
//   try {
//     const userId = req.user._id;

//     // Ensure it's ObjectId (safe practice)
//     const driverId = new mongoose.Types.ObjectId(userId);

//     // Count only relevant statuses
//     const totalHire = await Hire.countDocuments({
//       driver: driverId,
//       status: { $in: ['accepted', 'active', 'ended'] }
//     });

//     return res.status(200).json({
//       success: true,
//       totalHire
//     });

//   } catch (error) {
//     console.error('Error getting driver hire count:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Server error'
//     });
//   }
// };













// controllers/hireController.js
import Hire from "../models/Hire.js";
import User from "../models/User.js";
import Conversation from "../models/Conversation.js";
import { sendNotification } from "../utils/sendNotification.js";

import Paystack from 'paystack';
import PricingConfig from "../models/pricingConfig.js"
import Rating from "../models/Rating.js"
import mongoose from "mongoose";
const paystack = Paystack(process.env.PAYSTACK_SECRET_KEY);

const CLIENT_URL = process.env.CLIENT_URL || process.env.FRONTEND_URL || 'https://edrivers.ng';

export const sendHireRequest = async (req, res) => {
  const clientId = req.user._id;
  const {
    driverId,
    durationHours,
    amountOffered,
    description,
    category,
    amount, // system calculated (minimum acceptable)
    address,
    date,
    time,
    state,
    lga,
    country = 'Nigeria',
    accommodation,
    benefits
  } = req.body;

  try {
    // Validate required fields
    if (!driverId || !durationHours || !address || !category || !amountOffered || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: driverId, durationHours, address, category, amountOffered, amount'
      });
    }

    // Convert to numbers safely
    const offered = Number(amountOffered);
    const system = Number(amount);

    if (isNaN(offered) || isNaN(system) || offered <= 0 || system <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount values'
      });
    }

    // Check driver
    const driver = await User.findById(driverId);
    if (!driver || driver.role !== 'driver') {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    if (driver.currentHireStatus === 'hired') {
      return res.status(400).json({ success: false, message: 'Driver is currently hired' });
    }

    // Determine initial status based on offer vs system amount
    const initialStatus = offered >= system ? 'pending' : 'pending_approval';

    // Create Hire document
    const hire = await Hire.create({
      client: clientId,
      driver: driverId,
      amount: system, 
      description,                   // system minimum (for reference)
      amountOffered: offered,            // client's actual offer
      category,
      date,
      time,
      durationHours: Number(durationHours),
      address,
      state,
      lga,
      country,
      accommodation: !!accommodation,
      benefits: benefits || '',
      status: initialStatus,             // ← THIS IS THE KEY CHANGE
      paymentStatus: 'pending',
      requestedAt: new Date()
    });

    // Increment counters (optional)
    await User.findByIdAndUpdate(clientId, { $inc: { timesHiredDrivers: 1 } });
    await User.findByIdAndUpdate(driverId, { $inc: { timesHired: 1 } });

    // ─── Notify driver: new booking request ───────────────────────────
    sendNotification(
      driverId,
      `New Hire Request from ${req.user.firstName} ${req.user.lastName}`,
      `${req.user.firstName} ${req.user.lastName} would like to book you as a ${category.replace('-', ' ')} driver.\n\n` +
      `Duration: ${durationHours} hours\n` +
      `Offered Amount: ₦${offered.toLocaleString()}\n` +
      `Pickup Address: ${address}\n` +
      (date ? `Date: ${new Date(date).toLocaleDateString('en-NG')}\n` : '') +
      (time ? `Time: ${time}\n` : '') +
      `\nPlease log in to accept or decline this request.`,
      { link: `${CLIENT_URL}/dashboard?tab=hire` }
    );

    // Optional: notify admin if low offer
    if (initialStatus === 'pending_approval') {
      // You can notify superadmin here or just let them see it in pending list
      console.log(`Low offer detected - hire ${hire._id} pending admin approval`);
      // sendNotification(superAdminId, `Low offer hire request: ${hire._id}`);
    }

    res.status(201).json({
      success: true,
      message: initialStatus === 'pending_approval'
        ? 'Hire request sent - pending admin approval due to low offer'
        : 'Hire request sent successfully!',
      hireId: hire._id,
      status: initialStatus,
      amountOffered: offered,
      systemAmount: system,
      needsAdminApproval: initialStatus === 'pending_approval'
    });
  } catch (err) {
    console.error('sendHireRequest error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

// 2. Driver accepts a hire request
export const acceptHire = async (req, res) => {
  const driverId = req.user._id;
  const { hireId } = req.params;

  try {
    // Find the hire
    const hire = await Hire.findOne({
      _id: hireId,
      driver: driverId,
       status: { $in: ['pending', 'pending_approval'] }
    }).populate('client');

    if (!hire) {
      return res.status(404).json({ success: false, message: 'Hire request not found or already processed' });
    }

    // Create conversation immediately (as per your flow)
    let conversation = await Conversation.findOne({ hireId: hire._id });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [hire.client._id, driverId],
        hireId: hire._id,
        client: hire.client._id,
        driver: driverId,
        messages: [{
          sender: null,
          content: 'Chat started! You can now message each other about this hire.',
          createdAt: new Date()
        }]
      });

      conversation.lastMessage = {
        content: 'Chat started!',
        createdAt: new Date()
      };

      await conversation.save();
    }

    const conversationId = conversation._id;

    const wasLowOffer = hire.status === 'pending_approval';

    // Update hire
if (hire.status === 'pending') {
      hire.status = 'accepted';

    } else if (hire.status === 'pending_approval') {
      hire.status = 'accepted'; 
    }
    // } else if (hire.status === 'pending_approval') {
    //   hire.status = 'awaiting_admin_approval'; 
    // }
    hire.acceptedAt = new Date();
    hire.conversationId = conversationId;
    await hire.save();

    // Update driver's current status
    await User.findByIdAndUpdate(driverId, { currentHireStatus: 'hired' });

    // ─── Notify client: driver accepted the request ────────────────────
    sendNotification(
      hire.client._id,
      `${req.user.firstName} ${req.user.lastName} Accepted Your Hire Request`,
      `Good news! ${req.user.firstName} ${req.user.lastName} has accepted your ${hire.category.replace('-', ' ')} hire request.\n\n` +
      (wasLowOffer
        ? `Your offer is below the suggested rate, so this booking is now awaiting admin approval before payment can proceed.\n\n`
        : `You can now proceed to payment to confirm the booking.\n\n`) +
      `You can also message ${req.user.firstName} directly from your dashboard.`,
      { link: `${CLIENT_URL}/dashboard?tab=myhiredrivers` }
    );

    // Decide next step based on amount
    const systemAmount = hire.amount || hire.amountOffered; // fallback if amount not set
 if (wasLowOffer) {
      return res.json({
        success: true,
        message: 'Hire accepted! Waiting for admin approval due to low offer.',
        status: 'accepted_pending_approval',  // custom status for frontend
        conversationId: conversationId.toString(),
        paymentRequired: false,
        needsAdminApproval: true
      });
    } else {
      return res.json({
        success: true,
        message: 'Hire accepted - waiting for admin approval due to low offer',
        status: 'accepted_pending_approval',
        conversationId: conversationId.toString(),
        paymentRequired: false
      });
    }
  } catch (err) {
    console.error('[acceptHire] Error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

// 3. Driver declines a hire request
export const declineHire = async (req, res) => {
  const driverId = req.user._id;
  const { hireId } = req.params;

  try {
    const hire = await Hire.findOne({
      _id: hireId,
      driver: driverId,
      status: 'pending'
    });

    if (!hire) {
      return res.status(404).json({ success: false, message: 'Hire request not found or already processed' });
    }

    hire.status = 'declined';
    await hire.save();

    // ─── Notify client: driver declined the request ────────────────────
    sendNotification(
      hire.client,
      `Hire Request Declined`,
      `${req.user.firstName} ${req.user.lastName} was unable to accept your ${hire.category.replace('-', ' ')} hire request for ${hire.durationHours} hours.\n\n` +
      `Don't worry — you can browse other available drivers and send a new request.`,
      { link: `${CLIENT_URL}/dashboard?tab=drivers` }
    );

    res.json({ success: true, message: 'Hire request declined' });
  } catch (err) {
    console.error('[declineHire] Error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

// 4. End an active hire (driver or client)
export const endHire = async (req, res) => {
  const userId = req.user._id;
  const { hireId } = req.params;
  const { endReason } = req.body;

  try {
    const hire = await Hire.findOne({
      _id: hireId,
      $or: [{ client: userId }, { driver: userId }],
      status: { $in: ['active', 'accepted'] }
    });

    if (!hire) {
      return res.status(400).json({ success: false, message: 'No active hire to end' });
    }

    const now = new Date();
    const durationMs = hire.durationHours * 3600000;
    const expectedEnd = new Date(hire.acceptedAt?.getTime() + durationMs);
    const endedEarly = now < expectedEnd;

    hire.status = 'ended';
    hire.endedAt = now;
    hire.endedEarly = endedEarly;
    if (endReason) hire.endReason = endReason;
    await hire.save();

    // Reset driver's current status
    await User.findByIdAndUpdate(hire.driver, { currentHireStatus: 'available' });

    // ─── Notify the other party: hire ended ─────────────────────────────
    const otherPartyId = userId.toString() === hire.client.toString() ? hire.driver : hire.client;
    sendNotification(
      otherPartyId,
      endedEarly ? 'Hire Ended Early' : 'Hire Completed',
      `Your ${hire.category.replace('-', ' ')} hire was ended by ${req.user.firstName} ${req.user.lastName}` +
      (endedEarly ? ' earlier than scheduled.' : '.') +
      (endReason ? `\n\nReason given: ${endReason}` : '') +
      `\n\nPlease take a moment to leave a rating for this hire from your dashboard.`,
      { link: `${CLIENT_URL}/dashboard?tab=hire` }
    );

    res.json({ success: true, message: 'Hire ended successfully' });
  } catch (err) {
    console.error('[endHire] Error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

// 5. Submit rating after hire ends
export const submitRating = async (req, res) => {
  const { hireId, rating, review, comment } = req.body;
  const fromUserId = req.user._id;

  try {
    const hire = await Hire.findById(hireId);
    if (!hire || hire.status !== 'ended') {
      return res.status(400).json({ success: false, message: 'Cannot rate active or non-ended hire' });
    }

    const toUserId = fromUserId.toString() === hire.client.toString() ? hire.driver : hire.client;

    // Create rating
    await Rating.create({
      fromUser: fromUserId,
      toUser: toUserId,
      hireId: hire._id,
      rating,
      review,
      comment
    });

    // ─── Notify the rated user: new rating received ─────────────────────
    sendNotification(
      toUserId,
      'You Received a New Rating',
      `${req.user.firstName} ${req.user.lastName} left you a ${rating}-star rating` +
      (review ? ` — "${review}"` : '') +
      `.\n\nKeep up the great work!`,
      { link: `${CLIENT_URL}/dashboard?tab=profile` }
    );

    res.json({ success: true, message: 'Thank you for your feedback!' });
  } catch (err) {
    console.error('[submitRating] Error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

// 6. Client gets all their hires (sent requests + accepted)
export const getMyHiredDrivers = async (req, res) => {
  const clientId = req.user._id;

  try {
    const hires = await Hire.find({ client: clientId })
      .populate('driver', 'firstName lastName state lga address email phone avatar rating vehicle')
      .sort({ requestedAt: -1 });

    res.json({
      success: true,
      count: hires.length,
      hires
    });
  } catch (err) {
    console.error('[getMyHiredDrivers] Error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

// 7. Driver gets all their hire requests
export const getMyHireRequests = async (req, res) => {
  const driverId = req.user._id;

  try {
    const hires = await Hire.find({ driver: driverId })
      .populate('client', 'firstName lastName email phone avatar address state lga country')
      .sort({ requestedAt: -1 });

    res.json({
      success: true,
      count: hires.length,
      requests: hires
    });
  } catch (err) {
    console.error('[getMyHireRequests] Error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};


export const initializeHirePayment = async (req, res) => {
  const clientId = req.user._id;
  const { hireId } = req.body;

  try {
    const hire = await Hire.findOne({
      _id: hireId,
      client: clientId,
      status: 'accepted',
      paymentStatus: 'pending'
    }).populate('driver');

    if (!hire) {
      return res.status(400).json({
        success: false,
        message: 'Cannot pay: hire not accepted or already paid'
      });
    }

    const pricing = await PricingConfig.findOne({
      category: hire.category,
      isActive: true
    })

    const callOutCharge = pricing?.callOutCharge || 0;

    const totalAmount = hire.amountOffered + callOutCharge;
    
const amountInKobo = Math.round(totalAmount * 100);
    const reference = `hire-${hireId}-${Date.now()}`;

    const payload = {
      email: req.user.email,
      amount: amountInKobo,
      reference,
      callback_url: `${process.env.BACKEND_URL}/api/hire/payment/verify/${reference}`,
      metadata: {
        hireId: hire._id.toString(),
        clientId: clientId.toString(),
        driverId: hire.driver._id.toString(),
        amount: hire.amountOffered,
        callOutCharge,
        totalAmount
      }
    };

    const response = await paystack.transaction.initialize(payload);

    // Save reference
    hire.paymentReference = reference;
    hire.paymentStatus = 'pending';
    await hire.save();

    res.json({
      success: true,
      data: {
        authorization_url: response.data.authorization_url,
        reference,
        amount: totalAmount,
     breakdown: {
    amountOffered: hire.amountOffered,
    callOutCharge,
    totalAmount
  }
      }
    });
  } catch (err) {
    console.error('[initializeHirePayment] Error:', err);
    res.status(500).json({ success: false, message: 'Payment initialization failed' });
  }
};


// 9. Verify payment callback
export const verifyHirePayment = async (req, res) => {
  const { reference } = req.params;

  try {
    const verification = await paystack.transaction.verify(reference);

    if (verification.data.status !== 'success') {
      if (req.method === 'GET') {
        return res.redirect(`${process.env.CLIENT_URL}/dashboard?status=failed`);
      }
      return res.status(200).json({ status: 'failed' });
    }

    const meta = verification.data.metadata;
    const { hireId, clientId, driverId } = meta;

    if (!hireId || !clientId || !driverId) {
      if (req.method === 'GET') {
        return res.redirect(`${process.env.CLIENT_URL}/dashboard?status=error`);
      }
      return res.status(200).json({ status: 'error' });
    }

    // Update hire
    const hire = await Hire.findById(hireId).populate('client', 'firstName lastName');
    if (hire && hire.paymentStatus === 'pending') {
      hire.paymentStatus = 'paid';
      hire.paidAt = new Date();
      hire.paymentReference = reference;
      hire.paymentTransactionId = verification.data.id;
      hire.paymentAmount = verification.data.amount / 100;
      hire.status = 'active'; // activate hire on successful payment
      await hire.save();

      const clientName = hire.client
        ? `${hire.client.firstName} ${hire.client.lastName}`
        : 'your client';
      const paidAmount = hire.paymentAmount.toLocaleString();

      // ─── Notify driver: payment received, hire is now active ───────────
      sendNotification(
        driverId,
        'Payment Received — Hire is Now Active',
        `${clientName} has completed payment of ₦${paidAmount} for your ${hire.category.replace('-', ' ')} hire.\n\n` +
        `The hire is now active. You can start whenever agreed with the client.`,
        { link: `${CLIENT_URL}/dashboard?tab=hire` }
      );

      // ─── Notify client: payment confirmation ────────────────────────────
      sendNotification(
        clientId,
        'Payment Successful',
        `Your payment of ₦${paidAmount} has been confirmed.\n\n` +
        `Your driver has been notified and your hire is now active.`,
        { link: `${CLIENT_URL}/dashboard?tab=myhiredrivers` }
      );
    }

    if (req.method === 'GET') {
      return res.redirect(`${process.env.CLIENT_URL}/dashboard?status=paid&hire=${hireId}`);
    }

    return res.status(200).json({ status: 'success' });
  } catch (err) {
    console.error('[verifyHirePayment] E rror:', err);
    if (req.method === 'GET') {
      return res.redirect(`${process.env.CLIENT_URL}/dashboard?status=error`);
    }
    return res.status(200).json({ status: 'error' });
  }
};
















// Get Hire History for Driver or Client
export const getHireHistory = async (req, res) => {
  try {
    const { userId } = req.params;        // or use req.user.id from auth middleware
    const { role } = req.query;           // 'driver' or 'client'  (required)

    if (!userId) {
      return res.status(400).json({
        status: false,
        message: "User ID is required"
      });
    }

    if (!role || !['driver', 'client'].includes(role)) {
      return res.status(400).json({
        status: false,
        message: "Role query parameter is required and must be 'driver' or 'client'"
      });
    }

    // Build query based on role
    const query = role === 'driver' 
      ? { driver: userId } 
      : { client: userId };

    const hireHistory = await Hire.find(query)
      .sort({ createdAt: -1 })                    // Most recent first
      .populate({
        path: 'client',
        model: 'User',
        select: 'firstName lastName email phone avatar role status uniqueNumber isOnline lastSeen'
      })
      .populate({
        path: 'driver',
        model: 'User',
        select: 'firstName lastName email phone avatar role status uniqueNumber isOnline lastSeen vehicle rating isVerified isCertified currentHireStatus isAvailable'
      })
      .lean();   // Better performance

    if (!hireHistory || hireHistory.length === 0) {
      return res.status(200).json({
        status: true,
        message: `No hire history found for this ${role}`,
        data: [],
        total: 0
      });
    }

    // Optional: Enhance response with useful calculated fields
    const enhancedHistory = hireHistory.map(hire => ({
      ...hire,
      // Add human-readable status
      statusText: getStatusText(hire.status),
      
      // Calculate duration in readable format
      durationText: `${hire.durationHours} hour${hire.durationHours > 1 ? 's' : ''}`,

      // Add who initiated the hire
      initiatedBy: hire.client?._id.toString() === userId ? 'Client' : 'Driver',

      // Time ago (optional helper)
      requestedDaysAgo: Math.floor((Date.now() - new Date(hire.requestedAt)) / (1000 * 60 * 60 * 24))
    }));

    return res.status(200).json({
      status: true,
      message: `Hire history retrieved successfully for ${role}`,
      data: enhancedHistory,
      total: enhancedHistory.length,
      role: role
    });

  } catch (error) {
    console.error("Get Hire History Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error while fetching hire history",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Helper function for readable status
const getStatusText = (status) => {
  const statusMap = {
    pending: 'Pending Approval',
    pending_approval: 'Pending Driver Approval',
    awaiting_admin_approval: 'Awaiting Admin Approval',
    accepted: 'Accepted',
    active: 'Ongoing Hire',
    ended: 'Completed',
    declined: 'Declined',
    cancelled: 'Cancelled',
    rejected: 'Rejected'
  };
  return statusMap[status] || status;
};

export const getDriverHireCount = async (req, res) => {
  try {
    const userId = req.user._id;

    // Ensure it's ObjectId (safe practice)
    const driverId = new mongoose.Types.ObjectId(userId);

    // Count only relevant statuses
    const totalHire = await Hire.countDocuments({
      driver: driverId,
      status: { $in: ['accepted', 'active', 'ended'] }
    });

    return res.status(200).json({
      success: true,
      totalHire
    });

  } catch (error) {
    console.error('Error getting driver hire count:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};











export const getRatingSummary = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    const toUserId = new mongoose.Types.ObjectId(userId);

    const [summary] = await Rating.aggregate([
      { $match: { toUser: toUserId } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalRatings: { $sum: 1 },
          fiveStar: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          fourStar: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          threeStar: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          twoStar: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          oneStar: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
        },
      },
    ]);

    if (!summary) {
      return res.json({
        success: true,
        summary: {
          averageRating: 0,
          totalRatings: 0,
          breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        },
      });
    }

    res.json({
      success: true,
      summary: {
        averageRating: Math.round(summary.averageRating * 10) / 10,
        totalRatings: summary.totalRatings,
        breakdown: {
          5: summary.fiveStar,
          4: summary.fourStar,
          3: summary.threeStar,
          2: summary.twoStar,
          1: summary.oneStar,
        },
      },
    });
  } catch (err) {
    console.error('getRatingSummary error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch rating summary' });
  }
};

// GET /api/ratings/user/:userId?page=1&limit=10
// Returns paginated list of reviews left FOR this user, with reviewer info
export const getUserRatings = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    const skip = (page - 1) * limit;

    const [ratings, total] = await Promise.all([
      Rating.find({ toUser: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('fromUser', 'firstName lastName profilePicture avatar')
        .lean(),
      Rating.countDocuments({ toUser: userId }),
    ]);

    res.json({
      success: true,
      ratings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + ratings.length < total,
      },
    });
  } catch (err) {
    console.error('getUserRatings error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch ratings' });
  }
};