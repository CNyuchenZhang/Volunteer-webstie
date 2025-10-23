import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { userAPI } from '../services/api';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'volunteer' | 'organizer' | 'admin';
  phone?: string;
  avatar?: string;
  is_verified: boolean;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 检查本地存储的认证信息
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await userAPI.login({ email, password });
      
      const { user: userData, token: userToken } = response;
      
      setUser(userData);
      setToken(userToken);
      
      // 保存到本地存储
      localStorage.setItem('authToken', userToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    try {
      setLoading(true);
      const response = await userAPI.register(userData);
      
      const { user: newUser, token: userToken } = response;
      
      setUser(newUser);
      setToken(userToken);
      
      // 保存到本地存储
      localStorage.setItem('authToken', userToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      
    } catch (error: any) {
      console.error('Registration error:', error);
      // 直接抛出原始错误，保留 response.data 信息
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    // 调用登出API
    userAPI.logout().catch(console.error);
  };

  const value: AuthContextType = {
    user,
    setUser,
    token,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user && !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
