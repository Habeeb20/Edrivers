import express from 'express';
import { protect } from '../middleware/verifyToken.js';

import { getLoyaltyBreakdown, requestRedemption,
  getAllRedemptionRequests,
  getUserLoyaltyActions,
  approveRedemption,
  rejectRedemption, } from '../controllers/loyaltyController.js';


const router = express.Router();

// User routes
router.get('/breakdown', protect, getLoyaltyBreakdown);
router.post('/redeem', protect, requestRedemption);

// Admin routes
router.get('/admin/redemptions', protect,  getAllRedemptionRequests);
router.get('/admin/users/:userId/actions', protect,  getUserLoyaltyActions);
router.put('/admin/redemptions/:userId/:requestId/approve', protect,  approveRedemption);
router.put('/admin/redemptions/:userId/:requestId/reject', protect,  rejectRedemption);

export default router;