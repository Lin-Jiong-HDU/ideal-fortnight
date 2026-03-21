'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../api';
import { parseJWT, safeGetItem, safeSetItem, safeRemoveItem, isValidUser } from '../utils';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化：从 localStorage 读取 token
  useEffect(() => {
    const storedToken = safeGetItem<string>('accessToken');
    const storedUser = safeGetItem<User>('user', isValidUser);

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password);

    // 从 JWT 解析用户角色
    const payload = parseJWT(response.accessToken);

    const user: User = {
      id: payload?.sub || email, // 使用 sub 或 email 作为 id
      email,
      name: email.split('@')[0],
      role: (payload?.role as User['role']) || 'customer',
      createdAt: new Date().toISOString(),
    };

    // 安全存储
    safeSetItem('accessToken', response.accessToken);
    safeSetItem('refreshToken', response.refreshToken);
    safeSetItem('user', user);

    setToken(response.accessToken);
    setUser(user);
  };

  const logout = () => {
    safeRemoveItem('accessToken');
    safeRemoveItem('refreshToken');
    safeRemoveItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
