import { FC } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

interface Stock {
  id: number;
  symbol: string;
  name: string;
  current_price: number;
}

interface Holding {
  id: number;
  user_id: number;
  stock_id: number;
  quantity: number;
  average_price: number;
  stock: Stock;
}

interface PortfolioValueChartProps {
  holdings: Holding[];
}

const PortfolioValueChart: FC<PortfolioValueChartProps> = ({ 
  holdings
}) => {
  // Calculate total portfolio value
  const totalPortfolioValue = holdings.reduce(
    (total, holding) => total + (holding.quantity * holding.stock.current_price), 
    0
  );

  // Colors for the chart
  const chartColors = [
    'rgba(0, 163, 137, 0.8)',      // Big Bull Green
    'rgba(26, 115, 232, 0.8)',     // Big Bull Blue
    'rgba(250, 173, 20, 0.8)',     // Big Bull Gold
    'rgba(77, 36, 61, 0.8)',       // Deep Purple 
    'rgba(14, 69, 84, 0.8)',       // Dark Teal
    'rgba(214, 40, 40, 0.8)',      // Bright Red
    'rgba(42, 59, 79, 0.8)',       // Navy Blue
    'rgba(136, 84, 208, 0.8)',     // Purple
    'rgba(247, 103, 7, 0.8)',      // Orange
    'rgba(63, 61, 86, 0.8)',       // Slate
  ];

  // Prepare data for the chart
  const processChartData = () => {
    // Get top 9 holdings by value
    const holdingValues = holdings.map(holding => ({
      ...holding,
      value: holding.quantity * holding.stock.current_price
    }));

    // Sort by value, highest first
    holdingValues.sort((a, b) => b.value - a.value);

    // Take top 9, rest goes to "Others"
    const topHoldings = holdingValues.slice(0, 9);
    
    // Calculate "Others" value
    const othersValue = holdingValues.slice(9).reduce((sum, holding) => sum + holding.value, 0);

    // Prepare labels and data
    const labels = topHoldings.map(h => h.stock.symbol);
    const data = topHoldings.map(h => h.value);

    // Add "Others" if there are more than 9 holdings
    if (othersValue > 0) {
      labels.push('Others');
      data.push(othersValue);
    }

    // Ensure we don't use more colors than we have
    const backgroundColors = chartColors.slice(0, labels.length);

    return {
      labels,
      data,
      backgroundColors
    };
  };

  // Get chart data
  const { labels, data, backgroundColors } = processChartData();

  // Chart configuration
  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors.map(color => color.replace('0.8', '1')),
        borderWidth: 1,
        hoverOffset: 10,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          boxWidth: 12,
          padding: 15,
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.raw;
            const percentage = ((value / totalPortfolioValue) * 100).toFixed(1);
            return `${context.label}: ₹${value.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '65%',
  };

  // If no holdings, display a message
  if (holdings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <h2 className="text-lg font-semibold mb-4">Portfolio Allocation</h2>
        <p className="text-gray-500">No holdings to display</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold mb-4">Portfolio Allocation</h2>
      
      <div className="h-64 relative">
        <Doughnut data={chartData} options={options} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 text-xs">Total Value</p>
            <p className="text-xl font-bold text-bigbull-blue">
              ₹{totalPortfolioValue.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioValueChart; 