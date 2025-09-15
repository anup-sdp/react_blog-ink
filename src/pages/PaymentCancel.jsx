// src/pages/PaymentCancel.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import useToast from '../hooks/useToast';

function PaymentCancel() {
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    toast.addToast('Payment was cancelled.', 'info');
    
    // Get return URL from sessionStorage or default to my-payments
    const returnURL = sessionStorage.getItem('paymentReturnUrl') || '/my-payments';
    sessionStorage.removeItem('paymentReturnUrl');
    
    // Redirect to return URL after a short delay
    const timer = setTimeout(() => {
      navigate(returnURL);
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md text-center">
        <div className="text-yellow-500 text-6xl mb-4">!</div>
        <h1 className="text-3xl font-bold mb-4 text-gray-800">Payment Cancelled</h1>
        <p className="text-gray-600 mb-6">
          You have cancelled the payment process.
        </p>
        <p className="text-gray-500">
          You will be redirected shortly...
        </p>
      </div>
    </div>
  );
}

export default PaymentCancel;