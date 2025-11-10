'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, AuthContextType, RegisterRequest } from '@/types/auth';
import * as authApi from '@/lib/api/auth';
import { useRouter } from 'next/navigation';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load user and token from localStorage or sessionStorage on mount
  useEffect(() => {
    // Try localStorage first (remember me = true)
    let storedToken = localStorage.getItem('harvestpilot_token');
    let storedUser = localStorage.getItem('harvestpilot_user');

    // If not in localStorage, try sessionStorage (remember me = false)
    if (!storedToken) {
      storedToken = sessionStorage.getItem('harvestpilot_token');
      storedUser = sessionStorage.getItem('harvestpilot_user');
    }

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('harvestpilot_token');
        localStorage.removeItem('harvestpilot_user');
        sessionStorage.removeItem('harvestpilot_token');
        sessionStorage.removeItem('harvestpilot_user');
      }
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      const response = await authApi.login({ email, password });

      // Choose storage based on rememberMe option
      const storage = rememberMe ? localStorage : sessionStorage;

      // Clear the other storage to avoid conflicts
      const otherStorage = rememberMe ? sessionStorage : localStorage;
      otherStorage.removeItem('harvestpilot_token');
      otherStorage.removeItem('harvestpilot_user');

      // Save to chosen storage
      storage.setItem('harvestpilot_token', response.access_token);
      storage.setItem('harvestpilot_user', JSON.stringify(response.user));

      // Update state
      setToken(response.access_token);
      setUser(response.user);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || 'Erro ao fazer login');
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      await authApi.register(data);

      // Auto-login after registration
      await login(data.email, data.password);
    } catch (error: any) {
      console.error('Register error:', error);
      throw new Error(error.response?.data?.message || 'Erro ao criar conta');
    }
  };

  const logout = () => {
    // Clear both storages
    localStorage.removeItem('harvestpilot_token');
    localStorage.removeItem('harvestpilot_user');
    sessionStorage.removeItem('harvestpilot_token');
    sessionStorage.removeItem('harvestpilot_user');

    // Clear state
    setToken(null);
    setUser(null);

    // Redirect to login
    router.push('/login');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);

    // Update in the storage that's currently being used
    if (localStorage.getItem('harvestpilot_token')) {
      localStorage.setItem('harvestpilot_user', JSON.stringify(updatedUser));
    } else if (sessionStorage.getItem('harvestpilot_token')) {
      sessionStorage.setItem('harvestpilot_user', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
