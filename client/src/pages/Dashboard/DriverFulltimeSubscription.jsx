



// // src/pages/Driver/DriverFulltimeSubscription.jsx
// import React, { useState, useEffect } from 'react';
// import { useNavigate, useSearchParams } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import {
//   Car, Shield, Star, Crown, Zap, CheckCircle, AlertCircle, CreditCard,
//   Clock, BadgeCheck, XCircle, Loader2
// } from 'lucide-react';
// import axios from 'axios';
// import { toast } from 'sonner';

// const PACKAGE_PRICING = {
//   premium: { amount: 300000, color: 'from-amber-500 to-yellow-500', label: 'Premium' },
//   gold: { amount: 500000, color: 'from-yellow-500 to-orange-500', label: 'Gold' },
//   classic: { amount: 200000, color: 'from-blue-500 to-indigo-500', label: 'Classic' },
//   chauffeur: { amount: 400000, color: 'from-purple-600 to-pink-600', label: 'Chauffeur' },
// };

// const DriverFulltimeSubscription = () => {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();

//   const [loading, setLoading] = useState(true);
//   const [subscribing, setSubscribing] = useState(false);
//   const [subscription, setSubscription] = useState(null); // null = not subscribed
//   const [selectedPackage, setSelectedPackage] = useState('classic');
//   const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, success, failed, error

//   const token = localStorage.getItem('token');

//   // Handle Paystack callback from URL
//   useEffect(() => {
//     const status = searchParams.get('status');
//     if (status) {
//       if (status === 'success') {
//         setPaymentStatus('success');
//         toast.success('Payment successful! Subscription pending admin approval.');
//         fetchSubscriptionStatus(); // Refresh status
//       } else if (status === 'failed') {
//         setPaymentStatus('failed');
//         toast.error('Payment failed. Please try again.');
//       } else {
//         setPaymentStatus('error');
//         toast.error('Something went wrong with payment.');
//       }
//       // Clean URL
//       navigate('/driver/fulltime-subscription', { replace: true });
//     }
//   }, [searchParams, navigate]);

//   // Fetch current subscription status
//   const fetchSubscriptionStatus = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.get(
//         `${import.meta.env.VITE_BACKEND_URL}/api/fulltime-hire/my-subscription`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       if (res.data.success) {
//         setSubscription(res.data.subscription || null);
//       }
//     } catch (err) {
//       console.error('Subscription status error:', err);
//       toast.error('Failed to check subscription status');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchSubscriptionStatus();
//   }, []);

//   const handleSubscribe = async () => {
//     if (subscribing) return;
//     setSubscribing(true);

//     try {
//       const res = await axios.post(
//         `${import.meta.env.VITE_BACKEND_URL}/api/fulltime-hire/subscribe`,
//         { packageType: selectedPackage },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       if (res.data.success) {
//         toast.info('Redirecting to Paystack...');
//         window.location.href = res.data.authorization_url;
//       }
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed to start subscription');
//     } finally {
//       setSubscribing(false);
//     }
//   };

//   // ──────────────────────────────────────────────
//   // Already Subscribed / Pending / Active / Declined State
//   // ──────────────────────────────────────────────
//   if (subscription) {
//     const status = subscription.subscriptionStatus;
//     const isPending = status === 'pending';
//     const isApproved = status === 'approved';
//     const isActive = status === 'active';
//     const isDeclined = status === 'declined';

//     return (
//       <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center px-4 py-12">
//         <motion.div
//           initial={{ opacity: 0, scale: 0.95 }}
//           animate={{ opacity: 1, scale: 1 }}
//           className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-10 md:p-12 text-center border border-green-100"
//         >
//           <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-8"
//             style={{ backgroundColor: isDeclined ? '#fee2e2' : isPending ? '#fef3c7' : '#dcfce7' }}
//           >
//             {isActive || isApproved ? (
//               <BadgeCheck className="h-16 w-16 text-green-600" />
//             ) : isPending ? (
//               <Clock className="h-16 w-16 text-yellow-600" />
//             ) : (
//               <XCircle className="h-16 w-16 text-red-600" />
//             )}
//           </div>

//           <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
//             {isActive || isApproved ? 'You are Subscribed!' : isPending ? 'Pending Approval' : 'Subscription Declined'}
//           </h1>

//           <div className="space-y-6 text-lg text-gray-700 mb-10">
//             <p>
//               <strong>Package:</strong> <span className="capitalize font-semibold">{subscription.package}</span>
//             </p>
//             <p>
//               <strong>Amount Paid:</strong> ₦{subscription.subscriptionAmount?.toLocaleString() || '—'}
//             </p>
//             <p>
//               <strong>Status:</strong>{' '}
//               <span className={`font-bold ${isActive || isApproved ? 'text-green-700' : isPending ? 'text-yellow-700' : 'text-red-700'}`}>
//                 {status.toUpperCase()}
//               </span>
//             </p>

//             {isDeclined && subscription.declineReason && (
//               <div className="mt-6 p-6 bg-red-50 rounded-xl border border-red-200">
//                 <p className="font-semibold text-red-800 mb-2">Decline Reason:</p>
//                 <p className="text-red-700">{subscription.declineReason}</p>
//               </div>
//             )}

//             {isActive && (
//               <p className="text-green-700 font-medium mt-4">
//                 You are now eligible to receive full-time hire requests!
//               </p>
//             )}
//           </div>

//           <button
//             onClick={() => navigate('/driver/dashboard')}
//             className="px-10 py-5 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xl font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all w-full md:w-auto"
//           >
//             Go to Dashboard
//           </button>
//         </motion.div>
//       </div>
//     );
//   }

//   // ──────────────────────────────────────────────
//   // Not Subscribed – Show Package Selection Form
//   // ──────────────────────────────────────────────
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-6xl mx-auto">
//         {/* Header */}
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="text-center mb-16"
//         >
//           <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
//             Become a <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Full-Time Driver</span>
//           </h1>
//           <p className="text-xl text-gray-600 max-w-4xl mx-auto">
//             Subscribe to get steady monthly income and priority full-time job requests.
//           </p>
//         </motion.div>

//         {/* Package Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
//           {Object.entries(PACKAGE_PRICING).map(([pkg, info]) => (
//             <motion.div
//               key={pkg}
//               whileHover={{ y: -10, scale: 1.05 }}
//               onClick={() => setSelectedPackage(pkg)}
//               className={`relative bg-white rounded-3xl shadow-2xl p-8 cursor-pointer border-4 transition-all duration-300 ${
//                 selectedPackage === pkg
//                   ? 'border-purple-600 shadow-purple-300 scale-105'
//                   : 'border-transparent hover:border-purple-300'
//               }`}
//             >
//               <div className={`absolute -top-6 left-1/2 -translate-x-1/2 px-10 py-3 rounded-full text-white font-bold text-lg bg-gradient-to-r ${info.color}`}>
//                 {info.label}
//               </div>

//               <div className="text-center mt-10">
//                 <p className="text-5xl font-bold text-gray-900">₦{info.amount.toLocaleString()}</p>
//                 <p className="text-gray-600 mt-2">One-time fee</p>
//               </div>

//               <div className="mt-10 space-y-5 text-gray-700">
//                 <p className="flex items-center justify-center gap-3">
//                   <Star className="h-6 w-6 text-yellow-500 fill-current" />
//                   Priority job matching
//                 </p>
//                 <p className="flex items-center justify-center gap-3">
//                   <Shield className="h-6 w-6 text-green-600" />
//                   Verified full-time badge
//                 </p>
//                 <p className="flex items-center justify-center gap-3">
//                   <Crown className="h-6 w-6 text-purple-600" />
//                   Exclusive client access
//                 </p>
//               </div>

//               {selectedPackage === pkg && (
//                 <div className="mt-10 text-center">
//                   <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
//                   <p className="text-green-600 font-bold">Selected</p>
//                 </div>
//               )}
//             </motion.div>
//           ))}
//         </div>

//         {/* Subscribe Button */}
//         <div className="text-center">
//           <motion.button
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             onClick={handleSubscribe}
//             disabled={subscribing || loading}
//             className={`px-16 py-6 rounded-3xl text-white text-2xl font-bold shadow-2xl transition-all flex items-center justify-center gap-4 mx-auto ${
//               subscribing || loading
//                 ? 'bg-gray-400 cursor-not-allowed'
//                 : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-3xl hover:scale-105'
//             }`}
//           >
//             {subscribing ? (
//               <>
//                 <Loader2 className="h-7 w-7 animate-spin" />
//                 Processing...
//               </>
//             ) : (
//               <>
//                 <CreditCard className="h-8 w-8" />
//                 Subscribe Now - ₦{PACKAGE_PRICING[selectedPackage].amount.toLocaleString()}
//               </>
//             )}
//           </motion.button>

//           <p className="mt-6 text-sm text-gray-600 flex items-center justify-center gap-2">
//             <CreditCard className="h-5 w-5" />
//             Secure payment powered by Paystack
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DriverFulltimeSubscription;























// src/pages/Driver/DriverFulltimeSubscription.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Car, Shield, Star, Crown, CheckCircle, CreditCard,
  Clock, BadgeCheck, XCircle, Loader2, Sparkles,
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const PACKAGE_PRICING = {
  // classic: {
  //   amount: 200000,
  //   label: 'Classic',
  //   gradient: 'from-blue-500 to-indigo-600',
  //   perks: ['Priority job matching', 'Verified full-time badge', 'Standard client access'],
  // },
  premium: {
    amount: 300000,
    label: 'Premium',
    gradient: 'from-amber-500 to-orange-500',
    perks: ['Priority job matching', 'Verified full-time badge', 'Exclusive client access', ],
  },
  gold: {
    amount: 500000,
    label: 'Gold',
    gradient: 'from-yellow-500 to-amber-600',
    featured: true,
    perks: ['Top-of-list job matching', 'Gold verified badge', 'Exclusive client access', 'Faster payout cycle', 'Dedicated support line'],
  },
  chauffeur: {
    amount: 400000,
    label: 'Chauffeur',
    gradient: 'from-purple-600 to-pink-600',
    perks: ['Executive client matching', 'Chauffeur verified badge', 'Exclusive client access', 'Faster payout cycle'],
  },
};

const STATUS_META = {
  pending:  { icon: Clock, ring: 'bg-amber-50', iconColor: 'text-amber-600', label: 'Pending Approval', text: 'text-amber-700' },
  approved: { icon: BadgeCheck, ring: 'bg-emerald-50', iconColor: 'text-emerald-600', label: 'You are Subscribed!', text: 'text-emerald-700' },
  active:   { icon: BadgeCheck, ring: 'bg-emerald-50', iconColor: 'text-emerald-600', label: 'You are Subscribed!', text: 'text-emerald-700' },
  declined: { icon: XCircle, ring: 'bg-red-50', iconColor: 'text-red-600', label: 'Subscription Declined', text: 'text-red-700' },
};

const DriverFulltimeSubscription = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState('gold');

  const token = localStorage.getItem('token');

  useEffect(() => {
    const status = searchParams.get('status');
    if (status) {
      if (status === 'success') {
        toast.success('Payment successful! Subscription pending admin approval.');
        fetchSubscriptionStatus();
      } else if (status === 'failed') {
        toast.error('Payment failed. Please try again.');
      } else {
        toast.error('Something went wrong with payment.');
      }
      navigate('/driver/fulltime-subscription', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, navigate]);

  const fetchSubscriptionStatus = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/fulltime-hire/my-subscription`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) setSubscription(res.data.subscription || null);
    } catch (err) {
      console.error('Subscription status error:', err);
      toast.error('Failed to check subscription status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubscribe = async () => {
    if (subscribing) return;
    setSubscribing(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/fulltime-hire/subscribe`,
        { packageType: selectedPackage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.info('Redirecting to Paystack...');
        window.location.href = res.data.authorization_url;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start subscription');
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-4 bg-gray-50">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
        <p className="text-gray-500 text-sm">Checking your subscription status…</p>
      </div>
    );
  }

  // ── Already subscribed / pending / declined ─────────────────────────
  if (subscription) {
    const meta = STATUS_META[subscription.subscriptionStatus] || STATUS_META.pending;
    const StatusIcon = meta.icon;
    const isDeclined = subscription.subscriptionStatus === 'declined';
    const isLive = ['active', 'approved'].includes(subscription.subscriptionStatus);

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10 sm:py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl w-full bg-white rounded-3xl shadow-xl p-6 sm:p-10 text-center border border-gray-100"
        >
          <div className={`inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full mb-5 sm:mb-6 ${meta.ring}`}>
            <StatusIcon className={`h-8 w-8 sm:h-10 sm:w-10 ${meta.iconColor}`} />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-5 sm:mb-6">{meta.label}</h1>

          <div className="rounded-2xl bg-gray-50 border border-gray-100 divide-y divide-gray-100 text-left mb-6">
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 text-sm sm:text-base">
              <span className="text-gray-500">Package</span>
              <span className="font-semibold text-gray-900 capitalize">{subscription.package}</span>
            </div>
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 text-sm sm:text-base">
              <span className="text-gray-500">Amount paid</span>
              <span className="font-semibold text-gray-900">₦{subscription.subscriptionAmount?.toLocaleString() || '—'}</span>
            </div>
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 text-sm sm:text-base">
              <span className="text-gray-500">Status</span>
              <span className={`font-bold ${meta.text}`}>{subscription.subscriptionStatus.toUpperCase()}</span>
            </div>
          </div>

          {isDeclined && subscription.declineReason && (
            <div className="mb-6 p-4 sm:p-5 bg-red-50 rounded-2xl border border-red-100 text-left">
              <p className="font-semibold text-red-800 mb-1 text-sm">Decline reason</p>
              <p className="text-red-700 text-sm">{subscription.declineReason}</p>
            </div>
          )}

          {isLive && (
            <p className="text-emerald-700 font-medium text-sm mb-6 flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4" />
              You're eligible to receive full-time hire requests!
            </p>
          )}

          <button
            onClick={() => navigate('/driver/dashboard')}
            className="w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-2xl shadow-md transition-colors"
          >
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Package selection ────────────────────────────────────────────────
  const selected = PACKAGE_PRICING[selectedPackage];

  return (
    <div className="min-h-screen bg-gray-50 py-10 sm:py-16 px-4 sm:px-6 pb-32 sm:pb-16">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10 sm:mb-14"
        >
          <p className="text-xs font-semibold tracking-[0.18em] text-indigo-600 uppercase mb-3">
            Driver subscription
          </p>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            Become a Full-Time Driver
          </h1>
          <p className="text-sm sm:text-lg text-gray-500 mt-3 sm:mt-4 max-w-2xl mx-auto">
            Subscribe once to unlock steady monthly income and priority full-time job requests.
          </p>
        </motion.div>

        {/* Package cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {Object.entries(PACKAGE_PRICING).map(([pkg, info]) => {
            const isSelected = selectedPackage === pkg;
            return (
              <motion.div
                key={pkg}
                whileHover={{ y: -4 }}
                onClick={() => setSelectedPackage(pkg)}
                className={`relative bg-white rounded-3xl p-5 sm:p-6 cursor-pointer border-2 transition-all ${
                  isSelected ? 'border-gray-900 shadow-xl' : 'border-gray-100 hover:border-gray-200 shadow-sm'
                } ${info.featured ? 'sm:scale-[1.03]' : ''}`}
              >
                {info.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide text-white bg-gradient-to-r from-yellow-500 to-amber-600 shadow">
                    MOST POPULAR
                  </span>
                )}

                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br ${info.gradient}`}>
                  <Crown className="h-5 w-5 text-white" />
                </div>

                <p className="text-sm font-semibold text-gray-500">{info.label}</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                  ₦{info.amount.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400 mb-4">One-time fee</p>

                <div className="space-y-2">
                  {info.perks.map((perk) => (
                    <div key={perk} className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
                      <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>

                <div
                  className={`mt-5 flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold rounded-xl py-2 border ${
                    isSelected ? 'bg-gray-900 text-white border-gray-900' : 'text-gray-400 border-gray-200'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <CheckCircle className="h-4 w-4" /> Selected
                    </>
                  ) : (
                    'Select plan'
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Fixed on mobile, inline on desktop */}
        <div className="fixed sm:static bottom-0 left-0 right-0 z-20 bg-white/95 sm:bg-transparent backdrop-blur sm:backdrop-blur-none border-t sm:border-0 border-gray-200 px-4 py-3 sm:py-0 sm:px-0 text-center">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubscribe}
            disabled={subscribing}
            className={`w-full sm:w-auto mx-auto px-8 sm:px-14 py-4 sm:py-5 rounded-2xl text-white text-base sm:text-xl font-bold shadow-lg transition-all flex items-center justify-center gap-3 ${
              subscribing ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-gray-900 to-gray-700 hover:shadow-xl'
            }`}
          >
            {subscribing ? (
              <>
                <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5 sm:h-6 sm:w-6" />
                Subscribe — ₦{selected.amount.toLocaleString()}
              </>
            )}
          </motion.button>

          <p className="mt-2 sm:mt-5 text-xs sm:text-sm text-gray-400 flex items-center justify-center gap-1.5">
            <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Secure payment powered by Paystack
          </p>
        </div>
      </div>
    </div>
  );
};

export default DriverFulltimeSubscription;