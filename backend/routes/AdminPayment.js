import express from 'express';
import crypto from 'crypto';
import Report from '../models/report.js';
import Payout from '../models/payment/Payout.js';
import Refund from '../models/payment/Refund.js';
import Review from '../models/Review.js';

import Hire from '../models/Hire.js';
import AdminMessage from "../models/payment/AdminMessage.js"
import PlatformSettings from '../models/payment/PlatformSetting.js';       // ASSUMPTION: fields hire, driver, rating, comment
import {getSettings, pendingPreview, payDriver, runAllPayouts, settleTransfer } from '../utils/payoutService.js';
import {refundHire,  settleRefund } from '../utils/refundService.js';
import User from '../models/User.js';
import {protect } from "../middleware/verifyToken.js"

const router = express.Router();
const h = (fn) => (req, res) => Promise.resolve(fn(req, res)).catch((e) => res.status(400).json({ success: false, message: e.message }));
const page = (q) => { const p = Math.max(1, +q.page || 1), l = Math.min(100, +q.limit || 20); return { p, l, skip: (p - 1) * l }; };

// ---- Paystack webhook (mount with express.raw BEFORE express.json, see README) ----
export const paystackWebhook = async (req, res) => {
  const sig = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY).update(req.body).digest('hex');
  if (sig !== req.headers['x-paystack-signature']) return res.sendStatus(401);
  const { event, data } = JSON.parse(req.body);
  res.sendStatus(200);
  try {
    if (event.startsWith('transfer.')) await settleTransfer(event, data.reference, data.reason);
    if (event === 'refund.processed' || event === 'refund.failed') await settleRefund(event, data.id, data.status);
  } catch (e) { console.error('[paystack webhook]', e); }
};

router.use(protect, );

// ---- Overview ----
router.get('/overview', h(async (req, res) => {
  const paid = { paymentStatus: { $in: ['success', 'paid'] } };
  const [money] = await Hire.aggregate([{ $match: paid }, { $group: { _id: null, hireTotal: { $sum: '$amount' }, callOutTotal: { $sum: '$callOutCharge' }, count: { $sum: 1 } } }]);
  const byStatus = await Hire.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
  const [paidOut] = await Payout.aggregate([{ $match: { status: 'success' } }, { $group: { _id: null, total: { $sum: '$totalAmount' }, platform: { $sum: '$platformCut' } } }]);
  const [refunded] = await Refund.aggregate([{ $match: { status: { $in: ['processed', 'pending'] } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]);
  const owed = await pendingPreview();
  res.json({ success: true, data: {
    collected: { hire: money?.hireTotal || 0, callOut: money?.callOutTotal || 0, total: (money?.hireTotal || 0) + (money?.callOutTotal || 0), paidHires: money?.count || 0 },
    hiresByStatus: Object.fromEntries(byStatus.map((s) => [s._id, s.count])),
    paidToDrivers: paidOut?.total || 0, platformEarnedFromPaidOut: paidOut?.platform || 0, refunded: refunded?.total || 0,
    owedToDrivers: owed.reduce((a, d) => a + d.driverAmount, 0), openReports: await Report.countDocuments({ status: { $in: ['pending', 'reviewing'] } }),
  } });
}));

// ---- Hires list (filters: status, paymentStatus, payoutStatus, driver, client, from, to, q) ----
router.get('/hires', h(async (req, res) => {
  const { status, paymentStatus, payoutStatus, driver, client, from, to } = req.query;
  const f = {};
  if (status) f.status = status; if (paymentStatus) f.paymentStatus = paymentStatus;
  if (payoutStatus) f['payout.status'] = payoutStatus; if (driver) f.driver = driver; if (client) f.client = client;
  if (from || to) f.createdAt = { ...(from && { $gte: new Date(from) }), ...(to && { $lte: new Date(to) }) };
  if (req.query.q) f.$or = [{ hireReference: new RegExp(req.query.q, 'i') }, { paymentReference: new RegExp(req.query.q, 'i') }];
  const { p, l, skip } = page(req.query);
  const [rows, total] = await Promise.all([
    Hire.find(f).sort('-createdAt').skip(skip).limit(l).populate('client driver', 'firstName lastName email phone').lean(), Hire.countDocuments(f)]);
  const ids = rows.map((r) => r._id);
  const [reports, reviews] = await Promise.all([Report.aggregate([{ $match: { hire: { $in: ids } } }, { $group: { _id: '$hire', n: { $sum: 1 } } }]), Review.find({ hire: { $in: ids } }).select('hire rating').lean()]);
  const rc = Object.fromEntries(reports.map((r) => [r._id, r.n])), rv = Object.fromEntries(reviews.map((r) => [r.hire, r.rating]));
  res.json({ success: true, page: p, total, data: rows.map((r) => ({ ...r, totalPaid: r.amount + (r.callOutCharge || 0), reportCount: rc[r._id] || 0, reviewRating: rv[r._id] ?? null })) });
}));

router.get('/hires/:id', h(async (req, res) => {
  const hire = await Hire.findById(req.params.id).populate('client driver', 'firstName lastName email phone avatar').lean();
  if (!hire) return res.status(404).json({ success: false, message: 'Not found' });
  const [reports, review, refund, payout] = await Promise.all([Report.find({ hire: hire._id }).populate('reporter reportedUser', 'firstName lastName').lean(),
    Review.findOne({ hire: hire._id }).lean(), Refund.find({ hire: hire._id }).lean(), Payout.findOne({ 'items.hire': hire._id }).select('-items').lean()]);
  res.json({ success: true, data: { hire, reports, review, refund, payout } });
}));

// ---- Settings (percentages + schedule) ----
router.get('/settings', h(async (_, res) => res.json({ success: true, data: await getSettings() })));
router.put('/settings', h(async (req, res) => {
  const allowed = ['driverHirePercent', 'driverCallOutPercent', 'payoutSchedule', 'payoutWeekday', 'payoutMonthDay', 'autoPayout', 'minPayoutAmount'];
  const upd = Object.fromEntries(allowed.filter((k) => k in req.body).map((k) => [k, req.body[k]]));
  const s = await PlatformSettings.findOneAndUpdate({ key: 'default' }, { ...upd, updatedBy: req.user._id }, { new: true, upsert: true, runValidators: true });
  res.json({ success: true, data: s }); // applies to FUTURE payouts; each payout stores the % it used
}));

// ---- Payouts ----
router.get('/payouts/pending', h(async (_, res) => res.json({ success: true, data: await pendingPreview() })));
router.post('/payouts/run', h(async (req, res) => res.json({ success: true, data: await runAllPayouts({ adminId: req.user._id }) })));
router.post('/payouts/driver/:driverId', h(async (req, res) => res.json({ success: true, data: await payDriver(req.params.driverId, { adminId: req.user._id }) })));
router.get('/payouts', h(async (req, res) => {
  const { p, l, skip } = page(req.query); const f = req.query.status ? { status: req.query.status } : {};
  res.json({ success: true, page: p, total: await Payout.countDocuments(f), data: await Payout.find(f).sort('-createdAt').skip(skip).limit(l).populate('driver', 'firstName lastName').lean() });
}));
router.get('/payouts/:id', h(async (req, res) => res.json({ success: true, data: await Payout.findById(req.params.id).populate('driver items.hire').lean() })));

// ---- Refunds ----
router.get('/refunds', h(async (req, res) => {
  const { p, l, skip } = page(req.query);
  res.json({ success: true, page: p, data: await Refund.find().sort('-createdAt').skip(skip).limit(l).populate('client', 'firstName lastName email').populate('hire', 'hireReference status').lean() });
}));
router.post('/hires/:id/refund', h(async (req, res) => res.json({ success: true, data: await refundHire(req.params.id, { amount: req.body.amount, reason: req.body.reason, adminId: req.user._id }) })));

// ---- Reports ----
router.get('/reports', h(async (req, res) => {
  const { p, l, skip } = page(req.query); const f = {}; if (req.query.status) f.status = req.query.status; if (req.query.reason) f.reason = req.query.reason;
  res.json({ success: true, page: p, total: await Report.countDocuments(f), data: await Report.find(f).sort('-createdAt').skip(skip).limit(l)
    .populate('reporter reportedUser', 'firstName lastName email role').populate('hire', 'hireReference status amount').lean() });
}));
router.patch('/reports/:id', h(async (req, res) => {
  const { status, adminNotes } = req.body; const upd = { adminNotes };
  if (status) { upd.status = status; if (['resolved', 'dismissed'].includes(status)) { upd.resolvedAt = new Date(); upd.resolvedBy = req.user._id; } }
  res.json({ success: true, data: await Report.findByIdAndUpdate(req.params.id, upd, { new: true, runValidators: true }) });
}));

// ---- Messages to clients (in-app record; hook your mailer where marked) ----
router.post('/messages', h(async (req, res) => {
  const { to, subject, body, hire, report } = req.body;
  const user = await User.findById(to).select('email firstName'); if (!user) throw new Error('Client not found');
  const m = await AdminMessage.create({ to, from: req.user._id, subject, body, hire, report });
  // await sendEmail({ to: user.email, subject, text: body });   // <- plug in your existing mailer
  res.status(201).json({ success: true, data: m });
}));
router.get('/messages', h(async (req, res) => res.json({ success: true, data: await AdminMessage.find(req.query.to ? { to: req.query.to } : {}).sort('-createdAt').limit(100).populate('to', 'firstName lastName email').lean() })));

export default router;