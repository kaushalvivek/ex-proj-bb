import { FC, useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
);

interface StockPriceChartProps {
  stockSymbol: string;
  currentPrice: number;
  dayHigh: number;
  dayLow: number;
}

const StockPriceChart: FC<StockPriceChartProps> = ({
  stockSymbol,
  currentPrice,
  dayHigh,
  dayLow,
}) => {
  // Add console log for debugging
  console.log("StockPriceChart props:", { stockSymbol, currentPrice, dayHigh, dayLow });
  
  const [activeTimeframe, setActiveTimeframe] = useState<string>('1D');
  const [chartData, setChartData] = useState<any>(null);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [percentChange, setPercentChange] = useState<number>(0);

  // Calculate approximate previous close based on day high and day low
  const previousClose = currentPrice - ((dayHigh - dayLow) / 2);

  // Generate random price data based on current price and timeframe
  const generatePriceData = (timeframe: string) => {
    let dataPoints = 0;
    let volatility = 0;
    let trend = 0;
    
    // Different timeframes have different characteristics
    switch (timeframe) {
      case '1D':
        dataPoints = 78; // Market hours: 9:15 AM to 3:30 PM (6.25 hours * 12 5-min intervals)
        volatility = 0.001; // Lower intraday volatility
        trend = (currentPrice - previousClose) / dataPoints;
        break;
      case '1W':
        dataPoints = 5; // 5 trading days
        volatility = 0.005;
        trend = (currentPrice - previousClose) / dataPoints;
        break;
      case '1M':
        dataPoints = 22; // ~22 trading days
        volatility = 0.01;
        trend = (currentPrice - previousClose) / dataPoints;
        break;
      case '3M':
        dataPoints = 66; // ~66 trading days
        volatility = 0.015;
        trend = (currentPrice - previousClose) / dataPoints;
        break;
      case '1Y':
        dataPoints = 252; // ~252 trading days
        volatility = 0.02;
        trend = (currentPrice - previousClose) / dataPoints;
        break;
      default:
        dataPoints = 78;
        volatility = 0.001;
        trend = (currentPrice - previousClose) / dataPoints;
    }
    
    const prices: number[] = [];
    let price = previousClose;
    
    for (let i = 0; i < dataPoints; i++) {
      // Add random noise + trend
      const change = (Math.random() - 0.5) * 2 * volatility * price + trend;
      price += change;
      // Ensure no negative prices
      if (price <= 0) price = 0.01;
      prices.push(price);
    }
    
    // Ensure last price matches current price
    prices[prices.length - 1] = currentPrice;
    
    // Calculate change and percentage change
    const change = currentPrice - previousClose;
    const pctChange = (change / previousClose) * 100;
    
    setPriceChange(change);
    setPercentChange(pctChange);
    
    return prices;
  };
  
  const generateLabels = (timeframe: string) => {
    let labels = [];
    
    switch (timeframe) {
      case '1D':
        // Generate 5-minute interval labels for market hours (9:15 AM to 3:30 PM)
        for (let hour = 9; hour <= 15; hour++) {
          const minuteStart = hour === 9 ? 15 : 0;
          const minuteEnd = hour === 15 ? 30 : 55;
          
          for (let minute = minuteStart; minute <= minuteEnd; minute += 5) {
            const formattedHour = hour.toString().padStart(2, '0');
            const formattedMinute = minute.toString().padStart(2, '0');
            labels.push(`${formattedHour}:${formattedMinute}`);
          }
        }
        break;
      case '1W':
        // Last 5 trading days
        const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        labels = weekdays;
        break;
      case '1M':
        // Generate dates for the month
        const today = new Date();
        labels = Array(22).fill(0).map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (22 - i - 1));
          return date.getDate().toString();
        });
        break;
      case '3M':
        // Generate weekly labels for 3 months
        labels = Array(13).fill(0).map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (13 - i - 1) * 7);
          return `${date.getDate()}/${date.getMonth() + 1}`;
        });
        break;
      case '1Y':
        // Generate monthly labels
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = new Date().getMonth();
        
        labels = Array(12).fill(0).map((_, i) => {
          const monthIndex = (currentMonth - 11 + i + 12) % 12;
          return months[monthIndex];
        });
        break;
      default:
        labels = Array(78).fill('');
    }
    
    return labels;
  };

  useEffect(() => {
    const prices = generatePriceData(activeTimeframe);
    const labels = generateLabels(activeTimeframe);
    
    // Determine if the stock is up or down
    const isPositive = currentPrice >= previousClose;
    
    setChartData({
      labels,
      datasets: [
        {
          data: prices,
          borderColor: isPositive ? 'rgba(0, 163, 137, 1)' : 'rgba(230, 57, 70, 1)',
          backgroundColor: (context: any) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 350);
            if (isPositive) {
              gradient.addColorStop(0, 'rgba(0, 163, 137, 0.3)');
              gradient.addColorStop(1, 'rgba(0, 163, 137, 0.0)');
            } else {
              gradient.addColorStop(0, 'rgba(230, 57, 70, 0.3)');
              gradient.addColorStop(1, 'rgba(230, 57, 70, 0.0)');
            }
            return gradient;
          },
          tension: 0.4,
          fill: true,
          pointRadius: 0,
          pointHoverRadius: 4,
        },
      ],
    });
  }, [stockSymbol, currentPrice, previousClose, activeTimeframe, dayHigh, dayLow]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context: any) {
            return `₹${context.raw.toFixed(2)}`;
          }
        }
      },
    },
    scales: {
      y: {
        display: true,
        grid: {
          drawBorder: false,
          drawOnChartArea: true,
          drawTicks: false,
          color: 'rgba(225, 225, 225, 0.5)',
        },
        ticks: {
          callback: function(value: any) {
            return `₹${value}`;
          }
        }
      },
      x: {
        grid: {
          drawBorder: false,
          drawOnChartArea: false,
          drawTicks: false,
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10,
        }
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  if (!chartData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <h2 className="text-lg font-semibold mb-4">{stockSymbol} Price Chart</h2>
        <p className="text-gray-500">Loading chart data...</p>
      </div>
    );
  }

  const timeframes = [
    { id: '1D', label: '1D' },
    { id: '1W', label: '1W' },
    { id: '1M', label: '1M' },
    { id: '3M', label: '3M' },
    { id: '1Y', label: '1Y' },
  ];

  // Determine the color for price changes
  const isPositive = currentPrice >= previousClose;
  const changeColorClass = isPositive ? 'text-bigbull-green' : 'text-bigbull-red';

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold">{stockSymbol}</h2>
          <p className="text-gray-500 text-sm">NSE</p>
        </div>
        <div className="flex space-x-2">
          {timeframes.map((timeframe) => (
            <button
              key={timeframe.id}
              className={`px-3 py-1 text-sm rounded ${
                activeTimeframe === timeframe.id
                  ? 'bg-bigbull-blue text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setActiveTimeframe(timeframe.id)}
            >
              {timeframe.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-2xl font-semibold">₹{currentPrice.toFixed(2)}</p>
          <p className={`${changeColorClass} font-medium text-sm`}>
            {isPositive ? '+' : ''}₹{priceChange.toFixed(2)} ({isPositive ? '+' : ''}{percentChange.toFixed(2)}%)
          </p>
        </div>
        <div className="text-sm text-gray-500">
          <p>Prev. Close: ₹{previousClose.toFixed(2)}</p>
        </div>
      </div>
      
      <div className="h-64">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default StockPriceChart; 