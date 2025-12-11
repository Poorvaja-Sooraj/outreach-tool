// frontend/src/context/AuthContext.jsx
import { createContext, useState, useEffect } from 'react';
import api, { setAuthToken } from '../api/client';

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  useEffect(() => {
    // ensure axios header is in sync with token state
    if (token) setAuthToken(token);
    else setAuthToken(null);
  }, [token]);

  const login = (t) => {
    localStorage.setItem('token', t);
    setAuthToken(t);
    setToken(t);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
