import { useState, FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../api/api';
import Layout from '../components/Layout';

export default function Funds() {
  const { user, updateUser } = useAuth();
  const [amount, setAmount] = useState(10000);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (amount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }
    
    setLoading(true);
    setSuccess(null);
    setError(null);
    
    try {
      const response = await userAPI.addFunds(amount);
      setSuccess(`Successfully added ₹${amount.toLocaleString()} to your account`);
      
      // Update local user state with new balance
      updateUser({ balance: response.data.balance });
      
      // Reset amount field
      setAmount(10000);
    } catch (err: any) {
      console.error('Failed to add funds:', err);
      setError(err.response?.data?.detail || 'Failed to add funds. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const predefinedAmounts = [1000, 5000, 10000, 25000, 50000, 100000];
  
  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-zerodha-dark">Add Funds</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Current Balance</h2>
              <div className="text-xl font-bold text-zerodha-green">₹{user.balance.toLocaleString()}</div>
            </div>
          </div>
          
          {success && (
            <div className="mb-6 p-3 bg-green-50 text-green-600 rounded-md">
              {success}
            </div>
          )}
          
          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-md">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Enter Amount (₹)
              </label>
              <input
                type="number"
                id="amount"
                min="1"
                className="input"
                value={amount}
                onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value) || 0))}
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Select
              </label>
              <div className="grid grid-cols-3 gap-2">
                {predefinedAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    className={`py-2 px-4 rounded-md border ${
                      amount === amt
                        ? 'bg-zerodha-blue text-white border-zerodha-blue'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setAmount(amt)}
                  >
                    ₹{amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <div className="border border-gray-300 rounded-md divide-y divide-gray-300">
                <div className="p-4 flex items-center">
                  <input
                    id="upi"
                    name="payment_method"
                    type="radio"
                    className="h-4 w-4 text-zerodha-blue focus:ring-zerodha-blue"
                    defaultChecked
                  />
                  <label htmlFor="upi" className="ml-3 block text-sm font-medium text-gray-700">
                    UPI
                  </label>
                </div>
                <div className="p-4 flex items-center">
                  <input
                    id="netbanking"
                    name="payment_method"
                    type="radio"
                    className="h-4 w-4 text-zerodha-blue focus:ring-zerodha-blue"
                  />
                  <label htmlFor="netbanking" className="ml-3 block text-sm font-medium text-gray-700">
                    Net Banking
                  </label>
                </div>
                <div className="p-4 flex items-center">
                  <input
                    id="card"
                    name="payment_method"
                    type="radio"
                    className="h-4 w-4 text-zerodha-blue focus:ring-zerodha-blue"
                  />
                  <label htmlFor="card" className="ml-3 block text-sm font-medium text-gray-700">
                    Card Payment
                  </label>
                </div>
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full py-3"
              >
                {loading ? 'Processing...' : `Add ₹${amount.toLocaleString()} to Account`}
              </button>
            </div>
            
            <div className="mt-4 text-xs text-gray-500 text-center">
              Funds will be added instantly to your trading account.
              By proceeding, you agree to our terms and conditions.
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
} 