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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ttjj.onrender.com';

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

  const formatPhone = (phone: string) => {
    let digits = phone.replace(/\D/g, '');
    if (digits.startsWith('998')) digits = digits.slice(3);
    digits = digits.slice(-9);
    return `+998${digits}`;
  };

  const login = async (phone: string, password: string) => {
    setIsLoading(true);
    try {
      const formattedPhone = formatPhone(phone);
      const resp = await api.post('/users/login', { phone: formattedPhone, password });
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
      phone: formatPhone(data.phone),
      // Убираем role_id, если он равен 3, либо устанавливаем правильный
      role_id: data.role_id && data.role_id !== 3 ? data.role_id : undefined
    };
    
    // Удаляем все undefined поля
    Object.keys(payload).forEach(k => {
      if (payload[k as keyof typeof payload] === undefined) 
        delete payload[k as keyof typeof payload];
    });

    console.log('Регистрационные данные:', payload);

    // Регистрируем
    const response = await api.post('/users/register', payload);
    console.log('Ответ регистрации:', response.data);

    // Авто-логин
    const loginResp = await api.post('/users/login', {
      phone: payload.phone,
      password: payload.password
    });

    const { access_token } = loginResp.data;
    if (!access_token) throw new Error('Токен не получен');

    localStorage.setItem('token', access_token);
    setToken(access_token);

    const userResp = await api.get('/users/me');
    setUser(userResp.data);
    navigate('/');
  } catch (err: any) {
    console.error('Полная ошибка регистрации:', err.response?.data || err);
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
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
