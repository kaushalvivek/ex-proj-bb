import { useState, useEffect, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { tradingAPI } from '../api/api';
import Layout from '../components/Layout';

interface Stock {
  id: number;
  symbol: string;
  name: string;
  current_price: number;
  day_high: number;
  day_low: number;
  exchange: string;
}

export default function Markets() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExchange, setSelectedExchange] = useState<string | 'all'>('all');
  
  useEffect(() => {
    const fetchStocks = async () => {
      setLoading(true);
      
      try {
        const response = await tradingAPI.getStocks();
        setStocks(response.data);
        setFilteredStocks(response.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch stocks:', err);
        setError('Failed to load market data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStocks();
  }, []);
  
  useEffect(() => {
    // Filter stocks based on search query and selected exchange
    let result = stocks;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (stock) =>
          stock.symbol.toLowerCase().includes(query) ||
          stock.name.toLowerCase().includes(query)
      );
    }
    
    if (selectedExchange !== 'all') {
      result = result.filter((stock) => stock.exchange === selectedExchange);
    }
    
    setFilteredStocks(result);
  }, [stocks, searchQuery, selectedExchange]);
  
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handleExchangeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedExchange(e.target.value);
  };
  
  // Get unique exchanges for filter dropdown
  const exchanges = ['all', ...new Set(stocks.map((stock) => stock.exchange))];
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold text-zerodha-dark">Markets</h1>
        </div>
        
        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="input pl-10"
                placeholder="Search stocks by name or symbol"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            
            <div>
              <select
                className="input"
                value={selectedExchange}
                onChange={handleExchangeChange}
              >
                {exchanges.map((exchange) => (
                  <option key={exchange} value={exchange}>
                    {exchange === 'all' ? 'All Exchanges' : exchange}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-md">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-zerodha-blue border-t-transparent"></div>
            <p className="mt-2 text-gray-500">Loading market data...</p>
          </div>
        ) : (
          <>
            {filteredStocks.length > 0 ? (
              <div className="overflow-x-auto bg-white rounded-lg shadow">
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
                        Price
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Day High / Low
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Exchange
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStocks.map((stock) => (
                      <tr key={stock.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zerodha-blue">
                          <Link to={`/stocks/${stock.id}`}>
                            {stock.symbol}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {stock.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{stock.current_price.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹{stock.day_high.toLocaleString()} / ₹{stock.day_low.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {stock.exchange}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link to={`/stocks/${stock.id}`} className="text-zerodha-blue hover:text-blue-600">
                            Trade
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-500">No stocks found matching your criteria.</p>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
} 