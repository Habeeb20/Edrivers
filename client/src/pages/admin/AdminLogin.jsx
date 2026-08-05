/* eslint-disable no-unused-vars */
// src/pages/Admin/AdminLogin.jsx
// Beautiful Admin Login Page – clean, modern, centered with gradient background

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { Shield, Mail, Lock, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { loginAdminAsync } from '../../store/slices/adminSlice'; // We'll create this
import { useNavigate } from 'react-router-dom';
const AdminLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await dispatch(loginAdminAsync(data)).unwrap();
      toast.success('Welcome back, Admin! 👨‍💼');
navigate("/admin/dashboard")
    } catch (err) {
      toast.error(err || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-2xl p-10">
          <div className="text-center mb-8">
            <div className="inline-flex p-4 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl mb-6 shadow-lg">
              <Shield className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Portal</h1>
            <p className="text-gray-600 mt-2">Secure access to management dashboard</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                <input
                  {...register('email', { required: 'Email is required' })}
                  type="email"
                  className="w-full pl-12 pr-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition"
                  placeholder="admin@example.com"
                />
              </div>
              {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                <input
                  {...register('password', { required: 'Password is required' })}
                  type="password"
                  className="w-full pl-12 pr-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-4 text-lg font-bold text-white rounded-xl shadow-lg disabled:opacity-70"
              style={{
                background: 'linear-gradient(135deg, #9333EA, #4F46E5)',
                boxShadow: '0 10px 30px rgba(147, 51, 234, 0.4)',
              }}
            >
              {loading ? 'Signing in...' : (
                <>
                  <LogIn className="inline h-5 w-5 mr-2" />
                  Sign In
                </>
              )}
            </motion.button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-8">
            Restricted access • Only authorized administrators
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;