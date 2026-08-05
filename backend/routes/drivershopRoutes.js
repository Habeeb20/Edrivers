// backend/routes/driverShopRoutes.js
import express from 'express';
import { protect, superadmin } from '../middleware/verifyToken.js';
import { subscribeToDriverShop,  verifyDriverShopSubscription,
  checkDriverShopSubscription,
  getVettedDrivers,
  vetDriverForShop,
 verifyDriverShopPayment } from '../controllers/drivershopController.js';

import   {getAllHiredDrivers} from "../controllers/AdminController.js"
const router = express.Router();

router.post('/subscribe', protect, subscribeToDriverShop);
router.get('/callback', verifyDriverShopSubscription);
router.get('/status', protect, checkDriverShopSubscription);
router.get('/vetted-drivers', protect, getVettedDrivers); // for subscribed clients
router.put('/vet/:driverId', protect, superadmin, vetDriverForShop);
router.get('/all-hires', protect, superadmin, getAllHiredDrivers);
router.get('/driver-shop/verify', verifyDriverShopPayment);
export default router;





// Admin routes
// router.put('/drivers/:driverId/vet-shop', protect, superadmin, vetDriverForShop);