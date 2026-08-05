/* eslint-disable no-unused-vars */
// src/pages/Driver/SubscribeHireOnDemand.jsx
// Beautiful, responsive subscription component for drivers with Paystack integration

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { PaystackButton } from 'react-paystack';
import { motion } from 'framer-motion';
import { Car, CheckCircle, XCircle, DollarSign, Globe, Users, AlertTriangle, Mail } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const PUBLIC_KEY = 'pk_test_your_public_key_here'; // Replace with your Paystack test/live public key

const SubscribeHireOnDemand = () => {
  const [loading, setLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null); // null, 'pending', 'success', 'error'
  const [paymentReference, setPaymentReference] = useState(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      plan: '',
      serviceLevel: '',
      email: '', // Pre-fill from user profile if available
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/hire-on-demand/subscribe', data);
      if (res.data.authorization_url) {
        // Store reference for verification
        setPaymentReference(res.data.reference);
        // The Paystack button will handle redirection
      }
    } catch (err) {
      toast.error('Failed to initialize subscription');
      setLoading(false);
    }
  };

  // Paystack config
  const componentProps = {
    email: watch('email'),
    amount: 200000, // ₦2000 in kobo
    publicKey: PUBLIC_KEY,
    text: 'Subscribe Now - ₦2,000',
    onSuccess: (reference) => {
      setSubscriptionStatus('success');
      toast.success('Subscription payment successful! Awaiting admin approval.');
      // Optionally send reference to backend for verification
      verifyPayment(reference.reference);
    },
    onClose: () => {
      setSubscriptionStatus('error');
      toast.info('Payment closed. Subscription not completed.');
    },
  };

  const verifyPayment = async (ref) => {
    try {
      await axios.get(`/api/hire-on-demand/verify?reference=${ref}`);
    } catch (err) {
      console.error('Verification failed');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto p-6 bg-white rounded-3xl shadow-2xl my-8"
    >
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 flex items-center justify-center gap-3">
        <Car className="h-10 w-10 text-blue-600" />
        Subscribe to Hire on Demand
      </h1>

      <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
        Join our premium driver network for ₦2,000. Choose your plan and service level to start getting on-demand hires!
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Plan Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className="block">
            <span className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Globe className="h-6 w-6 text-green-600" />
              Travel Plan
            </span>
            <select
              {...register('plan', { required: 'Please select a plan' })}
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Plan</option>
              <option value="within-state">Within State</option>
              <option value="interstate">Interstate</option>
            </select>
            {errors.plan && <p className="mt-2 text-red-600 text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4" />{errors.plan.message}</p>}
          </label>

          <label className="block">
            <span className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Users className="h-6 w-6 text-purple-600" />
              Service Level
            </span>
            <select
              {...register('serviceLevel', { required: 'Please select service level' })}
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Level</option>
              <option value="chauffeur">Chauffeur</option>
              <option value="premium">Premium</option>
            </select>
            {errors.serviceLevel && <p className="mt-2 text-red-600 text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4" />{errors.serviceLevel.message}</p>}
          </label>
        </div>

        {/* Email */}
        <label className="block">
          <span className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Mail className="h-6 w-6 text-blue-600" />
            Email for Payment
          </span>
          <input
            {...register('email', { required: 'Email is required', pattern: /^\S+@\S+$/i })}
            type="email"
            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            placeholder="your@email.com"
          />
          {errors.email && <p className="mt-2 text-red-600 text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4" />Invalid email</p>}
        </label>

        {/* Payment Button */}
        <div className="text-center mt-10">
          <PaystackButton
            {...componentProps}
            className="px-12 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transition disabled:opacity-70"
            disabled={loading || !!errors.plan || !!errors.serviceLevel || !!errors.email}
          />
          <p className="mt-4 text-sm text-gray-500">Secure payment via Paystack</p>
        </div>

        {/* Status Feedback */}
        {subscriptionStatus === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-6 bg-green-100 rounded-xl text-green-800 flex items-center gap-4"
          >
            <CheckCircle className="h-8 w-8" />
            <p className="flex-1">Subscription submitted! Awaiting admin approval. We'll notify you soon.</p>
          </motion.div>
        )}

        {subscriptionStatus === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-6 bg-red-100 rounded-xl text-red-800 flex items-center gap-4"
          >
            <XCircle className="h-8 w-8" />
            <p className="flex-1">Payment cancelled. You can try again anytime.</p>
          </motion.div>
        )}
      </form>
    </motion.div>
  );
};

export default SubscribeHireOnDemand;