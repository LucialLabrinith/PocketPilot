import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  devOtp: string | null;
  setDevOtp: (otp: string | null) => void;
  pendingEmail: string | null;
  setPendingEmail: (email: string | null) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  login: (email: string, password: string, clientType?: string) => Promise<any>;
  googleLogin: (payload: { credential?: string; email?: string; fullName?: string; googleId?: string; clientType?: string }) => Promise<any>;
  register: (email: string, password: string, fullName: string, currency: string) => Promise<any>;
  verifyOtp: (email: string, otpCode: string, purpose?: string) => Promise<any>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('pocketpilot_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('pocketpilot_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('pocketpilot_theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      if (body) {
        body.classList.add('dark');
        body.setAttribute('data-theme', 'dark');
      }
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      if (body) {
        body.classList.remove('dark');
        body.setAttribute('data-theme', 'light');
      }
    }
    localStorage.setItem('pocketpilot_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    async function initAuth() {
      const storedToken = localStorage.getItem('pocketpilot_token');
      if (storedToken) {
        try {
          const res = await api.getMe();
          if (res.data) {
            setUser(res.data);
            localStorage.setItem('pocketpilot_user', JSON.stringify(res.data));
          }
        } catch {
          // Token invalid or expired
          localStorage.removeItem('pocketpilot_token');
          localStorage.removeItem('pocketpilot_user');
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    }
    initAuth();
  }, []);

  const register = async (email: string, password: string, fullName: string, currency: string) => {
    const res = await api.register({ email, password, fullName, currency });
    if (res.devOtp) {
      setDevOtp(res.devOtp);
    }
    setPendingEmail(email);
    return res;
  };

  const verifyOtp = async (email: string, otpCode: string, purpose = 'REGISTRATION') => {
    const res = await api.verifyOtp({ email, otpCode, purpose });
    if (res.data?.token) {
      localStorage.setItem('pocketpilot_token', res.data.token);
      localStorage.setItem('pocketpilot_user', JSON.stringify(res.data));
      setToken(res.data.token);
      setUser(res.data);
      setDevOtp(null);
      setPendingEmail(null);
    }
    return res;
  };

  const login = async (email: string, password: string, clientType = 'WEB') => {
    const res = await api.login({ email, password, clientType });
    if (res.data?.token) {
      localStorage.setItem('pocketpilot_token', res.data.token);
      localStorage.setItem('pocketpilot_user', JSON.stringify(res.data));
      setToken(res.data.token);
      setUser(res.data);
      setDevOtp(null);
      setPendingEmail(null);
    } else if (res.devOtp) {
      setDevOtp(res.devOtp);
      setPendingEmail(email);
    }
    return res;
  };

  const googleLogin = async (payload: { credential?: string; email?: string; fullName?: string; googleId?: string; clientType?: string }) => {
    const res = await api.googleLogin(payload);
    if (res.data?.token) {
      localStorage.setItem('pocketpilot_token', res.data.token);
      localStorage.setItem('pocketpilot_user', JSON.stringify(res.data));
      setToken(res.data.token);
      setUser(res.data);
      setDevOtp(null);
      setPendingEmail(null);
    }
    return res;
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('pocketpilot_token');
      localStorage.removeItem('pocketpilot_user');
      setUser(null);
      setToken(null);
      setDevOtp(null);
      setPendingEmail(null);
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.getMe();
      if (res.data) {
        setUser(res.data);
        localStorage.setItem('pocketpilot_user', JSON.stringify(res.data));
      }
    } catch {
      // Ignored
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        devOtp,
        setDevOtp,
        pendingEmail,
        setPendingEmail,
        theme,
        toggleTheme,
        login,
        googleLogin,
        register,
        verifyOtp,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
