// src/pages/auth/ResetPassword.jsx
// Beautiful reset password page: Password form with eye toggle, toasts, clean design.
// Token from URL params, submits to backend, redirects to login on success.

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from '../../utils/LoadingSpinner';
import { Link } from 'react-router-dom';

const PRIMARY_500 = '#3B82F6';
const PRIMARY_700 = '#1D4ED8';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();

  const onSubmit = async (data) => {
    if (data.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      const response = await axios.put(`${API_BASE}/api/users/reset-password/${token}`, { newPassword: data.password });
      toast.success('Password Reset', {
        description: response.data.message,
        duration: 3000,
        style: { background: PRIMARY_500, color: 'white' },
      });
      reset();
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      toast.error('Reset Failed', {
        description: error.response?.data?.message || 'Invalid or expired token',
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
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Reset Your Password</h1>
          <p className="text-gray-600 text-sm">Enter your new password.</p>
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
                <Lock className="h-4 w-4 text-gray-400" />
              </div>
              <input
                {...register('password', { 
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Min 6 characters' }
                })}
                type={showPassword ? "text" : "password"}
                className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all duration-200 placeholder:text-gray-400"
                placeholder="New password"
                style={{ borderColor: errors.password ? '#EF4444' : '#E5E7EB' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
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
              <span>{isSubmitting ? 'Resetting...' : 'Reset Password'}</span>
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

export default ResetPassword;