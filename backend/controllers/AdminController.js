
// controllers/adminController.js
import User from '../models/User.js';
import Hire from '../models/Hire.js';
import DriverProfile from '../models/driverProfile.js';
import PricingConfig from '../models/pricingConfig.js';
import Rating from '../models/Rating.js';
import { sendNotification } from '../utils/sendNotification.js';
import Subscription from '../models/Subscription.js';
import SubscriptionPlan from '../models/SubscriptionPlan.js';
import Document from '../models/Document.js';
import Guarantor from '../models/GurantorSchema.js';


// ────────────────────────────────────────────────
// Helper: Get current driver commission percentage
// ────────────────────────────────────────────────
export const getDriverCommission = async () => {
  const superadmin = await User.findOne({ role: 'superadmin' })
    .select('adminSettings.driverCommissionPercentage');
  return superadmin?.adminSettings?.driverCommissionPercentage ?? 30;
};

// ────────────────────────────────────────────────
// 1. Get all users
// ────────────────────────────────────────────────
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ────────────────────────────────────────────────
// 2. Get single user
// ────────────────────────────────────────────────
export const getAUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ────────────────────────────────────────────────
// 3. Get all drivers
// ────────────────────────────────────────────────
export const getAllDrivers = async (req, res) => {
  try {
    const drivers = await User.find({ role: 'driver' }).select('-password');
    res.json({
      success: true,
      count: drivers.length,
      drivers,
    });
  } catch (error) {
    console.error('Get all drivers error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ────────────────────────────────────────────────
// 4. Blacklist / Unblacklist user
// ────────────────────────────────────────────────
export const blacklistUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'superadmin') return res.status(403).json({ success: false, message: 'Cannot blacklist superadmin' });

    user.status = 'blocked';
    user.isBlacklisted = true
    console.log("--------blocking--------")
    await user.save();

    res.json({ success: true, message: `${user.role} blacklisted` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const unblacklistUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.status = 'active';
       user.isBlacklisted = false
    await user.save();

    res.json({ success: true, message: `${user.role} unblacklisted` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ────────────────────────────────────────────────
// 5. Verify / Unverify driver
// ────────────────────────────────────────────────
export const verifyDriver = async (req, res) => {
  const { driverId } = req.params;
  try {
    const driver = await User.findOne({ _id: driverId, role: 'driver' });
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });

    driver.verificationStatus = 'verified';
    driver.isVerified = true;
    await driver.save();

    res.json({ success: true, message: 'Driver verified' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const unverifyDriver = async (req, res) => {
  const { driverId } = req.params;
  try {
    const driver = await User.findOne({ _id: driverId, role: 'driver' });
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });

    driver.verificationStatus = 'unverified';
    driver.isVerified = false;
    await driver.save();

    res.json({ success: true, message: 'Driver unverified' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ────────────────────────────────────────────────
// 6. Activate / Deactivate driver (new)
// ────────────────────────────────────────────────
export const activateDriver = async (req, res) => {
  const { driverId } = req.params;
  try {
    const driver = await User.findOne({ _id: driverId, role: 'driver' });
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });

    if (driver.status === 'active') {
      return res.status(400).json({ success: false, message: 'Driver already active' });
    }

    driver.status = 'active';
    driver.verificationStatus = 'verified' ;
    await driver.save();

    sendNotification(driverId, 'Your account has been activated by admin. You can now receive hire requests.');

    res.json({ success: true, message: 'Driver activated successfully' });
  } catch (error) {
    console.error('Activate driver error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deactivateDriver = async (req, res) => {
  const { driverId } = req.params;
  try {
    const driver = await User.findOne({ _id: driverId, role: 'driver' });
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });

    if (driver.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Driver already inactive' });
    }

    driver.status = 'pending'; // or 'blocked' if you prefer
    await driver.save();

    sendNotification(driverId, 'Your account has been deactivated by admin.');

    res.json({ success: true, message: 'Driver deactivated successfully' });
  } catch (error) {
    console.error('Deactivate driver error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ────────────────────────────────────────────────
// 7. Get driver details (including profile)
// ────────────────────────────────────────────────
export const getDriverDetails = async (req, res) => {
  const { driverId } = req.params;
  try {
    const driver = await User.findOne({ _id: driverId, role: 'driver' }).select('-password');
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });

    const profile = await DriverProfile.findOne({ user: driverId });

    res.json({
      success: true,
      driver,
      profile: profile || null,
    });
  } catch (error) {
    console.error('Get driver details error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ────────────────────────────────────────────────
// 8. Set driver commission percentage (superadmin only)
// ────────────────────────────────────────────────
export const setDriverCommission = async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Superadmin access required' });
    }

    const { percentage } = req.body;
    if (!Number.isInteger(percentage) || percentage < 0 || percentage > 100) {
      return res.status(400).json({ success: false, message: 'Percentage must be an integer between 0 and 100' });
    }

    const updatedAdmin = await User.findOneAndUpdate(
      { _id: req.user._id, role: 'superadmin' },
      {
        $set: {
          'adminSettings.driverCommissionPercentage': percentage,
          'adminSettings.commissionUpdatedAt': new Date()
        }
      },
      { new: true }
    );

    if (!updatedAdmin) {
      return res.status(404).json({ success: false, message: 'Superadmin account not found' });
    }

    console.log(`[Commission Updated] ${percentage}% by ${req.user.email || req.user._id}`);

    res.json({
      success: true,
      message: `Driver commission updated to ${percentage}%`,
      percentage,
      updatedAt: updatedAdmin.adminSettings.commissionUpdatedAt
    });
  } catch (error) {
    console.error('Set driver commission error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ────────────────────────────────────────────────
// 9. Get current commission settings
// ────────────────────────────────────────────────
export const getCommissionSettings = async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Superadmin access required' });
    }

    const admin = await User.findById(req.user._id)
      .select('adminSettings.driverCommissionPercentage adminSettings.commissionUpdatedAt');

    const percentage = admin?.adminSettings?.driverCommissionPercentage ?? 30;
    const updatedAt = admin?.adminSettings?.commissionUpdatedAt ?? null;

    res.json({
      success: true,
      settings: {
        driverCommissionPercentage: percentage,
        updatedAt: updatedAt || new Date(),
        defaultValue: 30
      }
    });
  } catch (error) {
    console.error('Get commission settings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ────────────────────────────────────────────────
// 10. Get pending approval hires (low offers)
// ────────────────────────────────────────────────
export const getPendingApprovalHires = async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Superadmin access required' });
    }

    const pendingHires = await Hire.find({
    status: {
    $in: ['pending_approval', 'awaiting_admin_approval']
  }
    })
      .populate('client', 'firstName lastName email phone address state lga country')
      .populate('driver', 'firstName lastName email phone avatar')
      .sort({ requestedAt: -1 });

    res.json({
      success: true,
      count: pendingHires.length,
      pendingHires
    });
  } catch (error) {
    console.error('Get pending approval hires error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ────────────────────────────────────────────────
// 11. Approve hire payment (low offer)
// ────────────────────────────────────────────────
export const approveHirePayment = async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Superadmin access required' });
    }

    const { hireId } = req.body;
console.log(hireId)
    const hire = await Hire.findById(hireId);
    console.log(hire)
    if (!hire ||  (
    hire.status !== 'pending_approval' &&
    hire.status !== 'awaiting_admin_approval' &&
    hire.status !== 'pending'
  )) {
      return res.status(400).json({ success: false, message: 'Hire not found or not pending approval' });
    }

    hire.status = 'accepted';
    hire.adminApprovedAt = new Date();
    hire.adminApprovedBy = req.user._id;
    await hire.save();

    // Notify client and driver
    sendNotification(hire.client, `Your hire request (ID: ${hireId}) has been approved by admin. You can now pay.`);
    sendNotification(hire.driver, `Hire request (ID: ${hireId}) approved by admin.`);

    res.json({
      success: true,
      message: 'Hire approved - client can now proceed with payment'
    });
  } catch (error) {
    console.error('Approve hire payment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ────────────────────────────────────────────────
// 12. Reject hire payment (low offer)
// ────────────────────────────────────────────────
export const rejectHirePayment = async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Superadmin access required' });
    }

    const { hireId, rejectReason } = req.body;

    const hire = await Hire.findById(hireId);
    if (!hire || hire.status !== 'pending_approval') {
      return res.status(400).json({ success: false, message: 'Hire not found or not pending approval' });
    }

    hire.status = 'rejected';
    hire.adminRejectedAt = new Date();
    hire.adminRejectedBy = req.user._id;
    hire.rejectReason = rejectReason || 'Insufficient offer amount';
    await hire.save();

    // Notify client and driver
    sendNotification(hire.client, `Your hire request (ID: ${hireId}) was rejected by admin. Reason: ${rejectReason || 'N/A'}`);
    sendNotification(hire.driver, `Hire request (ID: ${hireId}) rejected by admin.`);

    res.json({ success: true, message: 'Hire request rejected' });
  } catch (error) {
    console.error('Reject hire payment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ────────────────────────────────────────────────
// 13. Get all pricing configurations
// ────────────────────────────────────────────────
export const getAllPricingConfigs = async (req, res) => {
  try {
    const configs = await PricingConfig.find({isActive: true}).sort({ category: 1 });
    res.json({
      success: true,
      count: configs.length,
      pricingConfigs: configs,
    });
  } catch (error) {
    console.error('Get pricing configs error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ────────────────────────────────────────────────
// 14. Upsert pricing config (create or update)
// ────────────────────────────────────────────────
export const upsertPricingConfig = async (req, res) => {
  const { category } = req.params;
  const { hourlyRate, dailyRate, weeklyRate, monthlyRate, description, callOutCharge, isActive = true } = req.body;

  try {
    const config = await PricingConfig.findOneAndUpdate(
      { category },
      {
        hourlyRate: hourlyRate ?? undefined,
        dailyRate: dailyRate ?? undefined,
        weeklyRate: weeklyRate ?? undefined,
        monthlyRate: monthlyRate ?? undefined,
        callOutCharge: callOutCharge ?? undefined,
        description,
        isActive,
        lastUpdatedBy: req.user._id,
        updatedAt: new Date(),
      },
      { 
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true 
      }
    );

    res.json({
      success: true,
      message: `Pricing for ${category} ${config.wasNew ? 'created' : 'updated'}`,
      pricingConfig: config,
    });
  } catch (error) {
    console.error('Upsert pricing error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ────────────────────────────────────────────────
// 15. Deactivate pricing config
// ────────────────────────────────────────────────
export const deactivatePricingConfig = async (req, res) => {
  const { category } = req.params;

  try {
    const config = await PricingConfig.findOneAndUpdate(
      { category },
      { isActive: false, lastUpdatedBy: req.user._id },
      { new: true }
    );

    if (!config) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({ success: true, message: `Pricing for ${category} deactivated`, pricingConfig: config });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ────────────────────────────────────────────────
// 16. Get admin driver hire history & analytics
// ────────────────────────────────────────────────
export const getAdminDriverHireHistory = async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Superadmin access required' });
    }

    // Get all active drivers
    const drivers = await User.find({ role: 'driver', status: 'active' })
      .select('_id firstName lastName email phone avatar rating totalTrips earnings currentHireStatus')
      .lean();

    const driverAnalytics = [];

    for (const driver of drivers) {
      // Get all hires for this driver
      const hires = await Hire.find({ driver: driver._id })
        .populate('client', 'firstName lastName email phone avatar')
        .lean();

      // Process hires
      const processedHires = hires.map(hire => ({
        hireId: hire._id.toString(),
        clientId: hire.client?._id?.toString(),
        clientName: hire.client ? `${hire.client.firstName} ${hire.client.lastName}` : 'N/A',
        clientEmail: hire.client?.email || 'N/A',
        clientPhone: hire.client?.phone || 'N/A',
        clientAvatar: hire.client?.avatar || null,
        category: hire.category || 'N/A',
        durationHours: hire.durationHours || 0,
        amountOffered: hire.amountOffered || 0,
        amount: hire.amount || hire.amountOffered || 0,
        address: hire.address || 'N/A',
        state: hire.state || 'N/A',
        lga: hire.lga || 'N/A',
        country: hire.country || 'Nigeria',
        accommodation: hire.accommodation || false,
        benefits: hire.benefits || 'None',
        status: hire.status,
        paymentStatus: hire.paymentStatus,
        paymentReference: hire.paymentReference,
        requestedAt: hire.requestedAt,
        acceptedAt: hire.acceptedAt,
        endedAt: hire.endedAt,
        endReason: hire.endReason || 'N/A',
        endedEarly: hire.endedEarly || false,
        conversationId: hire.conversationId?.toString() || null,
        adminApproved: hire.adminApprovedAt ? true : false,
      }));

      // Stats
      const totalEarnings = processedHires.reduce((sum, h) => {
        return h.paymentStatus === 'paid' ? sum + (h.amountOffered || 0) : sum;
      }, 0);

      const adminPercentage = await getDriverCommission();
      const adminCommission = Math.round((totalEarnings * adminPercentage) / 100);
      const driverEarnings = totalEarnings - adminCommission;

      // Average rating (from separate Rating model)
      const ratings = await Rating.find({ toUser: driver._id });
      const totalReviews = ratings.length;
      const avgRating = totalReviews > 0 
        ? (ratings.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1) 
        : '0.0';

      driverAnalytics.push({
        driver: {
          _id: driver._id.toString(),
          firstName: driver.firstName,
          lastName: driver.lastName,
          email: driver.email,
          phone: driver.phone || 'N/A',
          avatar: driver.avatar || '/default-avatar.png',
          rating: parseFloat(avgRating),
          totalTrips: driver.totalTrips || 0,
          earnings: driver.earnings || 0,
          currentHireStatus: driver.currentHireStatus || 'available',
        },
        hires: processedHires,
        stats: {
          totalHires: processedHires.length,
          paidHires: processedHires.filter(h => h.paymentStatus === 'paid').length,
          pendingHires: processedHires.filter(h => h.paymentStatus === 'pending').length,
          totalEarnings,
          adminCommission,
          driverEarnings,
          adminPercentage,
          avgRating: parseFloat(avgRating),
          totalReviews,
        },
      });
    }

    // Global summary
    const summary = {
      totalDrivers: driverAnalytics.length,
      totalHires: driverAnalytics.reduce((sum, d) => sum + d.stats.totalHires, 0),
      totalEarnings: driverAnalytics.reduce((sum, d) => sum + d.stats.totalEarnings, 0),
      totalAdminCommission: driverAnalytics.reduce((sum, d) => sum + d.stats.adminCommission, 0),
      averageRating: driverAnalytics.reduce((sum, d) => sum + d.stats.avgRating, 0) / driverAnalytics.length || 0,
    };

    res.json({
      success: true,
      summary,
      drivers: driverAnalytics,
    });
  } catch (error) {
    console.error('Admin driver analytics error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};





export const getPricingConfig = async (req, res) => {
  const { category } = req.params;

  try {
    const config = await PricingConfig.findOne({ category });
    if (!config) {
      return res.status(404).json({ success: false, message: 'Pricing config not found for this category' });
    }

    res.json({ success: true, pricingConfig: config });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};









export const getAllHiredDrivers = async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Superadmin access required' });
    }

    const drivers = await User.find({
      role: 'driver',
      $or: [
        // { currentHireStatus: 'hired' },
        // { currentHireOnDemandJob: { $ne: null } },
        // { currentFulltimeJob: { $ne: null } },
        { hireRequests: { $elemMatch: { status: { $in: ['accepted', 'active'] } } } },
      ],
    })
      .populate({
        path: 'currentHireOnDemandJob.client',
        select: 'firstName lastName email phone avatar',
      })
      .populate({
        path: 'currentFulltimeJob.client',
        select: 'firstName lastName email phone avatar',
      })
      .populate({
        path: 'hireRequests.client',
        select: 'firstName lastName email phone avatar',
        match: { status: { $in: ['accepted', 'active'] } },
      })
      .select(
        'firstName lastName avatar phone vehicle currentHireStatus currentHireOnDemandJob currentFulltimeJob hireRequests'
      );

    const result = drivers
      .map((driver) => {
        const hires = [];

        // Short-term hire (from hireRequests)
        driver.hireRequests?.forEach((req) => {
          if (['accepted', 'active'].includes(req.status) && req.client) {
            hires.push({
              type: 'Short-term Hire',
              client: {
                _id: req.client._id,
                name: `${req.client.firstName || ''} ${req.client.lastName || ''}`.trim() || 'Client (name missing)',
                email: req.client.email || 'N/A',
                phone: req.client.phone || 'N/A',
                avatar: req.client.avatar || null,
              },
              status: req.status,
              durationHours: req.durationHours,
              amountOffered: req.amountOffered,
              address: req.address,
              startedAt: req.acceptedAt || req.requestedAt,
            });
          }
        });

        // On-demand hire
        if (driver.currentHireOnDemandJob?.client) {
          hires.push({
            type: 'Hire on Demand',
            client: {
              _id: driver.currentHireOnDemandJob.client._id,
              name: `${driver.currentHireOnDemandJob.client.firstName || ''} ${
                driver.currentHireOnDemandJob.client.lastName || ''
              }`.trim() || 'Client (name missing)',
              email: driver.currentHireOnDemandJob.client.email || 'N/A',
              phone: driver.currentHireOnDemandJob.client.phone || 'N/A',
              avatar: driver.currentHireOnDemandJob.client.avatar || null,
            },
            amountPaid: driver.currentHireOnDemandJob.amountPaid,
            startedAt: driver.currentHireOnDemandJob.startedAt,
            status: driver.currentHireOnDemandJob.status,
          });
        }

        // Fulltime hire
        if (driver.currentFulltimeJob?.client) {
          hires.push({
            type: 'Fulltime Hire',
            client: {
              _id: driver.currentFulltimeJob.client._id,
              name: `${driver.currentFulltimeJob.client.firstName || ''} ${
                driver.currentFulltimeJob.client.lastName || ''
              }`.trim() || 'Client (name missing)',
              email: driver.currentFulltimeJob.client.email || 'N/A',
              phone: driver.currentFulltimeJob.client.phone || 'N/A',
              avatar: driver.currentFulltimeJob.client.avatar || null,
            },
            amountPaid: driver.currentFulltimeJob.amountPaid,
            startedAt: driver.currentFulltimeJob.startedAt,
            status: driver.currentFulltimeJob.status,
          });
        }

        if (hires.length > 0) {
          return {
            driver: {
              _id: driver._id,
              name: `${driver.firstName} ${driver.lastName}`,
              avatar: driver.avatar,
              phone: driver.phone,
              vehicle: driver.vehicle,
            },
            activeHires: hires,
          };
        }
        return null;
      })
      .filter(Boolean); // remove drivers with no active hires

    res.json({
      success: true,
      count: result.length,
      hiredDrivers: result,
    });
  } catch (error) {
    console.error('Get all hired drivers error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};





export const getVerifiedDrivers = async (req, res) => {
  try {
    const drivers = await User.find({
      role: 'driver',
      isVerified: true,
    })
      .select('firstName lastName email phone avatar vehicle rating totalTrips')
      .sort({ rating: -1, totalTrips: -1 });

    res.json({
      success: true,
      count: drivers.length,
      drivers,
    });
  } catch (error) {
    console.error('Get verified drivers error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};







// Set or update pricing for a subscription plan
// setSubscriptionPlan
export const setSubscriptionPlan = async (req, res) => {
  const { type, planName, amount, currency = 'NGN', description = '' } = req.body;

  if (!type || !planName || !amount) {
    return res.status(400).json({
      success: false,
      message: 'type, planName, and amount are required'
    });
  }

  try {
    const plan = await SubscriptionPlan.findOneAndUpdate(
      { type, planName },
      {
        type,
        planName,
        amount: Number(amount),
        currency,
        description,
        updatedBy: req.user._id,
        updatedAt: Date.now()
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Subscription plan updated successfully',
      data: plan
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all subscription plans (for admin)
export const getAllSubscriptionPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find().sort({ type: 1, package: 1 });
    res.json({ success: true, data: plans });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all subscriptions (who subscribed to what)
export const getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find()
      .populate('user', 'firstName lastName email phone role')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: subscriptions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};








export const getDriverFullDetails = async (req, res) => {
  const { driverId } = req.params;

  try {
    // 1. Fetch basic User data
    const user = await User.findOne({ _id: driverId, role: 'driver' })
      .select(
        'firstName lastName email phone avatar location rating totalTrips vehicle isCertified driverShop status verificationStatus createdAt dateOfBirth address state lga country'
      )
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found or not a driver'
      });
    }

    // 2. Fetch DriverProfile
    const driverProfile = await DriverProfile.findOne({ user: driverId })
      .select('categories yearsOfExperience transmission languagesSpoken travelCapabilities bio isAvailable expectedEarnings')
      .lean();

    // 3. Fetch all Documents
    const documents = await Document.find({ user: driverId })
      .select('type url status verifiedAt rejectedAt rejectionReason guarantorPosition createdAt')
      .sort({ createdAt: -1 })
      .lean();

    // 4. Fetch all Guarantors
    const guarantors = await Guarantor.find({ user: driverId })
      .select('position name phone address relationship idDocument status verifiedAt rejectionReason createdAt')
      .sort({ position: 1 })
      .lean();

    // 5. Combine everything
    const fullDriver = {
      ...user,
      driverProfile: driverProfile || null,
      documents: documents || [],
      guarantors: guarantors || []
    };

    res.status(200).json({
      success: true,
      driver: fullDriver
    });
  } catch (err) {
    console.error('Get driver full details error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching driver details'
    });
  }
};

// Bonus: Get ALL drivers list (for table view)
export const getAllDriversList = async (req, res) => {
  try {
    const drivers = await User.find({ role: 'driver' })
      .select('firstName lastName email phone avatar rating totalTrips isCertified status verificationStatus createdAt')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: drivers.length,
      drivers
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};



