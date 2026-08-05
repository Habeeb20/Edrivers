// routes/adminRoutes.js
import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { protect, superadmin } from '../middleware/verifyToken.js';
import {
  getAllUsers,
  getAUser,
  getAllDrivers,
  blacklistUser,
  unblacklistUser,
  verifyDriver,
  unverifyDriver,
  activateDriver,
  deactivateDriver,
  getDriverDetails,
  getPendingApprovalHires,
  approveHirePayment,
  rejectHirePayment,
  getAllPricingConfigs,
  getPricingConfig,
  upsertPricingConfig,
  deactivatePricingConfig,
  getAdminDriverHireHistory,
  setDriverCommission,
  getCommissionSettings,
  getAllHiredDrivers,
  setSubscriptionPlan,
  getAllSubscriptionPlans,
  getAllSubscriptions,
  getDriverFullDetails,
  getAllDriversList,
} from '../controllers/AdminController.js';
import { generateToken } from '../utils/functions.js';
import { getVerifiedDrivers } from '../controllers/UserController.js';
import Hire from '../models/Hire.js';
import { getDriverCommission } from '../controllers/AdminController.js';
const router = express.Router();

// Public admin login (no protect)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');

    if (!user || user.role !== 'superadmin') {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Superadmin credentials required.',
      });
    }

    // const isMatch = await bcrypt.compare(password, user.password);
    // if (!isMatch) {
    //   return res.status(401).json({
    //     success: false,
    //     message: 'Invalid email or password',
    //   });
    // }

    const token = generateToken(user._id, 'superadmin');

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// routes/adminRoutes.js (or wherever you define it)
router.get('/dashboard', protect, superadmin, async (req, res) => {
  try {
    // 1. Basic user counts (unchanged, from User model)
    const totalClients = await User.countDocuments({ role: 'client', status: 'active' });
    const totalDrivers = await User.countDocuments({ role: 'driver', status: 'active' });
    const pendingDrivers = await User.countDocuments({ role: 'driver', verificationStatus: 'unverified' });
    const activeDrivers = await User.countDocuments({ role: 'driver', verificationStatus: 'verified' });

    // 2. Hire-related stats (now from Hire model)
    const totalHires = await Hire.countDocuments();
    const activeHires = await Hire.countDocuments({ status: 'active' });
    const pendingHires = await Hire.countDocuments({ status: { $in: ['pending', 'pending_approval'] } });
    const completedHires = await Hire.countDocuments({ status: 'ended' });
    const paidHires = await Hire.countDocuments({ paymentStatus: 'paid' });

    // 3. Revenue stats (only paid hires)
    const paidHireDocs = await Hire.find({ paymentStatus: 'paid' }).select('amountOffered');
    const totalRevenue = paidHireDocs.reduce((sum, hire) => sum + (hire.amountOffered || 0), 0);

    // 4. Commission earned by platform (based on current admin commission %)
    const adminCommissionPercentage = await getDriverCommission(); // from your admin controller
    const totalPlatformCommission = Math.round((totalRevenue * adminCommissionPercentage) / 100);

    // 5. Driver earnings (what drivers actually received)
    const totalDriverEarnings = totalRevenue - totalPlatformCommission;

    // 6. Optional: Recent activity (last 7 days hires)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentHires = await Hire.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    res.json({
      success: true,
      data: {
        stats: {
          // User counts
          totalClients,
          totalDrivers,
          activeDrivers,
          pendingVerifications: pendingDrivers,

          // Hire activity
          totalHires,
          activeHires,
          pendingHires,
          completedHires,
          paidHires,
          recentHiresLast7Days: recentHires,

          // Financials (real aggregation — no more hardcoded 124850)
          totalRevenue,               // total money paid by clients
          totalPlatformCommission,    // admin/platform cut
          totalDriverEarnings,        // what drivers received
          adminCommissionPercentage,  // current % setting
        },
        // Optional: quick summary message for dashboard
        summary: {
          message: `Platform has ${totalHires} total hires, ${activeHires} currently active, and ₦${totalRevenue.toLocaleString()} in total revenue.`,
        }
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/pricing', getAllPricingConfigs);
router.get('/apricing/:category', getPricingConfig);

// All other admin routes require superadmin
router.use(protect);
router.use(superadmin);

// ─── User & Driver Management ─────────────────────────────────────
router.get('/drivers/all', protect, superadmin, getAllDriversList);
router.get('/users', getAllUsers);
router.get('/users/:id', getAUser);
router.get('/drivers', getAllDrivers);
router.get('/drivers/:driverId', getDriverDetails);
router.put('/drivers/:driverId/verify', verifyDriver);
router.put('/drivers/:driverId/unverify', unverifyDriver);
router.put('/drivers/:driverId/activate', activateDriver);
router.put('/drivers/:driverId/deactivate', deactivateDriver);
router.put('/users/:userId/blacklist', blacklistUser);
router.put('/users/:userId/unblacklist', unblacklistUser);
router.get('/hires', protect, superadmin, getAllHiredDrivers);

router.get('/drivers/:driverId/full-details', protect, superadmin, getDriverFullDetails);

// Get list of all drivers (for table / overview)

// ─── Hire Approval ─────────────────────────────────────────────────
router.get('/pending-approval-hires', getPendingApprovalHires);
router.post('/approve-hire-payment', approveHirePayment);
router.post('/reject-hire-payment', rejectHirePayment);

// ─── Pricing Configuration ─────────────────────────────────────────
router.get('/pricing', getAllPricingConfigs);
router.get('/pricing/:category', getPricingConfig);
router.put('/pricing/:category', upsertPricingConfig);
router.delete('/pricing/:category', deactivatePricingConfig);

// ─── Commission Settings ───────────────────────────────────────────
router.post('/commission/set', setDriverCommission);
router.get('/commission/settings', getCommissionSettings);
router.put('/blacklist/:userId', blacklistUser);
router.put('/unblacklist/:userId', unblacklistUser);
// ─── Analytics & History ───────────────────────────────────────────
router.get('/driver-history', getAdminDriverHireHistory);



////-------subscription-----------
// Admin only
router.put('/subscription-plans', protect, superadmin, setSubscriptionPlan);
router.get('/subscription-plans',  getAllSubscriptionPlans);
router.get('/subscriptions', protect, superadmin, getAllSubscriptions);
export default router;