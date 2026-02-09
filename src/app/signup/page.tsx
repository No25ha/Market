'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { signUp } from '@/services/auth';
import { useAuth } from '@/hooks/useAuth';
import { SignUpData } from '@/types';
import { FiUser, FiMail, FiPhone, FiLock, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import Button from '@/components/ui/Button';


const SignUpPage = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpData>({
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      rePassword: '',
      phone: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (formData: SignUpData) => {
    setApiError(null);

    try {
      setLoading(true);
      const response = await signUp(formData);
      setSuccess(true);

      if (response.token && response.user) {
        const userId = response.user._id || (response.user as any).id;
        console.log('SignUp mapping User ID:', userId);

        login(response.token, {
          id: userId,
          name: response.user.name,
          email: response.user.email,
        });
      } else {
        console.error('SignUp invalid response:', response);
      }

      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Sign up failed';
      setApiError(error);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-linear-to-br from-green-50 to-white flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
            <FiCheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Created!</h2>
            <p className="text-gray-600 mb-6">Redirecting to home page...</p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border border-blue-600 border-t-transparent" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-600 text-sm mt-2">Join us to start shopping</p>
          </div>

          {apiError && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
              <FiAlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  {...register('name', {
                    required: 'Full name is required',
                  })}
                  type="text"
                  id="name"
                  placeholder="Your full name"
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-50 text-sm"
                />
              </div>
              {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  type="email"
                  id="email"
                  placeholder="you@example.com"
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-50 text-sm"
                />
              </div>
              {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  {...register('phone', {
                    required: 'Phone is required',
                    pattern: {
                      value: /^01[0125][0-9]{8}$/,
                      message: 'Invalid Egyptian phone number (must start with 010, 011, 012, or 015 and be 11 digits)',
                    },
                  })}
                  type="tel"
                  id="phone"
                  placeholder="01xxxxxxxxx"
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-50 text-sm"
                />
              </div>
              {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  type="password"
                  id="password"
                  placeholder="••••••"
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-50 text-sm"
                />
              </div>
              {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="rePassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  {...register('rePassword', {
                    required: 'Please confirm your password',
                    validate: (value) =>
                      value === password || 'Passwords do not match',
                  })}
                  type="password"
                  id="rePassword"
                  placeholder="••••••"
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-50 text-sm"
                />
              </div>
              {errors.rePassword && <p className="text-red-600 text-xs mt-1">{errors.rePassword.message}</p>}
            </div>

            {/* Sign Up Button */}
            <Button
              type="submit"
              isLoading={loading}
              className="w-full mt-6"
            >
              Sign Up
            </Button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center border-t border-gray-100 pt-6">
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <Link href="/signin" className="text-blue-600 font-semibold hover:text-blue-700">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
