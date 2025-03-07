import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, userAPI } from '../api/api';

interface User {
  id: number;
  name: string;
  email: string;
  balance: number;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, panNumber?: string, phone?: string) => Promise<void>;
  logout: (callback?: () => void) => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          const response = await userAPI.getProfile();
          setUser(response.data);
        } catch (err) {
          console.error('Failed to get user profile:', err);
          localStorage.removeItem('token');
        }
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.login(email, password);
      localStorage.setItem('token', response.data.access_token);
      
      // Get user profile after successful login
      const userResponse = await userAPI.getProfile();
      setUser(userResponse.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to login');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, panNumber?: string, phone?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await authAPI.register(name, email, password, panNumber, phone);
      // After registration, log the user in
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to register');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = (callback?: () => void) => {
    localStorage.removeItem('token');
    setUser(null);
    
    // If a callback function is provided, call it after logout
    if (callback) {
      callback();
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}; 