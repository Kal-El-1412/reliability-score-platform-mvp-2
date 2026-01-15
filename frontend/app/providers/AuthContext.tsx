'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
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

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setToken(session.access_token);
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          phone: session.user.user_metadata?.phone,
          createdAt: session.user.created_at,
        });
      }
      setIsLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setToken(session.access_token);
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          phone: session.user.user_metadata?.phone,
          createdAt: session.user.created_at,
        });
      } else {
        setToken(null);
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('[Auth] Login failed:', error);
        throw new Error(error.message || 'Login failed. Please check your credentials.');
      }

      if (data.session) {
        setToken(data.session.access_token);
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          phone: data.user.user_metadata?.phone,
          createdAt: data.user.created_at,
        });
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('[Auth] Login error:', error);
      if (error.message?.includes('fetch')) {
        throw new Error('Network error: could not reach authentication service. Check if the backend is running and your environment variables are correct.');
      }
      throw error;
    }
  };

  const register = async (email: string, password: string, phone?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            phone: phone || null,
          },
        },
      });

      if (error) {
        console.error('[Auth] Registration failed:', error);
        throw new Error(error.message || 'Registration failed. Please try again.');
      }

      if (data.user) {
        if (data.session) {
          setToken(data.session.access_token);
          setUser({
            id: data.user.id,
            email: data.user.email || '',
            phone: data.user.user_metadata?.phone,
            createdAt: data.user.created_at,
          });
          console.log('[Auth] Registration successful, user logged in');
          router.push('/dashboard');
        } else {
          console.log('[Auth] Registration successful, email verification required');
          throw new Error('VERIFICATION_REQUIRED');
        }
      }
    } catch (error: any) {
      console.error('[Auth] Registration error:', error);
      if (error.message?.includes('fetch')) {
        throw new Error('Network error: could not reach authentication service. Check if the backend is running and your environment variables are correct.');
      }
      throw error;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
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
