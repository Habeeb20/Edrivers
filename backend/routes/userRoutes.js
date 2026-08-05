// routes/auth.js
import express from "express";
import {
  registerUser,
  loginUser,
  getDashboard,
  updateProfile,
  forgotPassword,
  resetPassword,
  changePassword,
  changeEmail,
  confirmEmailChange,
  deleteAccount,
  getDrivers,
  getClients,
  getAvailableDrivers,
//   getNearbyDrivers,
  getUserProfile,
  getOverviewStats,
  getFullProfile,
  getUserProfile2,
  toggleLikeProvider,
  shareProvider,
  authLogin,
  incrementDriverView,
  getPaymentTimeline,
  incrementDriverViews,
  getProfileCompletionStatus,
  searchDriversByName,
  requestEAuthOtp,
  verifyEAuthOtp,
  verifyEmailOtp,
  resendOtp,
} from "../controllers/UserController.js";  // ← updated controller name
import { protect } from "../middleware/verifyToken.js";
import { subscribeToPlan } from "../controllers/DriverProfileController.js";

const router = express.Router();

// Public routes (no auth needed)
router.post("/register", registerUser);
router.post('/verify-email', verifyEmailOtp);
router.post('/resend-otp', resendOtp);
router.post("/login", loginUser);
router.post("/authlogin", authLogin)
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.get("/verify-email-change/:token", confirmEmailChange); // token-based, no auth

// Public driver discovery (no auth needed for listing)
router.get("/available-drivers", getAvailableDrivers);
router.post('/e-auth/request', requestEAuthOtp);
router.post('/e-auth/verify', verifyEAuthOtp);
// router.get("/nearby-drivers", getNearbyDrivers);

// Protected routes (require JWT)
router.use(protect);

router.get("/dashboard", getDashboard);
router.put("/profile", updateProfile);              // Update own profile
router.post("/change-password", changePassword);
router.post("/change-email", changeEmail);
router.delete("/delete-account", deleteAccount);
router.get("/profile", getUserProfile);             // /profile → current user
router.get("/profile/:id", getUserProfile);         // /profile/:id → any user (public view)

// Admin / driver listing (still protected, but can be restricted further)
router.get("/drivers", getDrivers);
router.get("/clients", getClients);
router.get("/stats", getOverviewStats);  
router.get("/stats-timeline", getPaymentTimeline);  
router.get("/profiledisplay", getFullProfile)           // Overview stats
router.get('/profile2', protect, getUserProfile);
router.post('/subscribe', protect, subscribeToPlan);
// route
router.get('/profile-completion', protect, getProfileCompletionStatus);
router.post('/drivers/:id/like', toggleLikeProvider)
router.post('/drivers/:id/share', shareProvider)
router.post('/drivers/:id/view', incrementDriverView)
router.post('/drivers/:driverId/view',  incrementDriverViews);
router.get('/search-by-name', searchDriversByName);
export default router;