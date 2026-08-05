// routes/announcementRoutes.js
import express from 'express';
import { createAnnouncement, getAllAnnouncementsAdmin,updateAnnouncement,getAnnouncements, deleteAnnouncement } from '../controllers/announcementController.js';
import { protect } from '../middleware/verifyToken.js';
import { superadmin } from '../middleware/verifyToken.js';
const router = express.Router();

// Public routes for providers/clients
router.get('/', protect, getAnnouncements);

// Admin only routes
router.post('/', protect, superadmin, createAnnouncement);
router.get('/admin', protect, superadmin, getAllAnnouncementsAdmin);
router.put('/:id', protect, superadmin, updateAnnouncement);
router.delete('/:id', protect, superadmin, deleteAnnouncement);

export default router;