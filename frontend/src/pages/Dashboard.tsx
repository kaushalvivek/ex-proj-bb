import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';
import { tradingAPI } from '../api/api';
import Layout from '../components/Layout';
import MarketOverviewChart from '../components/charts/MarketOverviewChart';
import PortfolioValueChart from '../components/charts/PortfolioValueChart';
import PerformanceChart from '../components/charts/PerformanceChart';

interface PortfolioSummary {
  invested_value: number;
  current_value: number;
  pnl: number;
  holdings: any[];
}

interface Stock {
  id: number;
  symbol: string;
  name: string;
  current_price: number;
  day_high: number;
  day_low: number;
  exchange: string;
}

interface Transaction {
  id: number;
  user_id: number;
  stock_id: number;
  transaction_type: string;
  quantity: number;
  price: number;
  total_amount: number;
  timestamp: string;
  stock: {
    id: number;
    symbol: string;
    name: string;
    current_price: number;
  };
}

export default function Dashboard() {
  const { user } = useAuth();
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary | null>(null);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Fetch market data (stocks)
        const stocksResponse = await tradingAPI.getStocks();
        setStocks(stocksResponse.data);
        
        // Fetch portfolio data if user is logged in
        if (user) {
          const portfolioResponse = await tradingAPI.getPortfolio();
          setPortfolioSummary(portfolioResponse.data);
          
          // Fetch transaction history for charts
          const transactionsResponse = await tradingAPI.getTransactions();
          setTransactions(transactionsResponse.data);
        }
        
        setError(null);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  return (
    <Layout>
      <div className="space-y-6">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zerodha-dark">Dashboard</h1>
            <p className="text-gray-500">Welcome{user ? `, ${user.name}` : ''}! Here's your market overview.</p>
          </div>
          
          {user && (
            <Link to="/markets" className="btn btn-primary mt-4 md:mt-0">
              Browse Markets
            </Link>
          )}
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-md">
            {error}
          </div>
        )}
        
        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-zerodha-blue border-t-transparent"></div>
            <p className="mt-2 text-gray-500">Loading your dashboard...</p>
          </div>
        )}
        
        {/* Portfolio Summary (only for logged in users) */}
        {!loading && user && portfolioSummary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <h2 className="text-xl font-semibold mb-2">Invested</h2>
              <p className="text-2xl font-bold">₹{portfolioSummary.invested_value.toLocaleString()}</p>
            </div>
            
            <div className="card">
              <h2 className="text-xl font-semibold mb-2">Current Value</h2>
              <p className="text-2xl font-bold">₹{portfolioSummary.current_value.toLocaleString()}</p>
            </div>
            
            <div className="card">
              <h2 className="text-xl font-semibold mb-2">P&L</h2>
              <div className="flex items-center">
                <p className={`text-2xl font-bold ${portfolioSummary.pnl >= 0 ? 'text-zerodha-green' : 'text-zerodha-red'}`}>
                  ₹{portfolioSummary.pnl.toLocaleString()}
                </p>
                {portfolioSummary.pnl !== 0 && (
                  <span className={`ml-2 flex items-center ${portfolioSummary.pnl >= 0 ? 'text-zerodha-green' : 'text-zerodha-red'}`}>
                    {portfolioSummary.pnl > 0 ? (
                      <ArrowUpIcon className="h-4 w-4" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4" />
                    )}
                    {Math.abs((portfolioSummary.pnl / portfolioSummary.invested_value) * 100).toFixed(2)}%
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Charts for logged in users */}
        {!loading && user && portfolioSummary && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <PortfolioValueChart holdings={portfolioSummary.holdings} />
            <PerformanceChart 
              transactions={transactions} 
              currentValue={portfolioSummary.current_value} 
              investedValue={portfolioSummary.invested_value} 
            />
          </div>
        )}
        
        {/* Market Overview Chart (for everyone) */}
        {!loading && stocks.length > 0 && (
          <div className="mt-6">
            <MarketOverviewChart stocks={stocks} />
          </div>
        )}
        
        {/* Quick Access Buttons (only for logged in users) */}
        {!loading && user && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <Link 
              to="/portfolio" 
              className="card bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition duration-200"
            >
              <h3 className="text-lg font-medium text-zerodha-blue">Portfolio</h3>
              <p className="text-gray-600">View your investments</p>
            </Link>
            
            <Link 
              to="/markets" 
              className="card bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition duration-200"
            >
              <h3 className="text-lg font-medium text-zerodha-green">Markets</h3>
              <p className="text-gray-600">Explore and buy stocks</p>
            </Link>
            
            <Link 
              to="/transactions" 
              className="card bg-gradient-to-r from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 transition duration-200"
            >
              <h3 className="text-lg font-medium text-amber-600">Orders</h3>
              <p className="text-gray-600">View your transaction history</p>
            </Link>
            
            <Link 
              to="/funds" 
              className="card bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 transition duration-200"
            >
              <h3 className="text-lg font-medium text-purple-600">Add Funds</h3>
              <p className="text-gray-600">Deposit money to your account</p>
            </Link>
          </div>
        )}
        
        {/* Not Logged In Message */}
        {!loading && !user && (
          <div className="card text-center py-12">
            <h2 className="text-xl font-semibold mb-4">Get Started with Trading</h2>
            <p className="text-gray-600 mb-6">
              Sign up or log in to start investing in the stock market with our intuitive platform.
            </p>
            <div className="space-x-4">
              <Link to="/login" className="btn btn-primary">
                Log In
              </Link>
              <Link to="/register" className="btn btn-secondary">
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 