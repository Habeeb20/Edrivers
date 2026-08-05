import express from "express";
import { protect, superadmin } from "../middleware/verifyToken.js";
import { applyForLicense, getSubmittedApplications, confirmApplication, initiateLicensePayment, verifyLicensePayment } from "../controllers/driverLicense.js";


const router = express.Router();

router.post('/apply', protect, applyForLicense);
router.get('/submitted', protect, superadmin, getSubmittedApplications);
router.put('/confirm/:applicationId', protect, superadmin, confirmApplication);
// backend/routes/licenseRoutes.js
router.post('/initiate-payment', protect, initiateLicensePayment);
router.get('/callback', verifyLicensePayment)
export default router;