import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import api from './api';
import type { User, AuthResponse } from './types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; username: string; password: string; displayName: string }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('zenith_token');
    const savedUser = localStorage.getItem('zenith_user');
    if (savedToken && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsed);
      } catch {
        localStorage.removeItem('zenith_token');
        localStorage.removeItem('zenith_user');
      }
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    localStorage.setItem('zenith_token', data.accessToken);
    localStorage.setItem('zenith_user', JSON.stringify(data.user));
    setToken(data.accessToken);
    setUser(data.user);
  }, []);

  const register = useCallback(async (regData: { email: string; username: string; password: string; displayName: string }) => {
    const { data } = await api.post<AuthResponse>('/auth/register', regData);
    localStorage.setItem('zenith_token', data.accessToken);
    localStorage.setItem('zenith_user', JSON.stringify(data.user));
    setToken(data.accessToken);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('zenith_token');
    localStorage.removeItem('zenith_user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
