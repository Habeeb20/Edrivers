// src/components/EAuthLogin.jsx
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Mail, ArrowRight, Loader2 } from 'lucide-react';
import { authloginAsync } from '../../store/slices/userSlice';

const PRIMARY = '#3B82F6';
const PRIMARY_DARK = '#1D4ED8';

export default function EAuthLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, token, user } = useSelector((state) => state.user);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = (data) => {
    dispatch(authloginAsync({ email: data.email.trim() }));
  };

  // Handle successful login
  useEffect(() => {
    if (token && user) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userId', user.id || '');

      toast.success('Welcome back!', {
        description: 'You’ve been signed in with e-Auth.',
        duration: 2800,
        style: {
          background: '#10B981',
          color: 'white',
        },
      });

      // Small delay so user sees the toast
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 900);

      reset(); // clear form
    }
  }, [token, user, navigate, reset]);

  // Show error toast when login fails
  useEffect(() => {
    if (error) {
      toast.error('Login failed', {
        description: error || 'Please check your email and try again.',
        duration: 5000,
        style: {
          background: '#EF4444',
          color: 'white',
        },
      });
    }
  }, [error]);

  return (
    <div className="w-full max-w-md mx-auto px-5 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative rounded-3xl bg-white/75 backdrop-blur-xl border border-white/40 shadow-2xl shadow-blue-500/15 overflow-hidden"
      >
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-indigo-50/20 to-transparent pointer-events-none" />

        <div className="relative px-8 pt-10 pb-12 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30 mx-auto">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">
              Sign in with Email
            </h2>
            <p className="text-gray-600">
              We'll send you a magic link — no password required
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />

                <input
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="name@example.com"
                  className={`w-full pl-11 pr-5 py-3.5 rounded-xl border bg-white/90
                    focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500
                    placeholder:text-gray-400 transition-all shadow-sm
                    ${errors.email ? 'border-red-400' : 'border-gray-200'}`}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Please enter a valid email address',
                    },
                  })}
                />
              </div>

              {errors.email && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={loading || !isValid}
              whileHover={{ scale: loading || !isValid ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white shadow-lg transition-all
                ${
                  loading || !isValid
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                }`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Send Magic Link</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </motion.button>
          </form>

          <p className="text-center text-sm text-gray-500 pt-2">
            By continuing you agree to our Terms of Service
          </p>
        </div>
      </motion.div>
    </div>
  );
}