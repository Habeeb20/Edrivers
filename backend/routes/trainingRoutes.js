// backend/routes/trainingRoutes.js
import express from 'express';
import { protect, superadmin } from '../middleware/verifyToken.js';
import { registerForTraining, getAllRegistrations, updateRegistrationStatus } from '../controllers/trainingController.js';


const router = express.Router();

router.post('/register', registerForTraining); 
router.get('/admin/all', protect, superadmin, getAllRegistrations);
router.put('/admin/:id/status', protect, superadmin, updateRegistrationStatus)
export default router;