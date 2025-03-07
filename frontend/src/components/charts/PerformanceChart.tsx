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
  Legend,
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
  Legend,
  Filler
);

interface Stock {
  id: number;
  symbol: string;
  name: string;
  current_price: number;
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
  stock: Stock;
}

interface Performance {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
  overall: number;
}

interface PerformanceChartProps {
  transactions: Transaction[];
  currentValue: number;
  investedValue: number;
}

const PerformanceChart: FC<PerformanceChartProps> = ({ 
  transactions, 
  currentValue, 
  investedValue 
}) => {
  const [activeTimeframe, setActiveTimeframe] = useState<string>('monthly');
  const [chartData, setChartData] = useState<any>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<Performance>({
    daily: 0,
    weekly: 0,
    monthly: 0,
    yearly: 0,
    overall: 0
  });
  
  // Calculate performance metrics from transactions, currentValue, and investedValue
  useEffect(() => {
    // Calculate overall performance (P&L percentage)
    const overallPerformance = investedValue > 0 
      ? ((currentValue - investedValue) / investedValue) * 100 
      : 0;
    
    // Generate estimated performance for different timeframes
    // In a real app, this would use actual historical data
    const performance: Performance = {
      daily: overallPerformance * 0.01,   // Approx daily change
      weekly: overallPerformance * 0.1,    // Approx weekly change
      monthly: overallPerformance * 0.4,   // Approx monthly change
      yearly: overallPerformance * 0.8,    // Approx yearly change
      overall: overallPerformance          // Overall P&L
    };
    
    setPerformanceMetrics(performance);
  }, [transactions, currentValue, investedValue]);
  
  const generateRandomPerformanceData = (
    timeframe: string, 
    performanceValue: number
  ) => {
    let days;
    
    switch (timeframe) {
      case 'daily':
        days = 1;
        break;
      case 'weekly':
        days = 7;
        break;
      case 'monthly':
        days = 30;
        break;
      case 'yearly':
        days = 365;
        break;
      case 'overall':
        days = 1095; // ~3 years
        break;
      default:
        days = 30;
    }
    
    // Generate random data that ends at the performance value
    const data = [];
    let currentValue = 100; // Start at 100 (base value)
    const targetValue = 100 + performanceValue; // End value
    
    // Determine the increment needed to reach the target
    const averageChangePerDay = (targetValue - currentValue) / days;
    
    // Generate daily values with some random fluctuation
    for (let i = 0; i < days; i++) {
      // Add some random noise to make the chart more realistic
      const randomFactor = Math.random() * 0.5 - 0.25; // Random between -0.25 and 0.25
      currentValue += averageChangePerDay + randomFactor;
      
      // Ensure we don't go below a reasonable value
      if (currentValue < 50) currentValue = 50;
      
      data.push(currentValue);
    }
    
    // Ensure the final value is exactly the target
    data[data.length - 1] = targetValue;
    
    return data;
  };
  
  // Generate labels for the chart
  const generateLabels = (timeframe: string) => {
    const labels = [];
    let days;
    
    switch (timeframe) {
      case 'daily':
        // For daily, show hourly labels
        for (let i = 9; i <= 15; i++) {
          labels.push(`${i}:00`);
          if (i !== 15) labels.push(`${i}:30`);
        }
        break;
      case 'weekly':
        // For weekly, show the past 7 days
        const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const today = new Date().getDay(); // 0 is Sunday, 1 is Monday, etc.
        
        for (let i = 6; i >= 0; i--) {
          const dayIndex = (today - i + 7) % 7; // Ensure positive index
          labels.push(weekDays[dayIndex === 0 ? 6 : dayIndex - 1]); // Adjust for Mon=0
        }
        break;
      case 'monthly':
        // For monthly, show each day of the month
        days = 30;
        const date = new Date();
        for (let i = days; i > 0; i--) {
          const d = new Date(date);
          d.setDate(d.getDate() - i + 1);
          labels.push(d.getDate().toString());
        }
        break;
      case 'yearly':
        // For yearly, show months
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = new Date().getMonth();
        
        for (let i = 11; i >= 0; i--) {
          const monthIndex = (currentMonth - i + 12) % 12;
          labels.push(months[monthIndex]);
        }
        break;
      case 'overall':
        // For overall, show years and quarters
        const currentYear = new Date().getFullYear();
        for (let i = 3; i >= 0; i--) {
          const year = currentYear - i;
          labels.push(`${year} Q1`);
          labels.push(`${year} Q2`);
          labels.push(`${year} Q3`);
          labels.push(`${year} Q4`);
        }
        break;
      default:
        days = 30;
        for (let i = 1; i <= days; i++) {
          labels.push(i.toString());
        }
    }
    
    return labels;
  };
  
  // Generate chart data based on the active timeframe
  useEffect(() => {
    const performanceValue = performanceMetrics[activeTimeframe as keyof Performance];
    const data = generateRandomPerformanceData(activeTimeframe, performanceValue);
    const labels = generateLabels(activeTimeframe);
    
    // Determine color based on performance value
    const isPositive = performanceValue >= 0;
    const gradientColor = isPositive ? 'rgba(0, 163, 137, 0.2)' : 'rgba(230, 57, 70, 0.2)';
    const lineColor = isPositive ? 'rgba(0, 163, 137, 1)' : 'rgba(230, 57, 70, 1)';
    
    setChartData({
      labels,
      datasets: [
        {
          label: 'Portfolio Value',
          data,
          borderColor: lineColor,
          backgroundColor: gradientColor,
          tension: 0.4,
          fill: true,
          pointRadius: 0,
          pointHoverRadius: 4,
        },
      ],
    });
  }, [performanceMetrics, activeTimeframe]);
  
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
            return `Value: ${context.raw.toFixed(2)}`;
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
            return value;
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

  if (!transactions.length || !chartData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <h2 className="text-lg font-semibold mb-4">Performance</h2>
        <p className="text-gray-500">No performance data available</p>
      </div>
    );
  }

  const timeframes = [
    { id: 'daily', label: '1D' },
    { id: 'weekly', label: '1W' },
    { id: 'monthly', label: '1M' },
    { id: 'yearly', label: '1Y' },
    { id: 'overall', label: 'ALL' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Performance</h2>
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
      
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-sm text-gray-500">Current Value</p>
          <p className="text-xl font-semibold">
            {(100 + performanceMetrics[activeTimeframe as keyof Performance]).toFixed(2)}
          </p>
        </div>
        <div className={`text-right ${
          performanceMetrics[activeTimeframe as keyof Performance] >= 0 
            ? 'text-bigbull-green' 
            : 'text-bigbull-red'
        }`}>
          <p className="text-sm">Change</p>
          <p className="text-xl font-semibold">
            {performanceMetrics[activeTimeframe as keyof Performance] >= 0 ? '+' : ''}
            {performanceMetrics[activeTimeframe as keyof Performance].toFixed(2)}%
          </p>
        </div>
      </div>
      
      <div className="h-64">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default PerformanceChart; 