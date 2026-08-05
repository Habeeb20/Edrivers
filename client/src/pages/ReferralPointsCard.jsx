import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Gift, TrendingUp, Users, Briefcase, Wallet, ArrowUpRight,
  CheckCircle2, Clock, XCircle, Loader2, Info, X, Sparkles,
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000/api';

const ACTION_ICONS = {
  'Referral Signup': Users,
  'Job Referral': Briefcase,
  'Referral Bonus': Gift,
  'Account Registration': Sparkles,
  'Hire Completed': CheckCircle2,
  'Completed Job as Provider': CheckCircle2,
  'Completed Job as Client': CheckCircle2,
};

export default function ReferralPointsCard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchBreakdown();
  }, []);

  const fetchBreakdown = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/loyalty/breakdown`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load points breakdown');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    setRedeeming(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/loyalty/redeem`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message);
        setShowRedeemModal(false);
        fetchBreakdown();
      } else {
        toast.error(json.message);
      }
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 flex justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  if (!data) return null;

  const progressPct = Math.min(100, (data.currentPoints / data.naira.minRedeemablePoints) * 100);

  return (
    <div className="space-y-6 mt-20">
      {/* Hero balance card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-600 rounded-3xl p-7 sm:p-8 text-white shadow-xl"
      >
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-10 w-56 h-56 bg-black/10 rounded-full blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-2 text-indigo-100 text-sm font-medium mb-2">
            <Gift size={16} />
            Loyalty Points Balance
          </div>

          <div className="flex items-end gap-3 flex-wrap">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              {data.currentPoints.toLocaleString()}
            </h1>
            <span className="text-indigo-100 text-lg mb-1">points</span>
          </div>

          <p className="text-indigo-100 mt-1 text-sm">
            ≈ <span className="font-semibold text-white">₦{data.naira.currentValue.toLocaleString()}</span> redeemable value
          </p>

          {/* Progress bar toward minimum redeemable */}
          <div className="mt-6">
            <div className="flex justify-between text-xs text-indigo-100 mb-1.5">
              <span>Progress to redemption eligibility</span>
              <span>{data.currentPoints?.toLocaleString()} / {data.naira?.minRedeemablePoints?.toLocaleString()}</span>
            </div>
            <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-white rounded-full"
              />
            </div>
            {!data.naira.canRedeem && (
              <p className="text-xs text-indigo-100 mt-1.5">
                {data.naira.pointsShortOfMin.toLocaleString()} more points needed to redeem
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={() => setShowRedeemModal(true)}
              disabled={!data.naira.canRedeem}
              className="flex items-center gap-2 bg-white text-indigo-700 font-semibold px-5 py-3 rounded-xl hover:bg-indigo-50 transition disabled:bg-white/40 disabled:text-indigo-300 disabled:cursor-not-allowed"
            >
              <Wallet size={18} />
              Redeem Points
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 bg-white/15 text-white font-medium px-5 py-3 rounded-xl hover:bg-white/25 transition"
            >
              <Clock size={18} />
              {showHistory ? 'Hide' : 'View'} History
            </button>
          </div>

          {!data.hasWalletLinked && (
            <div className="mt-4 flex items-start gap-2 bg-amber-400/20 border border-amber-300/30 rounded-xl p-3 text-xs text-amber-50">
              <Info size={14} className="shrink-0 mt-0.5" />
              Link your bank/wallet details in Settings before you can redeem points.
            </div>
          )}
        </div>
      </motion.div>

      {/* How you earn points */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-7">
        <h3 className="font-bold text-gray-900 text-lg mb-1">How You Earn Points</h3>
        <p className="text-gray-500 text-sm mb-5">Here's a breakdown of every way you can earn loyalty points.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
            <div className="p-3 bg-emerald-100 rounded-xl text-emerald-700">
              <Users size={20} />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Referral Signup</p>
              <p className="text-sm text-gray-500">+20 points per signup</p>
            </div>
          </div>
          {/* <div className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50 border border-blue-100">
            <div className="p-3 bg-blue-100 rounded-xl text-blue-700">
              <Briefcase size={20} />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Job Referral</p>
              <p className="text-sm text-gray-500">+10 points per referral</p>
            </div>
          </div> */}
        </div>

        {/* Actual breakdown from transaction history */}
        {data.breakdown.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700">Your Earnings So Far</p>
            {data.breakdown.map((item) => {
              const Icon = ACTION_ICONS[item.label] || TrendingUp;
              return (
                <div
                  key={item.label}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-600">
                      <Icon size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.count}x earned</p>
                    </div>
                  </div>
                  <span className="font-bold text-emerald-600">+{item.totalPoints}</span>
                </div>
              );
            })}
          </div>
        )}

        {data.breakdown.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            No points earned yet. Start referring friends and jobs to earn your first points!
          </div>
        )}
      </div>

      {/* Transaction / redemption history (collapsible) */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-7 space-y-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Recent Point Activity</h3>
                <div className="space-y-2">
                  {data.recentTransactions.map((tx, i) => (
                    <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-gray-800">{tx.label}</p>
                        <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleString()}</p>
                      </div>
                      <span className="font-semibold text-emerald-600">+{tx.amount}</span>
                    </div>
                  ))}
                  {data.recentTransactions.length === 0 && (
                    <p className="text-sm text-gray-400 py-4 text-center">No activity yet</p>
                  )}
                </div>
              </div>

              {data.redemptionHistory.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Redemption Requests</h3>
                  <div className="space-y-2">
                    {data.redemptionHistory.map((r) => (
                      <div key={r._id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 text-sm">
                        <div>
                          <p className="font-medium text-gray-900">₦{r.amountRequested.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">{new Date(r.requestedAt).toLocaleDateString()}</p>
                        </div>
                        <StatusBadge status={r.status} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Redeem confirmation modal */}
      <AnimatePresence>
        {showRedeemModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setShowRedeemModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-7"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Confirm Redemption</h2>
                <button onClick={() => setShowRedeemModal(false)}>
                  <X size={22} className="text-gray-400 hover:text-gray-600" />
                </button>
              </div>

              <div className="bg-indigo-50 rounded-2xl p-5 mb-5 text-center">
                <p className="text-sm text-gray-600 mb-1">You are about to redeem</p>
                <p className="text-3xl font-extrabold text-indigo-700">
                  ₦{data.naira.currentValue.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 mt-1">({data.currentPoints.toLocaleString()} points)</p>
              </div>

              <p className="text-sm text-gray-600 mb-6">
                Once submitted, our team will review and transfer the amount to your linked bank account.
                This may take 24–48 hours.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowRedeemModal(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRedeem}
                  disabled={redeeming}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
                >
                  {redeeming ? <Loader2 size={18} className="animate-spin" /> : <ArrowUpRight size={18} />}
                  {redeeming ? 'Submitting...' : 'Confirm'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatusBadge({ status }) {
  const config = {
    pending: { icon: Clock, className: 'bg-amber-100 text-amber-700' },
    approved: { icon: CheckCircle2, className: 'bg-emerald-100 text-emerald-700' },
    rejected: { icon: XCircle, className: 'bg-red-100 text-red-700' },
  }[status] || { icon: Clock, className: 'bg-gray-100 text-gray-600' };

  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium capitalize ${config.className}`}>
      <Icon size={12} />
      {status}
    </span>
  );
}