// backend/controllers/driverController.js (or userController.js)

import User from '../models/User.js';
import DriverProfile from '../models/driverProfile.js';

import Document from '../models/Document.js';
import Guarantor from '../models/GurantorSchema.js';

export const getDrivers = async (req, res) => {
  try {
    const currentUser = req.user;

    // 1. Base query: active, verified drivers
    const driverQuery = {
      role: 'driver',
      status: 'active',
    //   verificationStatus: 'verified',
    };

    // 2. Only return CERTIFIED drivers to subscribed users
    //    (non-subscribed users get nothing, or you can allow all — your choice)
    const isSubscribed =
      currentUser?.driverShop?.subscribed === true &&
      currentUser?.driverShop?.subscriptionStatus === 'active';

    if (isSubscribed) {
      driverQuery.isCertified = true;
    } else {
      // Option A: return nothing to non-subscribed users
      return res.status(200).json({
        success: true,
        message: 'Driver list available only for DriverShop subscribers',
        count: 0,
        data: [],
      });

      // Option B: return all drivers to non-subscribers (uncomment if preferred)
      // delete driverQuery.isCertified;
    }

    // 3. Fetch basic user data
    const users = await User.find(driverQuery)
      .select('firstName lastName phone location rating totalTrips avatar vehicle isCertified')
      .sort({ rating: -1, totalTrips: -1 })
      .lean();

    if (users.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    // 4. Get all driver IDs
    const driverIds = users.map((u) => u._id);

    // 5. Fetch profiles, documents, guarantors in parallel
    const [profiles, documents, guarantors] = await Promise.all([
      DriverProfile.find({ user: { $in: driverIds } }).lean(),
      Document.find({ user: { $in: driverIds } }).lean(),
      Guarantor.find({ user: { $in: driverIds } }).lean(),
    ]);

    // 6. Create lookup maps for fast access
    const profileMap = new Map(profiles.map((p) => [p.user.toString(), p]));
    const docMap = new Map();
    const guarMap = new Map();

    documents.forEach((doc) => {
      const key = doc.user.toString();
      if (!docMap.has(key)) docMap.set(key, []);
      docMap.get(key).push(doc);
    });

    guarantors.forEach((g) => {
      const key = g.user.toString();
      if (!guarMap.has(key)) guarMap.set(key, []);
      guarMap.get(key).push(g);
    });

    // 7. Combine everything
    const enrichedDrivers = users.map((user) => {
      const userIdStr = user._id.toString();

      return {
        ...user,
        driverProfile: profileMap.get(userIdStr) || null,
        documents: docMap.get(userIdStr) || [],
        guarantors: guarMap.get(userIdStr) || [],
      };
    });

    res.status(200).json({
      success: true,
      count: enrichedDrivers.length,
      subscribed: isSubscribed,
      data: enrichedDrivers,
    });
  } catch (err) {
    console.error('Get drivers error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};



export const getAllDriversWithDetails = async (req, res) => {
  try {
    // 1. Fetch basic driver users
    const users = await User.find({ role: 'driver' })
      .select(
        'firstName lastName email phone avatar location rating totalTrips isCertified vehicle isCertified driverShop status verificationStatus createdAt'
      )
      .sort({ createdAt: -1 })
      .lean();

    if (users.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        drivers: [],
      });
    }

    // 2. Collect all user IDs
    const userIds = users.map(u => u._id);

    // 3. Fetch related data in parallel (no populate)
    const [profiles, documents, guarantors] = await Promise.all([
      DriverProfile.find({ user: { $in: userIds } }).lean(),
      Document.find({ user: { $in: userIds } }).lean(),
      Guarantor.find({ user: { $in: userIds } }).lean(),
    ]);

    // 4. Create lookup maps for fast access
    const profileMap = new Map(profiles.map(p => [p.user.toString(), p]));

    const documentMap = new Map();
    documents.forEach(doc => {
      const key = doc.user.toString();
      if (!documentMap.has(key)) documentMap.set(key, []);
      documentMap.get(key).push(doc);
    });

    const guarantorMap = new Map();
    guarantors.forEach(g => {
      const key = g.user.toString();
      if (!guarantorMap.has(key)) guarantorMap.set(key, []);
      guarantorMap.get(key).push(g);
    });

    // 5. Combine everything into enriched driver objects
    const enrichedDrivers = users.map(user => {
      const userIdStr = user._id.toString();

      return {
        ...user,
        driverProfile: profileMap.get(userIdStr) || null,
        documents: documentMap.get(userIdStr) || [],
        guarantors: guarantorMap.get(userIdStr) || [],
      };
    });

    res.status(200).json({
      success: true,
      count: enrichedDrivers.length,
      drivers: enrichedDrivers,
    });
  } catch (err) {
    console.error('Get all drivers with details error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};





// 2. Admin: Certify / Uncertify a driver
export const toggleDriverCertification = async (req, res) => {
  const { driverId } = req.params;
  const { isCertified } = req.body; // true = certify, false = uncertify

  try {
    if (typeof isCertified !== 'boolean') {
      return res.status(400).json({ success: false, message: 'isCertified must be boolean' });
    }

    const driver = await User.findOneAndUpdate(
      { _id: driverId, role: 'driver' },
      { isCertified },
      { new: true, runValidators: true }
    ).select('firstName lastName email isCertified');

    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    res.status(200).json({
      success: true,
      message: `Driver ${isCertified ? 'certified' : 'uncertified'} successfully`,
      driver,
    });
  } catch (err) {
    console.error('Toggle certification error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};