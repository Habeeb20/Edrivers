import express from 'express';
import { protect } from '../middleware/verifyToken.js';
import { requireWalletToken } from '../middleware/walletAuth.js';

import {
  loginWallet,
  getAccountDetails,
  getBalance,
  transferFunds,
  getTransferHistory,
} from '../controllers/walletController.js';

const router = express.Router();

router.post('/login', protect, loginWallet);
router.get('/account-details', protect, getAccountDetails);
router.get('/balance', protect, requireWalletToken, getBalance);
router.post('/transfer', protect, requireWalletToken, transferFunds);
router.get('/transfer-history', protect, requireWalletToken, getTransferHistory);

export default router;