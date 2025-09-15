// src/pages/PasswordResetConfirm.jsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import apiClient from '../services/api-client';
import useToast from '../hooks/useToast';

function PasswordResetConfirm() {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('new_password');

  const onSubmit = async (data) => {
    try {
      await apiClient.post('/auth/users/reset_password_confirm/', {
        uid,
        token,
        new_password: data.new_password,
      });
      toast.addToast('Password reset successfully! You can now log in with your new password.', 'success');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      toast.addToast('Password reset failed. The link may have expired or is invalid.', 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Reset Password</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              {...register('new_password', { 
                required: 'New password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters'
                }
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.new_password && (
              <p className="text-red-500 text-sm mt-1">{errors.new_password.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Confirm New Password</label>
            <input
              type="password"
              {...register('re_new_password', { 
                required: 'Please confirm your new password',
                validate: value => value === password || 'Passwords do not match'
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.re_new_password && (
              <p className="text-red-500 text-sm mt-1">{errors.re_new_password.message}</p>
            )}
          </div>
          
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default PasswordResetConfirm;