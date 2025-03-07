import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';
import { tradingAPI } from '../api/api';
import Layout from '../components/Layout';
import StockPriceChart from '../components/charts/StockPriceChart';

interface Stock {
  id: number;
  symbol: string;
  name: string;
  current_price: number;
  day_high: number;
  day_low: number;
  exchange: string;
}

export default function StockDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  
  const [stock, setStock] = useState<Stock | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Trade form state
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [tradeSuccess, setTradeSuccess] = useState<string | null>(null);
  const [tradeError, setTradeError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchStock = async () => {
      if (!id) return;
      
      setLoading(true);
      
      try {
        const response = await tradingAPI.getStock(parseInt(id));
        setStock(response.data);
        setPrice(response.data.current_price);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch stock details:', err);
        setError('Failed to load stock details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStock();
  }, [id]);
  
  // Calculate total cost
  const totalCost = quantity * price;
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!stock) return;
    
    setProcessing(true);
    setTradeSuccess(null);
    setTradeError(null);
    
    try {
      if (tradeType === 'BUY') {
        if (user.balance < totalCost) {
          setTradeError('Insufficient funds. Please add more funds to your account.');
          setProcessing(false);
          return;
        }
        
        const response = await tradingAPI.buyStock(stock.id, quantity, price);
        setTradeSuccess(`Successfully bought ${quantity} shares of ${stock.symbol}`);
        
        // Update user balance
        updateUser({ balance: user.balance - totalCost });
      } else {
        const response = await tradingAPI.sellStock(stock.id, quantity, price);
        setTradeSuccess(`Successfully sold ${quantity} shares of ${stock.symbol}`);
        
        // Update user balance
        updateUser({ balance: user.balance + totalCost });
      }
    } catch (err: any) {
      console.error('Trade failed:', err);
      setTradeError(err.response?.data?.detail || 'Trade failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };
  
  // Calculate day change percentage
  const getDayChangePercentage = () => {
    if (!stock) return 0;
    
    const prevClose = stock.current_price - (stock.day_high - stock.day_low) / 2;
    return ((stock.current_price - prevClose) / prevClose) * 100;
  };
  
  const dayChangePercent = getDayChangePercentage();
  const isPositiveChange = dayChangePercent >= 0;
  
  return (
    <Layout>
      <div className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-md">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-zerodha-blue border-t-transparent"></div>
            <p className="mt-2 text-gray-500">Loading stock details...</p>
          </div>
        ) : stock ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stock Information */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold text-zerodha-dark">{stock.symbol}</h1>
                    <p className="text-gray-500">{stock.name}</p>
                    <p className="text-sm text-gray-500 mt-1">{stock.exchange}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">₹{stock.current_price.toLocaleString()}</div>
                    <div className={`flex items-center justify-end mt-1 ${isPositiveChange ? 'text-zerodha-green' : 'text-zerodha-red'}`}>
                      {isPositiveChange ? (
                        <ArrowUpIcon className="h-4 w-4 mr-1" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4 mr-1" />
                      )}
                      <span>{Math.abs(dayChangePercent).toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Day High</div>
                    <div className="text-lg font-semibold">₹{stock.day_high.toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Day Low</div>
                    <div className="text-lg font-semibold">₹{stock.day_low.toLocaleString()}</div>
                  </div>
                </div>
              </div>
              
              {/* Stock Chart */}
              <StockPriceChart 
                stockSymbol={stock.symbol}
                currentPrice={stock.current_price}
                dayHigh={stock.day_high}
                dayLow={stock.day_low}
              />
            </div>
            
            {/* Trade Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Trade {stock.symbol}</h2>
              
              {!user && (
                <div className="mb-4 p-3 bg-amber-50 text-amber-600 rounded-md text-sm">
                  Please <a href="/login" className="underline font-medium">log in</a> to trade.
                </div>
              )}
              
              {tradeSuccess && (
                <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-md text-sm">
                  {tradeSuccess}
                </div>
              )}
              
              {tradeError && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
                  {tradeError}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transaction Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      className={`py-2 px-4 rounded-md ${
                        tradeType === 'BUY'
                          ? 'bg-zerodha-green text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                      onClick={() => setTradeType('BUY')}
                    >
                      Buy
                    </button>
                    <button
                      type="button"
                      className={`py-2 px-4 rounded-md ${
                        tradeType === 'SELL'
                          ? 'bg-zerodha-red text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                      onClick={() => setTradeType('SELL')}
                    >
                      Sell
                    </button>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    min="1"
                    className="input"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    id="price"
                    min="0.01"
                    step="0.01"
                    className="input"
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                
                <div className="mb-6 p-3 bg-gray-50 rounded-md">
                  <div className="flex justify-between text-sm">
                    <span>Total Amount:</span>
                    <span className="font-semibold">₹{totalCost.toLocaleString()}</span>
                  </div>
                  
                  {user && (
                    <div className="flex justify-between text-sm mt-2">
                      <span>Available Balance:</span>
                      <span className="font-semibold">₹{user.balance.toLocaleString()}</span>
                    </div>
                  )}
                </div>
                
                <button
                  type="submit"
                  disabled={processing || !user}
                  className={`w-full py-2 px-4 rounded-md font-medium text-white ${
                    tradeType === 'BUY'
                      ? 'bg-zerodha-green hover:bg-green-600'
                      : 'bg-zerodha-red hover:bg-red-600'
                  } disabled:opacity-50`}
                >
                  {processing
                    ? 'Processing...'
                    : tradeType === 'BUY'
                    ? `Buy ${stock.symbol}`
                    : `Sell ${stock.symbol}`}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">Stock not found.</p>
          </div>
        )}
      </div>
    </Layout>
  );
} 