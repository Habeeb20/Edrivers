



/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector,} from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { User, Mail, Lock, UserCheck, Eye, EyeOff, Facebook } from 'lucide-react';
import LoadingSpinner from '../../utils/LoadingSpinner';

import { signupAsync } from '../../store/slices/userSlice';

const PRIMARY_500 = '#3b82f6';  // blue-500
const PRIMARY_700 = '#2563eb';  // blue-600

const Signup = () => {
    const [searchParams] = useSearchParams();  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, successMessage, user, token } = useSelector((state) => state.user);

  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: { role: 'client' },
  });

    useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      // Store it in localStorage so it survives page refresh / navigation
      localStorage.setItem('referralCode', refCode.trim().toUpperCase());
    }
  }, [searchParams]);

  const onSubmit = async (data) => {
      const referralCode = localStorage.getItem('referralCode') || undefined;
         const signupData = {
      ...data,
      referralCode,           // ← this is what the backend expects
    };

    dispatch(signupAsync(signupData));
  };

  useEffect(() => {
    if (token && user) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      toast.success(successMessage || 'Account created successfully!', {
        description: 'Welcome to your e-drivers. Redirecting to dashboard...',
        duration: 3000,
      });

      setTimeout(() => navigate('/dashboard'), 2000);
    }
  }, [token, user, successMessage, navigate]);

  useEffect(() => {
    if (error) {
      toast.error('Signup Failed', {
        description: error,
        duration: 6000,
        action: {
          label: 'Try Again',
          onClick: () => reset(),
        },
      });
    }
  }, [error, reset]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-blue-50">
        <LoadingSpinner message="Creating your account..." size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#3b82f6] to-transparent"></div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <motion.div className="text-center mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#3b82f6] to-[#2563eb] rounded-2xl flex items-center justify-center shadow-xl mb-6">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Create Account</h1>
            <p className="text-gray-600">Join thousands managing their finances seamlessly</p>
          </motion.div>

          {/* Form Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <input
                    {...register('firstName', { required: 'First name is required' })}
                    type="text"
                    placeholder="First Name"
                    className="w-full pl-10 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#3b82f6] focus:ring-4 focus:ring-[#3b82f6]/20 transition"
                  />
                  <User className="absolute left-3 top-4 h-5 w-5 text-gray-400" />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                </div>

                <div className="relative">
                  <input
                    {...register('lastName', { required: 'Last name is required' })}
                    type="text"
                    placeholder="Last Name"
                    className="w-full pl-10 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#3b82f6] focus:ring-4 focus:ring-[#3b82f6]/20 transition"
                  />
                  <User className="absolute left-3 top-4 h-5 w-5 text-gray-400" />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                </div>
              </div>

              <div className="relative">
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                  })}
                  type="email"
                  placeholder="Email Address"
                  className="w-full pl-10 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#3b82f6] focus:ring-4 focus:ring-[#3b82f6]/20 transition"
                />
                <Mail className="absolute left-3 top-4 h-5 w-5 text-gray-400" />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div className="relative">
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create Password"
                  className="w-full pl-10 pr-12 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#3b82f6] focus:ring-4 focus:ring-[#3b82f6]/20 transition"
                />
                <Lock className="absolute left-3 top-4 h-5 w-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-4 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <div className="relative">
                <select
                  {...register('role', { required: 'Please select a role' })}
                  className="w-full pl-10 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#3b82f6] focus:ring-4 focus:ring-[#3b82f6]/20 transition appearance-none bg-white"
                >
                  <option value="">Choose your role</option>
                  <option value="client">User / Customer</option>
                  <option value="driver">Driver / Partner</option>
                </select>
                <UserCheck className="absolute left-3 top-4 h-5 w-5 text-gray-400" />
                {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all duration-300 disabled:opacity-70"
                style={{
                  background: `linear-gradient(135deg, ${PRIMARY_500}, ${PRIMARY_700})`,
                  boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)',
                }}
              >
                Create Account
              </motion.button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-[#3b82f6] hover:underline">
                Sign in here
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;

































































