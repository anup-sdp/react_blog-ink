// src/pages/PaymentSuccess.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import useAuthContext from '../hooks/useAuthContext';
import useToast from '../hooks/useToast';

function PaymentSuccess() {
  const navigate = useNavigate();
  const { fetchUserProfile } = useAuthContext();
  const toast = useToast();

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      try {
        // Refresh user profile to update subscription status
        await fetchUserProfile();
        toast.addToast('Payment successful! Your subscription is now active.', 'success');
        
        // Get return URL from sessionStorage or default to my-payments
        const returnURL = sessionStorage.getItem('paymentReturnUrl') || '/my-payments';
        sessionStorage.removeItem('paymentReturnUrl');
        
        // Redirect to return URL after a short delay
        setTimeout(() => {
          navigate(returnURL);
        }, 3000);
      } catch (error) {
        toast.addToast('Payment was successful but failed to update profile. Please contact support.', 'warning');
        setTimeout(() => {
          navigate('/my-payments');
        }, 3000);
      }
    };

    handlePaymentSuccess();
  }, [fetchUserProfile, navigate, toast]);

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