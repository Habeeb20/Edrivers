import Hire from '../models/Hire.js';

import Refund from "../models/payment/Refund.js"
import { ps } from './paystack.js';

export async function refundHire(hireId, { amount, reason, adminId }) {
  const hire = await Hire.findById(hireId);
  if (!hire) throw new Error('Hire not found');
  if (!['cancelled', 'declined', 'rejected'].includes(hire.status)) throw new Error('Only cancelled/declined/rejected hires can be refunded');
  if (!['success', 'paid'].includes(hire.paymentStatus)) throw new Error('Hire was never paid');
  if (!hire.paymentReference) throw new Error('No Paystack reference on this hire');
  if (hire.refund?.status && hire.refund.status !== 'none') throw new Error('Hire already refunded / refund in progress');
  if (hire.payout?.status && hire.payout.status !== 'unpaid') throw new Error('Driver payout already started for this hire');

  const paid = hire.amount + (hire.callOutCharge || 0);
  const amt = amount ?? paid;
  if (!(amt > 0) || amt > paid) throw new Error(`Refund must be between ₦1 and ₦${paid}`);

  const r = await Refund.create({ hire: hire._id, client: hire.client, amount: amt, reason, paymentReference: hire.paymentReference, processedBy: adminId });
  try {
    const d = await ps('/refund', 'POST', { transaction: hire.paymentReference, amount: Math.round(amt * 100), customer_note: reason, merchant_note: `Admin ${adminId}` });
    r.paystackRefundId = String(d.id); r.status = d.status === 'processed' ? 'processed' : 'pending'; await r.save();
    hire.refund = { status: r.status, amount: amt, refundId: r._id }; await hire.save();
    return r;
  } catch (e) { r.status = 'failed'; r.failureReason = e.message; await r.save(); throw e; }
}

export async function settleRefund(event, paystackId, reason) {
  const r = await Refund.findOne({ paystackRefundId: String(paystackId) });
  if (!r) return;
  r.status = event === 'refund.processed' ? 'processed' : 'failed';
  if (r.status === 'failed') r.failureReason = reason;
  await r.save();
  await Hire.updateOne({ _id: r.hire }, { $set: { 'refund.status': r.status === 'failed' ? 'failed' : 'processed' } });
}