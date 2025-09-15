// src/pages/Activate.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import apiClient from '../services/api-client';
import useToast from '../hooks/useToast';

function Activate() {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const toast = useToast();

  useEffect(() => {
    const activateAccount = async () => {
      try {
        await apiClient.post('/auth/users/activation/', { uid, token });
        setStatus('success');
        toast.addToast('Account activated successfully! You can now log in.', 'success');
        setTimeout(() => navigate('/login'), 3000);
      } catch (error) {
        setStatus('error');
        toast.addToast('Activation failed. The link may have expired or is invalid.', 'error');
      }
    };

    activateAccount();
  }, [uid, token, navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Account Activation</h1>
        
        {status === 'loading' && (
          <p className="text-gray-600">Activating your account...</p>
        )}
        
        {status === 'success' && (
          <div>
            <p className="text-green-600 mb-4">Your account has been activated successfully!</p>
            <p>You will be redirected to the login page shortly.</p>
          </div>
        )}
        
        {status === 'error' && (
          <div>
            <p className="text-red-600 mb-4">Activation failed. Please try again or contact support.</p>
            <button 
              onClick={() => navigate('/login')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-6 rounded-lg font-semibold hover:opacity-90 transition"
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Activate;