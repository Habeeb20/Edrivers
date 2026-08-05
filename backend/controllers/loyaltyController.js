
import Notification from '../models/Notification.js';
import { sendEmail } from '../utils/sendEmail.js';
import User from '../models/User.js';
import { POINTS_TO_NAIRA_RATE, MIN_REDEEMABLE_POINTS, LOYALTY_ACTION_LABELS } from '../utils/loyalty.js';


const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

// Wraps sendEmail so a failure NEVER breaks the calling logic.
const safeSendEmail = async ({ to, subject, html, text }) => {
  if (!to) {
    console.warn('safeSendEmail skipped: no recipient email provided');
    return;
  }
  try {
    await sendEmail({ to, subject, html, text });
  } catch (err) {
    console.error(`safeSendEmail FAILED (subject: "${subject}", to: ${to}):`, err.message);
  }
};


// GET /api/loyalty/breakdown
export const getLoyaltyBreakdown = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      'referralPoints totalPointsRedeemed loyaltyTransactions redemptionRequests wallet referralCount'
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const breakdown = {};
    for (const tx of user.loyaltyTransactions) {
      if (!breakdown[tx.type]) {
        breakdown[tx.type] = { label: LOYALTY_ACTION_LABELS[tx.type] || tx.type, count: 0, totalPoints: 0 };
      }
      breakdown[tx.type].count += 1;
      breakdown[tx.type].totalPoints += tx.amount || 0;
    }

    const totalEverEarned = user.loyaltyTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);

    res.json({
      success: true,
      data: {
        currentPoints: user.referralPoints,
        totalPointsRedeemed: user.totalPointsRedeemed,
        totalEverEarned,
        naira: {
          currentValue: user.referralPoints * POINTS_TO_NAIRA_RATE,
          minRedeemablePoints: MIN_REDEEMABLE_POINTS,
          canRedeem: user.referralPoints >= MIN_REDEEMABLE_POINTS,
          pointsShortOfMin: Math.max(0, MIN_REDEEMABLE_POINTS - user.referralPoints),
        },
        breakdown: Object.values(breakdown),
        recentTransactions: user.loyaltyTransactions
          .slice(-15)
          .reverse()
          .map((tx) => ({
            label: LOYALTY_ACTION_LABELS[tx.type] || tx.type,
            amount: tx.amount,
            createdAt: tx.createdAt,
          })),
        redemptionHistory: user.redemptionRequests
          .slice()
          .reverse()
          .map((r) => ({
            _id: r._id,
            pointsRequested: r.pointsRequested,
            amountRequested: r.amountRequested,
            status: r.status,
            requestedAt: r.requestedAt,
            approvedAt: r.approvedAt,
            rejectedAt: r.rejectedAt,
            rejectionReason: r.rejectionReason,
          })),
        hasWalletLinked: !!user.wallet?.accountNumber,
      },
    });
  } catch (err) {
    console.error('getLoyaltyBreakdown error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/loyalty/redeem
export const requestRedemption = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.referralPoints < MIN_REDEEMABLE_POINTS) {
      return res.status(400).json({
        success: false,
        message: `You need at least ${MIN_REDEEMABLE_POINTS} points (₦${MIN_REDEEMABLE_POINTS}) to redeem`,
      });
    }

    if (!user.wallet?.accountNumber || !user.wallet?.accountName || !user.wallet?.bankName) {
      return res.status(400).json({
        success: false,
        message: 'Please link your wallet/bank details before requesting a redemption',
      });
    }

    const hasPending = user.redemptionRequests.some((r) => r.status === 'pending');
    if (hasPending) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending redemption request. Please wait for it to be processed.',
      });
    }

    const pointsRequested = user.referralPoints;
    const amountRequested = pointsRequested * POINTS_TO_NAIRA_RATE;

    user.redemptionRequests.push({
      pointsRequested,
      amountRequested,
      status: 'pending',
      walletSnapshot: {
        accountNumber: user.wallet.accountNumber,
        accountName: user.wallet.accountName,
        bankName: user.wallet.bankName,
      },
    });

    await user.save();

    const newRequest = user.redemptionRequests[user.redemptionRequests.length - 1];

    await safeSendEmail({
      to: ADMIN_EMAIL,
      subject: `New Redemption Request — ${user.firstName} ${user.lastName}`,
      html: `
        <h2>New Loyalty Points Redemption Request</h2>
        <p><strong>User:</strong> ${user.firstName} ${user.lastName} (${user.email})</p>
        <p><strong>Points Requested:</strong> ${pointsRequested}</p>
        <p><strong>Amount:</strong> ₦${amountRequested.toLocaleString()}</p>
        <p><strong>Bank:</strong> ${user.wallet.bankName}</p>
        <p><strong>Account Name:</strong> ${user.wallet.accountName}</p>
        <p><strong>Account Number:</strong> ${user.wallet.accountNumber}</p>
      `,
    });

    res.json({
      success: true,
      message: 'Redemption request submitted. Our team will process it shortly.',
      request: newRequest,
    });
  } catch (err) {
    console.error('requestRedemption error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
// ────────────────────────────────────────────────────────────────
// ADMIN ENDPOINTS
// ────────────────────────────────────────────────────────────────

// GET /api/admin/loyalty/redemptions?status=pending


export const getAllRedemptionRequests = async (req, res) => {
  try {
    const { status } = req.query;

    const users = await User.find({
      'redemptionRequests.0': { $exists: true },
    }).select(
      'firstName lastName email phoneNumber referralPoints totalPointsRedeemed loyaltyTransactions redemptionRequests wallet'
    );

    const rows = [];
    for (const user of users) {
      for (const req_ of user.redemptionRequests) {
        if (status && status !== 'all' && req_.status !== status) continue;

        rows.push({
          requestId: req_._id,
          user: {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            currentPoints: user.referralPoints,
            totalPointsRedeemed: user.totalPointsRedeemed,
            actionsCount: user.loyaltyTransactions.length,
          },
          wallet: req_.walletSnapshot,
          pointsRequested: req_.pointsRequested,
          amountRequested: req_.amountRequested,
          status: req_.status,
          requestedAt: req_.requestedAt,
          approvedAt: req_.approvedAt,
          rejectedAt: req_.rejectedAt,
          rejectionReason: req_.rejectionReason,
        });
      }
    }

    rows.sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));
    res.json({ success: true, requests: rows });
  } catch (err) {
    console.error('getAllRedemptionRequests error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/admin/loyalty/users/:userId/actions
// Full breakdown of how a specific user earned their points
export const getUserLoyaltyActions = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select(
      'firstName lastName email loyaltyPoints totalPointsRedeemed loyaltyTransactions redemptionRequests wallet'
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        loyaltyPoints: user.loyaltyPoints,
        totalPointsRedeemed: user.totalPointsRedeemed,
        wallet: user.wallet,
      },
      actions: user.loyaltyTransactions
        .slice()
        .reverse()
        .map((tx) => ({
          label: LOYALTY_ACTION_LABELS[tx.type] || tx.type,
          amount: tx.amount,
          hireId: tx.hireId,
          createdAt: tx.createdAt,
        })),
      redemptionRequests: user.redemptionRequests,
    });
  } catch (err) {
    console.error('getUserLoyaltyActions error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/admin/loyalty/redemptions/:userId/:requestId/approve

export const approveRedemption = async (req, res) => {
  try {
    const { userId, requestId } = req.params;
    const admin = req.user;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const request = user.redemptionRequests.id(requestId);
    if (!request) return res.status(404).json({ success: false, message: 'Redemption request not found' });
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Request already ${request.status}` });
    }

    request.status = 'approved';
    request.approvedAt = new Date();
    request.approvedBy = admin._id;

    // CHANGED: deduct from referralPoints instead of loyaltyPoints
    user.referralPoints -= request.pointsRequested;
    user.totalPointsRedeemed += request.pointsRequested;

    await user.save();

    // ... rest (Notification.create, safeSendEmail) unchanged
  } catch (err) {
    console.error('approveRedemption error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


// PUT /api/admin/loyalty/redemptions/:userId/:requestId/reject
export const rejectRedemption = async (req, res) => {
  try {
    const { userId, requestId } = req.params;
    const { reason } = req.body;
    const admin = req.user;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const request = user.redemptionRequests.id(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Redemption request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Request already ${request.status}` });
    }

    request.status = 'rejected';
    request.rejectedAt = new Date();
    request.rejectedBy = admin._id;
    request.rejectionReason = reason || 'Not specified';

    await user.save();

    await Notification.create({
      user: user._id,
      type: 'redemption_rejected',
      title: 'Redemption Request Rejected',
      message: `Your redemption request was rejected. Reason: ${request.rejectionReason}`,
      priority: 'high',
    });

    await safeSendEmail({
      to: user.email,
      subject: 'Redemption Request Update',
      html: `
        <p>Hi ${user.firstName},</p>
        <p>Unfortunately, your redemption request for ₦${request.amountRequested.toLocaleString()} was not approved.</p>
        <p><strong>Reason:</strong> ${request.rejectionReason}</p>
        <p>Your points have not been deducted and remain in your account.</p>
      `,
    });

    res.json({ success: true, message: 'Redemption rejected', request });
  } catch (err) {
    console.error('rejectRedemption error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


























