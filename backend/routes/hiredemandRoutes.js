// routes/hireOnDemandRoutes.js
import express from 'express';
import { protect, superadmin } from '../middleware/verifyToken.js';

import {
  subscribeHireOnDemand,
  verifySubscriptionCallback,
  manageSubscription,
  requestHireOnDemandDriver,
  verifyHireOnDemandPayment,
  getHireOnDemandDrivers,
  getPendingSubscriptions,
  getAllHireOnDemandRequests,
  checkHireOnDemandSubscriptionStatus,
  getSubscriptionStatus,
  getHireOnDemandSubscribers
} from '../controllers/hireondemandController.js';
import { getVettedDrivers } from '../controllers/drivershopController.js';

const router = express.Router();

// Driver subscription
router.post('/subscribe', protect, subscribeHireOnDemand);
router.get('/callback', verifySubscriptionCallback); // Paystack redirect

// Admin management
router.get('/subscriptions/pending', protect, superadmin, getPendingSubscriptions);
router.put('/subscriptions/:driverId', protect, superadmin, manageSubscription);

// Client hire
router.post('/hire/request', protect, requestHireOnDemandDriver);
router.get('/hire/callback', verifyHireOnDemandPayment);

// Public list
router.get('/drivers', protect, getHireOnDemandDrivers);
router.get('/vetted-drivers', protect, getVettedDrivers); // your existing one
router.get('/hod-subscribers', protect, superadmin, getHireOnDemandSubscribers);
// Admin overview
router.get('/requests', protect, superadmin, getAllHireOnDemandRequests);

router.get('/subscription-status', protect, getSubscriptionStatus);

// routes/hireOnDemandRoutes.js
router.get('/subscriptions/pending', protect, superadmin, getPendingSubscriptions);
router.put('/subscriptions/:driverId', protect, superadmin, manageSubscription);
// Check driver's own Hire on Demand subscription status
router.get('/subscription-status', protect, checkHireOnDemandSubscriptionStatus);
export default router;