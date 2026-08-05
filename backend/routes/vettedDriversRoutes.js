// backend/routes/adminRoutes.js (or userRoutes.js)
import express from 'express';
import { protect, superadmin } from '../middleware/verifyToken.js';

import { getAllDriversWithDetails,   getDrivers,   toggleDriverCertification, } from '../controllers/VettedDriversController.js';
const router = express.Router();

// Admin: Get all drivers with full details (profile, documents, guarantors)
router.get('/full-details', protect, superadmin, getAllDriversWithDetails);

// Admin: Certify / Uncertify driver
router.put('/:driverId/certification', protect, superadmin, toggleDriverCertification);


router.get('/', protect, getDrivers);
export default router;