// controllers/hireondemandController.js
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import SubscriptionPlan from '../models/SubscriptionPlan.js';
import axios from 'axios';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

// ──────────────────────────────────────────────────────────────
// 1. Driver subscribes to Hire on Demand (dynamic amount)
// ──────────────────────────────────────────────────────────────
export const subscribeHireOnDemand = async (req, res) => {
  const driverId = req.user._id;
  const { plan, serviceLevel } = req.body; // 'within-state'/'interstate', 'chauffeur'/'premium'

  console.log('Subscribe request body:', req.body);

  try {
    // 1. Validate user is a driver
    const driver = await User.findById(driverId);
    if (!driver || driver.role !== 'driver') {
      return res.status(403).json({ success: false, message: 'Only drivers can subscribe' });
    }

    // 2. Prevent duplicate active/pending subscription
    const existing = await Subscription.findOne({
      user: driverId,
      type: 'hire_on_demand',
      subscriptionStatus: { $in: ['pending', 'approved', 'active'] }
    });

    console.log('Existing subscription:', existing);

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `You already have a ${existing.subscriptionStatus} Hire on Demand subscription`
      });
    }

    // 3. Get the plan configuration from SubscriptionPlan
    const planConfig = await SubscriptionPlan.findOne({
      type: 'hire_on_demand',
      planName: serviceLevel, // e.g. 'chauffeur', 'premium'
      isActive: true
    });

    console.log('Plan config:', planConfig);

    if (!planConfig) {
      return res.status(404).json({
        success: false,
        message: 'Selected subscription plan is not available. Contact admin.'
      });
    }

    // 4. Initialize Paystack payment
    const paystackRes = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: driver.email,
        amount: planConfig.amount * 100, // convert to kobo
        reference: `hod_sub_${Date.now()}_${driverId}`,
        callback_url: `${process.env.BACKEND_URL}/api/hire-on-demand/callback`,
        metadata: {
          driverId: driverId.toString(),
          plan,
          serviceLevel,
          purpose: 'hire_on_demand_subscription'
        }
      },
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
    );

    if (!paystackRes.data.data?.authorization_url) {
      throw new Error('Paystack did not return a valid authorization URL');
    }

    // 5. Create pending subscription record
    const subscription = await Subscription.create({
      user: driverId,
      type: 'hire_on_demand',
      package: plan,                  // 'within-state' or 'interstate'
      serviceLevel,                   // 'chauffeur' or 'premium'
      subscriptionAmount: planConfig.amount,
      paymentRef: paystackRes.data.data.reference,
      subscriptionStatus: 'pending',
      subscribedAt: new Date()
    });

    res.json({
      success: true,
      authorization_url: paystackRes.data.data.authorization_url,
      reference: paystackRes.data.data.reference,
      amount: planConfig.amount,
      currency: planConfig.currency || 'NGN',
      subscriptionId: subscription._id
    });
  } catch (err) {
    console.error('Subscribe Hire on Demand error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error during subscription'
    });
  }
};
// ──────────────────────────────────────────────────────────────
// 2. Paystack callback verification for subscription
// ──────────────────────────────────────────────────────────────
export const verifySubscriptionCallback = async (req, res) => {
  const { reference } = req.query;

  if (!reference) {
    console.error('Callback received without reference');
    return res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  }

  try {
    const verifyRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
    );

    const paymentData = verifyRes.data.data;

    if (paymentData.status === 'success') {
      const { driverId, plan, serviceLevel } = paymentData.metadata || {};

      if (!driverId) {
        console.error('Missing driverId in metadata');
        return res.redirect(`${process.env.CLIENT_URL}/dashboard`);
      }

      // 1. Find and update the subscription record
      const subscription = await Subscription.findOneAndUpdate(
        { paymentRef: reference, user: driverId },
        {
          subscriptionStatus: 'pending', // still needs admin approval
          approvedAt: null,
          // You can also save more payment details if needed
          paymentVerifiedAt: new Date(),
          paymentResponse: paymentData
        },
        { new: true }
      );

      if (!subscription) {
        console.error(`No subscription found for reference: ${reference}`);
        return res.redirect(`${process.env.CLIENT_URL}/dashboard`);
      }

      // 2. Optional: Update user flag if you still want it (but not required)
      // await User.findByIdAndUpdate(driverId, {
      //   'hireOnDemand.subscribed': true,
      //   'hireOnDemand.subscriptionStatus': 'pending',
      //   'hireOnDemand.subscribedAt': new Date(),
      //   'hireOnDemand.paymentRef': reference
      // });

      console.log(`Payment verified for driver ${driverId}, subscription ${subscription._id}`);

      return res.redirect(`${process.env.CLIENT_URL}/dashboard`);
    }

    console.log(`Payment failed for reference: ${reference}`, paymentData);
    return res.redirect(`${process.env.CLIENT_URL}/driver/hire-on-demand?status=failed`);
  } catch (err) {
    console.error('Paystack verification error:', err);
    return res.redirect(`${process.env.CLIENT_URL}/driver/hire-on-demand?status=error`);
  }
};
// ──────────────────────────────────────────────────────────────
// 3. Superadmin approves/declines subscription
// ──────────────────────────────────────────────────────────────
// export const manageSubscription = async (req, res) => {
//   const { driverId } = req.params;
//   const { action, reason } = req.body; // action: 'approve' or 'decline'

//   try {
//     const driver = await User.findById(driverId);
//     if (!driver || driver.role !== 'driver') {
//       return res.status(404).json({ success: false, message: 'Driver not found' });
//     }

//     if (action === 'approve') {
//       driver.hireOnDemand.subscriptionStatus = 'approved';
//       driver.hireOnDemand.approvedAt = new Date();
//     } else if (action === 'decline') {
//       driver.hireOnDemand.subscriptionStatus = 'declined';
//       driver.hireOnDemand.declinedAt = new Date();
//       driver.hireOnDemand.declineReason = reason;
//     }

//     await driver.save();

//     res.json({
//       success: true,
//       message: `Subscription ${action}d successfully`,
//       subscriptionStatus: driver.hireOnDemand.subscriptionStatus
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// ──────────────────────────────────────────────────────────────
// 4. Client requests Hire on Demand (dynamic amount)
// ──────────────────────────────────────────────────────────────
export const requestHireOnDemandDriver = async (req, res) => {
  const { driverId } = req.body;
  const clientId = req.user._id;

  try {
    const driver = await User.findById(driverId);
    if (!driver || driver.role !== 'driver') {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    if (driver.hireOnDemand?.subscriptionStatus !== 'approved') {
      return res.status(400).json({ success: false, message: 'Driver not approved for Hire on Demand' });
    }

    if (driver.currentHireOnDemandJob) {
      return res.status(400).json({ success: false, message: 'Driver is already hired' });
    }

    // Get admin-set hire fee (you can store this in SubscriptionPlan or a separate setting)
    // For now, assume it's fixed or fetched from a setting
    const hireFee = 5000; // ← Replace with dynamic fetch later

    const paystackRes = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: req.user.email,
        amount: hireFee * 100,
        reference: `hod_hire_${Date.now()}_${clientId}`,
        callback_url: `${process.env.CLIENT_URL}/client/hire-on-demand/callback`,
        metadata: {
          clientId: clientId.toString(),
          driverId: driverId.toString(),
          purpose: 'hire_on_demand_payment'
        }
      },
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
    );

    res.json({
      success: true,
      authorization_url: paystackRes.data.data.authorization_url,
      reference: paystackRes.data.data.reference,
      amount: hireFee
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ──────────────────────────────────────────────────────────────
// 5. Verify client hire payment & activate job
// ──────────────────────────────────────────────────────────────
export const verifyHireOnDemandPayment = async (req, res) => {
  const { reference } = req.query;

  try {
    const verifyRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
    );

    if (verifyRes.data.data.status !== 'success') {
      return res.redirect(`${process.env.CLIENT_URL}/client/hire-on-demand?status=failed`);
    }

    const { clientId, driverId } = verifyRes.data.data.metadata;

    const client = await User.findById(clientId);
    const driver = await User.findById(driverId);

    if (!client || !driver) {
      return res.redirect(`${process.env.CLIENT_URL}/client/hire-on-demand?status=error`);
    }

    // Activate hire
    driver.currentHireOnDemandJob = {
      client: clientId,
      status: 'active',
      startedAt: new Date(),
      amountPaid: 5000, // ← replace with dynamic if needed
      paymentRef: reference,
      travelType: driver.hireOnDemand.plan,
      serviceLevel: driver.hireOnDemand.serviceLevel
    };

    await driver.save();

    res.redirect(`${process.env.CLIENT_URL}/client/hire-on-demand?status=success`);
  } catch (err) {
    res.redirect(`${process.env.CLIENT_URL}/client/hire-on-demand?status=error`);
  }
};

// ──────────────────────────────────────────────────────────────
// 6. Get approved Hire on Demand drivers (for clients)
// ──────────────────────────────────────────────────────────────
export const getHireOnDemandDrivers = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({
      type: 'hire_on_demand',
      subscriptionStatus: { $in: ['approved', 'active'] },
    })
      .sort({ updatedAt: -1 })
      .populate({
        path: 'user',
        match: {
          role: 'driver',
          isActive: true,
          isDeleted: { $ne: true },
          // isAvailable: true, // only show drivers who can actually be booked right now
        },
        select: 'firstName lastName avatar phone vehicle rating totalTrips isCertified isAvailable state lga',
      })
      .lean();
 
    // Dedupe by driver — keep the first (most recently updated) subscription
    // per user, and drop entries where the populate `match` filtered the
    // user out (e.g. subscription belongs to a non-driver, inactive, or
    // currently-unavailable user).
    const seenDrivers = new Set();
    const drivers = [];
 
    for (const sub of subscriptions) {
      if (!sub.user) continue; // filtered out by populate match
 
      const driverId = sub.user._id.toString();
      if (seenDrivers.has(driverId)) continue;
      seenDrivers.add(driverId);
 
      drivers.push({
        ...sub.user,
        subscription: {
          package: sub.package,
          serviceLevel: sub.serviceLevel,
          subscriptionStatus: sub.subscriptionStatus,
          onDemandDetails: sub.onDemandDetails,
          subscribedAt: sub.subscribedAt,
          approvedAt: sub.approvedAt,
          expiresAt: sub.expiresAt,
        },
      });
    }
    
 
    res.json({ success: true, count: drivers.length, drivers });
  } catch (err) {
    console.error('[getHireOnDemandDrivers] Error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};
 



export const getPendingSubscriptions = async (req, res) => {
  try {
    const pendingDrivers = await User.find({
      role: 'driver',
      'hireOnDemand.subscriptionStatus': 'pending'
    })
      .select(
        'firstName lastName email phone avatar hireOnDemand.subscribedAt hireOnDemand.plan hireOnDemand.serviceLevel hireOnDemand.paymentRef'
      )
      .sort({ 'hireOnDemand.subscribedAt': -1 })
      .lean();

    if (!pendingDrivers.length) {
      return res.json({
        success: true,
        message: 'No pending subscriptions at the moment',
        count: 0,
        pendingSubscriptions: []
      });
    }

    // Format response for better frontend consumption
    const formatted = pendingDrivers.map(driver => ({
      driverId: driver._id,
      name: `${driver.firstName} ${driver.lastName}`,
      email: driver.email,
      phone: driver.phone,
      avatar: driver.avatar,
      plan: driver.hireOnDemand.plan,
      serviceLevel: driver.hireOnDemand.serviceLevel,
      subscribedAt: driver.hireOnDemand.subscribedAt,
      paymentRef: driver.hireOnDemand.paymentRef,
      status: 'pending'
    }));

    res.json({
      success: true,
      count: formatted.length,
      pendingSubscriptions: formatted
    });
  } catch (error) {
    console.error('Get pending subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching pending subscriptions'
    });
  }
};


export const manageSubscription = async (req, res) => {
  const { driverId } = req.params;
  const { action, reason } = req.body; // action: 'approve' or 'decline', reason only for decline

  if (!['approve', 'decline'].includes(action)) {
    return res.status(400).json({ success: false, message: 'Invalid action. Use "approve" or "decline"' });
  }

  try {
    const driver = await User.findById(driverId);
    if (!driver || driver.role !== 'driver') {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    // if (driver.hireOnDemand?.subscriptionStatus !== 'pending') {
    //   return res.status(400).json({
    //     success: false,
    //     message: `Subscription is already ${driver.hireOnDemand.subscriptionStatus}`
    //   });
    // }
if (action === 'approve') {
    await Subscription.findOneAndUpdate(
    { user: driverId, type: 'hire_on_demand', subscriptionStatus: 'pending' },
    {
      subscriptionStatus: 'active',
      approvedAt: new Date(),
    }
  );

 
} else {
  await Subscription.findOneAndUpdate(
    { user: driverId, type: 'hire_on_demand', subscriptionStatus: 'pending' },
    {
      subscriptionStatus: 'declined',
      declinedAt: new Date(),
      declineReason: reason || 'No reason provided',
    }
  );

  // driver.hireOnDemand.subscriptionStatus = 'declined';
  // driver.hireOnDemand.declinedAt = new Date();
  // driver.hireOnDemand.declineReason = reason;
}
    await driver.save();
   

    res.json({
      success: true,
      message: `Subscription ${action}d successfully`,
      // subscriptionStatus: driver.hireOnDemand.subscriptionStatus,
      // declineReason: driver.hireOnDemand.declineReason || null
    });
  } catch (err) {
    console.error('Manage subscription error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};





 
export const getAllHireOnDemandRequests = async (req, res) => {
  try {
    // Find drivers who have an active/current hire on demand job
    const activeHires = await User.find({
      role: 'driver',
      currentHireOnDemandJob: { $ne: null },
   
    })
      .populate({
        path: 'currentHireOnDemandJob.client',
        select: 'firstName lastName email phone avatar'
      })
      .select(
        'firstName lastName avatar phone vehicle rating hireOnDemand currentHireOnDemandJob'
      )
      .sort({ 'currentHireOnDemandJob.startedAt': -1 })
      .lean();

    if (!activeHires.length) {
      return res.json({
        success: true,
        message: 'No active Hire on Demand jobs at the moment',
        count: 0,
        activeRequests: []
      });
    }

    // Format response for clean frontend consumption
    const formattedRequests = activeHires.map(driver => ({
      jobId: driver._id.toString() + '-hod-active',
      driver: {
        id: driver._id,
        name: `${driver.firstName} ${driver.lastName}`,
        avatar: driver.avatar || null,
        phone: driver.phone,
        vehicle: driver.vehicle || null,
        rating: driver.rating || 0
      },
      client: driver.currentHireOnDemandJob.client
        ? {
            id: driver.currentHireOnDemandJob.client._id,
            name: `${driver.currentHireOnDemandJob.client.firstName} ${driver.currentHireOnDemandJob.client.lastName}`,
            email: driver.currentHireOnDemandJob.client.email,
            phone: driver.currentHireOnDemandJob.client.phone,
            avatar: driver.currentHireOnDemandJob.client.avatar || null
          }
        : null,
      job: {
        status: driver.currentHireOnDemandJob.status,
        startedAt: driver.currentHireOnDemandJob.startedAt,
        amountPaid: driver.currentHireOnDemandJob.amountPaid,
        paymentRef: driver.currentHireOnDemandJob.paymentRef,
        travelType: driver.currentHireOnDemandJob.travelType,
        serviceLevel: driver.currentHireOnDemandJob.serviceLevel
      },
      driverPlan: driver.hireOnDemand?.plan || 'unknown',
      driverServiceLevel: driver.hireOnDemand?.serviceLevel || 'unknown'
    }));

    res.json({
      success: true,
      count: formattedRequests.length,
      activeRequests: formattedRequests
    });
  } catch (error) {
    console.error('Get all HOD active requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching active hire requests'
    });
  }
};




export const checkHireOnDemandSubscriptionStatus = async (req, res) => {
  const driverId = req.user._id;

  try {
    // Verify user is a driver
    const driver = await User.findById(driverId);
    if (!driver || driver.role !== 'driver') {
      return res.status(403).json({
        success: false,
        message: 'Only drivers can check Hire on Demand subscription status'
      });
    }

    // Get subscription status from User model (hireOnDemand subdocument)
    const hireOnDemand = driver.hireOnDemand || {
      subscribed: false,
      subscriptionStatus: 'inactive',
      subscribedAt: null,
      approvedAt: null,
      declinedAt: null,
      declineReason: null,
      paymentRef: null,
      plan: null,
      serviceLevel: null
    };

    // Optional: Also check Subscription model for more details
    const subscription = await Subscription.findOne({
      user: driverId,
      type: 'hire_on_demand'
    }).sort({ createdAt: -1 }); // most recent

    const responseData = {
      subscribed: hireOnDemand.subscribed || false,
      subscriptionStatus: hireOnDemand.subscriptionStatus || 'inactive',
      plan: hireOnDemand.plan || null,
      serviceLevel: hireOnDemand.serviceLevel || null,
      subscribedAt: hireOnDemand.subscribedAt || null,
      approvedAt: hireOnDemand.approvedAt || null,
      declinedAt: hireOnDemand.declinedAt || null,
      declineReason: hireOnDemand.declineReason || null,
      paymentRef: hireOnDemand.paymentRef || null,
      // Extra info from Subscription model (if exists)
      subscriptionAmount: subscription?.subscriptionAmount || null,
      currency: subscription?.currency || 'NGN',
      createdAt: subscription?.createdAt || null
    };

    res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Check HOD subscription status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking subscription status'
    });
  }
};






export const getSubscriptionStatus = async (req, res) => {
  try {
    const sub = await Subscription.findOne({
      user: req.user._id,
      type: 'hire_on_demand'
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      subscribed: !!sub,
      status: sub?.subscriptionStatus || 'none',
      amount: sub?.subscriptionAmount || null,
      plan: sub?.package || null,
      serviceLevel: sub?.serviceLevel || null
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};




// Recommended new endpoint: /api/vetted-drivers/hod-subscribers
// or reuse /api/vetted-drivers with ?type=hire_on_demand

export const getHireOnDemandSubscribers = async (req, res) => {
  try {
    // 1. Find active/approved Hire on Demand subscriptions
    const activeSubscriptions = await Subscription.find({
      type: 'hire_on_demand',
      subscriptionStatus: { $in: ['active', 'approved', 'pending'] }, // adjust based on your final status
      $or: [
        { expiresAt: { $gt: new Date() } }, // still valid
        { expiresAt: null }                 // no expiration (lifetime?)
      ]
    })
      .select('user subscribedAt approvedAt package serviceLevel subscriptionAmount    subscriptionStatus' )
      .sort({ approvedAt: -1, subscribedAt: -1 })
      .lean();

    if (activeSubscriptions.length === 0) {
      return res.json({
        success: true,
        message: 'No active Hire on Demand subscribers at the moment',
        count: 0,
        subscribers: []
      });
    }

    // 2. Get unique driver IDs
    const driverIds = [...new Set(activeSubscriptions.map(s => s.user.toString()))];

    // 3. Fetch driver User documents
    const drivers = await User.find({ _id: { $in: driverIds }, role: 'driver' })
      .select(
        'firstName lastName phone avatar location rating totalTrips vehicle isCertified createdAt'
      )
      .lean();

    // 4. Create lookup map for subscription info
    const subMap = new Map();
    activeSubscriptions.forEach(sub => {
      const key = sub.user.toString();
      subMap.set(key, {
        status: sub.subscriptionStatus,
        subscriptionId: sub._id,
        package: sub.package,
        serviceLevel: sub.serviceLevel,
        amount: sub.subscriptionAmount,
        subscribedAt: sub.subscribedAt,
        approvedAt: sub.approvedAt
      });
    });

    // 5. Enrich drivers with subscription data
    const enriched = drivers.map(driver => {
      const subInfo = subMap.get(driver._id.toString()) || null;

      return {
        ...driver,
        hireOnDemandSubscription: subInfo
          ? {
              status:subInfo.status,
              package: subInfo.package,
              serviceLevel: subInfo.serviceLevel,
              amountPaid: subInfo.amount,
              subscribedAt: subInfo.subscribedAt,
              approvedAt: subInfo.approvedAt
            }
          : null
      };
    });

    res.json({
      success: true,
      count: enriched.length,
      subscribers: enriched
    });
  } catch (err) {
    console.error('Get HOD subscribers error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};