


// src/pages/Driver/DriverHireOnDemandSubscription.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Car, Zap, Shield, Star, CreditCard, CheckCircle, AlertCircle, MapPin, Globe, 
  Loader2, DollarSign, Clock, BadgeCheck 
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const DriverHireOnDemandSubscription = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [subscriptionAmount, setSubscriptionAmount] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null); // 'none', 'pending', 'active', 'expired'
  const [selectedPlan, setSelectedPlan] = useState('within-state');
  const [selectedLevel, setSelectedLevel] = useState('premium');
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, success, failed, error

  const token = localStorage.getItem('token');

  // Handle Paystack callback from URL
  useEffect(() => {
    const status = searchParams.get('status');
    if (status === 'success') {
      setPaymentStatus('success');
      setSubscriptionStatus('pending'); // or 'active' depending on your backend
      toast.success('🎉 Subscription successful! Awaiting admin approval.');
      
      // Refresh subscription status
      fetchSubscriptionStatus();

      // Auto-redirect to dashboard after 5 seconds
      const timer = setTimeout(() => {
        navigate('/driver/dashboard');
      }, 5000);

      return () => clearTimeout(timer);
    } else if (status === 'failed') {
      setPaymentStatus('failed');
      toast.error('Payment failed. Please try again.');
    } else if (status === 'error') {
      setPaymentStatus('error');
      toast.error('Something went wrong. Please contact support.');
    }
  }, [searchParams, navigate]);

  // Fetch subscription status & amount
  const fetchSubscriptionStatus = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/hire-on-demand/subscription-status`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
console.log(res.data)
      if (res.data.success) {
        setSubscriptionStatus(res.data.status || 'none');
        setSubscriptionAmount(res.data.amount || null);
        setSelectedPlan(res.data.plan || 'within-state');
        setSelectedLevel(res.data.serviceLevel || 'premium');
      }
    } catch (err) {
      console.error('Subscription status error:', err);
      toast.error('Failed to check subscription status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const handleSubscribe = async () => {
    if (subscribing) return;
    setSubscribing(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/hire-on-demand/subscribe`,
        {
          plan: selectedPlan,
          serviceLevel: selectedLevel
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.info('Redirecting to Paystack...');
        window.location.href = res.data.authorization_url;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start subscription');
      console.error(err.response?.data);
    } finally {
      setSubscribing(false);
    }
  };

  // Already subscribed / success state
  if (subscriptionStatus === 'active' || subscriptionStatus === 'pending' || paymentStatus === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-emerald-50 px-4"
      >
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-10 md:p-12 text-center border border-green-100">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-8">
            <BadgeCheck className="h-16 w-16 text-green-600" />
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
            You're In!
          </h1>

          <p className="text-xl text-gray-700 mb-6">
            Your <strong>Hire on Demand</strong> subscription is {subscriptionStatus === 'pending' ? 'pending approval' : 'active'}.
          </p>

          <p className="text-lg text-gray-600 mb-10">
            You'll start receiving priority job requests soon. Thank you for joining!
          </p>

          <button
            onClick={() => navigate('/dashboard')}
            className="px-10 py-5 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xl font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
          >
            Go to Dashboard
          </button>

          {paymentStatus === 'success' && (
            <p className="mt-8 text-sm text-gray-500">
              Redirecting automatically in a few seconds...
            </p>
          )}
        </div>
      </motion.div>
    );
  }

  // Not subscribed – show form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
            Unlock <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Hire on Demand</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Get priority access to premium clients and high-paying jobs as a certified driver.
          </p>

          {subscriptionAmount && (
            <div className="inline-flex items-center gap-3 px-6 py-4 bg-white rounded-2xl shadow-md">
              <DollarSign className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">
                One-time fee: ₦{subscriptionAmount.toLocaleString()}
              </span>
            </div>
          )}
        </motion.div>

        {/* Benefits Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: Zap, color: 'indigo', title: 'Priority Matching', desc: 'Get matched first with premium clients' },
            { icon: Star, color: 'amber', title: 'Higher Earnings', desc: 'Access executive & long-distance jobs' },
            { icon: Shield, color: 'green', title: 'Verified Badge', desc: 'Stand out with "Hire on Demand Certified"' }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all border border-gray-100"
            >
              <div className={`inline-flex p-4 rounded-full bg-${item.color}-100 mb-6`}>
                <item.icon className={`h-10 w-10 text-${item.color}-600`} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">{item.title}</h3>
              <p className="text-gray-600 text-center">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Plan Selection */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-purple-100">
          <div className="grid md:grid-cols-2 gap-10">
            {/* Travel Range */}
            <div>
              <label className="block text-2xl font-bold text-gray-900 mb-6 text-center md:text-left">
                Travel Range
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <button
                  onClick={() => setSelectedPlan('within-state')}
                  className={`p-8 rounded-2xl border-2 transition-all text-left group ${
                    selectedPlan === 'within-state'
                      ? 'border-indigo-600 bg-indigo-50 shadow-lg'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                  }`}
                >
                  <MapPin className={`h-12 w-12 mb-6 ${selectedPlan === 'within-state' ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-500'}`} />
                  <h3 className="text-xl font-bold mb-2">Within State</h3>
                  <p className="text-gray-600">Local trips within your state</p>
                </button>

                <button
                  onClick={() => setSelectedPlan('interstate')}
                  className={`p-8 rounded-2xl border-2 transition-all text-left group ${
                    selectedPlan === 'interstate'
                      ? 'border-purple-600 bg-purple-50 shadow-lg'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                  }`}
                >
                  <Globe className={`h-12 w-12 mb-6 ${selectedPlan === 'interstate' ? 'text-purple-600' : 'text-gray-400 group-hover:text-purple-500'}`} />
                  <h3 className="text-xl font-bold mb-2">Interstate</h3>
                  <p className="text-gray-600">Long-distance trips across states</p>
                </button>
              </div>
            </div>

            {/* Service Level */}
            <div>
              <label className="block text-2xl font-bold text-gray-900 mb-6 text-center md:text-left">
                Service Level
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <button
                  onClick={() => setSelectedLevel('chauffeur')}
                  className={`p-8 rounded-2xl border-2 transition-all text-left group ${
                    selectedLevel === 'chauffeur'
                      ? 'border-blue-600 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
                >
                  <Shield className={`h-12 w-12 mb-6 ${selectedLevel === 'chauffeur' ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500'}`} />
                  <h3 className="text-xl font-bold mb-2">Chauffeur</h3>
                  <p className="text-gray-600">Professional & discreet service</p>
                </button>

                <button
                  onClick={() => setSelectedLevel('premium')}
                  className={`p-8 rounded-2xl border-2 transition-all text-left group ${
                    selectedLevel === 'premium'
                      ? 'border-amber-600 bg-amber-50 shadow-lg'
                      : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/50'
                  }`}
                >
                  <Star className={`h-12 w-12 mb-6 ${selectedLevel === 'premium' ? 'text-amber-600 fill-amber-600' : 'text-gray-400 group-hover:text-amber-500'}`} />
                  <h3 className="text-xl font-bold mb-2">Premium</h3>
                  <p className="text-gray-600">Luxury experience & VIP treatment</p>
                </button>
              </div>
            </div>
          </div>

          {/* Subscribe Button */}
          <div className="mt-12 text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubscribe}
              disabled={subscribing || !selectedPlan || !selectedLevel}
              className={`w-full md:w-auto px-12 py-6 rounded-3xl text-white text-xl font-bold shadow-2xl transition-all flex items-center justify-center gap-3 ${
                subscribing || !selectedPlan || !selectedLevel
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-3xl hover:brightness-105'
              }`}
            >
              {subscribing ? (
                <>
                  <Loader2 className="h-7 w-7 animate-spin" />
                  Processing...
                </>
              ) : (
                "Subscribe Now 50,000"
              )}
            </motion.button>

            <p className="mt-6 text-sm text-gray-500 flex items-center justify-center gap-2">
              <CreditCard className="h-5 w-5" />
              Secure payment powered by Paystack
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverHireOnDemandSubscription;