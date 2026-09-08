// backend/controllers/fulltimeHireController.js
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import axios from 'axios';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

// 1. Driver subscribes to full-time hire plan
export const subscribeFulltimeHire = async (req, res) => {
  const driverId = req.user._id;
  const { packageType } = req.body; // 'premium', 'classic', 'gold', 'chauffeur'

  const amounts = {
    premium: 300000,    // ₦300,000 in kobo
    classic: 200000,
    gold: 500000,
    chauffeur: 400000,
  };

  const amount = amounts[packageType];
  if (!amount) {
    return res.status(400).json({ success: false, message: 'Invalid package type' });
  }

  try {
    // Validate driver
    const driver = await User.findById(driverId);
    if (!driver || driver.role !== 'driver') {
      return res.status(403).json({ success: false, message: 'Only drivers can subscribe' });
    }

    // Prevent duplicate pending/active subscription
    const existing = await Subscription.findOne({
      user: driverId,
      type: 'fulltime_hire',
      subscriptionStatus: { $in: ['pending', 'approved', 'active'] }
    });

    if (existing) {
    
      return res.status(400).json({
        success: false,
        message: `You already have a ${existing.subscriptionStatus} full-time hire subscription`
      });
    }

    // Initialize Paystack
    const paystackRes = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: driver.email,
        amount: amount * 100, // to kobo
        reference: `fulltime_sub_${Date.now()}_${driverId}`,
        callback_url: `${process.env.BACKEND_URL}/api/fulltime-hire/callback`,
        metadata: {
          driverId: driverId.toString(),
          packageType,
          purpose: 'fulltime_hire_subscription'
        }
      },
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
    );

    // Create pending subscription record
    const subscription = await Subscription.create({
      user: driverId,
      type: 'fulltime_hire',
      package: packageType,
      subscriptionAmount: amount,
      paymentRef: paystackRes.data.data.reference,
      subscriptionStatus: 'pending',
      subscribedAt: new Date()
    });

    res.json({
      success: true,
      authorization_url: paystackRes.data.data.authorization_url,
      reference: paystackRes.data.data.reference,
      amount,
      currency: 'NGN',
      subscriptionId: subscription._id
    });
  } catch (err) {
    console.error('Fulltime subscribe error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

// 2. Paystack callback for full-time subscription
export const verifyFulltimeSubscription = async (req, res) => {
  const { reference } = req.query;

  if (!reference) {
    return res.redirect(`${process.env.BACKEND_URL}/api/fulltime-hire/callback`);
  }

  try {
    const verifyRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
    );

    if (verifyRes.data.data.status === 'success') {
      const { driverId, packageType } = verifyRes.data.data.metadata;

      // Update subscription to pending (awaiting admin approval)
      await Subscription.findOneAndUpdate(
        { paymentRef: reference, user: driverId },
        {
          subscriptionStatus: 'pending',
          paymentVerifiedAt: new Date(),
          paymentResponse: verifyRes.data.data
        }
      );

      return res.redirect(`${process.env.CLIENT_URL}/dashboard?status=success`);
    }

    return res.redirect(`${process.env.CLIENT_URL}/dashboard?status=failed`);
  } catch (err) {
    console.error('Fulltime verification error:', err);
    return res.redirect(`${process.env.CLIENT_URL}/driver/fulltime-subscription?status=error`);
  }
};

// 3. Admin: Approve or Decline pending full-time subscription
export const manageFulltimeSubscription = async (req, res) => {
  const { subscriptionId } = req.params;
  const { action, reason } = req.body; // action: 'approve' or 'decline'

  if (!['approve', 'decline'].includes(action)) {
    return res.status(400).json({ success: false, message: 'Invalid action' });
  }

  try {
    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription || subscription.type !== 'fulltime_hire') {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    if (subscription.subscriptionStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Subscription is already ${subscription.subscriptionStatus}`
      });
    }

    if (action === 'approve') {
      subscription.subscriptionStatus = 'approved';
      subscription.approvedAt = new Date();
      subscription.declinedAt = null;
      subscription.declineReason = null;
    } else {
      subscription.subscriptionStatus = 'declined';
      subscription.declinedAt = new Date();
      subscription.declineReason = reason?.trim() || 'No reason provided';
      subscription.approvedAt = null;
    }

    await subscription.save();

    res.json({
      success: true,
      message: `Subscription ${action}d successfully`,
      status: subscription.subscriptionStatus
    });
  } catch (err) {
    console.error('Manage fulltime subscription error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 4. Client: Hire a full-time approved driver
export const hireFulltimeDriver = async (req, res) => {
  const { driverId } = req.body;
  const clientId = req.user._id;

  try {
    // Validate driver has approved full-time subscription
    const driverSub = await Subscription.findOne({
      user: driverId,
      type: 'fulltime_hire',
      subscriptionStatus: 'approved'
    });

    if (!driverSub) {
      return res.status(400).json({ success: false, message: 'Driver is not available for full-time hire' });
    }

    const amounts = {
      premium: 1000000,
      classic: 800000,
      gold: 1500000,
      chauffeur: 1200000,
    };

    const amount = amounts[driverSub.package];
    if (!amount) {
      return res.status(400).json({ success: false, message: 'Invalid driver package' });
    }

    const paystackRes = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: req.user.email,
        amount: amount * 100,
        reference: `fulltime_hire_${Date.now()}_${clientId}`,
        callback_url: `${process.env.CLIENT_URL}/client/fulltime-callback`,
        metadata: { clientId: clientId.toString(), driverId: driverId.toString() }
      },
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
    );

    res.json({
      success: true,
      authorization_url: paystackRes.data.data.authorization_url,
      amount,
      reference: paystackRes.data.data.reference
    });
  } catch (err) {
    console.error('Hire fulltime driver error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 5. Verify client full-time hire payment
export const verifyFulltimeHire = async (req, res) => {
  const { reference } = req.query;

  try {
    const verifyRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
    );

    if (verifyRes.data.data.status === 'success') {
      const { clientId, driverId } = verifyRes.data.data.metadata;

      // Optional: create a job record or update driver's current job
      // For now just redirect
      return res.redirect(`${process.env.CLIENT_URL}/client/fulltime-hire?status=success`);
    }

    return res.redirect(`${process.env.CLIENT_URL}/client/fulltime-hire?status=failed`);
  } catch (err) {
    console.error('Verify fulltime hire error:', err);
    return res.redirect(`${process.env.CLIENT_URL}/client/fulltime-hire?status=error`);
  }
};

// 6. Admin: Get all pending full-time subscriptions
export const getPendingFulltimeSubscriptions = async (req, res) => {
  try {
    const pending = await Subscription.find({
      type: 'fulltime_hire',
      // subscriptionStatus: 'pending'
    })
      .populate('user', 'firstName lastName email phone address dateOfBirth state lga  avatar')
      .sort({ subscribedAt: -1 })
      .lean();

    res.json({
      success: true,
      count: pending.length,
      pendingSubscriptions: pending
    });
  } catch (err) {
    console.error('Get pending fulltime error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 7. Driver: Check own full-time subscription status
export const getMyFulltimeSubscription = async (req, res) => {
  try {
    const sub = await Subscription.findOne({
      user: req.user._id,
      type: 'fulltime_hire'
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      subscription: sub || null
    });
  } catch (err) {
    console.error('Get my fulltime sub error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};