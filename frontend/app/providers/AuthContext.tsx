'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '../lib/apiClient';
import type { User } from '../lib/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // On mount, restore session from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (stored) {
        try {
          const me = await authApi.getMe();
          setToken(stored);
          setUser(me);
        } catch {
          // Token invalid or expired — clear it
          localStorage.removeItem('auth_token');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const result = await authApi.login({ email, password });
    localStorage.setItem('auth_token', result.token);
    setToken(result.token);
    setUser(result.user);
    router.push('/dashboard');
  };

  const register = async (email: string, password: string, phone?: string) => {
    const result = await authApi.register({ email, password, phone });
    localStorage.setItem('auth_token', result.token);
    setToken(result.token);
    setUser(result.user);
    router.push('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
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
