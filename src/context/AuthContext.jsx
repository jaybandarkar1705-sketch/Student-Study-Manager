import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('ss_token'));
  const [loading, setLoading] = useState(true);

  const saveAuth = (tokenValue, userData) => {
    localStorage.setItem('ss_token', tokenValue);
    localStorage.setItem('ss_user', JSON.stringify(userData));
    setToken(tokenValue);
    setUser(userData);
  };

  const clearAuth = useCallback(() => {
    localStorage.removeItem('ss_token');
    localStorage.removeItem('ss_user');
    setToken(null);
    setUser(null);
  }, []);

  // Load user on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('ss_token');
      if (storedToken) {
        try {
          const { data } = await authAPI.getMe();
          setUser(data.user);
          setToken(storedToken);
        } catch {
          clearAuth();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [clearAuth]);

  // Apply theme from user settings
  useEffect(() => {
    if (user?.settings?.theme) {
      document.documentElement.setAttribute('data-theme', user.settings.theme);
    }
  }, [user]);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    saveAuth(data.token, data.user);
    return data;
  };

  const signup = async (formData) => {
    const { data } = await authAPI.signup(formData);
    saveAuth(data.token, data.user);
    return data;
  };

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  const updateUser = (userData) => {
    const updated = { ...user, ...userData };
    setUser(updated);
    localStorage.setItem('ss_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
