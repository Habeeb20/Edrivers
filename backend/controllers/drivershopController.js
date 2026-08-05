// controllers/driverShopController.js
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import axios from 'axios';
import SubscriptionPlan from '../models/SubscriptionPlan.js';
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

// subscribeToDriverShop
export const subscribeToDriverShop = async (req, res) => {
  const clientId = req.user._id;

  try {
    const client = await User.findById(clientId);
    if (!client || client.role !== 'client') {
      return res.status(403).json({ success: false, message: 'Only clients can subscribe' });
    }

    // Prevent duplicate
    const existing = await Subscription.findOne({
      user: clientId,
      type: 'driver_shop',
      subscriptionStatus: { $in: ['pending', 'active'] }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active or pending Driver Shop subscription'
      });
    }

    // Get admin-set price
    const plan = await SubscriptionPlan.findOne({
      type: 'driver_shop',
      planName: 'premium',
      isActive: true
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Driver Shop plan not configured. Contact admin.'
      });
    }

    // Paystack init
    const paystackRes = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: client.email,
        amount: plan.amount * 100, // to kobo
        reference: `dshop_${Date.now()}_${clientId}`,
        callback_url: `${process.env.BACKEND_URL}/api/driver-shop/driver-shop/verify`,
        metadata: { clientId: clientId.toString(), planId: plan._id.toString() }
      },
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
    );

    // Create pending subscription
    const sub = await Subscription.create({
      user: clientId,
      type: 'driver_shop',
      package: 'premium',
      subscriptionAmount: plan.amount,
      paymentRef: paystackRes.data.data.reference,
      subscriptionStatus: 'pending',
      subscribedAt: new Date()
    });

    // Update user flag
    client.driverShop = {
      subscribed: false,
      subscriptionStatus: 'pending',
      paymentRef: paystackRes.data.data.reference,
      subscriptionId: sub._id
    };
    await client.save();

    res.json({
      success: true,
      authorization_url: paystackRes.data.data.authorization_url,
      amount: plan.amount,
      currency: plan.currency
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 2. Verify Paystack payment callback
export const verifyDriverShopPayment = async (req, res) => {
  const { reference } = req.query;

  if (!reference) {
    return res.redirect(`${process.env.CLIENT_URL}/dashboard?status=failed&message=Missing reference`);
  }

  try {
    const verifyRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` }
      }
    );

    const data = verifyRes.data.data;

    if (data.status === 'success') {
      const clientId = data.metadata.clientId;

      const client = await User.findById(clientId);
      if (!client) {
        return res.redirect(`${process.env.CLIENT_URL}/dashboard?status=error&message=User not found`);
      }

      // Update user
      client.driverShop = {
        subscribed: true,
        subscriptionStatus: 'active',
        subscribedAt: new Date(),
        paymentRef: reference
      };
      await client.save();

      // Update subscription record
      await Subscription.findOneAndUpdate(
        { paymentRef: reference, user: clientId },
        {
          subscriptionStatus: 'active',
          approvedAt: new Date(),
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
        }
      );

      return res.redirect(`${process.env.CLIENT_URL}/dashboard?status=success`);
    } else {
      return res.redirect(`${process.env.CLIENT_URL}/dashboard?status=failed`);
    }
  } catch (err) {
    console.error('Verify payment error:', err);
    return res.redirect(`${process.env.CLIENT_URL}/dashboard?status=error`);
  }
};

// 3. Get all vetted/certified drivers for Driver Shop (only for subscribed clients)
export const getVettedDrivers = async (req, res) => {
  try {
    const user = req.user;
console.log(user)
    // Check subscription (clients only)
    if (user.role === 'client') {
      if (!user.driverShop?.subscribed || user.driverShop.subscriptionStatus !== 'pending') {
        return res.status(403).json({
          success: false,
          message: 'Active Driver Shop subscription required to view vetted drivers'
        });
      }
    }

    // Fetch certified/vetted drivers
    const vettedDrivers = await User.find({
      role: 'driver',
      isCertified: true,
      isVerified: true,           // optional: only verified drivers
      status: 'active'            // optional
    })
      .select('firstName lastName avatar phone vehicle rating totalTrips location')
      .sort({ rating: -1, totalTrips: -1 })
      .lean();

    res.json({
      success: true,
      count: vettedDrivers.length,
      drivers: vettedDrivers
    });
  } catch (err) {
    console.error('Get vetted drivers error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 4. Superadmin: Vet or unvet driver for Driver Shop
export const vetDriverForShop = async (req, res) => {
  const { driverId } = req.params;
  const { action } = req.body; // 'vet' or 'unvet'

  try {
    const driver = await User.findById(driverId);
    if (!driver || driver.role !== 'driver') {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    driver.isVettedForShop = action === 'vet';
    await driver.save();

    res.json({
      success: true,
      message: `Driver has been ${action === 'vet' ? 'vetted' : 'unvetted'} for Driver Shop`,
      isVettedForShop: driver.isVettedForShop
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};





export const subscribeToHireOnDemand = async (req, res) => {
  const driverId = req.user._id;

  try {
    const driver = await User.findById(driverId);
    if (!driver || driver.role !== 'driver') {
      return res.status(403).json({ success: false, message: 'Only drivers can subscribe' });
    }

    // Check existing subscription
    const existing = await Subscription.findOne({
      user: driverId,
      type: 'hire_on_demand',
      subscriptionStatus: { $in: ['pending', 'active'] }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active or pending subscription'
      });
    }

    // Get the admin-set price
    const plan = await SubscriptionPlan.findOne({
      type: 'hire_on_demand',
      planName: 'premium', // or use selectedPlan from req.body if multiple
      isActive: true
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Subscription plan not available. Contact admin.'
      });
    }

    // ... Paystack initialization ...

    res.json({
      success: true,
      authorization_url: paystackRes.data.data.authorization_url,
      amount: plan.amount,          // ← important: return the real amount
      currency: plan.currency
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



export const verifyDriverShopSubscription = async (req, res) => {
  const { reference } = req.query;

  if (!reference) {
    return res.redirect(`${process.env.CLIENT_URL}/client/driver-shop?status=failed&message=Missing reference`);
  }

  try {
    const verifyRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
      }
    );

    const data = verifyRes.data.data;

    if (data.status !== 'success') {
      return res.redirect(`${process.env.CLIENT_URL}/client/driver-shop?status=failed`);
    }

    const { clientId } = data.metadata;

    const client = await User.findById(clientId);
    if (!client || client.role !== 'client') {
      return res.redirect(`${process.env.CLIENT_URL}/client/driver-shop?status=error`);
    }

    // Update user subscription status
    client.driverShop = {
      subscribed: true,
      subscriptionStatus: 'active', // or 'pending' if you want admin approval
      subscribedAt: new Date(),
      paymentRef: reference
    };

    await client.save();

    // Optional: Update Subscription model if you're using it
    await Subscription.findOneAndUpdate(
      { paymentRef: reference, user: clientId },
      {
        subscriptionStatus: 'active',
        approvedAt: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
      }
    );

    // Redirect to success page
    return res.redirect(`${process.env.CLIENT_URL}/client/driver-shop?status=success`);
  } catch (err) {
    console.error('Driver Shop callback verification error:', err);
    return res.redirect(`${process.env.CLIENT_URL}/client/driver-shop?status=error`);
  }
};




export const checkDriverShopSubscription = async (req, res) => {
  const clientId = req.user._id;

  try {
    const client = await User.findById(clientId);
    if (!client || client.role !== 'client') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const subscribed = client.driverShop?.subscribed || false;
    const status = client.driverShop?.subscriptionStatus || 'inactive';

    res.json({
      success: true,
      subscribed,
      subscriptionStatus: status,
      subscribedAt: client.driverShop?.subscribedAt || null,
      // Optional: include amount if you want frontend to show it
      amount: 6000 // or fetch from SubscriptionPlan if dynamic
    });
  } catch (err) {
    console.error('Check subscription status error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};