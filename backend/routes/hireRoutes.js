// routes/hireRoutes.js
import express from 'express';
import { protect, superadmin } from '../middleware/verifyToken.js';
import {
  sendHireRequest,
  acceptHire,
  declineHire,
  endHire,
  submitRating,
  getMyHireRequests,          // Driver: incoming requests
  getMyHiredDrivers,          // Client: my hires
  initializeHirePayment,
  verifyHirePayment,
  getHireHistory,
  getDriverHireCount,
  getRatingSummary,
  getUserRatings,
//   createHireJob,
//   getAvailableHires,
//   applyToHire,
//   hireDriver,
//   startHire,
//   getMyHires,
} from '../controllers/HireController.js';
import { getMyReports, reportHireParticipant } from '../controllers/reportController.js';

const router = express.Router();

// Public payment verification callback (Paystack hits this)
router.all('/payment/verify/:reference', verifyHirePayment);

// All other routes require authentication
router.use(protect);

   

// ─── Client routes ─────────────────────────────────────────────────
router.post('/request/:driverId', sendHireRequest);           // Client sends request
router.get('/my-hires', getMyHiredDrivers);                   // Client sees all their hires
router.post('/payment/initialize', initializeHirePayment);    // Client starts payment

// ─── Driver routes ─────────────────────────────────────────────────
router.put('/accept/:hireId', acceptHire);                    // Driver accepts
router.put('/decline/:hireId', declineHire);                  // Driver declines
router.get('/my-requests', getMyHireRequests);                // Driver sees incoming requests

// ─── Both client & driver ──────────────────────────────────────────
router.put('/end/:hireId', endHire);                          // End active hire
router.post('/rate', submitRating);  

// route (same URL, both directions now)
router.post('/report', reportHireParticipant);
router.get('/reports/mine', getMyReports);
// Get history by userId + role (for admin or specific views)
router.get('/history/:userId', getHireHistory);
 router.get("/hirecount", getDriverHireCount)
router.get('/user/:userId/summary',  getRatingSummary);
router.get('/user/:userId',  getUserRatings);
// ─── Job board style hire (optional feature) ───────────────────────
// router.post('/post', createHireJob);                          // Client posts public job
// router.get('/available', getAvailableHires);                  // Drivers see public jobs
// router.post('/:hireId/apply', applyToHire);                   // Driver applies to job
// router.put('/hire-driver', hireDriver);                       // Client hires applicant
// router.put('/:hireId/start', startHire);                      // Start the job
// router.get('/my-hires', getMyHires);                          // Unified my hires (both roles)

export default router;