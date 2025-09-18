import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import useAuthContext from '../hooks/useAuthContext';
import authApiClient from '../services/auth-api-client';
import useToast from '../hooks/useToast';
import Layout from '../components/Layout';

function MyPayments() {
  const { user } = useAuthContext();
  const [payments, setPayments] = useState([]);
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await authApiClient.get('/payments/my_payments/');
        setPayments(response.data);
      } catch (error) {
        toast.addToast('Failed to fetch payment history', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [toast]);

  const handleSubscribe = async () => {
    setIsProcessing(true);
    try {      
      const response = await authApiClient.post('/payment/initiate/', {
        amount: 100, // Example amount, you can adjust this
        numItems: 1 // Example number of items
      });      
      // If successful, redirect to the payment URL
      if (response.data.payment_url) {
        // Store the current URL to return after payment
        sessionStorage.setItem('paymentReturnUrl', window.location.pathname);        
        // Redirect to payment gateway        
        window.location.href = response.data.payment_url;
      } else {
        console.log(`Payment failed : ${response.data?.error}`);
        toast.addToast('Failed to initiate payment', 'error');
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      toast.addToast('Failed to initiate subscription', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">My Payments</h1>
      {user?.is_subscribed && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-6 rounded-xl mb-6">
          <p className="mb-4">You have already for premium content</p>
        </div>		
      )}
      {!user?.is_subscribed && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-6 rounded-xl mb-6">
          <h2 className="text-xl font-bold mb-2">Upgrade to Premium</h2>
          <p className="mb-4">Get access to exclusive premium content and features!</p>
          <p className="mb-4">Now only at 100 taka with one time payment!</p>
          <button
            onClick={handleSubscribe}
            disabled={isProcessing}
            className="bg-white text-orange-500 py-2 px-6 rounded-lg font-semibold hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : 'Subscribe Now'}
          </button>
        </div>
      )}
      
      <div className="overflow-x-auto rounded-xl">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                  No payment history found
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.transaction_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${payment.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      payment.status === 'success' ? 'bg-green-100 text-green-800' : 
                      payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(payment.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

export default MyPayments;