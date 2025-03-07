import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';
import { tradingAPI } from '../api/api';
import Layout from '../components/Layout';
import PortfolioValueChart from '../components/charts/PortfolioValueChart';
import PerformanceChart from '../components/charts/PerformanceChart';

interface PortfolioSummary {
  invested_value: number;
  current_value: number;
  pnl: number;
  holdings: Holding[];
}

interface Holding {
  id: number;
  user_id: number;
  stock_id: number;
  quantity: number;
  average_price: number;
  stock: {
    id: number;
    symbol: string;
    name: string;
    current_price: number;
    day_high: number;
    day_low: number;
    exchange: string;
  };
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

export default function Portfolio() {
  const { user } = useAuth();
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!user) return;
      
      setLoading(true);
      
      try {
        const response = await tradingAPI.getPortfolio();
        setPortfolioSummary(response.data);
        
        // Fetch transactions for charts
        const transactionsResponse = await tradingAPI.getTransactions();
        setTransactions(transactionsResponse.data);
        
        setError(null);
      } catch (err) {
        console.error('Failed to fetch portfolio:', err);
        setError('Failed to load portfolio data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPortfolio();
  }, [user]);
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  const getChangePercentage = (holding: Holding) => {
    const currentValue = holding.stock.current_price;
    const averagePrice = holding.average_price;
    const percentChange = ((currentValue - averagePrice) / averagePrice) * 100;
    return percentChange.toFixed(2);
  };
  
  const getTotalValue = (holding: Holding) => {
    return holding.quantity * holding.stock.current_price;
  };
  
  const getTotalInvestment = (holding: Holding) => {
    return holding.quantity * holding.average_price;
  };
  
  const getProfit = (holding: Holding) => {
    return getTotalValue(holding) - getTotalInvestment(holding);
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold text-zerodha-dark">My Portfolio</h1>
          <Link to="/markets" className="btn btn-primary mt-4 md:mt-0">
            Explore Markets
          </Link>
        </div>
        
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-md">
            {error}
          </div>
        )}
        
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-zerodha-blue border-t-transparent"></div>
            <p className="mt-2 text-gray-500">Loading your portfolio...</p>
          </div>
        )}
        
        {!loading && portfolioSummary && (
          <>
            {/* Portfolio Summary */}
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
            
            {/* Portfolio Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <PortfolioValueChart holdings={portfolioSummary.holdings} />
              <PerformanceChart 
                transactions={transactions} 
                currentValue={portfolioSummary.current_value} 
                investedValue={portfolioSummary.invested_value} 
              />
            </div>
            
            {/* Holdings Table */}
            {portfolioSummary.holdings.length > 0 ? (
              <div className="overflow-x-auto bg-white rounded-lg shadow mt-6">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Symbol
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avg. Price
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Price
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        P&L
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Value
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {portfolioSummary.holdings.map((holding) => (
                      <tr key={holding.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zerodha-blue">
                          <Link to={`/stocks/${holding.stock.id}`}>
                            {holding.stock.symbol}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {holding.stock.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {holding.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{holding.average_price.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{holding.stock.current_price.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center">
                            <span className={getProfit(holding) >= 0 ? 'text-zerodha-green' : 'text-zerodha-red'}>
                              ₹{getProfit(holding).toLocaleString()}
                            </span>
                            <span className={`ml-2 ${getProfit(holding) >= 0 ? 'text-zerodha-green' : 'text-zerodha-red'}`}>
                              ({getProfit(holding) >= 0 ? '+' : ''}{getChangePercentage(holding)}%)
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{getTotalValue(holding).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link to={`/stocks/${holding.stock.id}`} className="text-zerodha-blue hover:text-blue-600 mr-4">
                            Trade
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="card text-center py-12">
                <h2 className="text-xl font-semibold mb-4">No holdings yet</h2>
                <p className="text-gray-600 mb-6">
                  You don't have any stocks in your portfolio. Start investing now!
                </p>
                <Link to="/markets" className="btn btn-primary">
                  Explore Markets
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
} 