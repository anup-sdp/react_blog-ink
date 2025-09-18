// src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import useAuthContext from '../hooks/useAuthContext';
import useToast from '../hooks/useToast';
import Layout from '../components/Layout';

function Profile() {
  const { user, updateUserProfile, changePassword } = useAuthContext();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  
  const { 
    register: registerProfile, 
    handleSubmit: handleSubmitProfile, 
    formState: { errors: profileErrors }, 
    reset 
  } = useForm({
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      phone_number: user?.phone_number || '',
      location: user?.location || '',
      bio: user?.bio || '',
    }
  });

  const { 
    register: registerPassword, 
    handleSubmit: handleSubmitPassword, 
    formState: { errors: passwordErrors }, 
    reset: resetPassword,
    watch 
  } = useForm();

  // Watch the new_password field for validation
  const watchNewPassword = watch('new_password');

  useEffect(() => {
    if (user) {
      reset({
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone_number: user.phone_number || '',
        location: user.location || '',
        bio: user.bio || '',
      });
    }
  }, [user, reset]);

  const onProfileSubmit = async (data) => {
    console.log('Profile update data being sent:', data);
    console.log('Current user data:', user);
    
    try {
      const result = await updateUserProfile(data);
      console.log('Profile update result:', result);
      
      if (result.success) {
        toast.addToast('Profile updated successfully', 'success');
      } else {
        console.error('Profile update failed:', result.message);
        toast.addToast(result.message || 'Profile update failed', 'error');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.addToast('An error occurred while updating profile', 'error');
    }
  };

  const onPasswordSubmit = async (data) => {
    console.log('Password change data:', {
      current_password: data.current_password ? '***' : 'missing',
      new_password: data.new_password ? '***' : 'missing',
      re_new_password: data.re_new_password ? '***' : 'missing'
    });
    
    try {
      const result = await changePassword(data);
      console.log('Password change result:', result);
      
      if (result.success) {
        toast.addToast(result.message || 'Password changed successfully', 'success');
        resetPassword();
      } else {
        console.error('Password change failed:', result.message);
        toast.addToast(result.message || 'Password change failed', 'error');
      }
    } catch (error) {
      console.error('Password change error:', error);
      toast.addToast('An error occurred while changing password', 'error');
    }
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">My Profile</h1>
      
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'profile' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile Information
          </button>
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'password' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            onClick={() => setActiveTab('password')}
          >
            Change Password
          </button>
        </nav>
      </div>
      
      {activeTab === 'profile' && (
        <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2">Username</label>
              <input
                type="text"
                {...registerProfile('username', { required: 'Username is required' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                disabled
              />
              <p className="text-gray-500 text-sm mt-1">Username cannot be changed</p>
              {profileErrors.username && (
                <p className="text-red-500 text-sm mt-1">{profileErrors.username.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Email</label>
              <input
                type="email"
                {...registerProfile('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {profileErrors.email && (
                <p className="text-red-500 text-sm mt-1">{profileErrors.email.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">First Name</label>
              <input
                type="text"
                {...registerProfile('first_name', { required: 'First name is required' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {profileErrors.first_name && (
                <p className="text-red-500 text-sm mt-1">{profileErrors.first_name.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Last Name</label>
              <input
                type="text"
                {...registerProfile('last_name', { required: 'Last name is required' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {profileErrors.last_name && (
                <p className="text-red-500 text-sm mt-1">{profileErrors.last_name.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Phone Number</label>
              <input
                type="text"
                {...registerProfile('phone_number')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional"
              />
              {profileErrors.phone_number && (
                <p className="text-red-500 text-sm mt-1">{profileErrors.phone_number.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Location</label>
              <input
                type="text"
                {...registerProfile('location')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional"
              />
              {profileErrors.location && (
                <p className="text-red-500 text-sm mt-1">{profileErrors.location.message}</p>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Bio</label>
            <textarea
              {...registerProfile('bio')}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tell us about yourself (optional)"
            ></textarea>
            {profileErrors.bio && (
              <p className="text-red-500 text-sm mt-1">{profileErrors.bio.message}</p>
            )}
          </div>
          
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 transition"
          >
            Update Profile
          </button>
        </form>
      )}
      
      {activeTab === 'password' && (
        <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2">Current Password</label>
            <input
              type="password"
              {...registerPassword('current_password', { required: 'Current password is required' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {passwordErrors.current_password && (
              <p className="text-red-500 text-sm mt-1">{passwordErrors.current_password.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              {...registerPassword('new_password', { 
                required: 'New password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters'
                }
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {passwordErrors.new_password && (
              <p className="text-red-500 text-sm mt-1">{passwordErrors.new_password.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Confirm New Password</label>
            <input
              type="password"
              {...registerPassword('re_new_password', { 
                required: 'Please confirm your new password',
                validate: value => {
                  if (!watchNewPassword) return 'Please enter new password first';
                  return value === watchNewPassword || 'Passwords do not match';
                }
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {passwordErrors.re_new_password && (
              <p className="text-red-500 text-sm mt-1">{passwordErrors.re_new_password.message}</p>
            )}
          </div>
          
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 transition"
          >
            Change Password
          </button>
        </form>
      )}
    </Layout>
  );
}

export default Profile;