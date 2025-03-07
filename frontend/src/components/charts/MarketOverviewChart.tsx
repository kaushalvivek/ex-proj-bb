import { FC, useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Link } from 'react-router-dom';

// Register required components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Stock {
  id: number;
  symbol: string;
  name: string;
  current_price: number;
  day_high: number;
  day_low: number;
  exchange: string;
}

// Extended stock with calculated change
interface StockWithChange extends Stock {
  change: number;
  prevClose: number;
}

interface MarketOverviewChartProps {
  stocks: Stock[];
}

const MarketOverviewChart: FC<MarketOverviewChartProps> = ({ stocks }) => {
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [],
  });
  
  const [topGainers, setTopGainers] = useState<StockWithChange[]>([]);
  const [topLosers, setTopLosers] = useState<StockWithChange[]>([]);

  useEffect(() => {
    if (!stocks || stocks.length === 0) return;

    // Calculate daily percentage change
    const stocksWithChange = stocks.map(stock => {
      // Simulate previous close price (between day high and day low)
      const avgPrice = (stock.day_high + stock.day_low) / 2;
      const prevClose = avgPrice - (stock.current_price - avgPrice);
      
      // Calculate percentage change
      const change = ((stock.current_price - prevClose) / prevClose) * 100;
      
      return {
        ...stock,
        prevClose,
        change
      };
    });

    // Get top 5 gainers and losers
    const sortedStocks = [...stocksWithChange].sort((a, b) => b.change - a.change);
    const topGainers = sortedStocks.slice(0, 5);
    const topLosers = sortedStocks.slice(-5).reverse();

    setTopGainers(topGainers);
    setTopLosers(topLosers);

    // Chart data for top gainers and losers
    const gainersLabels = topGainers.map(stock => stock.symbol);
    const gainersData = topGainers.map(stock => stock.change);
    
    const losersLabels = topLosers.map(stock => stock.symbol);
    const losersData = topLosers.map(stock => stock.change);

    setChartData({
      labels: [...gainersLabels, ...losersLabels],
      datasets: [
        {
          label: 'Daily % Change',
          data: [...gainersData, ...losersData],
          backgroundColor: [
            // Green colors for gainers
            'rgba(0, 163, 137, 0.8)',
            'rgba(0, 163, 137, 0.7)',
            'rgba(0, 163, 137, 0.6)',
            'rgba(0, 163, 137, 0.5)',
            'rgba(0, 163, 137, 0.4)',
            // Red colors for losers
            'rgba(230, 57, 70, 0.4)',
            'rgba(230, 57, 70, 0.5)',
            'rgba(230, 57, 70, 0.6)',
            'rgba(230, 57, 70, 0.7)',
            'rgba(230, 57, 70, 0.8)',
          ],
          borderColor: [
            // Green borders for gainers
            'rgba(0, 163, 137, 1)',
            'rgba(0, 163, 137, 1)',
            'rgba(0, 163, 137, 1)',
            'rgba(0, 163, 137, 1)',
            'rgba(0, 163, 137, 1)',
            // Red borders for losers
            'rgba(230, 57, 70, 1)',
            'rgba(230, 57, 70, 1)',
            'rgba(230, 57, 70, 1)',
            'rgba(230, 57, 70, 1)',
            'rgba(230, 57, 70, 1)',
          ],
          borderWidth: 1,
        },
      ],
    });
  }, [stocks]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.raw.toFixed(2)}%`;
          }
        }
      },
    },
    scales: {
      y: {
        grid: {
          display: false,
        },
      },
      x: {
        grid: {
          display: true,
        },
        ticks: {
          callback: function(value: any) {
            return value + '%';
          }
        }
      },
    },
  };

  if (!stocks || stocks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <h2 className="text-lg font-semibold mb-4">Market Movers</h2>
        <p className="text-gray-500">No stock data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold mb-6">Market Movers</h2>
      
      <div className="mb-6">
        <h3 className="text-base font-medium text-bigbull-green mb-2">Top Gainers</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LTP</th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topGainers.map((stock) => (
                <tr key={stock.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-bigbull-blue">
                    <Link to={`/stocks/${stock.id}`}>
                      {stock.symbol}
                    </Link>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    ₹{stock.current_price.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-bigbull-green">
                    +{stock.change.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mb-8">
        <h3 className="text-base font-medium text-bigbull-red mb-2">Top Losers</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LTP</th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topLosers.map((stock) => (
                <tr key={stock.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-bigbull-blue">
                    <Link to={`/stocks/${stock.id}`}>
                      {stock.symbol}
                    </Link>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    ₹{stock.current_price.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-bigbull-red">
                    {stock.change.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="h-80">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default MarketOverviewChart; 