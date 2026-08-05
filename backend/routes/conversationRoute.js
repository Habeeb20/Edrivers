// routes/conversationRoutes.js
import express from 'express';
import { protect } from '../middleware/verifyToken.js';
import {
  sendMessage,
  getMyConversations,
  getMessages,
  markMessagesAsRead,
//   getMyAcceptedDrivers,
//   getMyAcceptedHireRequests,
} from '../controllers/ConversationController.js';

const router = express.Router();

router.use(protect); // All chat routes require auth

// ─── Conversations ─────────────────────────────────────────────────
router.get('/conversations', getMyConversations);
router.get('/conversations/:conversationId/messages', getMessages);
router.post('/conversations/:conversationId/messages', sendMessage);
router.put('/conversations/:conversationId/read', markMessagesAsRead);

// ─── Accepted hires (chat-enabled) ─────────────────────────────────
// router.get('/my-accepted-drivers', getMyAcceptedDrivers);         // Client view
// router.get('/my-accepted-hires', getMyAcceptedHireRequests);      // Driver view

export default router;