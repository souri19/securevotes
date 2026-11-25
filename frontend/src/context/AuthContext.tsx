import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiRequest, setCsrfToken } from '../services/api';
import type { AuthSessionResponse, User } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<User>;
  register: (name: string, email: string, voterId: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await apiRequest<AuthSessionResponse>('/auth/me');
      setUser(res.user);
      setCsrfToken(res.csrf_token);
    } catch {
      setUser(null);
      setCsrfToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (identifier: string, password: string): Promise<User> => {
    const res = await apiRequest<AuthSessionResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
    setUser(res.user);
    setCsrfToken(res.csrf_token);
    return res.user;
  }, []);

  const register = useCallback(
    async (name: string, email: string, voterId: string, password: string): Promise<User> => {
      const res = await apiRequest<AuthSessionResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, voter_id: voterId, password }),
      });
      setUser(res.user);
      setCsrfToken(res.csrf_token);
      return res.user;
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
      setCsrfToken(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
