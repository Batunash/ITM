import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosInstance';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  // Re-fetch permissions whenever the token changes (login / page refresh).
  // This ensures that role-permission changes by an admin take effect on next login.
  useEffect(() => {
    if (!user?.token) return;
    api.get('/auth/permissions')
      .then(r => {
        const permissions = Array.isArray(r.data) ? r.data : [];
        setUser(prev => {
          if (!prev) return prev;
          const updated = { ...prev, permissions };
          localStorage.setItem('user', JSON.stringify(updated));
          return updated;
        });
      })
      .catch(() => {});
  }, [user?.token]);

  const login = (userData) => {
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
