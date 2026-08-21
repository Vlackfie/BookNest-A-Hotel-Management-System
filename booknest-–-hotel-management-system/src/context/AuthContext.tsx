import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, RoleName } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  switchRole: (role: RoleName) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    const saved = localStorage.getItem('booknest_token');
    return saved && saved !== 'null' && saved !== 'undefined' && saved.trim() !== '' ? saved : null;
  });
  const [loading, setLoading] = useState<boolean>(true);

  const logout = () => {
    localStorage.removeItem('booknest_token');
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    async function loadUser() {
      if (!token || token === 'null' || token === 'undefined' || !token.trim()) {
        logout();
        setLoading(false);
        return;
      }
      try {
        const res = await api.getMe();
        if (res && res.user) {
          setUser(res.user);
        } else {
          logout();
        }
      } catch (err: any) {
        console.warn("Session restored check failed:", err?.message || err);
        logout();
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [token]);

  const login = async (username: string, password: string) => {
    const res = await api.login({ username, password });
    localStorage.setItem('booknest_token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const switchRole = async (roleName: RoleName) => {
    const res = await api.switchRole(roleName);
    localStorage.setItem('booknest_token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, switchRole, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};



