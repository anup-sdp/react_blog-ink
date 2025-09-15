// src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import useAuthContext from '../hooks/useAuthContext';
import useToast from '../hooks/useToast';

function Profile() {
  const { user, updateUserProfile, changePassword } = useAuthContext();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  
  const { register: registerProfile, handleSubmit: handleSubmitProfile, formState: { errors: profileErrors }, reset } = useForm({
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

  const { register: registerPassword, handleSubmit: handleSubmitPassword, formState: { errors: passwordErrors }, reset: resetPassword } = useForm();

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
    const result = await updateUserProfile(data);
    if (result.success) {
      toast.addToast('Profile updated successfully', 'success');
    } else {
      toast.addToast(result.message, 'error');
    }
  };

  const onPasswordSubmit = async (data) => {
    const result = await changePassword(data);
    if (result.success) {
      toast.addToast(result.message, 'success');
      resetPassword();
    } else {
      toast.addToast(result.message, 'error');
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled
              />
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
                validate: value => value === passwordErrors.new_password || 'Passwords do not match'
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
    </div>
  );
}

export default Profile;