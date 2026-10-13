import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      const stored = localStorage.getItem("auth");
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      
      // Recalculate trial status from stored data
      if (parsed.trialEndsAt) {
        const now = new Date();
        const trialEnd = new Date(parsed.trialEndsAt);
        if (now < trialEnd) {
          parsed.trialActive = true;
          parsed.trialDaysLeft = Math.ceil((trialEnd - now) / 86400000);
        } else {
          parsed.trialActive = false;
          parsed.trialDaysLeft = 0;
        }
      }
      
      return parsed;
    } catch { return null; }
  });

  const login = (data) => {
    localStorage.setItem("auth", JSON.stringify(data));
    setAuth(data);
  };

  const logout = () => {
    localStorage.removeItem("auth");
    setAuth(null);
  };

  const updateAuth = (updates) => {
    setAuth(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem("auth", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, updateAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }
