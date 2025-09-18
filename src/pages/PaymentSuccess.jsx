// src/pages/PaymentSuccess.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import useAuthContext from '../hooks/useAuthContext';
import { useDataCache } from '../context/DataCacheContext';
import useToast from '../hooks/useToast';

function PaymentSuccess() {
  const navigate = useNavigate();
  const { user, fetchUserProfile } = useAuthContext();
  const toast = useToast();
  const udc = useDataCache();

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      try {
        // 1. First refresh user profile to update subscription status
        await fetchUserProfile();
        
        // 2. Then clear cache for data that depends on subscription status
        // Clear premiumBlogs cache so it will be refetched with new subscription status
        udc.clearCache(['premiumBlogs']);
        
        // 3. If you also fetch user lists that show subscription status, clear users cache
        udc.clearCache(['users']);
        
        // 4. Show success message
        toast.addToast('Payment successful! Your subscription is now active.', 'success');
        
        // 5. Handle redirect
        const returnURL = sessionStorage.getItem('paymentReturnUrl') || '/my-payments';
        sessionStorage.removeItem('paymentReturnUrl');
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate(returnURL);
        }, 5000);
      } catch (error) {
        console.error('Error updating profile after payment:', error);
        toast.addToast('Payment was successful but failed to update profile. Please contact support.', 'warning');
        setTimeout(() => {
          navigate('/my-payments');
        }, 5000);
      }
    };

    handlePaymentSuccess();
  }, [fetchUserProfile, navigate, toast, udc]); // Added missing dependencies

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md text-center">
        <div className="text-green-500 text-6xl mb-4">✓</div>
        <h1 className="text-3xl font-bold mb-4 text-gray-800">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for your subscription. Your account has been upgraded to premium.
        </p>
        <p className="text-gray-500">
          You will be redirected shortly...
        </p>
      </div>
    </div>
  );
}

export default PaymentSuccess;