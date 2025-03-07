import axios from 'axios';

// Create an axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Authentication API
export const authAPI = {
  login: (email: string, password: string) => 
    api.post('/token', new URLSearchParams({
      'username': email,
      'password': password,
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }),
  
  register: (name: string, email: string, password: string, panNumber?: string, phone?: string) => 
    api.post('/register', { name, email, password, pan_number: panNumber, phone }),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data: any) => api.put('/users/me', data),
  addFunds: (amount: number) => api.post('/users/funds', { amount }),
};

// Trading API
export const tradingAPI = {
  getStocks: () => api.get('/trading/stocks'),
  getStock: (id: number) => api.get(`/trading/stocks/${id}`),
  addStock: (data: any) => api.post('/trading/stocks', data),
  
  getPortfolio: () => api.get('/trading/portfolio'),
  getHoldings: () => api.get('/trading/holdings'),
  getTransactions: () => api.get('/trading/transactions'),
  
  buyStock: (stockId: number, quantity: number, price: number) => 
    api.post('/trading/buy', {
      stock_id: stockId,
      transaction_type: 'BUY',
      quantity,
      price
    }),
  
  sellStock: (stockId: number, quantity: number, price: number) => 
    api.post('/trading/sell', {
      stock_id: stockId,
      transaction_type: 'SELL',
      quantity,
      price
    }),
};

export default api; 