/* eslint-disable no-unused-vars */
// src/pages/Client/PostTask.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Users, Shield, Clock, DollarSign, CheckCircle, AlertCircle, Send } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const PostATask = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('all');
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const status = searchParams.get('status');
    if (status === 'success') {
      setPaymentStatus('success');
      toast.success('Task posted successfully! Awaiting admin approval.');
      setTimeout(() => navigate('/dashboard'), 5000);
    } else if (status === 'failed') {
      setPaymentStatus('failed');
      toast.error('Payment failed. Please try again.');
    }
  }, [searchParams, navigate]);

  const handleSubmit = async () => {
    if (description.trim().length < 20) {
      toast.error('Description must be at least 20 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/tasks/post`,
        { description, visibility },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      window.location.href = res.data.authorization_url;
    } catch (err) {
      toast.error('Failed to post task');
      setLoading(false);
    }
  };

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <motion.div className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl w-full text-center">
          <CheckCircle className="h-24 w-24 text-green-600 mx-auto mb-8" />
          <h1 className="text-4xl font-bold mb-6">Task Posted Successfully!</h1>
          <p className="text-xl text-gray-700">Your task is now pending admin approval.</p>
          <p className="text-gray-600 mt-4">Redirecting to dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Post a Driving Task
          </h1>
          <p className="text-xl text-gray-600">
            Reach thousands of professional drivers instantly
          </p>
          <p className="text-3xl font-bold text-purple-600 mt-4">₦5,000</p>
          <p className="text-gray-600">One-time posting fee</p>
        </motion.div>

        <div className="bg-white rounded-3xl shadow-2xl p-10">
          <div className="space-y-8">
            <div>
              <label className="block text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-6 w-6 text-blue-600" />
                Describe Your Task, please be explicit as much as possible about the kind of driver you want
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="I need a reliable driver for school runs from Monday to Friday, 7am - 4pm. Must be punctual, have a clean record..."
                rows="10"
                className="w-full p-6 border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition"
              />
              <p className="text-sm text-gray-500 mt-2">{description.length}/2000 characters</p>
            </div>

            <div>
              <label className="block text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="h-6 w-6 text-green-600" />
                Who Should See This Task?
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setVisibility('all')}
                  className={`p-6 rounded-2xl border-2 transition-all ${
                    visibility === 'all'
                      ? 'border-purple-600 bg-purple-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Users className="h-10 w-10 mx-auto mb-3 text-purple-600" />
                  <p className="font-semibold">All Drivers</p>
                </button>
                <button
                  onClick={() => setVisibility('full-time')}
                  className={`p-6 rounded-2xl border-2 transition-all ${
                    visibility === 'full-time'
                      ? 'border-blue-600 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Shield className="h-10 w-10 mx-auto mb-3 text-blue-600" />
                  <p className="font-semibold">Full-time Only</p>
                </button>
                <button
                  onClick={() => setVisibility('short-term')}
                  className={`p-6 rounded-2xl border-2 transition-all ${
                    visibility === 'short-term'
                      ? 'border-green-600 bg-green-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Clock className="h-10 w-10 mx-auto mb-3 text-green-600" />
                  <p className="font-semibold">Short-term Only</p>
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={loading || description.trim().length < 20}
              className="w-full py-6 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-2xl font-bold rounded-3xl shadow-2xl hover:shadow-3xl transition flex items-center justify-center gap-4 disabled:opacity-70"
            >
              <Send className="h-8 w-8" />
              {loading ? 'Processing...' : 'Post Task - Pay ₦5,000'}
            </motion.button>

            <p className="text-center text-sm text-gray-500">
              Secure payment via Paystack
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostATask;