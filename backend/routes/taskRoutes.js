// backend/routes/taskRoutes.js
import express from 'express';
import { protect, superadmin } from '../middleware/verifyToken.js';
import { postTask,  verifyTaskPayment,
  getPendingTasks,
  manageTask,
  getAvailableTasks,
  getMyTasks,
  getMyApprovedTasks, } from '../controllers/taskController.js';

  

const router = express.Router();

router.post('/post', protect, postTask);
router.get('/callback', verifyTaskPayment);
router.get('/pending', protect, superadmin, getPendingTasks);
router.put('/manage/:taskId', protect, superadmin, manageTask);
router.get('/available', protect, getAvailableTasks); // for drivers
router.get('/my-tasks', protect, getMyTasks)
router.get("/approved-tasks", protect, getMyApprovedTasks)
export default router;