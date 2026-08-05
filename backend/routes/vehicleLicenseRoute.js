// backend/routes/vehicleLicenseRoutes.js
import express from 'express';
import { protect, superadmin } from '../middleware/verifyToken.js';
import { initiateVehicleLicensePayment,  verifyVehicleLicensePayment,
  getSubmittedVehicleLicenses,
  confirmVehicleLicense,
  getMyVehicleLicenseApplications,
  getVehicleLicenseApplications,
  updateVehicleLicenseStatus, } from '../controllers/VehicleController.js';


const router = express.Router();

// Client: Initiate payment for new or renewal vehicle license
router.post('/initiate-payment', protect, initiateVehicleLicensePayment);

// Paystack callback (no auth needed - Paystack calls it directly)
router.get('/callback', verifyVehicleLicensePayment);

// Superadmin: Get all submitted vehicle license applications
router.get('/submitted', protect, superadmin, getSubmittedVehicleLicenses);

// Superadmin: Confirm application (move to processing)
router.put('/confirm/:applicationId', protect, superadmin, confirmVehicleLicense);

router.get('/my-applications', protect, getMyVehicleLicenseApplications);

// Admin: Get all applications (with optional ?status= filter)
router.get('/applications', protect, superadmin, getVehicleLicenseApplications);

// Admin: Update status (ready / rejected / etc.)
router.put('/status/:applicationId', protect, superadmin, updateVehicleLicenseStatus);

export default router;