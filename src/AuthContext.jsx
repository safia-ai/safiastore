import { createContext, useState } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedEmail === 'admin@dzshop.dz' && password === '123456') {
      setUser({ nom: 'Admin', email: normalizedEmail, role: 'admin' });
      return { success: true };
    }

    if (normalizedEmail && password.length >= 6) {
      setUser({ nom: normalizedEmail.split('@')[0], email: normalizedEmail, role: 'client' });
      return { success: true };
    }

    return { success: false, message: 'Email ou mot de passe incorrect.' };
  };

  const register = (nom, email) => {
    const newUser = { nom: nom.trim(), email: email.trim().toLowerCase(), role: 'client' };
    setUser(newUser);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}