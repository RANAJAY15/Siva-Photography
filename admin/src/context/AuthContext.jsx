import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('admin_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('admin_token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('admin_token');
    }
  }, [token]);

  useEffect(() => {
    const restore = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const res = await axios.get('/api/auth/me');
        const u = res.data.user;
        if (u.role !== 'admin') {
          // Non-admin token found, clear it
          setToken(null);
          setUser(null);
        } else {
          setUser(u);
        }
      } catch {
        setToken(null);
        setUser(null);
      } finally { setLoading(false); }
    };
    restore();
  }, []);

  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password });
    const u = res.data.user;
    if (u.role !== 'admin') {
      throw new Error('ADMIN_ONLY');
    }
    setToken(res.data.token);
    setUser(u);
    return u;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
