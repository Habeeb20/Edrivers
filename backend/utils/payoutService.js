import mongoose from 'mongoose';
import Hire from '../models/Hire.js';
import User from '../models/User.js';

import Report from '../models/report.js';
import Payout from '../models/payment/Payout.js';
import PlatformSettings from '../models/payment/PlatformSetting.js';
import { ps, resolveBankCode } from './paystack.js';

const kobo = (n) => Math.round(n * 100);
export const getSettings = () =>
  PlatformSettings.findOneAndUpdate({ key: 'default' }, { $setOnInsert: { key: 'default' } }, { upsert: true, new: true });

export const splitHire = (h, s) => {
  const hire = Math.round((kobo(h.amount) * s.driverHirePercent) / 100);
  const callOut = Math.round((kobo(h.callOutCharge || 0) * s.driverCallOutPercent) / 100);
  return { hire: hire / 100, callOut: callOut / 100, total: (hire + callOut) / 100 };
};

// Ended + paid + not refunded + not already paid out + no open report (held)
const eligibleFilter = async (extra = {}) => ({
  status: 'ended',
  paymentStatus: { $in: ['success', 'paid'] },
  'payout.status': { $in: ['unpaid', null] },
  'refund.status': { $in: ['none', null] },
  _id: { $nin: await Report.distinct('hire', { status: { $in: ['pending', 'reviewing'] } }) },
  ...extra,
});

export async function pendingPreview() {
  const s = await getSettings();
  const hires = await Hire.find(await eligibleFilter()).populate('driver', 'firstName lastName wallet.accountNumber wallet.bankName').lean();
  const map = {};
  for (const h of hires) {
    const id = String(h.driver._id);
    const sp = splitHire(h, s);
    const g = (map[id] ||= { driver: h.driver, hires: 0, driverAmount: 0, platformCut: 0 });
    g.hires++; g.driverAmount += sp.total; g.platformCut += h.amount + (h.callOutCharge || 0) - sp.total;
  }
  return Object.values(map);
}

const release = (payoutId) =>
  Hire.updateMany({ 'payout.payoutId': payoutId }, { $set: { 'payout.status': 'unpaid' }, $unset: { 'payout.payoutId': '' } });

export async function payDriver(driverId, { adminId, trigger = 'manual' } = {}) {
  const s = await getSettings();
  const driver = await User.findById(driverId);
  const w = driver?.wallet;
  if (!w?.accountNumber) throw new Error('Driver has no wallet account');

  // Atomically claim eligible hires so concurrent runs can never double-pay
  const payoutId = new mongoose.Types.ObjectId();
  await Hire.updateMany(await eligibleFilter({ driver: driverId }), { $set: { 'payout.status': 'processing', 'payout.payoutId': payoutId } });
  const hires = await Hire.find({ 'payout.payoutId': payoutId });
  if (!hires.length) return null;

  const items = hires.map((h) => {
    const sp = splitHire(h, s);
    return { hire: h._id, hireAmount: h.amount, callOutCharge: h.callOutCharge || 0, hirePercent: s.driverHirePercent,
      callOutPercent: s.driverCallOutPercent, driverHireShare: sp.hire, driverCallOutShare: sp.callOut, driverAmount: sp.total };
  });
  const total = items.reduce((a, i) => a + kobo(i.driverAmount), 0) / 100;
  const gross = hires.reduce((a, h) => a + h.amount + (h.callOutCharge || 0), 0);
  if (total < s.minPayoutAmount || total <= 0) { await release(payoutId); return { skipped: true, reason: 'Below minimum payout', total }; }

  const payout = await Payout.create({ _id: payoutId, driver: driverId, reference: `pay_${payoutId}`, trigger, items,
    totalAmount: total, platformCut: gross - total, initiatedBy: adminId,
    walletSnapshot: { accountNumber: w.accountNumber, accountName: w.accountName, bankName: w.bankName } });
  try {
    const bank_code = await resolveBankCode(w.bankName, w.bankCode);
    const rec = await ps('/transferrecipient', 'POST', { type: 'nuban', name: w.accountName || `${driver.firstName} ${driver.lastName}`,
      account_number: w.accountNumber, bank_code, currency: 'NGN' });
    const t = await ps('/transfer', 'POST', { source: 'balance', amount: kobo(total), recipient: rec.recipient_code,
      reason: `eDriver payout ${payout.reference}`, reference: payout.reference });
    payout.walletSnapshot.bankCode = bank_code;
    payout.paystack = { transferCode: t.transfer_code, recipientCode: rec.recipient_code, status: t.status };
    await payout.save(); // stays "processing" until webhook confirms
    return payout;
  } catch (e) {
    payout.status = 'failed'; payout.paystack = { failureReason: e.message }; await payout.save();
    await release(payoutId);
    throw e;
  }
}

export async function runAllPayouts(opts) {
  const results = [];
  for (const id of await Hire.distinct('driver', await eligibleFilter())) {
    try { results.push({ driver: id, result: await payDriver(id, opts) }); }
    catch (e) { results.push({ driver: id, error: e.message }); }
  }
  return results;
}

export async function settleTransfer(event, reference, reason) {
  const p = await Payout.findOne({ reference });
  if (!p || p.status !== 'processing') return;
  if (event === 'transfer.success') {
    p.status = 'success'; p.paidAt = new Date(); await p.save();
    await Hire.updateMany({ 'payout.payoutId': p._id }, { $set: { 'payout.status': 'paid' } });
  } else {
    p.status = 'failed'; p.paystack.failureReason = reason || event; await p.save();
    await release(p._id);
  }
}