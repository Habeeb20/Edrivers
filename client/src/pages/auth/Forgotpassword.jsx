/* eslint-disable no-unused-vars */
// src/pages/auth/ForgotPassword.jsx
// Beautiful forgot password page: Simple email form, toasts for feedback, clean design with inline colors.

import React from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Mail, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from '../../utils/LoadingSpinner';
import { Link } from 'react-router-dom';

const PRIMARY_500 = '#3B82F6';
const PRIMARY_700 = '#1D4ED8';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const ForgotPassword = () => {
  const dispatch = useDispatch();  // If Redux clearError needed; optional
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await axios.post(`${API_BASE}/api/users/forgot-password`, data);
      toast.success('Reset Link Sent', {
        description: response.data.message,
        duration: 4000,
        style: { background: PRIMARY_500, color: 'white' },
      });
      reset();
      setTimeout(() => navigate('/login'), 2000);  // Optional auto-redirect
    } catch (error) {
      toast.error('Error', {
        description: error.response?.data?.message || 'Failed to send reset link',
        duration: 4000,
        style: { background: '#EF4444', color: 'white' },
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: `linear-gradient(135deg, ${PRIMARY_500}10 0%, #f9fafb 100%)` }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-6"
      >
        {/* Header */}
        <motion.header className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-md" style={{ background: `linear-gradient(135deg, ${PRIMARY_500}, ${PRIMARY_700})` }}>
            <Mail className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>
          <p className="text-gray-600 text-sm">Enter your email to receive a reset link.</p>
        </motion.header>

        {/* Form */}
        <motion.section
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6 space-y-4 border border-gray-100"
          style={{ boxShadow: `0 10px 25px rgba(0,0,0,0.05)` }}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="relative">
              <div className="absolute left-3 top-3 pointer-events-none">
                <Mail className="h-4 w-4 text-gray-400" />
              </div>
              <input
                {...register('email', { 
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' }
                })}
                type="email"
                className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all duration-200 placeholder:text-gray-400"
                placeholder="Enter your email"
                style={{ borderColor: errors.email ? '#EF4444' : '#E5E7EB' }}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting}
              className="w-full py-3 rounded-lg font-semibold text-white transition-all duration-200 shadow-md flex items-center justify-center space-x-2"
              style={{ 
                background: `linear-gradient(135deg, ${PRIMARY_500}, ${PRIMARY_700})`,
                boxShadow: `0 4px 14px 0 rgba(59, 130, 246, 0.4)`
              }}
            >
              <span>{isSubmitting ? 'Sending...' : 'Send Reset Link'}</span>
            </motion.button>
          </form>
        </motion.section>

        {/* Back Link */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Link 
            to="/login" 
            className="inline-flex items-center space-x-2 text-sm text-primary-600 hover:text-primary-700 transition-colors"
            style={{ color: PRIMARY_500 }}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Login</span>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;