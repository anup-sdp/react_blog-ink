// src/pages/MyPayments.jsx
import { useState, useEffect } from 'react';
import useAuthContext from '../hooks/useAuthContext';
import authApiClient from '../services/auth-api-client';
import useToast from '../hooks/useToast';

function MyPayments() {
  const { user } = useAuthContext();
  const [payments, setPayments] = useState([]);
  const toast = useToast();
  const [loading, setLoading] = useState(true);

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
    try {
      // This would typically initiate a payment process
      // For now, we'll just show a message
      toast.addToast('Subscription feature coming soon!', 'info');
    } catch (error) {
      toast.addToast('Failed to initiate subscription', 'error');
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">My Payments</h1>
      
      {!user?.is_subscribed && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-6 rounded-xl mb-6">
          <h2 className="text-xl font-bold mb-2">Upgrade to Premium</h2>
          <p className="mb-4">Get access to exclusive premium content and features!</p>
          <button
            onClick={handleSubscribe}
            className="bg-white text-orange-500 py-2 px-6 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Subscribe Now
          </button>
        </div>
      )}
      
      <div className="overflow-x-auto">
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
    </div>
  );
}

export default MyPayments;