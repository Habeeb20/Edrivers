import express from 'express';
import { protect, superadmin } from '../middleware/verifyToken.js';

import {
  subscribeFulltimeHire,
  verifyFulltimeSubscription,
  manageFulltimeSubscription,
  hireFulltimeDriver,
  verifyFulltimeHire,
  getPendingFulltimeSubscriptions,
  getMyFulltimeSubscription
} from '../controllers/fulltimeController.js';

const router = express.Router();

// Public / Authenticated
router.post('/subscribe', protect, subscribeFulltimeHire);
router.get('/callback', verifyFulltimeSubscription);
router.get('/my-subscription', protect, getMyFulltimeSubscription);

// Client hire
router.post('/hire', protect, hireFulltimeDriver);
router.get('/hire-callback', verifyFulltimeHire);

// Admin only
router.get('/pending', protect, superadmin, getPendingFulltimeSubscriptions);
router.get('/subscriptions', protect, superadmin, getPendingFulltimeSubscriptions);
router.put('/manage/:subscriptionId', protect, superadmin, manageFulltimeSubscription);

export default router;