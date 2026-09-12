import { createContext, useState } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('dzshop_user'));
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('dzshop_token'));

  const saveSession = (session) => {
    setUser(session.user);
    setToken(session.token);
    localStorage.setItem('dzshop_user', JSON.stringify(session.user));
    localStorage.setItem('dzshop_token', session.token);
  };

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const result = await response.json();
      if (!response.ok) return { success: false, message: result.message };
      saveSession(result);
      return { success: true };
    } catch {
      return { success: false, message: 'Impossible de contacter le serveur.' };
    }
  };

  const register = async (nom, email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom, email, password })
      });
      const result = await response.json();
      if (!response.ok) return { success: false, message: result.message };
      saveSession(result);
      return { success: true };
    } catch {
      return { success: false, message: 'Impossible de contacter le serveur.' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('dzshop_user');
    localStorage.removeItem('dzshop_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}