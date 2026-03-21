import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export interface User {
  n_dorm: number;
  id: number;
  name: string;
  surname: string;
  phone: string;
  email?: string;
  user_group?: string;
  n_room?: number;
  floor?: number;
  role: string;
  is_active: boolean;
}

interface RegisterData {
  name: string;
  surname: string;
  phone: string;
  password: string;
  email?: string;
  user_group?: string;
  n_room?: number;
  floor?: number;
  role_id?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (phone: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  fetchUsers: () => Promise<User[]>;
  approveUser: (userId: number) => Promise<void>;
  rejectUser: (userId: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://ttjj.onrender.com').replace(/\/+$/, '');

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  
  timeout: 10000,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers!['Authorization'] = `Bearer ${token}`;
  return config;
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        try {
          const resp = await api.get('/users/me');
          setUser(resp.data);
        } catch {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);



  const login = async (phone: string, password: string) => {
    setIsLoading(true);
    try {
      const resp = await api.post('/users/login', { phone, password });
      const { access_token } = resp.data;
      if (!access_token) throw new Error('Токен не получен');

      localStorage.setItem('token', access_token);
      setToken(access_token);

      const userResp = await api.get('/users/me');
      setUser(userResp.data);
      navigate('/');
    } catch (err: any) {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
const register = async (data: RegisterData) => {
  setIsLoading(true);
  try {
    const payload = { 
      ...data, 
      phone: data.phone,
      role_id: data.role_id && data.role_id !== 3 ? data.role_id : undefined
    };
    
    Object.keys(payload).forEach(k => {
      if (payload[k as keyof typeof payload] === undefined) 
        delete payload[k as keyof typeof payload];
    });

    console.log('Регистрационные данные:', payload);
    const response = await api.post('/users/register', payload);
    console.log('Ответ регистрации:', response.data);
    
    // Auto-login removed as user is inactive by default
  } catch (err: any) {
    console.error('Полная ошибка регистрации:', err.response?.data || err);
    throw err;
  } finally {
    setIsLoading(false);
  }
};

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/');
  };

  const fetchUsers = async (): Promise<User[]> => {
    const resp = await api.get('/users/commandant/students');
    return resp.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        fetchUsers,
        approveUser: (userId: number) => api.post(`/users/commandant/${userId}/approve`),
        rejectUser: (userId: number) => api.delete(`/users/commandant/${userId}/reject`),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must быть внутри AuthProvider');
  return context;
};

export const authApi = api;
