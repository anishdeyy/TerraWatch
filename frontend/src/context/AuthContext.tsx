import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, SubscriptionTier } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
  isAnalyst: boolean;
  isProfessional: boolean;
  isEnterprise: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('terrawatch_user') || localStorage.getItem('darukaa_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('terrawatch_token') || localStorage.getItem('darukaa_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const verifyAuth = async () => {
      if (token) {
        try {
          const freshUser = await authService.getMe();
          setUser(freshUser);
          localStorage.setItem('terrawatch_user', JSON.stringify(freshUser));
        } catch (err) {
          // Token invalid
          setUser(null);
          setToken(null);
          localStorage.removeItem('terrawatch_token');
          localStorage.removeItem('terrawatch_user');
          localStorage.removeItem('darukaa_token');
          localStorage.removeItem('darukaa_user');
        }
      }
      setIsLoading(false);
    };

    verifyAuth();
  }, [token]);

  const login = async (email: string, password: string) => {
    const data = await authService.login(email, password);
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('terrawatch_token', data.access_token);
    localStorage.setItem('terrawatch_user', JSON.stringify(data.user));
  };

  const register = async (name: string, email: string, password: string, role: string = 'VIEWER') => {
    const data = await authService.register(name, email, password, role);
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('terrawatch_token', data.access_token);
    localStorage.setItem('terrawatch_user', JSON.stringify(data.user));
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const freshUser = await authService.getMe();
      setUser(freshUser);
      localStorage.setItem('terrawatch_user', JSON.stringify(freshUser));
    } catch (err) {
      console.error("Failed to refresh user:", err);
    }
  };

  const isAdmin = user?.role === 'ADMIN';
  const isAnalyst = user?.role === 'ANALYST' || isAdmin;
  const isProfessional = user?.subscription_tier === 'PROFESSIONAL' || user?.subscription_tier === 'ENTERPRISE' || isAdmin;
  const isEnterprise = user?.subscription_tier === 'ENTERPRISE' || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        isAdmin,
        isAnalyst,
        isProfessional,
        isEnterprise,
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
